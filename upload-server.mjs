import { createServer } from "node:http";
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { createReadStream } from "node:fs";
import { extname, join, normalize } from "node:path";
import { randomUUID } from "node:crypto";
import { networkInterfaces } from "node:os";

const PORT = Number(process.env.UPLOAD_PORT || 3001);
const ROOT = process.cwd();
const DATA_DIR = join(ROOT, "local-data");
const UPLOAD_DIR = join(DATA_DIR, "uploads");
const DB_FILE = join(DATA_DIR, "uploads.json");

const jsonHeaders = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

await mkdir(UPLOAD_DIR, { recursive: true });

function getLanIp() {
  const interfaces = networkInterfaces();
  for (const entries of Object.values(interfaces)) {
    for (const entry of entries || []) {
      if (entry.family === "IPv4" && !entry.internal) return entry.address;
    }
  }
  return "localhost";
}

function parseToken(token) {
  if (!token) return null;
  if (token.startsWith("konsil-")) {
    const id = token.slice("konsil-".length);
    if (/^K-\d{4}-\d{4}$/.test(id)) return { type: "konsil", id };
  }
  if (token.startsWith("sess-")) {
    const id = token.slice("sess-".length);
    if (/^[a-z0-9]{4,}$/.test(id)) return { type: "session", id: token };
  }
  return null;
}

async function loadDb() {
  try {
    return JSON.parse(await readFile(DB_FILE, "utf8"));
  } catch {
    return { uploads: [] };
  }
}

async function saveDb(db) {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(DB_FILE, JSON.stringify(db, null, 2), "utf8");
}

function sendJson(res, status, payload) {
  res.writeHead(status, jsonHeaders);
  res.end(JSON.stringify(payload));
}

function getBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

function parseMultipart(buffer, contentType) {
  const boundary = contentType.match(/boundary=([^;]+)/)?.[1];
  if (!boundary) return [];
  const marker = Buffer.from(`--${boundary}`);
  const parts = [];
  let start = buffer.indexOf(marker);
  while (start !== -1) {
    start += marker.length;
    if (buffer[start] === 0x2d && buffer[start + 1] === 0x2d) break;
    if (buffer[start] === 0x0d && buffer[start + 1] === 0x0a) start += 2;
    const headerEnd = buffer.indexOf(Buffer.from("\r\n\r\n"), start);
    if (headerEnd === -1) break;
    const headers = buffer.slice(start, headerEnd).toString("utf8");
    const next = buffer.indexOf(marker, headerEnd + 4);
    if (next === -1) break;
    let body = buffer.slice(headerEnd + 4, next);
    if (body.at(-2) === 0x0d && body.at(-1) === 0x0a) body = body.slice(0, -2);
    const name = headers.match(/name="([^"]+)"/)?.[1];
    const filename = headers.match(/filename="([^"]*)"/)?.[1];
    const type = headers.match(/Content-Type:\s*([^\r\n]+)/i)?.[1];
    if (name) parts.push({ name, filename, type, body });
    start = next;
  }
  return parts;
}

function mimeFor(file) {
  const ext = extname(file).toLowerCase();
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".png") return "image/png";
  if (ext === ".gif") return "image/gif";
  if (ext === ".webp") return "image/webp";
  return "application/octet-stream";
}

createServer(async (req, res) => {
  try {
    if (req.method === "OPTIONS") {
      res.writeHead(204, jsonHeaders);
      res.end();
      return;
    }

    const url = new URL(req.url || "/", `http://${req.headers.host}`);

    if (req.method === "GET" && url.pathname === "/api/network-info") {
      const lanIp = getLanIp();
      return sendJson(res, 200, {
        lanIp,
        appOrigin: `http://${lanIp}:5173`,
        apiBase: `http://${lanIp}:${PORT}`,
      });
    }

    if (req.method === "GET" && url.pathname.startsWith("/uploads/")) {
      const file = normalize(join(DATA_DIR, url.pathname));
      if (!file.startsWith(UPLOAD_DIR)) return sendJson(res, 403, { error: "Forbidden" });
      await stat(file);
      res.writeHead(200, { "Content-Type": mimeFor(file), "Access-Control-Allow-Origin": "*" });
      createReadStream(file).pipe(res);
      return;
    }

    const targetMatch = url.pathname.match(/^\/api\/konsil-upload\/([^/]+)$/);
    if (req.method === "GET" && targetMatch) {
      const token = decodeURIComponent(targetMatch[1]);
      const parsed = parseToken(token);
      if (!parsed) return sendJson(res, 404, { error: "Ungueltiger Upload-Link." });
      const konsilId = parsed.type === "konsil" ? parsed.id : "SESSION";
      return sendJson(res, 200, { token, konsilId });
    }

    if (req.method === "POST" && targetMatch) {
      const token = decodeURIComponent(targetMatch[1]);
      const parsed = parseToken(token);
      if (!parsed) return sendJson(res, 404, { error: "Ungueltiger Upload-Link." });

      const parts = parseMultipart(await getBody(req), req.headers["content-type"] || "");
      const source = parts.find((p) => p.name === "source")?.body.toString("utf8") || "unknown";
      const note = parts.find((p) => p.name === "note")?.body.toString("utf8").trim() || undefined;
      const files = parts.filter((p) => p.name === "images" && p.filename);
      if (files.length === 0) return sendJson(res, 400, { error: "Bitte mindestens ein Bild hochladen." });

      const now = new Date().toISOString();
      const images = [];
      for (const file of files) {
        const safeExt = extname(file.filename).toLowerCase() || ".jpg";
        const stored = `${Date.now()}-${randomUUID()}${safeExt}`;
        await writeFile(join(UPLOAD_DIR, stored), file.body);
        images.push({
          id: `img_${randomUUID().slice(0, 8)}`,
          filename: file.filename,
          source: "mobile",
          url: `/uploads/${stored}`,
          uploadedAt: now,
        });
      }

      const konsilId = parsed.id;
      const entry = {
        id: `up_${randomUUID().slice(0, 8)}`,
        konsilId,
        source: source === "hausarzt" || source === "patient" ? source : "unknown",
        submittedAt: now,
        note,
        images,
        reviewedByHausarzt: source === "hausarzt",
      };
      const db = await loadDb();
      db.uploads = [entry, ...(db.uploads || [])];
      await saveDb(db);
      return sendJson(res, 201, entry);
    }

    const listMatch = url.pathname.match(/^\/api\/konsile\/([^/]+)\/uploads$/);
    if (req.method === "GET" && listMatch) {
      const konsilId = decodeURIComponent(listMatch[1]);
      const db = await loadDb();
      return sendJson(res, 200, (db.uploads || []).filter((upload) => upload.konsilId === konsilId));
    }

    const reviewedMatch = url.pathname.match(/^\/api\/konsile\/([^/]+)\/uploads\/reviewed$/);
    if (req.method === "POST" && reviewedMatch) {
      const konsilId = decodeURIComponent(reviewedMatch[1]);
      const db = await loadDb();
      db.uploads = (db.uploads || []).map((upload) =>
        upload.konsilId === konsilId ? { ...upload, reviewedByHausarzt: true } : upload
      );
      await saveDb(db);
      return sendJson(res, 200, db.uploads.filter((upload) => upload.konsilId === konsilId));
    }

    const sessionPollMatch = url.pathname.match(/^\/api\/session-upload\/([^/]+)$/);
    if (req.method === "GET" && sessionPollMatch) {
      const sessionToken = decodeURIComponent(sessionPollMatch[1]);
      const db = await loadDb();
      const allImages = (db.uploads || [])
        .filter((u) => u.konsilId === sessionToken)
        .flatMap((u) => u.images);
      return sendJson(res, 200, allImages);
    }

    sendJson(res, 404, { error: "Not found" });
  } catch (error) {
    sendJson(res, 500, { error: error instanceof Error ? error.message : "Server error" });
  }
}).listen(PORT, "0.0.0.0", () => {
  console.log(`Konsil upload backend running on http://0.0.0.0:${PORT}`);
});

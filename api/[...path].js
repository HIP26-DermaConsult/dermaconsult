import { put, list } from "@vercel/blob";
import { randomUUID } from "crypto";
import Busboy from "busboy";
import { generateAiAssessment } from "../ai-assessment.mjs";

export const config = { api: { bodyParser: false } };

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
    const { blobs } = await list({ prefix: "db/uploads.json" });
    if (!blobs.length) return { uploads: [] };
    const res = await fetch(blobs[0].url, { cache: "no-store" });
    return await res.json();
  } catch {
    return { uploads: [] };
  }
}

async function saveDb(db) {
  await put("db/uploads.json", JSON.stringify(db), {
    access: "public",
    allowOverwrite: true,
    contentType: "application/json",
  });
}

function cors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

function sendJson(res, status, payload) {
  cors(res);
  res.setHeader("Content-Type", "application/json");
  res.status(status).end(JSON.stringify(payload));
}

function parseMultipart(req) {
  return new Promise((resolve, reject) => {
    const fields = {};
    const files = [];
    const bb = Busboy({ headers: req.headers });
    bb.on("field", (name, value) => {
      fields[name] = value;
    });
    bb.on("file", (name, stream, info) => {
      const { filename, mimeType } = info;
      const chunks = [];
      stream.on("data", (chunk) => chunks.push(chunk));
      stream.on("end", () => {
        files.push({ name, filename, mimeType, buffer: Buffer.concat(chunks) });
      });
    });
    bb.on("close", () => resolve({ fields, files }));
    bb.on("error", reject);
    req.pipe(bb);
  });
}

export default async function handler(req, res) {
  cors(res);

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  const segments = Array.isArray(req.query.path) ? req.query.path : [req.query.path].filter(Boolean);
  const path = "/" + segments.join("/");

  try {
    // GET /api/network-info
    if (req.method === "GET" && path === "/network-info") {
      const host = req.headers.host || "";
      const proto = host.startsWith("localhost") ? "http" : "https";
      const origin = `${proto}://${host}`;
      return sendJson(res, 200, { lanIp: host, appOrigin: origin, apiBase: origin });
    }

    // GET|POST /api/konsil-upload/:token
    const targetMatch = path.match(/^\/konsil-upload\/(.+)$/);
    if (targetMatch) {
      const token = decodeURIComponent(targetMatch[1]);
      const parsed = parseToken(token);
      if (!parsed) return sendJson(res, 404, { error: "Ungueltiger Upload-Link." });

      if (req.method === "GET") {
        const konsilId = parsed.type === "konsil" ? parsed.id : "SESSION";
        return sendJson(res, 200, { token, konsilId });
      }

      if (req.method === "POST") {
        const { fields, files } = await parseMultipart(req);
        const imageFiles = files.filter((f) => f.name === "images" && f.filename);
        if (!imageFiles.length) return sendJson(res, 400, { error: "Bitte mindestens ein Bild hochladen." });

        const source = fields.source || "unknown";
        const note = fields.note?.trim() || undefined;
        const now = new Date().toISOString();

        const images = [];
        for (const file of imageFiles) {
          const ext = (file.filename.split(".").pop() || "jpg").toLowerCase();
          const blobName = `uploads/${Date.now()}-${randomUUID()}.${ext}`;
          const blob = await put(blobName, file.buffer, {
            access: "public",
            contentType: file.mimeType || "image/jpeg",
          });
          images.push({
            id: `img_${randomUUID().slice(0, 8)}`,
            filename: file.filename,
            source: "mobile",
            url: blob.url,
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
    }

    // GET /api/konsile/:konsilId/uploads
    const listMatch = path.match(/^\/konsile\/([^/]+)\/uploads$/);
    if (req.method === "GET" && listMatch) {
      const konsilId = decodeURIComponent(listMatch[1]);
      const db = await loadDb();
      return sendJson(res, 200, (db.uploads || []).filter((u) => u.konsilId === konsilId));
    }

    // POST /api/konsile/:konsilId/uploads/reviewed
    const reviewedMatch = path.match(/^\/konsile\/([^/]+)\/uploads\/reviewed$/);
    if (req.method === "POST" && reviewedMatch) {
      const konsilId = decodeURIComponent(reviewedMatch[1]);
      const db = await loadDb();
      db.uploads = (db.uploads || []).map((u) =>
        u.konsilId === konsilId ? { ...u, reviewedByHausarzt: true } : u
      );
      await saveDb(db);
      return sendJson(res, 200, db.uploads.filter((u) => u.konsilId === konsilId));
    }

    // POST /api/konsile/:konsilId/ai-assessment
    const aiAssessmentMatch = path.match(/^\/konsile\/([^/]+)\/ai-assessment$/);
    if (req.method === "POST" && aiAssessmentMatch) {
      const chunks = [];
      for await (const chunk of req) chunks.push(chunk);
      const body = JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
      const result = await generateAiAssessment(body.konsil, body.patient);
      return sendJson(res, 200, result);
    }

    // GET /api/session-upload/:sessionToken
    const sessionMatch = path.match(/^\/session-upload\/(.+)$/);
    if (req.method === "GET" && sessionMatch) {
      const sessionToken = decodeURIComponent(sessionMatch[1]);
      const db = await loadDb();
      const allImages = (db.uploads || [])
        .filter((u) => u.konsilId === sessionToken)
        .flatMap((u) => u.images);
      return sendJson(res, 200, allImages);
    }

    return sendJson(res, 404, { error: "Not found" });
  } catch (err) {
    return sendJson(res, 500, { error: err instanceof Error ? err.message : "Server error" });
  }
}

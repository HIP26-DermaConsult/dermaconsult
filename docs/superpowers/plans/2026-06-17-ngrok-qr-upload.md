# ngrok QR Upload Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the konsil QR code scannable via ngrok so an iPhone can open the upload page, take photos, and have them appear in the konsil — both for existing konsils (KonsilDetailPage) and the new-konsil wizard (MobileCaptureQrModal).

**Architecture:** Add a Vite dev-server proxy so all `/api` and `/uploads` traffic is forwarded to `upload-server.mjs` on port 3001 — this lets iPhone requests through ngrok reach the backend without port 3001 being tunneled. The backend gains session-token support (`sess-{random}`) so the wizard's QR can receive uploads before a konsil exists. The modal polls every 2 s for session uploads; when images arrive they flow into the wizard's image list.

**Tech Stack:** Vite (proxy), Node.js HTTP server (`upload-server.mjs`), React, TypeScript. No new npm packages.

---

### Task 1: Vite proxy + relative API_BASE

**Files:**
- Modify: `vite.config.ts`
- Modify: `src/services/konsilUploadService.ts`

- [ ] **Step 1: Add proxy to vite.config.ts**

Replace the `server` block:

```ts
// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    open: true,
    allowedHosts: [".ngrok-free.dev"],
    proxy: {
      "/api": "http://localhost:3001",
      "/uploads": "http://localhost:3001",
    },
  },
});
```

- [ ] **Step 2: Change API_BASE to relative path**

In `src/services/konsilUploadService.ts`, replace the top `API_BASE` constant (lines 3–5):

```ts
const API_BASE = import.meta.env.VITE_UPLOAD_API_BASE ?? "";
```

The rest of the file stays the same. With an empty `API_BASE`, `fetch("/api/konsil-upload/...")` and `fetch("/uploads/...")` are relative to the current origin — Vite proxies them to `localhost:3001`.

- [ ] **Step 3: Verify locally**

Start both servers:
```
npm run backend   # terminal 1
npm run dev       # terminal 2
```

Open `http://localhost:5173` → navigate to any konsil detail page → the "Konsil-Upload QR" card should load without errors and the QR `<img>` should display. Open browser devtools Network tab — requests to `/api/network-info` should return 200.

- [ ] **Step 4: Commit**

```bash
git add vite.config.ts src/services/konsilUploadService.ts
git commit -m "feat: proxy /api and /uploads through vite dev server"
```

---

### Task 2: Session token support in upload-server.mjs

**Files:**
- Modify: `upload-server.mjs`

The backend currently only accepts tokens of the form `konsil-K-XXXX-XXXX`. Session tokens (`sess-{random}`) need to be accepted and stored, and a new poll endpoint is needed.

- [ ] **Step 1: Replace konsilIdFromToken with parseToken**

Replace the existing `konsilIdFromToken` function (around line 33):

```js
function parseToken(token) {
  if (!token) return null;
  if (token.startsWith("konsil-")) {
    const id = token.slice("konsil-".length);
    if (/^K-\d{4}-\d{4}$/.test(id)) return { type: "konsil", id };
  }
  if (token.startsWith("sess-")) {
    const id = token.slice("sess-".length);
    if (id.length > 0) return { type: "session", id: token };
  }
  return null;
}
```

Note: for session tokens `id` is the full token string (e.g., `"sess-abc123"`) — it is used directly as `konsilId` in stored uploads so the poll endpoint can filter on it.

- [ ] **Step 2: Update GET /api/konsil-upload/:token handler**

Find the block starting with `if (req.method === "GET" && targetMatch)` (around line 130) and replace it:

```js
if (req.method === "GET" && targetMatch) {
  const token = decodeURIComponent(targetMatch[1]);
  const parsed = parseToken(token);
  if (!parsed) return sendJson(res, 404, { error: "Ungueltiger Upload-Link." });
  const konsilId = parsed.type === "konsil" ? parsed.id : "SESSION";
  return sendJson(res, 200, { token, konsilId });
}
```

- [ ] **Step 3: Update POST /api/konsil-upload/:token handler**

Find the block starting with `if (req.method === "POST" && targetMatch)` (around line 137) and replace it:

```js
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
    reviewedByHausarzt: source !== "patient",
  };
  const db = await loadDb();
  db.uploads = [entry, ...(db.uploads || [])];
  await saveDb(db);
  return sendJson(res, 201, entry);
}
```

- [ ] **Step 4: Add GET /api/session-upload/:token poll endpoint**

Add this new route handler just before the final `sendJson(res, 404, ...)` line at the bottom of the request handler:

```js
const sessionPollMatch = url.pathname.match(/^\/api\/session-upload\/([^/]+)$/);
if (req.method === "GET" && sessionPollMatch) {
  const sessionToken = decodeURIComponent(sessionPollMatch[1]);
  const db = await loadDb();
  const allImages = (db.uploads || [])
    .filter((u) => u.konsilId === sessionToken)
    .flatMap((u) => u.images);
  return sendJson(res, 200, allImages);
}
```

- [ ] **Step 5: Verify backend handles session tokens**

Restart the backend (`npm run backend`), then in a new terminal:

```bash
# Create a session upload (simulated)
curl -s http://localhost:3001/api/konsil-upload/sess-test123
# Expected: {"token":"sess-test123","konsilId":"SESSION"}

# Poll session (empty at first)
curl -s http://localhost:3001/api/session-upload/sess-test123
# Expected: []
```

- [ ] **Step 6: Commit**

```bash
git add upload-server.mjs
git commit -m "feat: add session token support and poll endpoint to upload server"
```

---

### Task 3: PatientUploadPage — handle SESSION konsilId

**Files:**
- Modify: `src/pages/portal/PatientUploadPage.tsx`

When the page is reached via a session QR, `konsilId` will be `"SESSION"`. The `CardHeader` currently shows `Ziel: SESSION` and a source badge. Replace those with neutral copy.

- [ ] **Step 1: Update CardHeader in the ready state**

In `PatientUploadPage.tsx`, find the `CardHeader` inside the `state.status === "ready" && !done` block (around line 125) and replace it:

```tsx
<CardHeader
  title={
    <span className="flex items-center gap-2">
      <UploadCloud className="w-4 h-4 text-violet-600" /> Bilder zum Konsil hochladen
    </span>
  }
  description={
    state.konsilId === "SESSION"
      ? "Smartphone-Upload"
      : `Ziel: ${state.konsilId}`
  }
  action={
    state.konsilId !== "SESSION" ? (
      <Badge className="bg-ink-100 text-ink-700 ring-ink-200">
        {source === "hausarzt" ? "Hausarzt:in" : "Patient:in"}
      </Badge>
    ) : undefined
  }
/>
```

- [ ] **Step 2: Verify in browser**

With both servers running, open:
```
http://localhost:5173/upload/konsil/sess-demo999
```
Expected: the upload page loads (not the "Upload nicht moeglich" error), header says "Smartphone-Upload" with no source badge. The "Bilder auswaehlen" button and file input are visible.

- [ ] **Step 3: Commit**

```bash
git add src/pages/portal/PatientUploadPage.tsx
git commit -m "feat: show neutral UI on PatientUploadPage for session tokens"
```

---

### Task 4: Real QR + polling in MobileCaptureQrModal

**Files:**
- Modify: `src/services/konsilUploadService.ts`
- Modify: `src/components/upload/MobileCaptureQrModal.tsx`

- [ ] **Step 1: Add pollSession to konsilUploadService**

In `src/services/konsilUploadService.ts`, add `pollSession` to the exported object (after `markReviewed`):

```ts
async pollSession(sessionToken: string): Promise<ImageAttachment[]> {
  return request<ImageAttachment[]>(
    `/api/session-upload/${encodeURIComponent(sessionToken)}`
  );
},
```

`ImageAttachment` is already imported in `konsilUploadService.ts` (`import type { ImageAttachment, KonsilUpload, KonsilUploadSource } from "@/types/konsil"`), so no import change needed.

- [ ] **Step 2: Rewrite MobileCaptureQrModal**

Replace the entire file `src/components/upload/MobileCaptureQrModal.tsx`:

```tsx
import { useEffect, useMemo } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import type { ImageAttachment } from "@/types/konsil";
import { uid } from "@/utils/formatters";
import { Smartphone, Wifi, Loader2 } from "lucide-react";
import { konsilUploadService } from "@/services/konsilUploadService";

const APP_ORIGIN =
  import.meta.env.VITE_PUBLIC_APP_ORIGIN || window.location.origin;

export function MobileCaptureQrModal({
  open,
  onClose,
  onSimulateUpload,
}: {
  open: boolean;
  onClose: () => void;
  onSimulateUpload: (images: ImageAttachment[]) => void;
}) {
  const sessionToken = useMemo(
    () => `sess-${Math.random().toString(36).slice(2, 10)}`,
    [open]
  );

  const uploadUrl = `${APP_ORIGIN}/upload/konsil/${sessionToken}`;
  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=192x192&data=${encodeURIComponent(uploadUrl)}`;

  useEffect(() => {
    if (!open) return;
    const interval = setInterval(async () => {
      try {
        const images = await konsilUploadService.pollSession(sessionToken);
        if (images.length > 0) {
          onSimulateUpload(images);
          onClose();
        }
      } catch {
        // ignore transient poll errors
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [open, sessionToken, onSimulateUpload, onClose]);

  function simulate() {
    const now = new Date().toISOString();
    onSimulateUpload([
      { id: uid("img"), filename: "smartphone_übersicht.jpg", source: "mobile", uploadedAt: now, label: "Übersicht" },
      { id: uid("img"), filename: "smartphone_nähe.jpg", source: "mobile", uploadedAt: now, label: "Nähe" },
    ]);
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Bilder per Smartphone aufnehmen"
      description="Scannen Sie den QR-Code mit dem Smartphone, um Fotos direkt aufzunehmen und dem Konsil hinzuzufügen."
      size="md"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Abbrechen
          </Button>
          <Button onClick={simulate}>
            <Smartphone className="w-4 h-4" /> Demo: Smartphone-Bilder hinzufügen
          </Button>
        </>
      }
    >
      <div className="flex flex-col items-center gap-4">
        <div className="p-3 rounded-lg bg-white border border-ink-200 shadow-card">
          <img
            src={qrSrc}
            alt="QR-Code fuer Smartphone-Upload"
            className="w-48 h-48"
          />
        </div>
        <div className="text-center">
          <div className="text-sm text-ink-800 font-medium">Sicherer Foto-Upload</div>
          <div className="text-xs text-ink-500 mt-1 max-w-xs">
            Die Verbindung läuft Ende-zu-Ende verschlüsselt. Schließen Sie das Fenster nach
            erfolgreicher Übertragung.
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-ink-500">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          Warte auf Bilder vom Smartphone…
        </div>
        <div className="flex items-center gap-2 text-xs text-ink-500">
          <Wifi className="w-3.5 h-3.5" />
          Session: <span className="font-mono text-ink-700">{sessionToken}</span>
        </div>
      </div>
    </Modal>
  );
}
```

- [ ] **Step 3: Verify QR renders**

With both servers running, open the new konsil wizard (`/konsile/new`), navigate to step 3 "Bilder", click "QR-Code anzeigen". The modal should show:
- A real scannable QR image (loaded from `api.qrserver.com`)
- A spinning loader with "Warte auf Bilder vom Smartphone…"
- The session token displayed
- The "Demo: Smartphone-Bilder hinzufügen" button still working

- [ ] **Step 4: End-to-end test with ngrok**

With ngrok running on port 5173:
1. Open `https://delirium-outline-nephew.ngrok-free.dev/konsile/new` on desktop
2. Navigate to step 3, click "QR-Code anzeigen"
3. Scan the QR with iPhone
4. iPhone opens the upload page → tap "Bilder auswaehlen" → take a photo → tap "Zum Konsil hinzufügen"
5. Within ~2 seconds the modal on desktop should close and the photo should appear in the image list

- [ ] **Step 5: Commit**

```bash
git add src/services/konsilUploadService.ts src/components/upload/MobileCaptureQrModal.tsx
git commit -m "feat: real scannable QR with session polling in MobileCaptureQrModal"
```

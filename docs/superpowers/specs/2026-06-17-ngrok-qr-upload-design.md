# ngrok QR Upload — Design Spec

**Date:** 2026-06-17  
**Status:** Approved

## Goal

When a doctor opens a konsil (existing or new), they can scan a QR code with an iPhone, the phone opens the app's upload page, launches the camera, and photos are uploaded directly to the konsil. ngrok tunnels the local dev server at `https://delirium-outline-nephew.ngrok-free.dev`.

## What Was Already Done

- `VITE_PUBLIC_APP_ORIGIN=https://delirium-outline-nephew.ngrok-free.dev` set in `.env.local`
- `vite.config.ts` already has `allowedHosts: [".ngrok-free.dev"]`
- `lanUploadUrlForToken()` already reads `VITE_PUBLIC_APP_ORIGIN` first — so `KonsilDetailPage`'s QR URL is already correct
- `PatientUploadPage` at `/upload/konsil/:token` already has camera support (`capture="environment"`, multiple file select, submit to backend)

## Remaining Work

### 1. Vite Proxy (API Connectivity from iPhone)

**Problem:** `konsilUploadService` builds `API_BASE` as `${window.location.protocol}//${window.location.hostname}:3001`. When iPhone accesses via ngrok, `hostname` is `delirium-outline-nephew.ngrok-free.dev` and port 3001 is not tunneled — requests fail.

**Fix:**
- Add proxy in `vite.config.ts`: `/api` and `/uploads` → `http://localhost:3001`
- Change `konsilUploadService` `API_BASE` to `""` (empty string / relative path), so `fetch("/api/...")` goes through Vite's proxy both locally and via ngrok

`absoluteImageUrl()` with a relative `image.url` like `/uploads/foo.jpg` will return `/uploads/foo.jpg`, which Vite also proxies. No change needed there.

### 2. Real QR in `MobileCaptureQrModal`

**Problem:** The modal renders a fake, non-scannable SVG QR. It also points to a hardcoded fake URL (`https://app.derma-consult.de/m/...`).

**Fix:**
- Remove `FakeQrCode` component
- Replace with `<img src={qrSrc} />` where `qrSrc` is built the same way as `KonsilDetailPage`: `https://api.qrserver.com/v1/create-qr-code/?size=192x192&data={encoded-url}`
- URL encodes to: `${VITE_PUBLIC_APP_ORIGIN}/upload/konsil/sess-{sessionToken}` — a session-based token (not tied to a konsil ID)
- Keep the existing "Demo: Smartphone-Bilder hinzufügen" simulation button

### 3. Session Token Support in Backend

**Problem:** The backend only accepts tokens of the form `konsil-K-XXXX-XXXX`. The modal generates a `sess-{random}` token which the backend currently rejects.

**Fix in `upload-server.mjs`:**
- Extend `konsilIdFromToken` (or add a parallel `sessionIdFromToken`) to recognize `sess-{random}` tokens
- For session tokens, store uploads under `sessions[]` in the DB (or reuse `uploads[]` with `konsilId: "sess-{id}"`)
- Add `GET /api/session-upload/:token` endpoint that returns images uploaded under that session token
- `PatientUploadPage` already calls `getTarget(token)` on mount; for session tokens the server returns `{ token, konsilId: "SESSION" }` — the page should handle `konsilId === "SESSION"` by replacing the `Ziel: {konsilId}` description with "Smartphone-Upload" and hiding the source badge

**Fix in `konsilUploadService.ts`:**
- Add `pollSession(sessionToken): Promise<ImageAttachment[]>` method that calls `GET /api/session-upload/:token`

### 4. Polling in `MobileCaptureQrModal`

**Problem:** After the iPhone uploads images via a session token, the modal has no way to know and still shows the waiting state.

**Fix:**
- Modal sets up a 2-second polling interval when open, calling `konsilUploadService.pollSession(sessionToken)`
- When images are returned, fires `onSimulateUpload` with the real `ImageAttachment` objects (which have server-side `/uploads/...` URLs) and closes
- Polling stops on close (`onClose`) or when images arrive
- UI: add a subtle "Warte auf Bilder vom Smartphone..." status below the QR

## Architecture Summary

```
iPhone (via ngrok)
  │
  ▼
https://delirium-outline-nephew.ngrok-free.dev
  │
  ├── GET /upload/konsil/sess-abc123   → Vite dev server → React app (PatientUploadPage)
  ├── GET /api/konsil-upload/sess-abc123 → Vite proxy → upload-server:3001
  └── POST /api/konsil-upload/sess-abc123 → Vite proxy → upload-server:3001

Desktop (modal open, polling)
  └── GET /api/session-upload/sess-abc123 → Vite proxy → upload-server:3001
        → returns uploaded images → modal fires onSimulateUpload
```

## Files Changed

| File | Change |
|------|--------|
| `vite.config.ts` | Add `/api` and `/uploads` proxy to `localhost:3001` |
| `src/services/konsilUploadService.ts` | `API_BASE = ""`, add `pollSession()` |
| `src/components/upload/MobileCaptureQrModal.tsx` | Real QR, remove `FakeQrCode`, add polling, keep sim button |
| `upload-server.mjs` | Session token support, new poll endpoint, `PatientUploadPage` compat |
| `src/pages/portal/PatientUploadPage.tsx` | Handle `konsilId === "SESSION"` gracefully |

## Out of Scope

- WebSocket/SSE for real-time push (polling every 2s is sufficient for demo)
- Production auth on upload tokens
- Associating session uploads with the new konsil server-side (client-side `onSimulateUpload` is enough for the demo)

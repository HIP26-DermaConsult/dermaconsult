import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import type { ImageAttachment } from "@/types/konsil";
import { uid } from "@/utils/formatters";
import { Smartphone, Wifi, Loader2 } from "lucide-react";
import { konsilUploadService } from "@/services/konsilUploadService";
import { lanUploadUrlForToken } from "@/utils/konsilUpload";

export function MobileCaptureQrModal({
  open,
  onClose,
  onSimulateUpload,
}: {
  open: boolean;
  onClose: () => void;
  onSimulateUpload: (images: ImageAttachment[]) => void;
}) {
  const [sessionToken, setSessionToken] = useState(
    () => `sess-${Math.random().toString(36).slice(2, 10)}`
  );

  useEffect(() => {
    if (open) {
      setSessionToken(`sess-${Math.random().toString(36).slice(2, 10)}`);
    }
  }, [open]);

  const uploadUrl = lanUploadUrlForToken(sessionToken);
  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=192x192&data=${encodeURIComponent(uploadUrl)}`;

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    let inflight = false;
    const interval = setInterval(async () => {
      if (inflight) return;
      inflight = true;
      try {
        const images = await konsilUploadService.pollSession(sessionToken);
        if (!cancelled && images.length > 0) {
          onSimulateUpload(images);
          onClose();
        }
      } catch {
        // ignore transient poll errors
      } finally {
        inflight = false;
      }
    }, 2000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
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

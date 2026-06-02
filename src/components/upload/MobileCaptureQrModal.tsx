import { useMemo } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import type { ImageAttachment } from "@/types/konsil";
import { uid } from "@/utils/formatters";
import { Smartphone, Wifi } from "lucide-react";

export function MobileCaptureQrModal({
  open,
  onClose,
  onSimulateUpload,
}: {
  open: boolean;
  onClose: () => void;
  onSimulateUpload: (images: ImageAttachment[]) => void;
}) {
  const sessionToken = useMemo(() => Math.random().toString(36).slice(2, 10), [open]);

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
        <FakeQrCode value={`https://app.derma-consult.de/m/${sessionToken}`} />
        <div className="text-center">
          <div className="text-sm text-ink-800 font-medium">Sicherer Foto-Upload</div>
          <div className="text-xs text-ink-500 mt-1 max-w-xs">
            Die Verbindung läuft Ende-zu-Ende verschlüsselt. Schließen Sie das Fenster nach
            erfolgreicher Übertragung.
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-ink-500">
          <Wifi className="w-3.5 h-3.5" />
          Session: <span className="font-mono text-ink-700">m/{sessionToken}</span>
        </div>
      </div>
    </Modal>
  );
}

function FakeQrCode({ value }: { value: string }) {
  // Deterministic pseudo-QR pattern from the value string — purely visual.
  const cells = useMemo(() => {
    const size = 25;
    const seed = Array.from(value).reduce((a, c) => a + c.charCodeAt(0), 0);
    const grid: boolean[][] = [];
    for (let y = 0; y < size; y++) {
      const row: boolean[] = [];
      for (let x = 0; x < size; x++) {
        // Pseudo-random based on coords + seed
        const n = Math.sin((x + 1) * (y + 1) * (seed % 97)) * 10000;
        row.push((n - Math.floor(n)) > 0.5);
      }
      grid.push(row);
    }
    // Finder patterns (corners)
    const setFinder = (ox: number, oy: number) => {
      for (let y = 0; y < 7; y++) {
        for (let x = 0; x < 7; x++) {
          const onEdge = x === 0 || y === 0 || x === 6 || y === 6;
          const inner = x >= 2 && x <= 4 && y >= 2 && y <= 4;
          grid[oy + y][ox + x] = onEdge || inner;
        }
      }
    };
    setFinder(0, 0);
    setFinder(size - 7, 0);
    setFinder(0, size - 7);
    return grid;
  }, [value]);

  return (
    <div className="p-3 rounded-lg bg-white border border-ink-200 shadow-card">
      <svg viewBox={`0 0 ${cells.length} ${cells.length}`} className="w-48 h-48">
        <rect width={cells.length} height={cells.length} fill="#fff" />
        {cells.map((row, y) =>
          row.map((on, x) => (on ? <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill="#0f172a" /> : null))
        )}
      </svg>
    </div>
  );
}

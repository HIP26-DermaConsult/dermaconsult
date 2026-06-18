import { useCallback, useRef, useState, type Dispatch, type SetStateAction } from "react";
import { Upload, Smartphone, Trash2, Image as ImageIcon, Monitor } from "lucide-react";
import type { ImageAttachment } from "@/types/konsil";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatDateTime, uid } from "@/utils/formatters";
import { MobileCaptureQrModal } from "./MobileCaptureQrModal";

const LABEL_OPTIONS = ["Übersicht", "Nähe", "Dermatoskopie", "Detail"];

export function ImageUploadArea({
  images,
  onChange,
}: {
  images: ImageAttachment[];
  onChange: Dispatch<SetStateAction<ImageAttachment[]>>;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);

  function addFiles(files: FileList | null) {
    if (!files) return;
    const additions: ImageAttachment[] = Array.from(files).map((f) => ({
      id: uid("img"),
      filename: f.name,
      source: "desktop",
      uploadedAt: new Date().toISOString(),
    }));
    onChange((prev) => [...prev, ...additions]);
  }

  function remove(id: string) {
    onChange((prev) => prev.filter((i) => i.id !== id));
  }

  function setLabel(id: string, label: string) {
    onChange((prev) => prev.map((i) => (i.id === id ? { ...i, label } : i)));
  }

  const handleMobileImages = useCallback((newOnes: ImageAttachment[]) => {
    onChange((prev: ImageAttachment[]) => [...prev, ...newOnes]);
  }, [onChange]);

  const closeQr = useCallback(() => setQrOpen(false), []);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDrag(true);
          }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDrag(false);
            addFiles(e.dataTransfer.files);
          }}
          className={`flex-1 rounded-xl border-2 border-dashed p-6 text-center transition-colors ${
            drag ? "border-brand-500 bg-brand-50" : "border-ink-200 bg-ink-50/40"
          }`}
        >
          <Monitor className="w-6 h-6 mx-auto text-ink-400" />
          <div className="mt-2 text-sm font-medium text-ink-800">
            Bilder per Desktop hochladen
          </div>
          <div className="text-xs text-ink-500 mt-0.5">
            Dateien hierher ziehen oder
          </div>
          <div className="mt-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => inputRef.current?.click()}
            >
              <Upload className="w-4 h-4" /> Dateien auswählen
            </Button>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              multiple
              hidden
              onChange={(e) => addFiles(e.target.files)}
            />
          </div>
        </div>
        <div className="flex-1 rounded-xl border-2 border-dashed border-ink-200 bg-ink-50/40 p-6 text-center">
          <Smartphone className="w-6 h-6 mx-auto text-ink-400" />
          <div className="mt-2 text-sm font-medium text-ink-800">
            Bilder per Smartphone aufnehmen
          </div>
          <div className="text-xs text-ink-500 mt-0.5">QR-Code scannen für Direktaufnahme</div>
          <div className="mt-3">
            <Button type="button" variant="outline" size="sm" onClick={() => setQrOpen(true)}>
              <Smartphone className="w-4 h-4" /> QR-Code anzeigen
            </Button>
          </div>
        </div>
      </div>

      {images.length > 0 && (
        <div>
          <div className="text-sm font-medium text-ink-800 mb-2">
            Angehängte Bilder ({images.length})
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {images.map((img) => (
              <div key={img.id} className="rounded-lg border border-ink-200 bg-white overflow-hidden group">
                <div className="aspect-square bg-gradient-to-br from-ink-100 to-ink-200 grid place-items-center relative overflow-hidden">
                  {img.previewUrl ? (
                    <img src={img.previewUrl} alt={img.label ?? img.filename} className="absolute inset-0 w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="w-8 h-8 text-ink-400" />
                  )}
                  <button
                    type="button"
                    onClick={() => remove(img.id)}
                    className="absolute top-2 right-2 p-1.5 rounded-md bg-white/90 border border-ink-200 text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Bild entfernen"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="p-2.5 space-y-1.5">
                  <div className="text-xs font-medium text-ink-800 truncate" title={img.filename}>
                    {img.filename}
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-ink-500">
                    <Badge size="sm" className="bg-ink-100 text-ink-600 ring-ink-200">
                      {img.source === "mobile" ? "Smartphone" : "Desktop"}
                    </Badge>
                    <span>{formatDateTime(img.uploadedAt)}</span>
                  </div>
                  <select
                    value={img.label ?? ""}
                    onChange={(e) => setLabel(img.id, e.target.value)}
                    className="w-full h-7 text-xs px-2 rounded border border-ink-200 bg-white focus-ring"
                  >
                    <option value="">Label wählen…</option>
                    {LABEL_OPTIONS.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <MobileCaptureQrModal
        open={qrOpen}
        onClose={closeQr}
        onSimulateUpload={handleMobileImages}
      />
    </div>
  );
}

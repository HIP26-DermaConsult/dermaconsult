import { Image as ImageIcon, Smartphone, Monitor } from "lucide-react";
import type { ImageAttachment } from "@/types/konsil";
import { formatDateTime } from "@/utils/formatters";
import { Badge } from "@/components/ui/Badge";

export function ImageGallery({ images }: { images: ImageAttachment[] }) {
  if (images.length === 0) {
    return <div className="text-sm text-ink-500">Keine Bilder vorhanden</div>;
  }
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      {images.map((img) => (
        <div key={img.id} className="rounded-lg border border-ink-200 bg-white overflow-hidden">
          <div className="aspect-square bg-gradient-to-br from-ink-100 to-ink-200 grid place-items-center">
            <ImageIcon className="w-8 h-8 text-ink-400" />
          </div>
          <div className="p-2.5 text-xs space-y-1">
            <div className="font-medium text-ink-800 truncate" title={img.filename}>
              {img.filename}
            </div>
            <div className="flex items-center justify-between gap-2 text-ink-500">
              <span className="inline-flex items-center gap-1">
                {img.source === "mobile" ? (
                  <Smartphone className="w-3 h-3" />
                ) : (
                  <Monitor className="w-3 h-3" />
                )}
                {img.source === "mobile" ? "Smartphone" : "Desktop"}
              </span>
              <span>{formatDateTime(img.uploadedAt)}</span>
            </div>
            {img.label && (
              <Badge size="sm" className="bg-ink-100 text-ink-700 ring-ink-200">
                {img.label}
              </Badge>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

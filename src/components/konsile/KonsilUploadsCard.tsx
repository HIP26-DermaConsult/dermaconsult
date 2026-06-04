import { CheckCircle2, Clock, Inbox, Stethoscope, UserRound } from "lucide-react";
import type { KonsilUpload } from "@/types/konsil";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ImageGallery } from "@/components/konsile/ImageGallery";
import { formatDateTime } from "@/utils/formatters";

export function KonsilUploadsCard({
  uploads,
  needsReview,
  onMarkReviewed,
}: {
  uploads: KonsilUpload[];
  needsReview?: boolean;
  onMarkReviewed?: () => void;
}) {
  if (uploads.length === 0) return null;

  return (
    <Card className={needsReview ? "border-amber-200" : undefined}>
      <CardHeader
        title={
          <span className="flex items-center gap-2">
            <Inbox className="w-4 h-4 text-violet-600" /> Nachgereichte Uploads
          </span>
        }
        description="Fotos und Kommentare, die nach der Konsilerstellung hinzugefuegt wurden"
        action={
          needsReview && onMarkReviewed ? (
            <Button variant="outline" size="sm" onClick={onMarkReviewed}>
              <CheckCircle2 className="w-4 h-4" /> Als geprueft markieren
            </Button>
          ) : undefined
        }
      />
      <CardBody className="space-y-4">
        {uploads.map((upload) => (
          <div key={upload.id} className="rounded-lg border border-ink-100 bg-ink-50/50 p-3 space-y-3">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <Badge
                  size="sm"
                  className={
                    upload.source === "patient"
                      ? "bg-amber-50 text-amber-700 ring-amber-200"
                      : "bg-brand-50 text-brand-700 ring-brand-200"
                  }
                >
                  {upload.source === "patient" ? <UserRound className="w-3 h-3" /> : <Stethoscope className="w-3 h-3" />}
                  {upload.source === "patient" ? "Patient:in" : "Hausarzt:in"}
                </Badge>
                <div className="text-xs text-ink-500 mt-1">Hochgeladen {formatDateTime(upload.submittedAt)}</div>
              </div>
              {upload.source === "patient" && !upload.reviewedByHausarzt ? (
                <Badge size="sm" className="bg-amber-50 text-amber-700 ring-amber-200">
                  <Clock className="w-3 h-3" /> Neu
                </Badge>
              ) : (
                <Badge size="sm" className="bg-emerald-50 text-emerald-700 ring-emerald-200">
                  <CheckCircle2 className="w-3 h-3" /> Geprueft
                </Badge>
              )}
            </div>
            {upload.note && <p className="text-sm text-ink-800 whitespace-pre-wrap">{upload.note}</p>}
            <ImageGallery images={upload.images} />
          </div>
        ))}
      </CardBody>
    </Card>
  );
}

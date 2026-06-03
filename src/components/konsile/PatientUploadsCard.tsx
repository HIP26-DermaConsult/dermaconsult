import { Inbox, Clock, CheckCircle2 } from "lucide-react";
import type { DataRequest } from "@/types/portal";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ImageGallery } from "@/components/konsile/ImageGallery";
import { formatDateTime } from "@/utils/formatters";

export function PatientUploadsCard({ requests }: { requests: DataRequest[] }) {
  if (requests.length === 0) return null;

  return (
    <Card>
      <CardHeader
        title={
          <span className="flex items-center gap-2">
            <Inbox className="w-4 h-4 text-violet-600" /> Patienten-Uploads
          </span>
        }
        description="Von der Patientin / dem Patienten bereitgestellte Daten"
      />
      <CardBody className="space-y-5">
        {requests.map((req) => (
          <div key={req.id} className="space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="text-sm text-ink-700">
                <span className="font-medium text-ink-900">Angefragt:</span> {req.message}
                <div className="text-xs text-ink-500 mt-0.5">
                  von {req.requestedByName} · {formatDateTime(req.createdAt)}
                </div>
              </div>
              {req.status === "submitted" ? (
                <Badge size="sm" className="bg-emerald-50 text-emerald-700 ring-emerald-200">
                  <CheckCircle2 className="w-3 h-3" /> Eingegangen
                </Badge>
              ) : (
                <Badge size="sm" className="bg-amber-50 text-amber-700 ring-amber-200">
                  <Clock className="w-3 h-3" /> Ausstehend
                </Badge>
              )}
            </div>

            {req.uploads.map((up) => (
              <div key={up.id} className="rounded-lg border border-ink-100 bg-ink-50/50 p-3 space-y-2">
                <div className="text-xs text-ink-500">Hochgeladen {formatDateTime(up.submittedAt)}</div>
                {up.note && <p className="text-sm text-ink-800 whitespace-pre-wrap">{up.note}</p>}
                <ImageGallery images={up.images} />
              </div>
            ))}
          </div>
        ))}
      </CardBody>
    </Card>
  );
}

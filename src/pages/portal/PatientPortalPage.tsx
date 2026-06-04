import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, FileText, HeartPulse, QrCode, UploadCloud } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useKonsile } from "@/hooks/useKonsile";
import { usePatientSummaries } from "@/hooks/usePortal";
import { dataRequestService } from "@/services/dataRequestService";
import { konsilUploadService } from "@/services/konsilUploadService";
import type { DataRequest } from "@/types/portal";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { CopyableLink } from "@/components/ui/CopyableLink";
import { EmptyState } from "@/components/ui/EmptyState";
import { Modal } from "@/components/ui/Modal";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatDate } from "@/utils/formatters";
import { lanUploadUrlForToken } from "@/utils/konsilUpload";

export default function PatientPortalPage() {
  const { user } = useAuth();
  const { summaries, loading } = usePatientSummaries(user?.patientId);
  const { konsile } = useKonsile();
  const [openRequests, setOpenRequests] = useState<DataRequest[]>([]);
  const [appOrigin, setAppOrigin] = useState<string | undefined>();
  const [qrLink, setQrLink] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.patientId) return;
    dataRequestService
      .listForPatient(user.patientId)
      .then((all) => setOpenRequests(all.filter((r) => r.status === "pending")));
  }, [user?.patientId]);

  useEffect(() => {
    konsilUploadService
      .getNetworkInfo()
      .then((info) => setAppOrigin(info.appOrigin))
      .catch(() => setAppOrigin(undefined));
  }, []);

  const firstName = user?.name.split(" ")[0] ?? "";
  const ongoingKonsile = konsile.filter(
    (konsil) => konsil.patientId === user?.patientId && konsil.status !== "closed"
  );

  return (
    <>
      <PageHeader
        title={`Willkommen${firstName ? `, ${firstName}` : ""}`}
        description="Hier finden Sie verstaendliche Informationen zu Ihrer Behandlung."
      />

      {openRequests.length > 0 && (
        <div className="mb-6 space-y-3">
          {openRequests.map((req) => {
            const linkedKonsil = req.konsilId
              ? konsile.find((konsil) => konsil.id === req.konsilId)
              : undefined;
            return (
              <Card key={req.id} className="border-amber-200 bg-amber-50/40">
                <CardBody className="flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-700 grid place-items-center shrink-0">
                      <UploadCloud className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-ink-900">
                        Ihre Praxis bittet um zusaetzliche Daten
                      </div>
                      <div className="text-sm text-ink-600 mt-0.5">{req.message}</div>
                    </div>
                  </div>
                  <Link
                    to={linkedKonsil ? `/upload/konsil/${linkedKonsil.uploadToken}` : `/upload/${req.token}`}
                    className="shrink-0"
                  >
                    <Button>
                      <UploadCloud className="w-4 h-4" /> Daten hochladen
                    </Button>
                  </Link>
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}

      {ongoingKonsile.length > 0 && (
        <div className="mb-6 space-y-3">
          {ongoingKonsile.map((konsil) => (
            <Card key={konsil.id} className="border-violet-200 bg-violet-50/30">
              <CardBody className="flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-violet-100 text-violet-700 grid place-items-center shrink-0">
                    <UploadCloud className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-ink-900">Fotos zum laufenden Konsil hochladen</div>
                    <div className="text-sm text-ink-600 mt-0.5">{konsil.reason}</div>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 shrink-0">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setQrLink(lanUploadUrlForToken(konsil.uploadToken, appOrigin))}
                  >
                    <QrCode className="w-4 h-4" /> QR-Code oeffnen
                  </Button>
                  <Button
                    onClick={() => {
                      window.location.href = lanUploadUrlForToken(konsil.uploadToken, appOrigin);
                    }}
                  >
                    <UploadCloud className="w-4 h-4" /> Fotos hochladen
                  </Button>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      <Card>
        <CardHeader
          title={
            <span className="flex items-center gap-2">
              <HeartPulse className="w-4 h-4 text-violet-600" /> Meine Behandlungen
            </span>
          }
          description="Von Ihrer Aerztin oder Ihrem Arzt freigegebene Zusammenfassungen"
        />
        <CardBody className={loading || summaries.length === 0 ? undefined : "p-0"}>
          {loading ? (
            <div className="space-y-3">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : summaries.length === 0 ? (
            <EmptyState
              icon={<FileText className="w-5 h-5" />}
              title="Noch keine Freigaben"
              description="Sobald Ihre Praxis eine Behandlungszusammenfassung freigibt, erscheint sie hier."
            />
          ) : (
            <ul className="divide-y divide-ink-100">
              {summaries.map((s) => (
                <li key={s.konsilId}>
                  <Link
                    to={`/portal/consultations/${s.konsilId}`}
                    className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-ink-50/60 transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-ink-900 truncate">
                        {s.diseaseInfo.split(".")[0]}.
                      </div>
                      <div className="text-xs text-ink-500 mt-0.5">
                        Freigegeben von {s.sharedByName} · {formatDate(s.sharedAt)}
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-ink-400 shrink-0" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>

      <Modal
        open={!!qrLink}
        onClose={() => setQrLink(null)}
        title="QR-Code fuer Foto-Upload"
        description="Scannen Sie diesen Code mit dem Handy, um Fotos direkt aufzunehmen."
      >
        {qrLink && (
          <div className="space-y-4">
            <div className="flex justify-center rounded-lg border border-ink-200 bg-white p-3">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=192x192&data=${encodeURIComponent(qrLink)}`}
                alt="QR-Code fuer Foto-Upload"
                className="w-48 h-48"
              />
            </div>
            <CopyableLink url={qrLink} />
          </div>
        )}
      </Modal>
    </>
  );
}

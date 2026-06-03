import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { HeartPulse, FileText, UploadCloud, ChevronRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { usePatientSummaries } from "@/hooks/usePortal";
import { dataRequestService } from "@/services/dataRequestService";
import type { DataRequest } from "@/types/portal";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatDate } from "@/utils/formatters";

export default function PatientPortalPage() {
  const { user } = useAuth();
  const { summaries, loading } = usePatientSummaries(user?.patientId);
  const [openRequests, setOpenRequests] = useState<DataRequest[]>([]);

  useEffect(() => {
    if (!user?.patientId) return;
    dataRequestService
      .listForPatient(user.patientId)
      .then((all) => setOpenRequests(all.filter((r) => r.status === "pending")));
  }, [user?.patientId]);

  const firstName = user?.name.split(" ")[0] ?? "";

  return (
    <>
      <PageHeader
        title={`Willkommen${firstName ? `, ${firstName}` : ""}`}
        description="Hier finden Sie verständliche Informationen zu Ihrer Behandlung."
      />

      {openRequests.length > 0 && (
        <div className="mb-6 space-y-3">
          {openRequests.map((req) => (
            <Card key={req.id} className="border-amber-200 bg-amber-50/40">
              <CardBody className="flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-700 grid place-items-center shrink-0">
                    <UploadCloud className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-ink-900">
                      Ihre Praxis bittet um zusätzliche Daten
                    </div>
                    <div className="text-sm text-ink-600 mt-0.5">{req.message}</div>
                  </div>
                </div>
                <Link to={`/upload/${req.token}`} className="shrink-0">
                  <Button>
                    <UploadCloud className="w-4 h-4" /> Daten hochladen
                  </Button>
                </Link>
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
          description="Von Ihrer Ärztin oder Ihrem Arzt freigegebene Zusammenfassungen"
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
              description="Sobald Ihre Praxis eine Behandlungszusammenfassung für Sie freigibt, erscheint sie hier."
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
    </>
  );
}

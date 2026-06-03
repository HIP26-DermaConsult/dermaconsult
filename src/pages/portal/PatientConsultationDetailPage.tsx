import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Info, ClipboardList, MessageCircle, HeartPulse } from "lucide-react";
import { usePatientSummary } from "@/hooks/usePortal";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatDate } from "@/utils/formatters";

export default function PatientConsultationDetailPage() {
  const { konsilId } = useParams();
  const { summary, loading } = usePatientSummary(konsilId);

  if (loading) {
    return (
      <Card>
        <CardBody className="space-y-3">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-2/3" />
        </CardBody>
      </Card>
    );
  }

  if (!summary) {
    return (
      <EmptyState
        title="Behandlung nicht gefunden"
        description="Diese Zusammenfassung steht nicht (mehr) zur Verfügung."
        action={
          <Link to="/portal" className="text-brand-700 hover:underline text-sm">
            Zurück zur Übersicht
          </Link>
        }
      />
    );
  }

  return (
    <>
      <PageHeader
        title="Ihre Behandlung"
        description={`Freigegeben von ${summary.sharedByName} · ${formatDate(summary.sharedAt)}`}
        breadcrumbs={
          <Link to="/portal" className="hover:underline inline-flex items-center gap-1">
            <ArrowLeft className="w-3 h-3" /> Meine Behandlung
          </Link>
        }
      />

      <div className="max-w-3xl space-y-6">
        <Section
          icon={<Info className="w-4 h-4 text-violet-600" />}
          title="Ihre Diagnose / Erkrankung"
          body={summary.diseaseInfo}
        />
        <Section
          icon={<ClipboardList className="w-4 h-4 text-violet-600" />}
          title="Ihr Behandlungsplan"
          body={summary.treatmentPlan}
        />
        {summary.doctorNote.trim() && (
          <Section
            icon={<MessageCircle className="w-4 h-4 text-violet-600" />}
            title="Hinweise Ihrer Praxis"
            body={summary.doctorNote}
          />
        )}

        <div className="flex items-start gap-2.5 text-xs text-ink-500 px-1">
          <HeartPulse className="w-4 h-4 shrink-0 mt-0.5 text-ink-400" />
          <p>
            Diese Informationen ersetzen keine ärztliche Beratung. Bei Fragen oder einer
            Verschlechterung wenden Sie sich bitte direkt an Ihre Praxis.
          </p>
        </div>
      </div>
    </>
  );
}

function Section({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <Card>
      <CardHeader title={<span className="flex items-center gap-2">{icon} {title}</span>} />
      <CardBody>
        <p className="text-sm text-ink-800 whitespace-pre-wrap leading-relaxed">{body}</p>
      </CardBody>
    </Card>
  );
}

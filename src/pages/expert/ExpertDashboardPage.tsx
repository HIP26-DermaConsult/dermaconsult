import { Link } from "react-router-dom";
import { Inbox, Loader2, HelpCircle, CheckCircle2, ArrowRight, Stethoscope } from "lucide-react";
import { useKonsile } from "@/hooks/useKonsile";
import { usePatients } from "@/hooks/usePatients";
import { useAuth } from "@/hooks/useAuth";
import { PageHeader } from "@/components/layout/PageHeader";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { StatusBadge, UrgencyBadge } from "@/components/ui/StatusBadge";
import { relativeTime } from "@/utils/formatters";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";

export default function ExpertDashboardPage() {
  const { user } = useAuth();
  const { konsile, loading } = useKonsile();
  const { patients } = usePatients();

  const incoming = konsile.filter((k) => k.status === "submitted");
  const inReview = konsile.filter((k) => k.status === "in_review");
  const rueckfrage = konsile.filter((k) => k.status === "rueckfrage");
  const done = konsile.filter((k) => k.status === "answered" || k.status === "closed");

  const urgentNext = [...incoming, ...inReview].sort((a, b) => {
    const u = { urgent: 0, soon: 1, routine: 2 } as const;
    return u[a.urgency] - u[b.urgency] || +new Date(a.createdAt) - +new Date(b.createdAt);
  })[0];

  return (
    <>
      <PageHeader
        title={`Hallo, ${user?.name.split(" ").slice(-1)[0]}`}
        description="Übersicht über eingehende Konsil-Anfragen und Ihre Bearbeitungswarteschlange."
        action={
          urgentNext && (
            <Link to={`/expert/konsile/${urgentNext.id}`}>
              <Button>
                <Stethoscope className="w-4 h-4" /> Nächstes Konsil bearbeiten
              </Button>
            </Link>
          )
        }
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <DashboardCard label="Neue Anfragen" value={incoming.length} icon={Inbox} tone="default" />
        <DashboardCard label="In Bearbeitung" value={inReview.length} icon={Loader2} tone="warn" />
        <DashboardCard label="Rückfragen offen" value={rueckfrage.length} icon={HelpCircle} tone="danger" />
        <DashboardCard label="Abgeschlossen" value={done.length} icon={CheckCircle2} tone="good" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Queue
          title="Neue Anfragen"
          description="Noch nicht in Bearbeitung"
          items={incoming}
          patients={patients}
          loading={loading}
        />
        <Queue
          title="In Bearbeitung"
          description="Aktuell von Ihnen begutachtet"
          items={inReview}
          patients={patients}
          loading={loading}
        />
        <Queue
          title="Warte auf Hausarzt"
          description="Rückfragen offen"
          items={rueckfrage}
          patients={patients}
          loading={loading}
        />
        <Queue
          title="Zuletzt abgeschlossen"
          description="Beantwortete oder geschlossene Konsile"
          items={done.slice(0, 5)}
          patients={patients}
          loading={loading}
        />
      </div>
    </>
  );
}

function Queue({
  title,
  description,
  items,
  patients,
  loading,
}: {
  title: string;
  description: string;
  items: ReturnType<typeof useKonsile>["konsile"];
  patients: ReturnType<typeof usePatients>["patients"];
  loading: boolean;
}) {
  return (
    <Card>
      <CardHeader title={title} description={description} />
      <CardBody className="p-0">
        {loading ? (
          <div className="p-5 text-sm text-ink-500">Lade…</div>
        ) : items.length === 0 ? (
          <div className="p-5">
            <EmptyState title="Keine Einträge" />
          </div>
        ) : (
          <ul className="divide-y divide-ink-100">
            {items.map((k) => {
              const p = patients.find((x) => x.id === k.patientId);
              return (
                <li key={k.id}>
                  <Link
                    to={`/expert/konsile/${k.id}`}
                    className="flex items-center gap-3 px-5 py-3 hover:bg-ink-50 transition"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-ink-900">
                        {k.id} · {p ? `${p.lastName}, ${p.firstName}` : "—"}
                      </div>
                      <div className="text-xs text-ink-500 truncate">{k.reason}</div>
                      <div className="text-[11px] text-ink-400 mt-0.5">
                        {relativeTime(k.updatedAt)}
                      </div>
                    </div>
                    <UrgencyBadge urgency={k.urgency} size="sm" />
                    <StatusBadge status={k.status} size="sm" />
                    <ArrowRight className="w-4 h-4 text-ink-400" />
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </CardBody>
    </Card>
  );
}

import { Link } from "react-router-dom";
import { Plus, Inbox, Loader2, CheckCircle2, Users, AlertTriangle, ArrowRight, UserPlus } from "lucide-react";
import { useKonsile } from "@/hooks/useKonsile";
import { usePatients } from "@/hooks/usePatients";
import { useAuth } from "@/hooks/useAuth";
import { PageHeader } from "@/components/layout/PageHeader";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { StatusBadge, UrgencyBadge } from "@/components/ui/StatusBadge";
import { relativeTime } from "@/utils/formatters";

export default function HausarztDashboardPage() {
  const { user } = useAuth();
  const { konsile, loading } = useKonsile();
  const { patients } = usePatients();

  const open = konsile.filter((k) => k.status === "submitted").length;
  const inReview = konsile.filter((k) => k.status === "in_review").length;
  const answered = konsile.filter((k) => k.status === "answered").length;
  const rueckfragen = konsile.filter((k) => k.status === "rueckfrage");

  return (
    <>
      <PageHeader
        title={`Willkommen zurück, ${user?.name.split(" ").slice(-1)[0]}`}
        description="Übersicht über aktive Konsile, Rückfragen der Dermatologie und Patienten Ihrer Praxis."
        action={
          <>
            <Link to="/patients/new">
              <Button variant="outline">
                <UserPlus className="w-4 h-4" /> Neue:r Patient:in
              </Button>
            </Link>
            <Link to="/patients">
              <Button variant="outline">
                <Users className="w-4 h-4" /> Patienten verwalten
              </Button>
            </Link>
            <Link to="/konsile/new">
              <Button>
                <Plus className="w-4 h-4" /> Neues Konsil
              </Button>
            </Link>
          </>
        }
      />

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="p-5">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-8 w-16 mt-3" />
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <DashboardCard label="Offene Konsile" value={open} icon={Inbox} tone="default" hint="An Dermatologie übermittelt" />
          <DashboardCard label="In Bearbeitung" value={inReview} icon={Loader2} tone="warn" hint="Begutachtung läuft" />
          <DashboardCard label="Beantwortet" value={answered} icon={CheckCircle2} tone="good" hint="Befund verfügbar" />
          <DashboardCard label="Patienten" value={patients.length} icon={Users} hint="Aktive Patientenakten" />
        </div>
      )}

      {rueckfragen.length > 0 && (
        <Card className="mb-6 border-amber-200 bg-amber-50/50">
          <CardHeader
            title={
              <span className="flex items-center gap-2 text-amber-900">
                <AlertTriangle className="w-4 h-4" />
                Neue Rückfragen der Dermatologie
              </span>
            }
            description={`${rueckfragen.length} Konsil(e) warten auf Ihre Antwort`}
          />
          <CardBody className="space-y-2">
            {rueckfragen.map((k) => (
              <Link
                key={k.id}
                to={`/konsile/${k.id}`}
                className="flex items-center justify-between gap-4 p-3 rounded-lg bg-white border border-amber-100 hover:border-amber-300 hover:shadow-card transition"
              >
                <div className="min-w-0">
                  <div className="font-medium text-ink-900 text-sm">{k.id} · {k.reason}</div>
                  <div className="text-xs text-ink-500 mt-0.5">
                    Aktualisiert {relativeTime(k.updatedAt)}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <UrgencyBadge urgency={k.urgency} size="sm" />
                  <StatusBadge status={k.status} size="sm" />
                  <ArrowRight className="w-4 h-4 text-ink-400" />
                </div>
              </Link>
            ))}
          </CardBody>
        </Card>
      )}

    </>
  );
}

import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Pencil, Plus, UserPlus } from "lucide-react";
import { usePatient } from "@/hooks/usePatients";
import { useKonsile } from "@/hooks/useKonsile";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { PatientSummaryCard } from "@/components/patients/PatientSummaryCard";
import { InvitePatientModal } from "@/components/patients/InvitePatientModal";
import { KonsilTable } from "@/components/konsile/KonsilTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";

const PORTAL_STATUS_BADGE: Record<string, { label: string; className: string }> = {
  active: { label: "Portal aktiv", className: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
  invited: { label: "Einladung versendet", className: "bg-amber-50 text-amber-700 ring-amber-200" },
};

export default function PatientDetailPage() {
  const { id } = useParams();
  const { patient, loading, refresh } = usePatient(id);
  const { konsile } = useKonsile();
  const patientKonsile = konsile.filter((k) => k.patientId === id);
  const [inviteOpen, setInviteOpen] = useState(false);

  if (loading || !patient) {
    return (
      <Card>
        <CardBody className="space-y-3">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-2/3" />
        </CardBody>
      </Card>
    );
  }

  return (
    <>
      <PageHeader
        title={`${patient.lastName}, ${patient.firstName}`}
        breadcrumbs={
          <Link to="/patients" className="hover:underline inline-flex items-center gap-1">
            <ArrowLeft className="w-3 h-3" /> Patienten
          </Link>
        }
        action={
          <>
            {patient.portalStatus !== "active" && (
              <Button variant="outline" onClick={() => setInviteOpen(true)}>
                <UserPlus className="w-4 h-4" /> Portal-Zugang einladen
              </Button>
            )}
            <Link to={`/patients/${patient.id}/edit`}>
              <Button variant="outline">
                <Pencil className="w-4 h-4" /> Bearbeiten
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <PatientSummaryCard patient={patient} />
          <Card>
            <CardHeader title="Konsile" description="Alle Konsile dieses Patienten" />
            <CardBody className="p-0">
              {patientKonsile.length === 0 ? (
                <div className="p-6">
                  <EmptyState title="Keine Konsile vorhanden" />
                </div>
              ) : (
                <KonsilTable konsile={patientKonsile} patients={[patient]} basePath="/konsile" />
              )}
            </CardBody>
          </Card>
        </div>
        <div className="space-y-6">
          <Card>
            <CardHeader
              title="Patientenportal"
              action={
                PORTAL_STATUS_BADGE[patient.portalStatus ?? "none"] && (
                  <Badge size="sm" className={PORTAL_STATUS_BADGE[patient.portalStatus!].className}>
                    {PORTAL_STATUS_BADGE[patient.portalStatus!].label}
                  </Badge>
                )
              }
            />
            <CardBody className="space-y-2 text-sm">
              {patient.portalStatus === "active" ? (
                <p className="text-ink-600">
                  Die Patientin / der Patient hat Zugriff auf das Portal und sieht freigegebene
                  Behandlungszusammenfassungen.
                </p>
              ) : (
                <>
                  <p className="text-ink-600">
                    Laden Sie die Patientin / den Patienten ein, um Behandlungsinfos freizugeben.
                  </p>
                  <button
                    onClick={() => setInviteOpen(true)}
                    className="block text-brand-700 hover:underline"
                  >
                    → Portal-Zugang einladen
                  </button>
                </>
              )}
            </CardBody>
          </Card>
          <Card>
            <CardHeader title="Schnellzugriff" />
            <CardBody className="space-y-2 text-sm">
              <Link to="/konsile/new" className="block text-brand-700 hover:underline">
                → Neues Konsil für diese:n Patient:in
              </Link>
              <Link to={`/patients/${patient.id}/edit`} className="block text-brand-700 hover:underline">
                → Patientendaten bearbeiten
              </Link>
            </CardBody>
          </Card>
        </div>
      </div>

      <InvitePatientModal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        patient={patient}
        onInvited={refresh}
      />
    </>
  );
}

import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Pencil, Plus } from "lucide-react";
import { usePatient } from "@/hooks/usePatients";
import { useKonsile } from "@/hooks/useKonsile";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { PatientSummaryCard } from "@/components/patients/PatientSummaryCard";
import { KonsilTable } from "@/components/konsile/KonsilTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";

export default function PatientDetailPage() {
  const { id } = useParams();
  const { patient, loading } = usePatient(id);
  const { konsile } = useKonsile();
  const patientKonsile = konsile.filter((k) => k.patientId === id);

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
    </>
  );
}

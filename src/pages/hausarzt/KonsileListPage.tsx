import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, FileText } from "lucide-react";
import { useKonsile } from "@/hooks/useKonsile";
import { usePatients } from "@/hooks/usePatients";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { KonsilTable } from "@/components/konsile/KonsilTable";
import { Select } from "@/components/ui/Input";
import type { KonsilStatus, Urgency } from "@/types/konsil";
import { STATUS_LABELS, URGENCY_LABELS } from "@/utils/constants";
import { EmptyState } from "@/components/ui/EmptyState";

export default function HausarztKonsileListPage() {
  const { konsile, loading } = useKonsile();
  const { patients } = usePatients();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"all" | KonsilStatus>("all");
  const [urgency, setUrgency] = useState<"all" | Urgency>("all");

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    return konsile.filter((k) => {
      const p = patients.find((p) => p.id === k.patientId);
      const matchesQ =
        !t ||
        k.id.toLowerCase().includes(t) ||
        k.reason.toLowerCase().includes(t) ||
        (p && `${p.firstName} ${p.lastName}`.toLowerCase().includes(t));
      const matchesStatus = status === "all" || k.status === status;
      const matchesUrgency = urgency === "all" || k.urgency === urgency;
      return matchesQ && matchesStatus && matchesUrgency;
    });
  }, [konsile, patients, q, status, urgency]);

  return (
    <>
      <PageHeader
        title="Konsile"
        description="Alle von Ihnen erstellten Konsil-Anfragen."
        action={
          <Link to="/konsile/new">
            <Button>
              <Plus className="w-4 h-4" /> Neues Konsil
            </Button>
          </Link>
        }
      />

      <Card className="mb-4">
        <CardBody className="flex flex-col md:flex-row gap-3 md:items-center">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Suche nach Konsil-ID, Patient oder Fragestellung…"
              className="w-full h-10 pl-9 pr-3 rounded-md border border-ink-200 bg-white text-sm focus-ring focus:border-brand-500"
            />
          </div>
          <Select value={status} onChange={(e) => setStatus(e.target.value as any)} className="md:w-48">
            <option value="all">Alle Status</option>
            {Object.entries(STATUS_LABELS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </Select>
          <Select value={urgency} onChange={(e) => setUrgency(e.target.value as any)} className="md:w-48">
            <option value="all">Alle Dringlichkeiten</option>
            {Object.entries(URGENCY_LABELS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </Select>
        </CardBody>
      </Card>

      {loading ? (
        <Card>
          <CardBody className="text-sm text-ink-500">Lade Konsile…</CardBody>
        </Card>
      ) : (
        <KonsilTable
          konsile={filtered}
          patients={patients}
          basePath="/konsile"
          empty={
            <EmptyState
              icon={<FileText className="w-5 h-5" />}
              title="Keine Konsile gefunden"
              description="Passen Sie Filter und Suche an oder erstellen Sie ein neues Konsil."
            />
          }
        />
      )}
    </>
  );
}

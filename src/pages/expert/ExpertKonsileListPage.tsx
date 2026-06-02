import { useMemo, useState } from "react";
import { Search, FileText } from "lucide-react";
import { useKonsile } from "@/hooks/useKonsile";
import { usePatients } from "@/hooks/usePatients";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { Select } from "@/components/ui/Input";
import { KonsilTable } from "@/components/konsile/KonsilTable";
import type { KonsilStatus, Urgency, BodyRegionId } from "@/types/konsil";
import { STATUS_LABELS, URGENCY_LABELS, BODY_REGION_LABELS } from "@/utils/constants";
import { EmptyState } from "@/components/ui/EmptyState";

export default function ExpertKonsileListPage() {
  const { konsile, loading } = useKonsile();
  const { patients } = usePatients();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"all" | KonsilStatus>("all");
  const [urgency, setUrgency] = useState<"all" | Urgency>("all");
  const [region, setRegion] = useState<"all" | BodyRegionId>("all");

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    return konsile.filter((k) => {
      const p = patients.find((p) => p.id === k.patientId);
      const matchesQ =
        !t ||
        k.id.toLowerCase().includes(t) ||
        k.reason.toLowerCase().includes(t) ||
        k.clinicalDescription.toLowerCase().includes(t) ||
        (p && `${p.firstName} ${p.lastName}`.toLowerCase().includes(t));
      const matchesStatus = status === "all" || k.status === status;
      const matchesUrgency = urgency === "all" || k.urgency === urgency;
      const matchesRegion = region === "all" || k.selectedBodyRegions.includes(region);
      return matchesQ && matchesStatus && matchesUrgency && matchesRegion;
    });
  }, [konsile, patients, q, status, urgency, region]);

  return (
    <>
      <PageHeader
        title="Eingehende Konsile"
        description="Anfragen aus angeschlossenen hausärztlichen Praxen."
      />

      <Card className="mb-4">
        <CardBody className="flex flex-col md:flex-row gap-3 md:items-center flex-wrap">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Suche…"
              className="w-full h-10 pl-9 pr-3 rounded-md border border-ink-200 bg-white text-sm focus-ring focus:border-brand-500"
            />
          </div>
          <Select value={status} onChange={(e) => setStatus(e.target.value as any)} className="md:w-44">
            <option value="all">Alle Status</option>
            {Object.entries(STATUS_LABELS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </Select>
          <Select value={urgency} onChange={(e) => setUrgency(e.target.value as any)} className="md:w-44">
            <option value="all">Alle Dringlichkeiten</option>
            {Object.entries(URGENCY_LABELS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </Select>
          <Select value={region} onChange={(e) => setRegion(e.target.value as any)} className="md:w-52">
            <option value="all">Alle Regionen</option>
            {Object.entries(BODY_REGION_LABELS).map(([k, v]) => (
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
          basePath="/expert/konsile"
          empty={
            <EmptyState
              icon={<FileText className="w-5 h-5" />}
              title="Keine Konsile gefunden"
              description="Bitte passen Sie die Filter an."
            />
          }
        />
      )}
    </>
  );
}

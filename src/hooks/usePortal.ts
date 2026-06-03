import { useCallback, useEffect, useState } from "react";
import { patientSummaryService } from "@/services/patientSummaryService";
import type { PatientSummary } from "@/types/portal";

export function usePatientSummaries(patientId: string | undefined) {
  const [summaries, setSummaries] = useState<PatientSummary[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!patientId) {
      setSummaries([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setSummaries(await patientSummaryService.listForPatient(patientId));
    setLoading(false);
  }, [patientId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { summaries, loading, refresh };
}

export function usePatientSummary(konsilId: string | undefined) {
  const [summary, setSummary] = useState<PatientSummary | undefined>();
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!konsilId) return;
    setLoading(true);
    setSummary(await patientSummaryService.getForKonsil(konsilId));
    setLoading(false);
  }, [konsilId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { summary, loading, refresh, setSummary };
}

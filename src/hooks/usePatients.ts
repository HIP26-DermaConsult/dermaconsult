import { useCallback, useEffect, useState } from "react";
import { patientService } from "@/services/patientService";
import type { Patient } from "@/types/patient";

export function usePatients() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const data = await patientService.list();
    setPatients(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { patients, loading, refresh, setPatients };
}

export function usePatient(id: string | undefined) {
  const [patient, setPatient] = useState<Patient | undefined>();
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setPatient(await patientService.get(id));
    setLoading(false);
  }, [id]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { patient, loading, refresh, setPatient };
}

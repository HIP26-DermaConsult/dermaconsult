import { useCallback, useEffect, useState } from "react";
import { konsilService } from "@/services/konsilService";
import type { Konsil } from "@/types/konsil";

export function useKonsile() {
  const [konsile, setKonsile] = useState<Konsil[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const data = await konsilService.list();
    setKonsile(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { konsile, loading, refresh, setKonsile };
}

export function useKonsil(id: string | undefined) {
  const [konsil, setKonsil] = useState<Konsil | undefined>();
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    const data = await konsilService.get(id);
    setKonsil(data);
    setLoading(false);
  }, [id]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { konsil, loading, refresh, setKonsil };
}

import { useCallback, useEffect, useState } from "react";
import { dataRequestService } from "@/services/dataRequestService";
import type { DataRequest } from "@/types/portal";

export function useDataRequests(konsilId: string | undefined) {
  const [requests, setRequests] = useState<DataRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!konsilId) {
      setRequests([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setRequests(await dataRequestService.listForKonsil(konsilId));
    setLoading(false);
  }, [konsilId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { requests, loading, refresh };
}

import { useCallback, useEffect, useMemo, useState } from "react";
import { konsilUploadService } from "@/services/konsilUploadService";
import type { KonsilUpload } from "@/types/konsil";

export function useKonsilUploads(konsilId: string | undefined) {
  const [uploads, setUploads] = useState<KonsilUpload[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!konsilId) {
      setUploads([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      setUploads(await konsilUploadService.listForKonsil(konsilId));
    } catch {
      setUploads([]);
    } finally {
      setLoading(false);
    }
  }, [konsilId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const needsReview = useMemo(
    () => uploads.some((upload) => upload.source === "patient" && !upload.reviewedByHausarzt),
    [uploads]
  );

  return { uploads, loading, needsReview, refresh, setUploads };
}

import type { Konsil } from "@/types/konsil";

export function uploadTokenForKonsilId(konsilId: string): string {
  return `konsil-${konsilId}`;
}

export function ensureKonsilUploadToken<T extends Pick<Konsil, "id"> & { uploadToken?: string }>(
  konsil: T
): T & { uploadToken: string } {
  return {
    ...konsil,
    uploadToken: konsil.uploadToken || uploadTokenForKonsilId(konsil.id),
  };
}

export function lanUploadUrlForToken(token: string, origin?: string): string {
  const configured = import.meta.env.VITE_PUBLIC_APP_ORIGIN;
  const resolvedOrigin = configured || origin || window.location.origin;
  return `${resolvedOrigin}/upload/konsil/${token}`;
}

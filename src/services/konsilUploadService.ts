import type { ImageAttachment, KonsilUpload, KonsilUploadSource } from "@/types/konsil";

const API_BASE = import.meta.env.VITE_UPLOAD_API_BASE ?? "";

export interface KonsilUploadTarget {
  token: string;
  konsilId: string;
}

export interface NetworkInfo {
  lanIp: string;
  appOrigin: string;
  apiBase: string;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, init);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export const konsilUploadService = {
  apiBase: API_BASE,

  async getTarget(token: string): Promise<KonsilUploadTarget> {
    return request<KonsilUploadTarget>(`/api/konsil-upload/${encodeURIComponent(token)}`);
  },

  async getNetworkInfo(): Promise<NetworkInfo> {
    return request<NetworkInfo>("/api/network-info");
  },

  async listForKonsil(konsilId: string): Promise<KonsilUpload[]> {
    return request<KonsilUpload[]>(`/api/konsile/${encodeURIComponent(konsilId)}/uploads`);
  },

  async submit(token: string, input: { files: File[]; note?: string; source: KonsilUploadSource }) {
    const form = new FormData();
    input.files.forEach((file) => form.append("images", file));
    if (input.note) form.append("note", input.note);
    form.append("source", input.source);
    return request<KonsilUpload>(`/api/konsil-upload/${encodeURIComponent(token)}`, {
      method: "POST",
      body: form,
    });
  },

  async markReviewed(konsilId: string): Promise<KonsilUpload[]> {
    return request<KonsilUpload[]>(`/api/konsile/${encodeURIComponent(konsilId)}/uploads/reviewed`, {
      method: "POST",
    });
  },

  async pollSession(sessionToken: string): Promise<ImageAttachment[]> {
    return request<ImageAttachment[]>(
      `/api/session-upload/${encodeURIComponent(sessionToken)}`
    );
  },
};

export function absoluteImageUrl(image: ImageAttachment): string | undefined {
  if (!image.url) return image.previewUrl;
  if (/^https?:\/\//.test(image.url)) return image.url;
  return `${API_BASE}${image.url}`;
}

const BASE_URL = "https://mveiamyvneyjvbrnjssd.supabase.co/functions/v1";
const ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im12ZWlhbXl2bmV5anZicm5qc3NkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEyNjg4MzksImV4cCI6MjA4Njg0NDgzOX0.VUnj8P3X0VgiJCgPiF2EFGQiRwpThd0mqg_NeyUizuk";

const headers = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${ANON_KEY}`,
};

async function post<T = unknown>(path: string, body: object): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`[${path}] ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

// ── Session ────────────────────────────────────────────────────────────────

export interface CreateSessionResponse {
  session_id: string;
}

export async function createSession(originUrl: string): Promise<string> {
  const data = await post<CreateSessionResponse>("/create_session", {
    origin_url: originUrl,
  });
  return data.session_id;
}

// ── Step update ────────────────────────────────────────────────────────────

export type StepPayload =
  | { session_id: string; current_step: "SIZE"; size: string }
  | { session_id: string; current_step: "COLORS"; frame_prefix: string; background_name: string }
  | { session_id: string; current_step: "UPLOAD" };

export async function updateSessionStep(payload: StepPayload): Promise<void> {
  await post("/update_session_step", payload);
}

// ── Upload URLs ────────────────────────────────────────────────────────────

export interface UploadUrlEntry {
  idx: number;
  signed_url: string;
  path: string;
}

export interface CreateUploadUrlsResponse {
  uploads: UploadUrlEntry[];
}

export async function createUploadUrls(
  sessionId: string,
  files: { ext: string }[]
): Promise<UploadUrlEntry[]> {
  const data = await post<CreateUploadUrlsResponse>("/create_upload_urls", {
    session_id: sessionId,
    files,
  });
  return data.uploads;
}

export async function uploadFileToSignedUrl(
  signedUrl: string,
  file: File,
  onProgress: (pct: number) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", signedUrl);
    xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve();
      else reject(new Error(`Upload failed: ${xhr.status}`));
    };
    xhr.onerror = () => reject(new Error("Upload network error"));
    xhr.send(file);
  });
}

// ── Finalize ───────────────────────────────────────────────────────────────

export interface FinalizePayload {
  session_id: string;
  first_name: string;
  last_name: string;
  whatsapp_full: string | null;
  email: string | null;
}

export interface FinalizeResponse {
  entry_number?: number;
  lifecycle_status?: string;
}

export async function finalizeSession(payload: FinalizePayload): Promise<FinalizeResponse> {
  return post<FinalizeResponse>("/finalize_session", payload);
}

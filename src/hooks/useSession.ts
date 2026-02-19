import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

const SESSION_KEY = "lobly_session_id";
const BASE_URL = `https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.supabase.co/functions/v1`;

async function callEdge<T>(path: string, body: object): Promise<T> {
  const { data: { session } } = await supabase.auth.getSession();
  const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  const token = session?.access_token ?? anonKey;

  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
      "apikey": anonKey,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Edge function ${path} failed (${res.status}): ${text}`);
  }

  return res.json() as Promise<T>;
}

export interface UploadUrlEntry {
  idx: number;
  signed_url: string;
  path: string;
}

interface UseSessionReturn {
  sessionId: string | null;
  sessionReady: boolean;
  updateStep: (payload: Record<string, unknown>) => Promise<void>;
  getUploadUrls: (files: { ext: string }[]) => Promise<UploadUrlEntry[]>;
  finalizeSession: (payload: {
    first_name: string;
    last_name: string;
    whatsapp_full?: string | null;
    email?: string | null;
  }) => Promise<{ success: boolean; entry_number?: number }>;
}

export function useSession(): UseSessionReturn {
  const [sessionId, setSessionId] = useState<string | null>(() =>
    typeof window !== "undefined" ? localStorage.getItem(SESSION_KEY) : null
  );
  const [sessionReady, setSessionReady] = useState(false);
  const creatingRef = useRef(false);

  // Create session on first render (or reuse from localStorage)
  useEffect(() => {
    if (sessionId) {
      setSessionReady(true);
      return;
    }
    if (creatingRef.current) return;
    creatingRef.current = true;

    callEdge<{ session_id: string }>("/create_session", {
      origin_url: window.location.href,
    })
      .then(({ session_id }) => {
        localStorage.setItem(SESSION_KEY, session_id);
        setSessionId(session_id);
        setSessionReady(true);
      })
      .catch((err) => {
        console.warn("create_session failed:", err);
        // Allow app to continue without session
        setSessionReady(true);
      });
  }, [sessionId]);

  const updateStep = useCallback(
    async (payload: Record<string, unknown>) => {
      if (!sessionId) return;
      try {
        await callEdge("/update_session_step", { session_id: sessionId, ...payload });
      } catch (err) {
        console.warn("update_session_step failed:", err);
      }
    },
    [sessionId]
  );

  const getUploadUrls = useCallback(
    async (files: { ext: string }[]): Promise<UploadUrlEntry[]> => {
      if (!sessionId) return [];
      const data = await callEdge<{ urls: UploadUrlEntry[] }>("/create_upload_urls", {
        session_id: sessionId,
        files,
      });
      return data.urls ?? [];
    },
    [sessionId]
  );

  const finalizeSession = useCallback(
    async (payload: {
      first_name: string;
      last_name: string;
      whatsapp_full?: string | null;
      email?: string | null;
    }) => {
      if (!sessionId) throw new Error("No session");
      const result = await callEdge<{ success: boolean; entry_number?: number }>(
        "/finalize_session",
        { session_id: sessionId, ...payload }
      );
      // Clear session from localStorage on success
      if (result.success) {
        localStorage.removeItem(SESSION_KEY);
      }
      return result;
    },
    [sessionId]
  );

  return { sessionId, sessionReady, updateStep, getUploadUrls, finalizeSession };
}

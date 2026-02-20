import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

const SESSION_KEY = "lobly_session_id";

async function callEdge<T>(functionName: string, body: object): Promise<T> {
  const { data, error } = await supabase.functions.invoke(functionName, { body });
  if (error) throw new Error(`Edge function ${functionName} failed: ${error.message}`);
  return data as T;
}

async function createNewSession(): Promise<string> {
  const { session_id } = await callEdge<{ session_id: string }>("create_session", {
    origin_url: window.location.href,
  });
  localStorage.setItem(SESSION_KEY, session_id);
  return session_id;
}

async function resolveSessionId(): Promise<string | null> {
  const stored = localStorage.getItem(SESSION_KEY);

  if (stored) {
    // Verify if the existing session is still in START status
    const { data, error } = await supabase
      .from("builder_sessions")
      .select("lifecycle_status")
      .eq("session_id", stored)
      .maybeSingle();

    if (!error && data?.lifecycle_status === "START") {
      // Session is still active — reuse it
      return stored;
    }

    // Session not found or not in START — clear and create new
    localStorage.removeItem(SESSION_KEY);
  }

  // No valid session — create a new one
  return createNewSession();
}

export interface UploadUrlEntry {
  idx: number;
  path: string;
  token: string;
}

interface FinalizePayload {
  first_name: string;
  last_name: string;
  country_code?: string | null;
  dial_code?: string | null;
  whatsapp_number?: string | null;
  email?: string | null;
  honeypot?: string | null;
}

interface UseSessionReturn {
  sessionId: string | null;
  sessionReady: boolean;
  updateStep: (payload: Record<string, unknown>) => Promise<void>;
  getUploadUrls: (files: { ext: string }[]) => Promise<UploadUrlEntry[]>;
  finalizeSession: (payload: FinalizePayload) => Promise<{ success: boolean; entry_number?: number; error_code?: string; error?: string }>;
}

export function useSession(): UseSessionReturn {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionReady, setSessionReady] = useState(false);
  const initRef = useRef(false);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    resolveSessionId()
      .then((id) => {
        setSessionId(id);
        setSessionReady(true);
      })
      .catch((err) => {
        console.warn("Session init failed:", err);
        setSessionReady(true);
      });
  }, []);

  const updateStep = useCallback(
    async (payload: Record<string, unknown>) => {
      if (!sessionId) return;
      try {
        await callEdge("update_session_step", { session_id: sessionId, ...payload });
      } catch (err) {
        console.warn("update_session_step failed:", err);
      }
    },
    [sessionId]
  );

  const getUploadUrls = useCallback(
    async (files: { ext: string; size?: number }[]): Promise<UploadUrlEntry[]> => {
      if (!sessionId) return [];
      const data = await callEdge<{ uploads: UploadUrlEntry[] }>("create_upload_urls", {
        session_id: sessionId,
        files,
      });
      return data.uploads ?? [];
    },
    [sessionId]
  );

  const finalizeSession = useCallback(
    async (payload: FinalizePayload): Promise<{ success: boolean; entry_number?: number; error_code?: string; error?: string }> => {
      if (!sessionId) throw new Error("No session");

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const res = await fetch(`${supabaseUrl}/functions/v1/finalize_session`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: anonKey,
          Authorization: `Bearer ${anonKey}`,
        },
        body: JSON.stringify({
          session_id: sessionId,
          ...payload,
          honeypot: payload.honeypot ?? null,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        localStorage.removeItem(SESSION_KEY);
        return { success: true, entry_number: data.entry_number };
      }

      // Handle 409 Conflict — session may have already been finalized
      if (res.status === 409) {
        const { data: session } = await supabase
          .from("builder_sessions")
          .select("lifecycle_status, entry_number")
          .eq("session_id", sessionId)
          .maybeSingle();

        if (session?.lifecycle_status === "FINALIZED") {
          localStorage.removeItem(SESSION_KEY);
          return { success: true, entry_number: session.entry_number ?? data.entry_number };
        }

        // Not finalized — clear stale session so next attempt creates a fresh one
        localStorage.removeItem(SESSION_KEY);
        return {
          success: false,
          error_code: data.error_code ?? "SESSION_CONFLICT",
          error: data.error ?? "Session conflict",
        };
      }

      // Return error details without throwing — let the caller handle them
      return {
        success: false,
        error_code: data.error_code ?? undefined,
        error: data.error ?? undefined,
      };
    },
    [sessionId]
  );

  return { sessionId, sessionReady, updateStep, getUploadUrls, finalizeSession };
}

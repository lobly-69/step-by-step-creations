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

interface UseSessionReturn {
  sessionId: string | null;
  sessionReady: boolean;
  updateStep: (payload: Record<string, unknown>) => Promise<void>;
  getUploadUrls: (files: { ext: string }[]) => Promise<UploadUrlEntry[]>;
  finalizeSession: (payload: {
    first_name: string;
    last_name: string;
    country_code?: string | null;
    dial_code?: string | null;
    whatsapp_number?: string | null;
    email?: string | null;
  }) => Promise<{ success: boolean; entry_number?: number }>;
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
    async (files: { ext: string }[]): Promise<UploadUrlEntry[]> => {
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
    async (payload: {
      first_name: string;
      last_name: string;
      country_code?: string | null;
      dial_code?: string | null;
      whatsapp_number?: string | null;
      email?: string | null;
    }) => {
      if (!sessionId) throw new Error("No session");
      const result = await callEdge<{ success: boolean; entry_number?: number }>(
        "finalize_session",
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

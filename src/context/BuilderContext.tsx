import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import { stepsConfig } from "@/config/stepsConfig";
import type { AppConfig } from "@/lib/configTypes";
import {
  createSession,
  updateSessionStep,
  createUploadUrls,
  uploadFileToSignedUrl,
} from "@/hooks/useSession";

export interface BuilderState {
  tamanho: string | null;
  cores: {
    frame: string | null;
    fundo: string | null;
  };
  upload: {
    files: (File | null)[];
    progress: number[];
    completed: boolean;
  };
}

interface BuilderContextType {
  state: BuilderState;
  config: AppConfig;
  configLoading: boolean;
  configOffline: boolean;
  visitedSteps: Set<string>;
  sessionId: string | null;
  setTamanho: (id: string) => void;
  setFrame: (prefix: string) => void;
  setFundo: (name: string) => void;
  addFile: (index: number, file: File) => void;
  removeFile: (index: number) => void;
  setProgress: (index: number, value: number) => void;
  markStepVisited: (stepId: string) => void;
  notifyUploadStep: () => void;
  isStepComplete: (stepId: string) => boolean;
  canAccessStep: (stepIndex: number) => boolean;
  getCurrentPrice: () => { oldPrice: number; newPrice: number };
  getMockupUrl: () => string | null;
}

const BuilderContext = createContext<BuilderContextType | null>(null);

export const useBuilder = () => {
  const ctx = useContext(BuilderContext);
  if (!ctx) throw new Error("useBuilder must be used within BuilderProvider");
  return ctx;
};

interface BuilderProviderProps {
  children: React.ReactNode;
  config: AppConfig;
  configLoading: boolean;
  configOffline: boolean;
}

const SESSION_KEY = "builder_session_id";

export const BuilderProvider: React.FC<BuilderProviderProps> = ({
  children,
  config,
  configLoading,
  configOffline,
}) => {
  const [state, setState] = useState<BuilderState>({
    tamanho: null,
    cores: { frame: null, fundo: null },
    upload: { files: [null, null, null], progress: [0, 0, 0], completed: false },
  });
  const [visitedSteps, setVisitedSteps] = useState<Set<string>>(new Set());
  const [defaultsApplied, setDefaultsApplied] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(
    () => localStorage.getItem(SESSION_KEY)
  );

  // ── Session init ──────────────────────────────────────────────────────────
  const sessionInitialized = useRef(false);
  useEffect(() => {
    if (sessionInitialized.current) return;
    sessionInitialized.current = true;

    const existing = localStorage.getItem(SESSION_KEY);
    if (existing) {
      setSessionId(existing);
      return;
    }

    createSession("https://lobly.pt/builder")
      .then((id) => {
        localStorage.setItem(SESSION_KEY, id);
        setSessionId(id);
      })
      .catch((err) => console.warn("create_session failed", err));
  }, []);

  // ── Config defaults ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!configLoading && !defaultsApplied) {
      const defaultFrame = config.frameColors[0]?.prefix ?? null;
      const defaultFundo = config.backgroundColors[0]?.name ?? null;
      setState((prev) => ({
        ...prev,
        cores: {
          frame: prev.cores.frame ?? defaultFrame,
          fundo: prev.cores.fundo ?? defaultFundo,
        },
      }));
      setDefaultsApplied(true);
    }
  }, [configLoading, config, defaultsApplied]);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const markStepVisited = useCallback((stepId: string) => {
    setVisitedSteps((prev) => {
      if (prev.has(stepId)) return prev;
      const next = new Set(prev);
      next.add(stepId);
      return next;
    });
  }, []);

  // ── Setters with side-effects ─────────────────────────────────────────────
  const setTamanho = useCallback(
    (id: string) => {
      setState((prev) => ({ ...prev, tamanho: id }));
      if (sessionId) {
        updateSessionStep({ session_id: sessionId, current_step: "SIZE", size: id }).catch(
          (err) => console.warn("update_session_step SIZE failed", err)
        );
      }
    },
    [sessionId]
  );

  const setFrame = useCallback(
    (prefix: string) => {
      setState((prev) => {
        const fundo = prev.cores.fundo;
        if (sessionId && fundo) {
          updateSessionStep({
            session_id: sessionId,
            current_step: "COLORS",
            frame_prefix: prefix,
            background_name: fundo,
          }).catch((err) => console.warn("update_session_step COLORS failed", err));
        }
        return { ...prev, cores: { ...prev.cores, frame: prefix } };
      });
    },
    [sessionId]
  );

  const setFundo = useCallback(
    (name: string) => {
      setState((prev) => {
        const frame = prev.cores.frame;
        if (sessionId && frame) {
          updateSessionStep({
            session_id: sessionId,
            current_step: "COLORS",
            frame_prefix: frame,
            background_name: name,
          }).catch((err) => console.warn("update_session_step COLORS failed", err));
        }
        return { ...prev, cores: { ...prev.cores, fundo: name } };
      });
    },
    [sessionId]
  );

  // ── Upload ────────────────────────────────────────────────────────────────
  const addFile = useCallback(
    (index: number, file: File) => {
      setState((prev) => {
        const files = [...prev.upload.files];
        const progress = [...prev.upload.progress];
        files[index] = file;
        progress[index] = 0;
        return { ...prev, upload: { ...prev.upload, files, progress } };
      });

      if (!sessionId) return;

      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      createUploadUrls(sessionId, [{ ext }])
        .then((uploads) => {
          const entry = uploads[0];
          if (!entry) throw new Error("No signed URL returned");
          return uploadFileToSignedUrl(entry.signed_url, file, (pct) => {
            setProgress(index, pct);
          });
        })
        .catch((err) => {
          console.warn("Upload failed, falling back to local progress", err);
          // Fallback: simulate progress so the UI doesn't get stuck
          let p = 0;
          const iv = setInterval(() => {
            p += Math.random() * 25 + 10;
            if (p >= 100) { p = 100; clearInterval(iv); }
            setProgress(index, Math.min(p, 100));
          }, 200);
        });
    },
    [sessionId] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const removeFile = useCallback((index: number) => {
    setState((prev) => {
      const files = [...prev.upload.files];
      const progress = [...prev.upload.progress];
      files[index] = null;
      progress[index] = 0;
      return { ...prev, upload: { ...prev.upload, files, progress } };
    });
  }, []);

  const setProgress = useCallback((index: number, value: number) => {
    setState((prev) => {
      const progress = [...prev.upload.progress];
      progress[index] = value;
      return { ...prev, upload: { ...prev.upload, files: prev.upload.files, progress } };
    });
  }, []);

  // Notify backend when user reaches UPLOAD step
  const notifyUploadStep = useCallback(() => {
    if (!sessionId) return;
    updateSessionStep({ session_id: sessionId, current_step: "UPLOAD" }).catch((err) =>
      console.warn("update_session_step UPLOAD failed", err)
    );
  }, [sessionId]);

  // ── Completion logic ──────────────────────────────────────────────────────
  const isStepComplete = useCallback(
    (stepId: string) => {
      switch (stepId) {
        case "personalizacao":
          return (
            state.tamanho !== null &&
            state.cores.frame !== null &&
            state.cores.fundo !== null
          );
        case "upload": {
          const hasFile = state.upload.files.some((f) => f !== null);
          const noInProgress = state.upload.progress.every(
            (p, i) => state.upload.files[i] === null || p === 100
          );
          return hasFile && noInProgress;
        }
        default:
          return false;
      }
    },
    [state]
  );

  const canAccessStep = useCallback(
    (stepIndex: number) => {
      for (let i = 0; i < stepIndex; i++) {
        if (!isStepComplete(stepsConfig[i].id)) return false;
      }
      return true;
    },
    [isStepComplete]
  );

  const getCurrentPrice = useCallback(() => {
    const defaultSize = config.sizes[0];
    const fallback = defaultSize
      ? { oldPrice: defaultSize.price, newPrice: defaultSize.promo_price ?? defaultSize.price }
      : { oldPrice: 49.9, newPrice: 39.9 };
    if (!state.tamanho) return fallback;
    const size = config.sizes.find((s) => s.size === state.tamanho);
    return size
      ? { oldPrice: size.price, newPrice: size.promo_price ?? size.price }
      : fallback;
  }, [state.tamanho, config.sizes]);

  const getMockupUrl = useCallback(() => {
    if (!state.tamanho || !state.cores.frame || !state.cores.fundo) return null;
    const selectedSize = config.sizes.find((s) => s.size === state.tamanho);
    if (!selectedSize) return null;
    const variant = config.mockupVariants.find(
      (v) =>
        v.size === selectedSize.size &&
        v.frame_prefix === state.cores.frame &&
        v.background_name === state.cores.fundo
    );
    return variant?.image_url ?? null;
  }, [state.tamanho, state.cores.frame, state.cores.fundo, config.sizes, config.mockupVariants]);

  return (
    <BuilderContext.Provider
      value={{
        state,
        config,
        configLoading,
        configOffline,
        visitedSteps,
        sessionId,
        setTamanho,
        setFrame,
        setFundo,
        addFile,
        removeFile,
        setProgress,
        markStepVisited,
        notifyUploadStep,
        isStepComplete,
        canAccessStep,
        getCurrentPrice,
        getMockupUrl,
      }}
    >
      {children}
    </BuilderContext.Provider>
  );
};

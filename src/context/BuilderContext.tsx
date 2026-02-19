import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { stepsConfig } from "@/config/stepsConfig";
import type { AppConfig } from "@/lib/configTypes";
import { useSession, type UploadUrlEntry } from "@/hooks/useSession";

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
  isStepComplete: (stepId: string) => boolean;
  canAccessStep: (stepIndex: number) => boolean;
  getCurrentPrice: () => { oldPrice: number; newPrice: number };
  getMockupUrl: () => string | null;
  getUploadUrls: (files: { ext: string }[]) => Promise<UploadUrlEntry[]>;
  finalizeSession: (payload: {
    first_name: string;
    last_name: string;
    whatsapp_full?: string | null;
    email?: string | null;
  }) => Promise<{ success: boolean; entry_number?: number }>;
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

  const { sessionId, updateStep, getUploadUrls, finalizeSession } = useSession();

  // Apply color defaults once config is loaded (no size default)
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

  const markStepVisited = useCallback((stepId: string) => {
    setVisitedSteps((prev) => {
      if (prev.has(stepId)) return prev;
      const next = new Set(prev);
      next.add(stepId);
      return next;
    });
  }, []);

  const setTamanho = useCallback(
    (id: string) => {
      setState((prev) => ({ ...prev, tamanho: id }));
      updateStep({ current_step: "SIZE", size: id });
    },
    [updateStep]
  );

  const setFrame = useCallback(
    (prefix: string) => {
      setState((prev) => {
        const next = { ...prev, cores: { ...prev.cores, frame: prefix } };
        updateStep({
          current_step: "COLORS",
          frame_prefix: prefix,
          background_name: next.cores.fundo,
        });
        return next;
      });
    },
    [updateStep]
  );

  const setFundo = useCallback(
    (name: string) => {
      setState((prev) => {
        const next = { ...prev, cores: { ...prev.cores, fundo: name } };
        updateStep({
          current_step: "COLORS",
          frame_prefix: next.cores.frame,
          background_name: name,
        });
        return next;
      });
    },
    [updateStep]
  );

  const addFile = useCallback((index: number, file: File) => {
    setState((prev) => {
      const files = [...prev.upload.files];
      const progress = [...prev.upload.progress];
      files[index] = file;
      progress[index] = 0;
      return { ...prev, upload: { ...prev.upload, files, progress } };
    });
  }, []);

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
        isStepComplete,
        canAccessStep,
        getCurrentPrice,
        getMockupUrl,
        getUploadUrls,
        finalizeSession,
      }}
    >
      {children}
    </BuilderContext.Provider>
  );
};

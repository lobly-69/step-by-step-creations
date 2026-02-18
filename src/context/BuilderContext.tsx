import React, { createContext, useContext, useState, useCallback } from "react";
import { stepsConfig } from "@/config/stepsConfig";

export interface SizeOption {
  id: string;
  label: string;
  dimensions: string;
  oldPrice: number;
  newPrice: number;
}

export const sizeOptions: SizeOption[] = [
  { id: "20x30", label: "Discreto", dimensions: "20x30", oldPrice: 49.9, newPrice: 39.9 },
  { id: "30x40", label: "Equilibrado", dimensions: "30x40", oldPrice: 74.9, newPrice: 59.9 },
  { id: "40x50", label: "Impactante", dimensions: "40x50", oldPrice: 99.9, newPrice: 79.9 },
  { id: "70x50", label: "Marcante", dimensions: "70x50", oldPrice: 124.9, newPrice: 99.9 },
];

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
  visitedSteps: Set<string>;
  setTamanho: (id: string) => void;
  setFrame: (color: string) => void;
  setFundo: (color: string) => void;
  addFile: (index: number, file: File) => void;
  removeFile: (index: number) => void;
  setProgress: (index: number, value: number) => void;
  markStepVisited: (stepId: string) => void;
  isStepComplete: (stepId: string) => boolean;
  canAccessStep: (stepIndex: number) => boolean;
  getCurrentPrice: () => { oldPrice: number; newPrice: number };
}

const BuilderContext = createContext<BuilderContextType | null>(null);

export const useBuilder = () => {
  const ctx = useContext(BuilderContext);
  if (!ctx) throw new Error("useBuilder must be used within BuilderProvider");
  return ctx;
};

export const BuilderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<BuilderState>({
    tamanho: null,
    cores: { frame: null, fundo: null },
    upload: { files: [null, null, null], progress: [0, 0, 0], completed: false },
  });
  const [visitedSteps, setVisitedSteps] = useState<Set<string>>(new Set());

  const markStepVisited = useCallback((stepId: string) => {
    setVisitedSteps((prev) => {
      if (prev.has(stepId)) return prev;
      const next = new Set(prev);
      next.add(stepId);
      return next;
    });
  }, []);

  const setTamanho = useCallback((id: string) => {
    setState((prev) => ({ ...prev, tamanho: id }));
  }, []);

  const setFrame = useCallback((color: string) => {
    setState((prev) => ({ ...prev, cores: { ...prev.cores, frame: color } }));
  }, []);

  const setFundo = useCallback((color: string) => {
    setState((prev) => ({ ...prev, cores: { ...prev.cores, fundo: color } }));
  }, []);

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
        case "tamanho":
          return state.tamanho !== null;
        case "cores":
          return visitedSteps.has("cores");
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
    [state, visitedSteps]
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
    if (!state.tamanho) return { oldPrice: 49.9, newPrice: 39.9 };
    const size = sizeOptions.find((s) => s.id === state.tamanho);
    return size ? { oldPrice: size.oldPrice, newPrice: size.newPrice } : { oldPrice: 49.9, newPrice: 39.9 };
  }, [state.tamanho]);

  return (
    <BuilderContext.Provider
      value={{
        state,
        visitedSteps,
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
      }}
    >
      {children}
    </BuilderContext.Provider>
  );
};

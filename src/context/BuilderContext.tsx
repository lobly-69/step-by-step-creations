import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from "react";
import { stepsConfig } from "@/config/stepsConfig";
import type { AppConfig } from "@/lib/configTypes";
import { useSession } from "@/hooks/useSession";
import {
  type UploadSlot,
  createEmptySlots,
  compactSlots,
  activeSlotCount,
  uploadedSlotCount,
  hasUploadingSlots,
  firstEmptySlotIndex,
  availableSlotCount,
} from "@/lib/uploadSlots";

export interface BuilderState {
  tamanho: string | null;
  cores: {
    frame: string | null;
    fundo: string | null;
  };
}

interface BuilderContextType {
  state: BuilderState;
  config: AppConfig;
  configLoading: boolean;
  configOffline: boolean;
  visitedSteps: Set<string>;
  sessionId: string | null;
  noPhotos: boolean;
  setNoPhotos: (v: boolean) => void;
  setTamanho: (id: string) => void;
  setFrame: (prefix: string) => void;
  setFundo: (name: string) => void;
  // Slot-based uploads
  slots: UploadSlot[];
  startSlotUpload: (files: File[]) => void;
  deleteSlot: (slotIndex: number) => void;
  activeCount: number;
  uploadedCount: number;
  isUploading: boolean;
  availableCount: number;
  markStepVisited: (stepId: string) => void;
  isStepComplete: (stepId: string) => boolean;
  canAccessStep: (stepIndex: number) => boolean;
  currentPrice: { oldPrice: number; newPrice: number };
  getMockupUrl: () => string | null;
  updateStep: (payload: Record<string, unknown>) => Promise<void>;
  finalizeSession: (payload: {
    first_name: string;
    last_name: string;
    country_code?: string | null;
    dial_code?: string | null;
    whatsapp_number?: string | null;
    email?: string | null;
    honeypot?: string | null;
  }) => Promise<{ success: boolean; entry_number?: number; error_code?: string; error?: string }>;
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
  });
  const [visitedSteps, setVisitedSteps] = useState<Set<string>>(new Set());
  const [defaultsApplied, setDefaultsApplied] = useState(false);
  const [noPhotos, setNoPhotos] = useState(false);
  const [slots, setSlots] = useState<UploadSlot[]>(createEmptySlots());

  const { sessionId, updateStep, finalizeSession, callEdge } = useSession();

  // Apply color defaults once config is loaded
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

  // ── Slot-based upload functions ──

  const doSlotUpload = useCallback(
    async (file: File, slotIndex: number) => {
      if (!sessionId) return;

      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";

      // 1. Update slot to uploading
      setSlots((prev) =>
        prev.map((s) =>
          s.slotIndex === slotIndex
            ? {
                ...s,
                file,
                previewUrl: URL.createObjectURL(file),
                status: "uploading" as const,
                progress: 0,
                error: null,
              }
            : s
        )
      );

      try {
        // 2. Get signed URL from backend
        const data = await callEdge<{
          success: boolean;
          uploads: { path: string; token: string }[];
        }>("create_upload_urls", {
          session_id: sessionId,
          slot_index: slotIndex,
          files: [{ name: file.name, type: file.type || `image/${ext}`, size: file.size }],
        });

        const entry = data.uploads?.[0];
        if (!entry?.path || !entry?.token) throw new Error("No upload URL returned");

        // Update slot with path/token
        setSlots((prev) =>
          prev.map((s) =>
            s.slotIndex === slotIndex ? { ...s, path: entry.path, token: entry.token } : s
          )
        );

        // 3. Upload to storage
        const { supabase } = await import("@/integrations/supabase/client");
        const { error: uploadError } = await supabase.storage
          .from("builder")
          .uploadToSignedUrl(entry.path, entry.token, file, {
            contentType: file.type || "application/octet-stream",
            upsert: true,
          });

        if (uploadError) throw new Error(uploadError.message);

        // 4. Confirm upload
        await callEdge("confirm_upload", {
          session_id: sessionId,
          slot_index: slotIndex,
        });

        // 5. Mark as uploaded
        setSlots((prev) =>
          prev.map((s) =>
            s.slotIndex === slotIndex ? { ...s, status: "uploaded" as const, progress: 100 } : s
          )
        );
      } catch (err: unknown) {
        console.warn(`Slot ${slotIndex} upload failed:`, err);
        setSlots((prev) =>
          prev.map((s) =>
            s.slotIndex === slotIndex
              ? {
                  ...s,
                  status: "failed" as const,
                  progress: 0,
                  error: "Não conseguimos terminar o envio desta foto. Tenta novamente.",
                }
              : s
          )
        );
      }
    },
    [sessionId, callEdge]
  );

  const startSlotUpload = useCallback(
    (files: File[]) => {
      // Find empty slots and assign files
      const currentSlots = [...slots];
      const emptyIndices: number[] = [];
      for (const s of currentSlots) {
        if (s.status === "empty") emptyIndices.push(s.slotIndex);
      }

      const toUpload = files.slice(0, emptyIndices.length);

      // Pre-set slots as uploading
      const newSlots = currentSlots.map((s) => {
        const fileIdx = emptyIndices.indexOf(s.slotIndex);
        if (fileIdx >= 0 && fileIdx < toUpload.length) {
          return {
            ...s,
            file: toUpload[fileIdx],
            previewUrl: URL.createObjectURL(toUpload[fileIdx]),
            status: "uploading" as const,
            progress: 0,
            error: null,
          };
        }
        return s;
      });
      setSlots(newSlots);

      // Kick off uploads
      toUpload.forEach((file, i) => {
        doSlotUpload(file, emptyIndices[i]);
      });
    },
    [slots, doSlotUpload]
  );

  const deleteSlot = useCallback(
    async (slotIndex: number) => {
      if (!sessionId) return;

      try {
        await callEdge("delete_session_file", {
          session_id: sessionId,
          slot_index: slotIndex,
        });
      } catch (err) {
        console.warn("delete_session_file failed:", err);
      }

      // Revoke preview URL
      const slot = slots.find((s) => s.slotIndex === slotIndex);
      if (slot?.previewUrl) {
        URL.revokeObjectURL(slot.previewUrl);
      }

      // Remove slot and compact
      setSlots((prev) => {
        const updated = prev.map((s) =>
          s.slotIndex === slotIndex
            ? { ...s, file: null, previewUrl: null, status: "empty" as const, path: null, token: null, error: null, progress: 0 }
            : s
        );
        return compactSlots(updated);
      });
    },
    [sessionId, callEdge, slots]
  );

  // Derived values
  const activeCount = useMemo(() => activeSlotCount(slots), [slots]);
  const _uploadedCount = useMemo(() => uploadedSlotCount(slots), [slots]);
  const isUploading = useMemo(() => hasUploadingSlots(slots), [slots]);
  const _availableCount = useMemo(() => availableSlotCount(slots), [slots]);

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
          // At least 1 uploaded and nothing currently uploading
          return uploadedSlotCount(slots) >= 1 && !hasUploadingSlots(slots);
        }
        default:
          return false;
      }
    },
    [state, slots]
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

  const currentPrice = useMemo(() => {
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
    if (!state.cores.frame || !state.cores.fundo) return null;
    const sizeKey = state.tamanho ?? config.sizes[0]?.size ?? null;
    if (!sizeKey) return null;
    const selectedSize = config.sizes.find((s) => s.size === sizeKey);
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
        noPhotos,
        setNoPhotos,
        setTamanho,
        setFrame,
        setFundo,
        slots,
        startSlotUpload,
        deleteSlot,
        activeCount,
        uploadedCount: _uploadedCount,
        isUploading,
        availableCount: _availableCount,
        markStepVisited,
        isStepComplete,
        canAccessStep,
        currentPrice,
        getMockupUrl,
        updateStep,
        finalizeSession,
      }}
    >
      {children}
    </BuilderContext.Provider>
  );
};

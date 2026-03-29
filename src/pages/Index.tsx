import { useState, useEffect, useCallback, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { BuilderProvider, useBuilder } from "@/context/BuilderContext";
import { useAppConfig } from "@/hooks/useAppConfig";
import { stepsConfig } from "@/config/stepsConfig";
import BuilderLayout from "@/components/builder/BuilderLayout";
import StepPersonalizacao from "@/components/builder/StepPersonalizacao";
import StepUpload from "@/components/builder/StepUpload";
import FinalModal from "@/components/builder/FinalModal";

const BuilderWizard = () => {
  const {
    isStepComplete, canAccessStep, markStepVisited, configOffline,
    getMockupUrl, setNoPhotos, activeCount, uploadedCount, isUploading, slots,
  } = useBuilder();
  const location = useLocation();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [prevMockupUrl, setPrevMockupUrl] = useState<string | null>(null);

  // Auto-open modal state
  const autoOpenTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoOpenFiredRef = useRef(false);
  const prevActiveCountRef = useRef(0);

  const currentRoute = location.pathname.replace("/", "") || stepsConfig[0].route;
  const currentStepIndex = stepsConfig.findIndex((s) => s.route === currentRoute);
  const validIndex = currentStepIndex >= 0 ? currentStepIndex : 0;

  // Show offline toast once
  useEffect(() => {
    if (configOffline) {
      setToastMsg("Sem ligação. A mostrar versão offline.");
    }
  }, [configOffline]);

  // Check for unavailable mockup combination
  const mockupUrl = getMockupUrl();
  useEffect(() => {
    if (prevMockupUrl !== null && mockupUrl === null && prevMockupUrl !== null) {
      setToastMsg(null);
      setTimeout(() => setToastMsg("Combinação indisponível"), 10);
    }
    if (mockupUrl !== null) {
      setPrevMockupUrl(mockupUrl);
    }
  }, [mockupUrl, prevMockupUrl]);

  useEffect(() => {
    if (currentStepIndex < 0 || !canAccessStep(currentStepIndex)) {
      let idx = 0;
      for (let i = 0; i < stepsConfig.length; i++) {
        if (canAccessStep(i)) {
          idx = i;
          if (!isStepComplete(stepsConfig[i].id)) break;
        }
      }
      navigate(`/${stepsConfig[idx].route}`, { replace: true });
    }
  }, [currentStepIndex, canAccessStep, isStepComplete, navigate]);

  // ── Auto-open modal logic ──
  useEffect(() => {
    // Detect new upload started (activeCount increased)
    if (activeCount > prevActiveCountRef.current) {
      // New upload initiated - reset auto-open flag and set timer
      autoOpenFiredRef.current = false;

      // Clear any existing timer
      if (autoOpenTimerRef.current) {
        clearTimeout(autoOpenTimerRef.current);
        autoOpenTimerRef.current = null;
      }

      const delay = activeCount >= 3 ? 6000 : 15000;

      autoOpenTimerRef.current = setTimeout(() => {
        if (!autoOpenFiredRef.current && !modalOpen) {
          autoOpenFiredRef.current = true;
          setModalOpen(true);
        }
        autoOpenTimerRef.current = null;
      }, delay);
    }

    prevActiveCountRef.current = activeCount;
  }, [activeCount, modalOpen]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (autoOpenTimerRef.current) clearTimeout(autoOpenTimerRef.current);
    };
  }, []);

  const showToast = useCallback((msg: string) => {
    setToastMsg(null);
    setTimeout(() => setToastMsg(msg), 10);
  }, []);

  const handleAdvance = useCallback(() => {
    const step = stepsConfig[validIndex];

    if (step.id === "personalizacao" && !isStepComplete(step.id)) {
      showToast("Escolhe as cores e o tamanho para continuar.");
      const sizesSection = document.getElementById("section-tamanhos");
      if (sizesSection) {
        sizesSection.scrollIntoView({ behavior: "smooth", block: "center" });
        sizesSection.classList.add("ring-2", "ring-promo/50", "rounded-lg", "transition-all");
        setTimeout(() => {
          sizesSection.classList.remove("ring-2", "ring-promo/50", "rounded-lg", "transition-all");
        }, 2000);
      }
      return;
    }

    if (step.id === "upload") {
      // Green button always opens modal if at least 1 active image
      if (activeCount >= 1) {
        // Cancel pending auto-open timer
        if (autoOpenTimerRef.current) {
          clearTimeout(autoOpenTimerRef.current);
          autoOpenTimerRef.current = null;
        }
        setModalOpen(true);
        return;
      }
      // No images at all
      showToast("Adiciona pelo menos 1 foto para continuares.");
      return;
    }

    markStepVisited(step.id);

    const nextIndex = validIndex + 1;
    if (nextIndex < stepsConfig.length) {
      navigate(`/${stepsConfig[nextIndex].route}`);
      setError(null);
    } else {
      setModalOpen(true);
    }
  }, [validIndex, isStepComplete, markStepVisited, navigate, showToast, activeCount]);

  const handleSkipPhotos = useCallback(() => {
    setNoPhotos(true);
    setModalOpen(true);
  }, [setNoPhotos]);

  const handleModalClose = useCallback(() => {
    setModalOpen(false);
    setNoPhotos(false);
    // Mark auto-open as fired so it won't reopen without a new upload
    autoOpenFiredRef.current = true;
  }, [setNoPhotos]);

  const handleStepClick = useCallback((index: number) => {
    navigate(`/${stepsConfig[index].route}`);
    setError(null);
  }, [navigate]);

  const stepComponents: Record<string, React.ReactNode> = {
    personalizacao: <StepPersonalizacao onError={setError} />,
    upload: <StepUpload onError={setError} onSkipPhotos={handleSkipPhotos} />,
  };

  return (
    <>
      <BuilderLayout
        currentStepIndex={validIndex}
        onAdvance={handleAdvance}
        onStepClick={handleStepClick}
        bottomLabel="Confirmar"
        toastMessage={toastMsg}
        onToastDismiss={() => setToastMsg(null)}
      >
        {stepComponents[stepsConfig[validIndex].id]}
      </BuilderLayout>
      <FinalModal isOpen={modalOpen} onClose={handleModalClose} />
    </>
  );
};


const Index = () => {
  const { config, loading, offline } = useAppConfig();

  return (
    <BuilderProvider config={config} configLoading={loading} configOffline={offline}>
      <BuilderWizard />
    </BuilderProvider>
  );
};

export default Index;

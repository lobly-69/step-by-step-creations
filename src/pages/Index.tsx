import { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { BuilderProvider, useBuilder } from "@/context/BuilderContext";
import { useAppConfig } from "@/hooks/useAppConfig";
import { stepsConfig } from "@/config/stepsConfig";
import BuilderLayout from "@/components/builder/BuilderLayout";
import StepPersonalizacao from "@/components/builder/StepPersonalizacao";
import StepUpload from "@/components/builder/StepUpload";
import FinalModal from "@/components/builder/FinalModal";

const BuilderWizard = () => {
  const { isStepComplete, canAccessStep, markStepVisited, configOffline, getMockupUrl } = useBuilder();
  const location = useLocation();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [prevMockupUrl, setPrevMockupUrl] = useState<string | null>(null);

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

  const showToast = useCallback((msg: string) => {
    setToastMsg(null);
    setTimeout(() => setToastMsg(msg), 10);
  }, []);

  const handleAdvance = useCallback(() => {
    const step = stepsConfig[validIndex];

    if (step.id === "personalizacao" && !isStepComplete(step.id)) {
      showToast("Escolhe as cores e o tamanho para continuar.");
      return;
    }
    if (step.id === "upload" && !isStepComplete(step.id)) {
      showToast("Adiciona pelo menos 1 foto e aguarda o upload terminar para continuar.");
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
  }, [validIndex, isStepComplete, markStepVisited, navigate, showToast]);

  const handleStepClick = useCallback((index: number) => {
    navigate(`/${stepsConfig[index].route}`);
    setError(null);
  }, [navigate]);

  const stepComponents: Record<string, React.ReactNode> = {
    personalizacao: <StepPersonalizacao onError={setError} />,
    upload: <StepUpload onError={setError} />,
  };

  return (
    <>
      <BuilderLayout
        currentStepIndex={validIndex}
        onAdvance={handleAdvance}
        onStepClick={handleStepClick}
        bottomLabel={validIndex === stepsConfig.length - 1 ? "Finalizar" : "Avançar"}
        toastMessage={toastMsg}
        onToastDismiss={() => setToastMsg(null)}
      >
        {stepComponents[stepsConfig[validIndex].id]}
      </BuilderLayout>
      <FinalModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
};

const DebugBanner = ({ offline, fetchError }: { offline: boolean; fetchError: { message: string; statusCode?: number } | null }) => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "undefined";
  const anonKeyRaw = import.meta.env.VITE_SUPABASE_ANON_KEY;
  const anonKeyPrefix = anonKeyRaw ? anonKeyRaw.substring(0, 12) + "…" : "undefined";

  useEffect(() => {
    console.log("[DEBUG] Supabase config:", {
      supabaseUrl,
      anonKeyPrefix,
      isUsingFallback: offline,
      fetchError,
    });
  }, []);

  if (import.meta.env.PROD) return null;

  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 9999, background: "#1a1a2e", color: "#0f0", fontFamily: "monospace", fontSize: 11, padding: "6px 12px", display: "flex", gap: 16, flexWrap: "wrap", opacity: 0.92 }}>
      <span><b>URL:</b> {supabaseUrl}</span>
      <span><b>Key:</b> {anonKeyPrefix}</span>
      <span><b>Fallback:</b> {String(offline)}</span>
      {fetchError && <span style={{ color: "#f55" }}><b>Erro:</b> {fetchError.message}{fetchError.statusCode ? ` (${fetchError.statusCode})` : ""}</span>}
    </div>
  );
};

const Index = () => {
  const { config, loading, offline, fetchError } = useAppConfig();

  return (
    <>
      <DebugBanner offline={offline} fetchError={fetchError} />
      <BuilderProvider config={config} configLoading={loading} configOffline={offline}>
        <BuilderWizard />
      </BuilderProvider>
    </>
  );
};

export default Index;

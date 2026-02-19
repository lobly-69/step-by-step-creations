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


const Index = () => {
  const { config, loading, offline } = useAppConfig();

  return (
    <BuilderProvider config={config} configLoading={loading} configOffline={offline}>
      <BuilderWizard />
    </BuilderProvider>
  );
};

export default Index;

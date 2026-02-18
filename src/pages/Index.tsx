import { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { BuilderProvider, useBuilder } from "@/context/BuilderContext";
import { stepsConfig } from "@/config/stepsConfig";
import BuilderLayout from "@/components/builder/BuilderLayout";
import StepPersonalizacao from "@/components/builder/StepPersonalizacao";
import StepUpload from "@/components/builder/StepUpload";
import FinalModal from "@/components/builder/FinalModal";

const BuilderWizard = () => {
  const { isStepComplete, canAccessStep, markStepVisited } = useBuilder();
  const location = useLocation();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const currentRoute = location.pathname.replace("/", "") || stepsConfig[0].route;
  const currentStepIndex = stepsConfig.findIndex((s) => s.route === currentRoute);
  const validIndex = currentStepIndex >= 0 ? currentStepIndex : 0;

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

const Index = () => (
  <BuilderProvider>
    <BuilderWizard />
  </BuilderProvider>
);

export default Index;

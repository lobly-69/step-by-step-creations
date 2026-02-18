import { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { BuilderProvider, useBuilder } from "@/context/BuilderContext";
import { stepsConfig } from "@/config/stepsConfig";
import BuilderLayout from "@/components/builder/BuilderLayout";
import StepTamanho from "@/components/builder/StepTamanho";
import StepCores from "@/components/builder/StepCores";
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
    // Force re-render to restart timer
    setTimeout(() => setToastMsg(msg), 10);
  }, []);

  const handleAdvance = useCallback(() => {
    const step = stepsConfig[validIndex];

    if (step.id === "tamanho" && !isStepComplete(step.id)) {
      showToast("Escolhe um tamanho para continuar.");
      return;
    }
    if (step.id === "upload" && !isStepComplete(step.id)) {
      showToast("Adiciona pelo menos 1 foto e aguarda o upload terminar para continuar.");
      return;
    }

    markStepVisited(step.id);

    const findNext = () => {
      for (let i = 0; i < stepsConfig.length; i++) {
        const sid = stepsConfig[i].id;
        if (sid === step.id) continue;
        if (sid === "cores") continue;
        if (sid === "tamanho" && !isStepComplete(sid)) return i;
        if (sid === "upload" && !isStepComplete(sid)) return i;
      }
      return -1;
    };

    const nextIncomplete = findNext();

    if (nextIncomplete === -1) {
      setModalOpen(true);
    } else {
      navigate(`/${stepsConfig[nextIncomplete].route}`);
      setError(null);
    }
  }, [validIndex, isStepComplete, markStepVisited, navigate, showToast]);

  const handleStepClick = useCallback((index: number) => {
    navigate(`/${stepsConfig[index].route}`);
    setError(null);
  }, [navigate]);

  const stepComponents: Record<string, React.ReactNode> = {
    tamanho: <StepTamanho onError={setError} />,
    cores: <StepCores onError={setError} />,
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

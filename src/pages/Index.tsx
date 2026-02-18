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
  const { isStepComplete, canAccessStep } = useBuilder();
  const location = useLocation();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const currentRoute = location.pathname.replace("/", "") || stepsConfig[0].route;
  const currentStepIndex = stepsConfig.findIndex((s) => s.route === currentRoute);
  const validIndex = currentStepIndex >= 0 ? currentStepIndex : 0;

  // Redirect to first allowed step if current is invalid or inaccessible
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

  const handleAdvance = useCallback(() => {
    const step = stepsConfig[validIndex];
    if (!isStepComplete(step.id)) {
      switch (step.id) {
        case "tamanho":
          setError("Escolhe um tamanho para continuar.");
          break;
        case "cores":
          setError("Escolhe o frame e o fundo para continuar.");
          break;
        case "upload":
          setError("Adiciona pelo menos 1 foto e aguarda o upload terminar para continuar.");
          break;
      }
      return;
    }

    // Find next incomplete step
    let nextIncomplete = -1;
    for (let i = 0; i < stepsConfig.length; i++) {
      if (!isStepComplete(stepsConfig[i].id)) {
        nextIncomplete = i;
        break;
      }
    }

    if (nextIncomplete === -1) {
      // All complete — open modal
      setModalOpen(true);
    } else {
      navigate(`/${stepsConfig[nextIncomplete].route}`);
      setError(null);
    }
  }, [validIndex, isStepComplete, navigate]);

  const handleBack = useCallback(() => {
    if (validIndex > 0) {
      navigate(`/${stepsConfig[validIndex - 1].route}`);
      setError(null);
    }
  }, [validIndex, navigate]);

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
        bottomLabel={validIndex === stepsConfig.length - 1 ? "Finalizar" : "Avancar"}
      >
        {error && (
          <div className="mt-2 rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2.5 text-sm text-destructive font-medium">
            {error}
          </div>
        )}
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

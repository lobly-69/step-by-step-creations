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

    // For steps with real validation (tamanho, upload), check completion
    // For optional steps (cores), just mark as visited
    if (step.id === "tamanho" && !isStepComplete(step.id)) {
      setError("Escolhe um tamanho para continuar.");
      return;
    }
    if (step.id === "upload" && !isStepComplete(step.id)) {
      setError("Adiciona pelo menos 1 foto e aguarda o upload terminar para continuar.");
      return;
    }

    // Mark current step as visited
    markStepVisited(step.id);

    // Find next incomplete step (after marking current as visited)
    const findNext = () => {
      for (let i = 0; i < stepsConfig.length; i++) {
        const sid = stepsConfig[i].id;
        if (sid === step.id) continue; // skip current, we just completed it
        if (sid === "cores") continue; // cores is optional, skip
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
  }, [validIndex, isStepComplete, markStepVisited, navigate]);

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

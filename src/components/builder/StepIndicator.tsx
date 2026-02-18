import { stepsConfig } from "@/config/stepsConfig";
import { useBuilder } from "@/context/BuilderContext";
import { Check, Lock } from "lucide-react";

interface StepIndicatorProps {
  currentStepIndex: number;
  onStepClick?: (index: number) => void;
}

const StepIndicator = ({ currentStepIndex, onStepClick }: StepIndicatorProps) => {
  const { isStepComplete, canAccessStep } = useBuilder();

  return (
    <div className="flex items-center justify-center gap-1 px-4 py-3">
      {stepsConfig.map((step, index) => {
        const completed = isStepComplete(step.id) && index !== currentStepIndex;
        const active = index === currentStepIndex;
        const locked = !canAccessStep(index);
        const clickable = !locked && !active && canAccessStep(index);

        return (
          <div key={step.id} className="flex items-center">
            {index > 0 && (
              <div
                className={`h-0.5 w-6 mx-1 transition-colors duration-200 ${
                  completed ? "bg-step-completed" : "bg-border"
                }`}
              />
            )}
            <div
              className={`flex items-center gap-1.5 ${clickable ? "cursor-pointer" : ""}`}
              onClick={() => clickable && onStepClick?.(index)}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-200 ${
                  completed
                    ? "bg-step-completed text-primary-foreground"
                    : active
                    ? "bg-primary text-primary-foreground"
                    : locked
                    ? "bg-step-locked text-primary-foreground"
                    : "bg-border text-muted-foreground"
                }`}
              >
                {completed ? (
                  <Check className="w-3.5 h-3.5" />
                ) : locked ? (
                  <Lock className="w-3 h-3" />
                ) : (
                  index + 1
                )}
              </div>
              <span
                className={`text-xs font-medium hidden sm:inline transition-colors duration-200 ${
                  active ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {step.label}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StepIndicator;

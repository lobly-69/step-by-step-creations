import React from "react";
import StepIndicator from "./StepIndicator";
import MockupImage from "./MockupImage";
import WarningBanner from "./WarningBanner";
import BottomBar from "./BottomBar";

interface BuilderLayoutProps {
  currentStepIndex: number;
  children: React.ReactNode;
  onAdvance: () => void;
  onBack?: () => void;
  onStepClick?: (index: number) => void;
  bottomLabel?: string;
}

const BuilderLayout = ({ currentStepIndex, children, onAdvance, onBack, onStepClick, bottomLabel }: BuilderLayoutProps) => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-full max-w-[600px] mx-auto md:my-6 md:rounded-2xl md:shadow-lg md:border md:border-border bg-card flex flex-col h-screen md:h-[min(92vh,900px)] overflow-hidden relative">
        <div className="flex-shrink-0">
          <StepIndicator currentStepIndex={currentStepIndex} onStepClick={onStepClick} />
          <MockupImage />
          <WarningBanner />
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">
          <div className="slide-step">{children}</div>
        </div>
        <div className="flex-shrink-0">
          <BottomBar onAdvance={onAdvance} onBack={onBack} buttonLabel={bottomLabel} showBack={currentStepIndex > 0} />
        </div>
      </div>
    </div>
  );
};

export default BuilderLayout;

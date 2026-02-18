import React from "react";
import StepIndicator from "./StepIndicator";
import MockupImage from "./MockupImage";
import WarningBanner from "./WarningBanner";
import BottomBar from "./BottomBar";

interface BuilderLayoutProps {
  currentStepIndex: number;
  children: React.ReactNode;
  onAdvance: () => void;
  bottomLabel?: string;
}

const BuilderLayout = ({ currentStepIndex, children, onAdvance, bottomLabel }: BuilderLayoutProps) => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      {/* Desktop card wrapper */}
      <div className="w-full max-w-[600px] mx-auto md:my-6 md:rounded-2xl md:shadow-lg md:border md:border-border bg-card flex flex-col h-screen md:h-[min(92vh,900px)] overflow-hidden relative">
        {/* ZONE 1: Fixed Header */}
        <div className="flex-shrink-0">
          <StepIndicator currentStepIndex={currentStepIndex} />
          <MockupImage />
          <WarningBanner />
        </div>

        {/* ZONE 2: Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          <div className="slide-step">{children}</div>
        </div>

        {/* ZONE 3: Fixed Bottom Bar */}
        <div className="flex-shrink-0">
          <BottomBar onAdvance={onAdvance} buttonLabel={bottomLabel} />
        </div>
      </div>
    </div>
  );
};

export default BuilderLayout;

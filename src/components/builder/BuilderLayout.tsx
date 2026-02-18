import React, { useState, useEffect, useCallback } from "react";
import StepIndicator from "./StepIndicator";
import MockupImage from "./MockupImage";
import WarningBanner from "./WarningBanner";
import BottomBar from "./BottomBar";
import { X } from "lucide-react";

interface BuilderLayoutProps {
  currentStepIndex: number;
  children: React.ReactNode;
  onAdvance: () => void;
  onStepClick?: (index: number) => void;
  bottomLabel?: string;
  toastMessage?: string | null;
  onToastDismiss?: () => void;
}

const BuilderLayout = ({ currentStepIndex, children, onAdvance, onStepClick, bottomLabel, toastMessage, onToastDismiss }: BuilderLayoutProps) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (toastMessage) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        onToastDismiss?.();
      }, 3000);
      return () => clearTimeout(timer);
    } else {
      setVisible(false);
    }
  }, [toastMessage, onToastDismiss]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-full max-w-[600px] mx-auto md:my-6 md:rounded-2xl md:shadow-lg md:border md:border-border bg-card flex flex-col h-screen md:h-[min(92vh,900px)] overflow-hidden relative">
        <div className="flex-shrink-0">
          <MockupImage />
          <WarningBanner />
          <StepIndicator currentStepIndex={currentStepIndex} onStepClick={onStepClick} />
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">
          <div className="slide-step">{children}</div>
        </div>

        {/* Toast above bottom bar */}
        {visible && toastMessage && (
          <div className="absolute bottom-[68px] left-3 right-3 z-50 bg-destructive text-destructive-foreground rounded-lg px-4 py-3 flex items-center justify-between shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-200">
            <span className="text-sm font-medium">{toastMessage}</span>
            <button
              onClick={() => { setVisible(false); onToastDismiss?.(); }}
              className="ml-3 flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <div className="flex-shrink-0">
          <BottomBar onAdvance={onAdvance} buttonLabel={bottomLabel} />
        </div>
      </div>
    </div>
  );
};

export default BuilderLayout;

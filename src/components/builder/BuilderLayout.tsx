import React, { useState, useEffect } from "react";
import StepIndicator from "./StepIndicator";
import MockupImage from "./MockupImage";
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
    <div className="min-h-[100dvh] bg-background flex items-center justify-center" style={{ minHeight: '100dvh' }}>
      <div className="w-full max-w-[600px] mx-auto md:my-6 md:rounded-2xl md:shadow-lg md:border md:border-border bg-card flex flex-col min-h-[100dvh] md:min-h-0 md:h-[min(92vh,900px)] relative">
        <div className="flex-shrink-0 sticky top-0 z-10 bg-card">
          <MockupImage />
          <StepIndicator currentStepIndex={currentStepIndex} onStepClick={onStepClick} />
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-3" style={{ paddingBottom: 'calc(70px + env(safe-area-inset-bottom, 0px))' }}>
          <div className="slide-step">{children}</div>
        </div>

        {/* Toast above bottom bar */}
        {visible && toastMessage && (
          <div className="fixed bottom-[calc(60px+env(safe-area-inset-bottom,0px))] left-3 right-3 max-w-[600px] mx-auto z-50 bg-destructive text-destructive-foreground rounded-lg px-4 py-3 flex items-center justify-between shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-200">
            <span className="text-sm font-medium">{toastMessage}</span>
            <button
              onClick={() => { setVisible(false); onToastDismiss?.(); }}
              className="ml-3 flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <div className="fixed bottom-0 left-0 right-0 z-40" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
          <div className="max-w-[600px] mx-auto">
            <BottomBar onAdvance={onAdvance} buttonLabel={bottomLabel} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuilderLayout;

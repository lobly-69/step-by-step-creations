import { useState } from "react";
import { useBuilder, sizeOptions } from "@/context/BuilderContext";

interface StepTamanhoProps {
  onError: (msg: string | null) => void;
}

const StepTamanho = ({ onError }: StepTamanhoProps) => {
  const { state, setTamanho } = useBuilder();

  return (
    <div>
      <h2 className="text-lg font-bold text-foreground mb-1">Escolhe o tamanho</h2>
      <p className="text-sm text-muted-foreground mb-4">O preco muda consoante o tamanho.</p>

      <div className="grid grid-cols-2 gap-3">
        {sizeOptions.map((opt) => {
          const selected = state.tamanho === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => {
                setTamanho(opt.id);
                onError(null);
              }}
              className={`relative rounded-xl border-2 p-4 text-left transition-all duration-200 ${
                selected
                  ? "border-primary bg-primary/5 shadow-md"
                  : "border-border bg-card hover:border-primary/40"
              }`}
            >
              {selected && (
                <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                    <path d="M5 13l4 4L19 7" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              )}
              <p className="text-sm font-semibold text-foreground">{opt.label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{opt.dimensions} cm</p>
              <div className="mt-2 flex items-baseline gap-1.5">
                <span className="text-xs text-muted-foreground line-through">
                  {opt.oldPrice.toFixed(2).replace(".", ",")}
                </span>
                <span className="text-base font-bold text-foreground">
                  {opt.newPrice.toFixed(2).replace(".", ",")}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default StepTamanho;

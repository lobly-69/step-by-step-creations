import { useBuilder } from "@/context/BuilderContext";

const frameColors = [
  { id: "preto", label: "Preto", hex: "#1a1a1a" },
  { id: "branco", label: "Branco", hex: "#ffffff" },
];

const fundoColors = [
  { id: "azul", label: "Azul", hex: "#4A7FB5" },
  { id: "amarelo", label: "Amarelo", hex: "#E8C840" },
  { id: "taupe", label: "Taupe", hex: "#B8A99A" },
  { id: "rosa", label: "Rosa", hex: "#E8A0BF" },
  { id: "laranja", label: "Laranja", hex: "#E8813A" },
  { id: "cinza", label: "Cinza", hex: "#9CA3AF" },
];

interface StepCoresProps {
  onError: (msg: string | null) => void;
}

const StepCores = ({ onError }: StepCoresProps) => {
  const { state, setFrame, setFundo } = useBuilder();

  return (
    <div>
      <h2 className="text-lg font-bold text-foreground mb-1">Escolhe as cores</h2>
      <p className="text-sm text-muted-foreground mb-5">Ve como fica antes de avancar.</p>

      <div className="mb-5">
        <p className="text-sm font-semibold text-foreground mb-2.5">Frame</p>
        <div className="flex gap-3">
          {frameColors.map((c) => {
            const selected = state.cores.frame === c.id;
            return (
              <button
                key={c.id}
                onClick={() => { setFrame(c.id); onError(null); }}
                className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border-2 transition-all duration-200 ${
                  selected ? "border-primary shadow-md" : "border-transparent hover:border-border"
                }`}
              >
                <div
                  className="w-12 h-12 rounded-full border border-border shadow-sm"
                  style={{ backgroundColor: c.hex }}
                />
                <span className="text-xs font-medium text-foreground">{c.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <p className="text-sm font-semibold text-foreground mb-2.5">Fundo</p>
        <div className="grid grid-cols-3 gap-3">
          {fundoColors.map((c) => {
            const selected = state.cores.fundo === c.id;
            return (
              <button
                key={c.id}
                onClick={() => { setFundo(c.id); onError(null); }}
                className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border-2 transition-all duration-200 ${
                  selected ? "border-primary shadow-md" : "border-transparent hover:border-border"
                }`}
              >
                <div
                  className="w-12 h-12 rounded-full border border-border shadow-sm"
                  style={{ backgroundColor: c.hex }}
                />
                <span className="text-xs font-medium text-foreground">{c.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default StepCores;

import { useBuilder } from "@/context/BuilderContext";

const frameColors = [
  { id: "preto", hex: "#1a1a1a" },
  { id: "branco", hex: "#ffffff" },
];

const fundoColors = [
  { id: "azul", hex: "#4A7FB5" },
  { id: "amarelo", hex: "#E8C840" },
  { id: "taupe", hex: "#B8A99A" },
  { id: "rosa", hex: "#E8A0BF" },
  { id: "laranja", hex: "#E8813A" },
  { id: "cinza", hex: "#9CA3AF" },
];

interface StepCoresProps {
  onError: (msg: string | null) => void;
}

const StepCores = ({ onError }: StepCoresProps) => {
  const { state, setFrame, setFundo } = useBuilder();

  return (
    <div>
      <h2 className="text-lg font-bold text-foreground mb-1">Escolhe as cores</h2>
      <p className="text-sm text-muted-foreground mb-5">Vê como fica antes de avançar.</p>

      <div className="mb-5">
        <p className="text-sm font-semibold text-foreground mb-2.5">Frame</p>
        <div className="flex gap-2">
          {frameColors.map((c) => {
            const selected = state.cores.frame === c.id;
            return (
              <button
                key={c.id}
                onClick={() => { setFrame(c.id); onError(null); }}
                className={`w-14 h-10 rounded-lg border-2 transition-all duration-200 ${
                  selected ? "border-promo ring-2 ring-promo/30 scale-105" : "border-border hover:border-primary/40"
                }`}
                style={{ backgroundColor: c.hex }}
              />
            );
          })}
        </div>
      </div>

      <div>
        <p className="text-sm font-semibold text-foreground mb-2.5">Fundo</p>
        <div className="flex flex-wrap gap-2">
          {fundoColors.map((c) => {
            const selected = state.cores.fundo === c.id;
            return (
              <button
                key={c.id}
                onClick={() => { setFundo(c.id); onError(null); }}
                className={`w-14 h-10 rounded-lg border-2 transition-all duration-200 ${
                  selected ? "border-promo ring-2 ring-promo/30 scale-105" : "border-border hover:border-primary/40"
                }`}
                style={{ backgroundColor: c.hex }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default StepCores;

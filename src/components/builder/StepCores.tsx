import { useBuilder } from "@/context/BuilderContext";

interface StepCoresProps {
  onError: (msg: string | null) => void;
}

const StepCores = ({ onError }: StepCoresProps) => {
  const { state, config, setFrame, setFundo } = useBuilder();

  return (
    <div>
      <h2 className="text-lg font-bold text-foreground mb-1">Escolhe as cores</h2>
      <p className="text-sm text-muted-foreground mb-5">Vê como fica antes de avançar.</p>

      <div className="mb-5">
        <p className="text-sm font-semibold text-foreground mb-2.5">Frame</p>
        <div className="flex gap-2">
          {config.frameColors.map((c) => {
            const selected = state.cores.frame === c.prefix;
            return (
              <button
                key={c.id}
                onClick={() => { setFrame(c.prefix); onError(null); }}
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
          {config.backgroundColors.map((c) => {
            const selected = state.cores.fundo === c.name;
            return (
              <button
                key={c.name}
                onClick={() => { setFundo(c.name); onError(null); }}
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

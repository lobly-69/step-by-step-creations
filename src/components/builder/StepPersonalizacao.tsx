import { useBuilder, sizeOptions } from "@/context/BuilderContext";
import cardImg from "@/assets/card-tamanho.png";

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

interface StepPersonalizacaoProps {
  onError: (msg: string | null) => void;
}

const StepPersonalizacao = ({ onError }: StepPersonalizacaoProps) => {
  const { state, setFrame, setFundo, setTamanho } = useBuilder();

  return (
    <div>
      <h2 className="text-lg font-bold text-foreground mb-0.5">Personaliza o teu quadro</h2>
      <p className="text-sm text-muted-foreground mb-3">Escolhe cores e tamanho.</p>

      {/* Cores do Fundo */}
      <div className="mb-3">
        <p className="text-xs font-semibold text-foreground mb-1.5">Cor do Fundo:</p>
        <div className="grid grid-cols-6 gap-1.5">
          {fundoColors.map((c) => {
            const selected = state.cores.fundo === c.id;
            return (
              <button
                key={c.id}
                onClick={() => { setFundo(c.id); onError(null); }}
                className={`h-8 rounded-md border-2 transition-all duration-200 ${
                  selected ? "border-promo ring-2 ring-promo/30 scale-105" : "border-border hover:border-primary/40"
                }`}
                style={{ backgroundColor: c.hex }}
              />
            );
          })}
        </div>
      </div>

      {/* Cores da Moldura */}
      <div className="mb-4">
        <p className="text-xs font-semibold text-foreground mb-1.5">Cor da Moldura:</p>
        <div className="flex gap-1.5">
          {frameColors.map((c) => {
            const selected = state.cores.frame === c.id;
            return (
              <button
                key={c.id}
                onClick={() => { setFrame(c.id); onError(null); }}
                className={`w-12 h-8 rounded-md border-2 transition-all duration-200 ${
                  selected ? "border-promo ring-2 ring-promo/30 scale-105" : "border-border hover:border-primary/40"
                }`}
                style={{ backgroundColor: c.hex }}
              />
            );
          })}
        </div>
      </div>

      {/* Tamanhos */}
      <div>
        <p className="text-xs font-semibold text-foreground mb-1.5">Tamanho:</p>
        <div className="grid grid-cols-4 gap-1.5">
          {sizeOptions.map((opt) => {
            const selected = state.tamanho === opt.id;
            const discount = Math.round(((opt.oldPrice - opt.newPrice) / opt.oldPrice) * 100);

            return (
              <button
                key={opt.id}
                onClick={() => { setTamanho(opt.id); onError(null); }}
                className={`relative rounded-xl border-2 overflow-hidden transition-all duration-200 text-left ${
                  selected
                    ? "border-promo shadow-lg ring-2 ring-promo/30"
                    : "border-border bg-card hover:border-primary/40"
                }`}
              >
                <div className="relative">
                  <img src={cardImg} alt="" className="w-full aspect-square object-cover" />
                  <div className="absolute top-1 right-1 bg-promo text-promo-foreground text-[9px] font-bold px-1 py-0.5 rounded-md">
                    -{discount}%
                  </div>
                </div>
                <div className="p-1.5">
                  <p className="text-[10px] font-semibold text-foreground mb-0.5">Equilibrado</p>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-muted-foreground line-through">
                      {opt.oldPrice.toFixed(2).replace(".", ",")}€
                    </span>
                    <span className="text-sm font-bold text-foreground">
                      {opt.newPrice.toFixed(2).replace(".", ",")}€
                    </span>
                  </div>
                </div>
                {selected && (
                  <div className="absolute top-1 left-1 w-4 h-4 rounded-full bg-promo flex items-center justify-center">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                      <path d="M5 13l4 4L19 7" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default StepPersonalizacao;

import { useBuilder } from "@/context/BuilderContext";
import cardImg from "@/assets/card-tamanho.png";

interface StepPersonalizacaoProps {
  onError: (msg: string | null) => void;
}

const StepPersonalizacao = ({ onError }: StepPersonalizacaoProps) => {
  const { state, config, setFrame, setFundo, setTamanho } = useBuilder();

  const formatPrice = (price: number) =>
    price.toFixed(2).replace(".", ",") + "€";

  return (
    <div>
      <h2 className="text-base font-bold text-foreground leading-tight mb-0">Personaliza o teu quadro</h2>
      <p className="text-xs text-muted-foreground leading-tight mb-2">Escolhe cores e tamanho.</p>

      {/* Cores — moldura e fundo lado a lado */}
      <div className="grid grid-cols-5 gap-x-4 gap-y-1 mb-3 items-start">
        {/* Labels */}
        <p className="col-span-2 text-[10px] font-semibold text-foreground">Cor da Moldura:</p>
        <p className="col-span-3 text-[10px] font-semibold text-foreground">Cor do Fundo:</p>

        {/* Frame colors */}
        <div className="col-span-2 grid grid-cols-2 gap-1">
          {config.frameColors.map((c) => {
            const selected = state.cores.frame === c.prefix;
            return (
              <button
                key={c.id}
                onClick={() => { setFrame(c.prefix); onError(null); }}
                className={`h-9 rounded-lg border-2 transition-all duration-200 ${
                  selected ? "border-promo ring-2 ring-promo/30 scale-105" : "border-border hover:border-primary/40"
                }`}
                style={{ backgroundColor: c.hex }}
              />
            );
          })}
        </div>

        {/* Background colors */}
        <div className="col-span-3 grid grid-cols-3 gap-1">
          {config.backgroundColors.map((c) => {
            const selected = state.cores.fundo === c.name;
            return (
              <button
                key={c.name}
                onClick={() => { setFundo(c.name); onError(null); }}
                className={`h-9 rounded-lg border-2 transition-all duration-200 ${
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
        <p className="text-xs font-semibold text-foreground mb-1">Escolhe o Tamanho:</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5">
          {config.sizes.map((opt) => {
            const selected = state.tamanho === opt.size;

            return (
              <button
                key={opt.size}
                onClick={() => { setTamanho(opt.size); onError(null); }}
                className={`relative rounded-xl border-2 overflow-hidden transition-all duration-200 text-center ${
                  selected
                    ? "border-promo shadow-lg ring-2 ring-promo/30"
                    : "border-border bg-card hover:border-primary/40"
                }`}
              >
                <div className="relative">
                  <img src={opt.bg_img || cardImg} alt="" className="w-full aspect-square object-cover" />
                  <div className="absolute top-1 right-1 bg-promo text-promo-foreground text-[9px] font-bold px-1 py-0.5 rounded-md">
                    -{opt.discount}%
                  </div>
                  <div className="absolute bottom-1 right-1 bg-white/90 text-foreground text-[8px] font-semibold px-1.5 py-0.5 rounded-md">
                    {opt.label}
                  </div>
                </div>
                <div className="p-1.5">
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] text-muted-foreground line-through">
                      {formatPrice(opt.price)}
                    </span>
                    <span className="text-sm font-bold text-foreground">
                      {formatPrice(opt.promo_price)}
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

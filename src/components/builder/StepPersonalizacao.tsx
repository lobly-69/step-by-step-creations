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
      <div className="flex gap-[24px] mb-3 items-start">
        {/* Frame colors */}
        <div className="flex-[2]">
          <p className="text-xs font-semibold text-foreground mb-1">Moldura:</p>
          <div className="grid grid-cols-2 gap-1.5">
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
        </div>

        {/* Background colors */}
        <div className="flex-[5]">
          <p className="text-xs font-semibold text-foreground mb-1">Cor de Fundo:</p>
          <div className="grid grid-cols-5 gap-1.5">
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
                  <img src={opt.bg_img || cardImg} alt="" className="w-full aspect-square object-cover rounded-bl-lg" />
                  <div className="absolute top-0 right-0 w-10 h-6 bg-promo rounded-bl-[14px] flex items-start justify-end">
                    <span className="text-promo-foreground text-[11px] font-bold mt-[3px] mr-[5px]">-{opt.discount}%</span>
                  </div>
                  <div className="absolute bottom-1 right-1 bg-white/90 text-foreground text-[9px] font-semibold px-1.5 py-0.5 rounded-md">
                    {opt.label}
                  </div>
                </div>
                <div className="p-1.5">
                  <div className="flex flex-col items-center gap-0 leading-none">
                    <span className="text-[10px] text-muted-foreground line-through leading-none">
                      {formatPrice(opt.price)}
                    </span>
                    <span className="text-[15px] font-bold text-foreground leading-none mt-0.5">
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

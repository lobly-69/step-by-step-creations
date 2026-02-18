import { useBuilder, sizeOptions } from "@/context/BuilderContext";
import cardImg from "@/assets/card-tamanho.png";

interface StepTamanhoProps {
  onError: (msg: string | null) => void;
}

const StepTamanho = ({ onError }: StepTamanhoProps) => {
  const { state, setTamanho } = useBuilder();

  return (
    <div>
      <h2 className="text-lg font-bold text-foreground mb-1">Escolhe o tamanho</h2>
      <p className="text-sm text-muted-foreground mb-4">O preço muda consoante o tamanho.</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {sizeOptions.map((opt) => {
          const selected = state.tamanho === opt.id;
          const discount = Math.round(((opt.oldPrice - opt.newPrice) / opt.oldPrice) * 100);

          return (
            <button
              key={opt.id}
              onClick={() => {
                setTamanho(opt.id);
                onError(null);
              }}
              className={`relative rounded-xl border-2 overflow-hidden transition-all duration-200 text-left ${
                selected
                  ? "border-promo shadow-lg ring-2 ring-promo/30"
                  : "border-border bg-card hover:border-primary/40"
              }`}
            >
              <div className="relative">
                <img src={cardImg} alt="" className="w-full aspect-square object-cover" />
                <div className="absolute top-1.5 right-1.5 bg-promo text-promo-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                  -{discount}%
                </div>
              </div>
              <div className="p-2">
                <div className="flex items-baseline gap-1">
                  <span className="text-[11px] text-muted-foreground line-through">
                    {opt.oldPrice.toFixed(2).replace(".", ",")}€
                  </span>
                  <span className="text-sm font-bold text-foreground">
                    {opt.newPrice.toFixed(2).replace(".", ",")}€
                  </span>
                </div>
              </div>
              {selected && (
                <div className="absolute top-1.5 left-1.5 w-5 h-5 rounded-full bg-promo flex items-center justify-center">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                    <path d="M5 13l4 4L19 7" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default StepTamanho;

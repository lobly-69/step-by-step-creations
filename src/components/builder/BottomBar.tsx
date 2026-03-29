import { useBuilder } from "@/context/BuilderContext";
import { Check, Info } from "lucide-react";
import { useEffect } from "react";

interface BottomBarProps {
  onAdvance: () => void;
  buttonLabel?: string;
}

const BottomBar = ({ onAdvance, buttonLabel = "Confirmar" }: BottomBarProps) => {
  const { currentPrice, state } = useBuilder();
  const { oldPrice, newPrice } = currentPrice;

  useEffect(() => {
    console.log("[BottomBar Debug]", {
      selectedSize: state.tamanho,
      oldPrice,
      newPrice,
    });
  }, [state.tamanho, oldPrice, newPrice]);

  const formatPrice = (price: number) =>
    price.toFixed(2).replace(".", ",") + "€";

  return (
    <div>
      <div className="bg-card border-t border-border px-4 py-[5px] flex items-center justify-between">
        <div className="flex flex-col gap-0">
          <span className="text-[10px] text-muted-foreground leading-tight">
            Antes: <span className="line-through">{formatPrice(oldPrice)}</span>
          </span>
          <span className="text-lg font-bold text-foreground leading-tight">
            {formatPrice(newPrice)}*
          </span>
          <span className="text-[10px] text-promo font-medium leading-tight">c/Portes Grátis*</span>
        </div>
        <button
          onClick={onAdvance}
          className="bg-promo text-promo-foreground font-semibold text-base px-10 py-3 rounded-lg active:scale-95 transition-transform duration-150 flex items-center gap-2"
        >
          {buttonLabel}
          <Check className="w-4 h-4" />
        </button>
      </div>
      <div className="w-full bg-card py-0.5 flex items-center justify-center gap-1">
        <Info className="w-3 h-3 text-promo" />
        <span className="text-[10px] font-semibold text-promo">Não pagas agora, só depois de aprovar o Desenho</span>
      </div>
    </div>
  );
};

export default BottomBar;

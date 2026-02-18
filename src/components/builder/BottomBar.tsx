import { useBuilder } from "@/context/BuilderContext";
import { Check } from "lucide-react";

interface BottomBarProps {
  onAdvance: () => void;
  buttonLabel?: string;
}

const BottomBar = ({ onAdvance, buttonLabel = "Avançar" }: BottomBarProps) => {
  const { getCurrentPrice } = useBuilder();
  const { oldPrice, newPrice } = getCurrentPrice();

  const formatPrice = (price: number) =>
    price.toFixed(2).replace(".", ",") + "€";

  return (
    <div className="bg-card border-t border-border px-4 py-3 flex items-center justify-between">
      <div className="flex flex-col">
        <span className="text-xs text-muted-foreground">
          Antes: <span className="line-through">{formatPrice(oldPrice)}</span>
        </span>
        <div className="flex items-baseline gap-1.5">
          <span className="text-xl font-bold text-foreground">
            {formatPrice(newPrice)}
          </span>
        </div>
        <span className="text-xs text-promo font-medium">c/Portes Grátis</span>
      </div>
      <button
        onClick={onAdvance}
        className="bg-promo text-promo-foreground font-semibold text-sm px-6 py-3 rounded-lg active:scale-95 transition-transform duration-150 flex items-center gap-2"
      >
        {buttonLabel}
        <Check className="w-4 h-4" />
      </button>
    </div>
  );
};

export default BottomBar;

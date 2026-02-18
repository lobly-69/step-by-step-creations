import { useBuilder } from "@/context/BuilderContext";

interface BottomBarProps {
  onAdvance: () => void;
  buttonLabel?: string;
}

const BottomBar = ({ onAdvance, buttonLabel = "Avancar" }: BottomBarProps) => {
  const { getCurrentPrice } = useBuilder();
  const { oldPrice, newPrice } = getCurrentPrice();

  return (
    <div className="bg-card border-t border-border px-4 py-3 flex items-center justify-between">
      <div className="flex items-baseline gap-2">
        <span className="text-sm text-muted-foreground line-through">
          {oldPrice.toFixed(2).replace(".", ",")}
        </span>
        <span className="text-xl font-bold text-foreground">
          {newPrice.toFixed(2).replace(".", ",")}
        </span>
      </div>
      <button
        onClick={onAdvance}
        className="bg-primary text-primary-foreground font-semibold text-sm px-6 py-3 rounded-lg active:scale-95 transition-transform duration-150"
      >
        {buttonLabel}
      </button>
    </div>
  );
};

export default BottomBar;

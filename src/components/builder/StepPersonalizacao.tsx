import { useBuilder } from "@/context/BuilderContext";
import { Skeleton } from "@/components/ui/skeleton";


interface StepPersonalizacaoProps {
  onError: (msg: string | null) => void;
}

const StepPersonalizacao = ({ onError }: StepPersonalizacaoProps) => {
  const { state, config, configLoading, setFrame, setFundo, setTamanho } = useBuilder();

  const formatPrice = (price: number) =>
    price.toFixed(2).replace(".", ",") + "€";

  // Determine the size card image based on selected frame
  const getSizeImage = (opt: typeof config.sizes[0]) => {
    const selectedFrame = config.frameColors.find(f => f.prefix === state.cores.frame);
    const isWhiteFrame = selectedFrame?.name?.toLowerCase() === "white" || 
                          selectedFrame?.prefix?.toUpperCase() === "W";
    if (isWhiteFrame) {
      return opt.image_white || opt.image_black || "";
    }
    return opt.image_black || opt.image_white || "";
  };

  if (configLoading) {
    return (
      <div>
        <h2 className="text-base font-bold text-foreground leading-tight text-center mb-0">Personaliza a tua Obra Prima</h2>
        <p className="text-xs text-muted-foreground leading-tight text-center mb-2">Define as cores e o tamanho que melhor combinam com o teu espaço...</p>

        {/* Skeleton for frame colors */}
        <div className="mb-3">
          <Skeleton className="w-16 h-4 mb-1" />
          <div className="flex gap-1.5">
            <Skeleton className="h-[32px] w-14 rounded-lg" />
            <Skeleton className="h-[32px] w-14 rounded-lg" />
          </div>
        </div>

        {/* Skeleton for background colors */}
        <div className="mb-3">
          <Skeleton className="w-24 h-4 mb-1" />
          <div className="grid grid-cols-5 gap-1.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-[32px] rounded-lg" />
            ))}
          </div>
        </div>

        {/* Skeleton for sizes */}
        <div>
          <Skeleton className="w-32 h-4 mb-1.5" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="rounded-xl aspect-[3/4]" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-base font-bold text-foreground leading-tight text-center mb-0">Personaliza a tua Obra Prima</h2>
      <p className="text-xs text-muted-foreground leading-tight text-center mb-2">Define as cores e o tamanho que melhor combinam com o teu espaço...</p>

      {/* Frame colors — own row */}
      <div className="mb-3">
        <p className="text-xs font-semibold text-foreground mb-1">Moldura:</p>
        <div className="flex gap-1.5">
          {config.frameColors.map((c) => {
            const selected = state.cores.frame === c.prefix;
            return (
              <button
                key={c.id}
                onClick={() => { setFrame(c.prefix); onError(null); }}
                className={`w-14 h-[32px] md:h-9 rounded-lg border-2 transition-all duration-200 ${
                  selected ? "border-promo ring-2 ring-promo/30 scale-105" : "border-border hover:border-primary/40"
                }`}
                style={{ backgroundColor: c.hex }}
              />
            );
          })}
        </div>
      </div>

      {/* Background colors — own row */}
      <div className="mb-3">
        <p className="text-xs font-semibold text-foreground mb-1">Cor de Fundo:</p>
        <div className="grid grid-cols-5 gap-1.5">
          {config.backgroundColors.map((c) => {
            const selected = state.cores.fundo === c.name;
            return (
              <button
                key={c.name}
                onClick={() => { setFundo(c.name); onError(null); }}
                className={`h-[32px] md:h-9 rounded-lg border-2 transition-all duration-200 ${
                  selected ? "border-promo ring-2 ring-promo/30 scale-105" : "border-border hover:border-primary/40"
                }`}
                style={{ backgroundColor: c.hex }}
              />
            );
          })}
        </div>
      </div>

      {/* Tamanhos */}
      <div id="section-tamanhos">
        <p className="text-xs font-semibold text-foreground mb-1.5">Escolhe o Tamanho:</p>
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
                  <img key={`${opt.size}-${state.cores.frame}`} src={getSizeImage(opt)} alt="" className="w-full aspect-square object-cover transition-opacity duration-200" />
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
                      {formatPrice(opt.promo_price)}*
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
        <div className="mt-3 rounded-lg border border-promo/40 bg-promo/10 px-3 py-2 text-center">
          <p className="text-[11px] text-foreground leading-snug">
            ⚠️ <strong>Não pagas nada agora, só depois de Aprovar as Maquetes</strong> que te vamos enviar (sem compromisso) <strong>por Whatsapp</strong>...
          </p>
        </div>
      </div>
    </div>
  );
};

export default StepPersonalizacao;

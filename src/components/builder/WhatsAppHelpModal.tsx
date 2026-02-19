import { X, MessageCircle } from "lucide-react";
import { useBuilder } from "@/context/BuilderContext";

interface WhatsAppHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const WhatsAppHelpModal = ({ isOpen, onClose }: WhatsAppHelpModalProps) => {
  const { state, config } = useBuilder();

  if (!isOpen) return null;

  const hasSelection = state.tamanho !== null && state.cores.frame !== null;

  // Build frame label (feminino: Moldura Branca/Preta)
  const frameLabel = (() => {
    if (!state.cores.frame) return "";
    const frame = config.frameColors.find((f) => f.prefix === state.cores.frame);
    if (!frame) return "";
    // Convert to feminine: Preto→Preta, Branco→Branca
    const name = frame.name;
    if (name.toLowerCase() === "preto") return "Preta";
    if (name.toLowerCase() === "branco") return "Branca";
    return name;
  })();

  const sizeLabel = state.tamanho ? `${state.tamanho}cm` : "";

  const message = `Olá Guilherme, tudo bem?\n\nEstou a tentar fazer um pedido de uma Ilustração Personalizada com ${sizeLabel} e Moldura ${frameLabel}, mas não estou a conseguir enviar as fotos pelo site. Vou enviar as fotografias por aqui para darem seguimento ao pedido.`;

  const normalizedNumber = config.supportWhatsapp.replace(/[+\s]/g, "");
  const whatsappUrl = `https://wa.me/${normalizedNumber}?text=${encodeURIComponent(message)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      <div className="absolute inset-0 bg-foreground/40" onClick={onClose} />

      <div className="relative w-full max-w-[400px] bg-card rounded-t-2xl md:rounded-2xl z-10 slide-step overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center z-20"
        >
          <X className="w-4 h-4 text-foreground" />
        </button>

        <div className="p-5 pt-6">
          <div className="w-12 h-12 rounded-full bg-[#25D366]/10 flex items-center justify-center mb-3 mx-auto">
            <MessageCircle className="w-6 h-6 text-[#25D366]" />
          </div>

          <h2 className="text-lg font-bold text-foreground text-center mb-1">
            Não consegues enviar as fotos?
          </h2>
          <p className="text-xs text-muted-foreground text-center mb-5">
            Envia as fotografias por WhatsApp para darmos seguimento ao pedido.
          </p>

          {!hasSelection && (
            <p className="text-[11px] text-muted-foreground text-center mb-3 bg-muted/50 rounded-lg px-3 py-2">
              Escolhe primeiro o tamanho e a moldura para preencher a mensagem.
            </p>
          )}

          <div className="flex flex-col gap-2">
            <a
              href={hasSelection ? whatsappUrl : undefined}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => { if (!hasSelection) e.preventDefault(); }}
              className={`w-full flex items-center justify-center gap-2 font-semibold text-sm py-3 rounded-lg transition-all duration-150 ${
                hasSelection
                  ? "bg-[#25D366] text-white active:scale-[0.98]"
                  : "bg-muted text-muted-foreground cursor-not-allowed"
              }`}
            >
              <MessageCircle className="w-4 h-4" />
              Enviar por WhatsApp
            </a>
            <button
              onClick={onClose}
              className="w-full text-sm font-medium text-muted-foreground py-2.5 rounded-lg hover:bg-muted/50 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhatsAppHelpModal;

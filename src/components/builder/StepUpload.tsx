import { useRef, useState } from "react";
import { useBuilder } from "@/context/BuilderContext";
import { Upload, X, AlertCircle, Loader2 } from "lucide-react";
import WhatsAppHelpModal from "./WhatsAppHelpModal";

const ACCEPTED_TYPES = ".jpg,.jpeg,.png,.webp,.heic";

const SLOT_LABELS = [
  "Clica aqui para Adicionar",
  "Queres adicionar mais uma?",
  "Queres adicionar mais uma?",
];

interface StepUploadProps {
  onError: (msg: string | null) => void;
  onSkipPhotos?: () => void;
}

const StepUpload = ({ onError, onSkipPhotos }: StepUploadProps) => {
  const { slots, startSlotUpload, deleteSlot, activeCount, availableCount } = useBuilder();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [helpModalOpen, setHelpModalOpen] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;
    onError(null);

    const files = Array.from(fileList).slice(0, availableCount);
    if (files.length > 0) {
      startSlotUpload(files);
    }

    // Reset input so the same file can be re-selected
    e.target.value = "";
  };

  // Determine visible slots: always show filled + 1 empty (up to 3)
  const visibleCount = (() => {
    let lastFilled = -1;
    for (let i = 0; i < 3; i++) {
      if (slots[i].status !== "empty") lastFilled = i;
    }
    return Math.min(lastFilled + 2, 3);
  })();

  return (
    <div>
      <h2 className="text-lg font-bold text-foreground text-center mb-1">Submete a tua Foto Favorita</h2>
      <p className="text-xs text-muted-foreground text-center mb-4">Para que possamos transformar cada detalhe numa Obra Única...</p>

      <div className="flex flex-col gap-3">
        {Array.from({ length: visibleCount }).map((_, index) => {
          const slot = slots[index];

          if (slot.status === "empty") {
            return (
              <div
                key={`empty-${index}`}
                className="relative rounded-xl border-2 border-dashed border-border bg-muted/30 transition-all duration-200 overflow-hidden"
              >
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center gap-3 p-3"
                >
                  <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                    <Upload className="w-3.5 h-3.5 text-muted-foreground" />
                  </div>
                  <span className="text-xs font-medium text-muted-foreground leading-tight">
                    {SLOT_LABELS[index]}
                  </span>
                </button>
              </div>
            );
          }

          return (
            <div
              key={`slot-${slot.slotIndex}-${slot.file?.name}`}
              className="relative rounded-xl border-2 border-dashed border-border bg-muted/30 transition-all duration-200 overflow-hidden"
            >
              <div className="flex items-center gap-3 p-3">
                <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {slot.previewUrl ? (
                    <img src={slot.previewUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Upload className="w-3.5 h-3.5 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground truncate">{slot.file?.name ?? "Foto"}</p>

                  {slot.status === "uploading" && (
                    <div className="mt-1.5 space-y-1">
                      <div className="h-2 w-full rounded-full bg-muted overflow-hidden border border-border">
                        <div
                          className="h-full rounded-full bg-promo transition-all duration-300 ease-out"
                          style={{ width: `${Math.max(slot.progress, 3)}%` }}
                        />
                      </div>
                      <div className="flex items-center gap-1">
                        <Loader2 className="w-3 h-3 text-primary animate-spin" />
                        <span className="text-[10px] text-muted-foreground">A enviar… {slot.progress}%</span>
                      </div>
                    </div>
                  )}

                  {slot.status === "uploaded" && (
                    <p className="text-[10px] text-step-completed font-medium mt-0.5">Concluido</p>
                  )}

                  {slot.status === "failed" && (
                    <div className="flex items-center gap-1 mt-0.5">
                      <AlertCircle className="w-3 h-3 text-destructive" />
                      <p className="text-[10px] text-destructive font-medium">{slot.error ?? "Erro no envio"}</p>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => deleteSlot(slot.slotIndex)}
                  className="w-7 h-7 rounded-full bg-muted flex items-center justify-center hover:bg-destructive/10 transition-colors"
                >
                  <X className="w-3 h-3 text-muted-foreground" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {activeCount === 0 && (
        <p
          onClick={() => setHelpModalOpen(true)}
          className="text-xs font-semibold text-foreground underline mt-3 cursor-pointer text-center"
        >
          Não estou a conseguir Subir a Foto
        </p>
      )}

      <p className="text-[10px] text-muted-foreground mt-2 text-center">Poderás adicionar até 3 Fotos nos formatos: JPG, JPEG, PNG, WEBP e HEIC. Tamanho maximo: 30MB.</p>

      {/* Single hidden input - supports multiple selection */}
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_TYPES}
      className="hidden"
        onChange={handleFileSelect}
      />

      <WhatsAppHelpModal isOpen={helpModalOpen} onClose={() => setHelpModalOpen(false)} />
    </div>
  );
};

export default StepUpload;

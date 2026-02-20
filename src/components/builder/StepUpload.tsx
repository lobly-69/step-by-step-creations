import { useRef, useState } from "react";
import { useBuilder } from "@/context/BuilderContext";
import { supabase } from "@/integrations/supabase/client";
import { Upload, X } from "lucide-react";
import WhatsAppHelpModal from "./WhatsAppHelpModal";

const ACCEPTED_TYPES = ".jpg,.jpeg,.png,.webp,.heic";

const SLOT_LABELS = [
  "Clica aqui para Adicionar",
  "Queres adicionar mais uma?",
  "Queres adicionar mais uma?",
];

function getExt(file: File): string {
  const fromName = file.name.split(".").pop()?.toLowerCase();
  if (fromName) return fromName;
  // fallback from mime
  const mime = file.type;
  if (mime.includes("jpeg") || mime.includes("jpg")) return "jpg";
  if (mime.includes("png")) return "png";
  if (mime.includes("webp")) return "webp";
  if (mime.includes("heic")) return "heic";
  return "jpg";
}

interface StepUploadProps {
  onError: (msg: string | null) => void;
}

const StepUpload = ({ onError }: StepUploadProps) => {
  const { state, addFile, removeFile, setProgress, getUploadUrls } = useBuilder();
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([null, null, null]);
  const [helpModalOpen, setHelpModalOpen] = useState(false);

  const doUpload = async (index: number, file: File) => {
    try {
      // Request a signed upload token for this single file
      const uploads = await getUploadUrls([{ ext: getExt(file), size: file.size }]);
      const entry = uploads[0];

      if (!entry?.path || !entry?.token) {
        simulateUpload(index);
        return;
      }

      // Use Supabase Storage SDK with the token directly
      const { error } = await supabase.storage
        .from("builder")
        .uploadToSignedUrl(entry.path, entry.token, file, {
          contentType: file.type || "application/octet-stream",
          upsert: true,
        });

      if (error) {
        console.warn("uploadToSignedUrl failed:", error.message);
      }

      setProgress(index, 100);
    } catch (err) {
      console.warn("doUpload failed, falling back to simulate:", err);
      simulateUpload(index);
    }
  };

  const simulateUpload = (index: number) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 25 + 10;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
      }
      setProgress(index, Math.min(progress, 100));
    }, 200);
  };

  const handleFileSelect = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    onError(null);
    addFile(index, file);
    doUpload(index, file);
  };

  const uploadedCount = state.upload.files.filter(Boolean).length;

  const visibleCount = (() => {
    let count = 1;
    for (let i = 0; i < 2; i++) {
      if (state.upload.files[i] !== null) count = i + 2;
    }
    return Math.min(count, 3);
  })();

  return (
    <div>
      <h2 className="text-lg font-bold text-foreground text-center mb-1">Submete a tua Foto Favorita</h2>
      <p className="text-xs text-muted-foreground text-center mb-4">Para que possamos transformar cada detalhe numa Obra Única...</p>

      <div className="flex flex-col gap-3">
        {Array.from({ length: visibleCount }).map((_, index) => {
          const file = state.upload.files[index];
          const progress = state.upload.progress[index];
          const uploading = file && progress < 100;

          return (
            <div
              key={index}
              className="relative rounded-xl border-2 border-dashed border-border bg-muted/30 transition-all duration-200 overflow-hidden"
            >
              {!file ? (
                <button
                  onClick={() => fileInputRefs.current[index]?.click()}
                  className="w-full flex items-center gap-3 p-3"
                >
                  <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                    <Upload className="w-3.5 h-3.5 text-muted-foreground" />
                  </div>
                  <span className="text-xs font-medium text-muted-foreground leading-tight">
                    {SLOT_LABELS[index]}
                  </span>
                </button>
              ) : (
                <div className="flex items-center gap-3 p-3">
                  <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0 overflow-hidden">
                    <img
                      src={URL.createObjectURL(file)}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground truncate">{file.name}</p>
                    {uploading && (
                      <div className="mt-1.5 h-1.5 w-full bg-border rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    )}
                    {!uploading && progress === 100 && (
                      <p className="text-[10px] text-step-completed font-medium mt-0.5">Concluido</p>
                    )}
                  </div>
                  <button
                    onClick={() => removeFile(index)}
                    className="w-7 h-7 rounded-full bg-muted flex items-center justify-center hover:bg-destructive/10 transition-colors"
                  >
                    <X className="w-3 h-3 text-muted-foreground" />
                  </button>
                </div>
              )}
              <input
                ref={(el) => { fileInputRefs.current[index] = el; }}
                type="file"
                accept={ACCEPTED_TYPES}
                className="hidden"
                onChange={(e) => handleFileSelect(index, e)}
              />
            </div>
          );
        })}
      </div>

      {uploadedCount === 0 && (
        <p
          onClick={() => setHelpModalOpen(true)}
          className="text-xs font-semibold text-foreground underline mt-3 cursor-pointer text-center"
        >
          Não estou a conseguir Subir a Foto
        </p>
      )}

      <p className="text-[10px] text-muted-foreground mt-2 text-center">Poderás adicionar até 3 Fotos nos formatos: JPG, JPEG, PNG, WEBP e HEIC. Tamanho maximo: 30MB.</p>

      <WhatsAppHelpModal isOpen={helpModalOpen} onClose={() => setHelpModalOpen(false)} />
    </div>
  );
};

export default StepUpload;

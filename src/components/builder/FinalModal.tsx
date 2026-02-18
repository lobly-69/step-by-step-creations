import { useState } from "react";
import { X } from "lucide-react";

interface FinalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const countryCodes = [
  { id: "pt", label: "PT", code: "+351" },
  { id: "br", label: "Brasil", code: "+55" },
  { id: "es", label: "Espanha", code: "+34" },
  { id: "outro", label: "Outro", code: "" },
];

const FinalModal = ({ isOpen, onClose }: FinalModalProps) => {
  const [name, setName] = useState("");
  const [country, setCountry] = useState("pt");
  const [phone, setPhone] = useState("");
  const [customCode, setCustomCode] = useState("");

  if (!isOpen) return null;

  const selectedCountry = countryCodes.find((c) => c.id === country)!;

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      {/* Overlay */}
      <div className="absolute inset-0 bg-foreground/40" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-[600px] bg-card rounded-t-2xl md:rounded-2xl p-6 z-10 slide-step">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-muted flex items-center justify-center"
        >
          <X className="w-4 h-4 text-muted-foreground" />
        </button>

        <h2 className="text-lg font-bold text-foreground mb-1">Quase la!</h2>
        <p className="text-sm text-muted-foreground mb-5">
          Deixa os teus dados e entramos em contacto.
        </p>

        <div className="flex flex-col gap-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Nome *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="O teu nome"
              className="w-full rounded-lg border border-input bg-card px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">WhatsApp *</label>
            <div className="flex gap-2">
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="rounded-lg border border-input bg-card px-2 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring min-w-[100px]"
              >
                {countryCodes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label} {c.code}
                  </option>
                ))}
              </select>
              {country === "outro" && (
                <input
                  type="text"
                  value={customCode}
                  onChange={(e) => setCustomCode(e.target.value)}
                  placeholder="+..."
                  className="w-20 rounded-lg border border-input bg-card px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              )}
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Numero"
                className="flex-1 rounded-lg border border-input bg-card px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          <button className="w-full bg-primary text-primary-foreground font-semibold text-sm py-3.5 rounded-lg active:scale-[0.98] transition-transform duration-150 mt-2">
            Finalizar pedido
          </button>
        </div>
      </div>
    </div>
  );
};

export default FinalModal;

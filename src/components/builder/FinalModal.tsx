import { useState } from "react";
import { X } from "lucide-react";
import helpdeskImg from "@/assets/helpdesk-pixar.jpg";

interface FinalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const countryCodes = [
  { id: "pt", label: "PT", code: "+351" },
  { id: "br", label: "BR", code: "+55" },
  { id: "es", label: "ES", code: "+34" },
  { id: "outro", label: "Outro", code: "" },
];

const FinalModal = ({ isOpen, onClose }: FinalModalProps) => {
  const [name, setName] = useState("");
  const [country, setCountry] = useState("pt");
  const [phone, setPhone] = useState("");
  const [customCode, setCustomCode] = useState("");
  const [showEmail, setShowEmail] = useState(false);
  const [email, setEmail] = useState("");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      {/* Overlay */}
      <div className="absolute inset-0 bg-foreground/40" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-[600px] bg-card rounded-t-2xl md:rounded-2xl z-10 slide-step overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center z-20"
        >
          <X className="w-4 h-4 text-foreground" />
        </button>

        {/* Header image */}
        <img src={helpdeskImg} alt="" className="w-full h-32 object-cover" />

        <div className="p-5">
          <h2 className="text-lg font-bold text-foreground mb-0.5">Quase lá!</h2>
          <p className="text-xs text-muted-foreground mb-4">
            Deixa os teus dados e entramos em contacto.
          </p>

          <div className="flex flex-col gap-3">
            {/* Nome */}
            <div>
              <label className="text-xs font-medium text-foreground mb-1 block">Nome *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="O teu nome"
                className="w-full rounded-lg border border-input bg-card px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            {/* WhatsApp */}
            <div>
              <label className="text-xs font-medium text-foreground mb-1 block">WhatsApp *</label>
              <div className="flex gap-2">
                <div className="relative flex-shrink-0">
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="appearance-none rounded-lg border border-input bg-card pl-3 pr-7 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring w-[110px]"
                  >
                    {countryCodes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label} {c.code}
                      </option>
                    ))}
                  </select>
                  <svg className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                {country === "outro" && (
                  <input
                    type="text"
                    value={customCode}
                    onChange={(e) => setCustomCode(e.target.value)}
                    placeholder="+..."
                    className="w-16 rounded-lg border border-input bg-card px-2 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring flex-shrink-0"
                  />
                )}
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Número"
                  className="flex-1 min-w-0 rounded-lg border border-input bg-card px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>

            {/* Não tenho WhatsApp */}
            {!showEmail && (
              <p
                onClick={() => setShowEmail(true)}
                className="text-xs font-semibold text-foreground underline cursor-pointer text-center"
              >
                Não tenho WhatsApp
              </p>
            )}

            {/* Email field */}
            {showEmail && (
              <div>
                <label className="text-xs font-medium text-foreground mb-1 block">Email *</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="O teu email"
                  className="w-full rounded-lg border border-input bg-card px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            )}

            <button className="w-full bg-promo text-promo-foreground font-semibold text-sm py-3 rounded-lg active:scale-[0.98] transition-transform duration-150 mt-1">
              Finalizar pedido
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinalModal;

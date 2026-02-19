import { useState } from "react";
import { X } from "lucide-react";
import helpdeskImg from "@/assets/helpdesk-pixar.jpg";
import { useBuilder } from "@/context/BuilderContext";
import { finalizeSession } from "@/hooks/useSession";

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

const nameRegex = /^[^\d]*$/; // no digits allowed

const FinalModal = ({ isOpen, onClose }: FinalModalProps) => {
  const { sessionId } = useBuilder();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [firstNameTouched, setFirstNameTouched] = useState(false);
  const [lastNameTouched, setLastNameTouched] = useState(false);
  const [country, setCountry] = useState("pt");
  const [phone, setPhone] = useState("");
  const [customCode, setCustomCode] = useState("");
  const [showEmail, setShowEmail] = useState(false);
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const firstNameError =
    firstNameTouched &&
    (firstName.trim().replace(/\s{2,}/g, " ").length < 2 || !nameRegex.test(firstName.trim()));
  const lastNameError =
    lastNameTouched &&
    (lastName.trim().replace(/\s{2,}/g, " ").length < 2 || !nameRegex.test(lastName.trim()));

  if (!isOpen) return null;

  const getDialCode = () => {
    if (country === "outro") return customCode;
    return countryCodes.find((c) => c.id === country)?.code ?? "";
  };

  const handleSubmit = async () => {
    // Touch all fields to show errors
    setFirstNameTouched(true);
    setLastNameTouched(true);

    const cleanFirst = firstName.trim().replace(/\s{2,}/g, " ");
    const cleanLast = lastName.trim().replace(/\s{2,}/g, " ");

    const firstValid = cleanFirst.length >= 2 && nameRegex.test(cleanFirst);
    const lastValid = cleanLast.length >= 2 && nameRegex.test(cleanLast);

    if (!firstValid || !lastValid) return;

    if (!showEmail && phone.trim().length < 5) {
      setSubmitError("Insere um número de WhatsApp válido.");
      return;
    }
    if (showEmail && !email.includes("@")) {
      setSubmitError("Insere um email válido.");
      return;
    }

    if (!sessionId) {
      setSubmitError("Sessão não encontrada. Recarrega a página e tenta de novo.");
      return;
    }

    setSubmitError(null);
    setSubmitting(true);

    try {
      const whatsappFull = !showEmail
        ? `${getDialCode()}${phone.trim()}`
        : null;

      await finalizeSession({
        session_id: sessionId,
        first_name: cleanFirst,
        last_name: cleanLast,
        whatsapp_full: whatsappFull,
        email: showEmail ? email.trim() : null,
      });

      // Clear stored session so a new one is created next time
      localStorage.removeItem("builder_session_id");

      window.location.href = "https://lobly.pt/sucesso/";
    } catch (err: any) {
      console.error("finalize_session error", err);
      setSubmitError("Ocorreu um erro. Tenta de novo.");
      setSubmitting(false);
    }
  };

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
        <img src={helpdeskImg} alt="" className="w-full h-auto object-contain" />

        <div className="p-5">
          <h2 className="text-lg font-bold text-foreground text-center mb-0.5">Estamos quase lá...</h2>
          <p className="text-xs text-muted-foreground text-center mb-4">
            Deixa-nos o teu WhatsApp para te enviarmos o Desenho assim que estiver pronto. Não tens que pagar nada agora e só avançamos se Gostares...
          </p>

          <div className="flex flex-col gap-3">
            {/* Primeiro Nome + Último Nome */}
            <div className="flex gap-2">
              {/* Primeiro Nome */}
              <div className="flex-1">
                <label className="text-xs font-medium text-foreground mb-1 block">Primeiro Nome *</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  onBlur={() => setFirstNameTouched(true)}
                  placeholder="Ex: João"
                  className={`w-full rounded-lg border bg-card px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors ${
                    firstNameError ? "border-destructive focus:ring-destructive/40" : "border-input"
                  }`}
                />
                {firstNameError && (
                  <p className="text-[10px] text-destructive mt-0.5">Insere o teu primeiro nome.</p>
                )}
              </div>
              {/* Último Nome */}
              <div className="flex-1">
                <label className="text-xs font-medium text-foreground mb-1 block">Último Nome *</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  onBlur={() => setLastNameTouched(true)}
                  placeholder="Ex: Silva"
                  className={`w-full rounded-lg border bg-card px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors ${
                    lastNameError ? "border-destructive focus:ring-destructive/40" : "border-input"
                  }`}
                />
                {lastNameError && (
                  <p className="text-[10px] text-destructive mt-0.5">Insere o teu último nome.</p>
                )}
              </div>
            </div>

            {/* WhatsApp — hidden when email mode */}
            {!showEmail && (
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
                    <svg
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
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
                    placeholder="ex: 926948901"
                    inputMode="numeric"
                    className="flex-1 min-w-0 rounded-lg border border-input bg-card px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>
            )}

            {/* Toggle to email */}
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
              <>
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
                <p
                  onClick={() => setShowEmail(false)}
                  className="text-xs font-semibold text-foreground underline cursor-pointer text-center"
                >
                  Prefiro por WhatsApp
                </p>
              </>
            )}

            {submitError && (
              <p className="text-[11px] text-destructive text-center">{submitError}</p>
            )}

            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full bg-promo text-promo-foreground font-semibold text-sm py-3 rounded-lg active:scale-[0.98] transition-transform duration-150 mt-1 disabled:opacity-60"
            >
              {submitting ? "A enviar..." : "Finalizar pedido"}
            </button>
            <p className="text-[8px] md:text-[10px] text-muted-foreground text-center mt-0 leading-[1.2]">
              Apenas usamos o teu contacto para enviar a tua Ilustração Personalizada. Nada de Spam nem Publicidade
            </p>
          </div>
          <div className="h-0" />
        </div>
      </div>
    </div>
  );
};

export default FinalModal;

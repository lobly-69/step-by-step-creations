import { useState } from "react";
import { X } from "lucide-react";
import helpdeskImg from "@/assets/helpdesk-pixar.jpg";
import { useBuilder } from "@/context/BuilderContext";

interface FinalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const countryCodes = [
  { id: "pt", label: "PT", code: "+351", countryCode: "PT" },
  { id: "br", label: "BR", code: "+55",  countryCode: "BR" },
  { id: "es", label: "ES", code: "+34",  countryCode: "ES" },
  { id: "outro", label: "Outro", code: "", countryCode: "" },
];

const nameRegex = /^[^\d]*$/; // no digits allowed

const FinalModal = ({ isOpen, onClose }: FinalModalProps) => {
  const { finalizeSession } = useBuilder();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [firstNameTouched, setFirstNameTouched] = useState(false);
  const [lastNameTouched, setLastNameTouched] = useState(false);
  const [country, setCountry] = useState("pt");
  const [phone, setPhone] = useState("");
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [customCode, setCustomCode] = useState("");
  const [showEmail, setShowEmail] = useState(false);
  const [email, setEmail] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Strip everything except digits
  const sanitizeNumber = (v: string) => v.replace(/\D/g, "");

  const isValidName = (v: string) =>
    v.trim().replace(/\s{2,}/g, " ").length >= 2 && nameRegex.test(v.trim());

  const isValidPhone = (v: string) => sanitizeNumber(v).length > 0;

  const isValidEmail = (v: string) => {
    const t = v.trim();
    return t.length > 3 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t);
  };

  const firstNameError = firstNameTouched && !isValidName(firstName);
  const lastNameError = lastNameTouched && !isValidName(lastName);
  const phoneError = !showEmail && phoneTouched && !isValidPhone(phone);
  const emailError = showEmail && emailTouched && !isValidEmail(email);

  const getDialCode = () => {
    if (country === "outro") return customCode.trim();
    return countryCodes.find((c) => c.id === country)?.code ?? "";
  };

  const getCountryCode = () => {
    if (country === "outro") return null;
    return countryCodes.find((c) => c.id === country)?.countryCode ?? null;
  };

  const isFormValid = () => {
    if (!isValidName(firstName) || !isValidName(lastName)) return false;
    if (showEmail) return isValidEmail(email);
    return isValidPhone(phone);
  };

  const handleSubmit = async () => {
    setFirstNameTouched(true);
    setLastNameTouched(true);
    if (showEmail) setEmailTouched(true);
    else setPhoneTouched(true);

    if (!isFormValid()) return;

    setSubmitting(true);
    setSubmitError(null);

    try {
      const emailVal = showEmail ? email.trim() : null;
      const dialCode = showEmail ? null : getDialCode();
      const countryCode = showEmail ? null : getCountryCode();
      const whatsappNumber = showEmail ? null : sanitizeNumber(phone);

      const result = await finalizeSession({
        first_name: firstName.trim().replace(/\s{2,}/g, " "),
        last_name: lastName.trim().replace(/\s{2,}/g, " "),
        country_code: countryCode,
        dial_code: dialCode,
        whatsapp_number: whatsappNumber || null,
        email: emailVal,
      });

      if (result.success) {
        window.location.href = "https://lobly.pt/sucesso/";
      } else {
        setSubmitError("Ocorreu um erro. Tenta novamente.");
      }
    } catch (err: any) {
      console.error("finalizeSession error:", err);
      setSubmitError("Ocorreu um erro. Tenta novamente.");
    } finally {
      setSubmitting(false);
    }
  };

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
                    onBlur={() => setPhoneTouched(true)}
                    placeholder="ex: 926948901"
                    inputMode="numeric"
                    className={`flex-1 min-w-0 rounded-lg border bg-card px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors ${
                      phoneError ? "border-destructive focus:ring-destructive/40" : "border-input"
                    }`}
                  />
                </div>
                {phoneError && (
                  <p className="text-[10px] text-destructive mt-0.5">Número de Whatsapp Inválido</p>
                )}
              </div>
            )}

            {/* Toggle to email */}
            {!showEmail && (
              <p
                onClick={() => { setShowEmail(true); setPhoneTouched(false); }}
                className="text-xs font-semibold text-muted-foreground underline cursor-pointer text-center"
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
                    onBlur={() => setEmailTouched(true)}
                    placeholder="O teu email"
                    className={`w-full rounded-lg border bg-card px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors ${
                      emailError ? "border-destructive focus:ring-destructive/40" : "border-input"
                    }`}
                  />
                  {emailError && (
                    <p className="text-[10px] text-destructive mt-0.5">Email inválido</p>
                  )}
                </div>
                <p
                  onClick={() => { setShowEmail(false); setEmailTouched(false); }}
                  className="text-xs font-semibold text-muted-foreground underline cursor-pointer text-center"
                >
                  Prefiro por WhatsApp
                </p>
              </>
            )}

            {submitError && (
              <p className="text-xs text-destructive text-center">{submitError}</p>
            )}

            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full bg-promo text-promo-foreground font-semibold text-sm py-3 rounded-lg active:scale-[0.98] transition-transform duration-150 mt-1 disabled:opacity-60 disabled:cursor-not-allowed"
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

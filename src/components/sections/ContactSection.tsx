import { useState } from "react";
import type { FormEvent } from "react";
import {
  Phone,
  MapPin,
  Clock,
  Truck,
  Award,
  Users,
  Instagram,
  Send,
  Loader2,
} from "lucide-react";
import { useLanguage } from "../../contexts/LanguageContext";
import { formatPhoneInput } from "../../utils/formatters";

export function ContactSection() {
  const { t } = useLanguage();
  const [consultName, setConsultName] = useState("");
  const [consultPhone, setConsultPhone] = useState("");
  const [consultMessage, setConsultMessage] = useState("");
  const [consultSending, setConsultSending] = useState(false);
  const [consultError, setConsultError] = useState("");
  const [consultSuccess, setConsultSuccess] = useState("");

  const handleConsultationSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!consultName.trim() || !consultPhone.trim()) {
      setConsultError(t.contact.form.errorRequired);
      return;
    }

    setConsultSending(true);
    setConsultError("");
    setConsultSuccess("");

    try {
      const response = await fetch("/api/send-telegram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: consultName.trim(),
          phone: consultPhone.trim(),
          message: consultMessage.trim(),
        }),
      });

      const payload = (await response.json()) as {
        error?: string;
        ok?: boolean;
      };
      if (!response.ok || !payload.ok) {
        setConsultError(payload.error ?? t.contact.form.errorFailed);
        return;
      }

      setConsultSuccess(t.contact.form.success);
      setConsultName("");
      setConsultPhone("");
      setConsultMessage("");
    } catch {
      setConsultError(t.contact.form.errorServer);
    } finally {
      setConsultSending(false);
    }
  };

  return (
    <section id="contact" className="relative py-16 lg:py-24 bg-navy-light">
      <div className="px-6 lg:px-[6vw]">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          {/* Left Column - Contact Info */}
          <div>
            <h2 className="section-heading font-display text-[clamp(30px,3.6vw,44px)] text-white mb-4">
              {t.contact.sectionTitle}
            </h2>
            <div className="fade-up w-16 h-[2px] bg-gold mb-5" />
            <p className="fade-up text-white/70 text-base lg:text-lg leading-relaxed mb-8 max-w-xl">
              {t.contact.sectionBody}
            </p>

            <div className="space-y-5">
              <div className="fade-up flex items-start gap-3">
                <div className="w-10 h-10 mt-0.5 bg-gold/10 border border-gold/20 rounded-md flex items-center justify-center shrink-0">
                  <Phone className="text-gold" size={18} />
                </div>
                <div>
                  <p className="text-white/50 text-sm mb-1">
                    {t.contact.phone}
                  </p>
                  <p className="text-white font-medium leading-tight">
                    +998 (97) 680-94-49
                  </p>
                  <p className="text-white font-medium leading-tight mt-1">
                    +998 (90) 979-09-52
                  </p>
                </div>
              </div>

              <div className="fade-up flex items-start gap-3">
                <div className="w-10 h-10 mt-0.5 bg-gold/10 border border-gold/20 rounded-md flex items-center justify-center shrink-0">
                  <MapPin className="text-gold" size={18} />
                </div>
                <div>
                  <p className="text-white/50 text-sm mb-1">
                    {t.contact.address}
                  </p>
                  <p className="text-white">{t.contact.addressLine1}</p>
                  <p className="text-white/70">{t.contact.addressLine2}</p>
                </div>
              </div>

              <div className="fade-up flex items-start gap-3">
                <div className="w-10 h-10 mt-0.5 bg-gold/10 border border-gold/20 rounded-md flex items-center justify-center shrink-0">
                  <Clock className="text-gold" size={18} />
                </div>
                <div>
                  <p className="text-white/50 text-sm mb-1">
                    {t.contact.hours}
                  </p>
                  <p className="text-white">{t.contact.hoursLine1}</p>
                  <p className="text-white/70">{t.contact.hoursLine2}</p>
                </div>
              </div>
            </div>

            {/* USP Cards */}
            <div className="usp-grid grid grid-cols-3 gap-3 mt-8">
              <div className="usp-card glass-card p-3 text-center">
                <Truck className="text-gold mx-auto mb-2" size={20} />
                <p className="text-white text-sm font-medium">
                  {t.contact.usp.delivery}
                </p>
              </div>
              <div className="usp-card glass-card p-3 text-center">
                <Award className="text-gold mx-auto mb-2" size={20} />
                <p className="text-white text-sm font-medium">
                  {t.contact.usp.quality}
                </p>
              </div>
              <div className="usp-card glass-card p-3 text-center">
                <Users className="text-gold mx-auto mb-2" size={20} />
                <p className="text-white text-sm font-medium">
                  {t.contact.usp.individual}
                </p>
              </div>
            </div>
          </div>

          {/* Right Column - Yandex Map */}
          <div className="fade-up">
            <div className="glass-card p-3 lg:p-4 h-full min-h-[330px] rounded-xl border border-white/10">
              <h3 className="font-display text-lg lg:text-xl text-white mb-3 px-2">
                {t.contact.mapTitle}
              </h3>
              <div className="w-full h-[260px] lg:h-[320px] overflow-hidden rounded-lg">
                <iframe
                  src="https://yandex.ru/map-widget/v1/?ll=69.571729%2C41.434479&mode=search&oid=207765551678&ol=biz&z=17"
                  width="100%"
                  height="400"
                  style={{ border: "0", borderRadius: "12px" }}
                  allowFullScreen={true}
                  loading="lazy"
                />
              </div>
              <a
                href="https://yandex.uz/maps/-/CDXlv4M~"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-gold text-sm mt-3 px-2 hover:underline"
              >
                <MapPin size={16} />
                {t.contact.mapLink}
              </a>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="mt-16 fade-up">
          <div className="glass-card p-8 lg:p-10 max-w-2xl mx-auto">
            <h3 className="font-display text-2xl text-white mb-6 text-center">
              {t.contact.form.heading}
            </h3>

            <form className="space-y-5" onSubmit={handleConsultationSubmit}>
              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className="text-white/50 text-sm mb-2 block">
                    {t.contact.form.nameLabel}
                  </label>
                  <input
                    type="text"
                    value={consultName}
                    onChange={(e) => setConsultName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 px-4 py-3 text-white placeholder:text-white/30 focus:border-gold focus:outline-none transition-colors"
                    placeholder={t.contact.form.namePlaceholder}
                    required
                  />
                </div>
                <div>
                  <label className="text-white/50 text-sm mb-2 block">
                    {t.contact.form.phoneLabel}
                  </label>
                  <input
                    type="tel"
                    inputMode="numeric"
                    value={consultPhone}
                    onChange={(e) => setConsultPhone(formatPhoneInput(e.target.value))}
                    className="w-full bg-white/5 border border-white/10 px-4 py-3 text-white placeholder:text-white/30 focus:border-gold focus:outline-none transition-colors"
                    placeholder="+998 XX XXX XX XX"
                    maxLength={17}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="text-white/50 text-sm mb-2 block">
                  {t.contact.form.messageLabel}
                </label>
                <textarea
                  rows={4}
                  value={consultMessage}
                  onChange={(e) => setConsultMessage(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 px-4 py-3 text-white placeholder:text-white/30 focus:border-gold focus:outline-none transition-colors resize-none"
                  placeholder={t.contact.form.messagePlaceholder}
                />
              </div>
              {consultError && (
                <p className="text-red-300 text-sm">{consultError}</p>
              )}
              {consultSuccess && (
                <p className="text-green-300 text-sm">{consultSuccess}</p>
              )}
              <button
                type="submit"
                disabled={consultSending}
                className="btn-gold w-full disabled:opacity-60"
              >
                {consultSending ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 size={16} className="animate-spin" />
                    {t.contact.form.submitting}
                  </span>
                ) : (
                  t.contact.form.submit
                )}
              </button>
            </form>

            <div className="flex items-center justify-center gap-6 mt-8">
              <a
                href="https://instagram.com/Iskandar_home"
                target="_blank"
                rel="noopener noreferrer"
                title="Instagram"
                aria-label="Instagram"
                className="w-12 h-12 bg-white/5 flex items-center justify-center hover:bg-gold/20 transition-colors"
              >
                <Instagram className="text-gold" size={20} />
              </a>
              <a
                href="https://t.me/+998976809449"
                target="_blank"
                rel="noopener noreferrer"
                title="Telegram"
                aria-label="Telegram"
                className="w-12 h-12 bg-white/5 flex items-center justify-center hover:bg-gold/20 transition-colors"
              >
                <Send className="text-gold" size={20} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

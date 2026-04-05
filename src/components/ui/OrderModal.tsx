import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Loader2, Maximize2, Phone, Send, X } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { formatPhoneInput, parseProductName } from '../../utils/formatters';
import type { PortfolioImage } from '../../types';

export type OrderModalProps = {
  item: PortfolioImage;
  formatPrice: (p: number | null) => string;
  onClose: () => void;
};

export function OrderModal({ item, formatPrice, onClose }: OrderModalProps) {
  const { t, lang } = useLanguage();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [imageLightboxOpen, setImageLightboxOpen] = useState(false);

  const productName = parseProductName(item.product_name ?? item.title, lang) || t.servicePage.noName;
  const priceStr = formatPrice(item.price);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      setError(t.orderModal.errorRequired);
      return;
    }
    setSending(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch('/api/send-telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          message: message.trim() || undefined,
          product: productName,
          price: priceStr,
        }),
      });
      const payload = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !payload.ok) {
        setError(payload.error ?? t.orderModal.errorFailed);
        return;
      }
      setSuccess(t.orderModal.success);
      setName('');
      setPhone('');
      setMessage('');
    } catch {
      setError(t.orderModal.errorServer);
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    if (!imageLightboxOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setImageLightboxOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [imageLightboxOpen]);

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      <div className="relative z-10 w-full max-w-4xl glass-card overflow-hidden border border-white/15 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-20 flex h-9 w-9 items-center justify-center border border-white/20 bg-navy/80 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
          aria-label={t.orderModal.close}
        >
          <X size={16} />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-[1fr,1.1fr]">
          <div className="relative flex min-h-[260px] items-center justify-center bg-navy md:min-h-[460px]">
            <button
              type="button"
              onClick={() => setImageLightboxOpen(true)}
              className="group relative flex h-full min-h-[260px] w-full cursor-zoom-in flex-col items-center justify-center md:min-h-[460px]"
              aria-label={t.orderModal.enlargeImage}
            >
              <img
                src={item.image_url}
                alt=""
                className="max-h-[320px] w-full object-contain p-4 transition-transform duration-300 group-hover:scale-[1.02] md:max-h-[460px]"
              />
              <span className="pointer-events-none absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-md border border-white/20 bg-navy/85 text-white/80 shadow-md backdrop-blur-sm transition-colors group-hover:border-gold/40 group-hover:text-gold">
                <Maximize2 size={16} aria-hidden />
              </span>
            </button>
            <div className="pointer-events-none absolute bottom-0 left-0 right-0 bg-gradient-to-t from-navy/95 to-transparent px-5 py-4">
              <p className="text-base font-semibold leading-snug text-white">{productName}</p>
              <p className="mt-0.5 text-sm text-gold">{priceStr}</p>
            </div>
          </div>

          <div className="flex flex-col p-6 md:p-8">
            <h2 className="mb-1 font-display text-2xl text-white md:text-3xl">{t.orderModal.title}</h2>
            <p className="mb-6 text-sm text-white/50">
              {t.orderModal.productLabel}: <span className="text-gold">{productName}</span>
            </p>

            {success ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-4 py-8 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full border border-gold/40 bg-gold/15">
                  <Send className="text-gold" size={24} />
                </div>
                <p className="text-base font-medium text-white">{success}</p>
                <button type="button" onClick={onClose} className="btn-gold mt-2 px-8">
                  {t.orderModal.close}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-4">
                <div>
                  <label className="mb-1.5 block text-sm text-white/50">{t.orderModal.nameLabel}</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t.orderModal.namePlaceholder}
                    required
                    className="w-full border border-white/10 bg-white/5 px-4 py-3 text-white transition-colors placeholder:text-white/30 focus:border-gold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm text-white/50">{t.orderModal.phoneLabel}</label>
                  <div className="relative">
                    <Phone size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                    <input
                      type="tel"
                      inputMode="numeric"
                      value={phone}
                      onChange={(e) => setPhone(formatPhoneInput(e.target.value))}
                      placeholder="+998 XX XXX XX XX"
                      maxLength={17}
                      required
                      className="w-full border border-white/10 bg-white/5 py-3 pl-9 pr-4 text-white transition-colors placeholder:text-white/30 focus:border-gold focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm text-white/50">{t.orderModal.messageLabel}</label>
                  <textarea
                    rows={3}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={t.orderModal.messagePlaceholder}
                    className="w-full resize-none border border-white/10 bg-white/5 px-4 py-3 text-white transition-colors placeholder:text-white/30 focus:border-gold focus:outline-none"
                  />
                </div>

                {error && <p className="text-sm text-red-300">{error}</p>}

                <button
                  type="submit"
                  disabled={sending}
                  className="btn-gold mt-auto flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {sending ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      {t.orderModal.submitting}
                    </>
                  ) : (
                    t.orderModal.submit
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {imageLightboxOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          aria-label={t.orderModal.enlargeImage}
          onClick={() => setImageLightboxOpen(false)}
        >
          <div
            className="relative max-h-[90vh] max-w-[min(100%,1200px)]"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={item.image_url}
              alt={productName}
              className="max-h-[90vh] w-full object-contain"
            />
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setImageLightboxOpen(false);
            }}
            className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center border border-white/25 bg-navy/90 text-white/80 transition-colors hover:border-gold/50 hover:bg-white/10 hover:text-white"
            aria-label={t.orderModal.close}
          >
            <X size={18} />
          </button>
        </div>
      )}
    </div>
  );
}

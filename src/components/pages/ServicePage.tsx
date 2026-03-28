import { useState } from 'react';
import type { FormEvent } from 'react';
import { X, Loader2, Phone, Send } from 'lucide-react';
import { usePortfolioImages } from '../../hooks/usePortfolioImages';
import { useCategories } from '../../hooks/useCategories';
import { useLanguage } from '../../contexts/LanguageContext';
import { LangSwitcher } from '../ui/LangSwitcher';
import { formatPhoneInput, parseProductName } from '../../utils/formatters';
import { getCategoryName, getCategoryDesc } from '../../constants/services';
import type { PortfolioImage } from '../../types';

type OrderModalProps = {
  item: PortfolioImage;
  formatPrice: (p: number | null) => string;
  onClose: () => void;
};

function OrderModal({ item, formatPrice, onClose }: OrderModalProps) {
  const { t, lang } = useLanguage();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      <div className="relative z-10 w-full max-w-4xl glass-card overflow-hidden border border-white/15 shadow-2xl">
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-9 h-9 border border-white/20 bg-navy/80 text-white/70 hover:text-white hover:bg-white/10 transition-colors flex items-center justify-center"
          aria-label={t.orderModal.close}
        >
          <X size={16} />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-[1fr,1.1fr]">
          {/* Left — product image */}
          <div className="relative bg-navy flex items-center justify-center min-h-[260px] md:min-h-[460px]">
            <img
              src={item.image_url}
              alt={productName}
              className="w-full h-full object-contain max-h-[320px] md:max-h-[460px] p-4"
            />
            {/* product info overlay at bottom */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-navy/95 to-transparent px-5 py-4">
              <p className="text-white font-semibold text-base leading-snug">{productName}</p>
              <p className="text-gold text-sm mt-0.5">{priceStr}</p>
            </div>
          </div>

          {/* Right — form */}
          <div className="p-6 md:p-8 flex flex-col">
            <h2 className="font-display text-2xl md:text-3xl text-white mb-1">{t.orderModal.title}</h2>
            <p className="text-white/50 text-sm mb-6">
              {t.orderModal.productLabel}: <span className="text-gold">{productName}</span>
            </p>

            {success ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center gap-4 py-8">
                <div className="w-14 h-14 rounded-full bg-gold/15 border border-gold/40 flex items-center justify-center">
                  <Send className="text-gold" size={24} />
                </div>
                <p className="text-white text-base font-medium">{success}</p>
                <button
                  type="button"
                  onClick={onClose}
                  className="btn-gold mt-2 px-8"
                >
                  {t.orderModal.close}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col flex-1 gap-4">
                <div>
                  <label className="text-white/50 text-sm mb-1.5 block">{t.orderModal.nameLabel}</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t.orderModal.namePlaceholder}
                    required
                    className="w-full bg-white/5 border border-white/10 px-4 py-3 text-white placeholder:text-white/30 focus:border-gold focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="text-white/50 text-sm mb-1.5 block">{t.orderModal.phoneLabel}</label>
                  <div className="relative">
                    <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
                    <input
                      type="tel"
                      inputMode="numeric"
                      value={phone}
                      onChange={(e) => setPhone(formatPhoneInput(e.target.value))}
                      placeholder="+998 XX XXX XX XX"
                      maxLength={17}
                      required
                      className="w-full bg-white/5 border border-white/10 pl-9 pr-4 py-3 text-white placeholder:text-white/30 focus:border-gold focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-white/50 text-sm mb-1.5 block">{t.orderModal.messageLabel}</label>
                  <textarea
                    rows={3}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={t.orderModal.messagePlaceholder}
                    className="w-full bg-white/5 border border-white/10 px-4 py-3 text-white placeholder:text-white/30 focus:border-gold focus:outline-none transition-colors resize-none"
                  />
                </div>

                {error && <p className="text-red-300 text-sm">{error}</p>}

                <button
                  type="submit"
                  disabled={sending}
                  className="btn-gold mt-auto disabled:opacity-60 flex items-center justify-center gap-2"
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
    </div>
  );
}

type ServicePageProps = {
  serviceSlug?: string;
};

export function ServicePage({ serviceSlug }: ServicePageProps) {
  const { t, lang } = useLanguage();
  const { loadingPortfolio, getImagesByCategory } = usePortfolioImages();
  const { getCategoryBySlug, loadingCategories } = useCategories();
  const [selectedItem, setSelectedItem] = useState<PortfolioImage | null>(null);

  const cat = serviceSlug ? getCategoryBySlug(serviceSlug) : undefined;

  const formatPrice = (price: number | null) => {
    if (price === null) return t.servicePage.noPriceLabel;
    return `${price.toLocaleString('ru-RU')} ${t.formatters.currency}`;
  };

  if (!loadingCategories && (!serviceSlug || !cat)) {
    return (
      <div className="min-h-screen bg-navy text-white px-6 py-12">
        <div className="mx-auto max-w-4xl">
          <h1 className="font-display text-4xl mb-4">{t.servicePage.notFound}</h1>
          <a href="/" className="text-gold underline">{t.servicePage.backHome}</a>
        </div>
      </div>
    );
  }

  if (loadingCategories || !cat) {
    return (
      <div className="min-h-screen bg-navy flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
      </div>
    );
  }

  const categoryImages = getImagesByCategory(cat.slug);

  return (
    <div className="min-h-screen bg-navy text-white">
      <div className="px-6 lg:px-[6vw] py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <a href="/" className="inline-flex items-center gap-3">
            <img
              src="/logo/logo.jpg"
              alt="Iskandar Home"
              className="h-10 w-10 rounded-sm object-cover ring-1 ring-gold/50"
            />
            <span className="font-display text-xl">Iskandar Home</span>
          </a>
          <div className="flex items-center gap-4">
            <LangSwitcher />
            <a href="/" className="text-sm text-gold uppercase tracking-wider">
              {t.servicePage.backBtn}
            </a>
          </div>
        </div>

        {/* Page title */}
        <div className="max-w-3xl mb-8">
          <h1 className="font-display text-[clamp(34px,4vw,52px)] mb-3">{getCategoryName(cat, lang)}</h1>
          <p className="text-white/70">{getCategoryDesc(cat, lang)}</p>
        </div>

        {/* Grid */}
        {loadingPortfolio ? (
          <div className="text-white/70">{t.servicePage.loading}</div>
        ) : categoryImages.length === 0 ? (
          <div className="glass-card p-6 text-white/70">{t.servicePage.empty}</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {categoryImages.map((item) => {
              const name = parseProductName(item.product_name ?? item.title, lang) || t.servicePage.noName;
              return (
                <div
                  key={item.id}
                  className="glass-card overflow-hidden border border-transparent hover:border-gold/30 transition-colors flex flex-col"
                >
                  {/* Image */}
                  <button
                    type="button"
                    onClick={() => setSelectedItem(item)}
                    className="flex-1 text-left focus:outline-none"
                    aria-label={name}
                  >
                    <img
                      src={item.image_url}
                      alt={name}
                      className="w-full h-64 object-contain bg-navy"
                      loading="lazy"
                    />
                    <div className="px-4 pt-3">
                      <p className="text-white font-medium text-sm leading-snug">{name}</p>
                      <p className="text-gold text-sm mt-0.5">{formatPrice(item.price)}</p>
                    </div>
                  </button>

                  {/* Order button */}
                  <div className="px-4 pb-4 pt-3">
                    <button
                      type="button"
                      onClick={() => setSelectedItem(item)}
                      className="w-full btn-gold text-sm py-2.5"
                    >
                      {t.servicePage.orderBtn}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Order Modal */}
      {selectedItem && (
        <OrderModal
          item={selectedItem}
          formatPrice={formatPrice}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </div>
  );
}

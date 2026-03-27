import { useLanguage } from '../../contexts/LanguageContext';

export function WorkshopSection() {
  const { t } = useLanguage();

  return (
    <section id="process" className="relative py-20 lg:py-32">
      <div className="px-6 lg:px-[6vw]">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="order-2 lg:order-1">
            <h2 className="section-heading font-display text-[clamp(32px,4vw,48px)] text-white mb-4">
              {t.workshop.title}
            </h2>
            <div className="fade-up w-20 h-[2px] bg-gold mb-6" />
            <p className="fade-up text-gold text-lg mb-4">{t.workshop.accent}</p>
            <p className="fade-up text-white/70 text-base leading-relaxed mb-6">{t.workshop.body}</p>
            <button className="fade-up text-link text-gold text-sm uppercase tracking-wider">
              {t.workshop.link}
            </button>
          </div>
          <div className="order-1 lg:order-2 fade-up">
            <img
              src="/workshop_shelves.jpg"
              alt="Workshop"
              className="w-full h-[400px] lg:h-[500px] object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

import { useLanguage } from '../../contexts/LanguageContext';

export function QualitySection() {
  const { t } = useLanguage();

  return (
    <section className="relative py-20 lg:py-32 bg-navy-light">
      <div className="px-6 lg:px-[6vw]">
        <div className="text-center">
          <h2 className="section-heading font-display text-[clamp(36px,5vw,64px)] text-white mb-6">
            {t.quality.title}
          </h2>
          <div className="fade-up w-24 h-[2px] bg-gold mx-auto mb-8" />
          <p className="fade-up text-white/70 text-lg lg:text-xl max-w-2xl mx-auto leading-relaxed">
            {t.quality.body}
          </p>
        </div>
      </div>
    </section>
  );
}

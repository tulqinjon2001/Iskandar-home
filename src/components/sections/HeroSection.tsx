import { useLanguage } from '../../contexts/LanguageContext';

type Props = {
  scrollToSection: (id: string) => void;
};

export function HeroSection({ scrollToSection }: Props) {
  const { t } = useLanguage();

  return (
    <section id="home" className="relative min-h-screen flex items-center">
      <img src="/hero_facade.jpg" alt="Showroom" className="hero-bg absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-r from-navy/80 via-navy/50 to-navy/70" />

      <div className="hero-content relative z-10 w-full px-6 lg:px-[6vw] py-32">
        <div className="max-w-2xl">
          <h1 className="font-display text-[clamp(40px,6vw,72px)] text-white leading-[0.95] mb-6">
            {t.hero.title}
          </h1>
          <div className="hero-rule w-32 h-[2px] bg-gold mb-8" />
          <p className="text-white/90 text-lg lg:text-xl leading-relaxed mb-8">
            {t.hero.subtitle}
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <button onClick={() => scrollToSection('contact')} className="btn-gold text-sm uppercase tracking-wider">
              {t.hero.cta}
            </button>
            <button onClick={() => scrollToSection('services')} className="text-link text-gold text-sm uppercase tracking-wider px-4 py-3">
              {t.hero.learnMore}
            </button>
          </div>
        </div>
      </div>

      <div className="absolute left-6 lg:left-[6vw] bottom-8">
        <span className="text-xs text-white/50 uppercase tracking-[0.18em]">
          {t.hero.location}
        </span>
      </div>
    </section>
  );
}

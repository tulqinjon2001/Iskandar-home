import { Clock, Layers, ShieldCheck, RefreshCw } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

export function AboutSection({ scrollToContact }: { scrollToContact: () => void }) {
  const { t } = useLanguage();
  const ab = t.about;

  const stats = [
    {
      icon: <Clock size={28} strokeWidth={1.5} />,
      number: ab.stats.experience.number,
      label: ab.stats.experience.label,
    },
    {
      icon: <Layers size={28} strokeWidth={1.5} />,
      number: null,
      label: ab.stats.design.label,
    },
    {
      icon: <ShieldCheck size={28} strokeWidth={1.5} />,
      number: null,
      label: ab.stats.quality.label,
    },
    {
      icon: <RefreshCw size={28} strokeWidth={1.5} />,
      number: null,
      label: ab.stats.fullCycle.label,
    },
  ];

  return (
    <section
      id="about"
      className="relative py-20 lg:py-32 bg-[#faf7f0] overflow-hidden"
    >
      {/* subtle decorative wood-tone gradient edge */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#c9a96e]/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#c9a96e]/40 to-transparent" />
      </div>

      <div className="px-6 lg:px-[6vw] relative z-10">
        {/* Section heading */}
        <div className="text-center mb-14">
          <p className="text-[#c9a96e] text-xs font-semibold uppercase tracking-[0.28em] mb-3">
            Iskandar Home
          </p>
          <h2 className="font-display text-[clamp(32px,4vw,52px)] text-gray-900 leading-tight mb-4">
            {ab.title}
          </h2>
          <div className="w-16 h-[2px] bg-[#c9a96e] mx-auto" />
        </div>

        {/* Two-column main block */}
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center mb-14">

          {/* LEFT — text */}
          <div className="space-y-5">
            {ab.paragraphs.map((para, i) => (
              <p key={i} className="text-gray-700 text-base lg:text-lg leading-relaxed">
                {para}
              </p>
            ))}

            {/* portfolio line */}
            <p className="text-gray-700 text-base lg:text-lg leading-relaxed">
              <span className="font-semibold text-gray-900">{ab.portfolioLabel}: </span>
              {ab.portfolioItems}
            </p>

            {/* goal */}
            <p className="text-[#c9a96e] font-semibold text-lg lg:text-xl italic leading-snug border-l-4 border-[#c9a96e]/60 pl-4">
              {ab.goal}
            </p>

            <button
              type="button"
              onClick={scrollToContact}
              className="mt-2 inline-flex items-center gap-2 bg-[#c9a96e] hover:bg-[#b8945a] text-white font-semibold uppercase tracking-wider text-sm px-8 py-3.5 transition-colors shadow-md"
            >
              {ab.cta}
            </button>
          </div>

          {/* RIGHT — image */}
          <div className="relative">
            <div className="relative overflow-hidden rounded-2xl shadow-2xl">
              <img
                src="/workshop_shelves.jpg"
                alt="Iskandar Home Workshop"
                className="w-full h-[420px] lg:h-[500px] object-cover"
              />
              {/* warm overlay */}
              <div className="absolute inset-0 bg-gradient-to-tr from-[#1a1a2e]/30 via-transparent to-[#c9a96e]/10 rounded-2xl" />
            </div>
            {/* floating badge */}
            <div className="absolute -bottom-5 -left-5 bg-white rounded-xl shadow-xl px-5 py-4 flex items-center gap-3 border border-[#c9a96e]/20">
              <span className="font-display text-3xl text-[#c9a96e] font-bold leading-none">15+</span>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider leading-tight">
                  {t.about.stats.experience.label}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <div
              key={i}
              className="bg-white rounded-xl px-5 py-6 flex flex-col items-center text-center gap-3 shadow-sm border border-[#c9a96e]/15 hover:border-[#c9a96e]/40 hover:shadow-md transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-full bg-[#c9a96e]/10 flex items-center justify-center text-[#c9a96e]">
                {stat.icon}
              </div>
              {stat.number && (
                <span className="font-display text-3xl font-bold text-[#c9a96e] leading-none">
                  {stat.number}
                </span>
              )}
              <p className="text-gray-700 text-sm font-medium leading-snug">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

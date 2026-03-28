import { ChevronRight } from "lucide-react";
import { useLanguage } from "../../contexts/LanguageContext";
import { useCategories } from "../../hooks/useCategories";
import { getCategoryName, getCategoryDesc } from "../../constants/services";

const GRADIENT_CLASSES = [
  "from-[#1a2c4a] to-[#0f1e35]",
  "from-[#2a1a2e] to-[#1a0f1e]",
  "from-[#1a2a1a] to-[#0f1a0f]",
  "from-[#2a221a] to-[#1a140f]",
  "from-[#1a1a2e] to-[#0f0f1e]",
  "from-[#2a1a1a] to-[#1a0f0f]",
  "from-[#1a2a2a] to-[#0f1a1a]",
  "from-[#2a2a1a] to-[#1a1a0f]",
  "from-[#1e1a2a] to-[#130f1a]",
  "from-[#241a1a] to-[#180f0f]",
  "from-[#1a241a] to-[#0f180f]",
];

export function ServicesSection() {
  const { t, lang } = useLanguage();
  const { categories, loadingCategories } = useCategories();

  const openServicePage = (slug: string) => {
    window.location.href = `/services/${slug}`;
  };

  return (
    <section id="services" className="relative py-20 lg:py-32 bg-navy-light">
      <div className="px-6 lg:px-[6vw]">
        <div className="text-center mb-16">
          <h2 className="section-heading font-display text-[clamp(32px,4vw,48px)] text-white mb-4">
            {t.services.sectionTitle}
          </h2>
          <div className="fade-up w-20 h-[2px] bg-gold mx-auto mb-6" />
          <p className="fade-up text-white/70 text-lg max-w-2xl mx-auto">
            {t.services.sectionBody}
          </p>
        </div>

        {loadingCategories ? (
          <div className="services-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl h-52 bg-white/5 animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="services-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((cat, idx) => {
              const gradient = GRADIENT_CLASSES[idx % GRADIENT_CLASSES.length];
              const name = getCategoryName(cat, lang);
              const desc = getCategoryDesc(cat, lang);
              return (
                <button
                  key={cat.slug}
                  type="button"
                  className="service-card-item group relative overflow-hidden rounded-2xl border border-white/10 hover:border-gold/40 cursor-pointer text-left w-full transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/30"
                  onClick={() => openServicePage(cat.slug)}
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-90`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-tr from-gold/0 via-gold/5 to-gold/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <div className="relative z-10 p-6 flex flex-col h-full min-h-[200px]">
                    <div className="flex-1">
                      <div className="w-10 h-10 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center mb-4">
                        <span className="text-gold font-display text-lg font-bold leading-none">
                          {(idx + 1).toString().padStart(2, "0")}
                        </span>
                      </div>
                      <h3 className="font-display text-xl lg:text-2xl text-white mb-2 leading-tight">
                        {name}
                      </h3>
                      <p className="text-white/55 text-sm leading-relaxed line-clamp-2">
                        {desc}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/10">
                      <span className="text-gold/70 text-xs uppercase tracking-wider font-medium">
                        {lang === "ru" ? "Смотреть" : "Ko'rish"}
                      </span>
                      <div className="w-8 h-8 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center group-hover:bg-gold/20 transition-colors">
                        <ChevronRight className="text-gold" size={16} />
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

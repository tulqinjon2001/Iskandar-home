import { ChevronRight } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import type { ServiceCategoryKey } from '../../types';

const SERVICE_KEYS: ServiceCategoryKey[] = ['doors', 'windows', 'stairs', 'furniture', 'flooring', 'metal'];
const SERVICE_IMGS: Record<ServiceCategoryKey, string> = {
  doors:     '/service_doors.jpg',
  windows:   '/service_windows.jpg',
  stairs:    '/service_stairs.jpg',
  furniture: '/service_furniture.jpg',
  flooring:  '/service_flooring.jpg',
  metal:     '/service_metal.jpg',
};

export function ServicesSection() {
  const { t } = useLanguage();

  const openServicePage = (key: ServiceCategoryKey) => {
    window.location.href = `/services/${key}`;
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

        <div className="services-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SERVICE_KEYS.map((key) => {
            const cat = t.services.categories[key];
            return (
              <button
                key={key}
                type="button"
                className="service-card-item service-card group cursor-pointer text-left w-full"
                onClick={() => openServicePage(key)}
              >
                <img src={SERVICE_IMGS[key]} alt={cat.title} />
                <div className="service-card-overlay">
                  <h3 className="font-display text-2xl text-white mb-2">{cat.title}</h3>
                  <p className="text-white/70 text-sm">{cat.desc}</p>
                </div>
                <div className="absolute top-4 right-4 w-10 h-10 bg-gold/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <ChevronRight className="text-gold" size={20} />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

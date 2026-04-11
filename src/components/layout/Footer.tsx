import { useLanguage } from '../../contexts/LanguageContext';

const FOOTER_PHONES = [
  { tel: '+998976809449', display: '+998 (97) 680-94-49' },
  { tel: '+998973453773', display: '+998 (97) 345-37-73' },
] as const;

const footerLinkClass =
  'text-white/50 hover:text-gold text-sm transition-colors underline-offset-2 hover:underline';

export function Footer() {
  const { t } = useLanguage();

  return (
    <div className="mt-20 pt-8 border-t border-white/10 fade-up">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
        <p className="text-white/50 text-sm">{t.footer.copyright}</p>
        <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-6">
          <a
            href="https://www.instagram.com/Iskandar_home/"
            target="_blank"
            rel="noopener noreferrer"
            className={footerLinkClass}
          >
            {t.footer.instagram}
          </a>
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-6">
            {FOOTER_PHONES.map(({ tel, display }) => (
              <a key={tel} href={`tel:${tel}`} className={footerLinkClass}>
                {display}
              </a>
            ))}
          </div>
        </div>
      </div>
      <p className="mt-6 text-center text-white/35 text-xs">
        {t.footer.creditBefore}
        <a
          href="https://pinmap.uz"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gold hover:text-gold transition-colors underline-offset-2 hover:underline"
        >
          pinmap.uz
        </a>
        {t.footer.creditAfter}
      </p>
    </div>
  );
}

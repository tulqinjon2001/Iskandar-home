import { useLanguage } from '../../contexts/LanguageContext';

export function Footer() {
  const { t } = useLanguage();

  return (
    <div className="mt-20 pt-8 border-t border-white/10 fade-up">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
        <p className="text-white/50 text-sm">{t.footer.copyright}</p>
        <div className="flex items-center gap-6">
          <span className="text-white/50 text-sm">{t.footer.instagram}</span>
          <span className="text-white/50 text-sm">{t.footer.telegram}</span>
        </div>
      </div>
    </div>
  );
}

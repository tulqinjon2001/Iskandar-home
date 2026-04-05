import { useLanguage } from '../../contexts/LanguageContext';
import type { Lang } from '../../i18n/translations';

const LANGS: Lang[] = ['uz', 'ru'];

type Props = {
  className?: string;
};

export function LangSwitcher({ className = '' }: Props) {
  const { lang, setLang } = useLanguage();

  return (
    <div className={`flex items-center border border-white/20 rounded-sm overflow-hidden ${className}`}>
      {LANGS.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => setLang(l)}
          className={`px-2 py-1 text-[10px] font-semibold uppercase tracking-wider transition-colors sm:px-2.5 sm:py-1.5 sm:text-xs ${
            lang === l
              ? 'bg-gold text-navy'
              : 'text-white/70 hover:text-white'
          }`}
        >
          {l}
        </button>
      ))}
    </div>
  );
}

import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { LangSwitcher } from '../ui/LangSwitcher';

type NavbarProps = {
  scrollToSection: (id: string) => void;
};

export function Navbar({ scrollToSection }: NavbarProps) {
  const { t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [mobileMenuOpen]);

  const handleNav = (id: string) => {
    scrollToSection(id);
    setMobileMenuOpen(false);
  };

  const navItems = [
    { id: 'about', label: t.nav.about },
    { id: 'services', label: t.nav.services },
    { id: 'process', label: t.nav.process },
    { id: 'contact', label: t.nav.contact },
  ];

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between bg-gradient-to-b from-navy/90 to-transparent px-5 py-4 lg:px-10 lg:py-5">
        <button
          onClick={() => handleNav('home')}
          className="flex items-center gap-3"
          aria-label="Iskandar Home logo"
        >
          <img
            src="/logo/logo.jpg"
            alt="Iskandar Home"
            className="h-9 w-9 rounded-sm object-cover ring-1 ring-gold/50 lg:h-10 lg:w-10"
          />
          <span className="font-display text-sm font-medium tracking-tight text-white lg:text-base">
            Iskandar Home
          </span>
        </button>

        {/* Desktop Nav */}
        <div className="hidden items-center gap-4 lg:flex xl:gap-5">
          {navItems.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => handleNav(id)}
              className="text-[11px] uppercase tracking-wider text-white/80 transition-colors hover:text-gold xl:text-xs"
            >
              {label}
            </button>
          ))}
          <LangSwitcher className="ml-1" />
        </div>

        {/* Mobile Toggle */}
        <div className="lg:hidden flex items-center gap-3">
          <LangSwitcher />
          <button
            className="text-white z-50 relative"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? t.nav.closeMenu : t.nav.openMenu}
          >
            {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-navy/60 backdrop-blur-xl"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed inset-0 z-40 flex flex-col items-center justify-center gap-6 lg:hidden">
            {navItems.map(({ id, label }) => (
              <button
                key={id}
                onClick={() => handleNav(id)}
                className="font-display py-2 text-xl text-white transition-colors hover:text-gold sm:text-2xl"
              >
                {label}
              </button>
            ))}
            <button
              onClick={() => handleNav('contact')}
              className="btn-gold mt-4 text-sm"
            >
              {t.nav.cta}
            </button>
          </div>
        </>
      )}
    </>
  );
}

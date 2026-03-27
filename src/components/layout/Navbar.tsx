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
    { id: 'services', label: t.nav.services },
    { id: 'about',    label: t.nav.about },
    { id: 'process',  label: t.nav.process },
    { id: 'contact',  label: t.nav.contact },
  ];

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 lg:px-12 py-6 flex items-center justify-between bg-gradient-to-b from-navy/90 to-transparent">
        <button
          onClick={() => handleNav('home')}
          className="flex items-center gap-3"
          aria-label="Iskandar Home logo"
        >
          <img
            src="/logo/logo.jpg"
            alt="Iskandar Home"
            className="h-10 w-10 rounded-sm object-cover ring-1 ring-gold/50 lg:h-12 lg:w-12"
          />
          <span className="font-display text-base lg:text-xl text-white font-medium tracking-tight">
            Iskandar Home
          </span>
        </button>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-8">
          {navItems.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => handleNav(id)}
              className="text-sm text-white/80 hover:text-gold transition-colors uppercase tracking-widest"
            >
              {label}
            </button>
          ))}
          <LangSwitcher className="ml-2" />
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
          <div className="fixed inset-0 z-40 flex flex-col items-center justify-center gap-8 lg:hidden">
            {navItems.map(({ id, label }) => (
              <button
                key={id}
                onClick={() => handleNav(id)}
                className="text-3xl text-white font-display hover:text-gold transition-colors py-2"
              >
                {label}
              </button>
            ))}
            <button
              onClick={() => handleNav('contact')}
              className="btn-gold mt-6 text-lg"
            >
              {t.nav.cta}
            </button>
          </div>
        </>
      )}
    </>
  );
}

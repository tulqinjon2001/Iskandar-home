import { Navbar } from '../layout/Navbar';
import { Footer } from '../layout/Footer';
import { HeroSection } from '../sections/HeroSection';
import { InteriorSection } from '../sections/InteriorSection';
import { AboutSection } from '../sections/AboutSection';
import { ServicesSection } from '../sections/ServicesSection';
import { WorkshopSection } from '../sections/WorkshopSection';
import { QualitySection } from '../sections/QualitySection';
import { ContactSection } from '../sections/ContactSection';
import { useEffect } from 'react';
import { useGsapAnimations } from '../../hooks/useGsapAnimations';
import { restoreLandingScrollIfNeeded } from '../../utils/landingScrollRestore';

export function LandingPage() {
  useGsapAnimations(true);

  useEffect(() => {
    restoreLandingScrollIfNeeded();
  }, []);

  const scrollToSection = (id: string) => {
    if (id === 'home' && window.location.hash) {
      window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`);
    }
    if (id === 'works') {
      window.location.hash = 'works';
      requestAnimationFrame(() => {
        document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' });
      });
      return;
    }
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="relative bg-navy min-h-screen">
      <div className="grain-overlay" />
      <div className="vignette-overlay" />

      <Navbar scrollToSection={scrollToSection} />
      <HeroSection scrollToSection={scrollToSection} />
      <InteriorSection />
      <AboutSection scrollToContact={() => scrollToSection('contact')} />
      <ServicesSection />
      <WorkshopSection />
      <QualitySection />
      <ContactSection />

      <section className="relative py-2 bg-navy-light">
        <div className="px-6 lg:px-[6vw]">
          <Footer />
        </div>
      </section>
    </div>
  );
}

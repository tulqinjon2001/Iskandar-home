import { useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function useGsapAnimations(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;

    const ctx = gsap.context(() => {
      // Hero entrance animation
      gsap.fromTo('.hero-bg',
        { scale: 1.05, opacity: 0 },
        { scale: 1, opacity: 1, duration: 1.2, ease: 'power2.out' }
      );

      gsap.fromTo('.hero-content > *',
        { y: -60, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.9, stagger: 0.15, delay: 0.3, ease: 'power2.out' }
      );

      gsap.fromTo('.hero-rule',
        { scaleX: 0 },
        { scaleX: 1, duration: 0.8, delay: 0.6, ease: 'power2.out' }
      );

      // Section headings
      const sectionHeadings = document.querySelectorAll('.section-heading');
      sectionHeadings.forEach((heading) => {
        gsap.fromTo(heading,
          { y: -50, opacity: 0 },
          {
            y: 0, opacity: 1, duration: 0.8, ease: 'power2.out',
            scrollTrigger: { trigger: heading, start: 'top 90%', toggleActions: 'play none none none' }
          }
        );
      });

      // Fade up animations
      const fadeUpElements = document.querySelectorAll('.fade-up');
      fadeUpElements.forEach((el) => {
        gsap.fromTo(el,
          { y: 40, opacity: 0 },
          {
            y: 0, opacity: 1, duration: 0.7, ease: 'power2.out',
            scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none none' }
          }
        );
      });

      // Service cards stagger
      gsap.fromTo('.service-card-item',
        { y: 30, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: 'power2.out',
          scrollTrigger: { trigger: '.services-grid', start: 'top 80%', toggleActions: 'play none none none' }
        }
      );

      // USP cards
      gsap.fromTo('.usp-card',
        { y: 20, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: 'power2.out',
          scrollTrigger: { trigger: '.usp-grid', start: 'top 85%', toggleActions: 'play none none none' }
        }
      );
    });

    return () => ctx.revert();
  }, [enabled]);
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from '../../context/AuthContext';
import { AboutNavbar } from './AboutNavbar';
import { FoundersSection } from './FoundersSection';
import { StudioVisualGuide } from './StudioVisualGuide';
import { ComponentCatalogSection } from './ComponentCatalogSection';
import { ToolbarActionsGuide } from './ToolbarActionsGuide';
import { AboutFooter } from './AboutFooter';
import { LoginPage } from '../auth/LoginPage';
import { ArrowLeft, ChevronUp } from 'lucide-react';

interface AboutAppProps {
  isModal?: boolean;
  onClose?: () => void;
}

const AboutContent: React.FC<AboutAppProps> = ({ isModal = false, onClose }) => {
  const { loginViewOpen, setLoginViewOpen } = useAuth();
  const [activeSection, setActiveSection] = useState('founders');
  const [showScrollTop, setShowScrollTop] = useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scrollTarget = isModal && containerRef.current ? containerRef.current.parentElement || window : window;
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScroll = scrollTarget === window ? window.scrollY : (scrollTarget as HTMLElement).scrollTop;
          setShowScrollTop(currentScroll > 400);

          const scrollPos = currentScroll + 150;
          const sections = ['founders', 'studio-guide', 'components', 'toolbar'];
          for (const sectionId of sections) {
            const el = document.getElementById(sectionId);
            if (el) {
              const top = el.offsetTop;
              const height = el.offsetHeight;
              if (scrollPos >= top && scrollPos < top + height) {
                setActiveSection(sectionId);
                break;
              }
            }
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    scrollTarget.addEventListener('scroll', handleScroll, { passive: true });
    return () => scrollTarget.removeEventListener('scroll', handleScroll);
  }, [isModal]);

  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const scrollToTop = () => {
    if (isModal && containerRef.current && containerRef.current.parentElement) {
      containerRef.current.parentElement.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (loginViewOpen) {
    return <LoginPage onBackToStudio={() => setLoginViewOpen(false)} />;
  }

  return (
    <div ref={containerRef} className="min-h-screen bg-[#000000] text-[#F5F5F5] flex flex-col selection:bg-[#8F8F8F]/30 selection:text-[#F5F5F5]">
      {/* Sticky Header Navigation */}
      <AboutNavbar activeSection={activeSection} onNavigate={scrollToSection} onBackToStudio={onClose} />

      {/* Main Content Sections */}
      <main className="flex-1">
        <FoundersSection />
        <StudioVisualGuide />
        <ComponentCatalogSection />
        <ToolbarActionsGuide />
      </main>

      {/* Footer */}
      <AboutFooter />

      {/* Floating Action Button for Easy Navigation on Tablets & Mobile */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-2.5">
        {showScrollTop && (
          <button
            onClick={scrollToTop}
            className="w-11 h-11 rounded-2xl bg-[#000000]/90 border border-[#FFFFFF]/30 hover:border-[#FFFFFF]/60 text-[#E8E8E8] hover:text-[#F5F5F5] flex items-center justify-center shadow-xl backdrop-blur transition-all active:scale-95 cursor-pointer"
            title="Scroll to top"
            aria-label="Scroll to top"
          >
            <ChevronUp className="w-5 h-5" />
          </button>
        )}

        {!isModal && (
          <a
            href="./"
            className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-[#FFFFFF] hover:bg-[#E8E8E8] text-[#000000] font-bold text-xs sm:text-sm shadow-xl shadow-[#FFFFFF]/25 transition-all active:scale-95"
            title="Return to DigiLogic Circuit Studio"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Launch Studio</span>
          </a>
        )}
      </div>
    </div>
  );
};

export const AboutApp: React.FC<AboutAppProps> = (props) => {
  return (
    <AuthProvider>
      <AboutContent {...props} />
    </AuthProvider>
  );
};

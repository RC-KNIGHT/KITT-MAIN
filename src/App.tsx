/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, Suspense, lazy } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Navbar } from './components/Navbar';
import { HeroVideo } from './components/HeroVideo';
import { SignatureHeroK } from './components/SignatureHeroK';
import { DirectEcosystemAccess } from './components/DirectEcosystemAccess';
import { AiChatDemo } from './components/AiChatDemo';
import { StudentJourney } from './components/StudentJourney';
import { PricingSection } from './components/PricingSection';
import { CommunityAndReviewsSpiral } from './components/CommunityAndReviewsSpiral';
import { HeroPromptBuilder } from './components/HeroPromptBuilder';
import { TeamSection } from './components/TeamSection';
import { Footer } from './components/Footer';
import { Deep3DSpaceBackdrop } from './components/Deep3DSpaceBackdrop';
import { PremiumLogicGatesMatrix } from './components/PremiumLogicGatesMatrix';
import { RootErrorBoundary } from './components/ErrorBoundary';
import { KittLogo } from './components/KittLogo';
import { SurrealAuraCursor } from './components/SurrealAuraCursor';

const KittAiStudio = lazy(() => import('./components/kitt-ai/KittAiStudio').then(m => ({ default: m.KittAiStudio })));
const WorkspaceApp = lazy(() => import('./components/workspace/WorkspaceApp').then(m => ({ default: m.WorkspaceApp })));
const DigiLogicStudio = lazy(() => import('./components/digilogic/App').then(m => ({ default: m.DigiLogicStudio })));
const NumberTrainerStudio = lazy(() => import('./components/number-trainer/NumberTrainerStudio').then(m => ({ default: m.NumberTrainerStudio })));

const StudioLoadingFallback = ({ title }: { title: string }) => (
  <div className="w-screen h-screen bg-[#000000] text-[#F5F5F5] flex flex-col items-center justify-center font-mono select-none space-y-4">
    <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-[#FFFFFF]/10 border border-[#FFFFFF]/40 text-[#FFFFFF] shadow-[0_0_30px_rgba(255,255,255,0.25)]">
      <KittLogo size={36} showGlow={true} />
    </div>
    <div className="flex items-center gap-2.5 text-xs text-[#F5F5F5] font-semibold tracking-widest uppercase">
      <div className="w-3.5 h-3.5 border-2 border-[#FFFFFF] border-t-transparent rounded-full animate-spin" />
      <span>MOUNTING {title}</span>
    </div>
  </div>
);

function parseRoute(): 'landing' | 'digilogic' | 'number-trainer' | 'kitt-ai' | 'workspace' {
  if (typeof window === 'undefined') return 'landing';
  const hash = window.location.hash.toLowerCase();
  if (hash.startsWith('#/workspace') || hash === '#workspace') return 'workspace';
  if (hash.startsWith('#/kitt-ai') || hash === '#kitt-ai') return 'kitt-ai';
  if (hash.startsWith('#/digilogic') || hash === '#digilogic') return 'digilogic';
  if (hash.startsWith('#/number-trainer') || hash === '#number-trainer') return 'number-trainer';
  return 'landing';
}

export default function App() {
  const [route, setRoute] = useState<'landing' | 'digilogic' | 'number-trainer' | 'kitt-ai' | 'workspace'>(parseRoute);

  useEffect(() => {
    const handleHashChange = () => {
      setRoute(parseRoute());
      window.scrollTo(0, 0);
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  return (
    <RootErrorBoundary>
      <AnimatePresence mode="wait">
        {route === 'digilogic' && (
          <motion.div
            key="digilogic"
            initial={{ opacity: 0, scale: 0.995 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.005 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="w-screen h-screen bg-[#000000] overflow-hidden"
          >
            <Suspense fallback={<StudioLoadingFallback title="DIGILOGIC EDA" />}>
              <DigiLogicStudio />
            </Suspense>
          </motion.div>
        )}

        {route === 'number-trainer' && (
          <motion.div
            key="number-trainer"
            initial={{ opacity: 0, scale: 0.995 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.005 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="w-full min-h-screen bg-[#000000] overflow-y-auto overflow-x-hidden"
          >
            <Suspense fallback={<StudioLoadingFallback title="NUMBER TRAINER" />}>
              <NumberTrainerStudio onBackToHome={() => { window.location.hash = '#/'; }} />
            </Suspense>
          </motion.div>
        )}

        {route === 'kitt-ai' && (
          <motion.div
            key="kitt-ai"
            initial={{ opacity: 0, scale: 0.998 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.002 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="w-screen h-screen bg-[#000000] overflow-hidden"
          >
            <Suspense fallback={<StudioLoadingFallback title="KITT SOVEREIGN AI" />}>
              <KittAiStudio initialCanvasView="2d" />
            </Suspense>
          </motion.div>
        )}

        {route === 'workspace' && (
          <motion.div
            key="kitt-workspace"
            initial={{ opacity: 0, scale: 0.998 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.002 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="w-screen h-screen bg-[#000000] overflow-hidden"
          >
            <Suspense fallback={<StudioLoadingFallback title="KITT WORKSPACE" />}>
              <WorkspaceApp />
            </Suspense>
          </motion.div>
        )}

      {route === 'landing' && (
        <motion.div
          key="landing"
          initial={{ opacity: 0, scale: 0.985 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
          className="min-h-screen bg-[#000000] text-[#F5F5F5] selection:bg-[#8F8F8F]/40 selection:text-[#F5F5F5] antialiased font-sans relative overflow-x-hidden"
        >

      {/* Cinematic Micro-Spark & Magnetic Aura Cursor */}
      <SurrealAuraCursor />

      {/* Deep 3D Infinite Space Backdrop: Stars, 3D Grid & Floating Orbital Glyphs */}
      <Deep3DSpaceBackdrop />

      {/* Logic Gates & Electronics Circuit Simulation Matrix (AND, OR, NOT, XOR, ICs) */}
      <PremiumLogicGatesMatrix />

      {/* Atmospheric Ambient Lighting Layers: Oceanic Teal top haze & Antique Gold bottom glow */}
      <div className="fixed inset-0 pointer-events-none z-0 bg-teal-haze" />
      <div className="fixed inset-0 pointer-events-none z-0 bg-gold-haze opacity-70" />
      <div className="fixed inset-0 pointer-events-none z-0 bg-surreal-grid opacity-25" />
      
      {/* Deep Space Vignette for cinematic focus */}
      <div 
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: 'radial-gradient(ellipse 90% 70% at 50% 50%, transparent 45%, rgba(0, 0, 0, 0.70) 100%)'
        }}
      />

      {/* Global Scroll-Driven 3D Particle System in Sand, Teal & Antique Gold */}
      <SignatureHeroK />

      {/* Sticky Top Navigation with Sculpted Glass & Gold/Sand Details */}
      <Navbar />

      {/* Main Content Sections */}
      <main className="relative z-10">
        {/* 1. Hero with Procedural 10-Second Engineering Sequence Video Demo & Prompt Input */}
        <HeroVideo />

        {/* 2. Direct Ecosystem Access: 4 Core Platform Portals */}
        <DirectEcosystemAccess />

        {/* 3. AI Chat & Engineering Architecture Synthesizer */}
        <AiChatDemo />

        {/* 7. Student to Professional Engineering Roadmap */}
        <StudentJourney />

        {/* 8. Transparent Plans, Billing Toggle & AI Token Meter (Paid Plan System) */}
        <PricingSection />

        {/* 9. Dual 3D Infinite Spiral: Community Projects (Left) & User Reviews (Right) */}
        <CommunityAndReviewsSpiral />

        {/* 11. Autonomous Synthesizer: What do you want to build? - placed just above team member info */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-transparent relative z-20">
          <HeroPromptBuilder />
        </section>

        {/* 12. Founding Team & Core Innovators Roster */}
        <TeamSection />
      </main>

      {/* Comprehensive Ecosystem Footer */}
      <Footer />
    </motion.div>
  )}
</AnimatePresence>
    </RootErrorBoundary>
  );
}

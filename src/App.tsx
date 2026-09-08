/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HeroVideo } from './components/HeroVideo';
import { SignatureHeroK } from './components/SignatureHeroK';
import { DirectEcosystemAccess } from './components/DirectEcosystemAccess';
import { AiChatDemo } from './components/AiChatDemo';
import { StudentJourney } from './components/StudentJourney';
import { CommunitySection } from './components/CommunitySection';
import { PricingSection } from './components/PricingSection';
import { HeroPromptBuilder } from './components/HeroPromptBuilder';
import { TeamSection } from './components/TeamSection';
import { Footer } from './components/Footer';

export default function App() {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const docHeight = Math.max(
        document.body.scrollHeight,
        document.documentElement.scrollHeight
      );
      const totalHeight = docHeight - window.innerHeight;
      if (totalHeight > 0) {
        setScrollProgress(Math.min(1, Math.max(0, window.scrollY / totalHeight)));
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#080f14] text-[#E5E1DD] selection:bg-[#407E8C]/40 selection:text-[#E5E1DD] antialiased font-sans relative overflow-x-hidden">
      {/* Dynamic Luxury Hairline Progress Indicator */}
      <div className="fixed top-0 left-0 right-0 h-[2px] z-[60] pointer-events-none bg-transparent">
        <div 
          className="h-full bg-gradient-to-r from-[#A58D66] via-[#76B4C2] to-[#E5E1DD] shadow-[0_0_12px_rgba(165,141,102,0.9)] transition-all duration-75 ease-out"
          style={{ width: `${(scrollProgress * 100).toFixed(2)}%` }}
        />
      </div>

      {/* Atmospheric Ambient Lighting Layers: Oceanic Teal top haze & Antique Gold bottom glow */}
      <div className="fixed inset-0 pointer-events-none z-0 bg-teal-haze" />
      <div className="fixed inset-0 pointer-events-none z-0 bg-gold-haze opacity-70" />
      <div className="fixed inset-0 pointer-events-none z-0 bg-surreal-grid opacity-25" />
      
      {/* Deep Space Vignette for cinematic focus */}
      <div 
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: 'radial-gradient(ellipse 90% 70% at 50% 50%, transparent 45%, rgba(8, 15, 20, 0.70) 100%)'
        }}
      />

      {/* Global Scroll-Driven 3D Particle System in Sand, Teal & Antique Gold */}
      <SignatureHeroK />

      {/* Sticky Top Navigation with Sculpted Glass & Gold/Sand Details */}
      <Navbar />

      {/* Main Content Sections elevated above background dreamscape */}
      <main className="relative z-10">
        {/* 1. Hero with Procedural 10-Second Engineering Sequence Video Demo & Prompt Input */}
        <HeroVideo />

        {/* 2. Direct Ecosystem Access: 4 Core Platform Portals */}
        <DirectEcosystemAccess />

        {/* 3. AI Chat & Engineering Architecture Synthesizer */}
        <AiChatDemo />

        {/* 7. Student to Professional Engineering Roadmap */}
        <StudentJourney />

        {/* 8. Community Showcase with Working Ratings, Likes & Comments */}
        <CommunitySection />

        {/* 9. Transparent Plans, Billing Toggle & AI Token Meter */}
        <PricingSection />

        {/* 11. Autonomous Synthesizer: What do you want to build? - placed just above team member info */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-transparent relative z-20">
          <HeroPromptBuilder />
        </section>

        {/* 12. Founding Team & Core Innovators Roster */}
        <TeamSection />
      </main>

      {/* Comprehensive Ecosystem Footer */}
      <Footer />
    </div>
  );
}

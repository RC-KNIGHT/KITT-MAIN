/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { KittLogo } from '../../../KittLogo';
import {
  Mail,
  Check,
  Copy,
  Sparkles,
  Cpu,
  GraduationCap,
  ShieldCheck,
  Send,
  Terminal,
  Code2,
  Heart,
  ArrowRight,
} from 'lucide-react';

export const FoundersSection: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const email = 'kitt.ai.team@gmail.com';

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <section id="founders" className="py-12 sm:py-16 border-b border-[#FFFFFF]/15">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFFFFF]/10 border border-[#FFFFFF]/30 text-[#E8E8E8] text-xs font-mono mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Engineering Team & Vision</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#F5F5F5] tracking-tight leading-tight mb-4">
            Meet the Creators: <span className="text-[#E8E8E8]">Team KITT</span>
          </h1>
          <p className="text-base sm:text-lg text-[#F5F5F5]/60 leading-relaxed">
            Engineered by <strong className="text-[#F5F5F5]">Team KITT</strong> — building the next-generation, high-performance digital logic simulation laboratory for students, educators, and hardware engineers worldwide.
          </p>
        </div>

        {/* Team KITT Profile Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* Team KITT - Core Systems */}
          <div className="bg-[#141415] border border-[#FFFFFF]/20 rounded-3xl p-6 sm:p-8 relative overflow-hidden group hover:border-[#FFFFFF]/50 transition-all shadow-xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#FFFFFF]/5 rounded-full blur-2xl pointer-events-none group-hover:bg-[#FFFFFF]/10 transition-all" />
            <div className="flex items-start gap-4 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-[#000000] border border-[#FFFFFF]/40 p-1 flex items-center justify-center shadow-lg shadow-[#FFFFFF]/20 shrink-0">
                <KittLogo size={46} showGlow={true} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-[#F5F5F5]">Team KITT</h3>
                  <span className="px-2 py-0.5 rounded-md bg-[#FFFFFF]/10 border border-[#FFFFFF]/30 text-[#E8E8E8] text-[11px] font-mono">
                    Core Engineering
                  </span>
                </div>
                <p className="text-xs text-[#F5F5F5]/60 font-mono mt-0.5">Hardware Systems & Logic Engine Design</p>
              </div>
            </div>
            <p className="text-sm text-[#E8E8E8] leading-relaxed mb-6">
              Dedicated to electrical engineering, computer architecture, and reactive computing systems. Architecting a zero-latency digital logic simulation engine with real-time waveform inspection, truth table extraction, and multi-user collaborative synchronization.
            </p>
            <div className="flex flex-wrap gap-2 pt-4 border-t border-[#FFFFFF]/15 text-xs font-mono text-[#F5F5F5]/60">
              <span className="px-2.5 py-1 rounded-lg bg-[#000000] border border-[#FFFFFF]/15 text-[#E8E8E8]">Boolean Minimization</span>
              <span className="px-2.5 py-1 rounded-lg bg-[#000000] border border-[#FFFFFF]/15 text-[#E8E8E8]">Propagation Physics</span>
              <span className="px-2.5 py-1 rounded-lg bg-[#000000] border border-[#FFFFFF]/15 text-[#E8E8E8]">Real-Time Sync</span>
            </div>
          </div>

          {/* Team KITT - Interactive Lab & UX */}
          <div className="bg-[#141415] border border-[#FFFFFF]/20 rounded-3xl p-6 sm:p-8 relative overflow-hidden group hover:border-[#FFFFFF]/50 transition-all shadow-xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#FFFFFF]/5 rounded-full blur-2xl pointer-events-none group-hover:bg-[#FFFFFF]/10 transition-all" />
            <div className="flex items-start gap-4 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#E8E8E8] to-[#FFFFFF] p-0.5 shadow-lg shadow-[#FFFFFF]/20 shrink-0">
                <div className="w-full h-full bg-[#000000] rounded-[14px] flex items-center justify-center font-mono font-bold text-xl text-[#E8E8E8]">
                  UX
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-[#F5F5F5]">Lab & Experience</h3>
                  <span className="px-2 py-0.5 rounded-md bg-[#FFFFFF]/10 border border-[#FFFFFF]/30 text-[#E8E8E8] text-[11px] font-mono">
                    Interactive Design
                  </span>
                </div>
                <p className="text-xs text-[#F5F5F5]/60 font-mono mt-0.5">Core Simulator & UX Engineering</p>
              </div>
            </div>
            <p className="text-sm text-[#E8E8E8] leading-relaxed mb-6">
              Specializing in intuitive interactive educational graphics, multi-touch canvas routing, and tactile tablet workflows. Focused on making complex computer science concepts — from basic logic gates to 4-bit ALUs and sequential flip-flops — immediately tangible for learners.
            </p>
            <div className="flex flex-wrap gap-2 pt-4 border-t border-[#FFFFFF]/15 text-xs font-mono text-[#F5F5F5]/60">
              <span className="px-2.5 py-1 rounded-lg bg-[#000000] border border-[#FFFFFF]/15 text-[#E8E8E8]">Multi-Touch UX</span>
              <span className="px-2.5 py-1 rounded-lg bg-[#000000] border border-[#FFFFFF]/15 text-[#E8E8E8]">Orthogonal Routing</span>
              <span className="px-2.5 py-1 rounded-lg bg-[#000000] border border-[#FFFFFF]/15 text-[#E8E8E8]">Modular IC Subcircuits</span>
            </div>
          </div>
        </div>

        {/* Contact Team KITT & Engineering Support Banner */}
        <div className="bg-[#000000] border border-[#FFFFFF]/30 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl">
          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="text-left max-w-2xl">
              <div className="flex items-center gap-2 text-[#FFFFFF] text-xs font-mono uppercase tracking-wider mb-2">
                <Mail className="w-4 h-4" />
                <span>Team KITT Direct Engineering Support</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-[#F5F5F5] mb-2">
                Have an architectural question or inquiry for the Lab?
              </h3>
              <p className="text-sm text-[#E8E8E8] leading-relaxed mb-4">
                We read and respond to messages from professors, students, and engineers across the global hardware ecosystem. You can reach Team KITT directly via email.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                {/* Email Address Pill with Copy button */}
                <div className="flex items-center bg-[#141415] border border-[#FFFFFF]/25 rounded-xl px-3 py-2 gap-2 text-xs font-mono text-[#E8E8E8]">
                  <span className="select-all font-semibold">{email}</span>
                  <button
                    onClick={handleCopyEmail}
                    className="p-1 rounded-lg hover:bg-[#000000] text-[#F5F5F5]/60 hover:text-[#F5F5F5] transition-all cursor-pointer"
                    title="Copy email to clipboard"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-[#B4B4B4]" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                {copied && (
                  <span className="text-xs text-[#B4B4B4] font-mono animate-fade-in">
                    Copied to clipboard!
                  </span>
                )}
              </div>
            </div>

            {/* Action button */}
            <div className="flex items-center gap-3 w-full lg:w-auto">
              <a
                href="mailto:kitt.ai.team@gmail.com?subject=KITT%20Ecosystem%20Inquiry&body=Hi%20Team%20KITT,%0A%0AI%20am%20interested%20in%20connecting%20with%20your%20team:"
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#FFFFFF] to-[#737373] hover:from-[#E8E8E8] hover:to-[#FFFFFF] text-[#000000] font-bold text-xs sm:text-sm transition-all shadow-lg shadow-[#FFFFFF]/20 active:scale-95 cursor-pointer"
              >
                <Mail className="w-4 h-4" />
                <span>Send Direct Email</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

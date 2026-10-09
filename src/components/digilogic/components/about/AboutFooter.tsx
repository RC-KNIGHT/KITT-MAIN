/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ArrowLeft, Heart, Mail, Star, Users, ExternalLink } from 'lucide-react';
import { KittLogo } from '../../../KittLogo';

export const AboutFooter: React.FC = () => {
  return (
    <footer className="bg-[#000000] border-t border-[#FFFFFF]/20 py-12 text-[#F5F5F5]/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-12">
          {/* Col 1: Brand & Founders Info */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-2.5">
              <KittLogo size={28} showGlow={true} />
              <span className="font-bold text-base tracking-tight text-[#F5F5F5] font-mono">DigiLogic Lab</span>
            </div>
            <p className="text-xs text-[#F5F5F5]/60 leading-relaxed max-w-sm">
              An open, interactive digital logic gate simulator and microarchitecture laboratory engineered by <strong className="text-[#F5F5F5]">Team KITT</strong>. Designed for tablet and desktop computers to accelerate electrical and computer engineering education.
            </p>
            <div className="pt-2">
              <a
                href="./"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FFFFFF] hover:bg-[#E8E8E8] text-[#000000] font-bold text-xs transition-all shadow-lg shadow-[#FFFFFF]/20 active:scale-95"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Launch Interactive Studio</span>
              </a>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="md:col-span-3 space-y-3">
            <h5 className="text-xs font-mono font-bold uppercase tracking-wider text-[#F5F5F5]">
              Guide & Resources
            </h5>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#founders" className="hover:text-[#E8E8E8] transition-colors">
                  Meet Team KITT
                </a>
              </li>
              <li>
                <a href="#studio-guide" className="hover:text-[#E8E8E8] transition-colors">
                  Studio Interface Tour
                </a>
              </li>
              <li>
                <a href="#components" className="hover:text-[#E8E8E8] transition-colors">
                  Component Encyclopedia
                </a>
              </li>
              <li>
                <a href="#toolbar" className="hover:text-[#E8E8E8] transition-colors">
                  Toolbar Actions & Shortcuts
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Direct Contact */}
          <div className="md:col-span-4 space-y-3">
            <h5 className="text-xs font-mono font-bold uppercase tracking-wider text-[#F5F5F5]">
              Direct Engineering Contact
            </h5>
            <p className="text-xs text-[#F5F5F5]/60 leading-relaxed">
              Have architectural inquiries, lab suggestions, or questions? Contact Team KITT directly:
            </p>
            <a
              href="mailto:kitt.ai.team@gmail.com"
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#000000] border border-[#FFFFFF]/20 hover:border-[#FFFFFF] text-[#E8E8E8] text-xs font-mono transition-all w-fit cursor-pointer"
            >
              <Mail className="w-3.5 h-3.5 text-[#FFFFFF]" />
              <span>kitt.ai.team@gmail.com</span>
            </a>
          </div>
        </div>

        {/* Bottom copyright line */}
        <div className="pt-8 border-t border-[#FFFFFF]/15 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-[#F5F5F5]/45">
          <div>
            © {new Date().getFullYear()} DigiLogic Lab • Team KITT. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <a href="#/digilogic" className="hover:text-[#E8E8E8] transition-colors">
              Interactive Canvas
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

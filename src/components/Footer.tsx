import React from 'react';
import { 
  Sparkles, 
  ExternalLink, 
  Layers, 
  Cpu, 
  Calculator, 
  Activity,
  Heart
} from 'lucide-react';
import { ECOSYSTEM_PRODUCTS } from '../data/ecosystem';
import { KittLogo } from './KittLogo';

export const Footer: React.FC = () => {
  const SOCIAL_CHANNELS = [
    {
      id: 'instagram',
      name: 'Instagram',
      url: '#', // Ready for user's official link
      icon: (
        <svg className="w-4 h-4 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
          <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
        </svg>
      )
    },
    {
      id: 'youtube',
      name: 'YouTube',
      url: '#', // Ready for user's official link
      icon: (
        <svg className="w-4 h-4 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
          <polygon points="10 15 15 12 10 9" fill="currentColor" />
        </svg>
      )
    },
    {
      id: 'x',
      name: 'X (Twitter)',
      url: '#', // Ready for user's official link
      icon: (
        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      )
    },
    {
      id: 'facebook',
      name: 'Facebook',
      url: '#', // Ready for user's official link
      icon: (
        <svg className="w-4 h-4 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
        </svg>
      )
    }
  ];

  return (
    <footer className="bg-transparent border-t border-[#A58D66]/20 text-[#E5E1DD]/70 text-xs relative z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          
          {/* Col 1 & 2: Brand & Tagline */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <KittLogo size={36} showGlow={true} />
              <span className="text-xl font-bold tracking-widest text-[#E5E1DD] font-mono">
                KITT <span className="text-[#A58D66] font-serif italic">ECOSYSTEM</span>
              </span>
            </div>

            <p className="text-sm font-serif italic max-w-sm animate-text-shimmer font-semibold">
              "Where Ideas Become Inventions."
            </p>

            <p className="text-xs text-[#E5E1DD]/65 max-w-sm leading-relaxed">
              The premier AI-native hardware creation sanctuary. Turn conversational thought into working silicon.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <span className="w-2 h-2 rounded-full bg-[#407E8C] animate-pulse shadow-[0_0_8px_#407E8C]" />
              <span className="text-[11px] font-mono text-[#407E8C]">
                All 4 Ecosystem Portals Synchronized
              </span>
            </div>
          </div>

          {/* Col 3: Direct Ecosystem Access */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-[#A58D66]">
              Core Portals
            </h4>
            <ul className="space-y-2">
              {ECOSYSTEM_PRODUCTS.map((prod) => (
                <li key={prod.id}>
                  <a
                    href={prod.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#E5E1DD] transition-colors flex items-center gap-1.5 group"
                  >
                    <span className="group-hover:translate-x-0.5 transition-transform">{prod.name}</span>
                    <ExternalLink className="w-3 h-3 text-[#A58D66]/50 group-hover:text-[#A58D66]" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Engineering Resources */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-[#A58D66]">
              Synthesis & Docs
            </h4>
            <ul className="space-y-2">
              <li>
                <a 
                  href="https://kitt-ai-ravi.ai.studio" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-[#E5E1DD] transition-colors"
                >
                  3D Component Library
                </a>
              </li>
              <li>
                <a href="#ai-agent" className="hover:text-[#E5E1DD] transition-colors">
                  Autonomous Synthesis Engine
                </a>
              </li>
              <li>
                <a href="#journey" className="hover:text-[#E5E1DD] transition-colors">
                  Student to Pro Learning Path
                </a>
              </li>
              <li>
                <a href="#community" className="hover:text-[#E5E1DD] transition-colors">
                  Salon of Open Hardware
                </a>
              </li>
            </ul>
          </div>

          {/* Col 5: Company & Legal */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-[#A58D66]">
              Collective & Governance
            </h4>
            <ul className="space-y-2">
              <li>
                <a href="#team" className="hover:text-[#E5E1DD] text-[#A58D66] font-medium transition-colors flex items-center gap-1">
                  <span>Core Team & Architects</span>
                </a>
              </li>
              <li>
                <a href="#pricing" className="hover:text-[#E5E1DD] transition-colors">
                  Pricing & Synthesis Units
                </a>
              </li>
              <li>
                <a href="#journey" className="hover:text-[#E5E1DD] transition-colors">
                  Academic Classrooms
                </a>
              </li>
              <li>
                <span className="text-[#E5E1DD]/40">Security & DRC Sandbox</span>
              </li>
              <li>
                <span className="text-[#E5E1DD]/40">Privacy & Sovereign IP Terms</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Official Social Media Channels Dock */}
        <div className="mt-12 pt-6 border-t border-[#A58D66]/20 flex flex-col sm:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono font-bold tracking-widest uppercase text-[#A58D66]">
              Official Channels
            </span>
            <span className="text-[11px] font-mono text-[#E5E1DD]/50 italic">
              — Connect with the vanguard
            </span>
          </div>

          <div className="flex items-center gap-3">
            {SOCIAL_CHANNELS.map((item) => (
              <a
                key={item.id}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                title={`${item.name} (Official Channel)`}
                className="w-9 h-9 rounded-xl bg-[#0d161d]/85 border border-[#A58D66]/30 hover:border-[#A58D66] hover:bg-[#407E8C]/20 flex items-center justify-center text-[#E5E1DD]/80 hover:text-[#A58D66] transition-all hover:scale-110 shadow-lg hover:shadow-[0_0_15px_rgba(165,141,102,0.3)]"
              >
                {item.icon}
              </a>
            ))}
          </div>
        </div>

        {/* Bottom Copyright Strip */}
        <div className="mt-8 pt-6 border-t border-[#A58D66]/15 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#E5E1DD]/50 font-mono">
          <div>
            © {new Date().getFullYear()} KITT ECOSYSTEM. Synthesized for innovators, electrical engineers, and students of creation.
          </div>
          <div className="flex items-center gap-2 text-right">
            <span className="text-[#A58D66] animate-pulse">✦</span>
            <span className="text-[#E5E1DD]/80 font-serif italic text-xs tracking-wide">
              Engineered for the vanguard of builders who forge hardware that endures.
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

import React from 'react';
import { Users, Sparkles, Terminal, Award } from 'lucide-react';

export interface TeamMember {
  id: string;
  name: string;
  emoji: string;
  role: string;
  intro: string;
  isLead?: boolean;
}

export const TEAM_MEMBERS: TeamMember[] = [
  {
    id: 'ravi-chaturvedi',
    name: 'Ravi Chaturvedi',
    emoji: '🚀',
    role: 'Founder & Lead Innovator',
    intro: 'Vision, Product & Core Development',
    isLead: true,
  },
  {
    id: 'roshan-vishwakarma',
    name: 'Roshan Vishwakarma',
    emoji: '🌐',
    role: 'Ecosystem & Growth Lead',
    intro: 'Registrations, Outreach & Opportunities',
  },
  {
    id: 'sriyansh-raj',
    name: 'Sriyansh Raj',
    emoji: '⚙️',
    role: 'Chief Backend Architect',
    intro: 'Backend, Systems & Infrastructure',
  },
  {
    id: 'harshdeep-singh',
    name: 'Harshdeep Singh',
    emoji: '🎤',
    role: 'Chief Pitch & Communications Lead',
    intro: 'Pitching, Representation & Storytelling',
  },
  {
    id: 'aksshit',
    name: 'Aksshit',
    emoji: '📢',
    role: 'Creative & Growth Strategist',
    intro: 'Design, Social Media & Opportunities',
  },
  {
    id: 'devashish-kumar-mahto',
    name: 'Devashish Kumar Mahto',
    emoji: '🏗️',
    role: 'Chief Architect & Vision Speaker',
    intro: 'Architecture, Pitching & Technical Vision',
  },
];

export const TeamSection: React.FC = () => {
  return (
    <section 
      id="team" 
      className="py-24 px-4 sm:px-6 lg:px-8 bg-transparent relative z-20 border-t border-[#A58D66]/15"
    >
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#A58D66]/15 border border-[#A58D66]/35 text-[#A58D66] text-xs font-mono tracking-widest uppercase animate-ambition">
            <Users className="w-3.5 h-3.5 text-[#A58D66]" />
            <span>THE ARCHITECTS</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-serif tracking-tight text-[#E5E1DD]">
            The Minds Behind <br />
            <span className="animate-text-shimmer italic font-cormorant font-normal block mt-1 text-4xl sm:text-6xl">
              KITT ECOSYSTEM
            </span>
          </h2>

          <p className="text-base sm:text-lg text-[#E5E1DD]/80 font-serif italic max-w-xl mx-auto leading-relaxed">
            "Turning pure human thought into physical silicon and sovereign hardware."
          </p>
        </div>

        {/* Structured Engineering Roster Table (Crystal Clear Transparent Glass) */}
        <div className="transparent-glass-card rounded-2xl border border-[#A58D66]/25 bg-black/15 shadow-none overflow-hidden backdrop-blur-[1px]">
          {/* Table Header Strip */}
          <div className="bg-black/35 px-6 py-4 border-b border-[#A58D66]/20 flex items-center justify-between backdrop-blur-[2px]">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#407E8C] animate-pulse shadow-[0_0_8px_#407E8C]" />
              <span className="text-xs font-mono font-bold tracking-widest uppercase text-[#A58D66]">
                Core Innovators Roster
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#E5E1DD]/70">
              <Sparkles className="w-3.5 h-3.5 text-[#A58D66]" />
              <span className="font-serif italic text-xs">Where Ideas Transcend into Matter</span>
            </div>
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#A58D66]/15 bg-black/25">
                  <th className="py-4 px-6 text-xs font-mono font-semibold uppercase tracking-widest text-[#A58D66]">
                    Architect
                  </th>
                  <th className="py-4 px-6 text-xs font-mono font-semibold uppercase tracking-widest text-[#A58D66]">
                    Domain & Role
                  </th>
                  <th className="py-4 px-6 text-xs font-mono font-semibold uppercase tracking-widest text-[#A58D66]">
                    Synthesis Mission
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#A58D66]/10">
                {TEAM_MEMBERS.map((member) => (
                  <tr 
                    key={member.id}
                    className="hover:bg-[#407E8C]/15 transition-colors duration-200 group"
                  >
                    {/* Team Member */}
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="flex items-center gap-3.5">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold font-mono transition-transform duration-300 group-hover:scale-105 ${
                          member.isLead 
                            ? 'bg-[#A58D66]/25 text-[#A58D66] border border-[#A58D66]/50 shadow-[0_0_12px_rgba(165,141,102,0.25)]' 
                            : 'bg-[#407E8C]/20 text-[#E5E1DD] border border-[#407E8C]/35'
                        }`}>
                          {member.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-[#E5E1DD] drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] group-hover:text-[#A58D66] transition-colors flex items-center gap-2">
                            <span>{member.name}</span>
                            {member.isLead && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-[#A58D66]/20 text-[#A58D66] border border-[#A58D66]/40 shadow-sm">
                                Lead
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Role Title */}
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/40 border border-[#A58D66]/25 text-xs font-medium text-[#E5E1DD]/90 group-hover:border-[#407E8C]/50 transition-colors backdrop-blur-[2px]">
                        <span className="text-base select-none">{member.emoji}</span>
                        <span>{member.role}</span>
                      </div>
                    </td>

                    {/* Short Introduction */}
                    <td className="py-4 px-6">
                      <span className="text-sm text-[#E5E1DD]/70 font-normal group-hover:text-[#E5E1DD] transition-colors font-serif drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                        {member.intro}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View (Optimized for Small Screens) */}
          <div className="md:hidden divide-y divide-[#A58D66]/15 bg-black/15">
            {TEAM_MEMBERS.map((member) => (
              <div 
                key={member.id} 
                className="p-5 space-y-3 hover:bg-[#407E8C]/15 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold font-mono ${
                      member.isLead
                        ? 'bg-[#A58D66]/25 border border-[#A58D66]/50 text-[#A58D66]'
                        : 'bg-[#407E8C]/20 border border-[#407E8C]/35 text-[#E5E1DD]'
                    }`}>
                      {member.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="font-bold text-[#E5E1DD] text-base drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
                      {member.name}
                    </div>
                  </div>
                  {member.isLead && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-[#A58D66]/20 text-[#A58D66] border border-[#A58D66]/40">
                      Founder
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-xs font-medium text-[#A58D66]">
                  <span className="text-base">{member.emoji}</span>
                  <span>{member.role}</span>
                </div>

                <div className="text-xs text-[#E5E1DD]/70 pl-6 border-l border-[#A58D66]/20 py-0.5 font-serif italic drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                  {member.intro}
                </div>
              </div>
            ))}
          </div>

          {/* Table Footer Strip with Mission Statement */}
          <div className="bg-black/35 px-6 py-4 border-t border-[#A58D66]/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#E5E1DD]/70 backdrop-blur-[2px]">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-[#A58D66]" />
              <span className="font-serif italic drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">Pioneering the world's first AI-native physical hardware laboratory</span>
            </div>
            <div className="text-[11px] font-mono text-[#A58D66]">
              6 Contributors • Infinite Hardware Horizons
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

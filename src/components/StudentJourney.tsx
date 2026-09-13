import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  GraduationCap, 
  Sparkles, 
  ExternalLink, 
  Check, 
  ArrowRight,
  BookOpen,
  Cpu,
  Layers,
  Activity
} from 'lucide-react';
import { circuitAudio } from '../utils/audio';
import { Tilt3DCard } from './Tilt3DCard';

interface JourneyTier {
  id: string;
  stage: string;
  title: string;
  tagline: string;
  description: string;
  skills: string[];
  recommendedTool: {
    name: string;
    url: string;
    badge: string;
  };
  sampleProject: string;
  color: string;
}

const JOURNEY_TIERS: JourneyTier[] = [
  {
    id: 'student',
    stage: 'Stage 1',
    title: 'Curious Student',
    tagline: 'Number Systems & Foundations',
    description: 'Master binary representations, octal arithmetic, hexadecimal conversions, and two\'s complement memory maps.',
    skills: ['Binary ↔ Decimal ↔ Hex', 'Bitwise AND / OR / XOR', 'Two\'s Complement Arithmetic', 'Byte Alignment'],
    recommendedTool: {
      name: 'Number Trainer',
      url: '#/number-trainer',
      badge: 'Interactive Drills'
    },
    sampleProject: 'Mental Bit Manipulation & 8-bit Math Mastery',
    color: '#A58D66'
  },
  {
    id: 'beginner',
    stage: 'Stage 2',
    title: 'Electronics Beginner',
    tagline: 'Logic Gates & Basic Circuits',
    description: 'Connect digital logic gates (AND, OR, NOT, NAND, NOR, XOR), understand truth tables, and balance Ohm\'s Law for LEDs.',
    skills: ['Truth Tables & Boolean Algebra', 'Propagation Delay Waveforms', 'LED Current Limiting', 'Switch Pull-up/down Resistors'],
    recommendedTool: {
      name: 'DigiLogic Simulator',
      url: '#/digilogic',
      badge: 'Logic Synthesis'
    },
    sampleProject: '4-Bit Ripple Carry Adder & 7-Segment Decoder',
    color: '#76B4C2'
  },
  {
    id: 'intermediate',
    stage: 'Stage 3',
    title: 'Hardware Maker',
    tagline: 'Microcontrollers & 3D Prototyping',
    description: 'Build circuits on solderless breadboards with ESP32 and Arduino, connect I2C displays and sensors, and run mixed-signal simulations.',
    skills: ['MCU Pin Multiplexing & ADC', 'I2C, SPI & UART Protocol', 'MOSFET Motor Switching', 'Virtual Oscilloscope Telemetry'],
    recommendedTool: {
      name: 'KITT Engineering Workspace',
      url: '#/workspace',
      badge: '3D Breadboard Lab'
    },
    sampleProject: 'Automated Plant Hydration System & Robot Telemetry',
    color: '#407E8C'
  },
  {
    id: 'professional',
    stage: 'Stage 4',
    title: 'Professional Engineer',
    tagline: 'Multi-layer PCB & Autonomous Hardware',
    description: 'Describe complex systems in natural language. KITT AI synthesizes architecture, generates DRC-verified multi-layer PCBs, and exports manufacturing Gerbers.',
    skills: ['Autonomous Requirement Decomp', 'Controlled Impedance Routing', 'Design Rules Checking (DRC)', 'Gerber RS-274X & PCBA BOM'],
    recommendedTool: {
      name: 'KITT AI Studio',
      url: '#/kitt-ai',
      badge: 'Autonomous Agent'
    },
    sampleProject: 'Turnkey Industrial IoT Telemetry Node & Production PCBA',
    color: '#DFCCA8'
  }
];

export const StudentJourney: React.FC = () => {
  const [activeTier, setActiveTier] = useState<JourneyTier>(JOURNEY_TIERS[0]);

  return (
    <section id="journey" className="py-24 px-4 sm:px-6 lg:px-8 bg-transparent relative border-t border-[#A58D66]/15">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#A58D66]/15 border border-[#A58D66]/35 text-[#A58D66] text-xs font-mono uppercase tracking-widest animate-ambition">
            <GraduationCap className="w-3.5 h-3.5 text-[#A58D66]" />
            <span>THE ASCENDANCY CURRICULUM</span>
          </div>

          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-bold font-cinzel text-[#E5E1DD] tracking-tight leading-tight">
            First Logic Gate <br />
            <span className="animate-text-shimmer italic font-cormorant font-normal block mt-1">
              To Commercial Silicon.
            </span>
          </h2>

          <p className="text-base sm:text-lg text-[#E5E1DD] font-serif italic max-w-lg mx-auto leading-relaxed">
            "Learn, simulate, fabricate, command."
          </p>
        </div>

        {/* 4 Tier Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
          {JOURNEY_TIERS.map((tier, idx) => {
            const isSelected = activeTier.id === tier.id;

            return (
              <motion.div
                key={tier.id}
                initial={{ opacity: 0, y: 24, rotateX: 6 }}
                whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.55, delay: idx * 0.08, ease: [0.16, 1, 0.3, 1] }}
                className="h-full"
                style={{ transformStyle: 'preserve-3d' }}
              >
                <Tilt3DCard
                  tiltMaxAngle={3.5}
                  scale={1.01}
                  glareOpacity={0.16}
                  className="h-full"
                  onClick={() => {
                    setActiveTier(tier);
                    circuitAudio.playTone(480, 0.05, 'triangle');
                  }}
                >
                  <div
                    className={`w-full h-full text-left p-5 rounded-2xl border transition-colors cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'surreal-card-gold border-2 border-[#A58D66] shadow-xl'
                        : 'surreal-card border-[#A58D66]/20 hover:border-[#407E8C]/40 text-[#E5E1DD]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-mono uppercase text-[#A58D66] font-bold">
                          {tier.stage}
                        </span>
                        <span 
                          className="w-2.5 h-2.5 rounded-full shadow-[0_0_8px_currentColor]" 
                          style={{ backgroundColor: tier.color, color: tier.color }}
                        />
                      </div>
                      <h3 className="text-base font-bold font-cinzel text-[#E5E1DD] mb-1">
                        {tier.title}
                      </h3>
                      <p className="text-xs text-[#76B4C2] font-mono">
                        {tier.tagline}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#A58D66]/15 flex items-center justify-between text-xs font-semibold">
                      <span className="text-[#E5E1DD]/60">View Curriculum</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#A58D66]" />
                    </div>
                  </div>
                </Tilt3DCard>
              </motion.div>
            );
          })}
        </div>

        {/* Active Stage Detailed Breakdown Panel with Smooth AnimatePresence */}
        <div className="rounded-3xl surreal-card p-6 sm:p-8 shadow-2xl border border-[#A58D66]/30 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTier.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
            >
              <div className="lg:col-span-7 space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono px-3 py-1 rounded bg-[#407E8C]/20 text-[#76B4C2] border border-[#407E8C]/35">
                    {activeTier.stage} Focus
                  </span>
                  <span className="text-xs text-[#A58D66] font-mono">
                    Target: {activeTier.tagline}
                  </span>
                </div>

                <h3 className="text-2xl font-bold font-cinzel text-[#E5E1DD]">
                  {activeTier.title} Curriculum
                </h3>

                <p className="text-sm text-[#E5E1DD]/80 leading-relaxed font-light">
                  {activeTier.description}
                </p>

                <div className="space-y-2 pt-2">
                  <span className="text-xs font-semibold text-[#A58D66] uppercase tracking-wider block font-mono">
                    Core Competencies Mastered:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {activeTier.skills.map((skill, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-[#E5E1DD]/90 bg-[#080f14]/60 p-2.5 rounded-lg border border-[#A58D66]/15">
                        <Check className="w-3.5 h-3.5 text-[#A58D66] shrink-0" />
                        <span>{skill}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2 text-xs text-[#E5E1DD]/65 font-light">
                  Capstone Project: <strong className="text-[#E5E1DD] font-semibold">{activeTier.sampleProject}</strong>
                </div>
              </div>

              {/* Recommended Tool Launcher Card */}
              <div className="lg:col-span-5 bg-[#080f14]/85 border border-[#A58D66]/30 rounded-2xl p-6 flex flex-col justify-between space-y-4">
                <div>
                  <span className="text-[10px] font-mono uppercase font-bold text-[#A58D66] tracking-wider">
                    Recommended Primary Platform
                  </span>
                  <h4 className="text-xl font-bold font-cinzel text-[#E5E1DD] mt-1">
                    {activeTier.recommendedTool.name}
                  </h4>
                  <p className="text-xs text-[#E5E1DD]/70 mt-1 font-light">
                    The ideal hands-on environment tailored for this phase of the engineering journey.
                  </p>
                </div>

                <div className="p-3 bg-[#407E8C]/15 border border-[#407E8C]/30 rounded-xl text-xs font-mono text-[#76B4C2]">
                  ⚡ Fully integrated with KITT account credentials & synchronization
                </div>

                <a
                  href={activeTier.recommendedTool.url}
                  {...(!activeTier.recommendedTool.url.startsWith('#') ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  onClick={() => circuitAudio.playClick()}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-[#A58D66] to-[#8C7654] hover:from-[#BFA378] hover:to-[#A58D66] text-[#080f14] font-bold text-xs text-center transition-all shadow-[0_0_20px_rgba(165,141,102,0.35)] flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span>Launch {activeTier.recommendedTool.name}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

            </motion.div>
          </AnimatePresence>
        </div>

      </div>
    </section>
  );
};

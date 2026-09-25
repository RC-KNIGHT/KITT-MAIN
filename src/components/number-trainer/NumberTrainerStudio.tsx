/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * KITT Ecosystem — Portal IV: Number Systems & Digital Arithmetic Studio
 * 100% Native React Component — Sovereign 4-Color Luxury Architecture
 * Seamlessly integrated into KITT Single Page App with real-time telemetry.
 */

import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Calculator,
  Binary,
  Trophy,
  Cpu,
  Sparkles,
  Zap,
} from 'lucide-react';
import { ArithmeticDrill } from './components/ArithmeticDrill';
import { BaseConverter } from './components/BaseConverter';
import { TrainerHistory, HistoryItem } from './components/TrainerHistory';
import { ecosystemStore } from '../../utils/ecosystemStore';
import { playClickTone } from './engine/soundSynth';
import { KittLogo } from '../KittLogo';
import { safeLocalStorage } from '../../utils/safeStorage';

interface NumberTrainerStudioProps {
  onBackToHome?: () => void;
}

export const NumberTrainerStudio: React.FC<NumberTrainerStudioProps> = ({ onBackToHome }) => {
  const [activeTab, setActiveTab] = useState<'drill' | 'converter' | 'history'>('drill');
  const [totalPoints, setTotalPoints] = useState<number>(() => {
    const saved = safeLocalStorage.getItem('numSys_points');
    return saved ? parseInt(saved, 10) : 350;
  });
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    const saved = safeLocalStorage.getItem('numSys_drill_history');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (_) {}
    }
    return [
      {
        id: 'h1',
        title: 'Binary Addition (Medium)',
        details: 'Mastered 10110010 + 01011100 = 100001110',
        points: 30,
        isCorrect: true,
        timestamp: '10m ago',
      },
      {
        id: 'h2',
        title: 'Hexadecimal Addition (Easy)',
        details: 'Mastered 1A4F + 02E4 = 1D33',
        points: 25,
        isCorrect: true,
        timestamp: '1h ago',
      },
      {
        id: 'h3',
        title: 'Octal Subtraction (Medium)',
        details: 'Mastered 745 − 162 = 563',
        points: 30,
        isCorrect: true,
        timestamp: '3h ago',
      },
    ];
  });

  const handleNavigateHome = () => {
    playClickTone();
    if (onBackToHome) {
      onBackToHome();
    } else {
      window.location.hash = '#/';
    }
  };

  const handlePointsAwarded = (pts: number) => {
    setTotalPoints((prev) => {
      const next = prev + pts;
      safeLocalStorage.setItem('numSys_points', next.toString());
      return next;
    });
  };

  const handleActivityLog = (
    title: string,
    details: string,
    points: number,
    isCorrect: boolean
  ) => {
    const newItem: HistoryItem = {
      id: 'drill_' + Date.now(),
      title,
      details,
      points,
      isCorrect,
      timestamp: 'Just now',
    };

    setHistory((prev) => {
      const next = [newItem, ...prev].slice(0, 50);
      safeLocalStorage.setItem('numSys_drill_history', JSON.stringify(next));
      return next;
    });

    // Synchronize directly with KITT Ecosystem Dashboard
    ecosystemStore.addActivity({
      platform: 'Hardware Fabrication & Math Labs',
      platformIcon: 'Calculator',
      title,
      action: details,
      status: isCorrect ? 'completed' : 'compiled',
      route: '#/number-trainer',
      timestamp: 'Just now',
    });
  };

  const handleClearHistory = () => {
    playClickTone();
    setHistory([]);
    localStorage.removeItem('numSys_drill_history');
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-[#080f14] text-[#E5E1DD] overflow-x-hidden font-sans">
      {/* 1. Sovereign Command Bar */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-4 sm:px-8 py-3.5 bg-[#080f14]/95 backdrop-blur-xl border-b border-[#A58D66]/20 shadow-lg shadow-black/50">
        <div className="flex items-center gap-3 sm:gap-5">
          {/* Back Action */}
          <button
            onClick={handleNavigateHome}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#A58D66]/10 hover:bg-[#A58D66]/20 border border-[#A58D66]/30 hover:border-[#A58D66] text-[#E5E1DD] hover:text-[#DFCCA8] text-xs font-semibold tracking-wide active:scale-[0.97] transition-all shadow-sm cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#A58D66]" />
            <span>KITT Home</span>
          </button>

          <div className="h-5 w-[1px] bg-[#A58D66]/30 hidden sm:block" />

          {/* Platform Identity */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#080f14] border border-[#A58D66]/40 flex items-center justify-center shadow-md shadow-[#A58D66]/20 p-0.5 shrink-0">
              <KittLogo size={24} showGlow={true} />
            </div>
            <div>
              <div className="text-xs sm:text-sm font-black tracking-wider text-[#E5E1DD] flex items-center gap-2">
                <span>PORTAL IV</span>
                <span className="text-[#A58D66]">/</span>
                <span className="text-[#DFCCA8]">NUMBER SYSTEMS STUDIO</span>
              </div>
              <div className="text-[10px] text-[#A58D66]/70 tracking-widest uppercase hidden md:block">
                Positional Arithmetic • Columnar Math • Bitwise Systems
              </div>
            </div>
          </div>
        </div>

        {/* Global Live Stats */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#0d171f] border border-[#A58D66]/25 text-xs font-mono">
            <Sparkles className="w-3.5 h-3.5 text-[#A58D66]" />
            <span className="text-[#E5E1DD]/70">Score:</span>
            <strong className="text-[#DFCCA8]">{totalPoints} pts</strong>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#407E8C]/15 border border-[#407E8C]/30 text-[#76B4C2] text-[11px] font-bold">
            <span className="w-2 h-2 rounded-full bg-[#76B4C2] animate-pulse" />
            <span>SOVEREIGN GUEST</span>
          </div>
        </div>
      </header>

      {/* 2. Mode Navigation Tabs */}
      <div className="w-full max-w-4xl mx-auto px-4 pt-6 pb-2">
        <div className="flex items-center justify-center p-1.5 rounded-2xl bg-[#0d171f] border border-[#A58D66]/20 shadow-md shadow-black/40">
          <button
            onClick={() => {
              playClickTone();
              setActiveTab('drill');
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs sm:text-sm font-bold tracking-wide active:scale-[0.97] transition-all cursor-pointer ${
              activeTab === 'drill'
                ? 'bg-[#A58D66] text-[#080f14] shadow-md shadow-[#A58D66]/30'
                : 'text-[#E5E1DD]/70 hover:text-[#E5E1DD] hover:bg-[#A58D66]/10'
            }`}
          >
            <Calculator className="w-4 h-4" />
            <span>Arithmetic Matrix Drill</span>
          </button>

          <button
            onClick={() => {
              playClickTone();
              setActiveTab('converter');
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs sm:text-sm font-bold tracking-wide active:scale-[0.97] transition-all cursor-pointer ${
              activeTab === 'converter'
                ? 'bg-[#A58D66] text-[#080f14] shadow-md shadow-[#A58D66]/30'
                : 'text-[#E5E1DD]/70 hover:text-[#E5E1DD] hover:bg-[#A58D66]/10'
            }`}
          >
            <Binary className="w-4 h-4" />
            <span>Inter-Base Converter</span>
          </button>

          <button
            onClick={() => {
              playClickTone();
              setActiveTab('history');
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs sm:text-sm font-bold tracking-wide active:scale-[0.97] transition-all cursor-pointer ${
              activeTab === 'history'
                ? 'bg-[#A58D66] text-[#080f14] shadow-md shadow-[#A58D66]/30'
                : 'text-[#E5E1DD]/70 hover:text-[#E5E1DD] hover:bg-[#A58D66]/10'
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>Performance Log</span>
          </button>
        </div>
      </div>

      {/* 3. Main Workspace Tab Views */}
      <main className="flex-1 w-full pb-16">
        {activeTab === 'drill' && (
          <ArithmeticDrill
            onActivityLog={handleActivityLog}
            onPointsAwarded={handlePointsAwarded}
          />
        )}

        {activeTab === 'converter' && <BaseConverter />}

        {activeTab === 'history' && (
          <TrainerHistory
            history={history}
            totalPoints={totalPoints}
            onClearHistory={handleClearHistory}
          />
        )}
      </main>
    </div>
  );
};

export default NumberTrainerStudio;

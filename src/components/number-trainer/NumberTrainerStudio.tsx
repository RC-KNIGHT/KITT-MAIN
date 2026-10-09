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
    <div className="flex flex-col w-full min-h-screen bg-[#000000] text-[#F5F5F5] overflow-x-hidden font-sans">
      {/* 1. Sovereign Command Bar */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-4 sm:px-8 py-3.5 bg-[#000000]/95 backdrop-blur-xl border-b border-[#FFFFFF]/20 shadow-lg shadow-black/50">
        <div className="flex items-center gap-3 sm:gap-5">
          {/* Back Action */}
          <button
            onClick={handleNavigateHome}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#FFFFFF]/10 hover:bg-[#FFFFFF]/20 border border-[#FFFFFF]/30 hover:border-[#FFFFFF] text-[#F5F5F5] hover:text-[#E8E8E8] text-xs font-semibold tracking-wide active:scale-[0.97] transition-all shadow-sm cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#FFFFFF]" />
            <span>KITT Home</span>
          </button>

          <div className="h-5 w-[1px] bg-[#FFFFFF]/30 hidden sm:block" />

          {/* Platform Identity */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#000000] border border-[#FFFFFF]/40 flex items-center justify-center shadow-md shadow-[#FFFFFF]/20 p-0.5 shrink-0">
              <KittLogo size={24} showGlow={true} />
            </div>
            <div>
              <div className="text-xs sm:text-sm font-black tracking-wider text-[#F5F5F5] flex items-center gap-2">
                <span>PORTAL IV</span>
                <span className="text-[#FFFFFF]">/</span>
                <span className="text-[#E8E8E8]">NUMBER SYSTEMS STUDIO</span>
              </div>
              <div className="text-[10px] text-[#FFFFFF]/70 tracking-widest uppercase hidden md:block">
                Positional Arithmetic • Columnar Math • Bitwise Systems
              </div>
            </div>
          </div>
        </div>

        {/* Global Live Stats */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#141415] border border-[#FFFFFF]/25 text-xs font-mono">
            <Sparkles className="w-3.5 h-3.5 text-[#FFFFFF]" />
            <span className="text-[#F5F5F5]/70">Score:</span>
            <strong className="text-[#E8E8E8]">{totalPoints} pts</strong>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#8F8F8F]/15 border border-[#8F8F8F]/30 text-[#B4B4B4] text-[11px] font-bold">
            <span className="w-2 h-2 rounded-full bg-[#B4B4B4] animate-pulse" />
            <span>SOVEREIGN GUEST</span>
          </div>
        </div>
      </header>

      {/* 2. Mode Navigation Tabs */}
      <div className="w-full max-w-4xl mx-auto px-4 pt-6 pb-2">
        <div className="flex items-center justify-center p-1.5 rounded-2xl bg-[#141415] border border-[#FFFFFF]/20 shadow-md shadow-black/40">
          <button
            onClick={() => {
              playClickTone();
              setActiveTab('drill');
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs sm:text-sm font-bold tracking-wide active:scale-[0.97] transition-all cursor-pointer ${
              activeTab === 'drill'
                ? 'bg-[#FFFFFF] text-[#000000] shadow-md shadow-[#FFFFFF]/30'
                : 'text-[#F5F5F5]/70 hover:text-[#F5F5F5] hover:bg-[#FFFFFF]/10'
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
                ? 'bg-[#FFFFFF] text-[#000000] shadow-md shadow-[#FFFFFF]/30'
                : 'text-[#F5F5F5]/70 hover:text-[#F5F5F5] hover:bg-[#FFFFFF]/10'
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
                ? 'bg-[#FFFFFF] text-[#000000] shadow-md shadow-[#FFFFFF]/30'
                : 'text-[#F5F5F5]/70 hover:text-[#F5F5F5] hover:bg-[#FFFFFF]/10'
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

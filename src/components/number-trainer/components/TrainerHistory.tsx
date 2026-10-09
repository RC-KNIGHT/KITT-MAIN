/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * KITT Ecosystem — Portal IV: Performance & Problem History Log
 */

import React from 'react';
import { Trophy, CheckCircle2, XCircle, Clock, Trash2, Award } from 'lucide-react';

export interface HistoryItem {
  id: string;
  title: string;
  details: string;
  points: number;
  isCorrect: boolean;
  timestamp: string;
}

interface TrainerHistoryProps {
  history: HistoryItem[];
  totalPoints: number;
  onClearHistory: () => void;
}

export const TrainerHistory: React.FC<TrainerHistoryProps> = ({
  history,
  totalPoints,
  onClearHistory,
}) => {
  const totalSolved = history.length;
  const correctCount = history.filter((h) => h.isCorrect).length;
  const accuracy = totalSolved > 0 ? Math.round((correctCount / totalSolved) * 100) : 100;

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto px-4 py-6 select-none">
      {/* Metrics Header */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-[#141415] border border-[#FFFFFF]/20 rounded-2xl p-4 flex items-center gap-3.5 shadow-lg shadow-black/40">
          <div className="w-10 h-10 rounded-xl bg-[#FFFFFF]/15 border border-[#FFFFFF]/30 flex items-center justify-center text-[#E8E8E8]">
            <Trophy className="w-5 h-5 text-[#FFFFFF]" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-[#FFFFFF] uppercase tracking-wider">
              Total Points Earned
            </div>
            <div className="text-xl font-black font-mono text-[#E8E8E8]">
              {totalPoints} pts
            </div>
          </div>
        </div>

        <div className="bg-[#141415] border border-[#FFFFFF]/20 rounded-2xl p-4 flex items-center gap-3.5 shadow-lg shadow-black/40">
          <div className="w-10 h-10 rounded-xl bg-[#8F8F8F]/15 border border-[#8F8F8F]/30 flex items-center justify-center text-[#B4B4B4]">
            <CheckCircle2 className="w-5 h-5 text-[#B4B4B4]" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-[#B4B4B4] uppercase tracking-wider">
              Accuracy Precision
            </div>
            <div className="text-xl font-black font-mono text-[#B4B4B4]">
              {accuracy}%
            </div>
          </div>
        </div>

        <div className="bg-[#141415] border border-[#FFFFFF]/20 rounded-2xl p-4 flex items-center gap-3.5 shadow-lg shadow-black/40">
          <div className="w-10 h-10 rounded-xl bg-[#FFFFFF]/15 border border-[#FFFFFF]/30 flex items-center justify-center text-[#E8E8E8]">
            <Award className="w-5 h-5 text-[#FFFFFF]" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-[#FFFFFF] uppercase tracking-wider">
              Completed Drills
            </div>
            <div className="text-xl font-black font-mono text-[#F5F5F5]">
              {totalSolved} drills
            </div>
          </div>
        </div>
      </div>

      {/* History Log Container */}
      <div className="w-full bg-[#141415] border border-[#FFFFFF]/25 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/50">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#FFFFFF]/15">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#FFFFFF]" />
            <h3 className="font-bold text-sm text-[#F5F5F5]">
              Session Calculation Log
            </h3>
          </div>

          {history.length > 0 && (
            <button
              onClick={onClearHistory}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#000000] border border-[#FFFFFF]/20 text-[11px] text-[#FFFFFF] hover:text-[#E8E8E8] transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          )}
        </div>

        {history.length === 0 ? (
          <div className="py-12 text-center text-xs text-[#F5F5F5]/50 font-mono">
            No calculations recorded in this active session. Launch an Arithmetic Drill to generate live telemetry.
          </div>
        ) : (
          <div className="space-y-2.5 max-h-96 overflow-y-auto pr-2">
            {history.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-xl bg-[#000000] border border-[#FFFFFF]/15 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  {item.isCorrect ? (
                    <CheckCircle2 className="w-4 h-4 text-[#B4B4B4] flex-shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-[#FFFFFF] flex-shrink-0" />
                  )}
                  <div>
                    <div className="text-xs font-bold text-[#F5F5F5]">
                      {item.title}
                    </div>
                    <div className="text-[11px] text-[#F5F5F5]/70 font-mono mt-0.5">
                      {item.details}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0 text-right">
                  {item.points > 0 && (
                    <span className="text-xs font-mono font-bold text-[#B4B4B4]">
                      +{item.points} pts
                    </span>
                  )}
                  <span className="text-[10px] text-[#F5F5F5]/40 font-mono">
                    {item.timestamp}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

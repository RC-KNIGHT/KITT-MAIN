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
        <div className="bg-[#0d171f] border border-[#A58D66]/20 rounded-2xl p-4 flex items-center gap-3.5 shadow-lg shadow-black/40">
          <div className="w-10 h-10 rounded-xl bg-[#A58D66]/15 border border-[#A58D66]/30 flex items-center justify-center text-[#DFCCA8]">
            <Trophy className="w-5 h-5 text-[#A58D66]" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-[#A58D66] uppercase tracking-wider">
              Total Points Earned
            </div>
            <div className="text-xl font-black font-mono text-[#DFCCA8]">
              {totalPoints} pts
            </div>
          </div>
        </div>

        <div className="bg-[#0d171f] border border-[#A58D66]/20 rounded-2xl p-4 flex items-center gap-3.5 shadow-lg shadow-black/40">
          <div className="w-10 h-10 rounded-xl bg-[#407E8C]/15 border border-[#407E8C]/30 flex items-center justify-center text-[#76B4C2]">
            <CheckCircle2 className="w-5 h-5 text-[#76B4C2]" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-[#76B4C2] uppercase tracking-wider">
              Accuracy Precision
            </div>
            <div className="text-xl font-black font-mono text-[#76B4C2]">
              {accuracy}%
            </div>
          </div>
        </div>

        <div className="bg-[#0d171f] border border-[#A58D66]/20 rounded-2xl p-4 flex items-center gap-3.5 shadow-lg shadow-black/40">
          <div className="w-10 h-10 rounded-xl bg-[#A58D66]/15 border border-[#A58D66]/30 flex items-center justify-center text-[#DFCCA8]">
            <Award className="w-5 h-5 text-[#A58D66]" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-[#A58D66] uppercase tracking-wider">
              Completed Drills
            </div>
            <div className="text-xl font-black font-mono text-[#E5E1DD]">
              {totalSolved} drills
            </div>
          </div>
        </div>
      </div>

      {/* History Log Container */}
      <div className="w-full bg-[#0d171f] border border-[#A58D66]/25 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/50">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#A58D66]/15">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#A58D66]" />
            <h3 className="font-bold text-sm text-[#E5E1DD]">
              Session Calculation Log
            </h3>
          </div>

          {history.length > 0 && (
            <button
              onClick={onClearHistory}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#080f14] border border-[#A58D66]/20 text-[11px] text-[#A58D66] hover:text-[#DFCCA8] transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          )}
        </div>

        {history.length === 0 ? (
          <div className="py-12 text-center text-xs text-[#E5E1DD]/50 font-mono">
            No calculations recorded in this active session. Launch an Arithmetic Drill to generate live telemetry.
          </div>
        ) : (
          <div className="space-y-2.5 max-h-96 overflow-y-auto pr-2">
            {history.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-xl bg-[#080f14] border border-[#A58D66]/15 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  {item.isCorrect ? (
                    <CheckCircle2 className="w-4 h-4 text-[#76B4C2] flex-shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-[#A58D66] flex-shrink-0" />
                  )}
                  <div>
                    <div className="text-xs font-bold text-[#E5E1DD]">
                      {item.title}
                    </div>
                    <div className="text-[11px] text-[#E5E1DD]/70 font-mono mt-0.5">
                      {item.details}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0 text-right">
                  {item.points > 0 && (
                    <span className="text-xs font-mono font-bold text-[#76B4C2]">
                      +{item.points} pts
                    </span>
                  )}
                  <span className="text-[10px] text-[#E5E1DD]/40 font-mono">
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

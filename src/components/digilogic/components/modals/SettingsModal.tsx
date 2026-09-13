/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useCircuit } from '../../context/CircuitContext';
import { THEME_PRESETS } from '../../theme/themes';
import { WireRoutingMode } from '../../types/circuit';
import {
  Settings,
  X,
  Spline,
  CornerDownRight,
  Minus,
  Activity,
  Grid,
  Zap,
  Check,
  Sparkles,
  Smartphone,
  Volume2,
  VolumeX,
  Vibrate,
  Info,
} from 'lucide-react';

export const SettingsModal: React.FC = () => {
  const {
    activeModal,
    setActiveModal,
    theme,
    colorMode,
    wireRoutingMode,
    setWireRoutingMode,
    signalAnimation,
    setSignalAnimation,
    snapToGrid,
    setSnapToGrid,
    simulationSpeedHz,
    setSimulationSpeedHz,
    soundEnabled,
    soundVolume,
    setSoundEnabled,
    setSoundVolume,
    hapticsEnabled,
    setHapticsEnabled,
    isHapticsAvailable,
    playTestSound,
  } = useCircuit();

  if (activeModal !== 'settings') return null;

  const isLight = colorMode === 'light';
  const currentThemeConfig = THEME_PRESETS[theme] || THEME_PRESETS.kitt_sovereign;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#080f14]/70 backdrop-blur-sm p-3 sm:p-4 animate-fade-in">
      <div
        className={`border rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden transition-colors ${
          isLight
            ? 'bg-white border-slate-300 text-slate-800 shadow-[0_20px_60px_rgba(0,0,0,0.15)]'
            : 'bg-[#0d171f] border-[#A58D66]/30 text-[#E5E1DD]'
        }`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between px-5 py-4 border-b shrink-0 transition-colors ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#080f14] border-[#A58D66]/20'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className="p-2.5 rounded-xl border flex items-center justify-center shadow-sm"
              style={{
                backgroundColor: `${currentThemeConfig.primaryColor}20`,
                borderColor: `${currentThemeConfig.primaryColor}50`,
                color: currentThemeConfig.primaryColor,
              }}
            >
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className={`font-bold text-sm sm:text-base flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-[#E5E1DD]'}`}>
                Simulator Preferences
              </h2>
              <p className={`text-xs ${isLight ? 'text-[#E5E1DD]/45' : 'text-[#E5E1DD]/60'}`}>
                Customize wire curvature, grid, audio, and canvas behavior
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveModal('none')}
            className={`p-1.5 rounded-lg transition-colors ${
              isLight ? 'text-[#E5E1DD]/60 hover:text-slate-700 hover:bg-slate-200' : 'text-[#E5E1DD]/60 hover:text-[#E5E1DD] hover:bg-[#080f14]'
            }`}
            title="Close Settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className={`p-5 overflow-y-auto space-y-6 text-xs ${isLight ? 'text-slate-600' : 'text-[#DFCCA8]'}`}>
          {/* 1. Wire Routing Style & Curvature Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className={`text-xs font-bold flex items-center gap-2 ${isLight ? 'text-slate-800' : 'text-[#E5E1DD]'}`}>
                <Spline className="w-4 h-4 text-[#76B4C2]" />
                <span>Wire Style & Routing Mode</span>
              </label>
              <span className={`text-[11px] font-mono ${isLight ? 'text-[#E5E1DD]/45' : 'text-[#E5E1DD]/60'}`}>
                Current: <strong className="text-[#76B4C2] capitalize">{wireRoutingMode}</strong>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* Curved Stylish Wires */}
              <button
                onClick={() => setWireRoutingMode('curved')}
                className={`p-3 rounded-xl border flex flex-col items-center text-center gap-2 transition-all ${
                  wireRoutingMode === 'curved'
                    ? isLight
                      ? 'bg-cyan-50 border-[#76B4C2] text-cyan-900 ring-2 ring-cyan-400/30'
                      : 'bg-[#76B4C2]/10 border-[#76B4C2]/50 text-cyan-300 ring-2 ring-cyan-500/30'
                    : isLight
                    ? 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    : 'bg-[#080f14]/60 border-[#A58D66]/20 text-[#E5E1DD]/60 hover:text-[#E5E1DD] hover:bg-[#080f14]'
                }`}
              >
                <div
                  className={`p-2 rounded-lg border text-[#76B4C2] ${
                    isLight ? 'bg-white border-slate-200' : 'bg-[#080f14] border-[#A58D66]/20'
                  }`}
                >
                  <Spline className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-xs">Curved (Stylish)</div>
                  <div className={`text-[10px] mt-0.5 ${isLight ? 'text-[#E5E1DD]/45' : 'text-[#E5E1DD]/60'}`}>
                    Smooth organic cubic bezier paths
                  </div>
                </div>
                {wireRoutingMode === 'curved' && (
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      isLight ? 'bg-cyan-100 text-cyan-700' : 'bg-[#76B4C2]/20 text-[#76B4C2]'
                    }`}
                  >
                    Selected
                  </span>
                )}
              </button>

              {/* Orthogonal (90° Manhattan) */}
              <button
                onClick={() => setWireRoutingMode('orthogonal')}
                className={`p-3 rounded-xl border flex flex-col items-center text-center gap-2 transition-all ${
                  wireRoutingMode === 'orthogonal'
                    ? isLight
                      ? 'bg-amber-50 border-[#A58D66] text-slate-900 ring-2 ring-[#A58D66]/30'
                      : 'bg-[#A58D66]/15 border-[#A58D66]/50 text-[#DFCCA8] ring-2 ring-[#A58D66]/30'
                    : isLight
                    ? 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    : 'bg-[#080f14]/60 border-[#A58D66]/20 text-[#E5E1DD]/60 hover:text-[#E5E1DD] hover:bg-[#080f14]'
                }`}
              >
                <div
                  className={`p-2 rounded-lg border text-[#A58D66] ${
                    isLight ? 'bg-white border-slate-200' : 'bg-[#080f14] border-[#A58D66]/20'
                  }`}
                >
                  <CornerDownRight className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-xs">Orthogonal (90°)</div>
                  <div className={`text-[10px] mt-0.5 ${isLight ? 'text-[#E5E1DD]/45' : 'text-[#E5E1DD]/60'}`}>
                    Clean Manhattan schematic traces
                  </div>
                </div>
                {wireRoutingMode === 'orthogonal' && (
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      isLight ? 'bg-amber-100 text-[#8C7654]' : 'bg-[#A58D66]/20 text-[#DFCCA8]'
                    }`}
                  >
                    Selected
                  </span>
                )}
              </button>

              {/* Straight Wires */}
              <button
                onClick={() => setWireRoutingMode('straight')}
                className={`p-3 rounded-xl border flex flex-col items-center text-center gap-2 transition-all ${
                  wireRoutingMode === 'straight'
                    ? isLight
                      ? 'bg-purple-50 border-[#407E8C] text-purple-900 ring-2 ring-purple-400/30'
                      : 'bg-[#76B4C2]/10 border-[#407E8C]/50 text-purple-300 ring-2 ring-purple-500/30'
                    : isLight
                    ? 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    : 'bg-[#080f14]/60 border-[#A58D66]/20 text-[#E5E1DD]/60 hover:text-[#E5E1DD] hover:bg-[#080f14]'
                }`}
              >
                <div
                  className={`p-2 rounded-lg border text-[#407E8C] ${
                    isLight ? 'bg-white border-slate-200' : 'bg-[#080f14] border-[#A58D66]/20'
                  }`}
                >
                  <Minus className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-xs">Straight (Direct)</div>
                  <div className={`text-[10px] mt-0.5 ${isLight ? 'text-[#E5E1DD]/45' : 'text-[#E5E1DD]/60'}`}>
                    Shortest point-to-point lines
                  </div>
                </div>
                {wireRoutingMode === 'straight' && (
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      isLight ? 'bg-purple-100 text-purple-700' : 'bg-[#76B4C2]/20 text-[#76B4C2]'
                    }`}
                  >
                    Selected
                  </span>
                )}
              </button>
            </div>
          </div>

          <div className={`h-px ${isLight ? 'bg-slate-200' : 'bg-[#A58D66]/15'}`} />

          {/* 4. Animation & Simulation Performance */}
          <div className="space-y-3">
            <label className={`text-xs font-bold flex items-center gap-2 ${isLight ? 'text-slate-800' : 'text-[#E5E1DD]'}`}>
              <Activity className="w-4 h-4 text-[#A58D66]" />
              <span>Simulation & Animation Engine</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Signal Flow Animation */}
              <div
                className={`flex items-center justify-between p-3 rounded-xl border ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#080f14]/60 border-[#A58D66]/20'
                }`}
              >
                <div className="space-y-0.5">
                  <div className={`font-semibold text-xs ${isLight ? 'text-slate-800' : 'text-[#E5E1DD]'}`}>Wire Flow Animation</div>
                  <div className={`text-[10px] ${isLight ? 'text-[#E5E1DD]/45' : 'text-[#E5E1DD]/60'}`}>Animated pulses on active high wires</div>
                </div>
                <button
                  onClick={() => setSignalAnimation(!signalAnimation)}
                  className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                    signalAnimation ? 'bg-[#A58D66]' : isLight ? 'bg-slate-300' : 'bg-[#080f14]'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${
                      signalAnimation ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Grid Snapping */}
              <div
                className={`flex items-center justify-between p-3 rounded-xl border ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#080f14]/60 border-[#A58D66]/20'
                }`}
              >
                <div className="space-y-0.5">
                  <div className={`font-semibold text-xs ${isLight ? 'text-slate-800' : 'text-[#E5E1DD]'}`}>Snap to Grid (20px)</div>
                  <div className={`text-[10px] ${isLight ? 'text-[#E5E1DD]/45' : 'text-[#E5E1DD]/60'}`}>Align components on drop and drag</div>
                </div>
                <button
                  onClick={() => setSnapToGrid(!snapToGrid)}
                  className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                    snapToGrid ? 'bg-[#A58D66]' : isLight ? 'bg-slate-300' : 'bg-[#080f14]'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${
                      snapToGrid ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Simulation Clock Frequency Slider */}
            <div
              className={`p-3.5 rounded-xl border space-y-2 ${
                isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#080f14]/60 border-[#A58D66]/20'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`font-semibold text-xs flex items-center gap-1.5 ${isLight ? 'text-slate-800' : 'text-[#E5E1DD]'}`}>
                  <Zap className="w-3.5 h-3.5 text-[#A58D66]" />
                  Clock Frequency & Oscillation Rate
                </span>
                <span className="font-mono font-bold text-[#A58D66] text-xs">
                  {simulationSpeedHz} Hz ({Math.round(1000 / simulationSpeedHz)}ms period)
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={30}
                value={simulationSpeedHz}
                onChange={(e) => setSimulationSpeedHz(parseInt(e.target.value, 10))}
                className={`w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-[#A58D66] ${
                  isLight ? 'bg-slate-200' : 'bg-[#080f14]'
                }`}
              />
              <div className={`flex justify-between text-[10px] font-mono ${isLight ? 'text-[#E5E1DD]/45' : 'text-[#E5E1DD]/45'}`}>
                <span>1 Hz (Slow / Step-by-Step)</span>
                <span>10 Hz (Default)</span>
                <span>30 Hz (Fast)</span>
              </div>
            </div>
          </div>

          <div className={`h-px ${isLight ? 'bg-slate-200' : 'bg-[#A58D66]/15'}`} />

          {/* 5. Audio FX & Haptic Feedback */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className={`text-xs font-bold flex items-center gap-2 ${isLight ? 'text-slate-800' : 'text-[#E5E1DD]'}`}>
                {soundEnabled ? (
                  <Volume2 className="w-4 h-4 text-[#A58D66]" />
                ) : (
                  <VolumeX className={`w-4 h-4 ${isLight ? 'text-[#E5E1DD]/60' : 'text-[#E5E1DD]/45'}`} />
                )}
                <span>Sound FX & Haptic Vibration Feedback</span>
              </label>
              <button
                type="button"
                onClick={playTestSound}
                className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-colors flex items-center gap-1.5 border ${
                  isLight
                    ? 'bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200'
                    : 'bg-[#080f14] hover:bg-[#0d171f] text-[#DFCCA8] border-[#A58D66]/20'
                }`}
              >
                <span>Test Feedback</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Sound Effects Toggle */}
              <div
                className={`flex items-center justify-between p-3 rounded-xl border ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#080f14]/60 border-[#A58D66]/20'
                }`}
              >
                <div className="space-y-0.5">
                  <div className={`font-semibold text-xs flex items-center gap-1.5 ${isLight ? 'text-slate-800' : 'text-[#E5E1DD]'}`}>
                    <Volume2 className="w-3.5 h-3.5 text-[#A58D66]" />
                    <span>Synthesized Audio FX</span>
                  </div>
                  <div className={`text-[10px] ${isLight ? 'text-[#E5E1DD]/45' : 'text-[#E5E1DD]/60'}`}>
                    Clicks, wire snaps, and switch chimes
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                    soundEnabled ? 'bg-[#A58D66]' : isLight ? 'bg-slate-300' : 'bg-[#080f14]'
                  }`}
                  aria-label="Toggle Sound Effects"
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${
                      soundEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Haptic Feedback Toggle */}
              <div
                className={`flex items-center justify-between p-3 rounded-xl border ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#080f14]/60 border-[#A58D66]/20'
                }`}
              >
                <div className="space-y-0.5">
                  <div className={`font-semibold text-xs flex items-center gap-1.5 ${isLight ? 'text-slate-800' : 'text-[#E5E1DD]'}`}>
                    <Vibrate className="w-3.5 h-3.5 text-[#407E8C]" />
                    <span>Haptic Vibration</span>
                  </div>
                  <div className={`text-[10px] ${isLight ? 'text-[#E5E1DD]/45' : 'text-[#E5E1DD]/60'}`}>
                    {isHapticsAvailable
                      ? 'Tactile pulse on wire snaps & toggles'
                      : 'Hardware not supported on this browser'}
                  </div>
                </div>
                <button
                  type="button"
                  disabled={!isHapticsAvailable}
                  onClick={() => setHapticsEnabled(!hapticsEnabled)}
                  className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                    !isHapticsAvailable
                      ? 'opacity-40 cursor-not-allowed bg-slate-300'
                      : hapticsEnabled
                      ? 'bg-[#76B4C2]'
                      : isLight
                      ? 'bg-slate-300'
                      : 'bg-[#080f14]'
                  }`}
                  aria-label="Toggle Haptic Feedback"
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${
                      hapticsEnabled && isHapticsAvailable ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Audio Volume Slider */}
            {soundEnabled && (
              <div
                className={`p-3.5 rounded-xl border space-y-2 ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#080f14]/60 border-[#A58D66]/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`font-semibold text-xs flex items-center gap-1.5 ${isLight ? 'text-slate-800' : 'text-[#E5E1DD]'}`}>
                    <Volume2 className="w-3.5 h-3.5 text-[#A58D66]" />
                    <span>Master Sound Volume</span>
                  </span>
                  <span className="font-mono font-bold text-[#A58D66] text-xs">
                    {Math.round(soundVolume * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={Math.round(soundVolume * 100)}
                  onChange={(e) => setSoundVolume(parseInt(e.target.value, 10) / 100)}
                  className={`w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-[#A58D66] ${
                    isLight ? 'bg-slate-200' : 'bg-[#080f14]'
                  }`}
                />
              </div>
            )}
          </div>

          <div className={`h-px ${isLight ? 'bg-slate-200' : 'bg-[#A58D66]/15'}`} />

          {/* 6. Touch & Tablet Ergonomics Notice */}
          <div
            className={`p-3 rounded-xl border flex items-start gap-2.5 ${
              isLight ? 'bg-amber-50/80 border-amber-200 text-slate-700' : 'bg-[#A58D66]/15 border-[#A58D66]/30 text-[#DFCCA8]'
            }`}
          >
            <Smartphone className="w-4 h-4 text-[#A58D66] shrink-0 mt-0.5" />
            <div className="text-[11px] space-y-0.5">
              <span className="font-bold text-[#A58D66] block">Tablet & Touch Optimized</span>
              <p>
                Use 2-finger pinch to zoom in/out, 2-finger drag to pan canvas, and tap ports directly
                to start and complete wire connections smoothly.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className={`p-4 border-t flex items-center justify-end text-xs transition-colors ${
            isLight ? 'bg-slate-50 border-slate-200 text-[#E5E1DD]/45' : 'bg-[#080f14] border-[#A58D66]/20 text-[#E5E1DD]/60'
          }`}
        >
          <button
            onClick={() => setActiveModal('none')}
            className="px-4 py-1.5 bg-[#A58D66] hover:bg-[#DFCCA8] text-[#080f14] font-bold rounded-lg transition-colors shadow-sm cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

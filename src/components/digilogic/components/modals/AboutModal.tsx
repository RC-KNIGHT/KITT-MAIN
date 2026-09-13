/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useCircuit } from '../../context/CircuitContext';
import { AboutApp } from '../about/AboutApp';
import { KittLogo } from '../../../KittLogo';
import { X, ExternalLink } from 'lucide-react';

interface AboutModalProps {
  onCloseOverride?: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ onCloseOverride }) => {
  let activeModal = 'none';
  let setActiveModal: ((m: any) => void) | null = null;
  let isLight = false;

  try {
    const circuit = useCircuit();
    activeModal = circuit.activeModal;
    setActiveModal = circuit.setActiveModal;
    isLight = circuit.colorMode === 'light';
  } catch {
    // Rendered outside of CircuitProvider (e.g. from LoginPage)
  }

  const isOpen = onCloseOverride ? true : activeModal === 'about';
  if (!isOpen) return null;

  const handleClose = () => {
    if (onCloseOverride) {
      onCloseOverride();
    } else if (setActiveModal) {
      setActiveModal('none');
    }
  };

  return (
    <div className={`fixed inset-0 z-50 flex flex-col animate-fade-in overflow-hidden ${
      isLight ? 'bg-[#080f14]/40 backdrop-blur-xs' : 'bg-[#080f14]'
    }`}>
      {/* Top Bar with Close & Open in New Tab */}
      <div className={`border-b px-4 sm:px-6 py-3 flex items-center justify-between z-50 shrink-0 ${
        isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-[#0d171f] border-[#A58D66]/20'
      }`}>
        <div className="flex items-center gap-3">
          <KittLogo size={22} showGlow={true} className="shrink-0" />
          <h2 className="text-sm sm:text-base font-bold tracking-tight text-[#E5E1DD]">
            About DigiLogic Lab • Team KITT Complete Architecture Guide
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleClose}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-[#A58D66] to-[#8C7654] hover:from-[#DFCCA8] hover:to-[#A58D66] text-[#080f14] font-bold text-xs transition-all shadow-md shadow-[#A58D66]/20 active:scale-95 cursor-pointer min-h-[34px]"
            title="Close Documentation"
          >
            <X className="w-4 h-4 text-[#080f14]" />
            <span>Close</span>
          </button>
        </div>
      </div>

      {/* Scrollable Container with Smooth Vertical Scrolling */}
      <div className="flex-1 overflow-y-auto overscroll-contain">
        <AboutApp isModal={true} onClose={handleClose} />
      </div>
    </div>
  );
};


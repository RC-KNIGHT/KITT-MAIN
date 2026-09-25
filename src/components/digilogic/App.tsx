/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CircuitProvider, useCircuit } from './context/CircuitContext';
import { CollaborationProvider } from './context/CollaborationContext';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { Toolbar } from './components/ui/Toolbar';
import { Sidebar } from './components/ui/Sidebar';
import { Canvas } from './components/canvas/Canvas';
import { Inspector } from './components/ui/Inspector';
import { MobileBottomDock } from './components/ui/MobileBottomDock';
import { TruthTableModal } from './components/modals/TruthTableModal';
import { BooleanToolModal } from './components/modals/BooleanToolModal';
import { KMapModal } from './components/modals/KMapModal';
import { OscilloscopeModal } from './components/modals/OscilloscopeModal';
import { CustomGateModal } from './components/modals/CustomGateModal';
import { PresetsModal } from './components/modals/PresetsModal';
import { ChallengeModal } from './components/modals/ChallengeModal';
import { EducationalModal } from './components/modals/EducationalModal';
import { ShortcutHelpModal } from './components/modals/ShortcutHelpModal';
import { SavedCircuitsModal } from './components/modals/SavedCircuitsModal';
import { SettingsModal } from './components/modals/SettingsModal';
import { TutorialModal } from './components/modals/TutorialModal';
import { CollaborateModal } from './components/modals/CollaborateModal';
import { AboutModal } from './components/modals/AboutModal';
import { LoginPage } from './components/auth/LoginPage';
import { Cpu, RefreshCw } from 'lucide-react';

const CircuitAppContent: React.FC = () => {
  const { importJson, sidebarOpen, setSidebarOpen, inspectorOpen, setInspectorOpen, activeModal, setActiveModal, colorMode } = useCircuit();
  const { loginViewOpen, setLoginViewOpen } = useAuth();
  const importJsonRef = useRef(importJson);
  importJsonRef.current = importJson;
  const isLight = colorMode === 'light';

  // Check URL search parameters for shared room codes or login actions
  useEffect(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const roomParam = urlParams.get('room') || urlParams.get('r') || urlParams.get('join');
      if (roomParam) {
        setActiveModal('collaborate');
      }
      const authParam = urlParams.get('auth') || urlParams.get('login');
      if (authParam === 'true' || authParam === '1') {
        setLoginViewOpen(true);
      }
    } catch {
      // Ignore URL parsing errors in sandbox environments
    }
  }, [setActiveModal, setLoginViewOpen]);

  // Listen to synthesized circuits loader
  useEffect(() => {
    const handleSynthesizedLoad = (e: any) => {
      if (e.detail) {
        const { components, wires, name } = e.detail;
        importJsonRef.current(
          JSON.stringify({
            version: '1.0.0',
            name: name || 'Synthesized Circuit',
            components,
            wires,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          })
        );
      }
    };

    window.addEventListener('load_synthesized_circuit', handleSynthesizedLoad);
    return () => window.removeEventListener('load_synthesized_circuit', handleSynthesizedLoad);
  }, []);

  if (loginViewOpen) {
    return <LoginPage onBackToStudio={() => setLoginViewOpen(false)} isAppGated={false} />;
  }

  return (
    <div className="flex flex-col w-screen h-screen overflow-hidden antialiased font-sans touch-none bg-[#080f14] text-[#E5E1DD]">
      {/* Top Navigation & Simulation Toolbar */}
      <Toolbar />

      {/* Main Studio Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Component Library Palette */}
        <Sidebar />

        {/* Backdrop for Mobile/Tablet when Sidebar Drawer is open */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 top-14 bg-[#080f14]/60 backdrop-blur-xs z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Central Infinite Logic Canvas */}
        <main className="flex-1 h-full relative">
          <ErrorBoundary fallbackTitle="Logic Canvas Restored">
            <Canvas />
          </ErrorBoundary>
        </main>

        {/* Backdrop for Mobile/Tablet when Inspector Drawer is open */}
        {inspectorOpen && (
          <div
            className="fixed inset-0 top-14 bg-[#080f14]/60 backdrop-blur-xs z-30 xl:hidden"
            onClick={() => setInspectorOpen(false)}
          />
        )}

        {/* Right Property Inspector Panel */}
        <Inspector />
      </div>

      {/* Floating Bottom Dock for Mobile Phones (Hidden on Desktop/Tablets) */}
      <MobileBottomDock />

      {/* Interactive Feature Modals */}
      {activeModal === 'truthTable' && <TruthTableModal />}
      {activeModal === 'boolean' && <BooleanToolModal />}
      {activeModal === 'kmap' && <KMapModal />}
      {activeModal === 'oscilloscope' && <OscilloscopeModal />}
      {activeModal === 'customGate' && <CustomGateModal />}
      {activeModal === 'presets' && <PresetsModal />}
      {activeModal === 'challenges' && <ChallengeModal />}
      {activeModal === 'learn' && <EducationalModal />}
      {activeModal === 'shortcuts' && <ShortcutHelpModal />}
      {activeModal === 'savedCircuits' && <SavedCircuitsModal />}
      {activeModal === 'settings' && <SettingsModal />}
      {activeModal === 'tutorial' && <TutorialModal />}
      {activeModal === 'collaborate' && <CollaborateModal />}
      {activeModal === 'about' && <AboutModal />}
    </div>
  );
};

const AppGate: React.FC = () => {
  const { currentUser, userProfile, loading, isOnboardingRequired, loginViewOpen, setLoginViewOpen } = useAuth();

  // Loading initial auth state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center w-screen h-screen bg-[#080f14] text-[#E5E1DD] font-mono select-none">
        <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-[#A58D66]/10 border border-[#A58D66]/40 text-[#A58D66] mb-4 shadow-[0_0_30px_rgba(165,141,102,0.25)]">
          <Cpu className="w-8 h-8 animate-pulse text-[#A58D66]" />
        </div>
        <div className="flex items-center gap-2.5 text-sm text-[#E5E1DD] font-semibold tracking-wider">
          <RefreshCw className="w-4 h-4 animate-spin text-[#A58D66]" />
          <span>INITIALIZING SOVEREIGN EDA WORKSPACE</span>
        </div>
        <p className="text-xs text-[#A58D66]/70 mt-2">Connecting High-Speed Sovereign Canvas...</p>
      </div>
    );
  }

  // STRICT AUTHENTICATION GATE:
  // If user is not authenticated OR lab onboarding is pending OR user explicitly requested login view:
  // Zero circuit components, toolbars, or simulation canvas will render.
  if (!currentUser || !userProfile || isOnboardingRequired || loginViewOpen) {
    const isGated = !currentUser || !userProfile || isOnboardingRequired;
    return (
      <LoginPage
        onBackToStudio={() => setLoginViewOpen(false)}
        isAppGated={isGated}
      />
    );
  }

  return (
    <CircuitProvider>
      <CollaborationProvider>
        <CircuitAppContent />
      </CollaborationProvider>
    </CircuitProvider>
  );
};

export function DigiLogicStudio() {
  return (
    <AuthProvider>
      <AppGate />
    </AuthProvider>
  );
}

export default DigiLogicStudio;


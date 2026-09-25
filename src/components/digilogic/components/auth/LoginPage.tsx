/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'motion/react';
import { useAuth } from '../../context/AuthContext';
import { LogicGateBackground } from './LogicGateBackground';
import { UserRole, ExperienceLevel, DiscoverySource } from '../../types/auth';
import { AboutModal } from '../modals/AboutModal';
import { KittLogo } from '../../../KittLogo';
import {
  ArrowLeft,
  Cpu,
  ShieldCheck,
  Zap,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Lock,
  User,
  ExternalLink,
  Copy,
  Check,
  Info,
  Layers,
  ArrowRight,
  LogOut,
  RefreshCw,
  BookOpen,
  Compass,
} from 'lucide-react';

interface LoginPageProps {
  onBackToStudio?: () => void;
  isAppGated?: boolean;
}

/** Cinematic easing curve used across the auth experience for a premium, weighted feel */
const CINEMATIC_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

export const LoginPage: React.FC<LoginPageProps> = ({ onBackToStudio, isAppGated = false }) => {
  const {
    currentUser,
    userProfile,
    loading,
    isAuthenticating,
    error,
    isOnboardingRequired,
    signInWithGoogle,
    loginAsGuest,
    completeOnboarding,
    logout,
    clearAuthError,
    setLoginViewOpen,
  } = useAuth();

  // First-time onboarding form state
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState<UserRole>('Student');
  const [discoverySource, setDiscoverySource] = useState<DiscoverySource>('Google Search');
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>('Student');
  const [formError, setFormError] = useState('');

  // UI state for about modal
  const [showAboutModal, setShowAboutModal] = useState<boolean>(false);

  // ================= Cinematic pointer-reactive card tilt (premium 3D feel) =================
  const cardRef = useRef<HTMLDivElement>(null);
  const rawTiltX = useMotionValue(0);
  const rawTiltY = useMotionValue(0);
  const tiltX = useSpring(rawTiltX, { stiffness: 150, damping: 20, mass: 0.6 });
  const tiltY = useSpring(rawTiltY, { stiffness: 150, damping: 20, mass: 0.6 });
  const rotateX = useTransform(tiltY, [-0.5, 0.5], [6, -6]);
  const rotateY = useTransform(tiltX, [-0.5, 0.5], [-6, 6]);
  const glareX = useTransform(tiltX, [-0.5, 0.5], ['0%', '100%']);
  const glareY = useTransform(tiltY, [-0.5, 0.5], ['0%', '100%']);
  const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const handleCardPointerMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (prefersReducedMotion || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    rawTiltX.set((e.clientX - rect.left) / rect.width - 0.5);
    rawTiltY.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const handleCardPointerLeave = () => {
    rawTiltX.set(0);
    rawTiltY.set(0);
  };

  // Prefill Google name on initial sign in
  useEffect(() => {
    if (currentUser?.displayName && !displayName) {
      setDisplayName(currentUser.displayName);
    }
  }, [currentUser, displayName]);

  const handleGoogleLogin = async () => {
    clearAuthError();
    try {
      await signInWithGoogle();
    } catch {
      // Error handled inside AuthContext
    }
  };

  const handleGuestLogin = () => {
    clearAuthError();
    loginAsGuest('Guest Explorer');
    if (onBackToStudio) {
      onBackToStudio();
    } else {
      setLoginViewOpen(false);
    }
  };

  const handleOnboardingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      setFormError('Please enter your name or handle.');
      return;
    }

    setFormError('');
    try {
      await completeOnboarding({
        displayName: displayName.trim(),
        role,
        discoverySource,
        experienceLevel,
      });
      if (onBackToStudio) {
        onBackToStudio();
      } else {
        setLoginViewOpen(false);
      }
    } catch {
      // Error handled in AuthContext
    }
  };

  const handleReturnToStudio = () => {
    if (isAppGated && (!currentUser || !userProfile || isOnboardingRequired)) {
      return;
    }
    if (onBackToStudio) {
      onBackToStudio();
    } else {
      setLoginViewOpen(false);
    }
  };

  const isUserAuthenticated = currentUser && userProfile && !isOnboardingRequired;

  // Determine which panel is active, purely for AnimatePresence keying/crossfade
  const activePanelKey = loading
    ? 'loading'
    : currentUser && isOnboardingRequired
    ? 'onboarding'
    : currentUser && userProfile
    ? 'authenticated'
    : 'signin';

  const panelVariants = {
    initial: { opacity: 0, y: 14, filter: 'blur(4px)' },
    animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
    exit: { opacity: 0, y: -10, filter: 'blur(4px)' },
  };

  const staggerContainer = {
    animate: {
      transition: { staggerChildren: 0.07, delayChildren: 0.05 },
    },
  };

  const staggerItem = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.45, ease: CINEMATIC_EASE } },
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between overflow-x-hidden bg-[#080f14] text-[#E5E1DD] font-sans selection:bg-[#A58D66]/30 selection:text-[#DFCCA8]">
      {/* Animated Interactive Logic Gate & Signal Background */}
      <LogicGateBackground />

      {/* Top Laboratory Bar */}
      <motion.header
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: CINEMATIC_EASE }}
        className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 pb-3 flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <a
            href="#/"
            className="group flex items-center gap-2 px-3 py-2 rounded-xl bg-[#080f14]/80 hover:bg-[#A58D66]/10 text-[#DFCCA8] hover:text-[#E5E1DD] border border-[#A58D66]/20 hover:border-[#A58D66]/50 backdrop-blur-md transition-colors text-xs font-semibold shadow-md cursor-pointer"
            title="Return to KITT Ecosystem Landing Page"
          >
            <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5 text-[#A58D66]" />
            <span>KITT Home</span>
          </a>

          {isUserAuthenticated && !isAppGated ? (
            <motion.button
              whileHover={{ scale: 1.03, x: -1 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleReturnToStudio}
              className="group flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-[#080f14]/80 hover:bg-[#A58D66]/10 text-[#DFCCA8] hover:text-[#E5E1DD] border border-[#A58D66]/20 hover:border-[#A58D66]/50 backdrop-blur-md transition-colors text-xs sm:text-sm font-semibold shadow-md min-h-[44px] cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              <span>Back to Studio</span>
            </motion.button>
          ) : (
            <div className="relative flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#080f14] border border-[#A58D66]/30 text-[#DFCCA8] text-xs font-mono backdrop-blur-md shadow-sm overflow-hidden">
              <span className="absolute inset-0 animate-shimmer-sweep pointer-events-none" />
              <Lock className="w-3.5 h-3.5 text-[#DFCCA8] shrink-0" />
              <span className="relative">LABORATORY GATEWAY • AUTH REQUIRED</span>
            </div>
          )}

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowAboutModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#080f14]/80 hover:bg-[#0d171f] text-[#DFCCA8] hover:text-[#E5E1DD] border border-[#A58D66]/20 hover:border-[#A58D66]/50 transition-colors text-xs font-medium backdrop-blur-md min-h-[44px] cursor-pointer"
            title="Read documentation and learn about the creators"
          >
            <BookOpen className="w-3.5 h-3.5 text-[#DFCCA8]" />
            <span className="hidden sm:inline">About &amp; Docs</span>
          </motion.button>
        </div>

        <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-[#080f14]/80 border border-[#A58D66]/20 text-[#E5E1DD]/60 text-xs font-mono backdrop-blur-md">
          <span className="relative flex w-2 h-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#A58D66] opacity-75" />
            <span className="relative inline-flex rounded-full w-2 h-2 bg-[#A58D66]" />
          </span>
          <span className="hidden sm:inline">DIGILOGIC CORE •</span>
          <span className="text-[#DFCCA8] font-bold">ONLINE</span>
        </div>
      </motion.header>

      {/* Main Authentication Center Card */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 my-auto">
        <motion.div
          initial={{ opacity: 0, y: 28, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, ease: CINEMATIC_EASE }}
          style={{ perspective: 1200 }}
          className="w-full max-w-lg"
        >
          {/* Main Card Container — pointer-reactive cinematic tilt + glare */}
          <motion.div
            ref={cardRef}
            onMouseMove={handleCardPointerMove}
            onMouseLeave={handleCardPointerLeave}
            style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
            className="relative rounded-3xl bg-[#0d171f] border border-[#A58D66]/30 shadow-[0_0_60px_rgba(165,141,102,0.12)] backdrop-blur-2xl p-6 sm:p-8 overflow-hidden transition-shadow duration-500 hover:shadow-[0_0_90px_rgba(165,141,102,0.2)]"
          >
            {/* Top Glowing Circuit Accent Line */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#DFCCA8] to-transparent shadow-[0_0_15px_rgba(165,141,102,0.4)] animate-glow-pulse" />

            {/* Pointer-reactive glare sheen for a premium glass feel */}
            <motion.div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300"
              style={{
                background: useTransform(
                  [glareX, glareY],
                  ([gx, gy]: [string, string]) =>
                    `radial-gradient(500px circle at ${gx} ${gy}, rgba(165,141,102,0.10), transparent 60%)`
                ),
              }}
            />

            {/* Glowing Corner Accents */}
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#A58D66]/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-[#407E8C]/10 rounded-full blur-2xl pointer-events-none" />

            {/* Header / Brand Icon */}
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: CINEMATIC_EASE }}
              className="text-center mb-6 relative"
              style={{ transform: 'translateZ(30px)' }}
            >
              <motion.div
                animate={prefersReducedMotion ? undefined : { y: [0, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="relative inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#080f14] border border-[#A58D66]/40 text-[#DFCCA8] mb-3 shadow-[0_0_25px_rgba(165,141,102,0.2)] group"
              >
                <KittLogo size={46} showGlow={true} />
                <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#A58D66] opacity-75" />
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-[#A58D66] border-2 border-[#080f14]" />
                </span>
              </motion.div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-mono bg-clip-text text-transparent bg-[length:200%_auto] bg-gradient-to-r from-white via-[#DFCCA8] to-white animate-gradient-text">
                DigiLogic Laboratory
              </h1>
              <p className="text-xs text-[#E5E1DD]/60 mt-1.5 max-w-sm mx-auto leading-relaxed">
                Professional Digital Circuit Simulator, Truth Tables &amp; Microarchitecture Suite
              </p>
            </motion.div>

            {/* Error Banner */}
            <AnimatePresence>
              {(error || formError) && (
                <motion.div
                  initial={{ opacity: 0, height: 0, y: -8 }}
                  animate={{ opacity: 1, height: 'auto', y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -8 }}
                  transition={{ duration: 0.35, ease: CINEMATIC_EASE }}
                  className="mb-5 p-3.5 rounded-2xl bg-[#080f14] border border-[#A58D66]/40 text-[#DFCCA8] text-xs flex items-start gap-2.5 overflow-hidden"
                >
                  <motion.div
                    initial={{ rotate: 0 }}
                    animate={{ rotate: [0, -8, 8, -6, 0] }}
                    transition={{ duration: 0.5 }}
                  >
                    <AlertCircle className="w-4 h-4 text-[#DFCCA8] shrink-0 mt-0.5" />
                  </motion.div>
                  <div className="flex-1 leading-relaxed">
                    <div className="font-semibold text-[#DFCCA8] mb-0.5">Authentication Notice</div>
                    <div>{error || formError}</div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Crossfading panel content — loading / onboarding / authenticated / sign-in */}
            <AnimatePresence mode="wait">
              {activePanelKey === 'loading' ? (
                /* ================= INITIAL AUTH LOADING STATE ================= */
                <motion.div
                  key="loading"
                  variants={panelVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ duration: 0.4, ease: CINEMATIC_EASE }}
                  className="py-12 flex flex-col items-center justify-center gap-3.5 text-[#E5E1DD]/60 text-xs font-mono"
                >
                  <RefreshCw className="w-7 h-7 animate-spin text-[#DFCCA8]" />
                  <span className="text-[#DFCCA8] font-semibold">Verifying Google security credentials...</span>
                </motion.div>
              ) : activePanelKey === 'onboarding' ? (
                /* ================= FIRST-TIME ONBOARDING FORM ================= */
                <motion.div
                  key="onboarding"
                  variants={panelVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ duration: 0.4, ease: CINEMATIC_EASE }}
                  className="space-y-4"
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, ease: CINEMATIC_EASE }}
                    className="p-3.5 rounded-2xl bg-[#A58D66]/10 border border-[#A58D66]/30 text-[#DFCCA8] text-xs flex items-center gap-2.5"
                  >
                    <Sparkles className="w-4 h-4 shrink-0 text-[#DFCCA8]" />
                    <span>Welcome! Complete your laboratory profile to unlock the circuit simulator.</span>
                  </motion.div>

                  <motion.form
                    variants={staggerContainer}
                    initial="initial"
                    animate="animate"
                    onSubmit={handleOnboardingSubmit}
                    className="space-y-3.5"
                  >
                    {/* 1. Your Name */}
                    <motion.div variants={staggerItem}>
                      <label className="block text-[11px] font-mono font-semibold uppercase tracking-wider text-[#DFCCA8] mb-1">
                        1. Your Display Name / Handle
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          placeholder="e.g. Alan Turing"
                          maxLength={50}
                          required
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#080f14] border border-[#A58D66]/20 focus:border-[#A58D66]/60 focus:shadow-[0_0_0_3px_rgba(165,141,102,0.15)] text-[#E5E1DD] text-xs font-medium placeholder-[#E5E1DD]/30 outline-none transition-all duration-300 min-h-[44px]"
                        />
                        <User className="absolute right-3 top-3 w-4 h-4 text-[#E5E1DD]/45" />
                      </div>
                    </motion.div>

                    {/* 2. Your Role */}
                    <motion.div variants={staggerItem}>
                      <label className="block text-[11px] font-mono font-semibold uppercase tracking-wider text-[#DFCCA8] mb-1">
                        2. Your Role in DigiLogic Lab
                      </label>
                      <select
                        value={role}
                        onChange={(e) => setRole(e.target.value as UserRole)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#080f14] border border-[#A58D66]/20 focus:border-[#A58D66]/60 focus:shadow-[0_0_0_3px_rgba(165,141,102,0.15)] text-[#E5E1DD] text-xs font-medium outline-none transition-all duration-300 min-h-[44px]"
                      >
                        <option value="Student">Student (High School / College / Uni)</option>
                        <option value="Teacher">Teacher / Professor / Educator</option>
                        <option value="Developer">Software / Hardware Developer</option>
                        <option value="Hobbyist">Electronics &amp; Circuit Hobbyist</option>
                        <option value="Engineer">Electrical &amp; Computer Engineer</option>
                        <option value="Researcher">Researcher / Academic</option>
                        <option value="Other">Other Explorer</option>
                      </select>
                    </motion.div>

                    {/* 3. How did you discover this project? */}
                    <motion.div variants={staggerItem}>
                      <label className="block text-[11px] font-mono font-semibold uppercase tracking-wider text-[#DFCCA8] mb-1">
                        3. How did you discover this project?
                      </label>
                      <select
                        value={discoverySource}
                        onChange={(e) => setDiscoverySource(e.target.value as DiscoverySource)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#080f14] border border-[#A58D66]/20 focus:border-[#A58D66]/60 focus:shadow-[0_0_0_3px_rgba(165,141,102,0.15)] text-[#E5E1DD] text-xs font-medium outline-none transition-all duration-300 min-h-[44px]"
                      >
                        <option value="Google Search">Google Search</option>
                        <option value="GitHub">GitHub / Open Source</option>
                        <option value="College / University">College / University Coursework</option>
                        <option value="Social Media">Social Media / Reddit / Twitter / LinkedIn</option>
                        <option value="Friend / Colleague">Friend / Colleague Recommendation</option>
                        <option value="YouTube / Tutorial">YouTube / Online Tutorial</option>
                        <option value="Hackathon / Event">Hackathon / Competition</option>
                        <option value="Other">Other Source</option>
                      </select>
                    </motion.div>

                    {/* 4. Experience with Digital Logic */}
                    <motion.div variants={staggerItem}>
                      <label className="block text-[11px] font-mono font-semibold uppercase tracking-wider text-[#DFCCA8] mb-1">
                        4. Experience with Digital Logic
                      </label>
                      <select
                        value={experienceLevel}
                        onChange={(e) => setExperienceLevel(e.target.value as ExperienceLevel)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#080f14] border border-[#A58D66]/20 focus:border-[#A58D66]/60 focus:shadow-[0_0_0_3px_rgba(165,141,102,0.15)] text-[#E5E1DD] text-xs font-medium outline-none transition-all duration-300 min-h-[44px]"
                      >
                        <option value="Beginner">Beginner — Learning logic gates for the first time</option>
                        <option value="Student">Student — Taking digital logic or electronics courses</option>
                        <option value="Intermediate">Intermediate — Comfortable building sequential &amp; combinational circuits</option>
                        <option value="Advanced">Advanced — Familiar with ALU, CPU datapath, and microarchitectures</option>
                        <option value="Pro">Pro / Senior — Experienced hardware &amp; FPGA / ASIC engineer</option>
                      </select>
                    </motion.div>

                    {/* Submit Onboarding Button */}
                    <motion.button
                      variants={staggerItem}
                      whileHover={{ scale: 1.015 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={isAuthenticating}
                      className="w-full mt-4 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#A58D66] hover:bg-[#DFCCA8] disabled:bg-[#080f14] disabled:text-[#E5E1DD]/45 text-[#080f14] font-bold text-xs uppercase tracking-wider transition-colors shadow-lg shadow-[#A58D66]/20 cursor-pointer min-h-[44px]"
                    >
                      {isAuthenticating ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Saving Lab Profile...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Save Profile &amp; Unlock Studio</span>
                        </>
                      )}
                    </motion.button>
                  </motion.form>
                </motion.div>
              ) : activePanelKey === 'authenticated' ? (
                /* ================= ALREADY AUTHENTICATED STATE ================= */
                <motion.div
                  key="authenticated"
                  variants={panelVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ duration: 0.4, ease: CINEMATIC_EASE }}
                  className="space-y-4 text-center"
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, ease: CINEMATIC_EASE, delay: 0.05 }}
                    className="p-4 rounded-2xl bg-[#A58D66]/10 border border-[#A58D66]/30"
                  >
                    <div className="flex items-center justify-center gap-2 text-[#DFCCA8] font-semibold text-xs mb-1">
                      <motion.div
                        initial={{ scale: 0, rotate: -45 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 14, delay: 0.15 }}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </motion.div>
                      <span>Signed in with Google</span>
                    </div>
                    <div className="font-bold text-[#E5E1DD] text-base font-mono mt-1">
                      {userProfile!.displayName}
                    </div>
                    <div className="text-xs text-[#E5E1DD]/60 mt-0.5">
                      {currentUser!.email}
                    </div>
                    <div className="mt-2.5 inline-block px-3 py-1 rounded-full bg-[#080f14] border border-[#A58D66]/30 text-[#DFCCA8] text-[11px] font-mono">
                      {userProfile!.role} • {userProfile!.experienceLevel} Level
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.2, ease: CINEMATIC_EASE }}
                    className="flex flex-col gap-2.5 pt-2"
                  >
                    <motion.button
                      whileHover={{ scale: 1.015, boxShadow: '0 0 40px rgba(165,141,102,0.35)' }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleReturnToStudio}
                      className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-[#A58D66] hover:bg-[#DFCCA8] text-[#080f14] font-bold text-xs uppercase tracking-wider shadow-lg shadow-[#A58D66]/20 cursor-pointer min-h-[46px]"
                    >
                      <span>Enter Interactive Simulator</span>
                      <motion.span
                        animate={{ x: [0, 4, 0] }}
                        transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
                      >
                        <ArrowRight className="w-4 h-4" />
                      </motion.span>
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={logout}
                      disabled={isAuthenticating}
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#080f14] hover:bg-[#0d171f] text-[#DFCCA8] hover:text-[#E5E1DD] border border-[#A58D66]/20 hover:border-[#A58D66]/50 text-xs font-semibold transition-colors cursor-pointer min-h-[44px]"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </motion.button>
                  </motion.div>
                </motion.div>
              ) : (
                /* ================= DYNAMIC CONTINUE WITH GOOGLE VIEW ================= */
                <motion.div
                  key="signin"
                  variants={panelVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ duration: 0.4, ease: CINEMATIC_EASE }}
                  className="space-y-6"
                >
                  {/* Feature Highlights Grid */}
                  <motion.div
                    variants={staggerContainer}
                    initial="initial"
                    animate="animate"
                    className="grid grid-cols-2 gap-2.5 pt-1"
                  >
                    <motion.div
                      variants={staggerItem}
                      whileHover={{ y: -3, borderColor: 'rgba(165,141,102,0.5)' }}
                      className="p-2.5 rounded-xl bg-[#080f14] border border-[#A58D66]/20 flex items-start gap-2 transition-colors"
                    >
                      <div className="w-6 h-6 rounded-lg bg-[#A58D66]/10 border border-[#A58D66]/30 text-[#DFCCA8] flex items-center justify-center shrink-0">
                        <Zap className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="text-[11px] font-semibold text-[#E5E1DD]">Zero-Latency Engine</div>
                        <div className="text-[10px] text-[#E5E1DD]/60">Sub-ms signal propagation</div>
                      </div>
                    </motion.div>

                    <motion.div
                      variants={staggerItem}
                      whileHover={{ y: -3, borderColor: 'rgba(165,141,102,0.4)' }}
                      className="p-2.5 rounded-xl bg-[#080f14] border border-[#A58D66]/20 flex items-start gap-2 transition-colors"
                    >
                      <div className="w-6 h-6 rounded-lg bg-[#A58D66]/10 border border-[#A58D66]/30 text-[#DFCCA8] flex items-center justify-center shrink-0">
                        <Layers className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="text-[11px] font-semibold text-[#E5E1DD]">Truth &amp; K-Maps</div>
                        <div className="text-[10px] text-[#E5E1DD]/60">Automated boolean solving</div>
                      </div>
                    </motion.div>
                  </motion.div>

                  {/* Dynamic Google Sign In Button */}
                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.15, ease: CINEMATIC_EASE }}
                    whileHover={prefersReducedMotion ? undefined : { scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleGoogleLogin}
                    disabled={isAuthenticating}
                    className="group relative w-full flex items-center justify-between py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#0d171f] via-[#131f28] to-[#0d171f] hover:from-[#131f28] hover:to-[#172530] text-[#E5E1DD] font-bold text-xs sm:text-sm tracking-wide border border-[#A58D66]/30 hover:border-[#A58D66]/60 shadow-[0_4px_24px_rgba(0,0,0,0.5)] hover:shadow-[0_0_30px_rgba(165,141,102,0.2)] transition-all duration-300 cursor-pointer min-h-[52px] overflow-hidden"
                  >
                    {/* Subtle inner hover glow */}
                    <div className="absolute inset-0 bg-gradient-to-r from-[#A58D66]/0 via-[#A58D66]/10 to-[#A58D66]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                    {/* Traveling light-sweep sheen for a premium button feel */}
                    <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />

                    {isAuthenticating ? (
                      <div className="w-full flex items-center justify-center gap-3">
                        <RefreshCw className="w-5 h-5 animate-spin text-[#DFCCA8]" />
                        <span className="text-[#E5E1DD] font-semibold">Connecting to Google OAuth...</span>
                      </div>
                    ) : (
                      <>
                        {/* Left: Google Icon in matching dark box container */}
                        <div className="relative flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-[#080f14] border border-[#A58D66]/20 group-hover:border-[#A58D66]/50 flex items-center justify-center shrink-0 transition-colors shadow-inner">
                            <svg className="w-4 h-4" viewBox="0 0 24 24">
                              <path
                                fill="#DFCCA8"
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                              />
                              <path
                                fill="#A58D66"
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                              />
                              <path
                                fill="#DFCCA8"
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                              />
                              <path
                                fill="#A58D66"
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                              />
                            </svg>
                          </div>
                          <span className="font-semibold text-[#E5E1DD] group-hover:text-[#DFCCA8] transition-colors">
                            Continue with Google
                          </span>
                        </div>

                        {/* Right: Dynamic arrow indicator */}
                        <div className="relative flex items-center gap-1 text-[#E5E1DD]/60 group-hover:text-[#DFCCA8] transition-colors text-xs font-mono">
                          <span className="hidden sm:inline">Unlock Studio</span>
                          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                        </div>
                      </>
                    )}
                  </motion.button>

                  {/* Divider */}
                  <div className="relative flex items-center justify-center my-0.5">
                    <div className="border-t border-[#A58D66]/20 w-full" />
                    <span className="bg-[#0d171f] px-3 text-[10px] text-[#E5E1DD]/45 font-mono uppercase tracking-wider shrink-0">
                      or explore directly
                    </span>
                    <div className="border-t border-[#A58D66]/20 w-full" />
                  </div>

                  {/* Guest Mode Instant Access Option */}
                  <motion.button
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.22, ease: CINEMATIC_EASE }}
                    whileHover={prefersReducedMotion ? undefined : { scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleGuestLogin}
                    disabled={isAuthenticating}
                    className="group relative w-full flex items-center justify-between py-3 px-4 rounded-2xl bg-[#080f14] hover:bg-[#0d171f] text-[#DFCCA8] hover:text-[#E5E1DD] border border-[#A58D66]/20 hover:border-[#A58D66]/40 hover:shadow-[0_0_20px_rgba(165,141,102,0.15)] transition-all duration-300 cursor-pointer min-h-[48px]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-[#080f14] border border-[#A58D66]/20 group-hover:border-[#A58D66]/50 text-[#DFCCA8] flex items-center justify-center shrink-0 transition-colors shadow-inner">
                        <Compass className="w-4 h-4" />
                      </div>
                      <div className="text-left">
                        <div className="font-semibold text-xs sm:text-sm text-[#E5E1DD] group-hover:text-[#E5E1DD] transition-colors flex items-center gap-2">
                          <span>Continue as Guest</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#A58D66]/10 text-[#DFCCA8] border border-[#A58D66]/30">
                            Instant Sandbox
                          </span>
                        </div>
                        <div className="text-[10px] text-[#E5E1DD]/60 group-hover:text-[#DFCCA8] font-mono transition-colors">
                          Access full circuit simulator without signing in
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-[#E5E1DD]/60 group-hover:text-[#DFCCA8] text-xs font-mono transition-colors">
                      <span className="hidden sm:inline">Explore</span>
                      <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                    </div>
                  </motion.button>

                  {/* Technical Trust & Security Features */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="pt-3 border-t border-[#A58D66]/20 space-y-2 text-[11px] text-[#E5E1DD]/60"
                  >
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#DFCCA8] shrink-0" />
                      <span>Google OAuth 2.0 Verified • Zero password vulnerabilities</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Lock className="w-3.5 h-3.5 text-[#DFCCA8] shrink-0" />
                      <span>Hardened Firestore ABAC Security Rules Enforced</span>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      </main>

      {/* About Modal for users exploring documentation before or after auth */}
      {showAboutModal && (
        <AboutModal onCloseOverride={() => setShowAboutModal(false)} />
      )}

      {/* Footer Text */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="relative z-10 w-full text-center py-5 px-4 text-xs font-mono text-[#DFCCA8] border-t border-[#A58D66]/20 bg-[#080f14]/80 backdrop-blur-md"
      >
        Created with precision and passion by Team KITT
      </motion.footer>
    </div>
  );
};

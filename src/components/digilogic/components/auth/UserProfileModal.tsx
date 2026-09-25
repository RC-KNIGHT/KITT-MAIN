/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCircuit } from '../../context/CircuitContext';
import { UserRole, ExperienceLevel, DiscoverySource } from '../../types/auth';
import {
  X,
  User,
  ShieldCheck,
  GraduationCap,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  LogOut,
  RefreshCw,
  Mail,
  Calendar,
  Compass,
  LogIn,
} from 'lucide-react';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, userProfile, updateUserProfile, logout, isAuthenticating, setLoginViewOpen } = useAuth();
  let isLight = false;
  try {
    const circuit = useCircuit();
    isLight = circuit.colorMode === 'light';
  } catch {
    // Rendered outside circuit provider
  }

  const [displayName, setDisplayName] = useState(userProfile?.displayName || '');
  const [role, setRole] = useState<UserRole>(userProfile?.role || 'Student');
  const [discoverySource, setDiscoverySource] = useState<DiscoverySource>(userProfile?.discoverySource || 'Google Search');
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>(userProfile?.experienceLevel || 'Student');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen || !userProfile) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      setErrorMessage('Display name cannot be empty.');
      return;
    }

    setErrorMessage('');
    try {
      await updateUserProfile({
        displayName: displayName.trim(),
        role,
        discoverySource,
        experienceLevel,
      });
      setSavedSuccess(true);
      setTimeout(() => {
        setSavedSuccess(false);
        onClose();
      }, 1200);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to update profile.');
    }
  };

  const handleSignOut = async () => {
    await logout();
    onClose();
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return 'Active';
    try {
      return new Date(isoString).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn ${
        isLight ? 'bg-[#080f14]/40 backdrop-blur-xs' : 'bg-[#080f14]/70 backdrop-blur-sm'
      }`}
      onClick={onClose}
    >
      <div
        className={`relative w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border transition-colors ${
          isLight
            ? 'bg-white border-slate-300 text-slate-800'
            : 'bg-[#0d171f] border-[#A58D66]/30 text-[#E5E1DD]'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className={`flex items-center justify-between px-6 py-4 border-b ${
          isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#080f14] border-[#A58D66]/20'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#A58D66]/10 border border-[#A58D66]/30 text-[#DFCCA8] flex items-center justify-center">
              {userProfile.uid.startsWith('guest-') ? <Compass className="w-4 h-4" /> : <User className="w-4 h-4" />}
            </div>
            <div>
              <h3 className={`text-sm font-bold font-mono ${isLight ? 'text-slate-900' : 'text-[#E5E1DD]'}`}>DigiLogic Identity</h3>
              <p className={`text-[11px] ${isLight ? 'text-[#E5E1DD]/45' : 'text-[#E5E1DD]/60'}`}>
                {userProfile.uid.startsWith('guest-') ? 'Guest Explorer Mode (Local Session)' : 'Authenticated Google Account Profile'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              isLight ? 'text-[#E5E1DD]/60 hover:text-slate-700 hover:bg-slate-200' : 'text-[#E5E1DD]/60 hover:text-[#E5E1DD] hover:bg-[#080f14]'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Identity Summary Chip */}
          <div className={`p-4 rounded-xl border flex items-start gap-3.5 ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#080f14] border-[#A58D66]/20'
          }`}>
            {currentUser?.photoURL ? (
              <img
                src={currentUser.photoURL}
                alt={userProfile.displayName}
                className="w-11 h-11 rounded-xl object-cover border border-[#A58D66]/40"
              />
            ) : userProfile.uid.startsWith('guest-') ? (
              <div className="w-11 h-11 rounded-xl bg-[#A58D66]/10 border border-[#A58D66]/30 text-[#DFCCA8] flex items-center justify-center font-bold text-sm">
                <Compass className="w-6 h-6" />
              </div>
            ) : (
              <div className="w-11 h-11 rounded-xl bg-[#A58D66]/10 border border-[#A58D66]/30 text-[#DFCCA8] flex items-center justify-center font-bold text-sm">
                {userProfile.displayName.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className={`font-bold text-sm font-mono truncate ${isLight ? 'text-slate-900' : 'text-[#E5E1DD]'}`}>
                  {userProfile.displayName}
                </span>
                <span className={`px-2 py-0.5 rounded-full bg-[#A58D66]/10 border border-[#A58D66]/30 text-[#DFCCA8] text-[10px] font-mono shrink-0`}>
                  {userProfile.uid.startsWith('guest-') ? 'Guest' : userProfile.role}
                </span>
              </div>
              <div className={`text-xs flex items-center gap-1.5 mt-0.5 truncate ${isLight ? 'text-slate-600' : 'text-[#E5E1DD]/60'}`}>
                <Mail className={`w-3 h-3 shrink-0 ${isLight ? 'text-[#E5E1DD]/60' : 'text-[#E5E1DD]/45'}`} />
                <span className="truncate">{currentUser?.email || (userProfile.uid.startsWith('guest-') ? 'Guest Mode (No Email Linked)' : 'Local Profile')}</span>
              </div>
              <div className={`text-[11px] flex items-center gap-1.5 mt-1 font-mono ${isLight ? 'text-[#E5E1DD]/45' : 'text-[#E5E1DD]/45'}`}>
                <Calendar className={`w-3 h-3 shrink-0 ${isLight ? 'text-[#E5E1DD]/60' : 'text-[#DFCCA8]/60'}`} />
                <span>Joined {formatDate(userProfile.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* Guest Account Upgrade Banner */}
          {userProfile.uid.startsWith('guest-') && (
            <div className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 ${
              isLight
                ? 'bg-amber-50 border-amber-200'
                : 'bg-[#080f14] border-[#A58D66]/30'
            }`}>
              <div>
                <div className={`text-xs font-semibold flex items-center gap-1.5 ${isLight ? 'text-[#8C7654]' : 'text-[#DFCCA8]'}`}>
                  <Sparkles className="w-3.5 h-3.5 text-[#DFCCA8]" />
                  <span>Upgrade to Google Account</span>
                </div>
                <div className={`text-[11px] mt-0.5 ${isLight ? 'text-slate-600' : 'text-[#E5E1DD]/60'}`}>
                  Sync your circuits and write reviews with Google OAuth
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  setLoginViewOpen(true);
                }}
                className="px-3 py-1.5 rounded-lg bg-[#A58D66] hover:bg-[#DFCCA8] text-[#080f14] font-bold text-xs flex items-center gap-1.5 transition-all shrink-0 cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            </div>
          )}

          {/* Messages */}
          {savedSuccess && (
            <div className="p-3 rounded-xl bg-[#A58D66]/10 border border-[#A58D66]/30 text-[#DFCCA8] text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#DFCCA8]" />
              <span>Profile updated successfully!</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 rounded-xl bg-[#A58D66]/10 border border-[#A58D66]/40 text-[#DFCCA8] text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-[#A58D66]" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Edit Form */}
          <form onSubmit={handleSave} className="space-y-3.5">
            <div>
              <label className={`block text-[11px] font-mono font-semibold uppercase tracking-wider mb-1 ${
                isLight ? 'text-slate-600' : 'text-[#E5E1DD]/60'
              }`}>
                Display Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                maxLength={50}
                required
                className={`w-full px-3 py-2 rounded-xl border focus:border-[#A58D66]/50 text-xs font-medium outline-none transition-all ${
                  isLight
                    ? 'bg-white border-slate-300 text-slate-900'
                    : 'bg-[#080f14] border-[#A58D66]/20 text-[#E5E1DD]'
                }`}
              />
            </div>

            <div>
              <label className={`block text-[11px] font-mono font-semibold uppercase tracking-wider mb-1 ${
                isLight ? 'text-slate-600' : 'text-[#E5E1DD]/60'
              }`}>
                Your Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className={`w-full px-3 py-2 rounded-xl border focus:border-[#A58D66]/50 text-xs font-medium outline-none transition-all ${
                  isLight
                    ? 'bg-white border-slate-300 text-slate-900'
                    : 'bg-[#080f14] border-[#A58D66]/20 text-[#E5E1DD]'
                }`}
              >
                <option value="Student">Student</option>
                <option value="Teacher">Teacher / Professor</option>
                <option value="Developer">Developer</option>
                <option value="Hobbyist">Hobbyist</option>
                <option value="Engineer">Electrical / Computer Engineer</option>
                <option value="Researcher">Researcher</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className={`block text-[11px] font-mono font-semibold uppercase tracking-wider mb-1 ${
                isLight ? 'text-slate-600' : 'text-[#E5E1DD]/60'
              }`}>
                Experience Level
              </label>
              <select
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value as ExperienceLevel)}
                className={`w-full px-3 py-2 rounded-xl border focus:border-[#A58D66]/50 text-xs font-medium outline-none transition-all ${
                  isLight
                    ? 'bg-white border-slate-300 text-slate-900'
                    : 'bg-[#080f14] border-[#A58D66]/20 text-[#E5E1DD]'
                }`}
              >
                <option value="Beginner">Beginner</option>
                <option value="Student">Student (Coursework)</option>
                <option value="Intermediate">Intermediate Circuit Builder</option>
                <option value="Advanced">Advanced (ALU / CPU)</option>
                <option value="Pro">Pro Hardware Engineer</option>
              </select>
            </div>

            <div className={`pt-2 flex items-center justify-between gap-3 border-t ${
              isLight ? 'border-slate-200' : 'border-[#A58D66]/20'
            }`}>
              <button
                type="button"
                onClick={handleSignOut}
                disabled={isAuthenticating}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                  isLight
                    ? 'bg-slate-100 hover:bg-amber-50 text-slate-600 hover:text-[#8C7654] border-slate-300 hover:border-amber-300'
                    : 'bg-[#080f14] hover:bg-[#0d171f] text-[#E5E1DD]/60 hover:text-[#DFCCA8] border-[#A58D66]/20 hover:border-[#A58D66]/40'
                }`}
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all border cursor-pointer ${
                    isLight
                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                      : 'bg-[#080f14] hover:bg-[#0d171f] text-[#DFCCA8] border-[#A58D66]/20'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAuthenticating}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#A58D66] hover:bg-[#DFCCA8] text-[#080f14] font-bold text-xs transition-all shadow-md shadow-[#A58D66]/20 active:scale-95 cursor-pointer"
                >
                  {isAuthenticating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

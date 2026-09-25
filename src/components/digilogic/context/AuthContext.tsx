/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Local Sovereign AuthContext
 * Provides standard guest session handling and offline execution.
 */

import React, { createContext, useContext, useState, useCallback } from 'react';
import { UserProfile, OnboardingData, UserRole, ExperienceLevel, DiscoverySource } from '../types/auth';

interface SovereignUser {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  isAnonymous: boolean;
}

interface AuthContextType {
  currentUser: SovereignUser | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isAuthenticating: boolean;
  error: string | null;
  errorCode: string | null;
  isOnboardingRequired: boolean;
  loginViewOpen: boolean;
  setLoginViewOpen: (open: boolean) => void;
  signInWithGoogle: () => Promise<UserProfile | null>;
  logout: () => Promise<void>;
  completeOnboarding: (data: OnboardingData) => Promise<UserProfile>;
  updateUserProfile: (data: Partial<OnboardingData>) => Promise<UserProfile>;
  loginAsGuest: (guestName?: string) => void;
  clearAuthError: () => void;
}

const DEFAULT_SOVEREIGN_USER: SovereignUser = {
  uid: 'kitt_usr_sovereign',
  displayName: 'KITT Sovereign Innovator',
  email: 'innovator@kitt.ecosystem',
  isAnonymous: false,
};

const DEFAULT_PROFILE: UserProfile = {
  uid: 'kitt_usr_sovereign',
  displayName: 'KITT Sovereign Innovator',
  email: 'innovator@kitt.ecosystem',
  role: 'engineer' as UserRole,
  experienceLevel: 'advanced' as ExperienceLevel,
  discoverySource: 'direct' as DiscoverySource,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  onboardingCompleted: true,
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<SovereignUser | null>(DEFAULT_SOVEREIGN_USER);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(DEFAULT_PROFILE);
  const [loginViewOpen, setLoginViewOpen] = useState<boolean>(false);

  const signInWithGoogle = useCallback(async (): Promise<UserProfile | null> => {
    setCurrentUser(DEFAULT_SOVEREIGN_USER);
    setUserProfile(DEFAULT_PROFILE);
    setLoginViewOpen(false);
    return DEFAULT_PROFILE;
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    setCurrentUser(DEFAULT_SOVEREIGN_USER);
  }, []);

  const completeOnboarding = useCallback(async (data: OnboardingData): Promise<UserProfile> => {
    const updated: UserProfile = {
      ...DEFAULT_PROFILE,
      displayName: data.displayName || DEFAULT_PROFILE.displayName,
      role: data.role,
      experienceLevel: data.experienceLevel,
      discoverySource: data.discoverySource,
      updatedAt: new Date().toISOString(),
    };
    setUserProfile(updated);
    return updated;
  }, []);

  const updateUserProfile = useCallback(async (data: Partial<OnboardingData>): Promise<UserProfile> => {
    const updated: UserProfile = {
      ...(userProfile || DEFAULT_PROFILE),
      ...data,
      updatedAt: new Date().toISOString(),
    };
    setUserProfile(updated);
    return updated;
  }, [userProfile]);

  const loginAsGuest = useCallback((guestName?: string) => {
    const user: SovereignUser = {
      ...DEFAULT_SOVEREIGN_USER,
      uid: 'guest_' + Math.random().toString(36).substring(2, 9),
      displayName: guestName || 'Guest User',
      isAnonymous: true,
    };
    setCurrentUser(user);
    setUserProfile({
      ...DEFAULT_PROFILE,
      uid: user.uid,
      displayName: user.displayName,
      role: 'student' as UserRole,
      experienceLevel: 'beginner' as ExperienceLevel,
    });
    setLoginViewOpen(false);
  }, []);

  const clearAuthError = useCallback(() => {}, []);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        loading: false,
        isAuthenticating: false,
        error: null,
        errorCode: null,
        isOnboardingRequired: false,
        loginViewOpen,
        setLoginViewOpen,
        signInWithGoogle,
        logout,
        completeOnboarding,
        updateUserProfile,
        loginAsGuest,
        clearAuthError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

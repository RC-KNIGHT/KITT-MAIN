/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'Student' | 'Teacher' | 'Developer' | 'Hobbyist' | 'Engineer' | 'Researcher' | 'Other';

export type ExperienceLevel = 'Beginner' | 'Student' | 'Intermediate' | 'Advanced' | 'Pro';

export type DiscoverySource =
  | 'Google Search'
  | 'GitHub'
  | 'College / University'
  | 'Social Media'
  | 'Friend / Colleague'
  | 'Hackathon / Event'
  | 'YouTube / Tutorial'
  | 'Direct Access'
  | 'Guest Access'
  | 'Other';

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string;
  photoURL?: string | null;
  role: UserRole;
  discoverySource: DiscoverySource;
  experienceLevel: ExperienceLevel;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  onboardingCompleted: boolean;
}

export interface OnboardingData {
  displayName: string;
  role: UserRole;
  discoverySource: DiscoverySource;
  experienceLevel: ExperienceLevel;
}

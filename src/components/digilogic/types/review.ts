/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ReviewItem {
  id: string;
  userId?: string;
  userName: string;
  userRole?: string;
  userAvatar?: string | null;
  rating: number; // 1 to 5
  comment: string;
  category: 'general' | 'compliment' | 'feature_request' | 'classroom' | 'bug_report';
  helpfulCount: number;
  createdAt: string; // ISO string
  updatedAt?: string; // ISO string
}

export interface ReviewLikeRecord {
  userId: string;
  reviewId: string;
  createdAt: string;
}

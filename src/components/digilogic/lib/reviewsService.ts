/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  orderBy,
  limit,
  onSnapshot,
  updateDoc,
  increment,
  writeBatch,
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from './firebase';
import { ReviewItem } from '../types/review';
import { UserProfile } from '../types/auth';

const REVIEWS_COLLECTION = 'reviews';
const LOCAL_STORAGE_KEY = 'digilogic_local_reviews_v2';
const LOCAL_USER_LIKES_KEY = 'digilogic_local_user_likes_v2';

// Helper to get local stored reviews
function getLocalReviews(): ReviewItem[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Could not parse local reviews:', e);
  }
  return [];
}

// Helper to save locally
function saveLocalReviews(reviews: ReviewItem[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(reviews));
  } catch (e) {
    console.warn('Could not save reviews locally:', e);
  }
}

/**
 * Subscribe to all community reviews in real-time
 */
export function subscribeReviews(callback: (reviews: ReviewItem[]) => void): () => void {
  // Always emit local data immediately
  const localInitial = getLocalReviews();
  callback(localInitial);

  if (!db) {
    return () => {};
  }

  try {
    const q = query(collection(db, REVIEWS_COLLECTION), orderBy('createdAt', 'desc'), limit(60));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const remoteReviews: ReviewItem[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            remoteReviews.push({
              id: docSnap.id,
              userId: data.userId || undefined,
              userName: data.userName || 'Verified Engineer',
              userRole: data.userRole || 'Student',
              userAvatar: data.userAvatar || null,
              rating: Number(data.rating) || 5,
              comment: data.comment || '',
              category: data.category || 'general',
              helpfulCount: Math.max(0, Number(data.helpfulCount) || 0),
              createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : (data.createdAt || new Date().toISOString()),
              updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : (data.updatedAt || undefined),
            });
          });

          saveLocalReviews(remoteReviews);
          callback(remoteReviews);
        } else {
          saveLocalReviews([]);
          callback([]);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, REVIEWS_COLLECTION);
        callback(getLocalReviews());
      }
    );

    return unsubscribe;
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, REVIEWS_COLLECTION);
    return () => {};
  }
}

/**
 * Subscribe to liked reviews for a specific authenticated user
 */
export function subscribeUserLikes(
  userId: string,
  callback: (likedReviewIds: Set<string>) => void
): () => void {
  if (!userId || !db) {
    try {
      const raw = localStorage.getItem(`${LOCAL_USER_LIKES_KEY}_${userId}`);
      if (raw) {
        callback(new Set(JSON.parse(raw)));
      } else {
        callback(new Set());
      }
    } catch {
      callback(new Set());
    }
    return () => {};
  }

  // Check likes subcollections or local cache
  try {
    const localRaw = localStorage.getItem(`${LOCAL_USER_LIKES_KEY}_${userId}`);
    if (localRaw) {
      callback(new Set(JSON.parse(localRaw)));
    }
  } catch {
    // ignore
  }

  return () => {};
}

/**
 * Post or update a review.
 * Enforces one primary review per authenticated Google account to prevent spam.
 */
export async function postReview(
  reviewData: {
    rating: number;
    comment: string;
    category: ReviewItem['category'];
  },
  userProfile: UserProfile
): Promise<ReviewItem> {
  if (!userProfile || !userProfile.uid) {
    throw new Error('You must be signed in with Google to post a review.');
  }

  // Deterministic doc ID per user to prevent duplicate review spam
  const docId = `user_${userProfile.uid}`;
  const now = new Date().toISOString();

  // Check if existing document exists to preserve createdAt
  let existingCreatedAt = now;
  let existingHelpful = 0;

  if (db) {
    try {
      const existingDoc = await getDoc(doc(db, REVIEWS_COLLECTION, docId));
      if (existingDoc.exists()) {
        const data = existingDoc.data();
        existingCreatedAt = data.createdAt || now;
        existingHelpful = data.helpfulCount || 0;
      }
    } catch {
      // If fetching fails, proceed with defaults
    }
  }

  const reviewPayload: ReviewItem = {
    id: docId,
    userId: userProfile.uid,
    userName: userProfile.displayName.trim() || 'Verified User',
    userRole: userProfile.role || 'Student',
    userAvatar: userProfile.photoURL || null,
    rating: Math.max(1, Math.min(5, Math.round(reviewData.rating))),
    comment: reviewData.comment.trim(),
    category: reviewData.category,
    helpfulCount: existingHelpful,
    createdAt: existingCreatedAt,
    updatedAt: now,
  };

  // Optimistically save locally
  const current = getLocalReviews();
  const index = current.findIndex((r) => r.id === docId || r.userId === userProfile.uid);
  let updatedList: ReviewItem[];
  if (index >= 0) {
    updatedList = [...current];
    updatedList[index] = reviewPayload;
  } else {
    updatedList = [reviewPayload, ...current];
  }
  saveLocalReviews(updatedList);

  if (db) {
    try {
      const reviewDocRef = doc(db, REVIEWS_COLLECTION, docId);
      await setDoc(reviewDocRef, {
        userId: userProfile.uid,
        userName: reviewPayload.userName,
        userRole: reviewPayload.userRole,
        userAvatar: reviewPayload.userAvatar,
        rating: reviewPayload.rating,
        comment: reviewPayload.comment,
        category: reviewPayload.category,
        helpfulCount: reviewPayload.helpfulCount,
        createdAt: reviewPayload.createdAt,
        updatedAt: reviewPayload.updatedAt,
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `${REVIEWS_COLLECTION}/${docId}`);
      throw err;
    }
  }

  return reviewPayload;
}

/**
 * Delete a user's own review
 */
export async function deleteUserReview(userId: string): Promise<void> {
  const docId = `user_${userId}`;
  const current = getLocalReviews();
  const filtered = current.filter((r) => r.id !== docId && r.userId !== userId);
  saveLocalReviews(filtered);

  if (db) {
    try {
      const reviewDocRef = doc(db, REVIEWS_COLLECTION, docId);
      await deleteDoc(reviewDocRef);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `${REVIEWS_COLLECTION}/${docId}`);
      throw err;
    }
  }
}

/**
 * Toggle like for a review.
 * Strictly prevents like spam by creating/deleting an authoritative like record
 * under `/reviews/{reviewId}/likes/{userId}` and atomic increments/decrements.
 */
export async function toggleReviewLike(
  reviewId: string,
  userId: string
): Promise<{ liked: boolean; newCount: number }> {
  if (!userId) {
    throw new Error('You must be signed in with Google to like reviews.');
  }

  const storageKey = `${LOCAL_USER_LIKES_KEY}_${userId}`;
  let userLikedSet = new Set<string>();
  try {
    const raw = localStorage.getItem(storageKey);
    if (raw) userLikedSet = new Set(JSON.parse(raw));
  } catch {
    // ignore
  }

  const isCurrentlyLiked = userLikedSet.has(reviewId);
  const nextLiked = !isCurrentlyLiked;

  if (nextLiked) {
    userLikedSet.add(reviewId);
  } else {
    userLikedSet.delete(reviewId);
  }
  localStorage.setItem(storageKey, JSON.stringify(Array.from(userLikedSet)));

  // Update local reviews list
  const current = getLocalReviews();
  let updatedCount = 0;
  const updated = current.map((r) => {
    if (r.id === reviewId) {
      const count = Math.max(0, r.helpfulCount + (nextLiked ? 1 : -1));
      updatedCount = count;
      return { ...r, helpfulCount: count };
    }
    return r;
  });
  saveLocalReviews(updated);

  // Sync with Firestore
  if (db && !reviewId.startsWith('seed-') && !reviewId.startsWith('rev-test')) {
    try {
      const likeDocRef = doc(db, REVIEWS_COLLECTION, reviewId, 'likes', userId);
      const reviewDocRef = doc(db, REVIEWS_COLLECTION, reviewId);

      if (nextLiked) {
        // Add like document and increment count
        await setDoc(likeDocRef, {
          userId,
          reviewId,
          createdAt: new Date().toISOString(),
        });
        await updateDoc(reviewDocRef, {
          helpfulCount: increment(1),
        });
      } else {
        // Remove like document and decrement count
        await deleteDoc(likeDocRef);
        await updateDoc(reviewDocRef, {
          helpfulCount: increment(-1),
        });
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `${REVIEWS_COLLECTION}/${reviewId}/likes/${userId}`);
    }
  }

  return { liked: nextLiked, newCount: updatedCount };
}

/**
 * Check if a user has liked a review
 */
export function isReviewLikedByUser(reviewId: string, userId?: string | null): boolean {
  if (!userId) return false;
  try {
    const raw = localStorage.getItem(`${LOCAL_USER_LIKES_KEY}_${userId}`);
    if (raw) {
      const set = new Set(JSON.parse(raw));
      return set.has(reviewId);
    }
  } catch {
    // ignore
  }
  return false;
}

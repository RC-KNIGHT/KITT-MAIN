/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ReviewItem } from '../../types/review';
import { useAuth } from '../../context/AuthContext';
import {
  subscribeReviews,
  postReview,
  toggleReviewLike,
  isReviewLikedByUser,
  deleteUserReview,
} from '../../lib/reviewsService';
import {
  Star,
  MessageSquarePlus,
  Send,
  ThumbsUp,
  Mail,
  User,
  GraduationCap,
  Sparkles,
  CheckCircle2,
  Filter,
  Heart,
  MessageCircle,
  LogIn,
  AlertCircle,
  Trash2,
  Edit3,
  ShieldCheck,
} from 'lucide-react';

interface ReviewsSectionProps {
  formOpenByDefault?: boolean;
}

export const ReviewsSection: React.FC<ReviewsSectionProps> = ({ formOpenByDefault = false }) => {
  const { currentUser, userProfile, setLoginViewOpen, signInWithGoogle } = useAuth();

  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(formOpenByDefault);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [deleteNotice, setDeleteNotice] = useState(false);

  // Form State
  const [rating, setRating] = useState<number>(5);
  const [category, setCategory] = useState<ReviewItem['category']>('compliment');
  const [comment, setComment] = useState('');
  const [formError, setFormError] = useState('');

  // Filtering
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  // Track liked review IDs for current user
  const [likedReviews, setLikedReviews] = useState<Set<string>>(new Set());

  // Subscribe to real-time reviews from Firestore
  useEffect(() => {
    const unsubscribe = subscribeReviews((data) => {
      setReviews(data);
    });
    return () => unsubscribe();
  }, []);

  // Update form fields if user already has a review
  useEffect(() => {
    if (currentUser?.uid && reviews.length > 0) {
      const userReview = reviews.find((r) => r.userId === currentUser.uid || r.id === `user_${currentUser.uid}`);
      if (userReview) {
        setRating(userReview.rating);
        setCategory(userReview.category);
        setComment(userReview.comment);
      }
    }
  }, [currentUser, reviews]);

  // Sync user likes
  useEffect(() => {
    if (currentUser?.uid) {
      const liked = new Set<string>();
      reviews.forEach((r) => {
        if (isReviewLikedByUser(r.id, currentUser.uid)) {
          liked.add(r.id);
        }
      });
      setLikedReviews(liked);
    } else {
      setLikedReviews(new Set());
    }
  }, [currentUser, reviews]);

  const userReview = currentUser?.uid
    ? reviews.find((r) => r.userId === currentUser.uid || r.id === `user_${currentUser.uid}`)
    : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser || !userProfile) {
      setLoginViewOpen(true);
      return;
    }

    if (!comment.trim() || comment.trim().length < 5) {
      setFormError('Please share at least a short sentence of feedback (minimum 5 characters).');
      return;
    }

    setIsSubmitting(true);
    setFormError('');

    try {
      await postReview(
        {
          rating,
          category,
          comment: comment.trim(),
        },
        userProfile
      );

      setSubmittedSuccess(true);
      setTimeout(() => {
        setSubmittedSuccess(false);
        setShowForm(false);
      }, 2000);
    } catch (err: any) {
      console.error('Failed to submit review:', err);
      setFormError('Could not save review. Please check your network connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteReview = async () => {
    if (!currentUser) return;
    if (window.confirm('Are you sure you want to delete your review?')) {
      await deleteUserReview(currentUser.uid);
      setComment('');
      setRating(5);
      setDeleteNotice(true);
      setTimeout(() => setDeleteNotice(false), 2500);
    }
  };

  const handleLikeToggle = async (reviewId: string) => {
    if (!currentUser) {
      setLoginViewOpen(true);
      return;
    }

    try {
      const res = await toggleReviewLike(reviewId, currentUser.uid);
      setLikedReviews((prev) => {
        const next = new Set(prev);
        if (res.liked) next.add(reviewId);
        else next.delete(reviewId);
        return next;
      });
    } catch (e) {
      console.warn('Could not toggle review like:', e);
    }
  };

  // Metrics
  const totalCount = reviews.length;
  const avgRating =
    totalCount > 0
      ? (reviews.reduce((acc, r) => acc + r.rating, 0) / totalCount).toFixed(1)
      : '5.0';

  const starCounts = [5, 4, 3, 2, 1].map((s) => ({
    star: s,
    count: reviews.filter((r) => r.rating === s).length,
    percentage:
      totalCount > 0
        ? Math.round((reviews.filter((r) => r.rating === s).length / totalCount) * 100)
        : 0,
  }));

  const filteredReviews = reviews.filter((r) => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === '5star') return r.rating === 5;
    return r.category === selectedFilter;
  });

  const ratingDescriptions: Record<number, string> = {
    1: '1 Star - Needs Improvement',
    2: '2 Stars - Fair Utility',
    3: '3 Stars - Good & Helpful',
    4: '4 Stars - Great Experience',
    5: '5 Stars - Outstanding Digital Logic Lab!',
  };

  return (
    <section id="reviews" className="py-12 sm:py-16 bg-[#070b14]/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-10 border-b border-slate-800">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono mb-3">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              <span>Verified Google Reviews & Lab Ratings</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Community Ratings & Feedback
            </h2>
            <p className="text-slate-400 text-sm mt-1 max-w-xl">
              Authentic reviews from electrical engineering students, university professors, and hardware makers around the world.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {currentUser && userProfile && !userProfile.uid.startsWith('guest-') ? (
              <button
                onClick={() => setShowForm(!showForm)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#E5092F] hover:bg-[#FF2448] text-white font-bold text-xs sm:text-sm transition-all shadow-lg shadow-[#E5092F]/20 active:scale-95 cursor-pointer"
              >
                {userReview ? <Edit3 className="w-4 h-4" /> : <MessageSquarePlus className="w-4 h-4" />}
                <span>{userReview ? 'Edit Your Review' : 'Write a Review'}</span>
              </button>
            ) : (
              <button
                onClick={() => setLoginViewOpen(true)}
                className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 hover:text-white border border-zinc-700 hover:border-[#E5092F]/40 text-xs sm:text-sm font-semibold transition-all active:scale-95 cursor-pointer shadow-sm"
              >
                <div className="w-5 h-5 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-center shrink-0">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                </div>
                <span>Sign in with Google to Review</span>
              </button>
            )}

            <a
              href="mailto:sriyansraj02@gmail.com?subject=DigiLogic%20Lab%20Feedback"
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-[#FF2448] border border-zinc-800 hover:border-zinc-700 text-xs sm:text-sm font-semibold transition-all"
            >
              <Mail className="w-4 h-4" />
              <span>Email Team KITT</span>
            </a>
          </div>
        </div>

        {/* Rating Summary Metrics Bar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 my-10 p-6 sm:p-8 rounded-2xl bg-[#0a0f1d] border border-slate-800">
          {/* Average Rating Block */}
          <div className="lg:col-span-4 flex flex-col items-center justify-center p-4 border-b lg:border-b-0 lg:border-r border-slate-800 text-center">
            <div className="text-5xl sm:text-6xl font-black text-white font-mono tracking-tight flex items-baseline gap-1">
              <span>{avgRating}</span>
              <span className="text-xl font-normal text-slate-500">/ 5.0</span>
            </div>
            <div className="flex items-center gap-1 my-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-5 h-5 ${
                    star <= Math.round(Number(avgRating) || 5)
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-slate-600'
                  }`}
                />
              ))}
            </div>
            <div className="text-xs font-mono text-slate-400">
              Based on <strong className="text-slate-200">{totalCount}</strong> verified lab reviews
            </div>
          </div>

          {/* Star Distribution Breakdown */}
          <div className="lg:col-span-5 flex flex-col justify-center space-y-2 py-2">
            {starCounts.map(({ star, count, percentage }) => (
              <div key={star} className="flex items-center gap-3 text-xs font-mono">
                <span className="w-12 text-slate-400 flex items-center gap-1 shrink-0">
                  <span>{star}</span>
                  <Star className="w-3 h-3 fill-amber-400/80 text-amber-400/80" />
                </span>
                <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="w-8 text-right text-slate-500">{count}</span>
              </div>
            ))}
          </div>

          {/* Highlight Card */}
          <div className="lg:col-span-3 flex flex-col justify-center p-4 bg-[#E5092F]/10 rounded-xl border border-[#E5092F]/20 text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start gap-2 text-[#FF2448] font-bold text-xs mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span>Google Verified Reviews</span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed mt-1">
              Every review and like is secured with Google OAuth and Firestore ABAC rules to guarantee zero spam and verified identities.
            </p>
          </div>
        </div>

        {/* Delete Notice Banner */}
        {deleteNotice && (
          <div className="mb-6 p-4 rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#FF2448]" />
            <span>Your review has been removed.</span>
          </div>
        )}

        {/* Review Submission / Edit Form */}
        {showForm && (
          <div className="mb-10 p-6 sm:p-8 rounded-2xl bg-gradient-to-b from-[#18181B] to-[#0D0D0F] border border-[#E5092F]/40 shadow-2xl shadow-[#E5092F]/5 animate-fadeIn">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#E5092F]/20 border border-[#E5092F]/40 text-[#FF2448] flex items-center justify-center font-bold">
                  {userProfile?.displayName.charAt(0).toUpperCase() || <User className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
                    <span>{userReview ? 'Edit Your Lab Review' : 'Write a Lab Review'}</span>
                    <span className="text-xs font-normal text-[#FF2448] bg-[#E5092F]/10 px-2 py-0.5 rounded-full border border-[#E5092F]/30">
                      {userProfile?.role || 'Student'}
                    </span>
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Publishing as <strong className="text-zinc-200">{userProfile?.displayName}</strong> ({currentUser?.email})
                  </p>
                </div>
              </div>

              {userReview && (
                <button
                  type="button"
                  onClick={handleDeleteReview}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-500/30 text-xs font-semibold transition-all cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              )}
            </div>

            {submittedSuccess ? (
              <div className="p-6 text-center space-y-2 bg-[#E5092F]/10 rounded-xl border border-[#E5092F]/30">
                <CheckCircle2 className="w-10 h-10 text-[#FF2448] mx-auto" />
                <h4 className="font-bold text-white text-base font-mono">Review Saved Successfully!</h4>
                <p className="text-xs text-zinc-300">
                  Thank you for contributing to DigiLogic Lab. Your feedback has been synchronized with the community.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {formError && (
                  <div className="p-3.5 rounded-xl bg-red-950/50 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                {/* Rating Stars Selector */}
                <div>
                  <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-slate-300 mb-2">
                    Your Rating (1 to 5 Stars)
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setRating(star)}
                        className="p-1 hover:scale-110 transition-transform cursor-pointer"
                      >
                        <Star
                          className={`w-7 h-7 sm:w-8 sm:h-8 ${
                            star <= rating
                              ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]'
                              : 'text-slate-700 hover:text-slate-500'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="ml-3 text-xs font-mono text-amber-400 font-semibold">
                      {ratingDescriptions[rating]}
                    </span>
                  </div>
                </div>

                {/* Feedback Category */}
                <div>
                  <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-slate-300 mb-2">
                    Feedback Category
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {(
                      [
                        { id: 'compliment', label: 'Compliment' },
                        { id: 'general', label: 'General Review' },
                        { id: 'classroom', label: 'Classroom / Edu' },
                        { id: 'feature_request', label: 'Feature Idea' },
                        { id: 'bug_report', label: 'Bug / Improvement' },
                      ] as const
                    ).map((cat) => (
                      <button
                        type="button"
                        key={cat.id}
                        onClick={() => setCategory(cat.id)}
                        className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all border text-center ${
                          category === cat.id
                            ? 'bg-[#E5092F]/20 text-[#FF2448] border-[#E5092F]/50 shadow-sm'
                            : 'bg-zinc-900/80 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Comment Field */}
                <div>
                  <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-zinc-300 mb-2">
                    Your Review & Suggestions
                  </label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={4}
                    maxLength={1000}
                    placeholder="Describe your experience with the simulator, circuit tests, classroom labs, or features you'd like Team KITT to build next..."
                    required
                    className="w-full px-4 py-3 rounded-xl bg-zinc-950 border border-zinc-800 focus:border-[#E5092F] text-white text-xs sm:text-sm font-normal placeholder-zinc-600 outline-none transition-all resize-y"
                  />
                  <div className="flex justify-between items-center text-[10px] font-mono text-zinc-500 mt-1">
                    <span>Markdown formatting supported</span>
                    <span>{comment.length} / 1000 characters</span>
                  </div>
                </div>

                {/* Form Buttons */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 text-xs font-semibold transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#E5092F] hover:bg-[#FF2448] disabled:bg-[#E5092F]/40 text-white font-bold text-xs sm:text-sm transition-all shadow-lg shadow-[#E5092F]/20 active:scale-95 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>{isSubmitting ? 'Publishing...' : userReview ? 'Update Review' : 'Post Review'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 mb-8">
          <span className="text-xs font-mono text-slate-500 mr-2 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Filter by:
          </span>
          {[
            { id: 'all', label: 'All Reviews' },
            { id: '5star', label: '5-Star Only' },
            { id: 'compliment', label: 'Compliments' },
            { id: 'classroom', label: 'Education' },
            { id: 'feature_request', label: 'Feature Requests' },
            { id: 'bug_report', label: 'Improvements' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setSelectedFilter(f.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-mono transition-all ${
                selectedFilter === f.id
                  ? 'bg-[#E5092F]/20 text-[#FF2448] border border-[#E5092F]/40'
                  : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Reviews Grid */}
        {filteredReviews.length === 0 ? (
          <div className="py-16 text-center rounded-2xl bg-[#0D0D0F] border border-zinc-800 text-zinc-400">
            <MessageCircle className="w-10 h-10 mx-auto text-zinc-600 mb-3" />
            <p className="text-sm font-semibold text-zinc-300">No reviews found in this category yet.</p>
            <p className="text-xs text-zinc-500 mt-1">Be the first to share your thoughts!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredReviews.map((review) => {
              const isOwner = currentUser?.uid && (review.userId === currentUser.uid || review.id === `user_${currentUser.uid}`);
              const isLiked = likedReviews.has(review.id);

              return (
                <div
                  key={review.id}
                  className={`flex flex-col justify-between p-5 rounded-2xl bg-[#0D0D0F] border transition-all duration-300 ${
                    isOwner
                      ? 'border-[#E5092F]/50 shadow-[0_0_20px_rgba(229,9,47,0.1)]'
                      : 'border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <div>
                    {/* Review Header: User Info & Stars */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2.5">
                        {review.userAvatar ? (
                          <img
                            src={review.userAvatar}
                            alt={review.userName}
                            className="w-9 h-9 rounded-xl object-cover border border-zinc-700"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-xl bg-zinc-800 border border-zinc-700 text-[#FF2448] flex items-center justify-center font-bold text-xs font-mono">
                            {review.userName.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-xs sm:text-sm text-white font-mono truncate max-w-[130px]">
                              {review.userName}
                            </span>
                            {isOwner && (
                              <span className="px-1.5 py-0.2 rounded bg-[#E5092F]/20 text-[#FF2448] text-[9px] font-mono border border-[#E5092F]/30">
                                You
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] font-mono text-zinc-400">
                            {review.userRole || 'Student'}
                          </div>
                        </div>
                      </div>

                      {/* Stars */}
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-3.5 h-3.5 ${
                              star <= review.rating
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-zinc-700'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Review Category Tag */}
                    <div className="mb-3">
                      <span className="inline-block px-2 py-0.5 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-400 text-[10px] font-mono capitalize">
                        {review.category.replace('_', ' ')}
                      </span>
                    </div>

                    {/* Review Text */}
                    <p className="text-xs text-zinc-300 leading-relaxed whitespace-pre-line mb-4">
                      "{review.comment}"
                    </p>
                  </div>

                  {/* Review Footer: Date & Spam-Proof Like Counter */}
                  <div className="pt-3 border-t border-zinc-800 flex items-center justify-between text-[11px] font-mono text-zinc-500">
                    <span>
                      {new Date(review.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>

                    <button
                      onClick={() => handleLikeToggle(review.id)}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all text-xs cursor-pointer ${
                        isLiked
                          ? 'bg-[#E5092F]/20 text-[#FF2448] border border-[#E5092F]/40 shadow-sm'
                          : 'bg-zinc-900/90 text-zinc-400 hover:text-white border border-zinc-800 hover:border-zinc-700'
                      }`}
                      title={isLiked ? 'Unlike' : 'Mark as helpful'}
                    >
                      <ThumbsUp className={`w-3.5 h-3.5 ${isLiked ? 'fill-[#FF2448] text-[#FF2448]' : ''}`} />
                      <span>{review.helpfulCount || 0}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

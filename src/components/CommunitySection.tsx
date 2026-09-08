import React, { useState } from 'react';
import { 
  Users, 
  Heart, 
  Star, 
  MessageSquare, 
  GitFork, 
  Eye, 
  Share2, 
  Send, 
  Check, 
  Cpu, 
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { COMMUNITY_PROJECTS } from '../data/ecosystem';
import { CommunityProject } from '../types';

export const CommunitySection: React.FC = () => {
  const [projects, setProjects] = useState<CommunityProject[]>(COMMUNITY_PROJECTS);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeCommentProject, setActiveCommentProject] = useState<CommunityProject | null>(null);
  const [newCommentText, setNewCommentText] = useState('');
  const [copiedShareId, setCopiedShareId] = useState<string | null>(null);

  const categories = ['All', 'IoT & Sensors', 'Digital Logic', 'Arduino / MCU', 'Power & Analog'];

  const filteredProjects = selectedCategory === 'All'
    ? projects
    : projects.filter(p => p.category === selectedCategory);

  const handleToggleLike = (projectId: string) => {
    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        const isLiked = !p.isLiked;
        return {
          ...p,
          isLiked,
          likes: isLiked ? p.likes + 1 : p.likes - 1
        };
      }
      return p;
    }));
  };

  const handleRate = (projectId: string, score: number) => {
    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        const newCount = p.ratingCount + (p.userRating ? 0 : 1);
        const newRating = Number(((p.rating * p.ratingCount + score) / newCount).toFixed(1));
        return {
          ...p,
          userRating: score,
          rating: newRating,
          ratingCount: newCount
        };
      }
      return p;
    }));
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim() || !activeCommentProject) return;

    const newComment = {
      id: 'c-' + Date.now(),
      author: 'You (Hardware Engineer)',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
      date: 'Just now',
      text: newCommentText.trim(),
      likes: 0
    };

    setProjects(prev => prev.map(p => {
      if (p.id === activeCommentProject.id) {
        return {
          ...p,
          commentsCount: p.commentsCount + 1,
          comments: [newComment, ...p.comments]
        };
      }
      return p;
    }));

    setActiveCommentProject(prev => prev ? {
      ...prev,
      commentsCount: prev.commentsCount + 1,
      comments: [newComment, ...prev.comments]
    } : null);

    setNewCommentText('');
  };

  const handleShare = (projectId: string) => {
    navigator.clipboard.writeText(`https://kitt.ai/project/${projectId}`);
    setCopiedShareId(projectId);
    setTimeout(() => setCopiedShareId(null), 2000);
  };

  return (
    <section id="community" className="py-24 px-4 sm:px-6 lg:px-8 bg-transparent relative border-t border-[#A58D66]/15">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#A58D66]/15 border border-[#A58D66]/35 text-[#A58D66] text-xs font-mono uppercase tracking-widest animate-ambition">
            <Users className="w-3.5 h-3.5 text-[#A58D66]" />
            <span>THE SALON OF TITANS</span>
          </div>

          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-bold font-cinzel text-[#E5E1DD] tracking-tight leading-tight">
            Proven Inventions. <br />
            <span className="animate-text-shimmer italic font-cormorant font-normal block mt-1">
              Realized Silicon.
            </span>
          </h2>

          <p className="text-base sm:text-lg text-[#E5E1DD] font-serif italic max-w-lg mx-auto leading-relaxed">
            "Fork, verify, and fabricate hardware built by master architects."
          </p>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-gradient-to-r from-[#A58D66] to-[#8C7654] text-[#080f14] font-bold shadow-[0_0_15px_rgba(165,141,102,0.3)]'
                  : 'bg-[#0a1218] hover:bg-[#407E8C]/15 text-[#E5E1DD]/75 border border-[#A58D66]/20'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Community Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="rounded-2xl surreal-card p-6 flex flex-col justify-between transition-all duration-300 shadow-xl group hover:shadow-2xl border border-[#A58D66]/20 hover:border-[#407E8C]/40"
            >
              {/* Creator & Category Header */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={project.creator.avatar}
                      alt={project.creator.name}
                      className="w-8 h-8 rounded-full object-cover border border-[#A58D66]/40"
                    />
                    <div>
                      <div className="text-xs font-bold text-[#E5E1DD] group-hover:text-[#A58D66] transition-colors font-cinzel">
                        {project.creator.name}
                      </div>
                      <div className="text-[10px] text-[#A58D66] font-mono">
                        {project.creator.role}
                      </div>
                    </div>
                  </div>

                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#407E8C]/20 border border-[#407E8C]/35 text-[#76B4C2]">
                    {project.category}
                  </span>
                </div>

                {/* Title & Description */}
                <div>
                  <h3 className="text-lg font-bold font-cinzel text-[#E5E1DD] leading-snug">
                    {project.title}
                  </h3>
                  <p className="text-xs text-[#E5E1DD]/70 mt-2 line-clamp-2 leading-relaxed font-light">
                    {project.description}
                  </p>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {project.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#407E8C]/15 text-[#76B4C2] border border-[#407E8C]/30"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                {/* Hardware BOM Tags */}
                <div className="p-3 bg-[#080f14]/60 rounded-xl border border-[#A58D66]/15 space-y-1">
                  <span className="text-[10px] font-mono text-[#A58D66] block uppercase">
                    Components Integrated:
                  </span>
                  <p className="text-xs font-mono text-[#E5E1DD]/80 line-clamp-1">
                    {project.hardwareList.join(' • ')}
                  </p>
                </div>
              </div>

              {/* Bottom Metrics & Actions */}
              <div className="pt-5 mt-4 border-t border-[#A58D66]/15 space-y-3">
                {/* Likes, Comments, Rating Row */}
                <div className="flex items-center justify-between text-xs text-[#E5E1DD]/60">
                  <div className="flex items-center gap-3">
                    {/* Like button */}
                    <button
                      onClick={() => handleToggleLike(project.id)}
                      className={`flex items-center gap-1 transition-colors cursor-pointer ${
                        project.isLiked ? 'text-[#A58D66]' : 'hover:text-[#E5E1DD]'
                      }`}
                    >
                      <Heart className={`w-3.5 h-3.5 ${project.isLiked ? 'fill-[#A58D66] text-[#A58D66]' : ''}`} />
                      <span>{project.likes}</span>
                    </button>

                    {/* Comments button */}
                    <button
                      onClick={() => setActiveCommentProject(project)}
                      className="flex items-center gap-1 hover:text-[#E5E1DD] transition-colors cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>{project.commentsCount}</span>
                    </button>

                    {/* Views */}
                    <span className="flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5" />
                      <span>{project.views}</span>
                    </span>
                  </div>

                  {/* Rating Stars */}
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => handleRate(project.id, star)}
                        className="cursor-pointer hover:scale-125 transition-transform"
                        title={`Rate ${star} Stars`}
                      >
                        <Star
                          className={`w-3 h-3 ${
                            star <= Math.round(project.rating)
                              ? 'text-[#A58D66] fill-[#A58D66]'
                              : 'text-slate-600'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-[11px] font-mono text-[#E5E1DD]/80 ml-1">
                      {project.rating}
                    </span>
                  </div>
                </div>

                {/* Fork and Share Actions */}
                <div className="flex items-center gap-2 pt-1">
                  <a
                    href="https://kitt-ai-ravi.ai.studio"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2 px-3 rounded-lg bg-[#407E8C]/15 hover:bg-[#407E8C]/25 text-[#E5E1DD] border border-[#407E8C]/35 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <GitFork className="w-3 h-3 text-[#A58D66]" />
                    <span>Remix Circuit ({project.forkCount})</span>
                  </a>

                  <button
                    onClick={() => handleShare(project.id)}
                    className="p-2 rounded-lg bg-white/5 hover:bg-[#A58D66]/20 text-[#E5E1DD]/70 hover:text-[#E5E1DD] border border-[#A58D66]/20 text-xs transition-colors"
                    title="Share Project Link"
                  >
                    {copiedShareId === project.id ? (
                      <Check className="w-3.5 h-3.5 text-[#A58D66]" />
                    ) : (
                      <Share2 className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Community Comments Drawer / Modal */}
      {activeCommentProject && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#11131c] border border-white/15 rounded-2xl max-w-lg w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Drawer Header */}
            <div className="p-4 bg-[#151824] border-b border-white/10 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-white">
                  Discussion: {activeCommentProject.title}
                </h4>
                <p className="text-[11px] text-slate-400 font-mono">
                  {activeCommentProject.comments.length} Engineering Comments
                </p>
              </div>
              <button
                onClick={() => setActiveCommentProject(null)}
                className="text-slate-400 hover:text-white text-sm p-1"
              >
                ✕
              </button>
            </div>

            {/* Comments List */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 divide-y divide-white/5">
              {activeCommentProject.comments.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400">
                  No comments yet. Be the first to ask about the hardware wiring!
                </div>
              ) : (
                activeCommentProject.comments.map((comment) => (
                  <div key={comment.id} className="pt-3 first:pt-0 space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img
                          src={comment.avatar}
                          alt={comment.author}
                          className="w-5 h-5 rounded-full object-cover"
                        />
                        <span className="text-xs font-semibold text-white">
                          {comment.author}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500">
                        {comment.date}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 pl-7 leading-relaxed">
                      {comment.text}
                    </p>
                  </div>
                ))
              )}
            </div>

            {/* Add Comment Box */}
            <form onSubmit={handleAddComment} className="p-4 bg-[#0b141a] border-t border-[#A58D66]/20 flex gap-2">
              <input
                type="text"
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                placeholder="Inquire on electrical topology, pin allocation, or synthesis..."
                className="flex-1 px-3 py-2 rounded-lg bg-[#080f14] border border-[#A58D66]/30 text-xs text-[#E5E1DD] placeholder:text-[#E5E1DD]/40 focus:outline-none focus:border-[#407E8C]"
              />
              <button
                type="submit"
                disabled={!newCommentText.trim()}
                className="px-4 py-2 rounded-lg bg-[#A58D66] hover:bg-[#b89f76] disabled:opacity-40 text-[#080f14] font-semibold text-xs flex items-center gap-1 cursor-pointer transition-colors shadow-sm"
              >
                <span>Post</span>
                <Send className="w-3 h-3" />
              </button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

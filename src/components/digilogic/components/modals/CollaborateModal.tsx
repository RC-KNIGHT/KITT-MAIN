/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useCircuit } from '../../context/CircuitContext';
import { useCollaboration, generateTemporaryName } from '../../context/CollaborationContext';
import { useAuth } from '../../context/AuthContext';
import {
  Users,
  Copy,
  Check,
  Share2,
  LogOut,
  RefreshCw,
  Zap,
  Sparkles,
  Wifi,
  AlertCircle,
  X,
  PlusCircle,
  LogIn,
  History,
  Edit2,
  Trash2,
  Server,
  Shield,
  Clock,
  ArrowRight,
} from 'lucide-react';

const WEBSITE_BASE_URL = 'https://logic-gates-simulator-4jo.pages.dev';

export const CollaborateModal: React.FC = () => {
  const { setActiveModal, colorMode } = useCircuit();
  const isLight = colorMode === 'light';
  const { userProfile } = useAuth();
  const {
    isCollaborating,
    room,
    roomCode,
    currentUser,
    collaborators,
    errorMessage,
    recentServers,
    createRoom,
    joinRoom,
    leaveRoom,
    updateServerName,
    deleteRecentServer,
  } = useCollaboration();

  const [activeTab, setActiveTab] = useState<'create' | 'join' | 'recent'>('create');

  // Creation form state
  const [createHostName, setCreateHostName] = useState<string>(() => userProfile?.displayName || generateTemporaryName());
  const [createServerName, setCreateServerName] = useState<string>('Live Logic Lab');

  // Join form state
  const [inputCode, setInputCode] = useState<string>('');
  const [joinName, setJoinName] = useState<string>(() => userProfile?.displayName || generateTemporaryName());

  // Active Server inline editing state
  const [isEditingServerName, setIsEditingServerName] = useState<boolean>(false);
  const [editServerNameValue, setEditServerNameValue] = useState<string>('');
  const [isSavingServerName, setIsSavingServerName] = useState<boolean>(false);

  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // Sync edit server name value when room updates
  useEffect(() => {
    if (room?.name) {
      setEditServerNameValue(room.name);
    }
  }, [room?.name]);

  // Auto-detect URL ?room= parameter to immediately switch to Join tab with code pre-filled
  useEffect(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const roomParam = urlParams.get('room') || urlParams.get('r') || urlParams.get('join');
      if (roomParam && !isCollaborating) {
        setInputCode(roomParam.trim().toUpperCase());
        setActiveTab('join');
      }
    } catch {
      // Ignore
    }
  }, [isCollaborating]);

  // Handle Room Creation
  const handleCreateRoom = async () => {
    setLoading(true);
    setLocalError(null);
    const res = await createRoom(createServerName, createHostName);
    setLoading(false);
    if (!res.success) {
      setLocalError(res.error || 'Failed to create live server');
    }
  };

  // Handle Joining Room
  const handleJoinRoom = async (overrideCode?: string) => {
    const code = (overrideCode || inputCode).trim().toUpperCase();
    if (!code) {
      setLocalError('Please enter a valid 6-character server code');
      return;
    }
    setLoading(true);
    setLocalError(null);
    const res = await joinRoom(code, joinName);
    setLoading(false);
    if (!res.success) {
      setLocalError(res.error || 'Failed to join server. Please check the code.');
    }
  };

  // Save renamed server title
  const handleSaveRenamedServer = async () => {
    if (!editServerNameValue.trim()) return;
    setIsSavingServerName(true);
    const success = await updateServerName(editServerNameValue.trim());
    setIsSavingServerName(false);
    if (success) {
      setIsEditingServerName(false);
    } else {
      setLocalError('Failed to update server name');
    }
  };

  // Copy Room Code
  const handleCopyCode = () => {
    if (roomCode) {
      navigator.clipboard.writeText(roomCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  // Copy or Share Invite Link directly pointing to website URL
  const handleCopyLink = async () => {
    if (roomCode) {
      const inviteUrl = `${WEBSITE_BASE_URL}?room=${roomCode}`;
      try {
        if (navigator.share && /mobile|android|iphone|ipad/i.test(navigator.userAgent)) {
          await navigator.share({
            title: `Join ${room?.name || 'Logic Gates'} Live Server`,
            text: `Collaborate in real-time on logic circuits! Server Code: ${roomCode}`,
            url: inviteUrl,
          });
          setCopiedLink(true);
          setTimeout(() => setCopiedLink(false), 2000);
          return;
        }
      } catch {
        // Fallback to clipboard
      }

      try {
        await navigator.clipboard.writeText(inviteUrl);
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
      } catch (err) {
        console.warn('Failed to copy to clipboard', err);
      }
    }
  };

  return (
    <div
      id="collaborate-modal-backdrop"
      className={`fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 animate-fade-in ${
        isLight ? 'bg-[#080f14]/40 backdrop-blur-xs' : 'bg-[#080f14]/80 backdrop-blur-md'
      }`}
      onClick={() => setActiveModal('none')}
    >
      <div
        id="collaborate-modal-container"
        className={`modal-overlay-container relative w-full max-w-xl border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] transition-colors ${
          isLight
            ? 'bg-white border-slate-300 text-slate-800'
            : 'bg-[#0d171f] border-[#A58D66]/20 text-[#E5E1DD]'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`flex items-center justify-between px-5 sm:px-6 py-4 border-b ${
          isLight
            ? 'bg-slate-50 border-slate-200'
            : 'bg-[#0d171f] border-[#A58D66]/20'
        }`}>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#A58D66]/15 border border-[#A58D66]/40 text-[#DFCCA8]">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h2 className={`text-base sm:text-lg font-bold flex items-center gap-2 ${
                isLight ? 'text-slate-900' : 'text-[#E5E1DD]'
              }`}>
                Live Sync Collaborative Server
                {isCollaborating && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#407E8C]/20 text-[#76B4C2] border border-[#407E8C]/40 shadow-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#76B4C2] animate-pulse" />
                    LIVE
                  </span>
                )}
              </h2>
              <p className={`text-xs ${isLight ? 'text-[#E5E1DD]/45' : 'text-[#E5E1DD]/60'}`}>
                Ultra-fast real-time synchronization with persistent session restore
              </p>
            </div>
          </div>
          <button
            id="close-collab-modal"
            onClick={() => setActiveModal('none')}
            className={`p-2 rounded-lg transition-colors cursor-pointer ${
              isLight
                ? 'text-[#E5E1DD]/60 hover:text-slate-700 hover:bg-slate-100'
                : 'text-[#E5E1DD]/60 hover:text-[#E5E1DD] hover:bg-[#0d171f]'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
          {/* Error Banner */}
          {(errorMessage || localError) && (
            <div className="flex items-start gap-3 p-3.5 bg-[#A58D66]/10 border border-[#A58D66]/30 rounded-xl text-[#DFCCA8] text-xs leading-relaxed">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-[#A58D66]" />
              <span>{localError || errorMessage}</span>
            </div>
          )}

          {/* If In Active Room */}
          {isCollaborating && roomCode && currentUser ? (
            <div className="space-y-5">
              {/* Server Name & Code Card */}
              <div className={`p-4 sm:p-5 rounded-xl space-y-3.5 shadow-md border ${
                isLight
                  ? 'bg-slate-50 border-slate-200'
                  : 'bg-[#080f14] border-[#A58D66]/30 shadow-lg'
              }`}>
                {/* Editable Server Name */}
                <div className={`flex items-center justify-between gap-2 border-b pb-3 ${
                  isLight ? 'border-slate-200' : 'border-[#A58D66]/20'
                }`}>
                  {isEditingServerName ? (
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        type="text"
                        value={editServerNameValue}
                        onChange={(e) => setEditServerNameValue(e.target.value)}
                        placeholder="Server Name"
                        className={`flex-1 rounded-lg px-3 py-1.5 text-sm font-bold border focus:outline-none focus:ring-1 focus:ring-[#A58D66] ${
                          isLight
                            ? 'bg-white border-slate-300 text-slate-900'
                            : 'bg-[#080f14] border-[#A58D66]/40 text-[#E5E1DD]'
                        }`}
                        autoFocus
                      />
                      <button
                        onClick={handleSaveRenamedServer}
                        disabled={isSavingServerName}
                        className="px-3 py-1.5 bg-[#A58D66] hover:bg-[#DFCCA8] text-[#080f14] text-xs font-bold rounded-lg transition-colors cursor-pointer"
                      >
                        {isSavingServerName ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        onClick={() => {
                          setIsEditingServerName(false);
                          setEditServerNameValue(room?.name || 'Circuit Server');
                        }}
                        className={`px-2.5 py-1.5 text-xs rounded-lg transition-colors cursor-pointer ${
                          isLight
                            ? 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                            : 'bg-[#0d171f] hover:bg-[#0d171f] text-[#E5E1DD]/60'
                        }`}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2 min-w-0">
                        <Server className="w-4 h-4 text-[#A58D66] shrink-0" />
                        <span className={`font-bold text-sm sm:text-base truncate ${
                          isLight ? 'text-slate-900' : 'text-[#E5E1DD]'
                        }`}>
                          {room?.name || 'Live Circuit Server'}
                        </span>
                        <button
                          onClick={() => {
                            setEditServerNameValue(room?.name || '');
                            setIsEditingServerName(true);
                          }}
                          className={`p-1 rounded-md transition-colors cursor-pointer ${
                            isLight
                              ? 'text-[#E5E1DD]/60 hover:text-[#A58D66]'
                              : 'text-[#E5E1DD]/60 hover:text-[#DFCCA8]'
                          }`}
                          title="Rename Live Server"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <span className="text-xs text-[#76B4C2] font-medium flex items-center gap-1 shrink-0 bg-[#407E8C]/15 px-2 py-0.5 rounded-full border border-[#407E8C]/30">
                        <Wifi className="w-3.5 h-3.5" />
                        Connected
                      </span>
                    </div>
                  )}
                </div>

                {/* Server Room Code & Quick Share */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                  <div>
                    <span className={`text-[11px] font-bold uppercase tracking-wider block mb-0.5 ${
                      isLight ? 'text-[#E5E1DD]/45' : 'text-[#E5E1DD]/60'
                    }`}>
                      Server Room Code
                    </span>
                    <span className="text-2xl sm:text-3xl font-mono font-black tracking-widest text-[#DFCCA8]">
                      {roomCode}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopyCode}
                      className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border transition-all min-h-[44px] cursor-pointer ${
                        isLight
                          ? 'bg-white hover:bg-slate-100 text-slate-800 border-slate-300 shadow-2xs'
                          : 'bg-[#0d171f] hover:bg-[#0d171f] text-[#E5E1DD] border-[#A58D66]/20'
                      }`}
                    >
                      {copiedCode ? <Check className="w-3.5 h-3.5 text-[#A58D66]" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedCode ? 'Copied' : 'Copy Code'}
                    </button>
                    <button
                      onClick={handleCopyLink}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 bg-[#A58D66] hover:bg-[#DFCCA8] text-[#080f14] text-xs font-bold rounded-xl transition-all shadow-md min-h-[44px] cursor-pointer"
                    >
                      {copiedLink ? <Check className="w-3.5 h-3.5 text-[#080f14]" /> : <Share2 className="w-3.5 h-3.5" />}
                      {copiedLink ? 'Link Copied' : 'Share Link'}
                    </button>
                  </div>
                </div>

                {/* Persistence Notice */}
                <div className={`flex items-center gap-2 pt-2 border-t text-[11px] font-medium ${
                  isLight ? 'border-slate-200 text-slate-700' : 'border-[#A58D66]/20 text-[#DFCCA8]'
                }`}>
                  <Shield className="w-3.5 h-3.5 shrink-0" />
                  <span>Session Protected: Closing Chrome will not lose your server. You will auto-reconnect upon return.</span>
                </div>
              </div>

              {/* Connected Collaborators */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                    isLight ? 'text-slate-700' : 'text-[#DFCCA8]'
                  }`}>
                    <Users className="w-3.5 h-3.5 text-[#A58D66]" />
                    Online Collaborators ({collaborators.length + 1})
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* Current User */}
                  <div
                    className={`flex items-center gap-3 p-3 rounded-xl border shadow-xs ${
                      isLight ? 'bg-white' : 'bg-[#080f14]'
                    }`}
                    style={{ borderColor: `${currentUser.color}70` }}
                  >
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-[#E5E1DD] shadow-md text-sm shrink-0"
                      style={{ backgroundColor: currentUser.color }}
                    >
                      {currentUser.initial}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-sm font-bold truncate ${
                          isLight ? 'text-slate-900' : 'text-[#E5E1DD]'
                        }`}>
                          {currentUser.name}
                        </span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-bold ${
                          isLight ? 'bg-slate-100 text-[#A58D66]' : 'bg-[#080f14] text-[#DFCCA8]'
                        }`}>
                          YOU
                        </span>
                      </div>
                      <span className={`text-xs ${isLight ? 'text-[#E5E1DD]/45' : 'text-[#E5E1DD]/60'}`}>
                        {currentUser.isHost ? 'Server Host' : 'Collaborator'}
                      </span>
                    </div>
                  </div>

                  {/* Remote Collaborators */}
                  {collaborators.map((user) => (
                    <div
                      key={user.id}
                      className={`flex items-center gap-3 p-3 rounded-xl border shadow-xs ${
                        isLight ? 'bg-white' : 'bg-[#080f14]'
                      }`}
                      style={{ borderColor: `${user.color}40` }}
                    >
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-[#E5E1DD] shadow-md text-sm shrink-0"
                        style={{ backgroundColor: user.color }}
                      >
                        {user.initial}
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className={`text-sm font-bold truncate block ${
                          isLight ? 'text-slate-900' : 'text-[#E5E1DD]'
                        }`}>
                          {user.name}
                        </span>
                        <span className="text-xs text-[#76B4C2] flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#76B4C2]" />
                          Online & Syncing
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Interaction Features Info */}
              <div className={`p-3.5 rounded-xl space-y-2 text-xs border ${
                isLight
                  ? 'bg-slate-50 border-slate-200 text-slate-700'
                  : 'bg-[#080f14]/80 border-[#A58D66]/20 text-[#DFCCA8]'
              }`}>
                <div className="flex items-center gap-2 font-semibold text-[#DFCCA8]">
                  <Sparkles className="w-4 h-4" />
                  Real-Time Canvas Interaction
                </div>
                <p className={`leading-relaxed ${isLight ? 'text-slate-600' : 'text-[#E5E1DD]/60'}`}>
                  • <strong>Seamless Wire & Gate Sync</strong>: All wire connections, gate movements, input pin changes, switch toggles, and component renames sync instantaneously.
                </p>
                <p className={`leading-relaxed ${isLight ? 'text-slate-600' : 'text-[#E5E1DD]/60'}`}>
                  • <strong>Asset Highlight Badges & Cursors</strong>: Collaborators' initials appear directly on gates they select with live mouse/touch pointer tags.
                </p>
              </div>

              {/* Bottom Actions */}
              <div className={`flex items-center justify-between pt-2 border-t ${
                isLight ? 'border-slate-200' : 'border-[#A58D66]/20'
              }`}>
                <span className={`text-xs ${isLight ? 'text-[#E5E1DD]/45' : 'text-[#E5E1DD]/60'}`}>
                  Room Host: <strong className={isLight ? 'text-slate-800' : 'text-[#E5E1DD]'}>{room?.hostName || currentUser.name}</strong>
                </span>
                <button
                  onClick={leaveRoom}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-[#A58D66]/10 hover:bg-[#A58D66]/20 text-[#DFCCA8] border border-[#A58D66]/30 text-xs font-bold rounded-xl transition-all min-h-[44px] cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Leave Server
                </button>
              </div>
            </div>
          ) : (
            /* Not in Room: Create, Join, or Recent */
            <div className="space-y-5">
              {/* Tab Selector */}
              <div className={`grid grid-cols-3 p-1 rounded-xl border ${
                isLight ? 'bg-slate-100 border-slate-300' : 'bg-[#080f14] border-[#A58D66]/20'
              }`}>
                <button
                  onClick={() => setActiveTab('create')}
                  className={`flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-bold transition-all min-h-[44px] cursor-pointer ${
                    activeTab === 'create'
                      ? 'bg-[#A58D66] text-[#080f14] shadow-md'
                      : isLight
                      ? 'text-slate-600 hover:text-slate-900'
                      : 'text-[#E5E1DD]/60 hover:text-[#DFCCA8]'
                  }`}
                >
                  <PlusCircle className="w-4 h-4" />
                  <span className="hidden sm:inline">Create Server</span>
                  <span className="sm:hidden">Create</span>
                </button>
                <button
                  onClick={() => setActiveTab('join')}
                  className={`flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-bold transition-all min-h-[44px] cursor-pointer ${
                    activeTab === 'join'
                      ? 'bg-[#A58D66] text-[#080f14] shadow-md'
                      : isLight
                      ? 'text-slate-600 hover:text-slate-900'
                      : 'text-[#E5E1DD]/60 hover:text-[#DFCCA8]'
                  }`}
                >
                  <LogIn className="w-4 h-4" />
                  <span className="hidden sm:inline">Join Server</span>
                  <span className="sm:hidden">Join</span>
                </button>
                <button
                  onClick={() => setActiveTab('recent')}
                  className={`flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-bold transition-all min-h-[44px] cursor-pointer ${
                    activeTab === 'recent'
                      ? 'bg-[#A58D66] text-[#080f14] shadow-md'
                      : isLight
                      ? 'text-slate-600 hover:text-slate-900'
                      : 'text-[#E5E1DD]/60 hover:text-[#DFCCA8]'
                  }`}
                >
                  <History className="w-4 h-4" />
                  <span className="hidden sm:inline">Recent Servers</span>
                  <span className="sm:hidden">Recent</span>
                </button>
              </div>

              {/* Tab 1: Create Server */}
              {activeTab === 'create' && (
                <div className="space-y-4">
                  <div>
                    <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${
                      isLight ? 'text-slate-700' : 'text-[#DFCCA8]'
                    }`}>
                      Live Server Name
                    </label>
                    <input
                      type="text"
                      value={createServerName}
                      onChange={(e) => setCreateServerName(e.target.value)}
                      placeholder="e.g. Team KITT Logic Lab, 4-Bit ALU Lab"
                      className={`w-full rounded-xl px-3.5 py-2.5 text-sm font-semibold border focus:outline-none focus:border-[#A58D66] focus:ring-1 focus:ring-[#A58D66] min-h-[44px] ${
                        isLight
                          ? 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                          : 'bg-[#080f14] border-[#A58D66]/30 text-[#E5E1DD] placeholder-[#E5E1DD]/40'
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${
                      isLight ? 'text-slate-700' : 'text-[#DFCCA8]'
                    }`}>
                      Your Host Nickname
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={createHostName}
                        onChange={(e) => setCreateHostName(e.target.value)}
                        placeholder="e.g. Volt Fox"
                        className={`flex-1 rounded-xl px-3.5 py-2.5 text-sm border focus:outline-none focus:border-[#A58D66] focus:ring-1 focus:ring-[#A58D66] min-h-[44px] ${
                          isLight
                            ? 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                            : 'bg-[#080f14] border-[#A58D66]/30 text-[#E5E1DD] placeholder-[#E5E1DD]/40'
                        }`}
                      />
                      <button
                        onClick={() => setCreateHostName(generateTemporaryName())}
                        className={`p-2.5 rounded-xl border transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer ${
                          isLight
                            ? 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300 shadow-2xs'
                            : 'bg-[#0d171f] hover:bg-[#080f14] text-[#DFCCA8] border-[#A58D66]/20'
                        }`}
                        title="Generate Random Nickname"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className={`p-3.5 rounded-xl space-y-2 text-xs border ${
                    isLight
                      ? 'bg-slate-50 border-slate-200 text-slate-600'
                      : 'bg-[#080f14]/80 border-[#A58D66]/20 text-[#E5E1DD]/70'
                  }`}>
                    <p className={`flex items-center gap-1.5 font-semibold ${
                      isLight ? 'text-slate-900' : 'text-[#E5E1DD]'
                    }`}>
                      <Zap className="w-4 h-4 text-[#A58D66]" />
                      Instant Zero-Lag Collaborative Server
                    </p>
                    <p>
                      Generates a unique 6-character room code. You and your peers can place gates, route wires, toggle switches, and rename components concurrently.
                    </p>
                  </div>

                  <button
                    onClick={handleCreateRoom}
                    disabled={loading}
                    className="w-full py-3 bg-[#A58D66] hover:bg-[#DFCCA8] disabled:opacity-50 text-[#080f14] font-bold text-sm rounded-xl transition-all shadow-md shadow-[#A58D66]/20 flex items-center justify-center gap-2 min-h-[48px] cursor-pointer"
                  >
                    {loading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <PlusCircle className="w-4 h-4" />
                    )}
                    Create & Host Live Server
                  </button>
                </div>
              )}

              {/* Tab 2: Join Server */}
              {activeTab === 'join' && (
                <div className="space-y-4">
                  <div>
                    <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${
                      isLight ? 'text-slate-700' : 'text-[#DFCCA8]'
                    }`}>
                      6-Character Server Code
                    </label>
                    <input
                      type="text"
                      maxLength={8}
                      value={inputCode}
                      onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                      placeholder="e.g. X7K2P9"
                      className={`w-full rounded-xl px-3.5 py-2.5 text-lg font-mono font-bold tracking-widest text-[#DFCCA8] uppercase min-h-[44px] border focus:outline-none focus:border-[#A58D66] focus:ring-1 focus:ring-[#A58D66] ${
                        isLight
                          ? 'bg-white border-slate-300 placeholder-slate-400'
                          : 'bg-[#080f14] border-[#A58D66]/30 placeholder-[#E5E1DD]/40'
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${
                      isLight ? 'text-slate-700' : 'text-[#DFCCA8]'
                    }`}>
                      Your Nickname
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={joinName}
                        onChange={(e) => setJoinName(e.target.value)}
                        placeholder="e.g. Logic Lynx"
                        className={`flex-1 rounded-xl px-3.5 py-2.5 text-sm min-h-[44px] border focus:outline-none focus:border-[#A58D66] focus:ring-1 focus:ring-[#A58D66] ${
                          isLight
                            ? 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                            : 'bg-[#080f14] border-[#A58D66]/30 text-[#E5E1DD] placeholder-[#E5E1DD]/40'
                        }`}
                      />
                      <button
                        onClick={() => setJoinName(generateTemporaryName())}
                        className={`p-2.5 rounded-xl border transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer ${
                          isLight
                            ? 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300 shadow-2xs'
                            : 'bg-[#0d171f] hover:bg-[#080f14] text-[#DFCCA8] border-[#A58D66]/20'
                        }`}
                        title="Generate Random Nickname"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() => handleJoinRoom()}
                    disabled={loading || !inputCode.trim()}
                    className="w-full py-3 bg-[#A58D66] hover:bg-[#DFCCA8] disabled:opacity-50 text-[#080f14] font-bold text-sm rounded-xl transition-all shadow-md shadow-[#A58D66]/20 flex items-center justify-center gap-2 min-h-[48px] cursor-pointer"
                  >
                    {loading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <LogIn className="w-4 h-4" />
                    )}
                    Join Live Server
                  </button>
                </div>
              )}

              {/* Tab 3: Recent & Saved Servers */}
              {activeTab === 'recent' && (
                <div className="space-y-4">
                  <div className={`text-xs ${isLight ? 'text-slate-600' : 'text-[#E5E1DD]/60'}`}>
                    Quickly reconnect to your previous live collaboration servers without re-entering the code:
                  </div>

                  {recentServers.length === 0 ? (
                    <div className={`p-6 text-center rounded-xl space-y-2 border ${
                      isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#080f14] border-[#A58D66]/20'
                    }`}>
                      <Server className={`w-8 h-8 mx-auto mb-1 ${isLight ? 'text-[#E5E1DD]/60' : 'text-[#A58D66]/40'}`} />
                      <p className={`text-sm font-semibold ${isLight ? 'text-slate-800' : 'text-[#DFCCA8]'}`}>No Recent Servers</p>
                      <p className={`text-xs ${isLight ? 'text-[#E5E1DD]/45' : 'text-[#E5E1DD]/45'}`}>
                        Create or join a server to save it here for instant 1-click reconnect.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                      {recentServers.map((srv) => (
                        <div
                          key={srv.roomCode}
                          className={`flex items-center justify-between p-3.5 rounded-xl transition-all group border ${
                            isLight
                              ? 'bg-white hover:bg-slate-50 border-slate-200 hover:border-[#A58D66]/40 shadow-2xs'
                              : 'bg-[#080f14] hover:bg-[#0d171f] border-[#A58D66]/20 hover:border-[#A58D66]/50'
                          }`}
                        >
                          <div className="min-w-0 flex-1 pr-3">
                            <div className="flex items-center gap-2">
                              <span className={`font-bold text-sm truncate ${
                                isLight ? 'text-slate-900' : 'text-[#E5E1DD]'
                              }`}>
                                {srv.serverName || 'Circuit Server'}
                              </span>
                              {srv.isHost && (
                                <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#A58D66]/20 text-[#DFCCA8] font-bold border border-[#A58D66]/30">
                                  HOST
                                </span>
                              )}
                            </div>
                            <div className={`flex items-center gap-3 text-xs mt-1 ${isLight ? 'text-[#E5E1DD]/45' : 'text-[#E5E1DD]/60'}`}>
                              <span className="font-mono font-bold text-[#DFCCA8]">
                                Code: {srv.roomCode}
                              </span>
                              <span className={`flex items-center gap-1 text-[11px] ${isLight ? 'text-[#E5E1DD]/60' : 'text-[#E5E1DD]/45'}`}>
                                <Clock className="w-3 h-3" />
                                {new Date(srv.lastJoinedAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleJoinRoom(srv.roomCode)}
                              disabled={loading}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#A58D66] hover:bg-[#DFCCA8] text-[#080f14] text-xs font-bold rounded-lg transition-all min-h-[36px] cursor-pointer"
                              title={`Reconnect to ${srv.serverName || srv.roomCode}`}
                            >
                              <span>Reconnect</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => deleteRecentServer(srv.roomCode)}
                              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                isLight ? 'text-[#E5E1DD]/60 hover:text-[#DFCCA8]' : 'text-[#E5E1DD]/45 hover:text-[#DFCCA8]'
                              }`}
                              title="Remove from recent servers"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

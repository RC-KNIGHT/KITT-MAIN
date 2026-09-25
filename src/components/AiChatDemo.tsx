import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Send, 
  Sparkles, 
  RotateCcw, 
  ExternalLink, 
  ShieldCheck, 
  Layers, 
  Info, 
  Copy, 
  Check, 
  Cpu, 
  ArrowRight, 
  AlertCircle,
  Terminal,
  Activity,
  ArrowUpRight
} from 'lucide-react';
import { KittLogo } from './KittLogo';
import { circuitAudio } from '../utils/audio';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  model?: string;
  isInitial?: boolean;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'welcome-msg',
    role: 'assistant',
    content: `Welcome to the KITT Intelligence Core. I am **KITT Org AI 2.0** — your universal hardware engineering polymath, circuit architect, and ecosystem oracle.

I reason natively across **tens of thousands of electronic components, microcontrollers (ESP32, STM32, RP2040, Arduino), sensors, power topologies, and firmware code**, as well as the full **KITT Ecosystem architecture** ("Where Ideas Become Inventions").

Whether you want to:
- **Architect a complete circuit** (e.g. smart IoT agriculture, solar MPPT battery management, motor drivers, drone telemetry)
- **Get exact pin-to-pin wiring, decoupling capacitor sizing, and logic level shifting**
- **Explore the 4 KITT Portals, roadmap, and tokenomics**
- **Or converse on physics, math, computer science, and daily engineering ideas**

I am at your command. What are we engineering or discussing today?`,
    timestamp: 'Just now',
    isInitial: true
  }
];

const SUGGESTED_QUESTIONS = [
  "Design an ESP32 Smart Agriculture node with capacitive soil, BME280 & 5V pump",
  "How do I calculate I2C pull-up resistors and decoupling capacitors?",
  "Level-shift 5V logic to 3.3V ESP32 for ultrasonic and I2C sensors",
  "What are the 4 official KITT Ecosystem Portals and how do they synchronize?",
  "Explain the 'One Project, One Source of Truth, Many Views' philosophy",
  "Architect an MPPT solar lithium battery charger circuit with telemetry"
];

export const AiChatDemo: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const chatScrollContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    // Scroll ONLY the inner chat messages container, NEVER the window/page
    if (chatScrollContainerRef.current) {
      chatScrollContainerRef.current.scrollTo({
        top: chatScrollContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputPrompt).trim();
    if (!query || isLoading) return;

    setErrorMessage(null);
    setInputPrompt('');

    const userMsgId = 'user-' + Date.now();
    const newUserMessage: ChatMessage = {
      id: userMsgId,
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedMessages = [...messages, newUserMessage];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      // Build conversation payload for the server API
      const payloadMessages = updatedMessages.map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        content: m.content
      }));

      const res = await fetch('/api/kitt-org-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: payloadMessages })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Server responded with status ${res.status}`);
      }

      const data = await res.json();
      const assistantMsg: ChatMessage = {
        id: 'assistant-' + Date.now(),
        role: 'assistant',
        content: data.reply || "I am KITT Org AI 2.0. No response was generated.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        model: data.model
      };

      circuitAudio.playTone(660, 0.08, 'triangle');
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error("Chat error with KITT Org AI 2.0:", err);
      setErrorMessage(err?.message || "Failed to reach KITT Org AI 2.0 server endpoint.");
      
      // Add a friendly error message to conversation
      const errorMsg: ChatMessage = {
        id: 'err-' + Date.now(),
        role: 'assistant',
        content: `**KITT Org AI 2.0 Status Alert**: I had difficulty processing that request (${err?.message || 'Network error'}). If you are exploring the project, please feel free to ask another question or retry!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetChat = () => {
    setMessages(INITIAL_MESSAGES);
    setErrorMessage(null);
    setInputPrompt('');
    inputRef.current?.focus();
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Simple, clean Markdown renderer for bullet points, bold text, blockquotes, and links
  const renderFormattedContent = (content: string) => {
    const lines = content.split('\n');
    return lines.map((line, lineIndex) => {
      // Blockquote
      if (line.startsWith('> ')) {
        const quoteText = line.substring(2);
        return (
          <div key={lineIndex} className="border-l-2 border-[#A58D66]/60 pl-3 py-1 my-1 text-xs text-[#E5E1DD] bg-[#A58D66]/10 rounded-r">
            {renderInlineSpans(quoteText)}
          </div>
        );
      }

      // Unordered list item
      if (line.startsWith('- ') || line.startsWith('* ')) {
        const itemText = line.substring(2);
        return (
          <div key={lineIndex} className="flex items-start gap-2 my-1 pl-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#407E8C] mt-1.5 shrink-0" />
            <span className="text-xs leading-relaxed text-[#E5E1DD]/90">
              {renderInlineSpans(itemText)}
            </span>
          </div>
        );
      }

      // Empty line
      if (!line.trim()) {
        return <div key={lineIndex} className="h-2" />;
      }

      // Regular paragraph line
      return (
        <p key={lineIndex} className="text-xs sm:text-[13px] leading-relaxed text-[#E5E1DD]/90">
          {renderInlineSpans(line)}
        </p>
      );
    });
  };

  // Helper for inline bolding & links
  const renderInlineSpans = (text: string) => {
    // Check for markdown bold **text**
    const parts = text.split(/(\*\*.*?\*\*|`.*?`|\[.*?\]\(.*?\))/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index} className="text-[#E5E1DD] font-semibold">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code key={index} className="px-1.5 py-0.5 rounded bg-black/60 border border-[#A58D66]/30 font-mono text-[11px] text-[#A58D66]">
            {part.slice(1, -1)}
          </code>
        );
      }
      if (part.startsWith('[') && part.includes('](') && part.endsWith(')')) {
        const linkMatch = part.match(/\[(.*?)\]\((.*?)\)/);
        if (linkMatch) {
          const [, label, rawUrl] = linkMatch;
          const trimmedUrl = (rawUrl || '').trim();
          const isSafeUrl = /^(https?:\/\/|mailto:|#)/i.test(trimmedUrl);
          const safeHref = isSafeUrl ? trimmedUrl : '#';
          return (
            <a
              key={index}
              href={safeHref}
              {...(isSafeUrl && !trimmedUrl.startsWith('#') ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              className="text-[#407E8C] hover:text-[#E5E1DD] underline underline-offset-2 font-medium inline-flex items-center gap-1"
            >
              <span>{label}</span>
              {isSafeUrl && !trimmedUrl.startsWith('#') && <ExternalLink className="w-2.5 h-2.5 inline" />}
            </a>
          );
        }
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <section id="ai-agent" className="py-20 px-4 sm:px-6 lg:px-8 bg-transparent relative z-20">
      <div className="max-w-6xl mx-auto">
        {/* Section Header & KITT Org AI 2.0 Identity Callout */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-10">
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#407E8C]/15 border border-[#A58D66]/40 text-[#A58D66] text-xs font-mono uppercase tracking-widest animate-ambition">
            <KittLogo size={16} showGlow={false} className="shrink-0" />
            <span>THE ORACLE OF SYNTHESIS</span>
          </div>

          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-bold font-cinzel text-[#E5E1DD] tracking-tight leading-tight animate-title-breathe">
            While Rivals Draft Schematics, <br />
            <span className="animate-text-shimmer italic font-cormorant font-normal block mt-1 animate-text-glow">
              You Speak Systems Into Being.
            </span>
          </h2>

          <p className="text-base sm:text-lg text-[#E5E1DD]/85 max-w-2xl mx-auto font-serif italic leading-relaxed">
            "An architectural AI that reasons natively in silicon physics, pin constraints, and deterministic logic. Question the oracle; extract perfection."
          </p>
        </div>

        {/* Universal Intelligence & Ecosystem Oracle Banner */}
        <div className="mb-8 p-5 rounded-2xl surreal-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-[#A58D66]/25">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-[#A58D66]/15 border border-[#A58D66]/35 text-[#A58D66] shrink-0 mt-0.5">
              <Cpu className="w-4 h-4 text-[#A58D66]" />
            </div>
            <div>
              <div className="text-xs font-bold text-[#E5E1DD] font-cinzel flex items-center gap-2">
                <span>Universal Hardware Polymath & Ecosystem Intelligence</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-[#407E8C]/20 text-[#76B4C2] border border-[#407E8C]/35 font-mono">
                  Full Synthesis 2.0
                </span>
              </div>
              <p className="text-[11px] text-[#E5E1DD]/65 mt-1 leading-relaxed font-light">
                <strong>KITT Org AI 2.0</strong> is trained on thousands of components, sensors, circuit topologies, and day-to-day discourse. 
                For real-time 3D breadboard interaction or instant manufacturing PCB export, connect to the <strong>Main KITT AI</strong>.
              </p>
            </div>
          </div>

          <a
            href="#/kitt-ai"
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#A58D66] to-[#8C7654] hover:from-[#BFA378] hover:to-[#A58D66] text-[#080f14] font-bold text-xs flex items-center gap-1.5 transition-all shrink-0 shadow-[0_0_20px_rgba(165,141,102,0.3)]"
          >
            <span>Launch KITT AI Studio</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Main Chat Interface Container Wrapped in Ambient Halo */}
        <motion.div 
          initial={{ opacity: 0, y: 32, rotateX: 4 }}
          whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
          className="relative group/chat"
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* Subtle Ambient Radial Backlight */}
          <div className="absolute -inset-1 bg-gradient-to-r from-[#A58D66]/25 via-[#407E8C]/20 to-[#A58D66]/25 rounded-3xl blur-2xl opacity-60 group-hover/chat:opacity-85 transition-opacity duration-700 pointer-events-none" />

          <div className="relative rounded-3xl bg-gradient-to-b from-[#0a1218]/95 via-[#080f14]/95 to-[#060b0e]/95 backdrop-blur-2xl overflow-hidden flex flex-col h-[680px] border border-[#A58D66]/35 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95),0_0_40px_rgba(165,141,102,0.12)]">
            {/* Top Bar HUD */}
            <div className="px-5 py-4 bg-[#080f14]/90 border-b border-[#A58D66]/25 flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="relative p-1 rounded-xl bg-gradient-to-br from-[#121e26] to-[#080f14] border border-[#A58D66]/50 shadow-[0_0_16px_rgba(165,141,102,0.35)] flex items-center justify-center">
                  <KittLogo size={32} showGlow={true} />
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-bold font-cinzel text-[#E5E1DD] flex items-center gap-2">
                    <span>KITT Org AI 2.0</span>
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#407E8C]/25 text-[#76B4C2] border border-[#407E8C]/40 font-mono font-semibold">
                      ORACLE MATRIX
                    </span>
                  </div>
                  <div className="text-[10px] text-[#A58D66] flex items-center gap-1.5 font-mono mt-0.5">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#A58D66] animate-pulse shadow-[0_0_6px_#A58D66]" />
                    <span>NEURAL LINK ACTIVE</span>
                    <span className="text-[#E5E1DD]/30">•</span>
                    <span>GEMINI 2.5 FLASH ORACLE</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-2.5">
                <button
                  onClick={handleResetChat}
                  title="Reset Conversation"
                  className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-[#E5E1DD]/70 hover:text-[#E5E1DD] border border-[#A58D66]/25 text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer shadow-sm hover:border-[#A58D66]/50"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Reset</span>
                </button>

                <a
                  href="#/kitt-ai"
                  title="Launch Main KITT AI Flagship Agent"
                  className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#A58D66] to-[#8C7654] hover:from-[#BFA378] hover:to-[#A58D66] text-[#080f14] font-bold text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer hover:scale-105"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#080f14]" />
                  <span>KITT AI Studio</span>
                  <ExternalLink className="w-3 h-3 text-[#080f14]" />
                </a>
              </div>
            </div>

            {/* Quick Inquiry Suggestions */}
            <div className="px-5 py-2.5 bg-[#080f14]/65 border-b border-[#A58D66]/15 flex items-center gap-2 overflow-x-auto scrollbar-none">
              <span className="text-[11px] font-semibold text-[#A58D66] shrink-0 flex items-center gap-1 font-mono">
                <Sparkles className="w-3 h-3 text-[#A58D66]" />
                <span>Inquiries:</span>
              </span>
              {SUGGESTED_QUESTIONS.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(q)}
                  disabled={isLoading}
                  className="text-[11px] px-3.5 py-1.5 rounded-full bg-[#0d1820] hover:bg-[#152430] border border-[#407E8C]/30 hover:border-[#A58D66]/60 text-[#E5E1DD]/85 hover:text-[#E5E1DD] transition-all whitespace-nowrap shrink-0 disabled:opacity-40 cursor-pointer shadow-sm"
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Scrollable Chat Message Thread */}
            <div ref={chatScrollContainerRef} className="flex-1 p-5 sm:p-6 overflow-y-auto space-y-5 bg-[#080f14]/40">
              {messages.map((msg) => {
                const isUser = msg.role === 'user';
                return (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-3.5 ${isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    {/* Assistant Avatar: Custom KITT Logo */}
                    {!isUser && (
                      <div className="w-8 h-8 rounded-xl bg-[#0c141a] border border-[#A58D66]/40 flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(165,141,102,0.25)] mt-0.5">
                        <KittLogo size={22} showGlow={false} />
                      </div>
                    )}

                    {/* Message Bubble */}
                    <div
                      className={`max-w-2xl rounded-2xl p-4 sm:p-5 text-xs sm:text-sm leading-relaxed relative group ${
                        isUser
                          ? 'bg-gradient-to-r from-[#A58D66] via-[#BFA378] to-[#A58D66] text-[#080f14] rounded-tr-sm shadow-[0_6px_25px_rgba(165,141,102,0.3)] font-semibold'
                          : 'bg-gradient-to-b from-[#0e1720]/95 to-[#091016]/95 border-l-2 border-[#A58D66] border-t border-r border-b border-[#A58D66]/20 text-[#E5E1DD] rounded-tl-sm shadow-[0_10px_35px_rgba(0,0,0,0.6)] backdrop-blur-md'
                      }`}
                    >
                      {/* Header Label inside Bubble */}
                      <div className="flex items-center justify-between gap-4 mb-2 pb-1.5 border-b border-black/10 dark:border-white/10 text-[10px]">
                        <div className="flex items-center gap-1.5 font-semibold">
                          <span className={isUser ? 'text-[#080f14] font-bold' : 'text-[#A58D66] font-cinzel tracking-wider'}>
                            {isUser ? 'You' : 'KITT Org AI 2.0'}
                          </span>
                          {!isUser && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#407E8C]/25 text-[#76B4C2] border border-[#407E8C]/35 font-mono">
                              {msg.model ? (msg.model.includes('gemini') ? `⚡ ${msg.model}` : `🛡️ ${msg.model}`) : 'Oracle Intel'}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={isUser ? 'text-[#080f14]/75 font-mono' : 'text-[#E5E1DD]/50 font-mono'}>{msg.timestamp}</span>
                          {!isUser && (
                            <button
                              onClick={() => handleCopyText(msg.id, msg.content)}
                              title="Copy reply text"
                              className="p-1 rounded hover:bg-white/10 text-[#E5E1DD]/60 hover:text-[#E5E1DD] transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                            >
                              {copiedId === msg.id ? (
                                <Check className="w-3 h-3 text-[#A58D66]" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="space-y-2 font-light">
                        {renderFormattedContent(msg.content)}
                      </div>
                    </div>

                    {/* User Avatar */}
                    {isUser && (
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#A58D66] to-[#8C7654] text-[#080f14] border border-[#E5E1DD]/40 flex items-center justify-center shrink-0 font-bold text-xs mt-0.5 shadow-md">
                        U
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Loading / Typing Indicator with KITT Logo */}
              {isLoading && (
                <div className="flex items-start gap-3.5 justify-start">
                  <div className="w-8 h-8 rounded-xl bg-[#0c141a] border border-[#407E8C]/40 flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                    <KittLogo size={22} showGlow={true} className="animate-pulse" />
                  </div>
                  <div className="bg-[#0e1720] border border-[#407E8C]/40 rounded-2xl rounded-tl-sm px-4 py-3.5 text-xs text-[#76B4C2] font-mono flex items-center gap-3 shadow-md">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#A58D66] animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 rounded-full bg-[#76B4C2] animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 rounded-full bg-[#E5E1DD] animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span>KITT Org AI 2.0 is contemplating project canon...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Error Banner if any */}
            {errorMessage && (
              <div className="px-4 py-2 bg-red-950/80 border-t border-red-500/30 text-red-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                <span className="truncate">{errorMessage}</span>
              </div>
            )}

            {/* Bottom Hardware Workstation Input Console */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="p-3.5 sm:p-4 bg-[#070d12]/95 border-t border-[#A58D66]/25 flex items-center gap-3"
            >
              <div className="flex-1 relative flex items-center">
                <span className="absolute left-3.5 text-xs font-mono text-[#A58D66] font-bold select-none">&gt;</span>
                <input
                  ref={inputRef}
                  type="text"
                  value={inputPrompt}
                  onChange={(e) => setInputPrompt(e.target.value)}
                  placeholder="Ask KITT Org AI 2.0 about architecture, portals, or documentation..."
                  disabled={isLoading}
                  className="w-full bg-[#0a131a] border border-[#A58D66]/30 focus:border-[#A58D66] focus:ring-1 focus:ring-[#A58D66]/40 rounded-xl pl-8 pr-4 py-3 text-xs sm:text-sm text-[#E5E1DD] placeholder:text-[#E5E1DD]/40 focus:outline-none transition-all font-light"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || !inputPrompt.trim()}
                className="px-5 py-3 rounded-xl bg-gradient-to-r from-[#A58D66] via-[#BFA378] to-[#A58D66] hover:from-[#BFA378] hover:to-[#A58D66] disabled:opacity-40 text-[#080f14] font-bold text-xs transition-all flex items-center gap-2 shrink-0 cursor-pointer shadow-[0_0_20px_rgba(165,141,102,0.35)] hover:scale-105 active:scale-95"
              >
                <span>Consult Oracle</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </motion.div>

        {/* Footer Navigation Bar within Section */}
        <div className="mt-4 flex flex-wrap items-center justify-between text-xs text-[#E5E1DD]/60 px-2 font-light">
          <div className="flex items-center gap-2">
            <Info className="w-3.5 h-3.5 text-[#A58D66]" />
            <span>KITT Org AI 2.0 replies strictly according to the official KITT Project canon.</span>
          </div>

          <div className="flex items-center gap-4 mt-2 sm:mt-0">
            <a
              href="#/kitt-ai"
              className="hover:text-[#A58D66] transition-colors flex items-center gap-1"
            >
              <span>KITT AI Studio</span>
              <ExternalLink className="w-3 h-3 text-[#A58D66]" />
            </a>
            <span>•</span>
            <a
              href="#/workspace"
              className="hover:text-[#A58D66] transition-colors flex items-center gap-1"
            >
              <span>3D Workspace</span>
              <ArrowUpRight className="w-3 h-3 text-[#A58D66]" />
            </a>
            <span>•</span>
            <a
              href="https://digilogic-790.web.app"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#A58D66] transition-colors flex items-center gap-1"
            >
              <span>DigiLogic Simulator</span>
              <ExternalLink className="w-3 h-3 text-[#A58D66]" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

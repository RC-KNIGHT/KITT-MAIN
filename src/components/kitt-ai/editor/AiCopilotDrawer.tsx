import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  Send, 
  Trash2, 
  Settings, 
  ChevronDown, 
  ChevronUp, 
  Check, 
  Info,
  Layers, 
  Zap,
  ArrowRight,
  Sliders
} from 'lucide-react';
import { ChatMessageItem, FormattedMessageText } from '../KittChatPanel';
import { CanonicalCircuitModel, CIRPatchTransaction } from '../cir/cirTypes';
import { KittLogo } from '../../KittLogo';

interface AiCopilotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  messages: ChatMessageItem[];
  onSendMessage: (text: string) => void;
  onApplyPatch: (patch: CIRPatchTransaction) => void;
  isGenerating: boolean;
  activeCircuit: CanonicalCircuitModel;
  onResetConversation: () => void;
}

export const AiCopilotDrawer: React.FC<AiCopilotDrawerProps> = ({
  isOpen,
  onClose,
  messages,
  onSendMessage,
  onApplyPatch,
  isGenerating,
  activeCircuit,
  onResetConversation
}) => {
  const [inputText, setInputText] = useState('');
  const [expandedTraceIds, setExpandedTraceIds] = useState<Record<string, boolean>>({});
  const [showSettings, setShowSettings] = useState(false);
  const [synthesisMode, setSynthesisMode] = useState<'accurate' | 'creative' | 'fast'>('accurate');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Quick actions matching Antika screenshot media_1789194377551.png
  const quickActions = [
    { label: 'Explain circuit', prompt: 'Explain the working physics and electrical signal paths of this circuit in detail.' },
    { label: 'Find issues', prompt: 'Analyze this circuit for any design issues, current overages, back-EMF hazards, or floating pins.' },
    { label: 'Simplify', prompt: 'Can we simplify this circuit by consolidating passive components or reducing silicon BOM cost?' },
    { label: 'Add RC filter', prompt: 'Add an RC low-pass filter with a 100Ω resistor and 100nF capacitor to filter supply noise.' }
  ];

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isGenerating) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  const toggleTrace = (id: string) => {
    setExpandedTraceIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="fixed inset-y-0 right-0 z-40 w-full sm:w-[420px] lg:w-[460px] bg-[#0c161d] border-l border-[#A58D66]/35 shadow-2xl flex flex-col font-sans animate-in slide-in-from-right duration-200">
      {/* 1. Header: ✦ New conversation • X messages, Settings, Trash, Close */}
      <div className="h-14 px-4 border-b border-[#A58D66]/20 bg-[#080f14]/90 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#A58D66]" />
          <span className="text-xs font-mono font-bold text-[#E5E1DD]">
            New conversation • {messages.length} message{messages.length === 1 ? '' : 's'}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {/* Settings button */}
          <button
            onClick={() => setShowSettings(s => !s)}
            className={`p-1.5 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer ${
              showSettings ? 'bg-[#A58D66]/20 text-[#A58D66]' : 'hover:bg-white/10'
            }`}
            title="Copilot Settings"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>

          {/* Reset / Clear Conversation */}
          <button
            onClick={() => {
              if (confirm('Clear current conversation history?')) {
                onResetConversation();
              }
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
            title="Clear conversation"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          {/* Close */}
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer ml-1"
            title="Close Drawer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Settings Popover */}
      {showSettings && (
        <div className="p-3 bg-[#080f14] border-b border-[#A58D66]/20 text-xs font-mono">
          <div className="text-[11px] font-bold text-[#DFCCA8] mb-2 flex items-center gap-1.5">
            <Sliders className="w-3 h-3" />
            <span>Synthesis Engine Model</span>
          </div>
          <div className="grid grid-cols-3 gap-1 bg-[#0c161d] p-1 rounded-lg border border-white/10">
            {(['accurate', 'creative', 'fast'] as const).map(mode => (
              <button
                key={mode}
                onClick={() => setSynthesisMode(mode)}
                className={`py-1 text-center rounded capitalize font-mono text-[10px] transition-colors cursor-pointer ${
                  synthesisMode === mode ? 'bg-[#A58D66] text-[#080f14] font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 2. Quick Action Chips (Antika screenshot media_1789194377551.png) */}
      <div className="p-3 border-b border-white/5 bg-[#080f14]/50 shrink-0">
        <div className="flex flex-wrap gap-1.5">
          {quickActions.map(act => (
            <button
              key={act.label}
              onClick={() => onSendMessage(act.prompt)}
              disabled={isGenerating}
              className="px-2.5 py-1 rounded-full bg-[#0c161d] hover:bg-[#15232c] border border-[#A58D66]/25 hover:border-[#A58D66]/60 text-slate-300 hover:text-[#DFCCA8] text-xs font-mono transition-all cursor-pointer disabled:opacity-50"
            >
              {act.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Messages Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(msg => {
          const isUser = msg.sender === 'user';
          const isTraceOpen = expandedTraceIds[msg.id] ?? false;

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[90%] rounded-2xl p-3.5 text-xs font-mono leading-relaxed shadow-md ${
                  isUser
                    ? 'bg-gradient-to-r from-[#A58D66] to-[#8C7654] text-[#080f14] font-semibold'
                    : 'bg-[#080f14] border border-[#A58D66]/20 text-[#E5E1DD]'
                }`}
              >
                {/* Thinking Trace if available */}
                {msg.thinkingTrace && !isUser && (
                  <div className="mb-2.5 pb-2 border-b border-white/10">
                    <button
                      onClick={() => toggleTrace(msg.id)}
                      className="flex items-center justify-between w-full text-[11px] text-[#A58D66] hover:text-[#DFCCA8] font-bold cursor-pointer"
                    >
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="w-3 h-3" />
                        <span>KITT Engineering Reasoning</span>
                      </span>
                      {isTraceOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>

                    {isTraceOpen && (
                      <div className="mt-2 space-y-1 text-[10px] text-slate-400 pl-2 border-l border-[#A58D66]/30">
                        <p className="italic text-[#DFCCA8]">{msg.thinkingTrace.summary}</p>
                        {msg.thinkingTrace.steps.map((step, idx) => (
                          <div key={idx} className="flex items-start gap-1.5">
                            <span className="text-[#A58D66] font-bold">•</span>
                            <span>{step}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="font-sans text-xs">
                  <FormattedMessageText text={msg.text} isKitt={!isUser} />
                </div>

                {/* Proposed Patch Action */}
                {msg.proposedPatch && !isUser && (
                  <div className="mt-3 pt-2.5 border-t border-white/10 space-y-2">
                    <div className="text-[10px] font-mono text-[#10b981] font-bold">
                      PROPOSED CIR MUTATION: {msg.proposedPatch.description}
                    </div>
                    <button
                      onClick={() => msg.proposedPatch && onApplyPatch(msg.proposedPatch)}
                      className="w-full py-1.5 px-3 rounded bg-emerald-500 hover:bg-emerald-400 text-[#080f14] font-mono font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-md"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Apply Patch to Canvas</span>
                    </button>
                  </div>
                )}
              </div>

              <span className="text-[10px] text-slate-500 font-mono mt-1 px-1">
                {msg.timestamp}
              </span>
            </div>
          );
        })}

        {isGenerating && (
          <div className="flex items-center gap-2 text-xs font-mono text-[#A58D66] p-3 rounded-xl bg-[#080f14] border border-[#A58D66]/20">
            <div className="w-3.5 h-3.5 border-2 border-[#A58D66] border-t-transparent rounded-full animate-spin" />
            <span>KITT synthesizing circuit netlist...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 4. Bottom Prompt Box & Credits Indicator (Antika screenshot media_1789194377551.png) */}
      <form onSubmit={handleSend} className="p-3 border-t border-[#A58D66]/20 bg-[#080f14] shrink-0">
        {/* Credits Indicator */}
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-2 px-1">
          <div className="flex items-center gap-1 text-[#DFCCA8]">
            <Sparkles className="w-3 h-3 text-[#A58D66]" />
            <span>Up to 9 AI credits • 8 available</span>
          </div>
          <span className="text-[10px] text-slate-500">Student Tier</span>
        </div>

        {/* Text Input */}
        <div className="relative">
          <textarea
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend(e);
              }
            }}
            placeholder="Ask KITT AI anything about your circuit..."
            rows={2}
            className="w-full pl-3 pr-10 py-2.5 rounded-xl bg-[#0c161d] border border-[#A58D66]/30 text-xs font-mono text-[#E5E1DD] placeholder:text-slate-500 focus:outline-none focus:border-[#A58D66] focus:ring-1 focus:ring-[#A58D66]/40 resize-none"
          />

          <button
            type="submit"
            disabled={!inputText.trim() || isGenerating}
            className="absolute right-2.5 bottom-3.5 p-1.5 rounded-lg bg-gradient-to-r from-[#A58D66] to-[#8C7654] text-[#080f14] disabled:opacity-30 transition-opacity cursor-pointer shadow-md"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>
    </div>
  );
};

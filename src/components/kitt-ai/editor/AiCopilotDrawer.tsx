import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Send,
  Trash2,
  Settings,
  ChevronDown,
  ChevronUp,
  Check,
  Sliders
} from 'lucide-react';
import { ChatMessageItem, FormattedMessageText } from '../KittChatPanel';
import { CanonicalCircuitModel, CIRPatchTransaction } from '../cir/cirTypes';

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
    <div className="fixed inset-y-0 right-0 z-40 w-full sm:w-[420px] lg:w-[460px] bg-black border-l border-[#353536] flex flex-col">
      {/* Header */}
      <div className="h-14 px-4 border-b border-[#353536] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-2 h-2 rounded-full bg-[#F5F5F5] shrink-0" />
          <span className="kds-body-sm text-[#F5F5F5] truncate">
            New conversation · {messages.length} message{messages.length === 1 ? '' : 's'}
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => setShowSettings(s => !s)}
            className="p-2 rounded-full text-[#9E9E9E] hover:text-[#F5F5F5] hover:bg-white/[0.06] transition-colors cursor-pointer kds-focusable"
            title="Copilot settings"
          >
            <Settings className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              if (confirm('Clear current conversation history?')) {
                onResetConversation();
              }
            }}
            className="p-2 rounded-full text-[#9E9E9E] hover:text-[#F5F5F5] hover:bg-white/[0.06] transition-colors cursor-pointer kds-focusable"
            title="Clear conversation"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-[#9E9E9E] hover:text-[#F5F5F5] hover:bg-white/[0.06] transition-colors cursor-pointer kds-focusable"
            title="Close drawer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Settings */}
      {showSettings && (
        <div className="p-4 border-b border-[#353536] space-y-3">
          <p className="kds-caption flex items-center gap-2">
            <Sliders className="w-3.5 h-3.5" />
            <span>Synthesis engine model</span>
          </p>
          <div className="grid grid-cols-3 gap-2">
            {(['accurate', 'creative', 'fast'] as const).map(mode => (
              <button
                key={mode}
                onClick={() => setSynthesisMode(mode)}
                className={`min-h-[36px] rounded-full border text-[12px] capitalize transition-colors cursor-pointer kds-focusable ${
                  synthesisMode === mode
                    ? 'bg-[#F5F5F5] text-[#0D0D0D] border-[#F5F5F5]'
                    : 'border-[#353536] text-[#9E9E9E] hover:text-[#F5F5F5] hover:border-[#8F8F8F]'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div className="px-3 py-2 border-b border-[#353536] shrink-0">
        <div className="flex flex-wrap gap-2">
          {quickActions.map(act => (
            <button
              key={act.label}
              onClick={() => onSendMessage(act.prompt)}
              disabled={isGenerating}
              className="px-3 py-1.5 rounded-full border border-[#353536] hover:border-[#8F8F8F] hover:bg-white/[0.06] kds-caption hover:text-[#F5F5F5] transition-colors cursor-pointer disabled:opacity-30 kds-focusable"
            >
              {act.label}
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-5">
        {messages.map(msg => {
          const isUser = msg.sender === 'user';
          const isTraceOpen = expandedTraceIds[msg.id] ?? false;

          return (
            <div key={msg.id} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
              {!isUser && msg.thinkingTrace && (
                <div className="w-full mb-2">
                  <button
                    onClick={() => toggleTrace(msg.id)}
                    aria-expanded={isTraceOpen}
                    className="flex items-center gap-1.5 kds-caption hover:text-[#F5F5F5] transition-colors cursor-pointer kds-focusable rounded-[6px]"
                  >
                    {isTraceOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    <span>KITT engineering reasoning</span>
                    <span>· {(msg.thinkingTrace.durationMs / 1000).toFixed(1)}s</span>
                  </button>

                  {isTraceOpen && (
                    <div className="mt-2 kds-card p-3 space-y-1.5">
                      <p className="kds-caption text-[#F5F5F5]">{msg.thinkingTrace.summary}</p>
                      {msg.thinkingTrace.steps.map((step, idx) => (
                        <div key={idx} className="flex items-start gap-2 kds-caption">
                          <span className="text-[#8F8F8F]">—</span>
                          <span>{step}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div
                className={
                  isUser
                    ? 'max-w-[90%] px-4 py-3 rounded-[12px] bg-[#1D1D1E] border border-[#353536]'
                    : 'w-full'
                }
              >
                <FormattedMessageText text={msg.text} isKitt={!isUser} />

                {msg.proposedPatch && !isUser && (
                  <div className="mt-3 pt-3 border-t border-[#353536] space-y-3">
                    <p className="kds-caption text-[#F5F5F5]">
                      Proposed circuit mutation: {msg.proposedPatch.description}
                    </p>
                    <button
                      onClick={() => msg.proposedPatch && onApplyPatch(msg.proposedPatch)}
                      className="kds-btn kds-btn-primary w-full kds-focusable"
                    >
                      <Check className="w-4 h-4" />
                      <span>Apply patch to canvas</span>
                    </button>
                  </div>
                )}
              </div>

              <span className="kds-caption mt-1">{msg.timestamp}</span>
            </div>
          );
        })}

        {isGenerating && (
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#F5F5F5] animate-pulse" />
            <span className="kds-caption">KITT synthesizing circuit netlist…</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Composer */}
      <form onSubmit={handleSend} className="p-3 border-t border-[#353536] shrink-0">
        <div className="flex items-center justify-between kds-caption mb-2 px-1">
          <span className="text-[#F5F5F5]">Up to 9 AI credits · 8 available</span>
          <span>Student tier</span>
        </div>

        <div className="flex items-end gap-2">
          <textarea
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend(e);
              }
            }}
            placeholder="Ask KITT AI anything about your circuit…"
            rows={2}
            className="kds-input flex-1 resize-none !text-[15px]"
          />

          <button
            type="submit"
            disabled={!inputText.trim() || isGenerating}
            title="Send"
            className="kds-btn kds-btn-primary !px-3.5 shrink-0 kds-focusable"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};

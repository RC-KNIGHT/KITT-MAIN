import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Sparkles, 
  ChevronDown, 
  ChevronRight, 
  Copy, 
  Check, 
  RotateCcw, 
  Bot, 
  User, 
  Layers, 
  Zap, 
  CheckCircle2, 
  AlertTriangle,
  ArrowRight,
  Maximize2
} from 'lucide-react';
import { UserIntentType, CanonicalCircuitModel, CIRPatchTransaction } from './cir/cirTypes';
import { classifyUserIntent, ClassifiedIntent } from './agent/intentClassifier';
import { circuitAudio } from '../../utils/audio';

export interface ChatMessageItem {
  id: string;
  sender: 'user' | 'kitt';
  text: string;
  timestamp: string;
  intent?: UserIntentType;
  thinkingTrace?: {
    summary: string;
    steps: string[];
    durationMs: number;
  };
  suggestedWorkspaceChoice?: boolean;
  proposedPatch?: CIRPatchTransaction;
}

interface KittChatPanelProps {
  messages: ChatMessageItem[];
  onSendMessage: (text: string) => void;
  onSelectWorkspaceMode: (mode: '2d' | '3d' | 'both') => void;
  onApplyPatch?: (patch: CIRPatchTransaction) => void;
  isGenerating?: boolean;
  activeCircuit?: CanonicalCircuitModel;
}

function parseInline(text: string): React.ReactNode {
  const tokenRegex = /(\*\*.*?\*\*|`.*?`|\$.*?\$)/g;
  const parts = text.split(tokenRegex);

  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={index} className="font-semibold text-[#E5E1DD]">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={index} className="px-1.5 py-0.5 rounded bg-black/50 text-[#76B4C2] font-mono text-[10.5px] border border-white/10">
          {part.slice(1, -1)}
        </code>
      );
    }
    if (part.startsWith('$') && part.endsWith('$')) {
      return (
        <span key={index} className="font-mono text-[#A58D66] px-0.5">
          {part.slice(1, -1)}
        </span>
      );
    }
    return part;
  });
}

export const FormattedMessageText: React.FC<{ text: string; isKitt: boolean }> = ({ text, isKitt }) => {
  if (!isKitt) {
    return <span>{text}</span>;
  }

  const parts = text.split(/(\$\$[\s\S]*?\$\$|```[\s\S]*?```)/g);

  return (
    <div className="space-y-2 text-xs leading-relaxed">
      {parts.map((part, pIdx) => {
        if (part.startsWith('```') && part.endsWith('```')) {
          const firstLineEnd = part.indexOf('\n');
          const lang = part.slice(3, firstLineEnd > -1 ? firstLineEnd : 3).trim();
          const code = firstLineEnd > -1 ? part.slice(firstLineEnd + 1, -3) : part.slice(3, -3);
          return (
            <div key={pIdx} className="my-2 rounded-lg bg-[#070c10] border border-white/10 overflow-hidden text-left shadow-md">
              <div className="px-3 py-1 bg-white/5 border-b border-white/5 flex items-center justify-between text-[10px] font-mono text-slate-400">
                <span className="uppercase text-[#A58D66] font-bold tracking-wider">{lang || 'CODE'}</span>
                <button
                  onClick={() => navigator.clipboard.writeText(code)}
                  className="hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
                  title="Copy code"
                >
                  <Copy className="w-3 h-3" />
                  <span>Copy</span>
                </button>
              </div>
              <pre className="p-3 overflow-x-auto font-mono text-[11px] text-[#76B4C2] leading-snug">
                <code>{code}</code>
              </pre>
            </div>
          );
        }

        if (part.startsWith('$$') && part.endsWith('$$')) {
          const rawMath = part.slice(2, -2).trim();
          const displayMath = rawMath
            .replace(/\\begin\{aligned\}/g, '')
            .replace(/\\end\{aligned\}/g, '')
            .replace(/\\\\/g, '\n')
            .replace(/\\text\{([^}]+)\}/g, '$1')
            .replace(/\\times/g, '×')
            .replace(/\\approx/g, '≈')
            .replace(/\\,/g, ' ')
            .trim();

          return (
            <div key={pIdx} className="my-2 p-2.5 rounded-lg bg-[#09131a] border border-[#A58D66]/25 font-mono text-[11.5px] text-[#A58D66] overflow-x-auto whitespace-pre-wrap leading-relaxed shadow-sm">
              {displayMath}
            </div>
          );
        }

        const lines = part.split('\n');
        const elements: React.ReactNode[] = [];
        let tableBuffer: string[] = [];

        const flushTable = (keyPrefix: number) => {
          if (tableBuffer.length < 2) {
            tableBuffer.forEach((tblLine, idx) => {
              elements.push(
                <p key={`tbl-raw-${keyPrefix}-${idx}`} className="text-[11.5px] leading-relaxed text-slate-200">
                  {parseInline(tblLine)}
                </p>
              );
            });
            tableBuffer = [];
            return;
          }

          const rawRows = tableBuffer.map(r =>
            r.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map(c => c.trim())
          );
          tableBuffer = [];
          const headers = rawRows[0];
          const isSep = rawRows[1] && rawRows[1].every(c => /^:?-+:?$/.test(c));
          const rows = isSep ? rawRows.slice(2) : rawRows.slice(1);

          elements.push(
            <div key={`tbl-${keyPrefix}`} className="my-2.5 overflow-x-auto rounded-lg border border-white/10 bg-[#060b0f] shadow-inner">
              <table className="w-full text-left text-[11px] font-mono border-collapse">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.04]">
                    {headers.map((h, hIdx) => (
                      <th key={hIdx} className="py-2 px-3 text-[#A58D66] font-semibold tracking-wider text-[10.5px]">
                        {parseInline(h)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.06]">
                  {rows.map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-white/[0.02] transition-colors">
                      {row.map((cell, cIdx) => (
                        <td key={cIdx} className="py-1.5 px-3 text-slate-200">
                          {parseInline(cell)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        };

        lines.forEach((line, lIdx) => {
          const trimmed = line.trim();

          if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
            tableBuffer.push(trimmed);
            return;
          } else if (tableBuffer.length > 0) {
            flushTable(lIdx);
          }

          if (!trimmed) {
            elements.push(<div key={lIdx} className="h-1" />);
            return;
          }

          if (trimmed.startsWith('### ')) {
            elements.push(
              <h3 key={lIdx} className="text-xs font-bold font-mono text-[#A58D66] tracking-wide mt-2 mb-1 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-[#A58D66]" />
                <span>{parseInline(trimmed.slice(4))}</span>
              </h3>
            );
            return;
          }
          if (trimmed.startsWith('## ')) {
            elements.push(
              <h2 key={lIdx} className="text-sm font-bold font-mono text-[#E5E1DD] mt-2 mb-1">
                {parseInline(trimmed.slice(3))}
              </h2>
            );
            return;
          }
          if (trimmed.startsWith('# ')) {
            elements.push(
              <h1 key={lIdx} className="text-sm font-black font-mono text-[#A58D66] mt-2 mb-1">
                {parseInline(trimmed.slice(2))}
              </h1>
            );
            return;
          }
          if (trimmed.startsWith('> ')) {
            elements.push(
              <blockquote key={lIdx} className="border-l-2 border-[#A58D66] pl-2.5 py-0.5 my-1 text-slate-300 italic bg-[#A58D66]/5 rounded-r font-mono text-[11px]">
                {parseInline(trimmed.slice(2))}
              </blockquote>
            );
            return;
          }
          if (trimmed.startsWith('• ') || trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            elements.push(
              <div key={lIdx} className="flex items-start gap-2 pl-1 text-[11.5px] leading-relaxed text-slate-200">
                <span className="text-[#A58D66] mt-1 text-[8px]">◆</span>
                <span>{parseInline(trimmed.slice(2))}</span>
              </div>
            );
            return;
          }
          const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
          if (numMatch) {
            elements.push(
              <div key={lIdx} className="flex items-start gap-2 pl-1 text-[11.5px] leading-relaxed text-slate-200">
                <span className="text-[#76B4C2] font-mono text-[10px] mt-0.5">{numMatch[1]}.</span>
                <span>{parseInline(numMatch[2])}</span>
              </div>
            );
            return;
          }

          elements.push(
            <p key={lIdx} className="text-[11.5px] leading-relaxed text-slate-200">
              {parseInline(line)}
            </p>
          );
        });

        if (tableBuffer.length > 0) {
          flushTable(lines.length);
        }

        return (
          <div key={pIdx} className="space-y-1.5">
            {elements}
          </div>
        );
      })}
    </div>
  );
};

export const KittChatPanel: React.FC<KittChatPanelProps> = ({
  messages,
  onSendMessage,
  onSelectWorkspaceMode,
  onApplyPatch,
  isGenerating = false,
  activeCircuit
}) => {
  const [inputText, setInputText] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedThinkingIds, setExpandedThinkingIds] = useState<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isGenerating]);

  const handleSend = () => {
    if (!inputText.trim() || isGenerating) return;
    circuitAudio.playClick();
    onSendMessage(inputText.trim());
    setInputText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleThinking = (id: string) => {
    setExpandedThinkingIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const quickPrompts = [
    { label: '📡 Build Ultrasonic Radar', prompt: 'Build an ultrasonic distance radar with Arduino and servo' },
    { label: '⛅ IoT Weather Station', prompt: 'Create an IoT weather station with ESP32 and OLED display' },
    { label: '⏱️ 555 Timer Flasher', prompt: 'Build a 555 timer dual LED astable flasher' },
    { label: '🚦 Traffic Light Controller', prompt: 'Build an autonomous intersection traffic light controller' },
    { label: '🌱 Smart Irrigation', prompt: 'Synthesize an automated soil moisture plant watering system' },
    { label: '🔧 Swap Resistor to 330Ω', prompt: 'Replace the 220Ω resistor with 330Ω' },
    { label: '❓ Why 1N4007 Diode?', prompt: 'Why is the 1N4007 flyback diode necessary for motors?' },
    { label: '💻 Show C++ Firmware', prompt: 'Show me the full C++ firmware for this circuit' }
  ];

  return (
    <div className="flex flex-col h-full bg-[#0a1116] border-l border-[#A58D66]/20 relative overflow-hidden">
      {/* Top Header */}
      <div className="px-4 py-3 border-b border-[#A58D66]/20 bg-[#080f14]/80 backdrop-blur-md flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[#A58D66]/20 border border-[#A58D66]/40 flex items-center justify-center text-[#A58D66]">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-mono font-bold text-[#E5E1DD]">KITT Electronics Agent</div>
            <div className="text-[10px] text-[#76B4C2] font-mono flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
              <span>Universal Brain • Deterministic Solver</span>
            </div>
          </div>
        </div>

        {activeCircuit && (
          <div className="text-[10px] font-mono text-[#A58D66] bg-[#A58D66]/10 px-2 py-0.5 rounded border border-[#A58D66]/30">
            CIR v{activeCircuit.version} Active
          </div>
        )}
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 font-sans text-xs">
        {messages.map(msg => {
          const isKitt = msg.sender === 'kitt';
          const isThinkingOpen = expandedThinkingIds.has(msg.id);

          return (
            <div key={msg.id} className={`flex gap-3 ${isKitt ? 'justify-start' : 'justify-end'}`}>
              {isKitt && (
                <div className="w-6 h-6 rounded-full bg-[#A58D66]/20 border border-[#A58D66]/40 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-3.5 h-3.5 text-[#A58D66]" />
                </div>
              )}

              <div className={`max-w-[85%] space-y-2 ${isKitt ? 'text-[#E5E1DD]' : 'text-right'}`}>
                {/* Thinking Process Accordion */}
                {isKitt && msg.thinkingTrace && (
                  <div className="rounded-lg bg-black/40 border border-white/5 overflow-hidden">
                    <button
                      onClick={() => toggleThinking(msg.id)}
                      className="w-full px-3 py-1.5 flex items-center justify-between text-[11px] font-mono text-[#76B4C2] hover:text-[#E5E1DD] transition-colors cursor-pointer"
                    >
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="w-3 h-3 text-[#A58D66]" />
                        <span>{msg.thinkingTrace.summary}</span>
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                        <span>{(msg.thinkingTrace.durationMs / 1000).toFixed(1)}s</span>
                        {isThinkingOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                      </span>
                    </button>

                    {isThinkingOpen && (
                      <div className="px-3 pb-2 pt-1 border-t border-white/5 space-y-1 text-[10px] font-mono text-slate-400">
                        {msg.thinkingTrace.steps.map((step, idx) => (
                          <div key={idx} className="flex items-start gap-1.5">
                            <span className="text-[#A58D66]">›</span>
                            <span>{step}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Message Bubble */}
                <div
                  className={`p-3.5 rounded-xl ${
                    isKitt
                      ? 'bg-[#121c22]/90 border border-[#407E8C]/25 text-[#E5E1DD] shadow-lg'
                      : 'bg-[#A58D66] text-[#080f14] font-medium shadow-md ml-auto'
                  }`}
                >
                  <FormattedMessageText text={msg.text} isKitt={isKitt} />

                  {/* Copy Button on Assistant Message */}
                  {isKitt && (
                    <div className="pt-2 mt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                      <span>KITT Engineering v2.0</span>
                      <button
                        onClick={() => handleCopyText(msg.text, msg.id)}
                        className="hover:text-[#E5E1DD] flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        {copiedId === msg.id ? <Check className="w-3 h-3 text-[#10b981]" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedId === msg.id ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Workspace Selection Card (Prompted on Build Request) */}
                {msg.suggestedWorkspaceChoice && (
                  <div className="p-3.5 rounded-xl bg-[#0c161c] border border-[#A58D66]/40 space-y-2.5 shadow-xl">
                    <div className="text-[11px] font-mono font-bold text-[#A58D66] flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5" />
                      <span>CHOOSE YOUR WORKSPACE</span>
                    </div>
                    <p className="text-[11px] text-slate-300">
                      I have synthesized the canonical hardware netlist and verified the electrical operating points. Choose how you would like to inspect the system:
                    </p>
                    <div className="grid grid-cols-3 gap-2 pt-1">
                      <button
                        onClick={() => onSelectWorkspaceMode('2d')}
                        className="p-2 rounded-lg bg-[#407E8C]/20 border border-[#407E8C]/40 hover:bg-[#407E8C]/30 text-center transition-colors cursor-pointer"
                      >
                        <div className="text-[11px] font-bold text-[#E5E1DD] font-mono">2D Circuit Lab</div>
                        <div className="text-[9px] text-[#76B4C2] mt-0.5">IEEE Schematics</div>
                      </button>
                      <button
                        onClick={() => onSelectWorkspaceMode('3d')}
                        className="p-2 rounded-lg bg-[#A58D66]/20 border border-[#A58D66]/40 hover:bg-[#A58D66]/30 text-center transition-colors cursor-pointer"
                      >
                        <div className="text-[11px] font-bold text-[#E5E1DD] font-mono">3D Hardware Lab</div>
                        <div className="text-[9px] text-[#A58D66] mt-0.5">Breadboard 3D</div>
                      </button>
                      <button
                        onClick={() => onSelectWorkspaceMode('both')}
                        className="p-2 rounded-lg bg-white/5 border border-white/15 hover:bg-white/10 text-center transition-colors cursor-pointer"
                      >
                        <div className="text-[11px] font-bold text-[#E5E1DD] font-mono">Both / Start in 2D</div>
                        <div className="text-[9px] text-slate-400 mt-0.5">Full Studio</div>
                      </button>
                    </div>
                  </div>
                )}

                {/* Transactional Patch Confirmation Card */}
                {msg.proposedPatch && onApplyPatch && (
                  <div className="p-3 rounded-xl bg-[#0c161c] border border-[#10b981]/40 space-y-2 shadow-xl">
                    <div className="text-[11px] font-mono font-bold text-[#10b981] flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>PROPOSED CIR PATCH TRANSACTION</span>
                    </div>
                    <div className="text-[11px] text-slate-300 font-mono">
                      {msg.proposedPatch.description}
                    </div>
                    <button
                      onClick={() => {
                        circuitAudio.playBeepSuccess();
                        onApplyPatch(msg.proposedPatch!);
                      }}
                      className="w-full py-2 px-3 rounded-lg bg-[#10b981] hover:bg-[#059669] active:scale-[0.97] text-[#080f14] font-bold text-xs font-mono transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>Apply Changes to Live Circuit</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {!isKitt && (
                <div className="w-6 h-6 rounded-full bg-[#E5E1DD]/20 border border-[#E5E1DD]/40 flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-3.5 h-3.5 text-[#E5E1DD]" />
                </div>
              )}
            </div>
          );
        })}

        {isGenerating && (
          <div className="flex gap-3">
            <div className="w-6 h-6 rounded-full bg-[#A58D66]/20 border border-[#A58D66]/40 flex items-center justify-center shrink-0">
              <Bot className="w-3.5 h-3.5 text-[#A58D66] animate-spin" />
            </div>
            <div className="p-3 rounded-xl bg-[#121c22] border border-[#407E8C]/25 text-slate-400 text-xs font-mono flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#A58D66] animate-ping" />
              <span>Analyzing requirements & checking design rule constraints...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompts */}
      <div className="px-3 py-2 border-t border-[#A58D66]/15 bg-[#091014] overflow-x-auto flex items-center gap-1.5 no-scrollbar">
        {quickPrompts.map((p, i) => (
          <button
            key={i}
            onClick={() => {
              circuitAudio.playTone(520, 0.04, 'triangle');
              onSendMessage(p.prompt);
            }}
            className="px-2.5 py-1 rounded-full bg-white/5 hover:bg-[#A58D66]/20 active:scale-95 border border-white/10 hover:border-[#A58D66]/40 text-[10.5px] font-mono text-slate-300 hover:text-[#E5E1DD] whitespace-nowrap transition-all cursor-pointer flex items-center gap-1"
          >
            <span>{p.label}</span>
          </button>
        ))}
      </div>

      {/* Input Form */}
      <div className="p-3 bg-[#080f14] border-t border-[#A58D66]/20">
        <div className="relative flex items-end gap-2 bg-[#0d161c] border border-[#A58D66]/30 rounded-xl p-2 focus-within:border-[#A58D66] transition-colors shadow-inner">
          <textarea
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about circuits, sensors, code, physics, or describe an invention to build..."
            rows={2}
            className="w-full bg-transparent text-xs text-[#E5E1DD] placeholder:text-slate-500 outline-none resize-none font-sans"
          />
          <button
            onClick={handleSend}
            disabled={!inputText.trim() || isGenerating}
            className={`p-2 rounded-lg transition-all shrink-0 cursor-pointer active:scale-95 ${
              inputText.trim() && !isGenerating
                ? 'bg-gradient-to-r from-[#A58D66] to-[#8C7654] text-[#080f14] hover:from-[#BFA378] hover:to-[#A58D66] shadow-[0_0_12px_rgba(165,141,102,0.3)]'
                : 'bg-white/5 text-slate-600'
            }`}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

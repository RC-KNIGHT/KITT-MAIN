import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  ChevronDown,
  ChevronRight,
  Copy,
  Check,
  Layers,
  CheckCircle2
} from 'lucide-react';
import { UserIntentType, CanonicalCircuitModel, CIRPatchTransaction } from './cir/cirTypes';
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
        <strong key={index} className="font-semibold text-[#F5F5F5]">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={index} className="px-1.5 py-0.5 rounded-[6px] bg-[#29292A] text-[#E8E8E8] font-mono text-[12px]">
          {part.slice(1, -1)}
        </code>
      );
    }
    if (part.startsWith('$') && part.endsWith('$')) {
      return (
        <span key={index} className="font-mono text-[#E8E8E8] px-0.5">
          {part.slice(1, -1)}
        </span>
      );
    }
    return part;
  });
}

export const FormattedMessageText: React.FC<{ text: string; isKitt: boolean }> = ({ text, isKitt }) => {
  if (!isKitt) {
    return <span className="kds-body-sm">{text}</span>;
  }

  const parts = text.split(/(\$\$[\s\S]*?\$\$|```[\s\S]*?```)/g);

  return (
    <div className="space-y-3 kds-body-sm">
      {parts.map((part, pIdx) => {
        if (part.startsWith('```') && part.endsWith('```')) {
          const firstLineEnd = part.indexOf('\n');
          const lang = part.slice(3, firstLineEnd > -1 ? firstLineEnd : 3).trim();
          const code = firstLineEnd > -1 ? part.slice(firstLineEnd + 1, -3) : part.slice(3, -3);
          return (
            <div key={pIdx} className="my-2 rounded-[12px] bg-[#0B0B0C] border border-[#353536] overflow-hidden text-left">
              <div className="px-3 py-2 border-b border-[#353536] flex items-center justify-between">
                <span className="kds-caption uppercase tracking-wide">{lang || 'code'}</span>
                <button
                  onClick={() => navigator.clipboard.writeText(code)}
                  className="kds-caption flex items-center gap-1 hover:text-[#F5F5F5] transition-colors cursor-pointer kds-focusable"
                  title="Copy code"
                >
                  <Copy className="w-3 h-3" />
                  <span>Copy</span>
                </button>
              </div>
              <pre className="p-3 overflow-x-auto font-mono text-[12px] text-[#E8E8E8] leading-relaxed">
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
            <div key={pIdx} className="my-2 p-3 rounded-[12px] bg-[#1D1D1E] border border-[#353536] font-mono text-[12px] text-[#E8E8E8] overflow-x-auto whitespace-pre-wrap leading-relaxed">
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
                <p key={`tbl-raw-${keyPrefix}-${idx}`} className="kds-body-sm text-[#F5F5F5]">
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
            <div key={`tbl-${keyPrefix}`} className="my-2 overflow-x-auto rounded-[12px] border border-[#353536]">
              <table className="w-full text-left kds-body-sm border-collapse">
                <thead>
                  <tr className="border-b border-[#353536] bg-[#1D1D1E]">
                    {headers.map((h, hIdx) => (
                      <th key={hIdx} className="py-2 px-3 text-[#F5F5F5] font-medium">
                        {parseInline(h)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, rIdx) => (
                    <tr key={rIdx} className="border-b border-[#29292A] last:border-0">
                      {row.map((cell, cIdx) => (
                        <td key={cIdx} className="py-2 px-3 text-[#9E9E9E]">
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
            elements.push(<div key={lIdx} className="h-1.5" />);
            return;
          }

          if (trimmed.startsWith('### ')) {
            elements.push(
              <h3 key={lIdx} className="kds-heading-xs text-[#F5F5F5] mt-3 mb-1">
                {parseInline(trimmed.slice(4))}
              </h3>
            );
            return;
          }
          if (trimmed.startsWith('## ')) {
            elements.push(
              <h2 key={lIdx} className="kds-heading-md text-[#F5F5F5] mt-3 mb-1">
                {parseInline(trimmed.slice(3))}
              </h2>
            );
            return;
          }
          if (trimmed.startsWith('# ')) {
            elements.push(
              <h1 key={lIdx} className="kds-heading-lg text-[#F5F5F5] mt-3 mb-1">
                {parseInline(trimmed.slice(2))}
              </h1>
            );
            return;
          }
          if (trimmed.startsWith('> ')) {
            elements.push(
              <blockquote key={lIdx} className="border-l-2 border-[#8F8F8F] pl-3 py-1 my-2 text-[#9E9E9E] kds-body-sm">
                {parseInline(trimmed.slice(2))}
              </blockquote>
            );
            return;
          }
          if (trimmed.startsWith('• ') || trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            elements.push(
              <div key={lIdx} className="flex items-start gap-2 kds-body-sm text-[#F5F5F5]">
                <span className="text-[#9E9E9E] mt-1.5 text-[6px]">●</span>
                <span>{parseInline(trimmed.slice(2))}</span>
              </div>
            );
            return;
          }
          const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
          if (numMatch) {
            elements.push(
              <div key={lIdx} className="flex items-start gap-2 kds-body-sm text-[#F5F5F5]">
                <span className="text-[#9E9E9E] font-mono text-[12px]">{numMatch[1]}.</span>
                <span>{parseInline(numMatch[2])}</span>
              </div>
            );
            return;
          }

          elements.push(
            <p key={lIdx} className="kds-body-sm text-[#F5F5F5]">
              {parseInline(line)}
            </p>
          );
        });

        if (tableBuffer.length > 0) {
          flushTable(lines.length);
        }

        return (
          <div key={pIdx} className="space-y-2">
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
    { label: 'Ultrasonic radar', prompt: 'Build an ultrasonic distance radar with Arduino and servo' },
    { label: 'IoT weather station', prompt: 'Create an IoT weather station with ESP32 and OLED display' },
    { label: '555 timer flasher', prompt: 'Build a 555 timer dual LED astable flasher' },
    { label: 'Traffic light', prompt: 'Build an autonomous intersection traffic light controller' },
    { label: 'Smart irrigation', prompt: 'Synthesize an automated soil moisture plant watering system' },
    { label: 'Swap resistor to 330Ω', prompt: 'Replace the 220Ω resistor with 330Ω' },
    { label: 'Why 1N4007 diode?', prompt: 'Why is the 1N4007 flyback diode necessary for motors?' }
  ];

  return (
    <div className="flex flex-col h-full bg-black border-l border-[#353536] relative overflow-hidden">
      {/* Header */}
      <div className="h-14 px-5 border-b border-[#353536] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <span className="w-8 h-8 rounded-full bg-[#1D1D1E] border border-[#353536] flex items-center justify-center shrink-0">
            <span className="w-2 h-2 rounded-full bg-[#F5F5F5]" />
          </span>
          <div className="min-w-0">
            <p className="kds-body-sm text-[#F5F5F5] truncate">KITT Electronics Agent</p>
            <p className="kds-caption truncate">Universal brain · deterministic solver</p>
          </div>
        </div>

        {activeCircuit && (
          <span className="kds-badge shrink-0">CIR v{activeCircuit.version}</span>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-6 space-y-6">
        {messages.map(msg => {
          const isKitt = msg.sender === 'kitt';
          const isThinkingOpen = expandedThinkingIds.has(msg.id);

          return (
            <div key={msg.id} className={`kds-enter flex flex-col ${isKitt ? 'items-start' : 'items-end'}`}>
              {/* Thinking trace */}
              {isKitt && msg.thinkingTrace && (
                <div className="w-full mb-2">
                  <button
                    onClick={() => toggleThinking(msg.id)}
                    aria-expanded={isThinkingOpen}
                    className="flex items-center gap-1.5 kds-caption hover:text-[#F5F5F5] transition-colors cursor-pointer kds-focusable rounded-[6px]"
                  >
                    {isThinkingOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                    <span className="truncate max-w-[320px]">{msg.thinkingTrace.summary}</span>
                    <span>· {(msg.thinkingTrace.durationMs / 1000).toFixed(1)}s</span>
                  </button>

                  {isThinkingOpen && (
                    <div className="mt-2 kds-card p-3 space-y-1.5">
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

              {/* Message body */}
              <div
                className={
                  isKitt
                    ? 'w-full'
                    : 'max-w-[85%] px-4 py-3 rounded-[12px] bg-[#1D1D1E] border border-[#353536]'
                }
              >
                <FormattedMessageText text={msg.text} isKitt={isKitt} />

                {isKitt && (
                  <div className="pt-2 mt-2 flex items-center justify-between gap-4">
                    <span className="kds-caption">{msg.timestamp}</span>
                    <button
                      onClick={() => handleCopyText(msg.text, msg.id)}
                      className="kds-caption flex items-center gap-1 hover:text-[#F5F5F5] transition-colors cursor-pointer kds-focusable"
                    >
                      {copiedId === msg.id ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedId === msg.id ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Workspace choice */}
              {msg.suggestedWorkspaceChoice && (
                <div className="w-full mt-3 kds-card p-4 space-y-3">
                  <p className="kds-heading-xs text-[#F5F5F5] flex items-center gap-2">
                    <Layers className="w-4 h-4" />
                    <span>Choose your workspace</span>
                  </p>
                  <p className="kds-caption leading-relaxed">
                    The canonical netlist is synthesized and electrically verified. Choose how to inspect it.
                  </p>
                  <div className="grid grid-cols-3 gap-2 pt-1">
                    <button
                      onClick={() => onSelectWorkspaceMode('2d')}
                      className="kds-btn kds-btn-secondary flex-col !min-h-[64px] !px-3 !py-2 kds-focusable"
                    >
                      <span className="kds-body-sm text-[#F5F5F5]">2D circuit</span>
                      <span className="kds-caption">Schematics</span>
                    </button>
                    <button
                      onClick={() => onSelectWorkspaceMode('3d')}
                      className="kds-btn kds-btn-secondary flex-col !min-h-[64px] !px-3 !py-2 kds-focusable"
                    >
                      <span className="kds-body-sm text-[#F5F5F5]">3D lab</span>
                      <span className="kds-caption">Breadboard</span>
                    </button>
                    <button
                      onClick={() => onSelectWorkspaceMode('both')}
                      className="kds-btn kds-btn-secondary flex-col !min-h-[64px] !px-3 !py-2 kds-focusable"
                    >
                      <span className="kds-body-sm text-[#F5F5F5]">Both</span>
                      <span className="kds-caption">Full studio</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Proposed patch */}
              {msg.proposedPatch && onApplyPatch && (
                <div className="w-full mt-3 kds-card p-4 space-y-3">
                  <p className="kds-heading-xs text-[#F5F5F5] flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Proposed circuit patch</span>
                  </p>
                  <p className="kds-caption leading-relaxed">{msg.proposedPatch.description}</p>
                  <button
                    onClick={() => {
                      circuitAudio.playBeepSuccess();
                      onApplyPatch(msg.proposedPatch!);
                    }}
                    className="kds-btn kds-btn-primary w-full kds-focusable"
                  >
                    <span>Apply changes to live circuit</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}

        {isGenerating && (
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-[#F5F5F5] animate-pulse" />
            <span className="kds-caption">Analyzing requirements and checking design rules…</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick prompts */}
      <div className="px-3 py-2 border-t border-[#353536] overflow-x-auto flex items-center gap-2">
        {quickPrompts.map((p, i) => (
          <button
            key={i}
            onClick={() => {
              circuitAudio.playTone(520, 0.04, 'triangle');
              onSendMessage(p.prompt);
            }}
            className="px-3 py-1.5 rounded-full border border-[#353536] hover:border-[#8F8F8F] hover:bg-white/[0.06] kds-caption hover:text-[#F5F5F5] whitespace-nowrap transition-colors cursor-pointer kds-focusable"
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Composer */}
      <div className="p-3 border-t border-[#353536]">
        <div className="flex items-end gap-2">
          <textarea
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about circuits, sensors, code, or describe an invention…"
            rows={2}
            className="kds-input flex-1 resize-none !text-[15px]"
          />
          <button
            onClick={handleSend}
            disabled={!inputText.trim() || isGenerating}
            title="Send"
            className="kds-btn kds-btn-primary !px-3.5 shrink-0 kds-focusable"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

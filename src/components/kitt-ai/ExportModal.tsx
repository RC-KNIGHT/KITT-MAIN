import React, { useState } from 'react';
import { 
  X, 
  Download, 
  Copy, 
  Check, 
  FileJson, 
  ListOrdered, 
  FileCode, 
  ShieldCheck, 
  Table, 
  Layers 
} from 'lucide-react';
import { CanonicalCircuitModel } from './cir/cirTypes';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  circuit: CanonicalCircuitModel;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  circuit
}) => {
  const [activeTab, setActiveTab] = useState<'bom' | 'cir' | 'firmware' | 'wiring' | 'report'>('bom');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadFile = (filename: string, content: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Structured Categorized BOM (Required, Recommended, Optional, Substitutable)
  const bomList = circuit.components.map((comp, idx) => {
    let classification: 'Required' | 'Recommended' | 'Optional' | 'Substitutable' = 'Required';
    let alternative = 'Electrically matched pin-compatible equivalent';

    if (comp.category === 'passive' && comp.parameters.resistance) {
      classification = 'Required';
      alternative = 'Any standard 1/4W metal film resistor within 5% tolerance';
    } else if (comp.category === 'semiconductor' && comp.partNumber.includes('1N4007')) {
      classification = 'Recommended';
      alternative = '1N5819 Schottky Diode or 1N4001';
    } else if (comp.category === 'display') {
      classification = 'Optional';
      alternative = '16x2 I2C LCD or Serial Monitor Terminal';
    }

    return {
      index: idx + 1,
      name: comp.displayName,
      partNumber: comp.partNumber,
      category: comp.category,
      package: comp.package,
      classification,
      alternative
    };
  });

  // Wiring Table
  const wiringTableText = circuit.wires
    .map((w, i) => `${i + 1}. [${w.signalType}] ${w.fromComponentId}:${w.fromPinId} ➔ ${w.toComponentId}:${w.toPinId} (${w.color})`)
    .join('\n');

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-[9999] flex items-center justify-center p-4">
      <div className="bg-[#0a1116] border border-[#A58D66]/40 rounded-2xl w-full max-w-4xl h-[80vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#A58D66]/20 flex items-center justify-between bg-[#080f14]">
          <div className="flex items-center gap-2.5">
            <Download className="w-5 h-5 text-[#A58D66]" />
            <div>
              <h3 className="text-base font-bold font-mono text-[#E5E1DD]">Export Engineering Package</h3>
              <p className="text-xs text-[#76B4C2] font-mono">{circuit.title} (CIR v{circuit.version})</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 py-2.5 border-b border-[#A58D66]/15 bg-[#091014] flex items-center gap-2">
          <button
            onClick={() => setActiveTab('bom')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'bom' ? 'bg-[#A58D66] text-[#080f14] font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <ListOrdered className="w-3.5 h-3.5" />
            <span>Categorized BOM</span>
          </button>

          <button
            onClick={() => setActiveTab('cir')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'cir' ? 'bg-[#A58D66] text-[#080f14] font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileJson className="w-3.5 h-3.5" />
            <span>CIR Model (JSON)</span>
          </button>

          <button
            onClick={() => setActiveTab('firmware')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'firmware' ? 'bg-[#A58D66] text-[#080f14] font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>Firmware Source</span>
          </button>

          <button
            onClick={() => setActiveTab('wiring')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'wiring' ? 'bg-[#A58D66] text-[#080f14] font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Table className="w-3.5 h-3.5" />
            <span>Wiring Table</span>
          </button>

          <button
            onClick={() => setActiveTab('report')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'report' ? 'bg-[#A58D66] text-[#080f14] font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>9-Stage Verification Report</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 p-6 overflow-y-auto bg-[#070c10] text-xs font-mono text-slate-300">
          {activeTab === 'bom' && (
            <div className="space-y-4">
              <div className="text-xs text-slate-400 mb-2">
                Standardized Bill of Materials with electrical classification and component substitution compatibility.
              </div>
              <div className="border border-white/10 rounded-xl overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#121c22] text-[#A58D66] border-b border-white/10 text-[11px]">
                      <th className="p-2.5">#</th>
                      <th className="p-2.5">Component</th>
                      <th className="p-2.5">Part Number</th>
                      <th className="p-2.5">Package</th>
                      <th className="p-2.5">Role</th>
                      <th className="p-2.5">Substitutable Alternative</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bomList.map(item => (
                      <tr key={item.index} className="border-b border-white/5 hover:bg-white/5">
                        <td className="p-2.5 text-slate-500">{item.index}</td>
                        <td className="p-2.5 font-bold text-[#E5E1DD]">{item.name}</td>
                        <td className="p-2.5 text-[#76B4C2]">{item.partNumber}</td>
                        <td className="p-2.5 text-slate-400">{item.package}</td>
                        <td className="p-2.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            item.classification === 'Required' ? 'bg-red-500/20 text-red-400' :
                            item.classification === 'Recommended' ? 'bg-amber-500/20 text-amber-400' :
                            'bg-blue-500/20 text-blue-400'
                          }`}>
                            {item.classification}
                          </span>
                        </td>
                        <td className="p-2.5 text-slate-400 text-[11px]">{item.alternative}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'cir' && (
            <pre className="p-4 bg-black/60 rounded-xl border border-white/10 overflow-x-auto text-[11px] text-[#10b981]">
              {JSON.stringify(circuit, null, 2)}
            </pre>
          )}

          {activeTab === 'firmware' && (
            <pre className="p-4 bg-black/60 rounded-xl border border-white/10 overflow-x-auto text-[11px] text-slate-200">
              {circuit.firmware.sourceCode}
            </pre>
          )}

          {activeTab === 'wiring' && (
            <div className="space-y-3">
              <div className="text-xs text-slate-400">Point-to-point netlist pin connection index:</div>
              <pre className="p-4 bg-black/60 rounded-xl border border-white/10 overflow-x-auto text-[11px] text-[#76B4C2] leading-relaxed">
                {wiringTableText}
              </pre>
            </div>
          )}

          {activeTab === 'report' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-[#121c22] border border-[#A58D66]/30">
                <div>
                  <span className="text-xs text-slate-400">Overall Verification Verdict: </span>
                  <span className="text-sm font-bold text-[#10b981]">{circuit.verificationReport.overallStatus}</span>
                </div>
                <div className="text-[10px] text-slate-500">{circuit.verificationReport.timestamp}</div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Object.entries(circuit.verificationReport.stageResults).map(([key, res]) => (
                  <div key={key} className="p-3 rounded-xl bg-white/5 border border-white/10">
                    <div className="text-[11px] font-bold text-[#A58D66] uppercase">{key.replace('stage', 'Stage ')}</div>
                    <div className="text-xs text-[#E5E1DD] mt-1">{res.message}</div>
                    <div className="text-[10px] text-[#10b981] mt-1 uppercase font-bold">Status: {res.status}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-3.5 border-t border-[#A58D66]/20 bg-[#080f14] flex items-center justify-between">
          <div className="text-[11px] font-mono text-slate-400">
            Export ready for KiCad, Arduino IDE, or PCBA procurement.
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (activeTab === 'cir') handleCopy(JSON.stringify(circuit, null, 2));
                else if (activeTab === 'firmware') handleCopy(circuit.firmware.sourceCode);
                else if (activeTab === 'wiring') handleCopy(wiringTableText);
                else handleCopy(JSON.stringify(bomList, null, 2));
              }}
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-xs font-mono text-white flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#10b981]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Content'}</span>
            </button>

            <button
              onClick={() => {
                if (activeTab === 'cir') handleDownloadFile(`${circuit.id}.cir.json`, JSON.stringify(circuit, null, 2), 'application/json');
                else if (activeTab === 'firmware') handleDownloadFile(`${circuit.id}.ino`, circuit.firmware.sourceCode, 'text/plain');
                else handleDownloadFile(`${circuit.id}_bom.json`, JSON.stringify(bomList, null, 2), 'application/json');
              }}
              className="px-4 py-1.5 rounded-lg bg-[#A58D66] hover:bg-[#bfa378] text-[#080f14] font-bold text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download File</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

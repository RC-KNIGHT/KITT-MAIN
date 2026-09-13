import React from 'react';
import { 
  Sliders, 
  Cpu, 
  Trash2, 
  RotateCw, 
  Activity, 
  Zap, 
  ShieldCheck, 
  Battery, 
  Thermometer, 
  Info,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { CanonicalCircuitModel, CIRComponent } from '../cir/cirTypes';

interface InspectorPanelProps {
  selectedComponent: CIRComponent | null;
  circuit: CanonicalCircuitModel;
  onUpdateComponentParameters?: (componentId: string, parameters: Record<string, any>) => void;
  onDeleteComponent?: (componentId: string) => void;
  onDeselect?: () => void;
}

export const InspectorPanel: React.FC<InspectorPanelProps> = ({
  selectedComponent,
  circuit,
  onUpdateComponentParameters,
  onDeleteComponent,
  onDeselect
}) => {
  return (
    <aside className="w-72 h-full bg-[#080f14] border-l border-[#A58D66]/20 flex flex-col shrink-0 font-sans select-none z-20">
      {/* Header */}
      <div className="h-11 px-4 border-b border-[#A58D66]/15 flex items-center justify-between bg-[#080f14]">
        <div className="flex items-center gap-2">
          <Sliders className="w-3.5 h-3.5 text-[#A58D66]" />
          <span className="text-xs font-mono font-bold text-[#E5E1DD]">Inspector</span>
        </div>
        {selectedComponent && (
          <button
            onClick={onDeselect}
            className="text-[10px] font-mono text-slate-400 hover:text-white cursor-pointer"
          >
            Clear selection
          </button>
        )}
      </div>

      {/* Body Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {selectedComponent ? (
          /* COMPONENT SELECTED VIEW */
          <div className="space-y-4">
            {/* Component Identity Card */}
            <div className="p-3.5 rounded-xl bg-[#0c161d] border border-[#A58D66]/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded bg-[#A58D66]/20 text-[#DFCCA8] border border-[#A58D66]/30">
                  {selectedComponent.category}
                </span>
                <span className="text-[10px] font-mono text-slate-500">
                  {selectedComponent.package}
                </span>
              </div>

              <h3 className="text-sm font-bold font-mono text-[#E5E1DD] leading-snug">
                {selectedComponent.displayName}
              </h3>

              <div className="text-[11px] text-slate-400 font-mono">
                <div>Part: <span className="text-slate-200">{selectedComponent.partNumber}</span></div>
                <div>Mfr: <span className="text-slate-400">{selectedComponent.manufacturer}</span></div>
              </div>
            </div>

            {/* Editable Parameters */}
            <div className="space-y-2.5">
              <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
                Parameters & Ratings
              </span>

              {Object.entries(selectedComponent.parameters).map(([key, val]) => (
                <div key={key} className="space-y-1">
                  <label className="text-[11px] font-mono text-slate-400 capitalize">
                    {key.replace(/([A-Z])/g, ' $1')}
                  </label>
                  <input
                    type="text"
                    value={String(val)}
                    onChange={e => {
                      if (onUpdateComponentParameters) {
                        onUpdateComponentParameters(selectedComponent.id, {
                          ...selectedComponent.parameters,
                          [key]: e.target.value
                        });
                      }
                    }}
                    className="w-full px-2.5 py-1 rounded bg-[#0c161d] border border-white/10 text-xs font-mono text-[#E5E1DD] focus:outline-none focus:border-[#A58D66]"
                  />
                </div>
              ))}
            </div>

            {/* Pins Table */}
            <div className="space-y-2">
              <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
                Pin Connections ({selectedComponent.pins.length})
              </span>
              <div className="border border-white/5 rounded-lg overflow-hidden divide-y divide-white/5 text-[11px] font-mono">
                {selectedComponent.pins.map(pin => (
                  <div key={pin.id} className="p-2 bg-[#0c161d] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#A58D66]" />
                      <span className="text-slate-200 font-bold">{pin.name}</span>
                    </div>
                    <span className="text-slate-500 text-[10px] capitalize">{pin.type}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Component Actions */}
            <div className="pt-2 flex items-center gap-2">
              {onDeleteComponent && (
                <button
                  onClick={() => onDeleteComponent(selectedComponent.id)}
                  className="w-full py-2 px-3 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-mono flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete component</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          /* EMPTY STATE MATCHING ANTIKA SCREENSHOT media_1789195367408.png */
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500 font-sans select-none min-h-[400px]">
            <div className="w-10 h-10 mb-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="5" y="5" width="14" height="14" rx="2" />
                <line x1="9" y1="2" x2="9" y2="5" />
                <line x1="15" y1="2" x2="15" y2="5" />
                <line x1="9" y1="19" x2="9" y2="22" />
                <line x1="15" y1="19" x2="15" y2="22" />
                <line x1="2" y1="9" x2="5" y2="9" />
                <line x1="2" y1="15" x2="5" y2="15" />
                <line x1="19" y1="9" x2="22" y2="9" />
                <line x1="19" y1="15" x2="22" y2="15" />
              </svg>
            </div>
            <p className="text-sm font-mono text-slate-400">Select a component</p>
          </div>
        )}
      </div>
    </aside>
  );
};

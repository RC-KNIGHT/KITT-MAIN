/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useCircuit } from '../../context/CircuitContext';
import { CircuitData } from '../../types/circuit';
import {
  Archive,
  Check,
  Clock,
  Copy,
  Cpu,
  Database,
  Download,
  FolderOpen,
  Plus,
  Save,
  Sparkles,
  Trash2,
  Upload,
  X,
  Zap,
} from 'lucide-react';

interface SavedCircuitRecord {
  id: string;
  name: string;
  description?: string;
  savedAt: number;
  data: CircuitData;
  isAutosave?: boolean;
}

const STORAGE_KEY_LIST = 'digilogic_saved_circuits_library_v1';
const AUTOSAVE_KEY = 'digilogic_circuit_autosave_v1';
const LEGACY_SAVED_KEY = 'digilogic_saved_circuit';

export const SavedCircuitsModal: React.FC = () => {
  const {
    circuitName,
    setCircuitName,
    components,
    wires,
    customGates,
    camera,
    exportJson,
    importJson,
    setActiveModal,
    colorMode,
  } = useCircuit();

  const isLight = colorMode === 'light';

  const [savedList, setSavedList] = useState<SavedCircuitRecord[]>([]);
  const [newCircuitName, setNewCircuitName] = useState(circuitName || 'My Logic Circuit');
  const [newDescription, setNewDescription] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [searchFilter, setSearchFilter] = useState('');

  // Load all saved circuits from localStorage on open
  useEffect(() => {
    loadSavedRecords();
  }, []);

  const loadSavedRecords = () => {
    const list: SavedCircuitRecord[] = [];

    // 1. Check autosave
    try {
      const autoStr = localStorage.getItem(AUTOSAVE_KEY);
      if (autoStr) {
        const parsed: CircuitData = JSON.parse(autoStr);
        if (parsed.components && parsed.components.length > 0) {
          list.push({
            id: 'autosave_slot',
            name: `${parsed.name || 'Untitled'} (Auto-Saved)`,
            description: 'Continuously auto-saved session snapshot',
            savedAt: parsed.updatedAt || parsed.createdAt || Date.now(),
            data: parsed,
            isAutosave: true,
          });
        }
      }
    } catch (e) {
      console.warn('Error reading autosave:', e);
    }

    // 2. Check saved circuits collection
    try {
      const stored = localStorage.getItem(STORAGE_KEY_LIST);
      if (stored) {
        const parsed: SavedCircuitRecord[] = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          list.push(...parsed);
        }
      }
    } catch (e) {
      console.warn('Error reading saved circuits collection:', e);
    }

    // 3. Check legacy slot if not already in list
    try {
      const legacyStr = localStorage.getItem(LEGACY_SAVED_KEY);
      if (legacyStr && !list.some((r) => r.id === 'legacy_slot')) {
        const parsed: CircuitData = JSON.parse(legacyStr);
        if (parsed.components && parsed.components.length > 0) {
          list.push({
            id: 'legacy_slot',
            name: parsed.name || 'Quick-Saved Circuit',
            description: 'Saved via Quick Local Storage slot',
            savedAt: parsed.updatedAt || parsed.createdAt || Date.now(),
            data: parsed,
          });
        }
      }
    } catch (e) {
      console.warn('Error reading legacy saved slot:', e);
    }

    setSavedList(list);
  };

  const showToast = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 2500);
  };

  // Save current circuit as a new slot
  const handleSaveNewSlot = () => {
    if (!newCircuitName.trim()) {
      showToast('Please enter a circuit title');
      return;
    }

    const currentData: CircuitData = {
      version: '1.0.0',
      name: newCircuitName.trim(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
      components,
      wires,
      customGates,
      camera,
    };

    const newRecord: SavedCircuitRecord = {
      id: `saved_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: newCircuitName.trim(),
      description: newDescription.trim() || undefined,
      savedAt: Date.now(),
      data: currentData,
    };

    const updated = [newRecord, ...savedList.filter((r) => !r.isAutosave && r.id !== 'legacy_slot')];
    try {
      localStorage.setItem(STORAGE_KEY_LIST, JSON.stringify(updated));
      setCircuitName(newCircuitName.trim());
      loadSavedRecords();
      showToast(`Saved "${newCircuitName}" to Local Storage!`);
      setNewDescription('');
    } catch (e) {
      showToast('Storage quota exceeded or save failed');
    }
  };

  // Load a circuit from list
  const handleLoadCircuit = (record: SavedCircuitRecord) => {
    const success = importJson(JSON.stringify(record.data));
    if (success) {
      setCircuitName(record.data.name || record.name);
      showToast(`Loaded "${record.name}"!`);
      setTimeout(() => setActiveModal('none'), 600);
    } else {
      showToast('Could not load circuit data');
    }
  };

  // Overwrite an existing slot
  const handleOverwrite = (recordId: string) => {
    const currentData: CircuitData = {
      version: '1.0.0',
      name: circuitName,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      components,
      wires,
      customGates,
      camera,
    };

    const updated = savedList
      .filter((r) => !r.isAutosave && r.id !== 'legacy_slot')
      .map((r) => {
        if (r.id === recordId) {
          return {
            ...r,
            name: circuitName,
            savedAt: Date.now(),
            data: currentData,
          };
        }
        return r;
      });

    try {
      localStorage.setItem(STORAGE_KEY_LIST, JSON.stringify(updated));
      loadSavedRecords();
      showToast('Slot updated with current canvas!');
    } catch (e) {
      showToast('Failed to overwrite slot');
    }
  };

  // Delete a saved slot
  const handleDeleteSlot = (recordId: string, isAutosave?: boolean) => {
    if (isAutosave) {
      localStorage.removeItem(AUTOSAVE_KEY);
      loadSavedRecords();
      showToast('Auto-save cache cleared');
      return;
    }

    if (recordId === 'legacy_slot') {
      localStorage.removeItem(LEGACY_SAVED_KEY);
      loadSavedRecords();
      showToast('Slot removed');
      return;
    }

    const updated = savedList.filter((r) => r.id !== recordId && !r.isAutosave && r.id !== 'legacy_slot');
    try {
      localStorage.setItem(STORAGE_KEY_LIST, JSON.stringify(updated));
      loadSavedRecords();
      showToast('Circuit removed from local storage');
    } catch (e) {
      showToast('Failed to delete slot');
    }
  };

  // Export JSON file for a record
  const handleExportRecord = (record: SavedCircuitRecord) => {
    const jsonStr = JSON.stringify(record.data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${record.name.toLowerCase().replace(/\s+/g, '_')}_circuit.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Downloaded JSON file!');
  };

  const filtered = savedList.filter((r) =>
    r.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
    (r.description && r.description.toLowerCase().includes(searchFilter.toLowerCase()))
  );

  return (
    <div
      id="saved-circuits-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#080f14]/70 backdrop-blur-sm animate-fade-in"
      onClick={() => setActiveModal('none')}
    >
      <div
        id="saved-circuits-dialog"
        className={`w-full max-w-2xl border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-scale-up touch-auto transition-colors ${
          isLight
            ? 'bg-white border-slate-300 text-slate-800 shadow-[0_20px_60px_rgba(0,0,0,0.15)]'
            : 'bg-[#0d171f] border-[#A58D66]/30 text-[#E5E1DD]'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className={`p-4 sm:p-5 border-b flex items-center justify-between transition-colors ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#080f14] border-[#A58D66]/20'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#A58D66]/20 border border-[#A58D66]/40 flex items-center justify-center text-[#DFCCA8] shadow-sm">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className={`text-base sm:text-lg font-bold flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-[#E5E1DD]'}`}>
                Saved Circuits Manager
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#A58D66]/20 text-[#DFCCA8] border border-[#A58D66]/30 font-mono">
                  Local Storage
                </span>
              </h2>
              <p className={`text-xs ${isLight ? 'text-[#E5E1DD]/45' : 'text-[#E5E1DD]/60'}`}>
                Load, manage, overwrite, or save your circuit diagrams securely on this device
              </p>
            </div>
          </div>

          <button
            id="close-saved-circuits-btn"
            onClick={() => setActiveModal('none')}
            className={`p-2 rounded-lg transition-colors ${
              isLight ? 'text-[#E5E1DD]/60 hover:text-slate-700 hover:bg-slate-200' : 'text-[#E5E1DD]/60 hover:text-[#E5E1DD] hover:bg-[#080f14]'
            }`}
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Save Current Section */}
        <div
          className={`p-4 border-b transition-colors ${
            isLight ? 'bg-slate-50/70 border-slate-200' : 'bg-[#080f14] border-[#A58D66]/20'
          }`}
        >
          <div className="text-xs font-bold uppercase tracking-wider text-[#A58D66] mb-2 flex items-center gap-1.5">
            <Save className="w-3.5 h-3.5" />
            <span>Save Current Canvas ({components.length} Gates, {wires.length} Wires)</span>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              placeholder="Circuit Name..."
              value={newCircuitName}
              onChange={(e) => setNewCircuitName(e.target.value)}
              className={`flex-1 px-3 py-2 rounded-lg text-xs focus:outline-none transition-colors border ${
                isLight
                  ? 'bg-white border-slate-300 focus:border-[#A58D66] text-slate-900 placeholder-slate-400'
                  : 'bg-[#080f14] border-[#A58D66]/30 focus:border-[#A58D66] text-[#E5E1DD] placeholder-[#E5E1DD]/40'
              }`}
            />
            <input
              type="text"
              placeholder="Optional notes / description..."
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              className={`flex-1 px-3 py-2 rounded-lg text-xs focus:outline-none transition-colors border ${
                isLight
                  ? 'bg-white border-slate-300 focus:border-[#A58D66] text-slate-900 placeholder-slate-400'
                  : 'bg-[#080f14] border-[#A58D66]/30 focus:border-[#A58D66] text-[#E5E1DD] placeholder-[#E5E1DD]/40'
              }`}
            />
            <button
              id="save-new-slot-btn"
              onClick={handleSaveNewSlot}
              className="px-4 py-2 bg-[#A58D66] hover:bg-[#DFCCA8] text-[#080f14] font-bold text-xs rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-md shadow-[#A58D66]/20 cursor-pointer shrink-0 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Save New Slot</span>
            </button>
          </div>
        </div>

        {/* Search & List */}
        <div
          className={`px-4 pt-3 pb-2 flex items-center justify-between gap-2 border-b transition-colors ${
            isLight ? 'border-slate-200 bg-slate-50/40' : 'border-[#A58D66]/20'
          }`}
        >
          <div className={`text-xs font-semibold flex items-center gap-1.5 ${isLight ? 'text-slate-700' : 'text-[#DFCCA8]'}`}>
            <FolderOpen className={`w-4 h-4 ${isLight ? 'text-[#E5E1DD]/45' : 'text-[#E5E1DD]/60'}`} />
            <span>Saved Diagram Slots ({savedList.length})</span>
          </div>
          <input
            type="text"
            placeholder="Filter saved circuits..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className={`px-2.5 py-1 rounded-md text-[11px] focus:outline-none max-w-44 border transition-colors ${
              isLight
                ? 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                : 'bg-[#080f14] border-[#A58D66]/20 text-[#E5E1DD] placeholder-[#E5E1DD]/40'
            }`}
          />
        </div>

        {/* Scrollable Saved Slots List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5 max-h-80 overscroll-contain">
          {filtered.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-center text-[#E5E1DD]/60 space-y-2">
              <Archive className={`w-8 h-8 ${isLight ? 'text-[#E5E1DD]/60' : 'text-[#A58D66]/40'}`} />
              <p className={`text-sm font-semibold ${isLight ? 'text-slate-700' : 'text-[#DFCCA8]'}`}>No saved circuits found</p>
              <p className={`text-xs max-w-sm ${isLight ? 'text-[#E5E1DD]/45' : 'text-[#E5E1DD]/45'}`}>
                Save your current circuit diagram using the form above to store it permanently in your browser.
              </p>
            </div>
          ) : (
            filtered.map((record) => {
              const compCount = record.data?.components?.length || 0;
              const wireCount = record.data?.wires?.length || 0;
              const formattedDate = new Date(record.savedAt).toLocaleString();

              return (
                <div
                  key={record.id}
                  id={`saved-slot-${record.id}`}
                  className={`p-3 rounded-xl transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group border ${
                    isLight
                      ? 'bg-slate-50 hover:bg-slate-100/80 border-slate-200 hover:border-slate-300 text-slate-800'
                      : 'bg-[#080f14] hover:bg-[#0d171f] border-[#A58D66]/20 hover:border-[#A58D66]/50 text-[#E5E1DD]'
                  }`}
                >
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`font-bold text-xs sm:text-sm truncate ${isLight ? 'text-slate-900' : 'text-[#E5E1DD]'}`}>
                        {record.name}
                      </span>
                      {record.isAutosave && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#A58D66]/20 text-[#DFCCA8] border border-[#A58D66]/30 font-medium shrink-0">
                          Auto-Save Slot
                        </span>
                      )}
                    </div>

                    {record.description && (
                      <p className={`text-[11px] line-clamp-1 ${isLight ? 'text-slate-600' : 'text-[#E5E1DD]/60'}`}>
                        {record.description}
                      </p>
                    )}

                    <div className={`flex items-center gap-3 text-[10px] font-mono ${isLight ? 'text-[#E5E1DD]/45' : 'text-[#E5E1DD]/45'}`}>
                      <span className="flex items-center gap-1">
                        <Cpu className={`w-3 h-3 ${isLight ? 'text-[#E5E1DD]/45' : 'text-[#E5E1DD]/60'}`} />
                        {compCount} {compCount === 1 ? 'Gate' : 'Gates'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Zap className={`w-3 h-3 ${isLight ? 'text-[#E5E1DD]/45' : 'text-[#E5E1DD]/60'}`} />
                        {wireCount} {wireCount === 1 ? 'Wire' : 'Wires'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className={`w-3 h-3 ${isLight ? 'text-[#E5E1DD]/45' : 'text-[#E5E1DD]/60'}`} />
                        {formattedDate}
                      </span>
                    </div>
                  </div>

                  {/* Actions for this slot */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleLoadCircuit(record)}
                      className="px-3 py-1.5 bg-[#A58D66] hover:bg-[#DFCCA8] text-[#080f14] border border-[#A58D66]/30 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                      title="Load this circuit into canvas"
                    >
                      <FolderOpen className="w-3.5 h-3.5" />
                      <span>Load</span>
                    </button>

                    {!record.isAutosave && (
                      <button
                        onClick={() => handleOverwrite(record.id)}
                        className={`px-2.5 py-1.5 border rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                          isLight
                            ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                            : 'bg-[#080f14] hover:bg-[#0d171f] text-[#DFCCA8] hover:text-[#E5E1DD] border-[#A58D66]/20'
                        }`}
                        title="Overwrite this slot with current canvas"
                      >
                        Overwrite
                      </button>
                    )}

                    <button
                      onClick={() => handleExportRecord(record)}
                      className={`p-1.5 border rounded-lg transition-colors cursor-pointer ${
                        isLight
                          ? 'bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-300'
                          : 'bg-[#080f14] hover:bg-[#0d171f] text-[#E5E1DD]/60 hover:text-[#E5E1DD] border-[#A58D66]/20'
                      }`}
                      title="Download JSON"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleDeleteSlot(record.id, record.isAutosave)}
                      className="p-1.5 bg-[#A58D66]/10 hover:bg-[#A58D66]/25 text-[#DFCCA8] rounded-lg transition-colors border border-[#A58D66]/20 cursor-pointer"
                      title="Delete this saved slot"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Credit & Status */}
        <div
          className={`p-3 border-t flex flex-col sm:flex-row items-center justify-between text-xs gap-2 transition-colors ${
            isLight ? 'bg-slate-50 border-slate-200 text-[#E5E1DD]/45' : 'bg-[#080f14] border-[#A58D66]/20 text-[#E5E1DD]/60'
          }`}
        >
          <div className="flex flex-wrap items-center gap-2">
            <span className={`text-[11px] font-medium ${isLight ? 'text-slate-600' : 'text-[#E5E1DD]/60'}`}>
              Crafted with passion and precision by <strong className="text-[#A58D66]">Team KITT</strong>
            </span>
          </div>

          <button
            onClick={() => setActiveModal('none')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              isLight ? 'bg-slate-200 hover:bg-slate-300 text-slate-800' : 'bg-[#0d171f] hover:bg-[#080f14] text-[#E5E1DD]'
            }`}
          >
            Close
          </button>
        </div>

        {/* Toast alert */}
        {feedback && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#080f14] border border-[#A58D66] text-[#DFCCA8] text-xs px-4 py-2 rounded-xl shadow-2xl flex items-center gap-2 animate-fade-in font-semibold">
            <Check className="w-4 h-4 text-[#A58D66]" />
            <span>{feedback}</span>
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Trash2, RotateCcw, AlertTriangle, Layers, Clock } from 'lucide-react';
import { KittProject } from '../state/projectStore';

interface TrashViewProps {
  trashedProjects: KittProject[];
  onRestoreProject: (projectId: string) => void;
  onDeletePermanently: (projectId: string) => void;
  onEmptyTrash: () => void;
}

export const TrashView: React.FC<TrashViewProps> = ({
  trashedProjects,
  onRestoreProject,
  onDeletePermanently,
  onEmptyTrash
}) => {
  const [confirmEmpty, setConfirmEmpty] = useState(false);

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 font-sans max-w-5xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold font-mono text-[#E5E1DD]">Trash</h1>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-white/10 text-slate-400">
              {trashedProjects.length} items
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Projects placed in trash can be restored at any time or permanently deleted.
          </p>
        </div>

        {trashedProjects.length > 0 && (
          <div>
            {!confirmEmpty ? (
              <button
                onClick={() => setConfirmEmpty(true)}
                className="px-3.5 py-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 font-mono text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Empty trash</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    onEmptyTrash();
                    setConfirmEmpty(false);
                  }}
                  className="px-3.5 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-mono text-xs font-bold transition-colors cursor-pointer"
                >
                  Confirm Delete All
                </button>
                <button
                  onClick={() => setConfirmEmpty(false)}
                  className="px-3 py-2 rounded-lg bg-white/5 text-slate-400 text-xs font-mono hover:text-white"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      {trashedProjects.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/10 bg-[#0c161d]/30 p-16 text-center">
          <Trash2 className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-sm font-mono text-slate-300 font-bold">Trash is empty</p>
          <p className="text-xs text-slate-500 mt-1">No discarded circuits or prototypes.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {trashedProjects.map(proj => (
            <div
              key={proj.id}
              className="p-4 rounded-xl bg-[#0c161d] border border-white/10 hover:border-white/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2.5">
                  <h3 className="text-sm font-bold font-mono text-[#E5E1DD] truncate">
                    {proj.name}
                  </h3>
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded uppercase font-semibold ${
                    proj.mode === 'schematic' ? 'bg-[#A58D66]/20 text-[#DFCCA8]' : 'bg-[#407E8C]/20 text-[#22d3ee]'
                  }`}>
                    {proj.mode}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-400 font-mono mt-1">
                  <span>{proj.circuit.components.length} components</span>
                  <span>•</span>
                  <span>Moved to trash {proj.trashedAt ? new Date(proj.trashedAt).toLocaleDateString() : 'recently'}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => onRestoreProject(proj.id)}
                  className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-[#E5E1DD] text-xs font-mono font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-[#10b981]" />
                  <span>Restore</span>
                </button>
                <button
                  onClick={() => onDeletePermanently(proj.id)}
                  className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-mono transition-colors cursor-pointer"
                >
                  Delete permanently
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

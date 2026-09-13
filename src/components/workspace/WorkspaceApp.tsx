import React, { useState } from 'react';
import { ArrowLeft, ExternalLink, RefreshCw } from 'lucide-react';

export function WorkspaceApp() {
  const workspaceUrl = 'https://workspace-dge.pages.dev/';
  const [iframeKey, setIframeKey] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const handleBackToLanding = () => {
    window.location.hash = '#/';
  };

  const handleReload = () => {
    setIsLoading(true);
    setIframeKey((prev) => prev + 1);
  };

  return (
    <div className="relative w-screen h-screen bg-[#070c14] overflow-hidden flex flex-col select-none">
      {/* Top Navigation Bar */}
      <header className="h-12 bg-[#0b1320]/95 border-b border-cyan-900/40 px-4 flex items-center justify-between z-30 shrink-0 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button
            onClick={handleBackToLanding}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono text-cyan-300 hover:text-white bg-cyan-950/50 hover:bg-cyan-900/60 border border-cyan-800/50 transition-all shadow-sm group cursor-pointer"
            title="Return to THE KIT Ecosystem Landing Page"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to Ecosystem</span>
          </button>

          <div className="h-4 w-px bg-cyan-900/40 hidden sm:block" />

          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-mono font-semibold text-slate-200 tracking-wide">
              KITT DESIGNING WORKSPACE
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleReload}
            className="p-1.5 text-slate-400 hover:text-cyan-300 hover:bg-cyan-950/40 rounded-lg transition-colors border border-transparent hover:border-cyan-800/40 cursor-pointer"
            title="Reload Workspace"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
          </button>

          <a
            href={workspaceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono text-slate-300 hover:text-white bg-slate-800/60 hover:bg-cyan-900/40 border border-slate-700/50 hover:border-cyan-700/50 transition-colors"
            title="Open in new window"
          >
            <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Open in New Tab</span>
          </a>
        </div>
      </header>

      {/* Main Workspace Frame */}
      <main className="relative flex-1 w-full h-full bg-[#050910] overflow-hidden">
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#070c14] z-20 gap-3">
            <div className="w-9 h-9 border-2 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin" />
            <p className="text-xs font-mono text-cyan-300/80 tracking-wider">
              CONNECTING TO DESIGNING WORKSPACE...
            </p>
          </div>
        )}

        <iframe
          key={iframeKey}
          src={workspaceUrl}
          title="Designing Workshop"
          className="w-full h-full border-0"
          onLoad={() => setIsLoading(false)}
          allow="accelerometer; autoplay; camera; clipboard-read; clipboard-write; encrypted-media; fullscreen; geolocation; gyroscope; microphone; midi; payment; picture-in-picture; screen-wake-lock; web-share"
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals allow-downloads allow-top-navigation-by-user-activation"
        />
      </main>
    </div>
  );
}

export default WorkspaceApp;

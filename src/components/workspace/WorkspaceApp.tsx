import React, { useState } from 'react';
import { ArrowLeft, ExternalLink, RefreshCw } from 'lucide-react';

export function WorkspaceApp() {
  const workspaceUrl = 'https://workspace-dge.pages.dev/';
  const [iframeKey, setIframeKey] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);

  const handleBackToLanding = () => {
    window.location.hash = '#/';
  };

  const handleReload = () => {
    setIsLoading(true);
    setHasError(false);
    setIframeKey((prev) => prev + 1);
  };

  React.useEffect(() => {
    const timer = setTimeout(() => {
      // If still loading after 8s, mark as slow/blocked
      if (isLoading) {
        setIsLoading(false);
      }
    }, 8000);
    return () => clearTimeout(timer);
  }, [iframeKey, isLoading]);

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
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono text-cyan-200 hover:text-white bg-cyan-950/70 hover:bg-cyan-900/80 border border-cyan-700/60 transition-colors shadow-sm"
            title="Open in new window"
          >
            <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
            <span>Open in New Tab</span>
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

        {hasError ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#070c14] z-20 gap-4 p-6 text-center">
            <div className="w-12 h-12 rounded-2xl bg-cyan-950/40 border border-cyan-800/40 flex items-center justify-center text-cyan-400">
              <ExternalLink className="w-6 h-6" />
            </div>
            <div className="max-w-md space-y-2">
              <h3 className="text-sm font-mono font-bold text-slate-200 uppercase tracking-wider">
                External Frame Shield Active
              </h3>
              <p className="text-xs text-slate-400 font-serif leading-relaxed">
                Your browser or network policy restricts embedded cross-origin sandboxes. Open the Designing Workspace directly in its sovereign tab for full hardware acceleration.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <a
                href={workspaceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl text-xs font-mono font-medium text-white bg-cyan-600 hover:bg-cyan-500 border border-cyan-400/40 transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)] flex items-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Launch Workspace Sovereign Tab</span>
              </a>
              <button
                onClick={handleReload}
                className="px-3.5 py-2 rounded-xl text-xs font-mono text-cyan-300 hover:text-white bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-800/50 transition-colors"
              >
                Retry Frame
              </button>
            </div>
          </div>
        ) : (
          <iframe
            key={iframeKey}
            src={workspaceUrl}
            title="Designing Workshop"
            className="w-full h-full border-0"
            onLoad={() => setIsLoading(false)}
            onError={() => {
              setIsLoading(false);
              setHasError(true);
            }}
            allow="accelerometer; autoplay; camera; clipboard-read; clipboard-write; encrypted-media; fullscreen; geolocation; gyroscope; microphone; midi; payment; picture-in-picture; screen-wake-lock; web-share"
          />
        )}
      </main>
    </div>
  );
}

export default WorkspaceApp;

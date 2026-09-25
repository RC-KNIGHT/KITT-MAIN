import React, { Component, ErrorInfo, ReactNode } from 'react';
import { RefreshCw, AlertTriangle, Home } from 'lucide-react';
import { KittLogo } from './KittLogo';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class RootErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[KITT KERNEL] Uncaught render exception intercepted:', error, errorInfo);
  }

  private handleReset = () => {
    try {
      localStorage.removeItem('kitt_active_circuit');
      sessionStorage.clear();
    } catch {}
    this.setState({ hasError: false, error: null });
    window.location.hash = '#/';
    window.location.reload();
  };

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full bg-[#080f14] text-[#E5E1DD] flex items-center justify-center p-4 selection:bg-[#407E8C]/40">
          <div className="max-w-md w-full bg-[#0c161d] border border-[#A58D66]/40 rounded-2xl p-6 shadow-2xl space-y-5 text-center">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-[#A58D66]/15 border border-[#A58D66]/40 flex items-center justify-center text-[#A58D66]">
              <KittLogo size={36} showGlow={true} />
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[11px] font-mono uppercase tracking-wider">
                <AlertTriangle className="w-3 h-3" />
                <span>Safety Guard Intercepted</span>
              </div>
              <h2 className="text-xl font-bold font-cinzel text-[#E5E1DD]">
                Session State Preserved
              </h2>
              <p className="text-xs text-[#E5E1DD]/70 font-light leading-relaxed">
                An unexpected view state was intercepted by KITT's resilience layer. Your project data and circuit states remain safely preserved.
              </p>
              {this.state.error?.message && (
                <div className="p-2.5 rounded-lg bg-red-950/40 border border-red-500/20 text-[11px] font-mono text-red-300 text-left overflow-x-auto max-h-24">
                  {this.state.error.message}
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={this.handleReset}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-[#A58D66] hover:bg-[#bfa378] text-[#080f14] font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Return to Ecosystem</span>
              </button>

              <button
                onClick={this.handleReload}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-[#E5E1DD] border border-white/10 font-medium text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5 text-[#407E8C]" />
                <span>Reload Page</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public override state: State = {
    hasError: false,
    error: null,
  };

  constructor(props: Props) {
    super(props);
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public override render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center w-full h-full p-6 text-center bg-[#080f14] text-[#E5E1DD]">
          <div className="p-4 bg-[#A58D66]/10 border border-[#A58D66]/30 rounded-2xl max-w-md w-full shadow-2xl flex flex-col items-center gap-3">
            <div className="p-3 bg-[#A58D66]/20 rounded-full text-[#A58D66]">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-[#E5E1DD]">
              {this.props.fallbackTitle || 'Canvas Rendering Recovered'}
            </h3>
            <p className="text-xs text-[#E5E1DD]/70 leading-relaxed">
              A temporary layout or render mismatch was safely intercepted.
            </p>
            <button
              onClick={this.handleReset}
              className="mt-2 flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#A58D66] to-[#8C7654] hover:from-[#BFA378] hover:to-[#A58D66] text-[#080f14] text-xs font-bold rounded-xl transition-all shadow-lg shadow-[#A58D66]/30 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Resume Canvas</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

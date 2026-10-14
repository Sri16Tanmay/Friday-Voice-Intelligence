import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Secure diagnostic logging without leaking to production UI
    if (process.env.NODE_ENV !== 'production') {
      console.error('FRIDAY ErrorBoundary caught an exception:', error, errorInfo);
    }
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    } else {
      window.location.reload();
    }
  };

  private handleGoHome = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[420px] w-full flex items-center justify-center p-6 bg-[#073B2A]/5 rounded-2xl border border-[rgba(201,164,92,0.3)] my-6">
          <div className="max-w-md w-full text-center space-y-4 p-8 bg-[#0C4A36] text-[#F7F3E9] rounded-2xl shadow-xl border border-[rgba(201,164,92,0.4)]">
            <div className="w-14 h-14 mx-auto rounded-xl bg-[#062C21] border border-[rgba(201,164,92,0.4)] flex items-center justify-center text-[#C9A45C]">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-xl font-serif font-bold text-[#F7F3E9]">
                {this.props.fallbackTitle || 'Component Processing Isolated'}
              </h3>
              <p className="text-xs text-[#96ACA0] leading-relaxed">
                FRIDAY detected an unexpected condition in this section and isolated the operation to prevent application interruption.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-[#062C21]/90 border border-[rgba(201,164,92,0.2)] text-[11px] font-mono text-[#C9A45C] text-left overflow-x-auto">
              Diagnostic Status: Isolated Exception Handled Gracefully
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={this.handleReset}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#073B2A] hover:bg-[#0E573F] text-[#F7F3E9] text-xs font-sans font-semibold border border-[rgba(201,164,92,0.4)] transition-colors cursor-pointer shadow-sm"
              >
                <RotateCcw className="w-3.5 h-3.5 text-[#C9A45C]" />
                <span>Recover Section</span>
              </button>

              <button
                onClick={this.handleGoHome}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#062C21] hover:bg-[#073B2A] text-[#96ACA0] hover:text-[#F7F3E9] text-xs font-sans font-medium border border-[rgba(201,164,92,0.2)] transition-colors cursor-pointer"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Overview</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

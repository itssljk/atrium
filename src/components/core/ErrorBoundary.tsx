"use client";
import React from "react";
interface Props {
    children: React.ReactNode;
    fallback?: React.ReactNode;
}
interface State {
    hasError: boolean;
}
export class ErrorBoundary extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }
    static getDerivedStateFromError(): State {
        return { hasError: true };
    }
    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error("ErrorBoundary caught an error:", error, errorInfo);
    }
    render() {
        if (this.state.hasError) {
            return this.props.fallback ?? (<div className="min-h-screen w-full flex items-center justify-center bg-[#030307]">
          <div className="flex flex-col items-center gap-4 text-center p-8">
            <div className="w-12 h-12 rounded-full bg-[var(--accent)]/10 flex items-center justify-center">
              <span className="text-[var(--accent)] text-xl font-light">!</span>
            </div>
            <h2 className="text-lg font-light text-[var(--foreground)]/80">Something went wrong</h2>
            <p className="text-sm text-[var(--foreground)]/50 max-w-md">
              An unexpected error occurred. Try refreshing the page.
            </p>
            <button onClick={() => window.location.reload()} className="mt-2 px-4 py-2 rounded-lg bg-[var(--accent)] text-[var(--background)] text-sm font-medium hover:opacity-90 transition-opacity cursor-pointer">
              Refresh
            </button>
          </div>
        </div>);
        }
        return this.props.children;
    }
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { RotateCcw } from 'lucide-react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

/**
 * Calm, on-brand error boundary. If any component below it throws, instead of
 * the whole app going blank we show a short, non-technical recovery message
 * with a reload action. Text stays left-aligned and indigo; the action is
 * burgundy to match the site's action colour.
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  declare props: ErrorBoundaryProps;
  declare state: ErrorBoundaryState;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
    const message = error instanceof Error ? error.message : '';
    return { hasError: true, message };
  }

  componentDidCatch(error: unknown, errorInfo: unknown) {
    console.error('[ErrorBoundary] Something went wrong:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div
        className="min-h-screen bg-[#faf8f5] text-[#1B0A3B] flex items-center justify-center p-6"
        id="error-boundary"
        role="alert"
      >
        <div className="max-w-md w-full text-left space-y-5">
          <h1 className="text-2xl font-semibold tracking-tight">A small hiccup</h1>
          <p className="text-base leading-relaxed opacity-85">
            Something interrupted this page. Nothing you wrote is lost — your
            reflections are saved safely on this device. You can simply reload
            to continue.
          </p>

          {this.state.message ? (
            <details className="text-xs opacity-60">
              <summary className="cursor-pointer">Technical details</summary>
              <p className="mt-2 whitespace-pre-wrap">{this.state.message}</p>
            </details>
          ) : null}

          <button
            type="button"
            onClick={this.handleReload}
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium rounded-full border border-[#912A4A]/40 text-[#912A4A] hover:bg-[#912A4A]/10 cursor-pointer transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Reload this page
          </button>
        </div>
      </div>
    );
  }
}

import { Component, type ErrorInfo, type ReactNode } from 'react';

import { Button } from '@/components/ui/button';

type ErrorBoundaryProps = {
  children: ReactNode;
  fallback?: ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
};

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('Unhandled UI error', error, info);
  }

  private handleRetry = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return <ErrorFallback onRetry={this.handleRetry} />;
    }

    return this.props.children;
  }
}

type ErrorFallbackProps = {
  onRetry?: () => void;
};

export function ErrorFallback({ onRetry }: ErrorFallbackProps) {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 bg-canvas p-6 text-center">
      <div className="bevel-plate w-full max-w-md overflow-hidden rounded-sm">
        <div className="section-label-bar">System error</div>
        <div className="bevel-inset px-5 py-6">
          <h1 className="label-chrome text-ink text-base">
            Something went wrong
          </h1>
          <p className="text-ink-soft mt-2 text-xs sm:text-sm">
            Please try again. If the problem continues, refresh the page.
          </p>
          {onRetry ? (
            <Button type="button" className="mt-5" onClick={onRetry}>
              Try again
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

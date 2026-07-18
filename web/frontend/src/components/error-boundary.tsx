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
    <div className="bg-canvas-dark text-on-dark flex min-h-svh flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="font-display text-[28px] tracking-[0.1px]">
        Something went wrong
      </h1>
      <p className="text-body-dark max-w-md text-lg leading-normal">
        Please try again. If the problem continues, refresh the page.
      </p>
      {onRetry ? (
        <Button type="button" onClick={onRetry}>
          Try again
        </Button>
      ) : null}
    </div>
  );
}

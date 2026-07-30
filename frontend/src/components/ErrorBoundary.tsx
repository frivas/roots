import React, { Component, ErrorInfo, ReactNode } from 'react';
import Button from './ui/Button';
import { RefreshCw, AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

const getErrorCopy = () => {
  let isSpanish = false;
  try {
    isSpanish = localStorage.getItem('selectedLanguage') === 'es-ES';
  } catch {
    // Use the English fallback when storage is unavailable.
  }

  return isSpanish ? {
    title: 'Algo salió mal',
    description: 'La página encontró un error y no pudo cargarse correctamente.',
    details: 'Detalles del error',
    retry: 'Intentar de nuevo',
    home: 'Ir al inicio',
  } : {
    title: 'Something went wrong',
    description: 'The page encountered an error and couldn\'t load properly.',
    details: 'Error Details',
    retry: 'Try Again',
    home: 'Go to Home',
  };
};

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error boundary caught an error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const copy = getErrorCopy();
      return (
        <div role="alert" aria-live="assertive" className="flex items-center justify-center min-h-screen bg-background p-4">
          <div className="max-w-md mx-auto text-center space-y-4">
            <div className="flex justify-center">
              <AlertTriangle className="h-12 w-12 text-error" />
            </div>

            <h2 className="text-xl font-semibold text-foreground">
              {copy.title}
            </h2>

            <p className="text-muted-foreground">
              {copy.description}
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="text-left bg-muted p-4 rounded-md text-sm">
                <summary className="cursor-pointer font-medium">{copy.details}</summary>
                <pre className="mt-2 text-xs overflow-auto">
                  {this.state.error.toString()}
                </pre>
              </details>
            )}

            <div className="flex gap-2 justify-center">
              <Button
                onClick={() => {
                  this.setState({ hasError: false, error: undefined });
                }}
                variant="outline"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                {copy.retry}
              </Button>

              <Button
                onClick={() => {
                  window.location.href = '/home';
                }}
              >
                {copy.home}
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

import { ClerkProvider } from '@clerk/clerk-react';
import type { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { APP_ROUTES } from '../config/routes';
import AuthLayout from './layout/AuthLayout';
import ErrorBoundary from './ErrorBoundary';
import TranslatedText from './TranslatedText';

const ClerkUnavailable = () => {
  const { pathname } = useLocation();
  const isRegistration = pathname === APP_ROUTES.authRegister;
  const isAuthRoute =
    pathname === APP_ROUTES.authLogin || isRegistration;

  const message = (
    <div role="alert" aria-live="assertive" className="space-y-3 text-center">
      <h2 className="text-2xl font-bold text-foreground">
        <TranslatedText>
          {isRegistration ? 'Create your account' : 'Sign in'}
        </TranslatedText>
      </h2>
      <p className="text-muted-foreground">
        <TranslatedText>
          Authentication is temporarily unavailable. Please try again later.
        </TranslatedText>
      </p>
    </div>
  );

  if (isAuthRoute) {
    return <AuthLayout>{message}</AuthLayout>;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      {message}
    </div>
  );
};

interface ClerkRuntimeBoundaryProps {
  children: ReactNode;
  publishableKey: string;
}

const ClerkRuntimeBoundary = ({
  children,
  publishableKey,
}: ClerkRuntimeBoundaryProps) => (
  <ErrorBoundary fallback={<ClerkUnavailable />}>
    <ClerkProvider publishableKey={publishableKey}>
      {children}
    </ClerkProvider>
  </ErrorBoundary>
);

export default ClerkRuntimeBoundary;

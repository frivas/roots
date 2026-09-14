import { ClerkProvider } from '@clerk/clerk-react';
import type { ReactNode } from 'react';
import { useLocation } from 'react-router';
import { APP_ROUTES, requiresClerkRuntime } from '../config/routes';
import AuthLayout from './layout/AuthLayout';
import ErrorBoundary from './ErrorBoundary';
import TranslatedText from './TranslatedText';
import { useLingoTranslation } from '../contexts/LingoTranslationContext';

const spanishClerkLocalization = {
  signIn: {
    start: {
      title: 'Iniciar sesión',
      subtitle: 'para continuar a Raíces',
      actionText: '¿No tiene una cuenta?',
      actionLink: 'Crear cuenta',
    },
  },
  signUp: {
    start: {
      title: 'Crear cuenta',
      subtitle: 'para continuar a Raíces',
      actionText: '¿Ya tiene una cuenta?',
      actionLink: 'Iniciar sesión',
    },
  },
  formFieldLabel__emailAddress: 'Correo electrónico',
  formFieldLabel__password: 'Contraseña',
  formButtonPrimary: 'Continuar',
  dividerText: 'o',
} as const;

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
}: ClerkRuntimeBoundaryProps) => {
  const { language } = useLingoTranslation();
  const { pathname } = useLocation();

  if (!requiresClerkRuntime(pathname)) return children;

  return (
    <ErrorBoundary fallback={<ClerkUnavailable />}>
      <ClerkProvider
        publishableKey={publishableKey}
        localization={language === 'es-ES' ? spanishClerkLocalization : undefined}
      >
        {children}
      </ClerkProvider>
    </ErrorBoundary>
  );
};

export default ClerkRuntimeBoundary;

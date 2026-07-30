import React from 'react';
import { SignIn, SignUp } from '@clerk/clerk-react';
import useClerkLocalization from '../hooks/useClerkLocalization';
import ErrorBoundary from './ErrorBoundary';
import TranslatedText from './TranslatedText';

interface ClerkAuthWrapperProps {
  type: 'signIn' | 'signUp';
  routing?: 'path' | 'virtual';
  path?: string;
  forceRedirectUrl: string;
}

const ClerkAuthWrapper: React.FC<ClerkAuthWrapperProps> = ({
  type,
  routing = 'virtual',
  path,
  forceRedirectUrl
}) => {
  // Use the improved localization hook that doesn't interfere with Google sign-in
  useClerkLocalization();

  // Madrid styling with improved form behavior
  const appearance = {
    elements: {
      formButtonPrimary: "bg-primary hover:bg-primary/90 text-primary-foreground font-bold font-[Arial,Helvetica,sans-serif] border-0 rounded-md transition-colors",
      socialButtonsBlockButton: "border border-border text-foreground hover:bg-muted font-[Arial,Helvetica,sans-serif] rounded-md transition-colors",
      formFieldInput: "border border-border font-[Arial,Helvetica,sans-serif] focus:border-primary focus:ring-1 focus:ring-primary rounded-md transition-all",
      headerTitle: "font-bold text-foreground font-[Arial,Helvetica,sans-serif] text-2xl",
      headerSubtitle: "text-muted-foreground font-[Arial,Helvetica,sans-serif]",
      footerActionLink: "text-primary hover:text-primary/80 font-[Arial,Helvetica,sans-serif] font-medium transition-colors",
      card: "shadow-none border-none bg-transparent",
      main: "font-[Arial,Helvetica,sans-serif]",
      dividerLine: "bg-border",
      dividerText: "text-muted-foreground font-[Arial,Helvetica,sans-serif]",
      formFieldLabel: "text-foreground font-medium font-[Arial,Helvetica,sans-serif]",
      identityPreviewText: "font-[Arial,Helvetica,sans-serif]",
      identityPreviewEditButton: "text-primary hover:text-primary/80 font-[Arial,Helvetica,sans-serif] transition-colors",
      footerActionText: "text-muted-foreground font-[Arial,Helvetica,sans-serif]"
    },
    layout: {
      animations: true,
      showOptionalFields: false
    }
  };

  const unavailableFallback = (
    <div role="alert" aria-live="assertive" className="space-y-3 text-center">
      <h2 className="text-2xl font-bold text-foreground">
        <TranslatedText>
          {type === 'signIn' ? 'Sign in' : 'Create your account'}
        </TranslatedText>
      </h2>
      <p className="text-muted-foreground">
        <TranslatedText>
          Authentication is temporarily unavailable. Please try again later.
        </TranslatedText>
      </p>
    </div>
  );

  if (type === 'signIn') {
    if (routing === 'path' && path) {
      return (
        <ErrorBoundary fallback={unavailableFallback}>
          <SignIn
            forceRedirectUrl={forceRedirectUrl}
            appearance={appearance}
            routing="path"
            path={path}
            initialValues={{ emailAddress: "" }}
          />
        </ErrorBoundary>
      );
    }
    return (
      <ErrorBoundary fallback={unavailableFallback}>
        <SignIn
          forceRedirectUrl={forceRedirectUrl}
          appearance={appearance}
          routing="virtual"
          initialValues={{ emailAddress: "" }}
        />
      </ErrorBoundary>
    );
  }

  if (routing === 'path' && path) {
    return (
      <ErrorBoundary fallback={unavailableFallback}>
        <SignUp
          forceRedirectUrl={forceRedirectUrl}
          appearance={appearance}
          routing="path"
          path={path}
          initialValues={{ emailAddress: "", username: "" }}
        />
      </ErrorBoundary>
    );
  }
  return (
    <ErrorBoundary fallback={unavailableFallback}>
      <SignUp
        forceRedirectUrl={forceRedirectUrl}
        appearance={appearance}
        routing="virtual"
        initialValues={{ emailAddress: "", username: "" }}
      />
    </ErrorBoundary>
  );
};

export default ClerkAuthWrapper;

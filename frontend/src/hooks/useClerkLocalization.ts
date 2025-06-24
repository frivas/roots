import { useEffect } from 'react';
import { useLingoTranslation } from '../contexts/LingoTranslationContext';

const useClerkLocalization = () => {
  const { language } = useLingoTranslation();

  useEffect(() => {
    // Translation mappings (English ↔ Spanish)
    const translations: Record<string, string> = {
      'Sign in': 'Iniciar sesión',
      'Sign up': 'Crear cuenta',
      'Enter your password': 'Introduce tu contraseña',
      'to continue to Raíces': 'para ir a Raíces',
      'to continue to roots': 'to continue to Raíces',
      'Continue with Google': 'Continuar con Google',
      'Email address or username': 'Correo electrónico o nombre de usuario',
      'Password': 'Contraseña',
      'CONTINUE': 'CONTINUAR',
      'Continue': 'Continuar',
      'No account?': '¿No tienes cuenta?',
      "Don't have an account?": '¿No tienes una cuenta?',
      'Already have an account?': '¿Ya tienes una cuenta?',
      'Forgot password?': '¿Olvidaste tu contraseña?',
      'Forgot your password?': '¿Olvidaste tu contraseña?',
      'Use another method': 'Usar otro método',
      'or': 'o',
      'Back': 'Atrás',
      'Try again': 'Intentar de nuevo',
      'Cancel': 'Cancelar',
      'Verify': 'Verificar',
      'Enter code': 'Introducir código',
      'Resend': 'Reenviar',
      'Check your email': 'Revisa tu correo electrónico',
      'We sent a code to': 'Enviamos un código a'
    };

    // Create reverse mapping (Spanish → English)
    const reverseTranslations: Record<string, string> = Object.fromEntries(
      Object.entries(translations).map(([english, spanish]) => [spanish, english])
    );

    // Very conservative function that only translates when auth is stable
    const replaceText = () => {
      setTimeout(() => {
        const clerkContainer = document.querySelector('.clerk-auth-madrid');
        if (!clerkContainer) return;

        // Check for signs of active authentication or loading states
        const hasActiveAuth = !!(
          clerkContainer.querySelector('button[disabled]') ||
          clerkContainer.querySelector('.cl-loading') ||
          clerkContainer.querySelector('[data-loading]') ||
          document.querySelector('body[data-clerk-loading]') ||
          window.location.pathname.includes('/factor-') ||
          window.location.pathname.includes('/verify') ||
          window.location.pathname.includes('/reset') ||
          clerkContainer.querySelector('.cl-card')?.children.length === 0
        );

        // Don't translate during active authentication or complex flows
        if (hasActiveAuth) {
          console.log('🔒 Skipping translation during active auth or complex flow');
          return;
        }

        const targetTranslations = language === 'es-ES' ? translations : reverseTranslations;

        // Only translate static text elements that are clearly safe
        const safeSelectors = [
          '.cl-headerTitle',
          '.cl-headerSubtitle',
          '.cl-footerActionText',
          '.cl-footerActionLink',
          'label[for]',
          'h1:not([role])',
          'h2:not([role])',
          'p:not([role]):not([class*="button"])'
        ];

        safeSelectors.forEach(selector => {
          const elements = clerkContainer.querySelectorAll(selector);
          elements.forEach(el => {
            const text = el.textContent?.trim();
            if (text && targetTranslations[text]) {
              el.textContent = targetTranslations[text];
            }
          });
        });

        // Very carefully target only specific link elements for "Forgot password"
        const forgotPasswordLinks = clerkContainer.querySelectorAll('a[href*="forgot"]');
        forgotPasswordLinks.forEach(el => {
          const text = el.textContent?.trim();
          if (text && targetTranslations[text]) {
            el.textContent = targetTranslations[text];
          }
        });

        // Handle the specific "to continue to roots" case very carefully
        const textNodes = clerkContainer.querySelectorAll('p, span:not([role]):not([class*="button"])');
        textNodes.forEach(el => {
          if (el.children.length === 0 && el.textContent?.includes('to continue to roots')) {
            const newText = language === 'es-ES'
              ? el.textContent.replace('to continue to roots', 'para ir a Raíces')
              : el.textContent.replace('to continue to roots', 'to continue to Raíces');
            el.textContent = newText;
          }
        });
      }, 250);
    };

    // Only do initial translation, avoid continuous monitoring during auth
    replaceText();

    // Much more limited observer - only for major DOM changes
    const observer = new MutationObserver((mutations) => {
      // Only react to significant changes and not during auth flows
      const shouldUpdate = mutations.some(mutation =>
        mutation.type === 'childList' &&
        mutation.addedNodes.length > 0 &&
        !document.querySelector('.clerk-auth-madrid button[disabled]')
      );

      if (shouldUpdate) {
        console.log('🔄 Clerk content changed, re-translating');
        replaceText();
      }
    });

    const clerkContainer = document.querySelector('.clerk-auth-madrid');
    if (clerkContainer) {
      observer.observe(clerkContainer, {
        childList: true
        // Removed subtree to be less invasive
      });
    }

    // Minimal periodic check, only when auth is stable
    const intervalId = setInterval(() => {
      const hasAuthActivity = !!(
        document.querySelector('.clerk-auth-madrid button[disabled]') ||
        document.querySelector('.clerk-auth-madrid .cl-loading') ||
        document.querySelector('body[data-clerk-loading]')
      );

      if (!hasAuthActivity) {
        replaceText();
      }
    }, 5000);

    // Cleanup
    return () => {
      observer.disconnect();
      clearInterval(intervalId);
    };
  }, [language]);
};

export default useClerkLocalization;

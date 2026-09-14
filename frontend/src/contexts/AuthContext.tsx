import React, { createContext, useCallback, useContext, useEffect, useMemo } from 'react';
import { useAuth as useClerkAuth, useUser } from '@clerk/clerk-react';
import { useLocation, useNavigate } from 'react-router';
import { APP_ROUTES } from '../config/routes';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  userId: string | null;
  userRole: string | null;
  userEmail: string | null;
  getToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const publicPaths = new Set<string>([
  APP_ROUTES.privacyPolicy,
  APP_ROUTES.termsOfService,
  APP_ROUTES.cookiesPolicy,
]);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isLoaded, isSignedIn, getToken } = useClerkAuth();
  const { user } = useUser();
  const navigate = useNavigate();
  const location = useLocation();

  // Get the user role from public metadata
  const userRole = user?.publicMetadata?.role as string | undefined;
  
  // Handle authentication state changes
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      const authLanguage = localStorage.getItem('authSelectedLanguage');
      if (authLanguage === 'en-US' || authLanguage === 'es-ES') {
        localStorage.setItem('selectedLanguage', authLanguage);
        localStorage.removeItem('authSelectedLanguage');
        window.dispatchEvent(new CustomEvent('languageChanged', {
          detail: { language: authLanguage }
        }));
      }
    }
  }, [isLoaded, isSignedIn]);

  useEffect(() => {
    if (
      isLoaded &&
      !isSignedIn &&
      !location.pathname.startsWith('/auth') &&
      !publicPaths.has(location.pathname)
    ) {
      navigate(APP_ROUTES.authLogin);
    }
  }, [isLoaded, isSignedIn, location.pathname, navigate]);

  const getAuthToken = useCallback(async () => {
    try {
      return await getToken();
    } catch (error) {
      console.error('Failed to get token:', error);
      return null;
    }
  }, [getToken]);

  const value = useMemo<AuthContextType>(() => ({
    isAuthenticated: !!isSignedIn,
    isLoading: !isLoaded,
    userId: user?.id || null,
    userRole: userRole || 'user',
    userEmail: user?.primaryEmailAddress?.emailAddress || null,
    getToken: getAuthToken,
  }), [getAuthToken, isLoaded, isSignedIn, user?.id, user?.primaryEmailAddress?.emailAddress, userRole]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

import React, { createContext, useContext, useEffect } from 'react';
import { useAuth as useClerkAuth, useUser } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  userId: string | null;
  userRole: string | null;
  userEmail: string | null;
  getToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isLoaded, isSignedIn, getToken } = useClerkAuth();
  const { user } = useUser();
  const navigate = useNavigate();

  // Get the user role from public metadata
  const userRole = user?.publicMetadata?.role as string | undefined;
  
  // Handle authentication state changes
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      // User just logged in - check for auth language preference with a small delay
      setTimeout(() => {
        const authLanguage = localStorage.getItem('authSelectedLanguage');
        if (authLanguage === 'en-US' || authLanguage === 'es-ES') {
          console.log(`🔐 User authenticated with auth language: ${authLanguage}`);
          localStorage.setItem('selectedLanguage', authLanguage);
          localStorage.removeItem('authSelectedLanguage');
          
          // Dispatch language change event to update the context
          window.dispatchEvent(new CustomEvent('languageChanged', {
            detail: { language: authLanguage }
          }));
        }
      }, 500); // Small delay to ensure auth is fully complete
    }
  }, [isLoaded, isSignedIn]);

  // Handle navigation redirects separately to avoid interference
  useEffect(() => {
    if (isLoaded && !isSignedIn && !window.location.pathname.startsWith('/auth')) {
      navigate('/auth/login');
    }
  }, [isLoaded, isSignedIn, navigate]);

  const value: AuthContextType = {
    isAuthenticated: !!isSignedIn,
    isLoading: !isLoaded,
    userId: user?.id || null,
    userRole: userRole || 'user',
    userEmail: user?.primaryEmailAddress?.emailAddress || null,
    getToken: async () => {
      try {
        return await getToken();
      } catch (error) {
        console.error('Failed to get token:', error);
        return null;
      }
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
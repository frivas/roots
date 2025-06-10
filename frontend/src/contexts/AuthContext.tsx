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
  
  useEffect(() => {
    // Redirect to login if not authenticated and not already on the auth pages
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
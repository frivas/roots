// @ts-nocheck
import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { 
  SignIn,
  SignUp,
  RedirectToSignIn,
  SignedIn,
  SignedOut 
} from '@clerk/clerk-react';

// Layouts
import MainLayout from './components/layout/MainLayout';
import AuthLayout from './components/layout/AuthLayout';
import ClerkAuthWrapper from './components/ClerkAuthWrapper';

// Lazy-loaded components
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Services = lazy(() => import('./pages/Services'));
const Messages = lazy(() => import('./pages/Messages'));
const Notifications = lazy(() => import('./pages/Notifications'));
const Settings = lazy(() => import('./pages/Settings'));
const Profile = lazy(() => import('./pages/Profile'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Loading component with better UX
const Loading = () => (
  <div className="flex items-center justify-center min-h-screen bg-background">
    <div className="flex flex-col items-center gap-4">
      <div className="animate-spin rounded-full h-12 w-12 border-2 border-muted border-t-primary"></div>
      <p className="text-sm text-muted-foreground animate-pulse">Loading...</p>
    </div>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <Suspense fallback={<Loading />}>
        <Routes>
          {/* Public routes */}
          <Route
            path="/"
            element={<Navigate to="/dashboard" replace />}
          />
          
          {/* Auth routes */}
          <Route
            path="/auth/login/*"
            element={
              <SignedOut>
                <AuthLayout>
                  <ClerkAuthWrapper 
                    type="signIn"
                    routing="path" 
                    path="/auth/login" 
                    redirectUrl="/dashboard"
                  />
                </AuthLayout>
              </SignedOut>
            }
          />
          
          <Route
            path="/auth/register/*"
            element={
              <SignedOut>
                <AuthLayout>
                  <ClerkAuthWrapper 
                    type="signUp"
                    routing="path" 
                    path="/auth/register" 
                    redirectUrl="/dashboard"
                  />
                </AuthLayout>
              </SignedOut>
            }
          />
          
          {/* Protected routes */}
          <Route
            path="/dashboard"
            element={
              <SignedIn>
                <MainLayout key="dashboard">
                  <Dashboard />
                </MainLayout>
              </SignedIn>
            }
          />
          
          <Route
            path="/services/*"
            element={
              <SignedIn>
                <MainLayout key="services">
                  <Services />
                </MainLayout>
              </SignedIn>
            }
          />
          
          <Route
            path="/messages/*"
            element={
              <SignedIn>
                <MainLayout key="messages">
                  <Messages />
                </MainLayout>
              </SignedIn>
            }
          />
          
          <Route
            path="/notifications"
            element={
              <SignedIn>
                <MainLayout key="notifications">
                  <Notifications />
                </MainLayout>
              </SignedIn>
            }
          />
          
          <Route
            path="/settings/*"
            element={
              <SignedIn>
                <MainLayout key="settings">
                  <Settings />
                </MainLayout>
              </SignedIn>
            }
          />
          
          <Route
            path="/profile"
            element={
              <SignedIn>
                <MainLayout key="profile">
                  <Profile />
                </MainLayout>
              </SignedIn>
            }
          />

          {/* Public legal pages */}
          <Route
            path="/privacy-policy"
            element={
              <MainLayout>
                <PrivacyPolicy />
              </MainLayout>
            }
          />
          
          {/* Catch unauthenticated users */}
          <Route
            path="/signin"
            element={<RedirectToSignIn redirectUrl="/dashboard" />}
          />
          
          {/* 404 route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </AuthProvider>
  );
}

export default App;
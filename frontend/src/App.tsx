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
const PersonalData = lazy(() => import('./pages/PersonalData'));
const PasswordChange = lazy(() => import('./pages/PasswordChange'));
const Profile = lazy(() => import('./pages/Profile'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Service Pages
const ParentWellness = lazy(() => import('./pages/services/ParentWellness'));
const ParentWellnessChat = lazy(() => import('./pages/services/ParentWellnessChat'));
const ExtraCurricular = lazy(() => import('./pages/services/ExtraCurricular'));
const ExtraCurricularSession = lazy(() => import('./pages/services/ExtraCurricularSession'));
const ChessCoachingSession = lazy(() => import('./pages/services/ChessCoachingSession'));
const MathTutoringSession = lazy(() => import('./pages/services/MathTutoringSession'));
const StorytellingSession = lazy(() => import('./pages/services/StorytellingSession'));
const LanguageLessonSession = lazy(() => import('./pages/services/LanguageLessonSession'));

// Placeholder components for new routes
const HomePlaceholder = lazy(() => import('./pages/placeholders/HomePlaceholder'));
const CommunicationsPlaceholder = lazy(() => import('./pages/placeholders/CommunicationsPlaceholder'));
const SchoolPlaceholder = lazy(() => import('./pages/placeholders/SchoolPlaceholder'));
const CalendarPlaceholder = lazy(() => import('./pages/placeholders/CalendarPlaceholder'));
const MyDataPlaceholder = lazy(() => import('./pages/placeholders/MyDataPlaceholder'));

// New component
import TutorInfo from './pages/TutorInfo';
const Schedule = lazy(() => import('./pages/Schedule'));
const Absences = lazy(() => import('./pages/Absences'));
const Activities = lazy(() => import('./pages/Activities'));
const AcademicHistory = lazy(() => import('./pages/AcademicHistory'));
const Documents = lazy(() => import('./pages/Documents'));

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
          <Route element={
            <SignedIn>
              <MainLayout />
            </SignedIn>
          }>
            {/* Redirect dashboard to home */}
            <Route path="/dashboard" element={<Navigate to="/home" replace />} />

            {/* Home section */}
            <Route path="/home" element={<Dashboard />} />
            <Route path="/home/schedule" element={<Schedule />} />
            <Route path="/home/absences" element={<Absences />} />
            <Route path="/home/activities" element={<Activities />} />
            <Route path="/home/history" element={<AcademicHistory />} />
            <Route path="/home/documents" element={<Documents />} />
            <Route path="/home/tutoring" element={<TutorInfo />} />
            <Route path="/home/*" element={<HomePlaceholder />} />

            {/* Our School section */}
            <Route path="/school/*" element={<SchoolPlaceholder />} />
            <Route path="/school/services" element={<Services />} />

            {/* Services section */}
            <Route path="/services" element={<Services />} />
            <Route path="/services/parent-wellness" element={<ParentWellness />} />
            <Route path="/services/parent-wellness-chat" element={<ParentWellnessChat />} />
            <Route path="/services/extra-curricular" element={<ExtraCurricular />} />
            <Route path="/services/extra-curricular-session/:activityType" element={<ExtraCurricularSession />} />
            <Route path="/services/chess-coaching-session" element={<ChessCoachingSession />} />
            <Route path="/services/math-tutoring-session" element={<MathTutoringSession />} />
            <Route path="/services/storytelling-session" element={<StorytellingSession />} />
            <Route path="/services/language-lesson-session" element={<LanguageLessonSession />} />
            <Route path="/services/*" element={<Services />} />

            {/* Communications section */}
            <Route path="/communications" element={<CommunicationsPlaceholder />} />
            <Route path="/communications/messages" element={<Messages />} />
            <Route path="/communications/messages/*" element={<Messages />} />
            <Route path="/communications/notifications" element={<Notifications />} />
            <Route path="/communications/notifications/*" element={<Notifications />} />
            <Route path="/communications/*" element={<CommunicationsPlaceholder />} />

            {/* Personal Calendar section */}
            <Route path="/calendar/*" element={<CalendarPlaceholder />} />

            {/* My Data section */}
            <Route path="/data/personal" element={<PersonalData />} />
            <Route path="/data/password" element={<PasswordChange />} />
            <Route path="/data/*" element={<MyDataPlaceholder />} />

            {/* Legacy routes - redirect to new structure */}
            <Route path="/messages/*" element={<Navigate to="/communications/messages" replace />} />
            <Route path="/notifications" element={<Navigate to="/communications/notifications" replace />} />
            <Route path="/settings/*" element={<Settings />} />
            <Route path="/profile" element={<Profile />} />
          </Route>

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

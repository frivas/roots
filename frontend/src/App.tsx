import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import {
  RedirectToSignIn,
  SignedIn,
  SignedOut
} from '@clerk/clerk-react';
import { Analytics } from '@vercel/analytics/react';

// Layouts
import MainLayout from './components/layout/MainLayout';
import AuthLayout from './components/layout/AuthLayout';
import ClerkAuthWrapper from './components/ClerkAuthWrapper';

// Lazy-loaded components
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Services = lazy(() => import('./pages/Services'));
const Messages = lazy(() => import('./pages/Messages'));
const Notifications = lazy(() => import('./pages/Notifications'));
const PersonalData = lazy(() => import('./pages/PersonalData'));
const PasswordChange = lazy(() => import('./pages/PasswordChange'));
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
const ProgressInterpretationService = lazy(() => import('./pages/services/ProgressInterpretationService'));
const ProgressInterpretationChat = lazy(() => import('./pages/services/ProgressInterpretationChat'));
const MorningClassroom = lazy(() => import('./pages/MorningClassroom'));

// Placeholder components for new routes
const HomePlaceholder = lazy(() => import('./pages/placeholders/HomePlaceholder'));
const CommunicationsPlaceholder = lazy(() => import('./pages/placeholders/CommunicationsPlaceholder'));
const SchoolPlaceholder = lazy(() => import('./pages/placeholders/SchoolPlaceholder'));
const CalendarPlaceholder = lazy(() => import('./pages/placeholders/CalendarPlaceholder'));
const MyDataPlaceholder = lazy(() => import('./pages/placeholders/MyDataPlaceholder'));

// New component
import TutorInfo from './pages/TutorInfo';
import DynamicTitle from './components/DynamicTitle';
const Schedule = lazy(() => import('./pages/Schedule'));
const Absences = lazy(() => import('./pages/Absences'));
const Activities = lazy(() => import('./pages/Activities'));
const AcademicHistory = lazy(() => import('./pages/AcademicHistory'));
const Documents = lazy(() => import('./pages/Documents'));
const CurrentYearGrades = lazy(() => import('./pages/CurrentYearGrades'));
const StudentProfile = lazy(() => import('./pages/StudentProfile'));
const SchoolData = lazy(() => import('./pages/SchoolData'));
const SchoolCalendar = lazy(() => import('./pages/SchoolCalendar'));
const SchoolElections = lazy(() => import('./pages/SchoolElections'));
const PersonalCalendar = lazy(() => import('./pages/PersonalCalendar'));
const Bulletin = lazy(() => import('./pages/Bulletin'));

// Loading component with better UX
const Loading = () => (
  <div className="flex items-center justify-center min-h-screen bg-background">
    <div className="flex flex-col items-center gap-4">
      <div className="animate-spin rounded-full h-12 w-12 border-2 border-muted border-t-primary"></div>
      <p className="text-sm text-muted-foreground animate-pulse">Loading...</p>
    </div>
  </div>
);

// Loading fallback component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[50vh]">
    <div className="animate-spin rounded-full h-8 w-8 border-2 border-muted border-t-primary"></div>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <DynamicTitle />
      <Suspense fallback={<Loading />}>
        <Routes>
          {/* Public routes */}
          <Route
            path="/"
            element={<Navigate to="/home" replace />}
          />

          {/* Auth routes */}
          <Route
            path="/auth/login"
            element={
              <SignedOut>
                <AuthLayout>
                  <ClerkAuthWrapper
                    type="signIn"
                    routing="virtual"
                    redirectUrl="/home"
                  />
                </AuthLayout>
              </SignedOut>
            }
          />

          <Route
            path="/auth/register"
            element={
              <SignedOut>
                <AuthLayout>
                  <ClerkAuthWrapper
                    type="signUp"
                    routing="virtual"
                    redirectUrl="/home"
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
            <Route path="/home" element={
              <Suspense fallback={<PageLoader />}>
                <Dashboard />
              </Suspense>
            } />
            <Route path="/home/schedule" element={
              <Suspense fallback={<PageLoader />}>
                <Schedule />
              </Suspense>
            } />
            <Route path="/home/absences" element={
              <Suspense fallback={<PageLoader />}>
                <Absences />
              </Suspense>
            } />
            <Route path="/home/activities" element={
              <Suspense fallback={<PageLoader />}>
                <Activities />
              </Suspense>
            } />
            <Route path="/home/history" element={
              <Suspense fallback={<PageLoader />}>
                <AcademicHistory />
              </Suspense>
            } />
            <Route path="/home/documents" element={
              <Suspense fallback={<PageLoader />}>
                <Documents />
              </Suspense>
            } />
            <Route path="/home/grades" element={
              <Suspense fallback={<PageLoader />}>
                <CurrentYearGrades />
              </Suspense>
            } />
            <Route path="/home/profile" element={
              <Suspense fallback={<PageLoader />}>
                <StudentProfile />
              </Suspense>
            } />
            <Route path="/home/tutoring" element={
              <Suspense fallback={<PageLoader />}>
                <TutorInfo />
              </Suspense>
            } />
            <Route path="/home/*" element={
              <Suspense fallback={<PageLoader />}>
                <HomePlaceholder />
              </Suspense>
            } />

            {/* Our School section */}
            <Route path="/school/data" element={
              <Suspense fallback={<PageLoader />}>
                <SchoolData />
              </Suspense>
            } />
            <Route path="/school/calendar" element={
              <Suspense fallback={<PageLoader />}>
                <SchoolCalendar />
              </Suspense>
            } />
            <Route path="/school/services" element={
              <Suspense fallback={<PageLoader />}>
                <Services />
              </Suspense>
            } />
            <Route path="/school/elections" element={
              <Suspense fallback={<PageLoader />}>
                <SchoolElections />
              </Suspense>
            } />
            <Route path="/school/*" element={
              <Suspense fallback={<PageLoader />}>
                <SchoolPlaceholder />
              </Suspense>
            } />

            {/* Services section */}
            <Route path="/services" element={
              <Suspense fallback={<PageLoader />}>
                <Services />
              </Suspense>
            } />
            <Route path="/services/parent-wellness" element={
              <Suspense fallback={<PageLoader />}>
                <ParentWellness />
              </Suspense>
            } />
            <Route path="/services/parent-wellness-chat" element={
              <Suspense fallback={<PageLoader />}>
                <ParentWellnessChat />
              </Suspense>
            } />
            <Route path="/services/extra-curricular" element={
              <Suspense fallback={<PageLoader />}>
                <ExtraCurricular />
              </Suspense>
            } />
            <Route path="/services/extra-curricular-session/:activityType" element={
              <Suspense fallback={<PageLoader />}>
                <ExtraCurricularSession />
              </Suspense>
            } />
            <Route path="/services/chess-coaching-session" element={
              <Suspense fallback={<PageLoader />}>
                <ChessCoachingSession />
              </Suspense>
            } />
            <Route path="/services/math-tutoring-session" element={
              <Suspense fallback={<PageLoader />}>
                <MathTutoringSession />
              </Suspense>
            } />
            <Route path="/services/storytelling-session" element={
              <Suspense fallback={<PageLoader />}>
                <StorytellingSession />
              </Suspense>
            } />
            <Route path="/services/language-lesson-session" element={
              <Suspense fallback={<PageLoader />}>
                <LanguageLessonSession />
              </Suspense>
            } />
            <Route path="/services/progress-interpretation" element={
              <Suspense fallback={<PageLoader />}>
                <ProgressInterpretationService />
              </Suspense>
            } />
            <Route path="/services/progress-interpretation-chat" element={
              <Suspense fallback={<PageLoader />}>
                <ProgressInterpretationChat />
              </Suspense>
            } />
            <Route path="/services/morning-classroom" element={
              <Suspense fallback={<PageLoader />}>
                <MorningClassroom />
              </Suspense>
            } />
            <Route path="/services/*" element={
              <Suspense fallback={<PageLoader />}>
                <Services />
              </Suspense>
            } />

            {/* Communications section */}
            <Route path="/communications" element={
              <Suspense fallback={<PageLoader />}>
                <CommunicationsPlaceholder />
              </Suspense>
            } />
            <Route path="/communications/messages" element={
              <Suspense fallback={<PageLoader />}>
                <Messages />
              </Suspense>
            } />
            <Route path="/communications/messages/*" element={
              <Suspense fallback={<PageLoader />}>
                <Messages />
              </Suspense>
            } />
            <Route path="/communications/bulletin" element={
              <Suspense fallback={<PageLoader />}>
                <Bulletin />
              </Suspense>
            } />
            <Route path="/communications/notifications" element={
              <Suspense fallback={<PageLoader />}>
                <Notifications />
              </Suspense>
            } />
            <Route path="/communications/notifications/*" element={
              <Suspense fallback={<PageLoader />}>
                <Notifications />
              </Suspense>
            } />
            <Route path="/communications/*" element={
              <Suspense fallback={<PageLoader />}>
                <CommunicationsPlaceholder />
              </Suspense>
            } />

            {/* Personal Calendar section */}
            <Route path="/calendar/monthly" element={
              <Suspense fallback={<PageLoader />}>
                <PersonalCalendar />
              </Suspense>
            } />
            <Route path="/calendar/create" element={
              <Suspense fallback={<PageLoader />}>
                <PersonalCalendar />
              </Suspense>
            } />
            <Route path="/calendar/*" element={
              <Suspense fallback={<PageLoader />}>
                <CalendarPlaceholder />
              </Suspense>
            } />

            {/* My Data section */}
            <Route path="/data/personal" element={
              <Suspense fallback={<PageLoader />}>
                <PersonalData />
              </Suspense>
            } />
            <Route path="/data/password" element={
              <Suspense fallback={<PageLoader />}>
                <PasswordChange />
              </Suspense>
            } />
            <Route path="/data/*" element={
              <Suspense fallback={<PageLoader />}>
                <MyDataPlaceholder />
              </Suspense>
            } />

            {/* Legacy routes - redirect to new structure */}
            <Route path="/messages/*" element={<Navigate to="/communications/messages" replace />} />
            <Route path="/notifications/*" element={<Navigate to="/communications/notifications" replace />} />
            <Route path="/settings" element={<Navigate to="/data/personal" replace />} />
            <Route path="/profile" element={<Navigate to="/home/profile" replace />} />
          </Route>

          {/* Public legal pages */}
          <Route
            path="/privacy-policy"
            element={
              <Suspense fallback={<PageLoader />}>
                <PrivacyPolicy />
              </Suspense>
            }
          />

          {/* Catch unauthenticated users */}
          <Route
            path="/signin"
            element={<RedirectToSignIn redirectUrl="/home" />}
          />

          {/* 404 route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      <Analytics />
    </AuthProvider>
  );
}

export default App;

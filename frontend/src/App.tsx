import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router';
import { AuthProvider } from './contexts/AuthContext';
import {
  RedirectToSignIn,
  SignedIn,
  SignedOut
} from '@clerk/clerk-react';
import { Analytics } from '@vercel/analytics/react';
import { APP_ROUTES } from './config/routes';
import { MotionConfig } from 'framer-motion';
import StatusState from './components/ui/StatusState';

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

import DynamicTitle from './components/DynamicTitle';
const TutorInfo = lazy(() => import('./pages/TutorInfo'));
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
const ContributionDashboard = lazy(() => import('./pages/ContributionDashboard'));

// Loading component with better UX
const Loading = () => (
  <StatusState kind="loading" message="Loading..." className="min-h-screen bg-background" />
);

// Loading fallback component
const PageLoader = () => (
  <StatusState kind="loading" message="Loading page..." className="min-h-[50vh]" />
);

function App() {
  return (
    <MotionConfig reducedMotion="user">
      <AuthProvider>
      <DynamicTitle />
      <Suspense fallback={<Loading />}>
        <Routes>
          {/* Public routes */}
          <Route
            path={APP_ROUTES.root}
            element={<Navigate to={APP_ROUTES.home} replace />}
          />

          {/* Auth routes */}
          <Route
            path={APP_ROUTES.authLogin}
            element={
              <SignedOut>
                <AuthLayout>
                  <ClerkAuthWrapper
                    type="signIn"
                    routing="virtual"
                    forceRedirectUrl={APP_ROUTES.home}
                  />
                </AuthLayout>
              </SignedOut>
            }
          />

          <Route
            path={APP_ROUTES.authRegister}
            element={
              <SignedOut>
                <AuthLayout>
                  <ClerkAuthWrapper
                    type="signUp"
                    routing="virtual"
                    forceRedirectUrl={APP_ROUTES.home}
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
            <Route path={APP_ROUTES.dashboard} element={<Navigate to={APP_ROUTES.home} replace />} />

            {/* Home section */}
            <Route path={APP_ROUTES.home} element={
              <Suspense fallback={<PageLoader />}>
                <Dashboard />
              </Suspense>
            } />
            <Route path={APP_ROUTES.homeSchedule} element={
              <Suspense fallback={<PageLoader />}>
                <Schedule />
              </Suspense>
            } />
            <Route path={APP_ROUTES.homeAbsences} element={
              <Suspense fallback={<PageLoader />}>
                <Absences />
              </Suspense>
            } />
            <Route path={APP_ROUTES.homeActivities} element={
              <Suspense fallback={<PageLoader />}>
                <Activities />
              </Suspense>
            } />
            <Route path={APP_ROUTES.homeHistory} element={
              <Suspense fallback={<PageLoader />}>
                <AcademicHistory />
              </Suspense>
            } />
            <Route path={APP_ROUTES.homeDocuments} element={
              <Suspense fallback={<PageLoader />}>
                <Documents />
              </Suspense>
            } />
            <Route path={APP_ROUTES.homeGrades} element={
              <Suspense fallback={<PageLoader />}>
                <CurrentYearGrades />
              </Suspense>
            } />
            <Route path={APP_ROUTES.homeProfile} element={
              <Suspense fallback={<PageLoader />}>
                <StudentProfile />
              </Suspense>
            } />
            <Route path={APP_ROUTES.homeTutoring} element={
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
            <Route path={APP_ROUTES.schoolData} element={
              <Suspense fallback={<PageLoader />}>
                <SchoolData />
              </Suspense>
            } />
            <Route path={APP_ROUTES.schoolCalendar} element={
              <Suspense fallback={<PageLoader />}>
                <SchoolCalendar />
              </Suspense>
            } />
            <Route path={APP_ROUTES.schoolServices} element={
              <Suspense fallback={<PageLoader />}>
                <Services />
              </Suspense>
            } />
            <Route path={APP_ROUTES.schoolElections} element={
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
            <Route path={APP_ROUTES.services} element={
              <Suspense fallback={<PageLoader />}>
                <Services />
              </Suspense>
            } />
            <Route path={APP_ROUTES.servicesParentWellness} element={
              <Suspense fallback={<PageLoader />}>
                <ParentWellness />
              </Suspense>
            } />
            <Route path={APP_ROUTES.servicesParentWellnessChat} element={
              <Suspense fallback={<PageLoader />}>
                <ParentWellnessChat />
              </Suspense>
            } />
            <Route path={APP_ROUTES.servicesExtraCurricular} element={
              <Suspense fallback={<PageLoader />}>
                <ExtraCurricular />
              </Suspense>
            } />
            <Route path={APP_ROUTES.servicesExtraCurricularSession} element={
              <Suspense fallback={<PageLoader />}>
                <ExtraCurricularSession />
              </Suspense>
            } />
            <Route path={APP_ROUTES.servicesChessCoaching} element={
              <Suspense fallback={<PageLoader />}>
                <ChessCoachingSession />
              </Suspense>
            } />
            <Route path={APP_ROUTES.servicesMathTutoring} element={
              <Suspense fallback={<PageLoader />}>
                <MathTutoringSession />
              </Suspense>
            } />
            <Route path={APP_ROUTES.servicesStorytelling} element={
              <Suspense fallback={<PageLoader />}>
                <StorytellingSession />
              </Suspense>
            } />
            <Route path={APP_ROUTES.servicesLanguageLesson} element={
              <Suspense fallback={<PageLoader />}>
                <LanguageLessonSession />
              </Suspense>
            } />
            <Route path={APP_ROUTES.servicesProgressInterpretation} element={
              <Suspense fallback={<PageLoader />}>
                <ProgressInterpretationService />
              </Suspense>
            } />
            <Route path={APP_ROUTES.servicesProgressInterpretationChat} element={
              <Suspense fallback={<PageLoader />}>
                <ProgressInterpretationChat />
              </Suspense>
            } />
            <Route path={APP_ROUTES.servicesMorningClassroom} element={
              <Suspense fallback={<PageLoader />}>
                <MorningClassroom />
              </Suspense>
            } />
            <Route path={APP_ROUTES.servicesWildcard} element={
              <Suspense fallback={<PageLoader />}>
                <Services />
              </Suspense>
            } />

            {/* Communications section */}
            <Route path={APP_ROUTES.communications} element={
              <Suspense fallback={<PageLoader />}>
                <CommunicationsPlaceholder />
              </Suspense>
            } />
            <Route path={APP_ROUTES.communicationsMessages} element={
              <Suspense fallback={<PageLoader />}>
                <Messages />
              </Suspense>
            } />
            <Route path="/communications/messages/*" element={
              <Suspense fallback={<PageLoader />}>
                <Messages />
              </Suspense>
            } />
            <Route path={APP_ROUTES.communicationsBulletin} element={
              <Suspense fallback={<PageLoader />}>
                <Bulletin />
              </Suspense>
            } />
            <Route path={APP_ROUTES.communicationsNotifications} element={
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
            <Route path={APP_ROUTES.calendarMonthly} element={
              <Suspense fallback={<PageLoader />}>
                <PersonalCalendar />
              </Suspense>
            } />
            <Route path={APP_ROUTES.calendarCreate} element={
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
            <Route path={APP_ROUTES.dataPersonal} element={
              <Suspense fallback={<PageLoader />}>
                <PersonalData />
              </Suspense>
            } />
            <Route path={APP_ROUTES.dataPassword} element={
              <Suspense fallback={<PageLoader />}>
                <PasswordChange />
              </Suspense>
            } />
            <Route path={APP_ROUTES.dataContributions} element={
              <Suspense fallback={<PageLoader />}>
                <ContributionDashboard />
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
            path={APP_ROUTES.privacyPolicy}
            element={
              <Suspense fallback={<PageLoader />}>
                <PrivacyPolicy />
              </Suspense>
            }
          />

          {/* Catch unauthenticated users */}
          <Route
            path={APP_ROUTES.signIn}
            element={<RedirectToSignIn redirectUrl={APP_ROUTES.home} />}
          />

          {/* 404 route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      <Analytics />
      </AuthProvider>
    </MotionConfig>
  );
}

export default App;

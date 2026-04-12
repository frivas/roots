import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';

// ── Page mocks (exact import paths from App.tsx) ────────────────────────────
// NOTE: vi.mock factories are hoisted — do NOT reference outer variables.
// Each factory inlines the stub component directly.

vi.mock('./pages/Dashboard', () => ({ default: () => <div data-testid="page-Dashboard">Dashboard</div> }));
vi.mock('./pages/Services', () => ({ default: () => <div data-testid="page-Services">Services</div> }));
vi.mock('./pages/Messages', () => ({ default: () => <div data-testid="page-Messages">Messages</div> }));
vi.mock('./pages/Notifications', () => ({ default: () => <div data-testid="page-Notifications">Notifications</div> }));
vi.mock('./pages/PersonalData', () => ({ default: () => <div data-testid="page-PersonalData">PersonalData</div> }));
vi.mock('./pages/PasswordChange', () => ({ default: () => <div data-testid="page-PasswordChange">PasswordChange</div> }));
vi.mock('./pages/PrivacyPolicy', () => ({ default: () => <div data-testid="page-PrivacyPolicy">PrivacyPolicy</div> }));
vi.mock('./pages/NotFound', () => ({ default: () => <div data-testid="page-NotFound">NotFound</div> }));

// Service pages
vi.mock('./pages/services/ParentWellness', () => ({ default: () => <div data-testid="page-ParentWellness">ParentWellness</div> }));
vi.mock('./pages/services/ParentWellnessChat', () => ({ default: () => <div data-testid="page-ParentWellnessChat">ParentWellnessChat</div> }));
vi.mock('./pages/services/ExtraCurricular', () => ({ default: () => <div data-testid="page-ExtraCurricular">ExtraCurricular</div> }));
vi.mock('./pages/services/ExtraCurricularSession', () => ({ default: () => <div data-testid="page-ExtraCurricularSession">ExtraCurricularSession</div> }));
vi.mock('./pages/services/ChessCoachingSession', () => ({ default: () => <div data-testid="page-ChessCoachingSession">ChessCoachingSession</div> }));
vi.mock('./pages/services/MathTutoringSession', () => ({ default: () => <div data-testid="page-MathTutoringSession">MathTutoringSession</div> }));
vi.mock('./pages/services/StorytellingSession', () => ({ default: () => <div data-testid="page-StorytellingSession">StorytellingSession</div> }));
vi.mock('./pages/services/LanguageLessonSession', () => ({ default: () => <div data-testid="page-LanguageLessonSession">LanguageLessonSession</div> }));
vi.mock('./pages/services/ProgressInterpretationService', () => ({ default: () => <div data-testid="page-ProgressInterpretationService">ProgressInterpretationService</div> }));
vi.mock('./pages/services/ProgressInterpretationChat', () => ({ default: () => <div data-testid="page-ProgressInterpretationChat">ProgressInterpretationChat</div> }));
vi.mock('./pages/MorningClassroom', () => ({ default: () => <div data-testid="page-MorningClassroom">MorningClassroom</div> }));

// Placeholder pages
vi.mock('./pages/placeholders/HomePlaceholder', () => ({ default: () => <div data-testid="page-HomePlaceholder">HomePlaceholder</div> }));
vi.mock('./pages/placeholders/CommunicationsPlaceholder', () => ({ default: () => <div data-testid="page-CommunicationsPlaceholder">CommunicationsPlaceholder</div> }));
vi.mock('./pages/placeholders/SchoolPlaceholder', () => ({ default: () => <div data-testid="page-SchoolPlaceholder">SchoolPlaceholder</div> }));
vi.mock('./pages/placeholders/CalendarPlaceholder', () => ({ default: () => <div data-testid="page-CalendarPlaceholder">CalendarPlaceholder</div> }));
vi.mock('./pages/placeholders/MyDataPlaceholder', () => ({ default: () => <div data-testid="page-MyDataPlaceholder">MyDataPlaceholder</div> }));

// Static-imported page (not lazy, but mock path must match App.tsx import)
vi.mock('./pages/TutorInfo', () => ({ default: () => <div data-testid="page-TutorInfo">TutorInfo</div> }));

// Additional lazy pages
vi.mock('./pages/Schedule', () => ({ default: () => <div data-testid="page-Schedule">Schedule</div> }));
vi.mock('./pages/Absences', () => ({ default: () => <div data-testid="page-Absences">Absences</div> }));
vi.mock('./pages/Activities', () => ({ default: () => <div data-testid="page-Activities">Activities</div> }));
vi.mock('./pages/AcademicHistory', () => ({ default: () => <div data-testid="page-AcademicHistory">AcademicHistory</div> }));
vi.mock('./pages/Documents', () => ({ default: () => <div data-testid="page-Documents">Documents</div> }));
vi.mock('./pages/CurrentYearGrades', () => ({ default: () => <div data-testid="page-CurrentYearGrades">CurrentYearGrades</div> }));
vi.mock('./pages/StudentProfile', () => ({ default: () => <div data-testid="page-StudentProfile">StudentProfile</div> }));
vi.mock('./pages/SchoolData', () => ({ default: () => <div data-testid="page-SchoolData">SchoolData</div> }));
vi.mock('./pages/SchoolCalendar', () => ({ default: () => <div data-testid="page-SchoolCalendar">SchoolCalendar</div> }));
vi.mock('./pages/SchoolElections', () => ({ default: () => <div data-testid="page-SchoolElections">SchoolElections</div> }));
vi.mock('./pages/PersonalCalendar', () => ({ default: () => <div data-testid="page-PersonalCalendar">PersonalCalendar</div> }));
vi.mock('./pages/Bulletin', () => ({ default: () => <div data-testid="page-Bulletin">Bulletin</div> }));
vi.mock('./pages/ContributionDashboard', () => ({ default: () => <div data-testid="page-ContributionDashboard">ContributionDashboard</div> }));

// ── Layout mocks ─────────────────────────────────────────────────────────────
// MainLayout wraps protected child routes via <Outlet /> — must render Outlet
// so nested routes actually render their page components.
// Use a lazy import inside the factory to avoid ESLint no-require-imports.
vi.mock('./components/layout/MainLayout', async () => {
  const { Outlet: RouterOutlet } = await import('react-router-dom');
  return {
    default: () => <RouterOutlet />,
  };
});
vi.mock('./components/layout/AuthLayout', () => ({
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
vi.mock('./components/ClerkAuthWrapper', () => ({
  default: () => <div data-testid="clerk-wrapper" />,
}));
vi.mock('./components/DynamicTitle', () => ({ default: () => null }));

// ── Context mocks ─────────────────────────────────────────────────────────────
vi.mock('./contexts/AuthContext', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
vi.mock('./contexts/LingoTranslationContext', () => ({
  LingoTranslationProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useLingoTranslation: () => ({
    language: 'en-US',
    setLanguage: vi.fn(),
    isTranslating: false,
    translateText: vi.fn(async (t: string) => t),
    preloadingComplete: true,
    isInitialized: true,
    isProviderMounted: true,
  }),
}));

// ── External dependency mocks ─────────────────────────────────────────────────
vi.mock('@vercel/analytics/react', () => ({ Analytics: () => null }));

// ── Clerk mock (signed-in by default) ────────────────────────────────────────
vi.mock('@clerk/clerk-react', () => ({
  useUser: () => ({ isLoaded: true, isSignedIn: true, user: { id: 'u1', publicMetadata: {} } }),
  useAuth: () => ({ isLoaded: true, isSignedIn: true, getToken: async () => 'tok' }),
  useClerk: () => ({ signOut: vi.fn() }),
  ClerkProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  SignedIn: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  SignedOut: () => null,
  SignIn: () => <div data-testid="clerk-signin" />,
  SignUp: () => <div data-testid="clerk-signup" />,
  UserButton: () => <div data-testid="user-btn" />,
  RedirectToSignIn: () => <div data-testid="clerk-redirect" />,
}));

import App from './App';

// ── Helper ───────────────────────────────────────────────────────────────────
const renderAt = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>
  );

// ── Protected route tests ────────────────────────────────────────────────────
describe('App routing — protected routes (signed in)', () => {
  it('renders Dashboard at /home', async () => {
    renderAt('/home');
    expect(await screen.findByTestId('page-Dashboard')).toBeInTheDocument();
  });

  it('renders Schedule at /home/schedule', async () => {
    renderAt('/home/schedule');
    expect(await screen.findByTestId('page-Schedule')).toBeInTheDocument();
  });

  it('renders Absences at /home/absences', async () => {
    renderAt('/home/absences');
    expect(await screen.findByTestId('page-Absences')).toBeInTheDocument();
  });

  it('renders Activities at /home/activities', async () => {
    renderAt('/home/activities');
    expect(await screen.findByTestId('page-Activities')).toBeInTheDocument();
  });

  it('renders AcademicHistory at /home/history', async () => {
    renderAt('/home/history');
    expect(await screen.findByTestId('page-AcademicHistory')).toBeInTheDocument();
  });

  it('renders Documents at /home/documents', async () => {
    renderAt('/home/documents');
    expect(await screen.findByTestId('page-Documents')).toBeInTheDocument();
  });

  it('renders CurrentYearGrades at /home/grades', async () => {
    renderAt('/home/grades');
    expect(await screen.findByTestId('page-CurrentYearGrades')).toBeInTheDocument();
  });

  it('renders StudentProfile at /home/profile', async () => {
    renderAt('/home/profile');
    expect(await screen.findByTestId('page-StudentProfile')).toBeInTheDocument();
  });

  it('renders TutorInfo at /home/tutoring', async () => {
    renderAt('/home/tutoring');
    expect(await screen.findByTestId('page-TutorInfo')).toBeInTheDocument();
  });

  it('renders HomePlaceholder for unknown /home/* paths', async () => {
    renderAt('/home/unknown-section');
    expect(await screen.findByTestId('page-HomePlaceholder')).toBeInTheDocument();
  });

  it('renders SchoolData at /school/data', async () => {
    renderAt('/school/data');
    expect(await screen.findByTestId('page-SchoolData')).toBeInTheDocument();
  });

  it('renders SchoolCalendar at /school/calendar', async () => {
    renderAt('/school/calendar');
    expect(await screen.findByTestId('page-SchoolCalendar')).toBeInTheDocument();
  });

  it('renders Services at /school/services', async () => {
    renderAt('/school/services');
    expect(await screen.findByTestId('page-Services')).toBeInTheDocument();
  });

  it('renders SchoolElections at /school/elections', async () => {
    renderAt('/school/elections');
    expect(await screen.findByTestId('page-SchoolElections')).toBeInTheDocument();
  });

  it('renders SchoolPlaceholder for unknown /school/* paths', async () => {
    renderAt('/school/unknown');
    expect(await screen.findByTestId('page-SchoolPlaceholder')).toBeInTheDocument();
  });

  it('renders Services at /services', async () => {
    renderAt('/services');
    expect(await screen.findByTestId('page-Services')).toBeInTheDocument();
  });

  it('renders ParentWellness at /services/parent-wellness', async () => {
    renderAt('/services/parent-wellness');
    expect(await screen.findByTestId('page-ParentWellness')).toBeInTheDocument();
  });

  it('renders ParentWellnessChat at /services/parent-wellness-chat', async () => {
    renderAt('/services/parent-wellness-chat');
    expect(await screen.findByTestId('page-ParentWellnessChat')).toBeInTheDocument();
  });

  it('renders ExtraCurricular at /services/extra-curricular', async () => {
    renderAt('/services/extra-curricular');
    expect(await screen.findByTestId('page-ExtraCurricular')).toBeInTheDocument();
  });

  it('renders ExtraCurricularSession at parameterized route', async () => {
    renderAt('/services/extra-curricular-session/chess');
    expect(await screen.findByTestId('page-ExtraCurricularSession')).toBeInTheDocument();
  });

  it('renders ChessCoachingSession at /services/chess-coaching-session', async () => {
    renderAt('/services/chess-coaching-session');
    expect(await screen.findByTestId('page-ChessCoachingSession')).toBeInTheDocument();
  });

  it('renders MathTutoringSession at /services/math-tutoring-session', async () => {
    renderAt('/services/math-tutoring-session');
    expect(await screen.findByTestId('page-MathTutoringSession')).toBeInTheDocument();
  });

  it('renders StorytellingSession at /services/storytelling-session', async () => {
    renderAt('/services/storytelling-session');
    expect(await screen.findByTestId('page-StorytellingSession')).toBeInTheDocument();
  });

  it('renders LanguageLessonSession at /services/language-lesson-session', async () => {
    renderAt('/services/language-lesson-session');
    expect(await screen.findByTestId('page-LanguageLessonSession')).toBeInTheDocument();
  });

  it('renders ProgressInterpretationService at /services/progress-interpretation', async () => {
    renderAt('/services/progress-interpretation');
    expect(await screen.findByTestId('page-ProgressInterpretationService')).toBeInTheDocument();
  });

  it('renders ProgressInterpretationChat at /services/progress-interpretation-chat', async () => {
    renderAt('/services/progress-interpretation-chat');
    expect(await screen.findByTestId('page-ProgressInterpretationChat')).toBeInTheDocument();
  });

  it('renders MorningClassroom at /services/morning-classroom', async () => {
    renderAt('/services/morning-classroom');
    expect(await screen.findByTestId('page-MorningClassroom')).toBeInTheDocument();
  });

  it('renders CommunicationsPlaceholder at /communications', async () => {
    renderAt('/communications');
    expect(await screen.findByTestId('page-CommunicationsPlaceholder')).toBeInTheDocument();
  });

  it('renders Messages at /communications/messages', async () => {
    renderAt('/communications/messages');
    expect(await screen.findByTestId('page-Messages')).toBeInTheDocument();
  });

  it('renders Bulletin at /communications/bulletin', async () => {
    renderAt('/communications/bulletin');
    expect(await screen.findByTestId('page-Bulletin')).toBeInTheDocument();
  });

  it('renders Notifications at /communications/notifications', async () => {
    renderAt('/communications/notifications');
    expect(await screen.findByTestId('page-Notifications')).toBeInTheDocument();
  });

  it('renders PersonalCalendar at /calendar/monthly', async () => {
    renderAt('/calendar/monthly');
    expect(await screen.findByTestId('page-PersonalCalendar')).toBeInTheDocument();
  });

  it('renders PersonalCalendar at /calendar/create', async () => {
    renderAt('/calendar/create');
    expect(await screen.findByTestId('page-PersonalCalendar')).toBeInTheDocument();
  });

  it('renders CalendarPlaceholder for unknown /calendar/* paths', async () => {
    renderAt('/calendar/unknown');
    expect(await screen.findByTestId('page-CalendarPlaceholder')).toBeInTheDocument();
  });

  it('renders PersonalData at /data/personal', async () => {
    renderAt('/data/personal');
    expect(await screen.findByTestId('page-PersonalData')).toBeInTheDocument();
  });

  it('renders PasswordChange at /data/password', async () => {
    renderAt('/data/password');
    expect(await screen.findByTestId('page-PasswordChange')).toBeInTheDocument();
  });

  it('renders ContributionDashboard at /data/contributions', async () => {
    renderAt('/data/contributions');
    expect(await screen.findByTestId('page-ContributionDashboard')).toBeInTheDocument();
  });

  it('renders MyDataPlaceholder for unknown /data/* paths', async () => {
    renderAt('/data/unknown');
    expect(await screen.findByTestId('page-MyDataPlaceholder')).toBeInTheDocument();
  });
});

// ── Legacy redirect tests ─────────────────────────────────────────────────────
describe('App routing — legacy redirects', () => {
  it('redirects / to /home (renders Dashboard)', async () => {
    renderAt('/');
    expect(await screen.findByTestId('page-Dashboard')).toBeInTheDocument();
  });

  it('redirects /dashboard to /home (renders Dashboard)', async () => {
    renderAt('/dashboard');
    expect(await screen.findByTestId('page-Dashboard')).toBeInTheDocument();
  });

  it('redirects /messages/* to /communications/messages', async () => {
    renderAt('/messages/inbox');
    expect(await screen.findByTestId('page-Messages')).toBeInTheDocument();
  });

  it('redirects /notifications/* to /communications/notifications', async () => {
    renderAt('/notifications/all');
    expect(await screen.findByTestId('page-Notifications')).toBeInTheDocument();
  });

  it('redirects /settings to /data/personal', async () => {
    renderAt('/settings');
    expect(await screen.findByTestId('page-PersonalData')).toBeInTheDocument();
  });

  it('redirects /profile to /home/profile', async () => {
    renderAt('/profile');
    expect(await screen.findByTestId('page-StudentProfile')).toBeInTheDocument();
  });
});

// ── Public routes ─────────────────────────────────────────────────────────────
describe('App routing — public routes', () => {
  it('renders PrivacyPolicy at /privacy-policy', async () => {
    renderAt('/privacy-policy');
    expect(await screen.findByTestId('page-PrivacyPolicy')).toBeInTheDocument();
  });

  it('renders NotFound for unknown path', async () => {
    renderAt('/does-not-exist-xyz');
    expect(await screen.findByTestId('page-NotFound')).toBeInTheDocument();
  });
});

// ── Auth routes ───────────────────────────────────────────────────────────────
// When signed IN (default mock), SignedOut returns null so ClerkAuthWrapper
// is not rendered. These tests verify the routes are registered without error.
describe('App routing — auth routes (route registration)', () => {
  it('/auth/login route is registered without error', () => {
    const { unmount } = renderAt('/auth/login');
    // No crash means the route tree is valid
    unmount();
  });

  it('/auth/register route is registered without error', () => {
    const { unmount } = renderAt('/auth/register');
    unmount();
  });

  it('renders RedirectToSignIn stub at /signin', async () => {
    renderAt('/signin');
    expect(await screen.findByTestId('clerk-redirect')).toBeInTheDocument();
  });
});

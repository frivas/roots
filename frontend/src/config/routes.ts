import type { ComponentType } from 'react';

export const APP_ROUTES = {
  root: '/',
  authLogin: '/auth/login',
  authRegister: '/auth/register',
  dashboard: '/dashboard',
  home: '/home',
  homeTutoring: '/home/tutoring',
  homeSchedule: '/home/schedule',
  homeAbsences: '/home/absences',
  homeActivities: '/home/activities',
  homeHistory: '/home/history',
  homeDocuments: '/home/documents',
  homeGrades: '/home/grades',
  homeProfile: '/home/profile',
  homeWildcard: '/home/*',
  schoolData: '/school/data',
  schoolCalendar: '/school/calendar',
  schoolServices: '/school/services',
  schoolElections: '/school/elections',
  schoolWildcard: '/school/*',
  services: '/services',
  servicesParentWellness: '/services/parent-wellness',
  servicesParentWellnessChat: '/services/parent-wellness-chat',
  servicesExtraCurricular: '/services/extra-curricular',
  servicesExtraCurricularSession: '/services/extra-curricular-session/:activityType',
  servicesChessCoaching: '/services/chess-coaching-session',
  servicesMathTutoring: '/services/math-tutoring-session',
  servicesStorytelling: '/services/storytelling-session',
  servicesLanguageLesson: '/services/language-lesson-session',
  servicesProgressInterpretation: '/services/progress-interpretation',
  servicesProgressInterpretationChat: '/services/progress-interpretation-chat',
  servicesMorningClassroom: '/services/morning-classroom',
  servicesClassroom: '/services/classroom',
  servicesTransportation: '/services/transportation',
  servicesCafeteria: '/services/cafeteria',
  servicesParentCoaching: '/services/parent-coaching',
  servicesLanguage: '/services/language',
  servicesMentorship: '/services/mentorship',
  servicesEvents: '/services/events',
  servicesCounseling: '/services/counseling',
  servicesFieldTrips: '/services/fieldtrips',
  servicesWildcard: '/services/*',
  communications: '/communications',
  communicationsMessages: '/communications/messages',
  communicationsMessagesWildcard: '/communications/messages/*',
  communicationsBulletin: '/communications/bulletin',
  communicationsNotifications: '/communications/notifications',
  communicationsNotificationsWildcard: '/communications/notifications/*',
  communicationsWildcard: '/communications/*',
  calendarMonthly: '/calendar/monthly',
  calendarCreate: '/calendar/create',
  calendarWildcard: '/calendar/*',
  dataPersonal: '/data/personal',
  dataPassword: '/data/password',
  dataWildcard: '/data/*',
  legacyMessages: '/messages/*',
  legacyNotifications: '/notifications/*',
  legacySettings: '/settings',
  legacyProfile: '/profile',
  privacyPolicy: '/privacy-policy',
  termsOfService: '/terms-of-service',
  cookiesPolicy: '/cookies-policy',
  signIn: '/signin',
} as const;

export type AppRoute = (typeof APP_ROUTES)[keyof typeof APP_ROUTES];
type PageModule = Promise<{ default: ComponentType }>;

export interface ProtectedPageRoute {
  path: AppRoute;
  load: () => PageModule;
  usesAi?: boolean;
}

export const PROTECTED_PAGE_ROUTES: readonly ProtectedPageRoute[] = [
  { path: APP_ROUTES.home, load: () => import('../pages/Dashboard') },
  { path: APP_ROUTES.homeTutoring, load: () => import('../pages/TutorInfo') },
  { path: APP_ROUTES.homeSchedule, load: () => import('../pages/Schedule') },
  { path: APP_ROUTES.homeAbsences, load: () => import('../pages/Absences') },
  { path: APP_ROUTES.homeActivities, load: () => import('../pages/Activities') },
  { path: APP_ROUTES.homeHistory, load: () => import('../pages/AcademicHistory') },
  { path: APP_ROUTES.homeDocuments, load: () => import('../pages/Documents') },
  { path: APP_ROUTES.homeGrades, load: () => import('../pages/CurrentYearGrades') },
  { path: APP_ROUTES.homeProfile, load: () => import('../pages/StudentProfile') },
  { path: APP_ROUTES.schoolData, load: () => import('../pages/SchoolData') },
  { path: APP_ROUTES.schoolCalendar, load: () => import('../pages/SchoolCalendar') },
  { path: APP_ROUTES.schoolElections, load: () => import('../pages/SchoolElections') },
  { path: APP_ROUTES.services, load: () => import('../pages/Services') },
  { path: APP_ROUTES.servicesParentWellness, load: () => import('../pages/services/ParentWellness') },
  { path: APP_ROUTES.servicesParentWellnessChat, load: () => import('../pages/services/ParentWellnessChat'), usesAi: true },
  { path: APP_ROUTES.servicesExtraCurricular, load: () => import('../pages/services/ExtraCurricular') },
  { path: APP_ROUTES.servicesExtraCurricularSession, load: () => import('../pages/services/ExtraCurricularSession'), usesAi: true },
  { path: APP_ROUTES.servicesChessCoaching, load: () => import('../pages/services/ChessCoachingSession'), usesAi: true },
  { path: APP_ROUTES.servicesMathTutoring, load: () => import('../pages/services/MathTutoringSession'), usesAi: true },
  { path: APP_ROUTES.servicesStorytelling, load: () => import('../pages/services/StorytellingSession'), usesAi: true },
  { path: APP_ROUTES.servicesLanguageLesson, load: () => import('../pages/services/LanguageLessonSession'), usesAi: true },
  { path: APP_ROUTES.servicesProgressInterpretation, load: () => import('../pages/services/ProgressInterpretationService') },
  { path: APP_ROUTES.servicesProgressInterpretationChat, load: () => import('../pages/services/ProgressInterpretationChat'), usesAi: true },
  { path: APP_ROUTES.servicesMorningClassroom, load: () => import('../pages/MorningClassroom') },
  { path: APP_ROUTES.communicationsMessages, load: () => import('../pages/Messages') },
  { path: APP_ROUTES.communicationsMessagesWildcard, load: () => import('../pages/Messages') },
  { path: APP_ROUTES.communicationsBulletin, load: () => import('../pages/Bulletin') },
  { path: APP_ROUTES.communicationsNotifications, load: () => import('../pages/Notifications') },
  { path: APP_ROUTES.communicationsNotificationsWildcard, load: () => import('../pages/Notifications') },
  { path: APP_ROUTES.calendarMonthly, load: () => import('../pages/PersonalCalendar') },
  { path: APP_ROUTES.calendarCreate, load: () => import('../pages/PersonalCalendar') },
  { path: APP_ROUTES.dataPersonal, load: () => import('../pages/PersonalData') },
  { path: APP_ROUTES.dataPassword, load: () => import('../pages/PasswordChange') },
];

export const PROTECTED_REDIRECT_ROUTES = [
  { path: APP_ROUTES.dashboard, to: APP_ROUTES.home },
  { path: APP_ROUTES.schoolServices, to: APP_ROUTES.services },
  { path: APP_ROUTES.servicesWildcard, to: APP_ROUTES.services },
  { path: APP_ROUTES.communications, to: APP_ROUTES.communicationsMessages },
  { path: APP_ROUTES.legacyMessages, to: APP_ROUTES.communicationsMessages },
  { path: APP_ROUTES.legacyNotifications, to: APP_ROUTES.communicationsNotifications },
  { path: APP_ROUTES.legacySettings, to: APP_ROUTES.dataPersonal },
  { path: APP_ROUTES.legacyProfile, to: APP_ROUTES.homeProfile },
] as const;

export const SECTION_PLACEHOLDER_ROUTES = [
  { path: APP_ROUTES.homeWildcard, title: 'Home' },
  { path: APP_ROUTES.schoolWildcard, title: 'Our School' },
  { path: APP_ROUTES.communicationsWildcard, title: 'Communications' },
  { path: APP_ROUTES.calendarWildcard, title: 'Personal Calendar' },
  { path: APP_ROUTES.dataWildcard, title: 'My Data' },
] as const;

export const PUBLIC_PAGE_ROUTES = [
  { path: APP_ROUTES.privacyPolicy, load: () => import('../pages/PrivacyPolicy') },
  { path: APP_ROUTES.termsOfService, load: () => import('../pages/TermsOfService') },
  { path: APP_ROUTES.cookiesPolicy, load: () => import('../pages/CookiePolicy') },
] satisfies readonly ProtectedPageRoute[];

export const AI_SERVICE_ROUTES = PROTECTED_PAGE_ROUTES
  .filter(route => route.usesAi)
  .map(route => route.path);

const normalizePath = (path: string) => path.length > 1 ? path.replace(/\/+$/, '') : path;
const routePrefix = (path: string) => normalizePath(path).replace(/\/:[^/]+/g, '').replace(/\/\*$/, '');

const routeMatchesPath = (pathname: string, route: string) => {
  const current = normalizePath(pathname);
  const prefix = routePrefix(route);
  return current === prefix || current.startsWith(`${prefix}/`);
};

export const getActiveNavigationPath = (pathname: string, destinations: readonly string[]) =>
  destinations
    .filter(destination => routeMatchesPath(pathname, destination))
    .sort((left, right) => routePrefix(right).length - routePrefix(left).length)[0];

export const isAiServicePath = (pathname: string) =>
  AI_SERVICE_ROUTES.some(route => routeMatchesPath(pathname, route));

export const getProtectedRoutePaths = () => new Set<string>([
  ...PROTECTED_PAGE_ROUTES.map(route => route.path),
  ...PROTECTED_REDIRECT_ROUTES.map(route => route.path),
  ...SECTION_PLACEHOLDER_ROUTES.map(route => route.path),
]);

const registeredRoutes = new Set<string>(Object.values(APP_ROUTES));

export const isRegisteredRoute = (path: string): path is AppRoute =>
  registeredRoutes.has(path);

export const extracurricularSessionRoute = (activityType: string) =>
  APP_ROUTES.servicesExtraCurricularSession.replace(
    ':activityType',
    encodeURIComponent(activityType),
  );

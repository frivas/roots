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
  schoolData: '/school/data',
  schoolCalendar: '/school/calendar',
  schoolServices: '/school/services',
  schoolElections: '/school/elections',
  services: '/services',
  servicesParentWellness: '/services/parent-wellness',
  servicesParentWellnessChat: '/services/parent-wellness-chat',
  servicesExtraCurricular: '/services/extra-curricular',
  servicesChessCoaching: '/services/chess-coaching-session',
  servicesMathTutoring: '/services/math-tutoring-session',
  servicesStorytelling: '/services/storytelling-session',
  servicesLanguageLesson: '/services/language-lesson-session',
  servicesProgressInterpretation: '/services/progress-interpretation',
  servicesProgressInterpretationChat: '/services/progress-interpretation-chat',
  servicesMorningClassroom: '/services/morning-classroom',
  communications: '/communications',
  communicationsMessages: '/communications/messages',
  communicationsBulletin: '/communications/bulletin',
  communicationsNotifications: '/communications/notifications',
  calendarMonthly: '/calendar/monthly',
  calendarCreate: '/calendar/create',
  dataPersonal: '/data/personal',
  dataPassword: '/data/password',
  dataContributions: '/data/contributions',
  privacyPolicy: '/privacy-policy',
  signIn: '/signin',
} as const;

export type AppRoute = (typeof APP_ROUTES)[keyof typeof APP_ROUTES];

const registeredRoutes = new Set<string>(Object.values(APP_ROUTES));

export const isRegisteredRoute = (path: string): path is AppRoute =>
  registeredRoutes.has(path);

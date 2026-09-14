import { describe, expect, it } from 'vitest';
import {
  APP_ROUTES,
  AI_SERVICE_ROUTES,
  PROTECTED_PAGE_ROUTES,
  PROTECTED_REDIRECT_ROUTES,
  SECTION_PLACEHOLDER_ROUTES,
  extracurricularSessionRoute,
  getActiveNavigationPath,
  isAiServicePath,
  isRegisteredRoute,
} from './routes';

describe('route registry', () => {
  it('registers every service route, including the parameterized session path', () => {
    const serviceRoutes = Object.entries(APP_ROUTES)
      .filter(([name]) => name.startsWith('services'))
      .map(([, route]) => route);

    expect(serviceRoutes.length).toBeGreaterThan(10);
    expect(serviceRoutes.every(isRegisteredRoute)).toBe(true);
    expect(APP_ROUTES.servicesExtraCurricularSession)
      .toBe('/services/extra-curricular-session/:activityType');
  });

  it('builds an encoded extracurricular session URL from the registered pattern', () => {
    expect(extracurricularSessionRoute('creative writing'))
      .toBe('/services/extra-curricular-session/creative%20writing');
  });

  it('keeps every protected destination in one route manifest', () => {
    const paths = [
      ...PROTECTED_PAGE_ROUTES.map(route => route.path),
      ...PROTECTED_REDIRECT_ROUTES.map(route => route.path),
      ...SECTION_PLACEHOLDER_ROUTES.map(route => route.path),
    ];

    expect(paths).toContain(APP_ROUTES.home);
    expect(paths).toContain(APP_ROUTES.servicesStorytelling);
    expect(paths).toContain(APP_ROUTES.communications);
    expect(new Set(paths).size).toBe(paths.length);
  });

  it('identifies AI routes from the route manifest', () => {
    expect(AI_SERVICE_ROUTES).toContain(APP_ROUTES.servicesMathTutoring);
    expect(isAiServicePath(APP_ROUTES.servicesMathTutoring)).toBe(true);
    expect(isAiServicePath('/services/extra-curricular-session/chess')).toBe(true);
    expect(isAiServicePath(APP_ROUTES.home)).toBe(false);
  });

  it('selects the most specific navigation destination for nested paths', () => {
    expect(getActiveNavigationPath('/communications/messages/thread-1', [
      APP_ROUTES.communications,
      APP_ROUTES.communicationsMessages,
    ])).toBe(APP_ROUTES.communicationsMessages);
  });
});

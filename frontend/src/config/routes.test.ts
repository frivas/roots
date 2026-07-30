import { describe, expect, it } from 'vitest';
import {
  APP_ROUTES,
  extracurricularSessionRoute,
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
});

import { Suspense, lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router';
import { RedirectToSignIn, SignedIn, SignedOut } from '@clerk/clerk-react';
import { Analytics } from '@vercel/analytics/react';
import { MotionConfig } from 'framer-motion';
import ClerkAuthWrapper from './components/ClerkAuthWrapper';
import DynamicTitle from './components/DynamicTitle';
import AuthLayout from './components/layout/AuthLayout';
import MainLayout from './components/layout/MainLayout';
import StatusState from './components/ui/StatusState';
import { AuthProvider } from './contexts/AuthContext';
import {
  APP_ROUTES,
  PROTECTED_PAGE_ROUTES,
  PROTECTED_REDIRECT_ROUTES,
  PUBLIC_PAGE_ROUTES,
  SECTION_PLACEHOLDER_ROUTES,
} from './config/routes';

const NotFound = lazy(() => import('./pages/NotFound'));
const SectionPlaceholder = lazy(() => import('./pages/placeholders/SectionPlaceholder'));

const protectedPages = PROTECTED_PAGE_ROUTES.map(route => ({
  ...route,
  Component: lazy(route.load),
}));
const publicPages = PUBLIC_PAGE_ROUTES.map(route => ({
  ...route,
  Component: lazy(route.load),
}));

const Loading = () => (
  <StatusState kind="loading" message="Loading..." className="min-h-screen bg-background" />
);

function App() {
  return (
    <MotionConfig reducedMotion="user">
      <AuthProvider>
        <DynamicTitle />
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path={APP_ROUTES.root} element={<Navigate to={APP_ROUTES.home} replace />} />

            <Route
              path={APP_ROUTES.authLogin}
              element={(
                <>
                  <SignedIn><Navigate to={APP_ROUTES.home} replace /></SignedIn>
                  <SignedOut>
                    <AuthLayout>
                      <ClerkAuthWrapper type="signIn" routing="virtual" forceRedirectUrl={APP_ROUTES.home} />
                    </AuthLayout>
                  </SignedOut>
                </>
              )}
            />
            <Route
              path={APP_ROUTES.authRegister}
              element={(
                <>
                  <SignedIn><Navigate to={APP_ROUTES.home} replace /></SignedIn>
                  <SignedOut>
                    <AuthLayout>
                      <ClerkAuthWrapper type="signUp" routing="virtual" forceRedirectUrl={APP_ROUTES.home} />
                    </AuthLayout>
                  </SignedOut>
                </>
              )}
            />

            <Route element={<SignedIn><MainLayout /></SignedIn>}>
              {protectedPages.map(({ path, Component }) => (
                <Route key={path} path={path} element={<Component />} />
              ))}
              {PROTECTED_REDIRECT_ROUTES.map(({ path, to }) => (
                <Route key={path} path={path} element={<Navigate to={to} replace />} />
              ))}
              {SECTION_PLACEHOLDER_ROUTES.map(({ path, title }) => (
                <Route
                  key={path}
                  path={path}
                  element={<SectionPlaceholder title={title} />}
                />
              ))}
              <Route path="*" element={<NotFound />} />
            </Route>

            {publicPages.map(({ path, Component }) => (
              <Route key={path} path={path} element={<Component />} />
            ))}

            <Route
              path={APP_ROUTES.signIn}
              element={<RedirectToSignIn redirectUrl={APP_ROUTES.home} />}
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
        <Analytics />
      </AuthProvider>
    </MotionConfig>
  );
}

export default App;

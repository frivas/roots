import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import SimpleHeader from './SimpleHeader';
import ModernSidebar from './ModernSidebar';
import Footer from './Footer';
import ErrorBoundary from '../ErrorBoundary';
import RouteWrapper from '../RouteWrapper';
import { cn } from '../../lib/utils';
import { useUser } from '@clerk/clerk-react';
import { type Role } from '../../config/menuConfig';

const MainLayout: React.FC = () => {
  const { user, isLoaded } = useUser();
  const location = useLocation();

  // Get user roles from Clerk metadata and ensure they match our Role type
  const userRoles = React.useMemo(() => {
    if (!isLoaded || !user) return [];
    return (user.publicMetadata?.roles as Role[] || []).filter(role =>
      ['student', 'parent', 'teacher', 'administrator'].includes(role)
    );
  }, [user, isLoaded]);

  // Define pages with ElevenLabs agent integrations (hide footer and AI disclaimer)
  const elevenLabsAgentPaths = [
    '/services/parent-wellness-chat',
    '/services/language-lesson-session',
    '/services/math-tutoring-session',
    '/services/extra-curricular-session',
    '/services/chess-coaching-session',
    '/services/storytelling-session',
    '/services/progress-interpretation-chat'
  ];

  // Check if current page has ElevenLabs agent integration
  const hasElevenLabsAgent = elevenLabsAgentPaths.some(path =>
    location.pathname.startsWith(path)
  );

  // Page transition variants
  const pageVariants = {
    initial: { opacity: 0, y: 10 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -10 }
  };

  const pageTransition = {
    type: "tween",
    ease: "anticipate",
    duration: 0.2
  };

  return (
    <div className="h-screen bg-background flex flex-col">
      {/* Mobile Header */}
      <div className="md:hidden flex-shrink-0">
        <SimpleHeader />
      </div>

      {/* Main Container: Sidebar + Content - Takes remaining height */}
      <div className="flex flex-1 min-h-0">
        {/* Modern Sidebar - hidden on mobile, full height */}
        <div className="hidden md:flex flex-col flex-shrink-0">
          <ModernSidebar userRoles={userRoles} hideBottomBorder={hasElevenLabsAgent} />
        </div>

        {/* Main Content - Takes remaining width and matches sidebar height */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Content Area - Takes available space */}
          <div className={cn(
            "flex-1 overflow-auto",
            "p-6 pt-0 md:pt-6", // No top padding on mobile (header handles it)
            hasElevenLabsAgent ? "pb-6" : "pb-0" // Add bottom padding when no footer
          )}>
            <ErrorBoundary>
              <RouteWrapper>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={location.pathname}
                    initial="initial"
                    animate="in"
                    exit="out"
                    variants={pageVariants}
                    transition={pageTransition}
                    id="outlet-container"
                  >
                    <Outlet />
                  </motion.div>
                </AnimatePresence>
              </RouteWrapper>
            </ErrorBoundary>
          </div>

          {/* Footer - Only render when not on ElevenLabs agent pages */}
          {!hasElevenLabsAgent && (
            <div className="flex-shrink-0 border-t bg-background px-6 py-4">
              <Footer />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MainLayout;

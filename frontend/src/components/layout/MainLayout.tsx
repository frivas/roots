import React from 'react';
import { Outlet } from 'react-router-dom';
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

  // Get user roles from Clerk metadata and ensure they match our Role type
  const userRoles = React.useMemo(() => {
    if (!isLoaded || !user) return [];
    return (user.publicMetadata?.roles as Role[] || []).filter(role =>
      ['student', 'parent', 'teacher', 'administrator'].includes(role)
    );
  }, [user, isLoaded]);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Row: Sidebar + Main Content */}
      <div className="flex flex-1">
        {/* Modern Sidebar - hidden on mobile */}
        <div className="hidden md:block">
          <ModernSidebar userRoles={userRoles} />
        </div>

        {/* Mobile Header */}
        <div className="md:hidden">
          <SimpleHeader />
        </div>

        {/* Main Content */}
        <main className={cn(
          "flex-1 p-6 overflow-auto",
          "pt-0 md:pt-6" // No top padding on mobile (header handles it)
        )}>
          <ErrorBoundary>
            <RouteWrapper>
              <div id="outlet-container">
                <Outlet />
              </div>
            </RouteWrapper>
          </ErrorBoundary>
        </main>
      </div>
      {/* Footer always at the bottom */}
      <Footer />
    </div>
  );
};

export default MainLayout;

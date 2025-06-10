import React from 'react';
import SimpleHeader from './SimpleHeader';
import ModernSidebar from './ModernSidebar';
import { cn } from '../../lib/utils';

interface MainLayoutProps {
  children: React.ReactNode;
  className?: string;
}

const MainLayout: React.FC<MainLayoutProps> = ({ 
  children, 
  className
}) => {
  return (
    <div className="min-h-screen flex bg-background">
      {/* Modern Sidebar - hidden on mobile */}
      <div className="hidden md:block">
        <ModernSidebar />
      </div>
      
      {/* Mobile Header - only shown on mobile */}
      <div className="md:hidden w-full">
        <SimpleHeader />
      </div>
      
      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Mobile: account for header height, Desktop: full height */}
        <main className={cn(
          "flex-1 p-6 overflow-auto",
          "md:h-screen", // Full height on desktop
          "pt-0 md:pt-6", // No top padding on mobile (header handles it)
          className
        )}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
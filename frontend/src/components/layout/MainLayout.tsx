import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import { cn } from '../../lib/utils';

interface MainLayoutProps {
  children: React.ReactNode;
  className?: string;
  showSidebar?: boolean;
}

const MainLayout: React.FC<MainLayoutProps> = ({ 
  children, 
  className,
  showSidebar = true
}) => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <div className="flex flex-1">
        {showSidebar && (
          <Sidebar className="hidden md:block" />
        )}
        
        <main className={cn(
          "flex-1 p-6 overflow-auto",
          className
        )}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
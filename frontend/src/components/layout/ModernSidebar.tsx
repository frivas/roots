import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useUser, UserButton } from '@clerk/clerk-react';
import { useClerk } from '@clerk/clerk-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';
import { 
  Home, 
  BookOpen, 
  Mail, 
  Bell, 
  Settings, 
  User, 
  LogOut,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface ModernSidebarProps {
  className?: string;
}

const ModernSidebar: React.FC<ModernSidebarProps> = ({ className }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const location = useLocation();
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  
  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Services', href: '/services', icon: BookOpen },
    { name: 'Messages', href: '/messages', icon: Mail },
    { name: 'Notifications', href: '/notifications', icon: Bell },
    { name: 'Settings', href: '/settings', icon: Settings },
    { name: 'Profile', href: '/profile', icon: User },
  ];
  
  const handleSignOut = () => {
    signOut();
  };

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <motion.div 
      className={cn(
        "flex h-screen flex-col bg-card border-r border-border relative z-10",
        className
      )}
      animate={{
        width: isExpanded ? "280px" : "80px"
      }}
      transition={{
        duration: 0.3,
        ease: "easeInOut"
      }}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      {/* Header with Logo */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <Link to="/" className="flex items-center min-w-0">
          <div className="text-primary flex-shrink-0">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l2-1.14" />
              <path d="M16.5 9.4 7.55 4.24" />
              <polyline points="3.29 7 12 12 20.71 7" />
              <line x1="12" y1="22" x2="12" y2="12" />
              <circle cx="18.5" cy="15.5" r="2.5" />
              <path d="M20.27 17.27 22 19" />
            </svg>
          </div>
          <AnimatePresence>
            {isExpanded && (
              <motion.span 
                className="ml-3 text-xl font-bold text-foreground whitespace-nowrap"
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
              >
                Roots
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
        
        {isExpanded && (
          <button
            onClick={toggleSidebar}
            className="p-1 rounded-md hover:bg-muted transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = location.pathname.startsWith(item.href);
          
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "flex items-center rounded-lg px-3 py-3 text-sm font-medium transition-all duration-200 relative group",
                isActive
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
              title={!isExpanded ? item.name : undefined}
            >
              <item.icon className={cn(
                "flex-shrink-0",
                isExpanded ? "h-5 w-5" : "h-6 w-6"
              )} />
              <AnimatePresence>
                {isExpanded && (
                  <motion.span 
                    className="ml-3 whitespace-nowrap"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.15 }}
                  >
                    {item.name}
                  </motion.span>
                )}
              </AnimatePresence>
              
              {/* Tooltip for collapsed state */}
              {!isExpanded && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50 border shadow-md">
                  {item.name}
                </div>
              )}
            </Link>
          );
        })}
      </nav>
      
      {/* User Section */}
      <div className="border-t border-border p-4 space-y-3">
        {isLoaded && user && (
          <div className={cn(
            "flex items-center rounded-lg p-3 hover:bg-muted transition-colors cursor-pointer",
            !isExpanded && "justify-center"
          )}>
            <div className="flex-shrink-0">
              <UserButton 
                appearance={{
                  elements: {
                    avatarBox: "w-8 h-8"
                  }
                }}
              />
            </div>
            <AnimatePresence>
              {isExpanded && (
                <motion.div 
                  className="ml-3 min-w-0 flex-1"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.15 }}
                >
                  <div className="text-sm font-medium text-foreground truncate">
                    {user.fullName || user.emailAddresses[0]?.emailAddress}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {user.emailAddresses[0]?.emailAddress}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
        
        {/* Sign Out Button */}
        <button
          onClick={handleSignOut}
          className={cn(
            "flex w-full items-center rounded-lg px-3 py-3 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-200",
            !isExpanded && "justify-center"
          )}
          title={!isExpanded ? "Sign out" : undefined}
        >
          <LogOut className={cn(
            "flex-shrink-0",
            isExpanded ? "h-5 w-5" : "h-6 w-6"
          )} />
          <AnimatePresence>
            {isExpanded && (
              <motion.span 
                className="ml-3 whitespace-nowrap"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.15 }}
              >
                Sign out
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
      
      {/* Expand button for collapsed state */}
      {!isExpanded && (
        <button
          onClick={toggleSidebar}
          className="absolute -right-3 top-8 bg-background border border-border rounded-full p-1 shadow-md hover:bg-muted transition-colors z-20"
        >
          <ChevronRight className="h-3 w-3" />
        </button>
      )}
    </motion.div>
  );
};

export default ModernSidebar; 
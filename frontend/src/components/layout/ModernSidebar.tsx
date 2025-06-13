import React, { useState } from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { cn } from '../../lib/utils';
import TranslatedText from '../TranslatedText';
import { getMenuItems, type Role } from '../../config/menuConfig';
import { useUser, useClerk } from '@clerk/clerk-react';
import {
  LogOut,
  LucideIcon
} from 'lucide-react';
import MadridLogo from '../ui/MadridLogo';

interface MenuItem {
  name: string;
  href?: string;
  icon: LucideIcon;
  children?: MenuItem[];
}

interface ModernSidebarProps {
  className?: string;
  userRoles?: Role[];
}

const ModernSidebar: React.FC<ModernSidebarProps> = ({ userRoles = [] }) => {
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const location = useLocation();
  const { user } = useUser();
  const { signOut } = useClerk();

  const toggleMenu = (menuName: string) => {
    setExpandedMenu(expandedMenu === menuName ? null : menuName);
  };

  const isMenuActive = (item: MenuItem) => {
    if (item.href) {
      return location.pathname === item.href;
    }
    if (item.children) {
      return item.children.some((child) => location.pathname === child.href);
    }
    return false;
  };

  const navigation = getMenuItems(userRoles);

  const IconComponent = ({ icon: Icon, className }: { icon: LucideIcon; className?: string }) => {
    const IconElement = Icon as unknown as React.ComponentType<{ className?: string }>;
    return <IconElement className={cn("h-6 w-6", className)} />;
  };

  const Link = RouterLink as unknown as React.ComponentType<{
    to: string;
    className?: string;
    children: React.ReactNode;
  }>;

  return (
    <div
      className={cn(
        "relative min-h-screen border-r bg-background transition-all duration-300",
        isHovered ? "w-72" : "w-16"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex h-full flex-col">
        <div className={cn(
          "flex h-16 items-center border-b",
          isHovered ? "px-6" : "px-3"
        )}>
          <Link to="/" className="flex items-center gap-3 font-semibold">
            <MadridLogo size="sm" variant="positive" />
            {isHovered && <TranslatedText className="text-lg">Roots</TranslatedText>}
          </Link>
        </div>
        <div className="flex-1 overflow-auto py-4">
          <nav className={cn(
            "grid gap-2",
            isHovered ? "px-4" : "px-2"
          )}>
            {navigation.map((item) => (
              <div key={item.name}>
                {item.children ? (
                  <>
                    <button
                      onClick={() => toggleMenu(item.name)}
                      className={cn(
                        "group flex w-full items-center rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                        isHovered ? "px-4 py-3" : "px-2 py-3",
                        isMenuActive(item) ? "bg-accent text-accent-foreground" : "transparent"
                      )}
                    >
                      <div className="flex items-center justify-center w-6 min-w-[24px]">
                        <IconComponent icon={item.icon} />
                      </div>
                      {isHovered && (
                        <span className="flex-1 text-base ml-3">
                          <TranslatedText>{item.name}</TranslatedText>
                        </span>
                      )}
                    </button>
                    {isHovered && expandedMenu === item.name && (
                      <div className="ml-6 mt-2 space-y-2">
                        {item.children.map((child) => (
                          <Link
                            key={child.name}
                            to={child.href || '#'}
                            className={cn(
                              "group flex items-center rounded-md px-4 py-2.5 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                              location.pathname === child.href ? "bg-accent text-accent-foreground" : "transparent"
                            )}
                          >
                            <div className="flex items-center justify-center w-6 min-w-[24px]">
                              <IconComponent icon={child.icon} />
                            </div>
                            <span className="text-base ml-3">
                              <TranslatedText>{child.name}</TranslatedText>
                            </span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    to={item.href || '#'}
                    className={cn(
                      "group flex items-center rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                      isHovered ? "px-4 py-3" : "px-2 py-3",
                      location.pathname === item.href ? "bg-accent text-accent-foreground" : "transparent"
                    )}
                  >
                    <div className="flex items-center justify-center w-6 min-w-[24px]">
                      <IconComponent icon={item.icon} />
                    </div>
                    {isHovered && (
                      <span className="text-base ml-3">
                        <TranslatedText>{item.name}</TranslatedText>
                      </span>
                    )}
                  </Link>
                )}
              </div>
            ))}
          </nav>
        </div>

        {/* User Profile Section */}
        <div className={cn(
          "mt-auto border-t",
          isHovered ? "p-4" : "p-2"
        )}>
          {/* User Info */}
          {isHovered && user && (
            <div className="mb-4 flex flex-col items-center justify-center px-4">
              <div className="flex flex-col items-center gap-2 w-full">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-xl font-semibold text-primary">
                    {user.firstName?.[0] || user.emailAddresses[0]?.emailAddress[0] || 'U'}
                  </span>
                </div>
                <div className="flex flex-col items-center w-full">
                  <p className="text-sm font-medium truncate w-full text-center">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground truncate w-full text-center">
                    {user.emailAddresses[0]?.emailAddress}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Sign Out Button */}
          <div className="flex flex-col items-center w-full">
            <button
              onClick={() => signOut()}
              className={cn(
                "flex items-center justify-center rounded-md text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 w-full max-w-[180px]",
                isHovered ? "px-4 py-3 mt-0" : "px-2 py-3 mt-0"
              )}
            >
              <div className="flex items-center justify-center w-6 min-w-[24px]">
                <IconComponent icon={LogOut} />
              </div>
              {isHovered && (
                <span className="text-base ml-3">
                  <TranslatedText>Sign Out</TranslatedText>
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernSidebar;

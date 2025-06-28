import React, { useState, useEffect, useMemo } from 'react';
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
  hideBottomBorder?: boolean;
}



const ModernSidebar: React.FC<ModernSidebarProps> = ({ userRoles = [], hideBottomBorder = false }) => {
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set());
  const [isHovered, setIsHovered] = useState(false);
  const location = useLocation();
  const { user } = useUser();
  const { signOut } = useClerk();

  const navigation = useMemo(() => getMenuItems(userRoles), [userRoles]);

  // Auto-expand menus that contain the current page (only for specific routes, not root)
  useEffect(() => {
    // Don't auto-expand anything on root path or empty paths
    if (location.pathname === '/' || location.pathname === '') {
      return;
    }

    const findMenusToExpand = (items: MenuItem[], path: string): string[] => {
      const menusToExpand: string[] = [];

      items.forEach(item => {
        if (item.children) {
          // Check if this menu contains the current page
          const containsCurrentPage = item.children.some(child => {
            if (child.href === path) return true;
            if (child.children) {
              return child.children.some(grandchild => grandchild.href === path);
            }
            return false;
          });

          if (containsCurrentPage) {
            menusToExpand.push(item.name);

            // Also check for nested menus
            item.children.forEach(child => {
              if (child.children) {
                const hasActiveGrandchild = child.children.some(grandchild => grandchild.href === path);
                if (hasActiveGrandchild) {
                  menusToExpand.push(child.name);
                }
              }
            });
          }
        }
      });

      return menusToExpand;
    };

    // Only auto-expand on route changes, preserve manual toggles
    const menusToExpand = findMenusToExpand(navigation, location.pathname);
    if (menusToExpand.length > 0) {
      setExpandedMenus(prev => {
        const newSet = new Set(prev);
        menusToExpand.forEach(menu => newSet.add(menu));
        return newSet;
      });
    }
  }, [location.pathname, navigation]);

  const toggleMenu = (menuName: string) => {
    console.log('Toggling menu:', menuName); // Debug log
    setExpandedMenus(prev => {
      const newSet = new Set(prev);
      if (newSet.has(menuName)) {
        newSet.delete(menuName);
        console.log('Collapsed:', menuName); // Debug log
      } else {
        newSet.add(menuName);
        console.log('Expanded:', menuName); // Debug log
      }
      console.log('Current expanded menus:', Array.from(newSet)); // Debug log
      return newSet;
    });
  };

  const IconComponent = ({ icon: Icon, className }: { icon: LucideIcon; className?: string }) => {
    const IconElement = Icon as unknown as React.ComponentType<{ className?: string }>;
    return <IconElement className={cn("h-6 w-6", className)} />;
  };

  // Helper function to check if a menu item should be active
  const isMenuItemActive = (item: MenuItem): boolean => {
    // If item has direct href, check if current path matches
    if (item.href) {
      return location.pathname === item.href;
    }

    // For items with children but no href, they should never be highlighted
    // Only the specific selected child should be highlighted
    return false;
  };

  const Link = RouterLink as unknown as React.ComponentType<{
    to: string;
    className?: string;
    children: React.ReactNode;
  }>;

  // For desktop (md and up): always expanded (w-72)
  // For mobile: hover to expand (w-16 default, w-72 on hover)
  const isExpanded = isHovered; // Mobile hover state

  return (
    <div
      className={cn(
        "relative border-r bg-background transition-all duration-300 flex flex-col flex-1",
        // Mobile: hover effect (w-16 collapsed, w-72 expanded)
        "w-16 md:w-72",
        isExpanded && "w-72"
      )}
      // Only add hover effects on mobile (below md breakpoint)
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header Section */}
      <div className={cn(
        "flex h-16 items-center border-b flex-shrink-0",
        // Mobile: responsive padding to match menu items, Desktop: always px-4
        "px-1 md:px-4",
        isExpanded && "px-4"
      )}>
        <Link to="/home" className={cn(
          "flex items-center gap-3 font-semibold",
          // Always left-aligned to match menu items
          "justify-start w-full",
          // Add padding to match menu item alignment
          "px-0 py-3 md:px-4 md:py-3",
          isExpanded && "px-4 py-3"
        )}>
          <div className={cn(
            "flex items-center justify-center",
            // Match menu item icon container sizing
            "w-6 h-6 md:w-6 md:min-w-[24px]",
            isExpanded && "w-6 min-w-[24px]"
          )}>
            <MadridLogo size="sm" variant="positive" />
          </div>
          {/* Mobile: show text on hover, Desktop: always show */}
          <span className={cn(
            "text-lg font-semibold text-foreground ml-3",
            "hidden md:block",
            isExpanded && "block"
          )}>
            <TranslatedText>Raíces</TranslatedText>
          </span>
        </Link>
      </div>

      {/* Navigation Section - Takes available space */}
      <div className="flex-1 overflow-auto py-4">
        <nav className={cn(
          "grid gap-2",
          // Mobile: responsive padding, Desktop: always px-4
          "px-1 md:px-4",
          isExpanded && "px-4"
        )}>
          {navigation.map((item) => (
            <div key={item.name}>
              {item.children && !item.href ? (
                // Item with only children - expandable button
                <>
                  <button
                    onClick={() => toggleMenu(item.name)}
                    className={cn(
                      "group flex w-full items-center rounded-md text-sm font-medium transition-colors",
                      // Mobile: responsive padding and alignment, Desktop: always px-4 py-3 left-aligned
                      "px-0 py-3 justify-center md:px-4 md:py-3 md:justify-start",
                      isExpanded && "px-4 py-3 justify-start",
                      isMenuItemActive(item)
                        ? "bg-red-500/20 text-red-700 font-semibold"
                        : "text-muted-foreground hover:bg-red-500/10 hover:text-red-700"
                    )}
                  >
                    <div className={cn(
                      "flex items-center justify-center",
                      // Mobile: w-6 h-6 when collapsed, Desktop: always w-6 min-w-[24px]
                      "w-6 h-6 md:w-6 md:min-w-[24px]",
                      isExpanded && "w-6 min-w-[24px]"
                    )}>
                      <IconComponent icon={item.icon} />
                    </div>
                    {/* Mobile: show text on hover, Desktop: always show */}
                    <span className={cn(
                      "text-sm font-medium ml-3",
                      "hidden md:block",
                      isExpanded && "block"
                    )}>
                      <TranslatedText>{item.name}</TranslatedText>
                    </span>
                  </button>
                  {/* Mobile: show submenu on hover, Desktop: always show when expanded */}
                  <div className={cn(
                    "ml-6 mt-2 space-y-2 relative",
                    "hidden md:block",
                    isExpanded && expandedMenus.has(item.name) && "block",
                    (!isExpanded || !expandedMenus.has(item.name)) && "md:hidden",
                    expandedMenus.has(item.name) && "md:block"
                  )}>
                    {/* Connector line from parent to children */}
                    <div className="absolute left-[-12px] top-0 bottom-0 w-px bg-border"></div>
                    {item.children.map((child) => (
                      <div key={child.name} className="relative">
                        {/* Horizontal connector line */}
                        <div className="absolute left-[-12px] top-1/2 w-3 h-px bg-border"></div>
                        {child.children && !child.href ? (
                          // Child with only children - expandable button
                          <>
                            <button
                              onClick={() => toggleMenu(child.name)}
                              className={cn(
                                "group flex w-full items-center rounded-md px-4 py-2.5 text-sm font-medium transition-colors",
                                isMenuItemActive(child)
                                  ? "bg-red-500/20 text-red-700 font-semibold"
                                  : "text-muted-foreground hover:bg-red-500/10 hover:text-red-700"
                              )}
                            >
                              <div className="flex items-center justify-center w-6 min-w-[24px]">
                                <IconComponent icon={child.icon} />
                              </div>
                              <span className="text-sm font-medium ml-3">
                                <TranslatedText>{child.name}</TranslatedText>
                              </span>
                            </button>
                            {expandedMenus.has(child.name) && (
                              <div className="ml-6 mt-2 space-y-2">
                                {child.children.map((grandchild) => (
                                  grandchild.href ? (
                                    <Link
                                      key={grandchild.name}
                                      to={grandchild.href}
                                      className={cn(
                                        "group flex items-center rounded-md px-4 py-2.5 text-sm font-medium transition-colors",
                                        location.pathname === grandchild.href
                                          ? "bg-red-500/20 text-red-700 font-semibold"
                                          : "text-muted-foreground hover:bg-red-500/10 hover:text-red-700"
                                      )}
                                    >
                                      <div className="flex items-center justify-center w-6 min-w-[24px]">
                                        <IconComponent icon={grandchild.icon} />
                                      </div>
                                      <span className="text-sm font-medium ml-3">
                                        <TranslatedText>{grandchild.name}</TranslatedText>
                                      </span>
                                    </Link>
                                  ) : (
                                    <div
                                      key={grandchild.name}
                                      className="group flex items-center rounded-md px-4 py-2.5 text-sm font-medium text-muted-foreground cursor-default"
                                    >
                                      <div className="flex items-center justify-center w-6 min-w-[24px]">
                                        <IconComponent icon={grandchild.icon} />
                                      </div>
                                      <span className="text-sm font-medium ml-3">
                                        <TranslatedText>{grandchild.name}</TranslatedText>
                                      </span>
                                    </div>
                                  )
                                ))}
                              </div>
                            )}
                          </>
                        ) : (
                          // Child with href - simple clickable link
                          child.href ? (
                            <Link
                              to={child.href}
                              className={cn(
                                "group flex items-center rounded-md px-4 py-2.5 text-sm font-medium transition-colors",
                                location.pathname === child.href
                                  ? "bg-red-500/20 text-red-700 font-semibold"
                                  : "text-muted-foreground hover:bg-red-500/10 hover:text-red-700"
                              )}
                            >
                              <div className="flex items-center justify-center w-6 min-w-[24px]">
                                <IconComponent icon={child.icon} />
                              </div>
                              <span className="text-sm font-medium ml-3">
                                <TranslatedText>{child.name}</TranslatedText>
                              </span>
                            </Link>
                          ) : (
                            <div className="group flex items-center rounded-md px-4 py-2.5 text-sm font-medium text-muted-foreground cursor-default">
                              <div className="flex items-center justify-center w-6 min-w-[24px]">
                                <IconComponent icon={child.icon} />
                              </div>
                              <span className="text-sm font-medium ml-3">
                                <TranslatedText>{child.name}</TranslatedText>
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                // Item with href - simple clickable link
                item.href ? (
                  <Link
                    to={item.href}
                    className={cn(
                      "group flex w-full items-center rounded-md text-sm font-medium transition-colors",
                      // Mobile: responsive padding and alignment, Desktop: always px-4 py-3 left-aligned
                      "px-0 py-3 justify-center md:px-4 md:py-3 md:justify-start",
                      isExpanded && "px-4 py-3 justify-start",
                      location.pathname === item.href
                        ? "bg-red-500/20 text-red-700 font-semibold"
                        : "text-muted-foreground hover:bg-red-500/10 hover:text-red-700"
                    )}
                  >
                    <div className={cn(
                      "flex items-center justify-center",
                      // Mobile: w-6 h-6 when collapsed, Desktop: always w-6 min-w-[24px]
                      "w-6 h-6 md:w-6 md:min-w-[24px]",
                      isExpanded && "w-6 min-w-[24px]"
                    )}>
                      <IconComponent icon={item.icon} />
                    </div>
                    {/* Mobile: show text on hover, Desktop: always show */}
                    <span className={cn(
                      "text-sm font-medium ml-3",
                      "hidden md:block",
                      isExpanded && "block"
                    )}>
                      <TranslatedText>{item.name}</TranslatedText>
                    </span>
                  </Link>
                ) : (
                  <div className="group flex w-full items-center rounded-md text-sm font-medium text-muted-foreground cursor-default px-0 py-3 justify-center md:px-4 md:py-3 md:justify-start">
                    <div className={cn(
                      "flex items-center justify-center",
                      // Mobile: w-6 h-6 when collapsed, Desktop: always w-6 min-w-[24px]
                      "w-6 h-6 md:w-6 md:min-w-[24px]",
                      isExpanded && "w-6 min-w-[24px]"
                    )}>
                      <IconComponent icon={item.icon} />
                    </div>
                    {/* Mobile: show text on hover, Desktop: always show */}
                    <span className={cn(
                      "text-sm font-medium ml-3",
                      "hidden md:block",
                      isExpanded && "block"
                    )}>
                      <TranslatedText>{item.name}</TranslatedText>
                    </span>
                  </div>
                )
              )}
            </div>
          ))}
        </nav>
      </div>

      {/* User Profile and Sign Out Section - Always at bottom */}
      <div className={cn(
        "bg-background flex-shrink-0",
        !hideBottomBorder && "border-t",
        // Mobile: responsive padding, Desktop: always p-4
        "py-4 px-2 md:p-4",
        isExpanded && "p-4"
      )}>
        {/* User Info */}
        {/* Mobile: show user info on hover, Desktop: always show */}
        <div className={cn(
          "mb-4 flex flex-col items-center justify-center",
          "hidden md:flex",
          isExpanded && user && "flex"
        )}>
          {user && (
            <div className="flex flex-col items-center gap-2 w-full">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                {user.imageUrl ? (
                  <img
                    src={user.imageUrl}
                    alt={`${user.firstName || 'User'} ${user.lastName || ''}`}
                    className="h-full w-full object-cover rounded-full"
                  />
                ) : (
                  <span className="text-xl font-semibold text-primary">
                    {user.firstName?.[0] || user.emailAddresses[0]?.emailAddress[0] || 'U'}
                  </span>
                )}
              </div>
              <div className="flex flex-col items-center w-full">
                <p className="text-sm font-medium truncate w-full text-center text-foreground">
                  {user.firstName && user.lastName
                    ? `${user.firstName} ${user.lastName}`
                    : user.firstName || user.lastName || <TranslatedText>User</TranslatedText>
                  }
                </p>
                <p className="text-xs text-muted-foreground truncate w-full text-center">
                  {user.emailAddresses[0]?.emailAddress}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Sign Out Button */}
        <div className="flex justify-center w-full">
          <button
            onClick={() => signOut()}
            className={cn(
              "flex items-center rounded-md text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors",
              // Mobile: responsive layout, Desktop: always expanded style
              "px-0 py-3 w-full justify-center md:px-4 md:py-3 md:w-full md:max-w-[180px] md:justify-center",
              isExpanded && "px-4 py-3 w-full max-w-[180px] justify-center"
            )}
          >
            <div className={cn(
              "flex items-center justify-center",
              // Mobile: w-6 h-6 when collapsed, Desktop: always w-6 min-w-[24px]
              "w-6 h-6 md:w-6 md:min-w-[24px]",
              isExpanded && "w-6 min-w-[24px]"
            )}>
              <IconComponent icon={LogOut} />
            </div>
            {/* Mobile: show text on hover, Desktop: always show */}
            <span className={cn(
              "text-sm font-medium ml-3",
              "hidden md:block",
              isExpanded && "block"
            )}>
              <TranslatedText>Sign Out</TranslatedText>
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModernSidebar;

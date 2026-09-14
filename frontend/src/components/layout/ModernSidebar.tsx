import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router';
import { useClerk, useUser } from '@clerk/clerk-react';
import { LogOut } from 'lucide-react';
import { getActiveNavigationPath } from '../../config/routes';
import {
  getMenuDestinations,
  getMenuItems,
  type MenuItem,
  type Role,
} from '../../config/menuConfig';
import { cn } from '../../lib/utils';
import TranslatedText from '../TranslatedText';
import MadridLogo from '../ui/MadridLogo';

interface ModernSidebarProps {
  className?: string;
  userRoles?: Role[];
  hideBottomBorder?: boolean;
}

const findActiveAncestors = (items: readonly MenuItem[], activeHref?: string): string[] =>
  items.flatMap(item => {
    if (!item.children) return [];
    const descendants = getMenuDestinations(item.children);
    return descendants.some(href => href === activeHref)
      ? [item.name, ...findActiveAncestors(item.children, activeHref)]
      : [];
  });

const ModernSidebar: React.FC<ModernSidebarProps> = ({
  className,
  userRoles = [],
  hideBottomBorder = false,
}) => {
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set());
  const location = useLocation();
  const { user } = useUser();
  const { signOut } = useClerk();
  const navigation = useMemo(
    () => getMenuItems(userRoles, user?.primaryEmailAddress?.emailAddress),
    [userRoles, user?.primaryEmailAddress?.emailAddress],
  );
  const activeHref = getActiveNavigationPath(location.pathname, getMenuDestinations(navigation));

  useEffect(() => {
    const ancestors = findActiveAncestors(navigation, activeHref);
    if (ancestors.length === 0) return;
    setExpandedMenus(previous => new Set([...previous, ...ancestors]));
  }, [activeHref, navigation]);

  const toggleMenu = (name: string) => {
    setExpandedMenus(previous => {
      const next = new Set(previous);
      if (next.has(name)) {
        next.delete(name);
      } else {
        next.add(name);
      }
      return next;
    });
  };

  const renderItem = (item: MenuItem, depth = 0): React.ReactNode => {
    const Icon = item.icon;
    if (item.children && !item.href) {
      const expanded = expandedMenus.has(item.name);
      const containsActive = getMenuDestinations(item.children).some(href => href === activeHref);
      return (
        <div key={item.name}>
          <button
            type="button"
            onClick={() => toggleMenu(item.name)}
            aria-expanded={expanded}
            className={cn(
              'group flex w-full items-center rounded-md px-4 py-3 text-sm font-medium transition-colors',
              containsActive
                ? 'text-primary'
                : 'text-muted-foreground hover:bg-primary/10 hover:text-primary',
            )}
          >
            <Icon className="h-6 w-6 shrink-0" aria-hidden="true" />
            <span className="ml-3"><TranslatedText>{item.name}</TranslatedText></span>
          </button>
          {expanded && (
            <div className={cn('mt-2 space-y-2 border-l border-border pl-3', depth === 0 && 'ml-6')}>
              {item.children.map(child => renderItem(child, depth + 1))}
            </div>
          )}
        </div>
      );
    }

    if (item.href) {
      const active = activeHref === item.href;
      return (
        <Link
          key={item.name}
          to={item.href}
          aria-current={active ? 'page' : undefined}
          className={cn(
            'group flex items-center rounded-md px-4 py-2.5 text-sm font-medium transition-colors',
            active
              ? 'bg-primary/15 text-primary font-semibold'
              : 'text-muted-foreground hover:bg-primary/10 hover:text-primary',
          )}
        >
          <Icon className="h-6 w-6 shrink-0" aria-hidden="true" />
          <span className="ml-3"><TranslatedText>{item.name}</TranslatedText></span>
        </Link>
      );
    }

    return (
      <div key={item.name} className="flex items-center rounded-md px-4 py-2.5 text-sm text-muted-foreground">
        <Icon className="h-6 w-6 shrink-0" aria-hidden="true" />
        <span className="ml-3"><TranslatedText>{item.name}</TranslatedText></span>
      </div>
    );
  };

  return (
    <aside className={cn('relative flex w-72 flex-1 flex-col border-r bg-background', className)}>
      <div className="flex h-16 shrink-0 items-center border-b px-4">
        <Link to="/home" className="flex w-full items-center gap-3 px-4 py-3 font-semibold">
          <MadridLogo size="sm" variant="positive" />
          <span className="text-lg font-semibold text-foreground"><TranslatedText>Raíces</TranslatedText></span>
        </Link>
      </div>

      <span id="sidebar-navigation-label" className="sr-only">
        <TranslatedText>Main navigation</TranslatedText>
      </span>
      <nav
        className="grid flex-1 gap-2 overflow-auto px-4 py-4"
        aria-labelledby="sidebar-navigation-label"
      >
        {navigation.map(item => renderItem(item))}
      </nav>

      <div className={cn('shrink-0 bg-background p-4', !hideBottomBorder && 'border-t')}>
        {user && (
          <div className="mb-4 flex flex-col items-center gap-2">
            <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-primary/10">
              {user.imageUrl ? (
                <img
                  src={user.imageUrl}
                  alt={`${user.firstName || 'User'} ${user.lastName || ''}`.trim()}
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                <span className="text-xl font-semibold text-primary">
                  {user.firstName?.[0] || user.emailAddresses[0]?.emailAddress[0] || 'U'}
                </span>
              )}
            </div>
            <p className="w-full truncate text-center text-sm font-medium text-foreground">
              {user.firstName && user.lastName
                ? `${user.firstName} ${user.lastName}`
                : user.firstName || user.lastName || <TranslatedText>User</TranslatedText>}
            </p>
            <p className="w-full truncate text-center text-xs text-muted-foreground">
              {user.emailAddresses[0]?.emailAddress}
            </p>
          </div>
        )}
        <button
          type="button"
          onClick={() => signOut()}
          className="flex w-full items-center justify-center rounded-md px-4 py-3 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
        >
          <LogOut className="h-6 w-6" aria-hidden="true" />
          <span className="ml-3"><TranslatedText>Sign Out</TranslatedText></span>
        </button>
      </div>
    </aside>
  );
};

export default ModernSidebar;

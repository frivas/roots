import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router';
import { useUser, UserButton } from '@clerk/clerk-react';
import { useClerk } from '@clerk/clerk-react';
import { Menu, X, LogOut } from 'lucide-react';
import { cn } from '../../lib/utils';
import MadridLogo from '../ui/MadridLogo';
import TranslatedText from '../TranslatedText';
import { getMenuDestinations, getMenuItems } from '../../config/menuConfig';
import { APP_ROUTES, getActiveNavigationPath } from '../../config/routes';
import { getClerkRoles } from '../../lib/clerkRoles';
import LanguageSwitcher from '../LanguageSwitcher';

const SimpleHeader: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const location = useLocation();
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const mobileNavigationRef = useRef<HTMLElement>(null);

  const userRoles = useMemo(() => {
    return getClerkRoles(user?.publicMetadata);
  }, [user?.publicMetadata]);
  const navigation = useMemo(
    () => getMenuItems(userRoles, user?.primaryEmailAddress?.emailAddress),
    [userRoles, user?.primaryEmailAddress?.emailAddress],
  );
  const activeHref = getActiveNavigationPath(
    location.pathname,
    getMenuDestinations(navigation),
  );

  useEffect(() => {
    if (!mobileMenuOpen) return;

    const navigation = mobileNavigationRef.current;
    const focusableSelector = 'a[href], button:not([disabled])';
    const focusableItems = () =>
      Array.from(navigation?.querySelectorAll<HTMLElement>(focusableSelector) ?? [])
        .filter(item => !item.closest('details:not([open])'));

    focusableItems()[0]?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setMobileMenuOpen(false);
        menuButtonRef.current?.focus();
        return;
      }

      if (event.key !== 'Tab') return;
      const items = focusableItems();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(open => !open);
  };

  const handleSignOut = () => {
    signOut();
  };

  return (
    <header className="bg-background border-b border-border md:hidden">
      <div className="px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Madrid Logo for mobile */}
          <Link to={APP_ROUTES.home} className="flex items-center gap-3">
            <MadridLogo size="sm" />
            <span className="text-xl font-bold text-foreground">Raíces</span>
          </Link>

          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            {/* Mobile menu button */}
            <button
              ref={menuButtonRef}
              type="button"
              className="inline-flex items-center justify-center rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
              onClick={toggleMobileMenu}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-navigation"
            >
              <span className="sr-only"><TranslatedText>Open main menu</TranslatedText></span>
              {mobileMenuOpen ? (
                <X className="h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <nav
          ref={mobileNavigationRef}
          id="mobile-navigation"
          aria-labelledby="mobile-navigation-label"
          className="animate-fade-in border-t border-border bg-background"
        >
          <span id="mobile-navigation-label" className="sr-only">
            <TranslatedText>Main navigation</TranslatedText>
          </span>
          <div className="space-y-1 px-4 pb-3 pt-2">
            {/* Navigation Links */}
            {navigation.map((group, index) => (
              <details
                key={group.name}
                className="py-1"
                open={index === 0 || getMenuDestinations([group]).some(href => href === activeHref)}
              >
                <summary className="cursor-pointer rounded-lg px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground hover:bg-muted hover:text-foreground">
                  <TranslatedText>{group.name}</TranslatedText>
                </summary>
                {group.children?.map(item => item.href && (
                  <Link
                    key={item.name}
                    to={item.href}
                    aria-current={activeHref === item.href ? 'page' : undefined}
                    className={cn(
                      "flex items-center py-3 text-base font-medium transition-colors rounded-lg px-3",
                      activeHref === item.href
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <item.icon className="mr-3 h-5 w-5" aria-hidden="true" />
                    <TranslatedText>{item.name}</TranslatedText>
                  </Link>
                ))}
              </details>
            ))}


            {/* User Section */}
            {isLoaded && user && (
              <div className="border-t border-border pt-3 mt-3">
                <div className="flex items-center py-3 px-3 rounded-lg">
                  <UserButton
                    appearance={{
                      elements: {
                        avatarBox: "w-8 h-8"
                      }
                    }}
                  />
                  <div className="ml-3">
                    <div className="text-sm font-medium text-foreground">
                      {user.fullName || user.emailAddresses[0]?.emailAddress}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {user.emailAddresses[0]?.emailAddress}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    handleSignOut();
                    setMobileMenuOpen(false);
                  }}
                  className="flex w-full items-center py-3 text-base font-medium text-muted-foreground hover:bg-muted hover:text-foreground rounded-lg px-3"
                >
                  <LogOut className="mr-3 h-5 w-5" aria-hidden="true" />
                  <TranslatedText>Sign out</TranslatedText>
                </button>
              </div>
            )}
          </div>
        </nav>
      )}
    </header>
  );
};

export default SimpleHeader;

import React, { useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useUser, UserButton } from '@clerk/clerk-react';
import { useClerk } from '@clerk/clerk-react';
import { Menu, X, LogOut } from 'lucide-react';
import { cn } from '../../lib/utils';
import MadridLogo from '../ui/MadridLogo';
import TranslatedText from '../TranslatedText';
import { getMenuItems, type Role } from '../../config/menuConfig';

const SimpleHeader: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const location = useLocation();

  const userRoles = useMemo(() => {
    const roles = user?.publicMetadata?.roles;
    if (!Array.isArray(roles)) return [];
    return roles.filter((role): role is Role =>
      ['student', 'parent', 'teacher', 'administrator'].includes(String(role)),
    );
  }, [user?.publicMetadata?.roles]);
  const navigation = useMemo(
    () => getMenuItems(userRoles, user?.primaryEmailAddress?.emailAddress),
    [userRoles, user?.primaryEmailAddress?.emailAddress],
  );

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleSignOut = () => {
    signOut();
  };

  return (
    <header className="bg-background border-b border-border md:hidden">
      <div className="px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Madrid Logo for mobile */}
          <Link to="/home" className="flex items-center gap-3">
            <MadridLogo size="sm" />
            <span className="text-xl font-bold text-foreground">Raíces</span>
          </Link>

          {/* Mobile menu button */}
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
            onClick={toggleMobileMenu}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation"
          >
            <span className="sr-only">Open main menu</span>
            {mobileMenuOpen ? (
              <X className="h-6 w-6" aria-hidden="true" />
            ) : (
              <Menu className="h-6 w-6" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div id="mobile-navigation" className="animate-fade-in bg-background border-t border-border">
          <div className="space-y-1 px-4 pb-3 pt-2">
            {/* Navigation Links */}
            {navigation.map((group) => (
              <div key={group.name} className="py-1">
                <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <TranslatedText>{group.name}</TranslatedText>
                </p>
                {group.children?.map(item => item.href && (
                  <Link
                    key={item.name}
                    to={item.href}
                    aria-current={location.pathname === item.href ? 'page' : undefined}
                    className={cn(
                      "flex items-center py-3 text-base font-medium transition-colors rounded-lg px-3",
                      location.pathname === item.href
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <item.icon className="mr-3 h-5 w-5" aria-hidden="true" />
                    <TranslatedText>{item.name}</TranslatedText>
                  </Link>
                ))}
              </div>
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
                  onClick={() => {
                    handleSignOut();
                    setMobileMenuOpen(false);
                  }}
                  className="flex w-full items-center py-3 text-base font-medium text-muted-foreground hover:bg-muted hover:text-foreground rounded-lg px-3"
                >
                  <LogOut className="mr-3 h-5 w-5" />
                  <TranslatedText>Sign out</TranslatedText>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default SimpleHeader;

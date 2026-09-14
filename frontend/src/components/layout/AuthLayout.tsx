import React from 'react';
import { cn } from '../../lib/utils';
import MadridLogo from '../ui/MadridLogo';
import TranslatedText from '../TranslatedText';
import LanguageSwitcher from '../LanguageSwitcher';

interface AuthLayoutProps {
  children: React.ReactNode;
  className?: string;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children, className }) => {
  const currentYear = new Date().getFullYear();

  return (
    <div className={cn("min-h-screen bg-background flex relative", className)}>
      {/* Language Switcher - Top Right - Hidden on mobile to avoid duplicate */}
      <div className="absolute top-4 right-4 z-20 hidden lg:block">
        <LanguageSwitcher />
      </div>

      {/* Left side - Welcome content */}
      <div className="hidden lg:flex lg:w-1/2 bg-background flex-col justify-center px-12 py-24 relative">

        <div className="max-w-md mx-auto space-y-8">
          {/* Madrid Logo */}
          <div className="flex items-center gap-4">
            <MadridLogo size="lg" />
            <div>
              <h1 className="text-3xl font-arial-black text-foreground">
                <TranslatedText>Raíces</TranslatedText>
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                <TranslatedText>Comunidad de Madrid</TranslatedText>
              </p>
            </div>
          </div>

          {/* Welcome message */}
          <div className="space-y-6">
            <div>
              <h2 className="text-4xl font-arial-black text-foreground leading-tight">
                <TranslatedText>AI learning for every family</TranslatedText>
              </h2>
              <h3 className="text-3xl font-arial-black text-foreground leading-tight mt-1">
                <TranslatedText>Bilingual support that grows with your child</TranslatedText>
              </h3>
              <h4 className="text-2xl font-bold text-primary mt-2">
                <TranslatedText>Madrid Community</TranslatedText>
              </h4>
            </div>

            <p className="text-lg text-foreground leading-relaxed">
              <TranslatedText>
                Explore AI tutoring, storytelling, chess coaching, language practice, and parent wellness support in English or Spanish.
              </TranslatedText>
            </p>
          </div>

          {/* Features list */}
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-foreground">
                <TranslatedText>Personalized AI tutoring and progress guidance</TranslatedText>
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-foreground">
                <TranslatedText>Interactive storytelling, chess, and language practice</TranslatedText>
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-foreground">
                <TranslatedText>Parent wellness support for the whole family</TranslatedText>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Auth form */}
      <div className="w-full lg:w-1/2 bg-muted/50 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Mobile header */}
          <div className="lg:hidden mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <MadridLogo size="md" />
                <div>
                  <h1 className="text-2xl font-arial-black text-foreground">
                    <TranslatedText>Raíces</TranslatedText>
                  </h1>
                  <p className="text-xs text-muted-foreground">
                    <TranslatedText>Madrid Community</TranslatedText>
                  </p>
                </div>
              </div>
              <div>
                <LanguageSwitcher />
              </div>
            </div>
            <div className="text-center">
              <h2 className="text-xl font-bold text-foreground">
                <TranslatedText>Bilingual AI Learning</TranslatedText>
              </h2>
            </div>
          </div>

          {/* Auth component with Madrid styling */}
          <div className="bg-background rounded-lg shadow-lg border border-border p-8 clerk-auth-madrid">
            {children}
          </div>

          {/* Footer */}
          <div className="mt-8 text-center text-xs text-muted-foreground space-y-2">
            <p>
              <span>© {currentYear} </span>
              <TranslatedText>Madrid Community. All rights reserved.</TranslatedText>
            </p>
            <div className="flex justify-center gap-4">
              <a
                href="/privacy-policy"
                className="text-primary hover:text-primary/80 transition-colors"
              >
                <TranslatedText>Privacy Policy</TranslatedText>
              </a>
              <span>•</span>
              <a
                href="https://www.comunidad.madrid/protecciondedatos"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-primary/80 transition-colors"
              >
                <TranslatedText>Data Protection</TranslatedText>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;

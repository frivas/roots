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

  return (
    <div className={cn("min-h-screen bg-white flex relative", className)}>
      {/* Language Switcher - Top Right - Hidden on mobile to avoid duplicate */}
      <div className="absolute top-4 right-4 z-20 hidden lg:block">
        <LanguageSwitcher />
      </div>

      {/* Powered by Bolt New - Top Left - Show on all screens */}
      <a
        id="bolt-button"
        href="https://bolt.new"
        target="_blank"
        title="Powered By Bolt"
        className="absolute top-2 left-2 z-30 lg:top-4 lg:left-4"
      >
      </a>

      {/* Left side - Welcome content */}
      <div className="hidden lg:flex lg:w-1/2 bg-white flex-col justify-center px-12 py-24 relative">

        <div className="max-w-md mx-auto space-y-8">
          {/* Madrid Logo */}
          <div className="flex items-center gap-4">
            <MadridLogo size="lg" />
            <div>
              <h1 className="text-3xl font-arial-black text-black">
                <TranslatedText>Raíces</TranslatedText>
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                <TranslatedText>Comunidad de Madrid</TranslatedText>
              </p>
            </div>
          </div>

          {/* Welcome message */}
          <div className="space-y-6">
            <div>
              <h2 className="text-4xl font-arial-black text-black leading-tight">
                <TranslatedText>Integral System</TranslatedText>
              </h2>
              <h3 className="text-3xl font-arial-black text-black leading-tight mt-1">
                <TranslatedText>for Educational Management</TranslatedText>
              </h3>
              <h4 className="text-2xl font-bold text-[#ff0000] mt-2">
                <TranslatedText>Madrid Community</TranslatedText>
              </h4>
            </div>

            <p className="text-lg text-gray-700 leading-relaxed">
              <TranslatedText>
                Access your space to manage communication with the school and perform educational procedures electronically.
              </TranslatedText>
            </p>
          </div>

          {/* Features list */}
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-[#ff0000] rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-gray-700">
                <TranslatedText>Academic and Administrative Management of Centers</TranslatedText>
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-[#ff0000] rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-gray-700">
                <TranslatedText>Educational Monitoring</TranslatedText>
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-[#ff0000] rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-gray-700">
                <TranslatedText>Virtual Secretary</TranslatedText>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Auth form */}
      <div className="w-full lg:w-1/2 bg-gray-50 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Mobile header */}
          <div className="lg:hidden mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <MadridLogo size="md" />
                <div>
                  <h1 className="text-2xl font-arial-black text-black">
                    <TranslatedText>Raíces</TranslatedText>
                  </h1>
                  <p className="text-xs text-gray-600">
                    <TranslatedText>Madrid Community</TranslatedText>
                  </p>
                </div>
              </div>
              <div>
                <LanguageSwitcher />
              </div>
            </div>
            <div className="text-center">
              <h2 className="text-xl font-bold text-black">
                <TranslatedText>Educational Platform</TranslatedText>
              </h2>
            </div>
          </div>

          {/* Auth component with Madrid styling */}
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-8 clerk-auth-madrid">
            {children}
          </div>

          {/* Footer */}
          <div className="mt-8 text-center text-xs text-gray-500 space-y-2">
            <p>
              <TranslatedText>© 2025 Madrid Community. All rights reserved.</TranslatedText>
            </p>
            <div className="flex justify-center gap-4">
              <a
                href="/privacy-policy"
                className="text-[#ff0000] hover:text-[#e60000] transition-colors"
              >
                <TranslatedText>Privacy Policy</TranslatedText>
              </a>
              <span>•</span>
              <a
                href="https://www.comunidad.madrid/protecciondedatos"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#ff0000] hover:text-[#e60000] transition-colors"
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

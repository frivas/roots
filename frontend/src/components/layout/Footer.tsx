import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../../lib/utils';
import MadridLogo from '../ui/MadridLogo';
import TranslatedText from '../TranslatedText';
import { Mail, Phone, MapPin, ExternalLink, Bot } from 'lucide-react';

interface FooterProps {
  className?: string;
}

const Footer: React.FC<FooterProps> = ({ className }) => {
  const location = useLocation();
  
  // Define AI-enabled pages that should show the disclaimer
  const aiEnabledPaths = [
    '/services/storytelling-session',
    '/services/chess-coaching-session',
    '/services/math-tutoring-session',
    '/services/language-lesson-session',
    '/services/parent-wellness-chat',
    '/services/extra-curricular-session'
  ];
  
  // Check if current page uses AI
  const showAiDisclaimer = aiEnabledPaths.some(path => 
    location.pathname.startsWith(path)
  );

  return (
    <footer className={cn(
      "bg-background",
      className
    )}>
      <div className="container mx-auto px-4 py-6">
        {/* AI Disclaimer - Only show on AI-enabled pages */}
        {showAiDisclaimer && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-2">
              <Bot className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-blue-800">
                <p className="font-medium mb-1">
                  <TranslatedText>AI-Powered Service Notice</TranslatedText>
                </p>
                <p>
                  <TranslatedText>
                    This service uses artificial intelligence technology to provide interactive educational experiences. 
                    AI-generated content may contain inaccuracies. Use at your own discretion and verify important information independently.
                  </TranslatedText>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Privacy and Legal Links */}
        <div>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            {/* Privacy Links */}
            <nav className="flex flex-wrap gap-4 text-xs text-muted-foreground">
              <Link 
                to="/privacy-policy" 
                className="hover:text-primary transition-colors"
              >
                <TranslatedText>Privacy Policy</TranslatedText>
              </Link>
              <Link 
                to="/terms-of-service" 
                className="hover:text-primary transition-colors"
              >
                <TranslatedText>Terms of Service</TranslatedText>
              </Link>
              <Link 
                to="/cookies-policy" 
                className="hover:text-primary transition-colors"
              >
                <TranslatedText>Cookie Policy</TranslatedText>
              </Link>
              <a 
                href="https://www.comunidad.madrid/protecciondedatos" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1 hover:text-primary transition-colors"
              >
                <TranslatedText>Data Protection</TranslatedText>
                <ExternalLink className="h-3 w-3" />
              </a>
            </nav>

            {/* Copyright */}
            <div className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} <TranslatedText>Comunidad de Madrid. All rights reserved.</TranslatedText>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 
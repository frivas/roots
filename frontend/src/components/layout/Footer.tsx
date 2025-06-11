import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '../../lib/utils';
import MadridLogo from '../ui/MadridLogo';
import { Mail, Phone, MapPin, ExternalLink } from 'lucide-react';

interface FooterProps {
  className?: string;
}

const Footer: React.FC<FooterProps> = ({ className }) => {
  return (
    <footer className={cn(
      "bg-background border-t border-border mt-auto",
      className
    )}>
      <div className="container mx-auto px-4 py-6">
        {/* Privacy and Legal Links */}
        <div>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                         {/* Privacy Links */}
             <nav className="flex flex-wrap gap-4 text-xs text-muted-foreground">
               <Link 
                 to="/privacy-policy" 
                 className="hover:text-primary transition-colors"
               >
                 Privacy Policy
               </Link>
               <Link 
                 to="/terms-of-service" 
                 className="hover:text-primary transition-colors"
               >
                 Terms of Service
               </Link>
               <Link 
                 to="/cookies-policy" 
                 className="hover:text-primary transition-colors"
               >
                 Cookie Policy
               </Link>
               <a 
                 href="https://www.comunidad.madrid/protecciondedatos" 
                 target="_blank" 
                 rel="noopener noreferrer"
                 className="flex items-center gap-1 hover:text-primary transition-colors"
               >
                 Data Protection
                 <ExternalLink className="h-3 w-3" />
               </a>
             </nav>

             {/* Copyright */}
             <div className="text-xs text-muted-foreground">
               © {new Date().getFullYear()} Comunidad de Madrid. All rights reserved.
             </div>
          </div>
        </div>


      </div>
    </footer>
  );
};

export default Footer; 
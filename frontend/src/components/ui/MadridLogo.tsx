import React from 'react';
import { cn } from '../../lib/utils';
import { Star } from 'lucide-react';

interface MadridLogoProps {
  className?: string;
  variant?: 'positive' | 'negative';
  size?: 'sm' | 'md' | 'lg';
}

const MadridLogo: React.FC<MadridLogoProps> = ({ 
  className, 
  variant = 'positive', 
  size = 'md' 
}) => {
  const sizeClasses = {
    sm: 'h-8 w-auto min-w-[40px]',
    md: 'h-10 w-auto min-w-[50px]',
    lg: 'h-12 w-auto min-w-[60px]'
  };

  return (
    <div className={cn(
      'flex items-center',
      sizeClasses[size],
      className
    )}>
      {/* Madrid Community Logo with Stars */}
      <div className={cn(
        'flex items-center justify-center rounded border-2 border-white p-2',
        variant === 'positive' 
          ? 'bg-[#ff0000] text-white' 
          : 'bg-white text-[#ff0000] border-[#ff0000]',
        sizeClasses[size]
      )}>
        <div className="flex flex-col items-center gap-0.5">
          {/* Top row - 4 stars */}
          <div className="flex gap-0.5">
            <Star className={cn("fill-current", size === 'sm' ? 'w-1.5 h-1.5' : size === 'md' ? 'w-2 h-2' : 'w-2.5 h-2.5')} />
            <Star className={cn("fill-current", size === 'sm' ? 'w-1.5 h-1.5' : size === 'md' ? 'w-2 h-2' : 'w-2.5 h-2.5')} />
            <Star className={cn("fill-current", size === 'sm' ? 'w-1.5 h-1.5' : size === 'md' ? 'w-2 h-2' : 'w-2.5 h-2.5')} />
            <Star className={cn("fill-current", size === 'sm' ? 'w-1.5 h-1.5' : size === 'md' ? 'w-2 h-2' : 'w-2.5 h-2.5')} />
          </div>
          {/* Bottom row - 3 stars centered */}
          <div className="flex gap-0.5">
            <Star className={cn("fill-current", size === 'sm' ? 'w-1.5 h-1.5' : size === 'md' ? 'w-2 h-2' : 'w-2.5 h-2.5')} />
            <Star className={cn("fill-current", size === 'sm' ? 'w-1.5 h-1.5' : size === 'md' ? 'w-2 h-2' : 'w-2.5 h-2.5')} />
            <Star className={cn("fill-current", size === 'sm' ? 'w-1.5 h-1.5' : size === 'md' ? 'w-2 h-2' : 'w-2.5 h-2.5')} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MadridLogo; 
import React from "react";
import { motion } from "framer-motion";
import { Paintbrush, Sparkles } from "lucide-react";

interface PaintingSpinnerProps {
  size?: "sm" | "md" | "lg";
}

const PaintingSpinner: React.FC<PaintingSpinnerProps> = ({ 
  size = "md"
}) => {
  const sizeClasses = {
    sm: "w-16 h-16",
    md: "w-24 h-24", 
    lg: "w-32 h-32"
  };

  const iconSizes = {
    sm: 16,
    md: 24,
    lg: 32
  };

  const colors = [
    "#ff6b6b", // Red
    "#4ecdc4", // Teal
    "#45b7d1", // Blue
    "#96ceb4", // Green
    "#ffeaa7", // Yellow
    "#dda0dd", // Plum
    "#98d8c8", // Mint
    "#f7dc6f"  // Light Yellow
  ];

  return (
    <div className="flex flex-col items-center justify-center p-8">
      {/* Main Spinner Container */}
      <div className="relative flex items-center justify-center">
        {/* Rotating Palette */}
        <motion.div
          className={`${sizeClasses[size]} relative flex items-center justify-center`}
          animate={{ rotate: 360 }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "linear"
          }}
        >
          {/* Color Dots around the circle */}
          {colors.map((color, index) => {
            const angle = (index / colors.length) * 2 * Math.PI;
            const radius = size === "sm" ? 28 : size === "md" ? 40 : 52;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            
            return (
              <motion.div
                key={index}
                className="absolute w-3 h-3 rounded-full"
                style={{
                  backgroundColor: color,
                  left: `calc(50% + ${x}px)`,
                  top: `calc(50% + ${y}px)`,
                  transform: "translate(-50%, -50%)"
                }}
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.6, 1, 0.6]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: index * 0.2,
                  ease: "easeInOut"
                }}
              />
            );
          })}
        </motion.div>

        {/* Center Paintbrush */}
        <motion.div
          className="absolute"
          animate={{
            rotate: [0, 10, -10, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <Paintbrush 
            size={iconSizes[size]} 
            className="text-foreground"
          />
        </motion.div>

        {/* Floating Sparkles */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{
              left: `${20 + Math.random() * 60}%`,
              top: `${20 + Math.random() * 60}%`
            }}
            animate={{
              y: [-10, -20, -10],
              opacity: [0, 1, 0],
              scale: [0.5, 1, 0.5]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: i * 0.5,
              ease: "easeInOut"
            }}
          >
            <Sparkles size={12} className="text-yellow-400" />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default PaintingSpinner; 
import React from 'react';
import { motion } from 'framer-motion';

export const Card = ({
  children,
  className = '',
  hoverEffect = true,
  glow = false,
  glowColor = 'primary',
  onClick,
  ...props
}) => {
  const glowClasses = glow
    ? glowColor === 'secondary'
      ? 'border-secondary/30 shadow-glow-secondary'
      : 'border-primary/30 shadow-glow-primary'
    : 'border-card-border/80';

  return (
    <motion.div
      whileHover={hoverEffect ? { y: -4, transition: { duration: 0.2 } } : undefined}
      onClick={onClick}
      className={`glass-card rounded-xl p-6 ${glowClasses} ${onClick ? 'cursor-pointer' : ''} ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export const CardHeader = ({ children, className = '' }) => (
  <div className={`mb-4 flex flex-col gap-1 ${className}`}>{children}</div>
);

export const CardTitle = ({ children, className = '' }) => (
  <h3 className={`text-xl font-bold text-text-main tracking-tight ${className}`}>{children}</h3>
);

export const CardDescription = ({ children, className = '' }) => (
  <p className={`text-sm text-text-muted leading-relaxed ${className}`}>{children}</p>
);

export const CardContent = ({ children, className = '' }) => (
  <div className={`${className}`}>{children}</div>
);

export const CardFooter = ({ children, className = '' }) => (
  <div className={`mt-6 pt-4 border-t border-card-border/50 flex items-center justify-between ${className}`}>
    {children}
  </div>
);

export default Card;

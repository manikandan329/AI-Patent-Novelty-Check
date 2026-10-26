import React from 'react';

export const Badge = ({
  children,
  variant = 'primary', // primary | secondary | success | warning | danger | outline
  size = 'md', // sm | md
  className = '',
}) => {
  const variants = {
    primary: 'bg-primary/10 text-primary-light border-primary/20',
    secondary: 'bg-secondary/10 text-secondary-light border-secondary/20',
    success: 'bg-success/10 text-success border-success/20',
    warning: 'bg-warning/10 text-warning border-warning/20',
    danger: 'bg-danger/10 text-danger border-danger/20',
    outline: 'bg-card/40 text-text-muted border-card-border',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs font-medium',
    md: 'px-3 py-1 text-xs font-semibold',
  };

  return (
    <span className={`inline-flex items-center rounded-full border backdrop-blur-sm ${variants[variant]} ${sizes[size]} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;

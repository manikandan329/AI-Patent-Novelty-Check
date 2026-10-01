import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export const Input = React.forwardRef(({
  label,
  type = 'text',
  error,
  helperText,
  icon: Icon,
  endIcon,
  className = '',
  id,
  required,
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPasswordType = type === 'password';
  const inputType = isPasswordType ? (showPassword ? 'text' : 'password') : type;

  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-semibold text-text-muted uppercase tracking-wider">
          {label} {required && <span className="text-danger">*</span>}
        </label>
      )}

      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-3.5 pointer-events-none text-text-subtle">
            <Icon className="w-4 h-4" />
          </div>
        )}

        <input
          ref={ref}
          id={inputId}
          type={inputType}
          className={`w-full bg-[#0F172A]/80 border rounded-xl py-2.5 px-3.5 text-sm text-text-main placeholder-text-subtle transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
            Icon ? 'pl-10' : ''
          } ${isPasswordType || endIcon ? 'pr-10' : ''} ${
            error ? 'border-danger focus:ring-danger' : 'border-card-border hover:border-card-border/80'
          } ${className}`}
          {...props}
        />

        {isPasswordType ? (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 text-text-subtle hover:text-text-main transition-colors"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        ) : endIcon ? (
          <div className="absolute right-3.5 pointer-events-none text-text-subtle">
            {endIcon}
          </div>
        ) : null}
      </div>

      {error ? (
        <p className="text-xs text-danger font-medium animate-fadeIn">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-text-subtle">{helperText}</p>
      ) : null}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;

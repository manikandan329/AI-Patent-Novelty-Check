import React from 'react';
import { checkPasswordStrength } from '../../utils/passwordStrength';
import { Check, X } from 'lucide-react';

export const PasswordStrengthMeter = ({ password }) => {
  const { score, label, color, barColor, percentage, checks } = checkPasswordStrength(password);

  if (!password) return null;

  const criteriaList = [
    { label: 'At least 8 characters', met: checks.length },
    { label: 'Upper & lowercase letters', met: checks.uppercase && checks.lowercase },
    { label: 'At least 1 number (0-9)', met: checks.number },
    { label: 'At least 1 special character (!@#$%)', met: checks.special },
  ];

  return (
    <div className="space-y-2 mt-2 p-3 rounded-xl bg-card/60 border border-card-border/60">
      <div className="flex items-center justify-between text-xs">
        <span className="text-text-subtle font-medium">Password Strength:</span>
        <span className={`font-bold ${color}`}>{label}</span>
      </div>

      {/* Bar indicator */}
      <div className="w-full bg-card-border/80 h-1.5 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${barColor}`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Checklist */}
      <div className="grid grid-cols-2 gap-1.5 pt-1">
        {criteriaList.map((item, idx) => (
          <div key={idx} className="flex items-center gap-1.5 text-[11px]">
            {item.met ? (
              <Check className="w-3.5 h-3.5 text-success shrink-0" />
            ) : (
              <X className="w-3.5 h-3.5 text-text-subtle shrink-0" />
            )}
            <span className={item.met ? 'text-text-main font-medium' : 'text-text-subtle'}>
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PasswordStrengthMeter;

/**
 * Evaluates password strength and returns score (0-4), label, color, and checks.
 */
export const checkPasswordStrength = (password) => {
  if (!password) {
    return {
      score: 0,
      label: 'Enter password',
      color: 'text-text-subtle',
      barColor: 'bg-card-border',
      percentage: 0,
      checks: {
        length: false,
        uppercase: false,
        lowercase: false,
        number: false,
        special: false,
      },
    };
  }

  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };

  let score = 0;
  if (checks.length) score++;
  if (checks.uppercase && checks.lowercase) score++;
  if (checks.number) score++;
  if (checks.special) score++;

  let label = 'Weak';
  let color = 'text-danger';
  let barColor = 'bg-danger';

  if (score === 2) {
    label = 'Fair';
    color = 'text-warning';
    barColor = 'bg-warning';
  } else if (score === 3) {
    label = 'Good';
    color = 'text-primary-light';
    barColor = 'bg-primary';
  } else if (score === 4) {
    label = 'Strong';
    color = 'text-success';
    barColor = 'bg-success';
  }

  return {
    score,
    label,
    color,
    barColor,
    percentage: (score / 4) * 100,
    checks,
  };
};

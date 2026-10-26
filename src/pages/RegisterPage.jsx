import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Lock, UserPlus, ShieldCheck } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import useFormValidation from '../hooks/useFormValidation';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import SocialAuthButtons from '../components/auth/SocialAuthButtons';
import PasswordStrengthMeter from '../components/auth/PasswordStrengthMeter';

export const RegisterPage = () => {
  const { register, loginGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const navigate = useNavigate();

  const validate = (vals) => {
    const errors = {};
    if (!vals.fullName.trim()) {
      errors.fullName = 'Full name is required';
    }

    if (!vals.email) {
      errors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(vals.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!vals.password) {
      errors.password = 'Password is required';
    } else if (vals.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }

    if (vals.confirmPassword !== vals.password) {
      errors.confirmPassword = 'Passwords do not match';
    }

    if (!vals.agreeTerms) {
      errors.agreeTerms = 'You must agree to the Terms of Service';
    }

    return errors;
  };

  const { values, errors, touched, handleChange, handleBlur, validateAll } = useFormValidation(
    {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      agreeTerms: false,
    },
    validate
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateAll()) return;

    setLoading(true);
    const result = await register(values.fullName, values.email, values.password);
    setLoading(false);

    if (result.success) {
      navigate('/dashboard');
    }
  };

  const handleGoogleAuth = async () => {
    setGoogleLoading(true);
    const result = await loginGoogle();
    setGoogleLoading(false);

    if (result.success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] bg-hero-gradient flex items-center justify-center p-4 sm:p-6 pt-24 pb-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-lg"
      >
        <div className="glass-card rounded-2xl p-6 sm:p-8 border border-card-border shadow-2xl space-y-6">
          
          {/* Header */}
          <div className="text-center space-y-2">
            <Link to="/" className="inline-flex items-center gap-2 group mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-secondary p-0.5 shadow-md">
                <div className="w-full h-full bg-[#0F172A] rounded-[10px] flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-primary-light" />
                </div>
              </div>
              <span className="text-xl font-extrabold text-text-main">
                Patentiq <span className="text-primary-light">AI</span>
              </span>
            </Link>
            <h2 className="text-2xl font-bold text-text-main tracking-tight">Create Professional Account</h2>
            <p className="text-xs text-text-muted">
              Start analyzing patent novelty and prior art instantly
            </p>
          </div>

          {/* Social Sign Up */}
          <SocialAuthButtons
            onGoogleClick={handleGoogleAuth}
            loading={googleLoading}
            text="Sign up with Google"
          />

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <Input
              label="Full Name"
              type="text"
              name="fullName"
              placeholder="Dr. Alexander Vance"
              icon={User}
              value={values.fullName}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.fullName && errors.fullName}
              required
            />

            <Input
              label="Email Address"
              type="email"
              name="email"
              placeholder="alexander@patents.com"
              icon={Mail}
              value={values.email}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.email && errors.email}
              required
            />

            <div className="space-y-1">
              <Input
                label="Password"
                type="password"
                name="password"
                placeholder="••••••••"
                icon={Lock}
                value={values.password}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.password && errors.password}
                required
              />
              <PasswordStrengthMeter password={values.password} />
            </div>

            <Input
              label="Confirm Password"
              type="password"
              name="confirmPassword"
              placeholder="••••••••"
              icon={Lock}
              value={values.confirmPassword}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.confirmPassword && errors.confirmPassword}
              required
            />

            {/* Terms Checkbox */}
            <div className="space-y-1 pt-1">
              <label className="flex items-start gap-2.5 cursor-pointer select-none text-xs text-text-muted">
                <input
                  type="checkbox"
                  name="agreeTerms"
                  checked={values.agreeTerms}
                  onChange={handleChange}
                  className="mt-0.5 rounded border-card-border bg-[#0F172A] text-primary focus:ring-primary focus:ring-offset-0 w-4 h-4 shrink-0"
                />
                <span>
                  I agree to the{' '}
                  <Link to="/terms" className="text-primary-light hover:underline font-medium">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link to="/privacy" className="text-primary-light hover:underline font-medium">
                    Privacy Policy
                  </Link>.
                </span>
              </label>
              {touched.agreeTerms && errors.agreeTerms && (
                <p className="text-xs text-danger font-medium pl-6">{errors.agreeTerms}</p>
              )}
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              icon={UserPlus}
              className="w-full mt-2"
            >
              Create Account & Initialize Profile
            </Button>
          </form>

          {/* Footer Link */}
          <div className="text-center pt-2 border-t border-card-border/50">
            <p className="text-xs text-text-subtle">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-primary-light hover:underline">
                Sign In
              </Link>
            </p>
          </div>

        </div>
      </motion.div>
    </div>
  );
};

export default RegisterPage;

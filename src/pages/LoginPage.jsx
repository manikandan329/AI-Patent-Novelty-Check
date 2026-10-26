import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, LogIn, ShieldCheck, Sparkles, UserCheck } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import useFormValidation from '../hooks/useFormValidation';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import SocialAuthButtons from '../components/auth/SocialAuthButtons';

export const LoginPage = () => {
  const { login, loginGoogle, loginDemo } = useAuth();
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const redirectPath = location.state?.from?.pathname || '/dashboard';

  const validate = (vals) => {
    const errors = {};
    if (!vals.email) {
      errors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(vals.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!vals.password) {
      errors.password = 'Password is required';
    } else if (vals.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    return errors;
  };

  const { values, errors, touched, handleChange, handleBlur, validateAll } = useFormValidation(
    { email: '', password: '' },
    validate
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateAll()) return;

    setLoading(true);
    const result = await login(values.email, values.password);
    setLoading(false);

    if (result.success) {
      navigate(redirectPath, { replace: true });
    }
  };

  const handleGoogleAuth = async () => {
    setGoogleLoading(true);
    const result = await loginGoogle();
    setGoogleLoading(false);

    if (result.success) {
      navigate(redirectPath, { replace: true });
    }
  };

  const handleDemoAuth = async () => {
    setDemoLoading(true);
    const result = await loginDemo();
    setDemoLoading(false);

    if (result.success) {
      navigate(redirectPath, { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] bg-hero-gradient flex items-center justify-center p-4 sm:p-6 pt-24 pb-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        {/* Auth Card Container */}
        <div className="glass-card rounded-2xl p-6 sm:p-8 border border-card-border shadow-2xl space-y-6 relative overflow-hidden">
          
          {/* Top Logo Header */}
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
            <h2 className="text-2xl font-bold text-text-main tracking-tight">Welcome Back</h2>
            <p className="text-xs text-text-muted">
              Enter your credentials or use Quick Demo Mode for immediate evaluation
            </p>
          </div>

          {/* Quick Demo Login Option */}
          <div className="p-3.5 rounded-xl bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 border border-primary/40 space-y-2.5 text-center shadow-lg">
            <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-primary-light">
              <Sparkles className="w-4 h-4 fill-primary-light animate-pulse" />
              <span>Project Reviewer & Demo Access</span>
            </div>
            <p className="text-[11px] text-text-muted leading-tight">
              Instant login as <b>Demo User (Researcher)</b> without Firebase Auth or Google OAuth errors.
            </p>
            <Button
              type="button"
              variant="outline"
              size="md"
              loading={demoLoading}
              onClick={handleDemoAuth}
              icon={UserCheck}
              className="w-full bg-primary/20 hover:bg-primary/30 text-primary-light border-primary/50 font-bold transition-all shadow-md py-2.5 justify-center"
            >
              ⚡ Quick Demo Login (Skip Firebase)
            </Button>
          </div>

          {/* Social Auth Option */}
          <SocialAuthButtons
            onGoogleClick={handleGoogleAuth}
            loading={googleLoading}
            text="Sign in with Google"
          />

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <Input
              label="Email Address"
              type="email"
              name="email"
              placeholder="name@company.com"
              icon={Mail}
              value={values.email}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.email && errors.email}
              required
            />

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

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none text-text-muted hover:text-text-main">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-card-border bg-[#0F172A] text-primary focus:ring-primary focus:ring-offset-0 w-4 h-4"
                />
                Remember me
              </label>

              <Link
                to="/forgot-password"
                className="font-medium text-primary-light hover:underline"
              >
                Forgot Password?
              </Link>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              icon={LogIn}
              className="w-full mt-2"
            >
              Sign In to Account
            </Button>
          </form>

          {/* Footer link to register */}
          <div className="text-center pt-2 border-t border-card-border/50">
            <p className="text-xs text-text-subtle">
              Don't have an account yet?{' '}
              <Link to="/register" className="font-semibold text-primary-light hover:underline">
                Create Account
              </Link>
            </p>
          </div>

        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;

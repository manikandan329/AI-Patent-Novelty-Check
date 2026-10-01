import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, CheckCircle2, KeyRound } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import useFormValidation from '../hooks/useFormValidation';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

export const ForgotPasswordPage = () => {
  const { resetPassword } = useAuth();
  const [loading, setLoading] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');

  const validate = (vals) => {
    const errors = {};
    if (!vals.email) {
      errors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(vals.email)) {
      errors.email = 'Please enter a valid email address';
    }
    return errors;
  };

  const { values, errors, touched, handleChange, handleBlur, validateAll } = useFormValidation(
    { email: '' },
    validate
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateAll()) return;

    setLoading(true);
    const result = await resetPassword(values.email);
    setLoading(false);

    if (result.success) {
      setSubmittedEmail(values.email);
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
        <div className="glass-card rounded-2xl p-6 sm:p-8 border border-card-border shadow-2xl space-y-6">
          
          {submittedEmail ? (
            /* Success Screen State */
            <div className="text-center space-y-5 animate-fadeIn">
              <div className="w-16 h-16 rounded-2xl bg-success/10 border border-success/30 text-success flex items-center justify-center mx-auto shadow-lg shadow-success/10">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-text-main tracking-tight">Reset Link Sent</h2>
                <p className="text-sm text-text-muted leading-relaxed">
                  We have dispatched a password recovery link to{' '}
                  <span className="font-semibold text-text-main">{submittedEmail}</span>.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#0F172A] border border-card-border text-left text-xs text-text-subtle space-y-1">
                <p className="font-medium text-text-muted">Didn't receive the email?</p>
                <p>• Check your spam or junk folder.</p>
                <p>• Make sure the address typed matches your registered account.</p>
              </div>

              <div className="pt-2 space-y-2">
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => setSubmittedEmail('')}
                  className="w-full"
                >
                  Resend Link / Try Another Email
                </Button>

                <Link to="/login" className="block">
                  <Button variant="ghost" size="sm" icon={ArrowLeft} className="w-full">
                    Return to Sign In
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            /* Initial Email Input State */
            <>
              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/25 text-primary-light flex items-center justify-center mx-auto mb-2">
                  <KeyRound className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold text-text-main tracking-tight">Reset Your Password</h2>
                <p className="text-xs text-text-muted">
                  Enter your registered account email and we'll send you instructions to reset your password.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <Input
                  label="Registered Email Address"
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

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  loading={loading}
                  className="w-full mt-2"
                >
                  Send Password Reset Link
                </Button>
              </form>

              <div className="text-center pt-2 border-t border-card-border/50">
                <Link to="/login" className="inline-flex items-center gap-1.5 text-xs text-text-subtle hover:text-text-main transition-colors">
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back to Sign In
                </Link>
              </div>
            </>
          )}

        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPasswordPage;

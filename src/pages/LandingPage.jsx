import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import HeroSection from '../components/landing/HeroSection';
import FeaturesSection from '../components/landing/FeaturesSection';
import TimelineSection from '../components/landing/TimelineSection';
import StatsSection from '../components/landing/StatsSection';
import TestimonialsSection from '../components/landing/TestimonialsSection';
import FaqSection from '../components/landing/FaqSection';
import Button from '../components/ui/Button';

export const LandingPage = () => {
  return (
    <div className="min-h-screen bg-[#0F172A] text-text-main overflow-x-hidden">
      
      {/* Hero Section */}
      <HeroSection />

      {/* Features Section */}
      <FeaturesSection />

      {/* Timeline How It Works */}
      <TimelineSection />

      {/* Statistics Animated Counters */}
      <StatsSection />

      {/* Testimonials */}
      <TestimonialsSection />

      {/* FAQ Section */}
      <FaqSection />

      {/* Bottom Conversion CTA Banner */}
      <section className="py-20 bg-gradient-to-b from-[#0F172A] to-[#0B1120] relative border-t border-card-border/60">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="glass-card p-10 md:p-14 rounded-3xl border border-primary/30 shadow-glow-primary relative overflow-hidden space-y-6">
            <div className="w-14 h-14 rounded-2xl bg-primary/20 text-primary-light flex items-center justify-center mx-auto">
              <ShieldCheck className="w-8 h-8" />
            </div>

            <h2 className="text-3xl md:text-4xl font-extrabold text-text-main tracking-tight">
              Ready to Verify Your Invention’s <span className="text-gradient-primary">Novelty?</span>
            </h2>

            <p className="text-base text-text-muted max-w-xl mx-auto leading-relaxed">
              Join over 12,500 patent attorneys, corporate IP teams, and inventors using Patentiq AI for instant prior art analysis.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register">
                <Button variant="primary" size="lg" icon={Sparkles} className="shadow-glow-primary">
                  Create Account Free
                </Button>
              </Link>
              <Link to="/contact">
                <Button variant="outline" size="lg">
                  Request Enterprise Demo
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default LandingPage;

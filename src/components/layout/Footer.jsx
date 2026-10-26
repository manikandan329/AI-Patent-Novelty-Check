import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Github, Twitter, Linkedin, Mail, ArrowUpRight } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-[#0B1120] border-t border-card-border/60 text-text-muted pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary to-secondary p-0.5 shadow-md">
                <div className="w-full h-full bg-[#0F172A] rounded-[10px] flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-primary-light" />
                </div>
              </div>
              <span className="text-lg font-extrabold text-text-main tracking-tight">
                Patentiq <span className="text-primary-light">AI</span>
              </span>
            </Link>

            <p className="text-sm text-text-subtle leading-relaxed max-w-sm">
              Next-generation AI platform for automated patent novelty checking, semantic prior art intelligence, and institutional IP claim validation.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-xl bg-card border border-card-border flex items-center justify-center text-text-muted hover:text-text-main hover:border-primary/50 transition-colors"
                aria-label="GitHub"
              >
                <Github className="w-4 h-4" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-xl bg-card border border-card-border flex items-center justify-center text-text-muted hover:text-text-main hover:border-primary/50 transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-xl bg-card border border-card-border flex items-center justify-center text-text-muted hover:text-text-main hover:border-primary/50 transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Column 1: Product */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-text-main uppercase tracking-wider">Product</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/#features" className="hover:text-text-main transition-colors">AI Patent Analysis</a>
              </li>
              <li>
                <a href="/#features" className="hover:text-text-main transition-colors">Semantic Search</a>
              </li>
              <li>
                <a href="/#features" className="hover:text-text-main transition-colors">Novelty Detection</a>
              </li>
              <li>
                <a href="/#how-it-works" className="hover:text-text-main transition-colors">How It Works</a>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-text-main transition-colors">Interactive Portal</Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Legal & Company */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-text-main uppercase tracking-wider">Legal & Trust</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/privacy" className="hover:text-text-main transition-colors">Privacy Policy</Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-text-main transition-colors">Terms of Service</Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-text-main transition-colors">About Us</Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-text-main transition-colors">Contact Support</Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact Info */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-text-main uppercase tracking-wider">Get in Touch</h4>
            <p className="text-xs text-text-subtle">
              Have questions regarding corporate IP integration or custom AI models?
            </p>
            <Link to="/contact" className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary-light hover:underline">
              <Mail className="w-3.5 h-3.5" />
              support@patentiq.ai
              <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-card-border/40 flex flex-col sm:flex-row items-center justify-between text-xs text-text-subtle gap-4">
          <p>© {new Date().getFullYear()} Patentiq AI Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link to="/privacy" className="hover:text-text-muted transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-text-muted transition-colors">Terms of Service</Link>
            <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-text-muted transition-colors">GitHub Repository</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

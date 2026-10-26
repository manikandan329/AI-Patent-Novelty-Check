import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Menu, X, User, LayoutDashboard, LogOut, Sparkles, ChevronDown } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import Button from '../ui/Button';

export const Navbar = () => {
  const { currentUser, userProfile, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setProfileDropdownOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const isDemoActive = userProfile?.isDemoMode || currentUser?.isDemo;

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Features', path: '/#features' },
    { name: 'How It Works', path: '/#how-it-works' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#0F172A]/85 backdrop-blur-md border-b border-card-border/60 py-3 shadow-xl'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-secondary p-0.5 shadow-lg group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-[#0F172A] rounded-[10px] flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-primary-light" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-extrabold tracking-tight text-text-main flex items-center gap-1.5">
                Patentiq <span className="text-primary-light">AI</span>
                {isDemoActive && (
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase">
                    Demo Mode
                  </span>
                )}
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-widest text-text-subtle -mt-1">
                Patent Intelligence
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.path}
                className="text-sm font-medium text-text-muted hover:text-text-main transition-colors hover:scale-105 transform"
              >
                {link.name}
              </a>
            ))}
          </nav>

          {/* Desktop Auth State Handling */}
          <div className="hidden md:flex items-center gap-3">
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-3 p-1.5 pr-3 rounded-xl glass-card hover:border-primary/40 transition-all"
                >
                  <img
                    src={userProfile?.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.email}`}
                    alt="User avatar"
                    className="w-8 h-8 rounded-lg object-cover border border-card-border"
                  />
                  <div className="text-left hidden lg:block">
                    <p className="text-xs font-semibold text-text-main leading-none flex items-center gap-1">
                      {userProfile?.name || 'My Account'}
                      {isDemoActive && (
                        <span className="px-1 py-0.5 rounded text-[8px] font-bold bg-amber-500/20 text-amber-300">
                          DEMO
                        </span>
                      )}
                    </p>
                    <p className="text-[10px] text-text-subtle mt-0.5 truncate max-w-[120px]">
                      {userProfile?.email}
                    </p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-text-subtle" />
                </button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {profileDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-56 glass-card rounded-xl shadow-2xl py-2 z-50 border border-card-border"
                    >
                      <div className="px-4 py-2 border-b border-card-border/60">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-semibold text-text-main">{userProfile?.name}</p>
                          {isDemoActive && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                              Demo Account
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-text-subtle truncate">{userProfile?.email}</p>
                      </div>

                      <Link
                        to="/dashboard"
                        className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-text-muted hover:text-text-main hover:bg-card-border/40 transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4 text-primary-light" />
                        Dashboard
                      </Link>

                      <Link
                        to="/profile"
                        className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-text-muted hover:text-text-main hover:bg-card-border/40 transition-colors"
                      >
                        <User className="w-4 h-4 text-secondary-light" />
                        User Profile
                      </Link>

                      <div className="my-1 border-t border-card-border/60" />

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-danger hover:bg-danger/10 transition-colors text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Login
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="outline" size="sm">
                    Register
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="sm" icon={Sparkles}>
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Hamburger */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-text-muted hover:text-text-main hover:bg-card/60 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass-panel border-b border-card-border px-4 pt-3 pb-6 space-y-4"
          >
            <div className="flex flex-col gap-3">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.path}
                  className="text-sm font-medium text-text-muted hover:text-text-main py-1"
                >
                  {link.name}
                </a>
              ))}
            </div>

            <div className="pt-4 border-t border-card-border/60 flex flex-col gap-2.5">
              {currentUser ? (
                <>
                  <Link to="/dashboard" className="w-full">
                    <Button variant="primary" size="md" icon={LayoutDashboard} className="w-full">
                      Dashboard
                    </Button>
                  </Link>
                  <Link to="/profile" className="w-full">
                    <Button variant="outline" size="md" icon={User} className="w-full">
                      Profile
                    </Button>
                  </Link>
                  <Button variant="danger" size="md" icon={LogOut} onClick={handleLogout} className="w-full">
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/login" className="w-full">
                    <Button variant="ghost" size="md" className="w-full justify-center">
                      Login
                    </Button>
                  </Link>
                  <Link to="/register" className="w-full">
                    <Button variant="outline" size="md" className="w-full justify-center">
                      Register
                    </Button>
                  </Link>
                  <Link to="/register" className="w-full">
                    <Button variant="primary" size="md" icon={Sparkles} className="w-full justify-center">
                      Get Started
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;

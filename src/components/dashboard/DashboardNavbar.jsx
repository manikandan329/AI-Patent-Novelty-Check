import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Menu, Moon, Sun, User, LayoutDashboard, LogOut, ShieldCheck, ChevronDown, FileText } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { RECENT_ANALYSES_DATA } from '../../utils/dashboardData';
import NotificationDropdown from './NotificationDropdown';

export const DashboardNavbar = ({ toggleMobileSidebar }) => {
  const { currentUser, userProfile, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  // Search filtering logic
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const q = searchQuery.toLowerCase();
    const matches = RECENT_ANALYSES_DATA.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.patentNumber.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
    );
    setSearchResults(matches);
  }, [searchQuery]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="h-16 bg-[#0B1120]/90 backdrop-blur-md border-b border-card-border/80 sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between">
      
      {/* Left Mobile Menu Toggle & Search Bar */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <button
          onClick={toggleMobileSidebar}
          className="lg:hidden p-2 rounded-xl text-text-muted hover:text-text-main hover:bg-card/60"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search Bar */}
        <div ref={searchRef} className="relative w-full">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-text-subtle absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Search patent titles, reports, numbers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              className="w-full bg-[#0F172A] border border-card-border/80 rounded-xl py-2 pl-10 pr-4 text-xs text-text-main placeholder-text-subtle focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
          </div>

          {/* Search Results Dropdown */}
          <AnimatePresence>
            {isSearchFocused && searchQuery.trim() !== '' && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                className="absolute top-full left-0 right-0 mt-2 glass-card rounded-xl shadow-2xl border border-card-border py-2 z-50 max-h-72 overflow-y-auto"
              >
                <div className="px-3 py-1.5 border-b border-card-border/60 text-[10px] uppercase font-bold text-text-subtle">
                  Matching Patents & Reports ({searchResults.length})
                </div>

                {searchResults.length > 0 ? (
                  searchResults.map((res) => (
                    <div
                      key={res.id}
                      onClick={() => {
                        setIsSearchFocused(false);
                        navigate('/dashboard/history');
                      }}
                      className="px-3 py-2.5 hover:bg-primary/10 cursor-pointer transition-colors flex items-center justify-between"
                    >
                      <div className="min-w-0 pr-2">
                        <p className="text-xs font-bold text-text-main truncate">{res.title}</p>
                        <p className="text-[10px] text-text-subtle font-mono">{res.patentNumber} • {res.category}</p>
                      </div>
                      <span className="text-xs font-mono font-bold text-success shrink-0">
                        {res.noveltyScore}%
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-xs text-text-subtle">
                    No matching patents found for "{searchQuery}"
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Right Action Icons & User Dropdown */}
      <div className="flex items-center gap-3">
        
        {/* Theme Indicator */}
        <div
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-card/60 border border-card-border text-xs text-text-subtle"
          title="Dark Theme Enabled"
        >
          <Moon className="w-3.5 h-3.5 text-primary-light" />
          <span className="font-semibold text-text-muted">Dark Mode</span>
        </div>

        {/* Notification Icon Dropdown */}
        <NotificationDropdown />

        {/* User Profile Avatar Dropdown */}
        <div className="relative">
          <button
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="flex items-center gap-2.5 p-1 pr-2.5 rounded-xl bg-card/60 border border-card-border hover:border-primary/40 transition-all"
          >
            <img
              src={userProfile?.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser?.email}`}
              alt="User Avatar"
              className="w-7 h-7 rounded-lg object-cover border border-card-border"
            />
            <span className="text-xs font-bold text-text-main hidden md:inline-block max-w-[100px] truncate">
              {userProfile?.name || 'Account'}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-text-subtle" />
          </button>

          <AnimatePresence>
            {profileDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute right-0 mt-2 w-52 glass-card rounded-xl shadow-2xl py-2 z-50 border border-card-border"
              >
                <div className="px-3 py-2 border-b border-card-border/60">
                  <p className="text-xs font-bold text-text-main">{userProfile?.name}</p>
                  <p className="text-[10px] text-text-subtle truncate">{userProfile?.email}</p>
                </div>

                <Link
                  to="/profile"
                  onClick={() => setProfileDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-3.5 py-2 text-xs text-text-muted hover:text-text-main hover:bg-card-border/40"
                >
                  <User className="w-4 h-4 text-primary-light" /> User Profile
                </Link>

                <Link
                  to="/dashboard/reports"
                  onClick={() => setProfileDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-3.5 py-2 text-xs text-text-muted hover:text-text-main hover:bg-card-border/40"
                >
                  <FileText className="w-4 h-4 text-secondary-light" /> Reports Hub
                </Link>

                <div className="my-1 border-t border-card-border/60" />

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-danger hover:bg-danger/10 text-left font-medium"
                >
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </header>
  );
};

export default DashboardNavbar;

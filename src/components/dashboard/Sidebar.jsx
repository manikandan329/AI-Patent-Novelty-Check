import React from 'react';
import {
  NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FolderKanban,
  LayoutDashboard,
  PlusCircle,
  History,
  FileText,
  Bot,
  User,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Zap,
  Activity,
  GitCompare,
  Sparkles,
  Search,
  Network,
  TrendingUp,
  FileSearch,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export const Sidebar = ({ isCollapsed, toggleSidebar, mobileOpen, setMobileOpen }) => {
  const { userProfile, currentUser, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isDemoActive = userProfile?.isDemoMode || currentUser?.isDemo;

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, exact: true },
    { name: 'Patent Workspace', path: '/dashboard/workspace', icon: FolderKanban },
    { name: 'AI Novelty Analysis', path: '/dashboard/novelty-analysis', icon: Sparkles },
    { name: 'New Patent Analysis', path: '/dashboard/new-analysis', icon: PlusCircle },
    { name: 'Patent Research', path: '/dashboard/research', icon: Search },
    { name: 'Tech Intelligence', path: '/dashboard/intelligence', icon: TrendingUp },
    { name: 'Citation Graph', path: '/dashboard/relationships', icon: Network },
    { name: 'NLP & Doc Inspector', path: '/dashboard/nlp-processing', icon: FileSearch },
    { name: 'Patent Comparison', path: '/dashboard/compare', icon: GitCompare },
    { name: 'Analysis Report', path: '/dashboard/report', icon: FileText },
    { name: 'History Archive', path: '/dashboard/history', icon: History },
    { name: 'Reports Hub', path: '/dashboard/reports', icon: FileText },
    { name: 'AI Assistant', path: '/dashboard/ai-assistant', icon: Bot },
    { name: 'Profile', path: '/profile', icon: User },
    { name: 'Settings', path: '/dashboard/settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile overlay backdrop */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 bg-[#0F172A]/80 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Main Collapsible Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 bg-[#0B1120] border-r border-card-border/80 flex flex-col justify-between transition-all duration-300 ${
          isCollapsed ? 'w-20' : 'w-64'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Top Header & User Card */}
        <div className="p-4 space-y-5">
          
          {/* Logo & Collapse Trigger */}
          <div className="flex items-center justify-between">
            <NavLink to="/dashboard" className="flex items-center gap-3 overflow-hidden">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-secondary p-0.5 shadow-lg shrink-0">
                <div className="w-full h-full bg-[#0F172A] rounded-[10px] flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-primary-light" />
                </div>
              </div>

              {!isCollapsed && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="flex flex-col"
                >
                  <span className="text-base font-extrabold text-text-main leading-tight tracking-tight flex items-center gap-1.5">
                    Patentiq <span className="text-primary-light">AI</span>
                  </span>
                  <span className="text-[10px] font-semibold text-text-subtle uppercase tracking-wider">
                    SaaS Portal
                  </span>
                </motion.div>
              )}
            </NavLink>

            {/* Collapse Button Desktop */}
            <button
              onClick={toggleSidebar}
              className="hidden lg:flex w-7 h-7 rounded-lg bg-card border border-card-border items-center justify-center text-text-muted hover:text-text-main hover:border-primary/50 transition-colors"
              title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          {/* User Profile Card */}
          <div
            onClick={() => navigate('/profile')}
            className={`glass-card rounded-xl p-3 border border-card-border/60 hover:border-primary/40 cursor-pointer transition-all flex items-center gap-3 overflow-hidden ${
              isCollapsed ? 'justify-center p-2' : ''
            }`}
          >
            <img
              src={userProfile?.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser?.email}`}
              alt="User Avatar"
              className="w-9 h-9 rounded-lg object-cover border border-card-border shrink-0"
            />

            {!isCollapsed && (
              <div className="flex flex-col min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-text-main truncate">
                    {userProfile?.name || 'User Profile'}
                  </span>
                  {isDemoActive && (
                    <span className="px-1.5 py-0.5 rounded text-[8px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase shrink-0">
                      Demo
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-text-subtle truncate">
                  {currentUser?.email}
                </span>
              </div>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5 pt-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.exact
                ? location.pathname === item.path
                : location.pathname.startsWith(item.path);

              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 group relative ${
                    isActive
                      ? 'bg-primary text-white shadow-lg shadow-primary/25 font-bold'
                      : 'text-text-muted hover:text-text-main hover:bg-card/70'
                  }`}
                  title={isCollapsed ? item.name : undefined}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-text-subtle group-hover:text-primary-light'}`} />

                  {!isCollapsed && (
                    <span className="truncate">{item.name}</span>
                  )}

                  {/* Active Indicator Bar when Collapsed */}
                  {isCollapsed && isActive && (
                    <div className="absolute right-0 top-2 bottom-2 w-1 bg-primary rounded-l-full" />
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom AI Engine Status & Logout */}
        <div className="p-4 space-y-3 border-t border-card-border/60">
          
          {/* AI Engine Status Card */}
          {!isCollapsed ? (
            <div className="p-3 rounded-xl bg-[#0F172A] border border-primary/30 space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-primary-light">
                  <Zap className="w-3.5 h-3.5 fill-current animate-pulse" />
                  <span>AI Engine v2.4</span>
                </div>
                <span className="w-2 h-2 rounded-full bg-success animate-ping" />
              </div>
              <p className="text-[11px] text-text-subtle">
                {isDemoActive ? 'Demo Corpus Active (Sample Datasets Loaded)' : 'Vector Corpus: 140M Patents Synced (99.9% Uptime)'}
              </p>
            </div>
          ) : (
            <div className="flex justify-center" title="AI Engine Operational">
              <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center text-primary-light">
                <Activity className="w-4 h-4" />
              </div>
            </div>
          )}

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-danger hover:bg-danger/10 transition-colors ${
              isCollapsed ? 'justify-center' : ''
            }`}
            title="Logout of session"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {!isCollapsed && <span>Logout</span>}
          </button>

        </div>
      </aside>
    </>
  );
};

export default Sidebar;

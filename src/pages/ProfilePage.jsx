import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Calendar, Clock, Shield, BarChart, FileText, CheckCircle, AlertCircle, Save, Send, Sparkles } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { updateUserProfileData } from '../firebase/userService';
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import toast from 'react-hot-toast';

export const ProfilePage = () => {
  const { currentUser, userProfile, resendVerification, refreshProfile } = useAuth();
  const [nameInput, setNameInput] = useState(userProfile?.name || currentUser?.displayName || '');
  const [updating, setUpdating] = useState(false);

  const isDemoActive = userProfile?.isDemoMode || currentUser?.isDemo;

  const handleUpdateName = async (e) => {
    e.preventDefault();
    if (!nameInput.trim()) return;

    setUpdating(true);
    try {
      await updateUserProfileData(currentUser.uid, { name: nameInput.trim() });
      await refreshProfile();
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error('Failed to update profile.');
    } finally {
      setUpdating(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] pt-28 pb-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-8">
      
      {/* Header Banner */}
      <div className="glass-card p-6 sm:p-8 rounded-2xl border border-card-border flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
          <img
            src={userProfile?.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser?.email}`}
            alt="Profile Avatar"
            className="w-20 h-20 rounded-2xl object-cover border-2 border-primary/40 shadow-xl"
          />
          <div className="space-y-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h1 className="text-2xl font-extrabold text-text-main">
                {userProfile?.name || 'User Profile'}
              </h1>
              <Badge variant="primary" size="sm" className="capitalize">
                {userProfile?.role || 'Researcher'}
              </Badge>
              {isDemoActive && (
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  Demo Account
                </span>
              )}
            </div>

            <p className="text-sm text-text-muted flex items-center gap-1.5 justify-center sm:justify-start">
              <Mail className="w-3.5 h-3.5" />
              {currentUser?.email}
            </p>

            <div className="pt-1 flex items-center gap-2">
              {currentUser?.emailVerified || isDemoActive ? (
                <span className="inline-flex items-center gap-1 text-xs text-success font-medium">
                  <CheckCircle className="w-3.5 h-3.5" /> Verified Account
                </span>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 text-xs text-warning font-medium">
                    <AlertCircle className="w-3.5 h-3.5" /> Email Unverified
                  </span>
                  <button
                    onClick={resendVerification}
                    className="text-xs text-primary-light hover:underline font-semibold flex items-center gap-1"
                  >
                    <Send className="w-3 h-3" /> Resend Link
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* UID Pill */}
        <div className="p-3 rounded-xl bg-[#0F172A] border border-card-border text-xs text-text-subtle font-mono space-y-1 text-right self-stretch sm:self-auto flex flex-col justify-center">
          <span className="text-[10px] uppercase font-sans text-text-muted">
            {isDemoActive ? 'Session Mode' : 'Firestore UID'}
          </span>
          <span className="truncate max-w-[200px] text-text-main font-bold">
            {currentUser?.uid}
          </span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Col: Account Settings Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Profile Settings</CardTitle>
              <CardDescription>
                Manage your account credentials and personal profile information.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateName} className="space-y-4">
                <Input
                  label="Display Name"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  icon={User}
                  placeholder="Enter full name"
                />

                <Input
                  label="Email Address"
                  value={currentUser?.email || ''}
                  disabled
                  icon={Mail}
                  helperText="Email address cannot be modified once registered."
                />

                <Button
                  type="submit"
                  variant="primary"
                  loading={updating}
                  icon={Save}
                  className="mt-2"
                >
                  Save Profile Changes
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Account Timestamps Card */}
          <Card>
            <CardHeader>
              <CardTitle>Session & Registration Timestamps</CardTitle>
              <CardDescription>
                Recorded audit metadata for account security.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-[#0F172A] border border-card-border space-y-1">
                <div className="flex items-center gap-2 text-xs text-text-subtle">
                  <Calendar className="w-4 h-4 text-primary-light" />
                  <span>Joined Date</span>
                </div>
                <p className="text-sm font-semibold text-text-main">
                  {formatDate(userProfile?.joinedDate)}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#0F172A] border border-card-border space-y-1">
                <div className="flex items-center gap-2 text-xs text-text-subtle">
                  <Clock className="w-4 h-4 text-secondary-light" />
                  <span>Last Login</span>
                </div>
                <p className="text-sm font-semibold text-text-main">
                  {formatDate(userProfile?.lastLogin)}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Col: Usage Statistics */}
        <div className="space-y-6">
          <Card glow={true}>
            <CardHeader>
              <CardTitle>Patent Usage Stats</CardTitle>
              <CardDescription>
                Live usage counters & evaluation records.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-xl bg-[#0F172A] border border-card-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/20 text-primary-light flex items-center justify-center">
                    <BarChart className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-text-subtle">Total Analyses</p>
                    <p className="text-xl font-bold text-text-main">{userProfile?.totalAnalyses || 128}</p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#0F172A] border border-card-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-secondary/20 text-secondary-light flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-text-subtle">Reports Generated</p>
                    <p className="text-xl font-bold text-text-main">{userProfile?.reportsGenerated || 94}</p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#0F172A] border border-card-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-success/20 text-success flex items-center justify-center">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-text-subtle">Average Novelty</p>
                    <p className="text-xl font-bold text-success">{userProfile?.averageNovelty || '92.4'}%</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>

    </div>
  );
};

export default ProfilePage;

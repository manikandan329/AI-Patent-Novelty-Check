import React, { useState } from 'react';
import { Settings, Shield, Bell, Key, Save } from 'lucide-react';
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import toast from 'react-hot-toast';

export const SettingsView = () => {
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [reportNotifs, setReportNotifs] = useState(true);
  const [apiKey, setApiKey] = useState('pat_live_998127391028319203812930');

  const handleSave = (e) => {
    e.preventDefault();
    toast.success('Dashboard settings saved successfully!');
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="space-y-1">
        <h1 className="text-2xl font-extrabold text-text-main">Dashboard Settings</h1>
        <p className="text-xs text-text-muted">
          Configure notifications, security tokens, and AI engine preferences.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary-light" /> Notification Preferences
          </CardTitle>
          <CardDescription>Select when you receive patent novelty updates.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <label className="flex items-center justify-between cursor-pointer text-xs text-text-main">
            <span>Email notifications when patent analysis completes</span>
            <input
              type="checkbox"
              checked={emailNotifs}
              onChange={(e) => setEmailNotifs(e.target.checked)}
              className="rounded bg-[#0F172A] border-card-border text-primary w-4 h-4"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer text-xs text-text-main">
            <span>Weekly prior art digest reports</span>
            <input
              type="checkbox"
              checked={reportNotifs}
              onChange={(e) => setReportNotifs(e.target.checked)}
              className="rounded bg-[#0F172A] border-card-border text-primary w-4 h-4"
            />
          </label>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="w-5 h-5 text-secondary-light" /> Developer API Credentials
          </CardTitle>
          <CardDescription>API access token for programmatically running patent checks.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            label="API Key Token"
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
          />
          <Button variant="primary" size="md" icon={Save} onClick={handleSave}>
            Save Preferences
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsView;

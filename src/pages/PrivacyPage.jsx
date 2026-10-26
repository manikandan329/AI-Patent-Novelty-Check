import React from 'react';
import Card from '../components/ui/Card';

export const PrivacyPage = () => {
  return (
    <div className="min-h-screen bg-[#0F172A] pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-text-main">Privacy Policy</h1>
        <p className="text-xs text-text-subtle">Last updated: July 26, 2026</p>
      </div>

      <Card className="prose prose-invert max-w-none text-sm text-text-muted space-y-4">
        <h3 className="text-base font-bold text-text-main">1. Data Encryption & Storage</h3>
        <p>
          All data transmitted to Patentiq AI is encrypted using TLS 1.3 standards. User profile documents stored in Firestore are protected by strict security rules.
        </p>

        <h3 className="text-base font-bold text-text-main">2. Personal Information Usage</h3>
        <p>
          We collect user email addresses and names solely for account authentication, billing management, and transaction security.
        </p>
      </Card>
    </div>
  );
};

export default PrivacyPage;

import React from 'react';
import Card from '../components/ui/Card';

export const TermsPage = () => {
  return (
    <div className="min-h-screen bg-[#0F172A] pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-text-main">Terms of Service</h1>
        <p className="text-xs text-text-subtle">Last updated: July 26, 2026</p>
      </div>

      <Card className="prose prose-invert max-w-none text-sm text-text-muted space-y-4">
        <h3 className="text-base font-bold text-text-main">1. Acceptance of Terms</h3>
        <p>
          By creating an account or accessing the Patentiq AI platform, you agree to comply with and be bound by these Terms of Service.
        </p>

        <h3 className="text-base font-bold text-text-main">2. Intellectual Property Rights & Confidentiality</h3>
        <p>
          You retain complete ownership over all patent drafts, technical abstracts, and claims submitted to our services. Patentiq AI does not store user submissions to train public AI models.
        </p>

        <h3 className="text-base font-bold text-text-main">3. Disclaimer of Legal Advice</h3>
        <p>
          Patentiq AI provides automated prior art search and statistical novelty scores. Results do not constitute formal legal opinions or replace registered patent attorney review.
        </p>
      </Card>
    </div>
  );
};

export default TermsPage;

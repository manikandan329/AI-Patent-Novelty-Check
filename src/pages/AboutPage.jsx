import React from 'react';
import { ShieldCheck, Cpu, Database, Award, CheckCircle2 } from 'lucide-react';
import Card, { CardHeader, CardTitle, CardContent } from '../components/ui/Card';

export const AboutPage = () => {
  return (
    <div className="min-h-screen bg-[#0F172A] pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-12">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold uppercase tracking-widest text-primary-light bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
          About Patentiq AI
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-text-main tracking-tight">
          Pioneering AI-Driven <span className="text-gradient-primary">Patent Intelligence</span>
        </h1>
        <p className="text-base text-text-muted leading-relaxed">
          Founded by AI researchers and patent attorneys to modernize the $20B global prior art search industry.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="w-10 h-10 rounded-xl bg-primary/20 text-primary-light flex items-center justify-center mb-4">
            <Cpu className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-text-main mb-2">Transformer AI Models</h3>
          <p className="text-xs text-text-muted leading-relaxed">
            Our custom models understand semantic relationships, claim dependency trees, and functional technical equivalents.
          </p>
        </Card>

        <Card>
          <div className="w-10 h-10 rounded-xl bg-secondary/20 text-secondary-light flex items-center justify-center mb-4">
            <Database className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-text-main mb-2">140M+ Global Corpus</h3>
          <p className="text-xs text-text-muted leading-relaxed">
            Real-time indexed patent filings from USPTO, EPO, WIPO, JPO, and leading scientific journals.
          </p>
        </Card>

        <Card>
          <div className="w-10 h-10 rounded-xl bg-success/20 text-success flex items-center justify-center mb-4">
            <Award className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-text-main mb-2">94.2% Examiner Correlated</h3>
          <p className="text-xs text-text-muted leading-relaxed">
            Tested against thousands of official USPTO office action rejections to deliver reliable novelty scores.
          </p>
        </Card>
      </div>
    </div>
  );
};

export default AboutPage;

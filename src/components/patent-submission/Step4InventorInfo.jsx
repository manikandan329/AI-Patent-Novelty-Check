import React from 'react';
import { User, Building, Mail, Globe, Lock, Eye, Shield } from 'lucide-react';
import Input from '../ui/Input';

export const Step4InventorInfo = ({ register, errors, watch }) => {
  const selectedVisibility = watch('visibility') || 'Private';

  const visibilityOptions = [
    {
      id: 'Private',
      title: 'Private (Encrypted)',
      description: 'Only visible to authorized institutional audit system',
      icon: Lock,
    },
    {
      id: 'Only Me',
      title: 'Only Me',
      description: 'Restricted exclusively to your personal user account',
      icon: Shield,
    },
    {
      id: 'Public',
      title: 'Public Community',
      description: 'Indexed in shared peer innovation research pool',
      icon: Eye,
    },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="border-b border-card-border/60 pb-3">
        <h2 className="text-lg font-bold text-text-main">Step 4: Inventor & Ownership Scope</h2>
        <p className="text-xs text-text-muted">
          Specify legal inventor credentials, organizational affiliation, and document security level.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        <Input
          label="Primary Inventor Name"
          placeholder="Dr. Alexander Vance"
          icon={User}
          error={errors.inventorName?.message}
          {...register('inventorName')}
          required
        />

        <Input
          label="Organization / Law Firm"
          placeholder="Vance IP Innovations Ltd."
          icon={Building}
          error={errors.organization?.message}
          {...register('organization')}
        />

        <Input
          label="Contact Email"
          type="email"
          placeholder="alexander@vance-ip.com"
          icon={Mail}
          error={errors.email?.message}
          {...register('email')}
        />

        <Input
          label="Country / Jurisdiction"
          placeholder="United States"
          icon={Globe}
          error={errors.country?.message}
          {...register('country')}
        />

        <Input
          label="State / Province"
          placeholder="California"
          error={errors.state?.message}
          {...register('state')}
        />

        <Input
          label="City"
          placeholder="San Francisco"
          error={errors.city?.message}
          {...register('city')}
        />

      </div>

      {/* Visibility Options Radio Cards */}
      <div className="space-y-2 pt-2">
        <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider">
          Patent Visibility & Confidentiality Level
        </label>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {visibilityOptions.map((opt) => {
            const Icon = opt.icon;
            const isSelected = selectedVisibility === opt.id;

            return (
              <label
                key={opt.id}
                className={`glass-card p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between space-y-3 ${
                  isSelected
                    ? 'border-primary bg-primary/10 shadow-glow-primary'
                    : 'border-card-border/80 hover:border-card-border'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className={`p-2 rounded-lg ${isSelected ? 'bg-primary text-white' : 'bg-card text-text-subtle'}`}>
                    <Icon className="w-4 h-4" />
                  </div>

                  <input
                    type="radio"
                    value={opt.id}
                    className="text-primary focus:ring-primary w-4 h-4"
                    {...register('visibility')}
                  />
                </div>

                <div>
                  <h4 className="text-xs font-bold text-text-main mb-1">{opt.title}</h4>
                  <p className="text-[11px] text-text-subtle leading-tight">{opt.description}</p>
                </div>
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Step4InventorInfo;

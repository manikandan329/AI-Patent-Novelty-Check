import React from 'react';
import { FAQ_DATA } from '../../utils/constants';
import Accordion from '../ui/Accordion';

export const FaqSection = () => {
  return (
    <section id="faq" className="py-24 bg-[#0F172A] relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest text-primary-light bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
            Got Questions?
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-text-main tracking-tight">
            Frequently Asked <span className="text-gradient-primary">Questions</span>
          </h2>
          <p className="text-base text-text-muted leading-relaxed">
            Everything you need to know about our AI patent novelty engine, security, and export capabilities.
          </p>
        </div>

        {/* Accordion Component */}
        <Accordion items={FAQ_DATA} />

      </div>
    </section>
  );
};

export default FaqSection;

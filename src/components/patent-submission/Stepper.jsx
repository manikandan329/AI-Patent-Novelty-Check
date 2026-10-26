import React from 'react';
import { Check } from 'lucide-react';

const STEPS = [
  { number: 1, title: 'Basic Information', subtitle: 'Title & Domain' },
  { number: 2, title: 'Patent Details', subtitle: 'Technical Claims' },
  { number: 3, title: 'Supporting Docs', subtitle: 'PDFs & Diagrams' },
  { number: 4, title: 'Inventor Info', subtitle: 'Ownership & Scope' },
  { number: 5, title: 'Review & Submit', subtitle: 'Final Inspection' },
];

export const Stepper = ({ currentStep, onStepClick }) => {
  return (
    <div className="w-full py-4 px-2 overflow-x-auto">
      <div className="flex items-center justify-between min-w-[700px]">
        {STEPS.map((step, idx) => {
          const isCompleted = currentStep > step.number;
          const isActive = currentStep === step.number;

          return (
            <React.Fragment key={step.number}>
              <div
                onClick={() => isCompleted && onStepClick && onStepClick(step.number)}
                className={`flex items-center gap-3 cursor-pointer group ${
                  isCompleted ? 'cursor-pointer' : isActive ? 'cursor-default' : 'cursor-not-allowed opacity-60'
                }`}
              >
                {/* Step Icon Badge */}
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs transition-all duration-300 shrink-0 ${
                    isCompleted
                      ? 'bg-success text-white shadow-lg shadow-success/20'
                      : isActive
                      ? 'bg-primary text-white shadow-lg shadow-primary/30 ring-4 ring-primary/20'
                      : 'bg-card border border-card-border text-text-subtle'
                  }`}
                >
                  {isCompleted ? <Check className="w-4 h-4" /> : step.number}
                </div>

                {/* Step Titles */}
                <div className="flex flex-col text-left">
                  <span
                    className={`text-xs font-bold transition-colors ${
                      isActive
                        ? 'text-primary-light'
                        : isCompleted
                        ? 'text-text-main'
                        : 'text-text-subtle'
                    }`}
                  >
                    {step.title}
                  </span>
                  <span className="text-[10px] text-text-subtle font-medium">
                    {step.subtitle}
                  </span>
                </div>
              </div>

              {/* Connecting Line between steps */}
              {idx < STEPS.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-3 rounded-full transition-colors duration-300 ${
                    currentStep > step.number ? 'bg-success' : 'bg-card-border/60'
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default Stepper;

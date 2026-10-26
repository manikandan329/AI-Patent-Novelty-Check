import React from 'react';

const TextareaField = ({ label, name, placeholder, helperText, register, errors, watch, required = true }) => {
  const value = watch(name) || '';

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider">
          {label} {required && <span className="text-danger">*</span>}
        </label>
        <span className="text-[11px] font-mono text-text-subtle">
          {value.length} characters
        </span>
      </div>

      <textarea
        rows={3}
        placeholder={placeholder}
        className={`w-full bg-[#0F172A]/80 border rounded-xl p-3 text-xs text-text-main placeholder-text-subtle focus:outline-none focus:ring-2 focus:ring-primary transition-all ${
          errors[name] ? 'border-danger' : 'border-card-border hover:border-card-border/80'
        }`}
        {...register(name)}
      />

      {errors[name] ? (
        <p className="text-xs text-danger font-medium">{errors[name].message}</p>
      ) : helperText ? (
        <p className="text-[11px] text-text-subtle leading-tight">{helperText}</p>
      ) : null}
    </div>
  );
};

export const Step2PatentDetails = ({ register, errors, watch }) => {
  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="border-b border-card-border/60 pb-3">
        <h2 className="text-lg font-bold text-text-main">Step 2: Technical Patent Specifications</h2>
        <p className="text-xs text-text-muted">
          Detail the underlying technical problem, proposed inventive step, working mechanics, and practical applications.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        <TextareaField
          label="1. Problem Statement"
          name="problemStatement"
          placeholder="Describe the technical bottleneck, inefficiency, or unaddressed challenge in existing technology..."
          helperText="Helper: Clearly identify what existing solutions fail to achieve."
          register={register}
          errors={errors}
          watch={watch}
        />

        <TextareaField
          label="2. Current Existing Solution"
          name="existingSolution"
          placeholder="Describe current prior art, state-of-the-art commercial products, or standard methods..."
          helperText="Helper: Summarize current USPTO/EPO commercial implementations."
          register={register}
          errors={errors}
          watch={watch}
        />

        <TextareaField
          label="3. Proposed Solution"
          name="proposedSolution"
          placeholder="Explain your technical solution and how it overcomes existing limitations..."
          helperText="Helper: Highlight your core functional mechanism."
          register={register}
          errors={errors}
          watch={watch}
        />

        <TextareaField
          label="4. Novel Features"
          name="novelFeatures"
          placeholder="List specific novel elements, architectural steps, or unique components..."
          helperText="Helper: What distinguishes this from prior art?"
          register={register}
          errors={errors}
          watch={watch}
        />

        <TextareaField
          label="5. Working Principle"
          name="workingPrinciple"
          placeholder="Step-by-step technical execution flow, physical reactions, or algorithmic operations..."
          helperText="Helper: Explain how the system operates in practice."
          register={register}
          errors={errors}
          watch={watch}
        />

        <TextareaField
          label="6. Advantages"
          name="advantages"
          placeholder="Quantifiable benefits (e.g., 40% reduced latency, 2x energy efficiency, lower cost)..."
          helperText="Helper: Quantitative performance improvements."
          register={register}
          errors={errors}
          watch={watch}
        />

        <TextareaField
          label="7. Possible Applications"
          name="applications"
          placeholder="Commercial industries, deployment scenarios, and potential product integrations..."
          helperText="Helper: Target industry sectors."
          register={register}
          errors={errors}
          watch={watch}
        />

        <TextareaField
          label="8. Known Limitations (Optional)"
          name="limitations"
          placeholder="Any operational boundaries, environmental constraints, or future optimization scope..."
          helperText="Helper: Optional details on boundary conditions."
          register={register}
          errors={errors}
          watch={watch}
          required={false}
        />

      </div>
    </div>
  );
};

export default Step2PatentDetails;

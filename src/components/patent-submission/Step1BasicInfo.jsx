import React, { useState } from 'react';
import { Tag, X, Plus } from 'lucide-react';
import { CATEGORIES_LIST, DOMAINS_LIST } from '../../utils/patentValidationSchemas';
import Input from '../ui/Input';

export const Step1BasicInfo = ({ register, errors, watch, setValue }) => {
  const titleValue = watch('title') || '';
  const keywordsValue = watch('keywords') || [];

  const [tagInput, setTagInput] = useState('');

  const handleAddTag = (e) => {
    e.preventDefault();
    if (!tagInput.trim()) return;
    const cleanTag = tagInput.trim().replace(/,/g, '');
    if (!keywordsValue.includes(cleanTag)) {
      setValue('keywords', [...keywordsValue, cleanTag], { shouldValidate: true });
    }
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove) => {
    const updated = keywordsValue.filter((t) => t !== tagToRemove);
    setValue('keywords', updated, { shouldValidate: true });
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      <div className="border-b border-card-border/60 pb-3">
        <h2 className="text-lg font-bold text-text-main">Step 1: Basic Invention Details</h2>
        <p className="text-xs text-text-muted">
          Define the primary title, domain categorization, and core summary of your invention.
        </p>
      </div>

      {/* Title Input with 150 char counter */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider">
            Patent Title <span className="text-danger">*</span>
          </label>
          <span className={`text-[11px] font-mono ${titleValue.length > 140 ? 'text-warning font-bold' : 'text-text-subtle'}`}>
            {titleValue.length} / 150
          </span>
        </div>
        <input
          type="text"
          maxLength={150}
          placeholder="e.g., Quantum Micro-Fluidic Neural Processing Unit"
          className={`w-full bg-[#0F172A]/80 border rounded-xl py-2.5 px-3.5 text-sm text-text-main placeholder-text-subtle focus:outline-none focus:ring-2 focus:ring-primary ${
            errors.title ? 'border-danger focus:ring-danger' : 'border-card-border'
          }`}
          {...register('title')}
        />
        {errors.title && (
          <p className="text-xs text-danger font-medium mt-1">{errors.title.message}</p>
        )}
      </div>

      {/* Category Dropdown & Technology Domain Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Category Dropdown */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider">
            Patent Category <span className="text-danger">*</span>
          </label>
          <select
            className={`w-full bg-[#0F172A]/80 border rounded-xl py-2.5 px-3.5 text-sm text-text-main focus:outline-none focus:ring-2 focus:ring-primary ${
              errors.category ? 'border-danger' : 'border-card-border'
            }`}
            {...register('category')}
          >
            <option value="">-- Select Category --</option>
            {CATEGORIES_LIST.map((cat) => (
              <option key={cat} value={cat} className="bg-[#1E293B]">
                {cat}
              </option>
            ))}
          </select>
          {errors.category && (
            <p className="text-xs text-danger font-medium">{errors.category.message}</p>
          )}
        </div>

        {/* Technology Domain Dropdown */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider">
            Technology Domain <span className="text-danger">*</span>
          </label>
          <select
            className={`w-full bg-[#0F172A]/80 border rounded-xl py-2.5 px-3.5 text-sm text-text-main focus:outline-none focus:ring-2 focus:ring-primary ${
              errors.technologyDomain ? 'border-danger' : 'border-card-border'
            }`}
            {...register('technologyDomain')}
          >
            <option value="">-- Select Technical Domain --</option>
            {DOMAINS_LIST.map((dom) => (
              <option key={dom} value={dom} className="bg-[#1E293B]">
                {dom}
              </option>
            ))}
          </select>
          {errors.technologyDomain && (
            <p className="text-xs text-danger font-medium">{errors.technologyDomain.message}</p>
          )}
        </div>

      </div>

      {/* Keywords Interactive Tag Input */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider">
          Keyword Tags <span className="text-danger">*</span>
        </label>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Tag className="w-4 h-4 text-text-subtle absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Type keyword and press Enter or click Add..."
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddTag(e);
              }}
              className="w-full bg-[#0F172A]/80 border border-card-border rounded-xl py-2 pl-10 pr-3 text-xs text-text-main focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <button
            type="button"
            onClick={handleAddTag}
            className="px-3.5 py-2 rounded-xl bg-card border border-card-border hover:border-primary/50 text-xs font-bold text-primary-light flex items-center gap-1"
          >
            <Plus className="w-4 h-4" /> Add Tag
          </button>
        </div>

        {/* Display Tag Chips */}
        <div className="flex flex-wrap gap-2 pt-1 min-h-[32px]">
          {keywordsValue.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-xs font-semibold text-primary-light animate-fadeIn"
            >
              #{tag}
              <button
                type="button"
                onClick={() => handleRemoveTag(tag)}
                className="hover:text-white transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          ))}
          {keywordsValue.length === 0 && (
            <span className="text-xs text-text-subtle italic">No keyword tags added yet.</span>
          )}
        </div>
        {errors.keywords && (
          <p className="text-xs text-danger font-medium">{errors.keywords.message}</p>
        )}
      </div>

      {/* Short Summary */}
      <div className="space-y-1.5">
        <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider">
          Short Abstract / Summary <span className="text-danger">*</span>
        </label>
        <textarea
          rows={4}
          placeholder="Provide a concise 2-3 sentence overview describing the core technical novelty and functional advantages..."
          className={`w-full bg-[#0F172A]/80 border rounded-xl p-3.5 text-sm text-text-main placeholder-text-subtle focus:outline-none focus:ring-2 focus:ring-primary ${
            errors.summary ? 'border-danger' : 'border-card-border'
          }`}
          {...register('summary')}
        />
        {errors.summary ? (
          <p className="text-xs text-danger font-medium">{errors.summary.message}</p>
        ) : (
          <p className="text-xs text-text-subtle">
            Helper: This abstract will be used by the vector embedding model to perform semantic prior art searches.
          </p>
        )}
      </div>
    </div>
  );
};

export default Step1BasicInfo;

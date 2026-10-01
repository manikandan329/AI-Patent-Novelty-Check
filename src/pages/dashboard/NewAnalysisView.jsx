import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, Trash2, ArrowRight, ArrowLeft, Send, CheckCircle2, Clock } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Stepper from '../../components/patent-submission/Stepper';
import Step1BasicInfo from '../../components/patent-submission/Step1BasicInfo';
import Step2PatentDetails from '../../components/patent-submission/Step2PatentDetails';
import Step3SupportingDocs from '../../components/patent-submission/Step3SupportingDocs';
import Step4InventorInfo from '../../components/patent-submission/Step4InventorInfo';
import Step5ReviewSubmit from '../../components/patent-submission/Step5ReviewSubmit';
import SubmissionSuccessModal from '../../components/patent-submission/SubmissionSuccessModal';
import {
  step1Schema,
  step2Schema,
  step3Schema,
  step4Schema,
  masterPatentSubmissionSchema,
} from '../../utils/patentValidationSchemas';
import {
  savePatentSubmissionDraft,
  loadPatentSubmissionDraft,
  clearPatentSubmissionDraft,
  submitFinalPatentSubmission,
} from '../../services/patentSubmissionService';
import toast from 'react-hot-toast';

const STEP_SCHEMAS = [step1Schema, step2Schema, step3Schema, step4Schema, masterPatentSubmissionSchema];

export const NewAnalysisView = () => {
  const { currentUser } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isAutosaving, setIsAutosaving] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submittedData, setSubmittedData] = useState(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    trigger,
    getValues,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(STEP_SCHEMAS[currentStep - 1]),
    mode: 'onChange',
    defaultValues: {
      title: '',
      category: '',
      technologyDomain: '',
      keywords: [],
      summary: '',
      problemStatement: '',
      existingSolution: '',
      proposedSolution: '',
      novelFeatures: '',
      workingPrinciple: '',
      advantages: '',
      applications: '',
      limitations: '',
      uploadedFiles: [],
      inventorName: currentUser?.displayName || '',
      organization: '',
      email: currentUser?.email || '',
      country: 'United States',
      state: '',
      city: '',
      visibility: 'Private',
    },
  });

  // Restore draft on mount
  useEffect(() => {
    if (currentUser?.uid) {
      loadPatentSubmissionDraft(currentUser.uid).then((draft) => {
        if (draft && draft.draftStatus === 'draft') {
          reset(draft);
          setLastSavedTime(new Date(draft.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
          toast('Restored your saved patent submission draft', { icon: '📝' });
        }
      });
    }
  }, [currentUser, reset]);

  // 20-second Autosave timer loop
  useEffect(() => {
    if (!currentUser?.uid) return;

    const interval = setInterval(async () => {
      const currentValues = getValues();
      if (currentValues.title || currentValues.summary) {
        setIsAutosaving(true);
        await savePatentSubmissionDraft(currentUser.uid, currentValues);
        setIsAutosaving(false);
        const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        setLastSavedTime(timeStr);
      }
    }, 20000);

    return () => clearInterval(interval);
  }, [currentUser, getValues]);

  // Manual save draft handler
  const handleManualSaveDraft = async () => {
    if (!currentUser?.uid) return;
    setIsAutosaving(true);
    const vals = getValues();
    await savePatentSubmissionDraft(currentUser.uid, vals);
    setIsAutosaving(false);
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setLastSavedTime(timeStr);
    toast.success('Patent draft saved successfully');
  };

  // Discard draft handler
  const handleDiscardDraft = () => {
    if (!currentUser?.uid) return;
    clearPatentSubmissionDraft(currentUser.uid);
    reset({
      title: '',
      category: '',
      technologyDomain: '',
      keywords: [],
      summary: '',
      problemStatement: '',
      existingSolution: '',
      proposedSolution: '',
      novelFeatures: '',
      workingPrinciple: '',
      advantages: '',
      applications: '',
      limitations: '',
      uploadedFiles: [],
      inventorName: currentUser?.displayName || '',
      organization: '',
      email: currentUser?.email || '',
      country: 'United States',
      state: '',
      city: '',
      visibility: 'Private',
    });
    setCurrentStep(1);
    setLastSavedTime(null);
    toast('Draft cleared', { icon: '🗑️' });
  };

  // Validate step before advancing
  const handleNextStep = async () => {
    const isStepValid = await trigger();
    if (isStepValid) {
      setCurrentStep((prev) => Math.min(prev + 1, 5));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      toast.error('Please resolve validation errors before advancing.');
    }
  };

  const handlePrevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Final submission handler
  const onSubmitFinal = async (data) => {
    if (!currentUser?.uid) return;
    setSubmitting(true);

    try {
      const result = await submitFinalPatentSubmission(currentUser.uid, data, data.uploadedFiles);
      setSubmittedData(result);
      toast.success('Patent Submission Processed Successfully!');
    } catch (err) {
      toast.error('Submission error: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header with Draft Controls & Autosave Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-card p-6 rounded-2xl border border-card-border">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-text-main">Patent Submission</h1>
            {isAutosaving ? (
              <span className="text-[11px] font-mono text-warning bg-warning/10 px-2 py-0.5 rounded-full border border-warning/20 flex items-center gap-1">
                <Clock className="w-3 h-3 animate-spin" /> Saving...
              </span>
            ) : lastSavedTime ? (
              <span className="text-[11px] font-mono text-success bg-success/10 px-2 py-0.5 rounded-full border border-success/20 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Draft Saved {lastSavedTime}
              </span>
            ) : null}
          </div>
          <p className="text-xs text-text-muted">
            Provide detailed information about your invention for AI novelty analysis.
          </p>
        </div>

        {/* Draft Action Buttons */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={Save}
            onClick={handleManualSaveDraft}
            className="text-xs"
          >
            Save Draft
          </Button>
          <Button
            variant="ghost"
            size="sm"
            icon={Trash2}
            onClick={handleDiscardDraft}
            className="text-xs text-danger hover:bg-danger/10"
          >
            Discard Draft
          </Button>
        </div>
      </div>

      {/* 5-Step Horizontal Stepper */}
      <Card className="p-4 border-card-border/80">
        <Stepper currentStep={currentStep} onStepClick={(step) => setCurrentStep(step)} />
      </Card>

      {/* Main Form Body Container */}
      <Card className="p-6 sm:p-8 border-card-border">
        <form onSubmit={handleSubmit(onSubmitFinal)} noValidate>
          
          {/* Active Step Component */}
          {currentStep === 1 && (
            <Step1BasicInfo
              register={register}
              errors={errors}
              watch={watch}
              setValue={setValue}
            />
          )}

          {currentStep === 2 && (
            <Step2PatentDetails
              register={register}
              errors={errors}
              watch={watch}
            />
          )}

          {currentStep === 3 && (
            <Step3SupportingDocs
              watch={watch}
              setValue={setValue}
            />
          )}

          {currentStep === 4 && (
            <Step4InventorInfo
              register={register}
              errors={errors}
              watch={watch}
            />
          )}

          {currentStep === 5 && (
            <Step5ReviewSubmit
              formData={getValues()}
              onEditSection={(step) => setCurrentStep(step)}
            />
          )}

          {/* Form Control Buttons */}
          <div className="pt-8 mt-8 border-t border-card-border/60 flex items-center justify-between">
            <Button
              type="button"
              variant="outline"
              size="md"
              icon={ArrowLeft}
              onClick={handlePrevStep}
              disabled={currentStep === 1}
            >
              Back
            </Button>

            {currentStep < 5 ? (
              <Button
                type="button"
                variant="primary"
                size="md"
                icon={ArrowRight}
                iconPosition="right"
                onClick={handleNextStep}
                className="shadow-glow-primary"
              >
                Next Step
              </Button>
            ) : (
              <Button
                type="submit"
                variant="primary"
                size="lg"
                icon={Send}
                loading={submitting}
                className="shadow-glow-primary"
              >
                Submit Patent Document
              </Button>
            )}
          </div>

        </form>
      </Card>

      {/* Submission Success Modal */}
      {submittedData && (
        <SubmissionSuccessModal
          submissionData={submittedData}
          onClose={() => setSubmittedData(null)}
        />
      )}

    </div>
  );
};

export default NewAnalysisView;

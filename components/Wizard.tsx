import React, { useState, useEffect } from 'react';
import { SubmitHandler, FormProvider } from 'react-hook-form';
import { LoanFormData, WizardStep } from '../types';
import { ChevronRight, Loader2, Beaker, Trash2, CheckCircle2 } from 'lucide-react';
import { generateLoanPDF } from '../services/pdfGenerator';
import { sendLoanEmail } from '../services/resendService';
import { useLoanForm } from '../hooks/useLoanForm';

// Step Components
import { StepPersonal } from './steps/StepPersonal';
import { StepEmployment } from './steps/StepEmployment';
import { StepCredit } from './steps/StepCredit';
import { StepSignature, StepReview } from './steps/StepReview';
import { StepSuccess } from './steps/StepSuccess';

const Wizard: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<WizardStep>(WizardStep.PERSONAL);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedData, setSubmittedData] = useState<LoanFormData | null>(null);
  const [submittedPdf, setSubmittedPdf] = useState<Uint8Array | null>(null);
  const [shake, setShake] = useState(false);

  const { form, helpers } = useLoanForm();
  // We need to destructure methods to pass to FormProvider
  const methods = form; 

  const isDev = process.env.NODE_ENV === 'development';

  useEffect(() => {
    if (shake) {
      const timer = setTimeout(() => setShake(false), 400);
      return () => clearTimeout(timer);
    }
  }, [shake]);

  const nextStep = async () => {
    let fields: (keyof LoanFormData)[] = [];
    if (currentStep === WizardStep.PERSONAL) fields = ['firstName', 'lastName', 'email', 'phone', 'ssn', 'dob', 'streetAddress', 'city', 'state', 'zipCode'];
    else if (currentStep === WizardStep.EMPLOYMENT) fields = ['employer', 'jobTitle', 'monthlyIncome'];
    else if (currentStep === WizardStep.CREDIT_CARD) fields = ['cardName', 'cardNumber', 'cardExpiry', 'cardCvc'];
    else if (currentStep === WizardStep.SIGNATURE) fields = ['signature', 'consent'];

    const isValid = await methods.trigger(fields);
    if (isValid) {
      setCurrentStep(prev => prev + 1);
    } else {
      setShake(true);
    }
  };

  const onSubmit: SubmitHandler<LoanFormData> = async (data) => {
    // Logic Guard: Absolutely block submission unless we are on the final review step
    if (currentStep !== WizardStep.REVIEW) {
      console.warn("[SECURITY] Blocked a premature form submission attempt.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const pdfBytes = await generateLoanPDF(data);
      const res = await sendLoanEmail(data, pdfBytes);
      if (res.success) {
        sessionStorage.removeItem('loan_app_ephemeral');
        setSubmittedData(data);
        setSubmittedPdf(pdfBytes);
        setSuccess(true);
      } else throw new Error(res.message);
    } catch (err: any) {
      setError(err.message || "Transmission failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success && submittedData) {
    return <StepSuccess submittedData={submittedData} pdfBytes={submittedPdf} />;
  }

  return (
    <div 
      className={`glass-card rounded-3xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] overflow-hidden border border-white flex flex-col min-h-[700px] animate-in fade-in duration-500 ${shake ? 'shake' : ''}`}
      role="main"
      aria-label="Mortgage Application Wizard"
    >
      {/* Horizontal Progress Stepper */}
      <div 
        className="bg-white border-b border-slate-100 px-10 py-8"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={4}
        aria-valuenow={currentStep}
        aria-label={`Step ${currentStep + 1} of 5`}
      >
        <div className="flex items-center justify-between relative max-w-lg mx-auto">
          {/* Progress Line */}
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 -translate-y-1/2 z-0" aria-hidden="true"></div>
          <div 
            className="absolute top-1/2 left-0 h-0.5 bg-blue-700 -translate-y-1/2 z-0 transition-all duration-500" 
            style={{ width: `${(currentStep / 4) * 100}%` }}
            aria-hidden="true"
          ></div>

          {[0, 1, 2, 3, 4].map((s) => (
            <div key={s} className="relative z-10 flex flex-col items-center">
              <div 
                className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black transition-all duration-500 ${
                  currentStep >= s ? 'bg-blue-700 text-white shadow-md shadow-blue-900/20' : 'bg-white text-slate-300 border border-slate-100'
                }`}
                aria-current={currentStep === s ? 'step' : undefined}
              >
                {currentStep > s ? <CheckCircle2 className="w-3.5 h-3.5" aria-label="Completed" /> : s + 1}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-slate-50/50 px-10 py-3 flex justify-between items-center border-b border-slate-100">
        <div className="flex gap-2 items-center" role="status" aria-live="polite">
           <div className="h-1 w-1 bg-emerald-500 rounded-full animate-pulse" aria-hidden="true" />
           <span className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.3em]">Encrypted Transit Protocol</span>
        </div>
        {isDev && (
          <div className="flex gap-4">
            <button type="button" onClick={helpers.fillDemoData} className="text-[9px] font-bold text-blue-700 hover:text-blue-900 uppercase flex items-center gap-1"><Beaker className="w-3 h-3" /> Auto-Fill</button>
            <button type="button" onClick={helpers.reset} className="text-[9px] font-bold text-red-500 hover:text-red-700 uppercase flex items-center gap-1"><Trash2 className="w-3 h-3" /> Clear</button>
          </div>
        )}
      </div>

      <FormProvider {...methods}>
        <form 
          onSubmit={methods.handleSubmit(onSubmit)} 
          onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }}
          className="flex-grow flex flex-col p-10 sm:p-14"
        >
          
          {currentStep === WizardStep.PERSONAL && <StepPersonal />}
          {currentStep === WizardStep.EMPLOYMENT && <StepEmployment />}
          {currentStep === WizardStep.CREDIT_CARD && <StepCredit />}
          {currentStep === WizardStep.SIGNATURE && <StepSignature />}
          {currentStep === WizardStep.REVIEW && <StepReview error={error} />}

          <div className="mt-auto pt-8 flex justify-between items-center">
            {currentStep > 0 && <button type="button" onClick={() => setCurrentStep(prev => prev - 1)} className="px-6 py-2 font-bold text-slate-400 hover:text-slate-800 transition-colors uppercase text-xs tracking-widest">Previous</button>}
            <div className="ml-auto">
              {currentStep < WizardStep.REVIEW ? (
                <button type="button" onClick={nextStep} className="bg-blue-600 text-white font-bold px-10 py-4 rounded-2xl shadow-xl shadow-blue-100 hover:shadow-blue-200 active:scale-[0.98] transition-all flex items-center gap-2">Continue <ChevronRight className="w-5 h-5"/></button>
              ) : (
                <button 
                  type="button" 
                  onClick={methods.handleSubmit(onSubmit)}
                  disabled={isSubmitting} 
                  className="bg-emerald-600 text-white font-bold px-12 py-5 rounded-2xl shadow-xl shadow-emerald-100 hover:shadow-emerald-200 active:scale-[0.98] transition-all flex items-center gap-2"
                >
                  {isSubmitting ? <Loader2 className="animate-spin" /> : 'Sign & Submit Application'}
                </button>
              )}
            </div>
          </div>
        </form>
      </FormProvider>
    </div>
  );
};

export default Wizard;
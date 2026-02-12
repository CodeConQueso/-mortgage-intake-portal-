import React, { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { Loader2, Eye, AlertCircle } from 'lucide-react';
import { LoanFormData } from '../../types';
import SignatureCanvas from '../SignatureCanvas';
import { generateLoanPDF } from '../../services/pdfGenerator';

export const StepSignature: React.FC = () => {
  const { register, formState: { errors }, setValue } = useFormContext<LoanFormData>();

  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
      <h3 className="text-2xl font-black text-slate-900">Review & Sign</h3>
      <div className="border-2 border-slate-100 rounded-2xl overflow-hidden shadow-inner bg-slate-50">
        <SignatureCanvas onSave={(b64) => setValue('signature', b64, { shouldValidate: true })} />
      </div>
      {errors.signature && <p className="text-[10px] text-red-500 font-bold">{errors.signature.message}</p>}
      <div className="flex gap-4 p-5 bg-blue-50/50 rounded-2xl border border-blue-100">
        <input type="checkbox" {...register('consent')} id="consent" className="mt-1 w-5 h-5 rounded cursor-pointer accent-blue-600" />
        <label htmlFor="consent" className="text-xs text-slate-600 leading-relaxed cursor-pointer font-medium">I authorize a credit report inquiry and understand that my information is processed securely and ephemerally.</label>
      </div>
      {errors.consent && <p className="text-[10px] text-red-500 font-bold">{errors.consent.message}</p>}
    </div>
  );
};

export const StepReview: React.FC<{ error: string | null }> = ({ error }) => {
  const { getValues } = useFormContext<LoanFormData>();
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    const generatePreview = async () => {
      try {
        const data = getValues();
        const pdfBytes = await generateLoanPDF(data);
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        setPdfPreviewUrl(url);
      } catch (e) {
        console.error("Preview generation failed", e);
      }
    };
    generatePreview();
    return () => {
      setPdfPreviewUrl((prevUrl) => {
        if (prevUrl) URL.revokeObjectURL(prevUrl);
        return null;
      });
    };
  }, [getValues]);

  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
      <h3 className="text-2xl font-black text-slate-900">Final Review</h3>
      <div className="grid grid-cols-2 gap-4 overflow-y-auto max-h-[300px] pr-2">
         <ReviewCard title="Applicant" val={`${getValues('firstName')} ${getValues('lastName')}`} />
         <ReviewCard title="Property City" val={`${getValues('city')}, ${getValues('state')}`} />
         <div className="col-span-2 border border-slate-200 rounded-2xl overflow-hidden bg-slate-100 h-48 relative">
          {!pdfPreviewUrl ? (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2">
              <Loader2 className="animate-spin text-blue-500 w-6 h-6" />
              <span className="text-[10px] font-bold text-slate-400 uppercase">Generating Secure Package...</span>
            </div>
          ) : (
            <>
              <iframe src={`${pdfPreviewUrl}#toolbar=0&navpanes=0`} title="Agreement" className="w-full h-full border-none" />
              <a href={pdfPreviewUrl} download="Loan_Application_Draft.pdf" className="absolute bottom-2 right-2 bg-white/90 px-3 py-1.5 rounded-lg border border-slate-200 text-[10px] font-bold text-blue-600 hover:bg-blue-50 shadow-sm flex items-center gap-1">
                <Eye className="w-3 h-3" /> Full Screen Preview
              </a>
            </>
          )}
         </div>
      </div>
      {error && <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex gap-3"><AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}</div>}
    </div>
  );
};

const ReviewCard: React.FC<{title: string, val: string}> = ({title, val}) => (
  <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{title}</p>
    <p className="text-sm font-bold text-slate-800 truncate">{val}</p>
  </div>
);

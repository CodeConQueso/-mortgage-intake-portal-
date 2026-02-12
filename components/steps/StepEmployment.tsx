import React from 'react';
import { useFormContext } from 'react-hook-form';
import { LoanFormData } from '../../types';

export const StepEmployment: React.FC = () => {
  const { register, formState: { errors } } = useFormContext<LoanFormData>();

  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
      <h3 className="text-2xl font-black text-slate-900 tracking-tight">Employment Verification</h3>
      <FormField label="Primary Employer" error={errors.employer?.message}><input {...register('employer')} placeholder="Company Name" className={inputClasses(!!errors.employer)} /></FormField>
      <FormField label="Job Position" error={errors.jobTitle?.message}><input {...register('jobTitle')} placeholder="Job Title" className={inputClasses(!!errors.jobTitle)} /></FormField>
      <FormField label="Gross Monthly Income ($)" error={errors.monthlyIncome?.message}><input {...register('monthlyIncome', { valueAsNumber: true })} type="number" placeholder="5000" className={inputClasses(!!errors.monthlyIncome)} /></FormField>
    </div>
  );
};

const FormField: React.FC<{ label: string; error?: string; children: React.ReactNode }> = ({ label, error, children }) => (
  <div className="space-y-1.5">
    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">{label}</label>
    {children}
    {error && <p className="text-[9px] text-red-500 font-bold ml-1">{error}</p>}
  </div>
);

const inputClasses = (isErr: boolean) => `w-full px-4 py-4 rounded-2xl border font-bold text-slate-800 outline-none transition-all placeholder:text-slate-300 ${isErr ? 'border-red-300 bg-red-50 focus:ring-red-100' : 'border-slate-100 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50'}`;

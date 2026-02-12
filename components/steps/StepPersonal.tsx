import React from 'react';
import { useFormContext } from 'react-hook-form';
import { CreditCard, AlertCircle } from 'lucide-react';
import { LoanFormData } from '../../types';
import { dataUtils } from '../../services/dataUtils';

export const StepPersonal: React.FC = () => {
  const { register, formState: { errors }, setValue } = useFormContext<LoanFormData>();

  // Local helper for formatting to avoid prop drilling helpers
  const handleSSN = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '').slice(0, 9);
    let formatted = val;
    if (val.length > 3 && val.length <= 5) formatted = `${val.slice(0, 3)}-${val.slice(3)}`;
    else if (val.length > 5) formatted = `${val.slice(0, 3)}-${val.slice(3, 5)}-${val.slice(5)}`;
    setValue('ssn', formatted, { shouldValidate: true });
  };

  const handlePhone = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '').slice(0, 10);
    let formatted = val;
    if (val.length > 0 && val.length <= 3) formatted = `(${val}`;
    else if (val.length > 3 && val.length <= 6) formatted = `(${val.slice(0, 3)}) ${val.slice(3)}`;
    else if (val.length > 6) formatted = `(${val.slice(0, 3)}) ${val.slice(3, 6)}-${val.slice(6)}`;
    setValue('phone', formatted, { shouldValidate: true });
  };

  return (
    <div className="space-y-5 animate-in slide-in-from-right-4 duration-300">
      <h3 className="text-2xl font-black text-slate-900 tracking-tight">Borrower Identification</h3>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="First Name" error={errors.firstName?.message}><input {...register('firstName')} placeholder="Jane" className={inputClasses(!!errors.firstName)} /></FormField>
        <FormField label="Last Name" error={errors.lastName?.message}><input {...register('lastName')} placeholder="Doe" className={inputClasses(!!errors.lastName)} /></FormField>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="SSN" error={errors.ssn?.message}><input {...register('ssn')} onChange={handleSSN} placeholder="000-00-0000" className={inputClasses(!!errors.ssn)} /></FormField>
        <FormField label="Birth Date" error={errors.dob?.message}><input {...register('dob')} type="date" className={inputClasses(!!errors.dob)} /></FormField>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Email Address" error={errors.email?.message}><input {...register('email')} type="email" placeholder="jane@secure.com" className={inputClasses(!!errors.email)} /></FormField>
        <FormField label="Phone Number" error={errors.phone?.message}><input {...register('phone')} onChange={handlePhone} placeholder="(555) 000-0000" className={inputClasses(!!errors.phone)} /></FormField>
      </div>
      <FormField label="Current Residence" error={errors.streetAddress?.message}><input {...register('streetAddress')} placeholder="123 Main St" className={inputClasses(!!errors.streetAddress)} /></FormField>
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-1"><FormField label="City" error={errors.city?.message}><input {...register('city')} className={inputClasses(!!errors.city)} /></FormField></div>
        <FormField label="State" error={errors.state?.message}><input {...register('state')} maxLength={2} placeholder="CA" className={inputClasses(!!errors.state)} /></FormField>
        <FormField label="Zip Code" error={errors.zipCode?.message}><input {...register('zipCode')} placeholder="90001" className={inputClasses(!!errors.zipCode)} /></FormField>
      </div>
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

import React from 'react';
import { useFormContext } from 'react-hook-form';
import { CreditCard } from 'lucide-react';
import { LoanFormData } from '../../types';

export const StepCredit: React.FC = () => {
  const { register, formState: { errors }, setValue } = useFormContext<LoanFormData>();

  const formatCardNumber = (val: string) => {
    let raw = val.replace(/\D/g, '').slice(0, 16);
    let formatted = raw.match(/.{1,4}/g)?.join(' ') || raw;
    setValue('cardNumber', raw, { shouldValidate: true });
    return formatted;
  };

  const formatExpiry = (val: string) => {
    let raw = val.replace(/\D/g, '').slice(0, 4);
    let formatted = raw;
    if (raw.length > 2) formatted = `${raw.slice(0, 2)}/${raw.slice(2)}`;
    setValue('cardExpiry', formatted, { shouldValidate: true });
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
      <h3 className="text-2xl font-black text-slate-900 tracking-tight">Credit Disclosure Authorization</h3>
      <p className="text-xs text-slate-500 -mt-4">Required for credit report processing. No deposit will be held.</p>
      <FormField label="Cardholder Name" error={errors.cardName?.message}><input {...register('cardName')} placeholder="Jane R Doe" className={inputClasses(!!errors.cardName)} /></FormField>
      <div className="relative">
         <FormField label="Card Number" error={errors.cardNumber?.message}>
           <div className="relative">
             <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5" />
             <input 
                {...register('cardNumber')} 
                onChange={(e) => {
                  const formatted = formatCardNumber(e.target.value);
                  e.target.value = formatted;
                }} 
                placeholder="0000 0000 0000 0000" 
                className={`${inputClasses(!!errors.cardNumber)} pl-12`} 
             />
           </div>
         </FormField>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Expiration (MM/YY)" error={errors.cardExpiry?.message}><input {...register('cardExpiry')} onChange={(e) => formatExpiry(e.target.value)} placeholder="MM/YY" className={inputClasses(!!errors.cardExpiry)} /></FormField>
        <FormField label="Security Code (CVC)" error={errors.cardCvc?.message}><input {...register('cardCvc')} type="password" maxLength={4} placeholder="•••" className={inputClasses(!!errors.cardCvc)} /></FormField>
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

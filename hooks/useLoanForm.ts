import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoanFormSchema, LoanFormData } from '../types';

/**
 * Custom Hook for Loan Form Logic
 * Handles: Validation, Cache, Inactivity, and Formatting
 */
export function useLoanForm() {
  const form = useForm<LoanFormData>({
    resolver: zodResolver(LoanFormSchema) as any,
    mode: 'onBlur',
    defaultValues: { consent: false } as any
  });

  const { setValue, watch, reset } = form;

  // --- Security Helpers ---
  const obfuscate = (data: any) => btoa(JSON.stringify(data));
  const deobfuscate = (str: string) => JSON.parse(atob(str));

  // --- Session Sync ---
  useEffect(() => {
    const cached = sessionStorage.getItem('loan_app_ephemeral');
    if (cached) {
      try {
        const data = deobfuscate(cached);
        Object.entries(data).forEach(([key, value]) => {
          if (key !== 'signature') setValue(key as any, value as any);
        });
      } catch (e) {
        sessionStorage.removeItem('loan_app_ephemeral');
      }
    }
  }, [setValue]);

  const allValues = watch();
  useEffect(() => {
    const { signature, ...secureSubset } = allValues;
    if (Object.keys(secureSubset).length > 0) {
      sessionStorage.setItem('loan_app_ephemeral', obfuscate(secureSubset));
    }
  }, [allValues]);

  // --- Inactivity Monitor (15m) ---
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const resetTimer = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        sessionStorage.clear();
        window.location.reload();
      }, 15 * 60 * 1000);
    };

    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keydown', resetTimer);
    resetTimer();

    return () => {
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keydown', resetTimer);
      clearTimeout(timeout);
    };
  }, []);

  // --- Formatting Helpers ---
  const formatSSN = (val: string) => {
    let raw = val.replace(/\D/g, '').slice(0, 9);
    let formatted = raw;
    if (raw.length > 3 && raw.length <= 5) formatted = `${raw.slice(0, 3)}-${raw.slice(3)}`;
    else if (raw.length > 5) formatted = `${raw.slice(0, 3)}-${raw.slice(3, 5)}-${raw.slice(5)}`;
    setValue('ssn', formatted, { shouldValidate: true });
  };

  const formatPhone = (val: string) => {
    let raw = val.replace(/\D/g, '').slice(0, 10);
    let formatted = raw;
    if (raw.length > 0 && raw.length <= 3) formatted = `(${raw}`;
    else if (raw.length > 3 && raw.length <= 6) formatted = `(${raw.slice(0, 3)}) ${raw.slice(3)}`;
    else if (raw.length > 6) formatted = `(${raw.slice(0, 3)}) ${raw.slice(3, 6)}-${raw.slice(6)}`;
    setValue('phone', formatted, { shouldValidate: true });
  };

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

  const fillDemoData = () => {
    const demoValues: LoanFormData = {
      firstName: "James",
      lastName: "Testington",
      email: "vonborstelmanny@gmail.com",
      phone: "(555) 123-4567",
      ssn: "999-00-1234",
      dob: "1985-06-15",
      streetAddress: "123 Secure Lane",
      city: "San Francisco",
      state: "CA",
      zipCode: "94105",
      employer: "Tech Financial Corp",
      jobTitle: "Systems Analyst",
      monthlyIncome: 12500,
      cardName: "James Testington",
      cardNumber: "4242424242424242",
      cardExpiry: "12/28",
      cardCvc: "123",
      signature: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
      consent: true
    };
    Object.entries(demoValues).forEach(([key, value]) => {
      setValue(key as keyof LoanFormData, value as any, { shouldValidate: true });
    });
  };

  return {
    form,
    helpers: {
      formatSSN,
      formatPhone,
      formatCardNumber,
      formatExpiry,
      fillDemoData,
      reset: () => {
        sessionStorage.clear();
        reset();
      }
    }
  };
}

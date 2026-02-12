import { z } from 'zod';

export const LoanFormSchema = z.object({
  // Personal Info
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number required").regex(
    /^(\+?1\s?)?(\(?\d{3}\)?[\s.-]?)\d{3}[\s.-]?\d{4}$/, 
    "Expected: (XXX) XXX-XXXX"
  ),
  ssn: z.string().regex(/^\d{3}-\d{2}-\d{4}$/, "Expected: XXX-XX-XXXX"),
  dob: z.string().min(1, "Date of birth required"),
  
  // Address
  streetAddress: z.string().min(5, "Address required"),
  city: z.string().min(2, "City required"),
  state: z.string().length(2, "Use 2-letter state code (e.g., CA)"),
  zipCode: z.string().regex(/^\d{5}(-\d{4})?$/, "Invalid Zip (5 or 9 digits)"),

  // Employment
  employer: z.string().min(2, "Employer name required"),
  jobTitle: z.string().min(2, "Job title required"),
  monthlyIncome: z.coerce.number().min(0, "Income must be 0 or greater"),

  // Credit Card Auth
  cardName: z.string().min(2, "Name on card required"),
  cardNumber: z.string().min(13, "Invalid card number").regex(/^\d+$/, "Digits only"),
  cardExpiry: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, "Format: MM/YY"),
  cardCvc: z.string().min(3, "CVC required").regex(/^\d+$/, "Digits only"),

  // Consent
  signature: z.string().min(1, "Signature is required"),
  consent: z.boolean().refine(val => val === true, "You must consent to proceed"),
});

export type LoanFormData = z.infer<typeof LoanFormSchema>;

export enum WizardStep {
  PERSONAL = 0,
  EMPLOYMENT = 1,
  CREDIT_CARD = 2,
  SIGNATURE = 3,
  REVIEW = 4
}
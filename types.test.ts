import { describe, it, expect } from 'vitest';
import { LoanFormSchema } from './types';

describe('LoanFormSchema (Zod)', () => {
  const validData = {
    firstName: "John",
    lastName: "Doe",
    email: "john@example.com",
    phone: "(555) 123-4567",
    ssn: "123-45-6789",
    dob: "1980-01-01",
    streetAddress: "123 Main St",
    city: "Anytown",
    state: "CA",
    zipCode: "90210",
    employer: "Acme Corp",
    jobTitle: "Manager",
    monthlyIncome: 5000,
    cardName: "John Doe",
    cardNumber: "4111111111111111",
    cardExpiry: "12/25",
    cardCvc: "123",
    signature: "base64sig",
    consent: true
  };

  it('validates perfect data correctly', () => {
    const result = LoanFormSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  describe('Adversarial Validation Scenarios', () => {
    it('blocks invalid SSN formats', () => {
      const badSSN = { ...validData, ssn: '123-45-678' }; // One digit short
      expect(LoanFormSchema.safeParse(badSSN).success).toBe(false);
      
      const letterSSN = { ...validData, ssn: '123-AA-6789' };
      expect(LoanFormSchema.safeParse(letterSSN).success).toBe(false);
    });

    it('blocks invalid phone numbers', () => {
      const badPhone = { ...validData, phone: '555-1234' }; // Too short
      expect(LoanFormSchema.safeParse(badPhone).success).toBe(false);
    });

    it('blocks expired-format credit cards', () => {
      const badExpiry = { ...validData, cardExpiry: '13/25' }; // Invalid month
      expect(LoanFormSchema.safeParse(badExpiry).success).toBe(false);
      
      const malformedExpiry = { ...validData, cardExpiry: '12-25' }; // Wrong separator
      expect(LoanFormSchema.safeParse(malformedExpiry).success).toBe(false);
    });

    it('blocks missing consent', () => {
      const noConsent = { ...validData, consent: false };
      expect(LoanFormSchema.safeParse(noConsent).success).toBe(false);
    });

    it('blocks empty signatures', () => {
      const noSig = { ...validData, signature: '' };
      expect(LoanFormSchema.safeParse(noSig).success).toBe(false);
    });
  });
});

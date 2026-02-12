import { describe, it, expect } from 'vitest';
import { generateFNM } from './fnmGenerator';
import { LoanFormData } from '../types';

describe('FNM Generator', () => {
  const mockData: LoanFormData = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    phone: '(555) 123-4567',
    ssn: '123-45-6789',
    dob: '1980-01-01',
    streetAddress: '123 Main St',
    city: 'Anytown',
    state: 'CA',
    zipCode: '90210',
    employer: 'Acme Corp',
    jobTitle: 'Manager',
    monthlyIncome: 5000,
    cardName: 'John Doe',
    cardNumber: '4111111111111111',
    cardExpiry: '12/25',
    cardCvc: '123',
    signature: 'base64sig',
    consent: true
  };

  it('generates a string with the correct header', () => {
    const fnm = generateFNM(mockData);
    expect(fnm).toContain('000 3.2  SECURE_PORTAL_V1');
  });

  it('includes the borrower name in record 03C', () => {
    const fnm = generateFNM(mockData);
    // 03C record check
    expect(fnm).toContain('03C 123456789John'); 
  });

  it('formats income correctly in 05H', () => {
    const fnm = generateFNM(mockData);
    // 5000.00 -> 500000 padded left with 0 to 15 chars
    expect(fnm).toContain('05H 01000000000500000');
  });

  describe('Stress Testing (Fixed-Width Integrity)', () => {
    it('truncates excessively long strings to preserve record layout', () => {
      const longData: LoanFormData = {
        ...mockData,
        firstName: 'ThisNameIsWayTooLongAndShouldBeTruncatedImmediatelyByTheGenerator',
        lastName: 'AnotherExtremelyLongLastNameThatExceedsTheFixedWidthSpecificationOfFannieMae',
        streetAddress: '1234567890 1234567890 1234567890 1234567890 1234567890 1234567890'
      };

      const fnm = generateFNM(longData);
      const lines = fnm.split('\r\n');

      // Check 03A (Address line) - Street should be exactly 50 chars
      const line03A = lines.find(l => l.startsWith('03A'))!;
      const streetPart = line03A.substring(4, 54);
      expect(streetPart).toHaveLength(50);
      expect(streetPart).not.toContain('1234567890 1234567890 1234567890 1234567890 1234567890 1234567890');

      // Check 03C (Borrower line) - First Name should be exactly 35 chars
      const line03C = lines.find(l => l.startsWith('03C'))!;
      const firstNamePart = line03C.substring(13, 48);
      expect(firstNamePart).toHaveLength(35);
      expect(firstNamePart.trim()).toBe('ThisNameIsWayTooLongAndShouldBeTrun');
    });
  });
});

import { describe, it, expect } from 'vitest';
import { dataUtils } from './dataUtils';

describe('dataUtils', () => {
  describe('strip', () => {
    it('removes all non-numeric characters', () => {
      expect(dataUtils.strip('123-456-7890')).toBe('1234567890');
      expect(dataUtils.strip('(555) 123 4567')).toBe('5551234567');
      expect(dataUtils.strip('ABC-123')).toBe('123');
    });

    it('handles empty or weird strings gracefully', () => {
      expect(dataUtils.strip('')).toBe('');
      expect(dataUtils.strip('!!!@@@###')).toBe('');
      expect(dataUtils.strip('123 🚀 456')).toBe('123456');
    });
  });

  describe('formatCurrency', () => {
    it('formats numbers to USD currency string', () => {
      expect(dataUtils.formatCurrency(1000)).toBe('$1,000.00');
      expect(dataUtils.formatCurrency(1234.56)).toBe('$1,234.56');
      expect(dataUtils.formatCurrency(0)).toBe('$0.00');
    });

    it('handles extreme values', () => {
      expect(dataUtils.formatCurrency(999999999)).toBe('$999,999,999.00');
      expect(dataUtils.formatCurrency(-50)).toBe('-$50.00');
    });

    it('handles garbage string inputs', () => {
      expect(dataUtils.formatCurrency('not-a-number')).toBe('$0.00');
    });
  });

  describe('cleanSSN', () => {
    it('strips non-digits and truncates to 9 characters', () => {
      expect(dataUtils.cleanSSN('123-45-6789')).toBe('123456789');
      expect(dataUtils.cleanSSN('123456789000')).toBe('123456789');
    });

    it('handles short strings with padding-safety (caller handles min length)', () => {
      expect(dataUtils.cleanSSN('123')).toBe('123');
    });
  });

  describe('displayDate', () => {
    it('converts YYYY-MM-DD to MM/DD/YYYY', () => {
      expect(dataUtils.displayDate('2023-12-25')).toBe('12/25/2023');
    });

    it('returns empty string for null/undefined/malformed', () => {
      expect(dataUtils.displayDate('')).toBe('');
      expect(dataUtils.displayDate('invalid-date')).toBe('');
    });
  });
});

/**
 * Data Sanitation & Formatting Utilities
 * Single source of truth for all data cleaning before generation or transmission.
 */

export const dataUtils = {
  /**
   * Removes all non-numeric characters from a string.
   * Useful for SSN and Phone processing.
   */
  strip: (val: string) => val.replace(/\D/g, ''),

  /**
   * Formats a raw number or string as a currency string.
   */
  formatCurrency: (val: string | number) => {
    const num = typeof val === 'string' ? parseFloat(val) : val;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(num || 0);
  },

  /**
   * Formats a YYYY-MM-DD string to MM/DD/YYYY for display.
   */
  displayDate: (dateStr: string) => {
    if (!dateStr || !dateStr.includes('-')) return '';
    const parts = dateStr.split('-');
    if (parts.length !== 3) return '';
    const [year, month, day] = parts;
    return `${month}/${day}/${year}`;
  },

  /**
   * Returns current date in FNM-compliant YYYYMMDD format using local time.
   */
  getFnmDate: () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
  },

  /**
   * Standardizes SSN to 9 numeric digits.
   */
  cleanSSN: (val: string) => val.replace(/\D/g, '').slice(0, 9),

  /**
   * Standardizes Phone to 10 numeric digits.
   */
  cleanPhone: (val: string) => val.replace(/\D/g, '').slice(0, 10),
};

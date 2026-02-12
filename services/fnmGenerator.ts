import { LoanFormData } from '../types';
import { dataUtils } from './dataUtils';

/**
 * Fannie Mae 3.2 (.fnm) Export Utility
 * Ensures fixed-width compliance for LOS import.
 */
export function generateFNM(data: LoanFormData): string {
  const lines: string[] = [];

  const pad = (val: string | number, len: number, char: string = ' ') => 
    String(val || '').replace(/[\r\n]/g, '').padEnd(len, char).slice(0, len);

  const padLeft = (val: string | number, len: number, char: string = '0') =>
    String(val || '').replace(/[\r\n]/g, '').padStart(len, char).slice(0, len);

  const dateStr = dataUtils.getFnmDate();

  // 000 - Header Record
  lines.push(`000 3.2  ${pad('SECURE_PORTAL_V1', 30)}${dateStr}${pad('', 49)}`);

  // 01A - Transmittal Record
  lines.push(`01A 011${dateStr}${pad('', 50)}`);

  // 03A - Current Residence
  lines.push(`03A ${pad(data.streetAddress, 50)}${pad(data.city, 35)}${pad(data.state.toUpperCase(), 2)}${pad(data.zipCode, 10)}C`);

  // 03C - Borrower Primary
  const ssnRaw = dataUtils.cleanSSN(data.ssn);
  const phoneRaw = dataUtils.cleanPhone(data.phone);
  const dobRaw = dataUtils.strip(data.dob);
  
  lines.push(`03C ${pad(ssnRaw, 9)}${pad(data.firstName, 35)}${pad('', 35)}${pad(data.lastName, 35)}${pad('', 4)}${pad(phoneRaw, 10)}${pad(dobRaw, 8)}`);

  // 04A - Current Employment
  lines.push(`04A ${pad(data.employer, 35)}${pad('', 35)}${pad('', 35)}  ${pad('', 10)}N${pad('', 10)}${pad(data.jobTitle, 30)}`);

  // 05H - Base Income
  const incomeStr = parseFloat(data.monthlyIncome.toString()).toFixed(2);
  const paddedIncome = padLeft(incomeStr.replace('.', ''), 15);
  lines.push(`05H 01${paddedIncome}`);

  // 10B - Credit Report Authorization
  lines.push(`10B ${pad(`CREDIT_AUTH_VERIFIED_VIA_PORTAL_BY_${data.lastName.toUpperCase()}`, 80)}`);

  lines.push(`999`);
  return lines.join('\r\n');
}

export function downloadFNM(data: LoanFormData) {
  try {
    const content = generateFNM(data);
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${data.lastName}_${data.firstName}_1003.fnm`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (e) {
    console.error("FNM Export Error", e);
    throw new Error("Export failed");
  }
}

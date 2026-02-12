import { LoanFormData } from '../types';
import { dataUtils } from './dataUtils';
import { siteConfig } from '../config/site';

/**
 * HIGH-FIDELITY PDF GENERATION ENGINE
 * Generates official compliance-grade documents:
 * 1. URLA (1003) Data Summary
 * 2. Borrower's Signature Authorization
 * 3. Credit Card Payment Authorization
 */
export async function generateLoanPDF(data: LoanFormData): Promise<Uint8Array> {
  try {
    // Dynamic import to reduce initial bundle size
    const { PDFDocument, StandardFonts, rgb } = await import('pdf-lib');

    // Helper to convert base64 data URI to Uint8Array directly
    const base64DataUriToUint8Array = (dataUri: string): Uint8Array => {
      try {
        const base64String = dataUri.split(',')[1];
        if (!base64String) return new Uint8Array(0);
        const binaryString = atob(base64String);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes;
      } catch (e) {
        console.error("Failed to decode base64 string", e);
        throw new Error("Signature decoding failed");
      }
    };

    const pdfDoc = await PDFDocument.create();
    const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
    const timesBoldFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
    const fontSize = 10;

    // --- PAGE 1: UNIFORM RESIDENTIAL LOAN APPLICATION (DATA SUMMARY) ---
    const p1 = pdfDoc.addPage([612, 792]);
    let y = 740;

    const drawH1 = (txt: string) => {
      p1.drawText(txt, { x: 50, y, size: 14, font: timesBoldFont });
      y -= 20;
    };

    const drawSection = (txt: string) => {
      p1.drawText(txt, { x: 50, y, size: 11, font: timesBoldFont });
      p1.drawLine({ start: { x: 50, y: y - 2 }, end: { x: 562, y: y - 2 }, thickness: 1, color: rgb(0, 0, 0) });
      y -= 20;
    };

    const drawRow = (label: string, val: string, x: number = 50) => {
      p1.drawText(`${label}:`, { x, y, size: fontSize, font: timesBoldFont });
      p1.drawText(val || 'N/A', { x: x + 100, y, size: fontSize, font: timesRomanFont });
    };

    // Header
    drawH1('UNIFORM RESIDENTIAL LOAN APPLICATION (1003)');
    p1.drawText(`NMLS ID: ${siteConfig.business.nmls}`, { x: 450, y: 740, size: 9, font: timesRomanFont });
    y -= 20;

    drawSection('SECTION 1: BORROWER INFORMATION');
    drawRow('First Name', data.firstName);
    drawRow('Last Name', data.lastName, 300);
    y -= 15;
    drawRow('SSN', `***-**-${data.ssn.slice(-4)}`);
    drawRow('Date of Birth', dataUtils.displayDate(data.dob), 300);
    y -= 15;
    drawRow('Email', data.email);
    drawRow('Phone', data.phone, 300);
    y -= 15;
    drawRow('Address', `${data.streetAddress}, ${data.city}, ${data.state} ${data.zipCode}`);
    y -= 35;

    drawSection('SECTION 2: EMPLOYMENT & INCOME');
    drawRow('Employer', data.employer);
    y -= 15;
    drawRow('Position', data.jobTitle);
    y -= 15;
    drawRow('Gross Monthly', dataUtils.formatCurrency(data.monthlyIncome));
    y -= 40;

    // Page 1 Footer
    p1.drawText('Page 1 of 3 - Data Summary', { x: 260, y: 30, size: 8, font: timesRomanFont });

    // --- PAGE 2: BORROWER'S SIGNATURE AUTHORIZATION ---
    const p2 = pdfDoc.addPage([612, 792]);
    y = 740;

    p2.drawText("BORROWER'S SIGNATURE AUTHORIZATION", { x: 150, y, size: 14, font: timesBoldFont });
    y -= 40;

    const legalText = `
TO WHOM IT MAY CONCERN:

1. I/We have applied for a mortgage loan from ${siteConfig.business.name.toUpperCase()}. As part of the application process, ${siteConfig.business.name.toUpperCase()} and the mortgage lender to whom the loan is submitted may verify information contained in my/our loan application and in other documents required in connection with the loan, either before the loan is closed or as part of its quality control program.

2. I/We authorize you to provide to ${siteConfig.business.name.toUpperCase()} and to any investor to whom ${siteConfig.business.name.toUpperCase()} may sell my mortgage, any and all information and documentation that they request. Such information includes, but is not limited to, employment history and income; bank, money market, and similar account balances; credit history; and copies of income tax returns.

3. ${siteConfig.business.name.toUpperCase()} or any investor that purchases the mortgage may address this authorization to any party named in the loan application.

4. A copy of this authorization may be deemed to be the equivalent of the original.

NOTICE TO BORROWERS: This is notice to you as required by the Right to Financial Privacy Act of 1978 that Fannie Mae/Freddie Mac has a right of access to financial records held by financial institutions in connection with the consideration or administration of assistance to you in the form of a mortgage loan.
    `.trim().split('\n');

    legalText.forEach(line => {
      if (line === '') y -= 10;
      else {
        p2.drawText(line, { x: 50, y, size: 9, font: timesRomanFont, maxWidth: 512, lineHeight: 12 });
        y -= 12 * Math.ceil(line.length / 90);
      }
    });

    y -= 50;
    if (data.signature) {
      const pngImageBytes = base64DataUriToUint8Array(data.signature);
      const signatureImage = await pdfDoc.embedPng(pngImageBytes);
      const sigDims = signatureImage.scale(0.3);
      p2.drawImage(signatureImage, { x: 60, y: y - 40, width: sigDims.width, height: sigDims.height });
    }

    p2.drawLine({ start: { x: 50, y: y - 45 }, end: { x: 300, y: y - 45 }, thickness: 1, color: rgb(0, 0, 0) });
    p2.drawText(`Borrower: ${data.firstName} ${data.lastName}`, { x: 50, y: y - 60, size: 10, font: timesBoldFont });
    p2.drawText(`Date: ${new Date().toLocaleDateString()}`, { x: 350, y: y - 60, size: 10, font: timesRomanFont });

    p2.drawText('Page 2 of 3 - Signature Authorization', { x: 260, y: 30, size: 8, font: timesRomanFont });

    // --- PAGE 3: CREDIT REPORT AUTHORIZATION ---
    const p3 = pdfDoc.addPage([612, 792]);
    y = 740;

    p3.drawText("CREDIT REPORT AUTHORIZATION", { x: 180, y, size: 14, font: timesBoldFont });
    y -= 40;

    const creditText = `
I hereby authorize ${siteConfig.business.name.toUpperCase()} to order a consumer credit report and verify other credit information, including but not limited to past and present mortgage and landlord references. It is understood that a photocopy of this form will also serve as authorization.

I understand that the credit report will be used solely for the purpose of qualifying for a mortgage loan. I also understand that I am responsible for the cost of the credit report, which will be charged to the credit card provided below.

The information to be accessed will be used strictly for determining my creditworthiness for the loan application processed by ${siteConfig.business.name.toUpperCase()}.
    `.trim().split('\n');

    creditText.forEach(line => {
      if (line === '') y -= 10;
      else {
        p3.drawText(line, { x: 50, y, size: 10, font: timesRomanFont, maxWidth: 512, lineHeight: 14 });
        y -= 14 * Math.ceil(line.length / 80);
      }
    });

    y -= 40;
    // Expanded box height and lighter border for cleaner look
    p3.drawRectangle({ x: 50, y: y - 120, width: 512, height: 120, borderColor: rgb(0.85, 0.85, 0.85), borderWidth: 1 });
    
    let boxY = y - 20;
    p3.drawText('CREDIT CARD INFORMATION', { x: 60, y: boxY + 5, size: 9, font: timesBoldFont });
    p3.drawText(`Cardholder Name: ${data.cardName}`, { x: 60, y: boxY - 20, size: 10, font: timesRomanFont });
    p3.drawText(`Card Number: **** **** **** ${data.cardNumber.slice(-4)}`, { x: 60, y: boxY - 45, size: 10, font: timesRomanFont });
    p3.drawText(`Expiration: ${data.cardExpiry}`, { x: 60, y: boxY - 70, size: 10, font: timesRomanFont });
    p3.drawText(`Billing Address: SAME AS RESIDENTIAL`, { x: 60, y: boxY - 95, size: 10, font: timesRomanFont });

    y -= 160;
    if (data.signature) {
      const pngImageBytes = base64DataUriToUint8Array(data.signature);
      const signatureImage = await pdfDoc.embedPng(pngImageBytes);
      const sigDims = signatureImage.scale(0.3);
      p3.drawImage(signatureImage, { x: 60, y: y - 40, width: sigDims.width, height: sigDims.height });
    }

    p3.drawLine({ start: { x: 50, y: y - 45 }, end: { x: 300, y: y - 45 }, thickness: 1, color: rgb(0, 0, 0) });
    p3.drawText(`Authorized Signer: ${data.firstName} ${data.lastName}`, { x: 50, y: y - 60, size: 10, font: timesBoldFont });
    p3.drawText(`Timestamp: ${new Date().toLocaleString()}`, { x: 350, y: y - 60, size: 9, font: timesRomanFont });

    p3.drawText('Page 3 of 3 - Credit Authorization', { x: 260, y: 30, size: 8, font: timesRomanFont });

    // Compliance Footer on all pages
    [p1, p2, p3].forEach(page => {
      page.drawText(`Equal Housing Lender | NMLS #${siteConfig.business.nmls}`, { x: 50, y: 15, size: 7, font: timesRomanFont });
      page.drawText('PROCESSED SECURELY VIA ENCRYPTED TRANSIT PROTOCOL - NO DATA RETENTION', { x: 300, y: 15, size: 7, font: timesBoldFont });
    });

    return await pdfDoc.save();
  } catch (error) {
    console.error("Critical PDF Generation Error:", error);
    throw new Error("PDF_GEN_FAIL");
  }
}
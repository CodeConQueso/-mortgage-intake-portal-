import { LoanFormData } from '../types';
import { terminalLog } from './terminalLogger';
import { generateFNM } from './fnmGenerator';
import { siteConfig } from '../config/site';

/**
 * Robust helper to convert Uint8Array to Base64.
 * Prevents "RangeError: Maximum call stack size exceeded" on large files.
 */
function uint8ArrayToBase64(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * PRODUCTION-READY DELIVERY ENGINE
 * Dispatches the secure package via the local API bridge.
 */
export async function sendLoanEmail(formData: LoanFormData, pdfBytes: Uint8Array): Promise<{ success: boolean; message?: string; code?: string }> {
  const traceId = Math.random().toString(36).substring(7).toUpperCase();
  const targetEmail = siteConfig.business.email;
  
  await terminalLog(`Dispatching Secure Package`, { traceId, pdfSize: `${(pdfBytes.length / 1024).toFixed(2)} KB`, target: targetEmail });

  try {
    const base64Pdf = uint8ArrayToBase64(pdfBytes);
    const fnmContent = generateFNM(formData);

    const htmlBody = `
      <div style="font-family: sans-serif; color: #334155; line-height: 1.6; max-width: 600px;">
        <h2 style="color: #1d4ed8;">New Loan Intake Received</h2>
        <p>You have received a new secure intake package from <strong>${formData.firstName} ${formData.lastName}</strong>.</p>
        
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 20px; border-radius: 12px; margin: 20px 0;">
          <h3 style="margin-top: 0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: #64748b;">Package Contents:</h3>
          <ul style="padding-left: 20px; margin-bottom: 0;">
            <li><strong>Signed PDF:</strong> (3 Pages) Includes Application Summary, Borrower Auth, and Credit Auth.</li>
            <li><strong>Data File (.fnm):</strong> Industry standard file for LOS import.</li>
          </ul>
        </div>

        <h3 style="font-size: 16px; color: #1e293b;">Recommended Action:</h3>
        <ol>
          <li><strong>Review Identifiers:</strong> Open the PDF to verify the applicant's SSN and identity.</li>
          <li><strong>Process Credit:</strong> Use the card details on Page 3 to initialize the credit pull.</li>
          <li><strong>Import Data:</strong> If using a system like Calyx or Zenly, import the .fnm file to avoid manual data entry.</li>
        </ol>

        <p style="font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 20px;">
          TraceID: ${traceId} | Verified via Secure Gateway | ${new Date().toLocaleString()}
        </p>
      </div>
    `;

    const response = await fetch('/api/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: targetEmail,
        lastName: formData.lastName,
        firstName: formData.firstName,
        businessName: siteConfig.business.name,
        subject: `ACTION REQUIRED: New Loan Submission - ${formData.lastName}`,
        html: htmlBody,
        pdf: base64Pdf,
        fnm: fnmContent
      })
    });

    if (!response.ok) {
      const result = await response.json();
      throw new Error(result.message || 'API Bridge Rejected the request');
    }

    await terminalLog(`Email Successfully Relayed`, { traceId, destination: targetEmail });
    return { success: true };

  } catch (err: any) {
    await terminalLog(`Relay Failed`, { traceId, error: err.message }, 'error');
    return { 
      success: false, 
      code: "RELAY_ERROR",
      message: `Transmission Error: ${err.message}. Please ensure your RESEND_API_KEY is configured correctly.` 
    };
  }
}

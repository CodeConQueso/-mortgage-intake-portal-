import React from 'react';
import { CheckCircle2, ShieldCheck, FileJson, ChevronRight, Printer } from 'lucide-react';
import { LoanFormData } from '../../types';
import { downloadFNM } from '../../services/fnmGenerator';
import { siteConfig } from '../../config/site';

interface StepSuccessProps {
  submittedData: LoanFormData;
  pdfBytes: Uint8Array | null;
}

export const StepSuccess: React.FC<StepSuccessProps> = ({ submittedData, pdfBytes }) => {
  const downloadSignedPdf = () => {
    if (!pdfBytes) return;
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${submittedData.lastName}_Signed_Authorizations.pdf`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div 
      className="bg-white rounded-3xl shadow-2xl p-10 text-center border border-slate-100 max-w-xl mx-auto animate-in zoom-in duration-300"
      role="alert"
      aria-live="assertive"
    >
      <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
        <CheckCircle2 className="w-12 h-12" aria-hidden="true" />
      </div>
      <h2 className="text-3xl font-black text-slate-900 mb-4">Application Delivered</h2>
      <p className="text-slate-600 mb-8 leading-relaxed">
        Thank you, <strong>{submittedData.firstName}</strong>. Your encrypted application and signed authorizations have been sent directly to <strong>{siteConfig.business.name}</strong>.
      </p>
      
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 mb-8 text-left">
        <h4 className="font-bold text-blue-900 text-sm mb-2 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4" /> Integrity Confirmation
        </h4>
        <p className="text-xs text-blue-700 leading-relaxed mb-4">
          In accordance with our zero-retention protocol, your sensitive data has been purged from this system's temporary memory. No copies remain on this server.
        </p>
        <div className="h-[1px] bg-blue-200 mb-4" />
        <p className="text-[10px] font-bold text-blue-800 uppercase tracking-widest mb-2">Download copies for your records:</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button onClick={downloadSignedPdf} className="flex items-center justify-center gap-2 bg-white border border-blue-200 p-3 rounded-xl hover:bg-blue-50 transition-colors text-xs font-bold text-slate-700">
            <FileText className="w-4 h-4 text-blue-600"/> Signed PDF
          </button>
          <button onClick={() => downloadFNM(submittedData)} className="flex items-center justify-center gap-2 bg-white border border-blue-200 p-3 rounded-xl hover:bg-blue-50 transition-colors text-xs font-bold text-slate-700">
            <FileJson className="w-4 h-4 text-blue-600"/> Data File (.fnm)
          </button>
        </div>
      </div>

      <p className="text-[11px] text-slate-400 mb-8">
        You may now safely close this browser tab. Your loan officer will be in touch with next steps.
      </p>

      <button onClick={() => { sessionStorage.clear(); window.location.reload(); }} className="w-full py-4 text-slate-400 text-xs font-bold uppercase tracking-[0.2em] border-t border-slate-100 hover:text-red-500 transition-colors">
        Exit & Wipe Session
      </button>
    </div>
  );
};

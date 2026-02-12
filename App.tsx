import React, { useState, ErrorInfo, Component, ReactNode } from 'react';
import Wizard from './components/Wizard';
import { siteConfig } from './config/site';
import { ShieldCheck, Lock, FileText, AlertTriangle, Cpu, Globe, ServerOff, Phone } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class GlobalErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = { hasError: false, error: null };
  public props: ErrorBoundaryProps;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.props = props;
  }

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Critical Application Error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
          <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md text-center border border-red-100">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Internal Error Occurred</h2>
            <p className="text-slate-600 mb-4 font-mono text-xs bg-slate-50 p-3 rounded border border-slate-200">
              {this.state.error?.message || "Unexpected runtime exception."}
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors"
            >
              Restart Portal
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const App: React.FC = () => {
  const [started, setStarted] = useState(false);

  return (
    <GlobalErrorBoundary>
      <div className="min-h-screen flex flex-col selection:bg-blue-100 bg-slate-50/50">
        {/* Subtle Background Pattern */}
        <div className="fixed inset-0 z-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#2563eb 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>

        <header className="bg-white/80 border-b border-slate-200 py-4 px-6 sticky top-0 z-50 backdrop-blur-md">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-blue-700 p-2 rounded-lg shadow-md">
                <FileText className="text-white w-5 h-5" />
              </div>
              <h1 className="text-base font-extrabold tracking-tight text-slate-900 uppercase">{siteConfig.branding.logoText}</h1>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-100">
                <div className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                </div>
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-1.5">
                  Point-to-Point Encryption
                </span>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-grow flex items-center justify-center p-4 sm:p-8 relative z-10">
          {!started ? (
            <div className="max-w-4xl w-full bg-white rounded-3xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] overflow-hidden border border-slate-100 animate-in fade-in slide-in-from-bottom-8 duration-700">
              <div className="flex flex-col md:flex-row h-full">
                {/* Left Side: Content */}
                <div className="flex-[1.5] p-10 sm:p-16">
                  <div className="flex items-center gap-4 mb-12">
                    <div className="relative">
                      <img 
                        src={siteConfig.assets.headshot} 
                        alt="Loan Officer" 
                        className="w-14 h-14 rounded-xl border border-slate-100 shadow-sm bg-slate-100 object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="text-[9px] font-black text-blue-700 uppercase tracking-[0.2em] mb-0.5">Assigned Officer</h4>
                      <p className="text-sm font-bold text-slate-900">{siteConfig.business.name}</p>
                      <p className="text-[10px] text-slate-400 font-medium">NMLS ID: {siteConfig.business.nmls}</p>
                    </div>
                  </div>
                  
                  <h2 className="text-4xl sm:text-5xl font-black text-slate-900 mb-8 tracking-tight leading-tight">{siteConfig.hero.headline}</h2>
                  <p className="text-slate-500 mb-12 text-lg leading-relaxed max-w-lg">
                    {siteConfig.hero.subhead}
                  </p>
                  
                  <div className="flex flex-col sm:flex-row items-center gap-8">
                    <button 
                      onClick={() => setStarted(true)}
                      className="w-full sm:w-auto bg-blue-700 hover:bg-blue-800 text-white font-bold py-5 px-12 rounded-xl transition-all shadow-xl shadow-blue-900/10 active:scale-[0.98] text-base"
                    >
                      {siteConfig.hero.ctaText}
                    </button>
                    
                    <div className="flex gap-8 items-center">
                      <div className="h-10 w-[1px] bg-slate-100 hidden sm:block" />
                      <div className="flex gap-6">
                        <SecurityIndicator icon={<ServerOff className="w-3.5 h-3.5" />} label="Non-Custodial" />
                        <SecurityIndicator icon={<Globe className="w-3.5 h-3.5" />} label="Verified" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Side: Simple Steps */}
                <div className="flex-1 bg-slate-50/50 p-10 sm:p-16 border-l border-slate-100 flex flex-col justify-center">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-10">Application Protocol</h4>
                  <div className="space-y-10">
                    <Step icon="01" title="Borrower Identification" desc="Provide basic contact details and applicant identity." />
                    <Step icon="02" title="Electronic Authorization" desc="Securely sign required disclosures and authorizations." />
                    <Step icon="03" title="Secure Data Relay" desc="Data is encrypted and delivered directly to your officer." />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-2xl w-full">
              <Wizard />
            </div>
          )}
        </main>

        <footer className="py-8 border-t border-slate-200 bg-white">
          <div className="max-w-4xl mx-auto px-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="text-center sm:text-left">
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">
                  © {new Date().getFullYear()} {siteConfig.business.name}. NMLS ID: {siteConfig.business.nmls}
                </p>
                <div className="flex items-center justify-center sm:justify-start gap-4">
                  <span className="text-emerald-500 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3"/> Bank Grade Security
                  </span>
                  <a href="#" className="text-slate-400 text-[10px] font-bold uppercase tracking-widest hover:text-blue-600 transition-colors">Privacy Policy</a>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <img src={siteConfig.assets.equalHousing} alt="Equal Housing Lender" className="h-8 opacity-50 grayscale hover:grayscale-0 transition-all" title="Equal Housing Lender" />
                <div className="h-8 w-[1px] bg-slate-200" />
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5 text-slate-400 mb-0.5">
                    <Cpu className="w-3 h-3" />
                    <span className="text-[8px] font-bold uppercase">SOC2 Environment</span>
                  </div>
                  <p className="text-[8px] text-slate-400 max-w-[200px] leading-tight">
                    This portal is used solely for the collection of loan application data. {siteConfig.business.name} is an Equal Housing Lender.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </footer>

        {/* Floating Help Button */}
        <a 
          href={`tel:${siteConfig.business.phone.replace(/\D/g, '')}`}
          className="fixed bottom-6 right-6 p-4 bg-white text-blue-600 rounded-full shadow-2xl border border-slate-100 hover:scale-110 active:scale-95 transition-all z-50 group sm:hidden"
        >
          <Phone className="w-6 h-6" />
          <span className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-slate-900 text-white text-[10px] font-black uppercase py-1.5 px-3 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Call for Help
          </span>
        </a>
      </div>
    </GlobalErrorBoundary>
  );
};

const Step: React.FC<{icon: string, title: string, desc: string}> = ({icon, title, desc}) => (
  <div className="flex gap-5 group">
    <div className="text-[11px] font-black text-blue-600 bg-blue-50 w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-inner group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
      {icon}
    </div>
    <div>
      <p className="text-xs font-extrabold text-slate-900 uppercase tracking-widest mb-1.5">{title}</p>
      <p className="text-[11px] text-slate-500 leading-relaxed font-medium">{desc}</p>
    </div>
  </div>
);

const SecurityIndicator: React.FC<{icon: React.ReactNode, label: string}> = ({icon, label}) => (
  <div className="flex items-center gap-2 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all" title={label}>
    <div className="text-slate-600 bg-slate-100 p-1.5 rounded-lg">{icon}</div>
    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
  </div>
);

const SecurityFeature: React.FC<{icon: React.ReactNode, title: string, desc: string}> = ({icon, title, desc}) => (
  <div className="flex gap-3">
    <div className="text-blue-600 mt-0.5">{icon}</div>
    <div>
      <p className="text-xs font-bold text-slate-800">{title}</p>
      <p className="text-[10px] text-slate-400">{desc}</p>
    </div>
  </div>
);

export default App;

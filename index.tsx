import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

const startApp = () => {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    console.error("Critical Failure: Root element '#root' not found in DOM.");
    return;
  }

  try {
    const root = createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    console.log("[System] Secure Loan Portal successfully mounted.");
  } catch (error: any) {
    console.error("[System] Mount Error:", error);
    rootElement.innerHTML = `
      <div style="padding:40px; text-align:center; font-family:sans-serif; max-width: 500px; margin: 100px auto; background: white; border-radius: 16px; border: 1px solid #fee2e2; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);">
        <h2 style="color:#991b1b; font-size: 24px; font-weight: bold; margin-bottom: 16px;">Application Load Failed</h2>
        <p style="color:#475569; line-height: 1.5;">${error.message || 'The application module could not be initialized. This is likely due to a network restriction or browser compatibility issue.'}</p>
        <button onclick="window.location.reload()" style="margin-top:24px; padding:12px 24px; background:#2563eb; color:white; border:none; border-radius:8px; font-weight: 600; cursor:pointer;">
          Retry Initialization
        </button>
      </div>
    `;
  }
};

if (document.readyState === 'complete' || document.readyState === 'interactive') {
  startApp();
} else {
  document.addEventListener('DOMContentLoaded', startApp);
}

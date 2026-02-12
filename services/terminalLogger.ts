/**
 * Terminal Logger Utility
 * Bridges browser logs to the development terminal via Vite middleware.
 * Only active in development mode.
 */

export const terminalLog = async (message: string, data?: any, level: 'info' | 'error' = 'info') => {
  // Always log to browser console
  if (level === 'error') {
    console.error(`[TERMINAL_LOG] ${message}`, data);
  } else {
    console.log(`[TERMINAL_LOG] ${message}`, data);
  }

  // Only attempt terminal relay in development
  if (process.env.NODE_ENV === 'development') {
    try {
      await fetch('/api/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ level, message, data }),
      });
    } catch (e) {
      // Fail silently if middleware is not ready
    }
  }
};

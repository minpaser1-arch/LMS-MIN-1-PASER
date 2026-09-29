import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, Copy } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'copas';
  message: string;
}

interface ToastContextType {
  showToast: (message: string, type?: 'success' | 'error' | 'info' | 'copas') => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' | 'copas' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast Notification Container */}
      <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium transition-all transform animate-in fade-in slide-in-from-bottom-2 ${
              toast.type === 'copas'
                ? 'bg-emerald-900 text-emerald-50 border-emerald-700 shadow-emerald-950/20'
                : toast.type === 'success'
                ? 'bg-emerald-800 text-white border-emerald-700'
                : toast.type === 'error'
                ? 'bg-rose-800 text-white border-rose-700'
                : 'bg-slate-800 text-white border-slate-700'
            }`}
          >
            {toast.type === 'copas' && <Copy className="w-5 h-5 text-emerald-300 shrink-0" />}
            {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0" />}
            {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-300 shrink-0" />}
            {toast.type === 'info' && <Info className="w-5 h-5 text-sky-300 shrink-0" />}
            <span className="flex-1">{toast.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

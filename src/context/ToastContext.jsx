import { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';

const ToastCtx = createContext(null);

const META = {
  success: { Icon: CheckCircle2, color: '#10b981', label: 'Success' },
  error:   { Icon: XCircle,      color: '#ef4444', label: 'Error'   },
  warning: { Icon: AlertTriangle,color: '#f59e0b', label: 'Warning' },
  info:    { Icon: Info,         color: '#0f766e', label: 'Info'    },
};

export function ToastProvider({ children }) {
  const [list, setList] = useState([]);

  const dismiss = useCallback(id => setList(p => p.filter(t => t.id !== id)), []);

  const toast = useCallback((message, type = 'success', duration = 3200) => {
    const id = Date.now() + Math.random();
    setList(p => [...p, { id, message, type }]);
    setTimeout(() => dismiss(id), duration);
  }, [dismiss]);

  return (
    <ToastCtx.Provider value={toast}>
      {children}
      <div className="toast-container" aria-live="polite">
        {list.map(t => {
          const { Icon, color, label } = META[t.type] || META.info;
          return (
            <div key={t.id} className={`toast toast-${t.type}`} role="alert">
              <span className="toast-icon" style={{ color }}>
                <Icon size={19} strokeWidth={2.5} />
              </span>
              <div className="toast-body">
                <div className="toast-title">{label}</div>
                <div className="toast-msg">{t.message}</div>
              </div>
              <button className="toast-close" onClick={() => dismiss(t.id)} aria-label="Dismiss">
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastCtx.Provider>
  );
}

export const useToast = () => useContext(ToastCtx);

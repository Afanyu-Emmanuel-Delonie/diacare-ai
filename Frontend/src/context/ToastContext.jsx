import { createContext, useCallback, useContext, useMemo } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const showToast = useCallback(({ type = 'info', message }) => {
    const notify = toast[type] || toast.info;
    notify(message, {
      position: 'top-right',
      autoClose: 4000,
      hideProgressBar: true
    });
  }, []);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer newestOnTop closeOnClick pauseOnFocusLoss draggable={false} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error('useToast must be used inside ToastProvider');
  }

  return context;
}

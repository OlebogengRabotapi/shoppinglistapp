import { useEffect } from 'react';
import { TOAST_DURATION_MS } from '../../constants';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { dismissToast } from '../../store/slices/toastSlice';
import type { Toast } from '../../types';

const ToastItem = ({ toast }: { toast: Toast }) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const timer = window.setTimeout(() => dispatch(dismissToast(toast.id)), TOAST_DURATION_MS);
    return () => window.clearTimeout(timer);
  }, [dispatch, toast.id]);

  return (
    <div className={`toast toast--${toast.kind}`} role={toast.kind === 'error' ? 'alert' : 'status'}>
      <span>{toast.message}</span>
      <button
        type="button"
        className="toast__close"
        onClick={() => dispatch(dismissToast(toast.id))}
        aria-label="Dismiss notification"
      >
        ×
      </button>
    </div>
  );
};

const ToastContainer = () => {
  const toasts = useAppSelector((state) => state.toasts);
  return (
    <div className="toast-stack" aria-live="polite">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  );
};

export default ToastContainer;

import React, { useEffect } from "react";

const TOAST_TTL_MS = 60 * 1000;

const ToastItem = ({ toast, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => onClose(toast.id), TOAST_TTL_MS);
    return () => clearTimeout(timer);
  }, [toast.id, onClose]);

  return (
    <div
      className={`toast toast--${toast.type || "info"}`}
      role="status"
      aria-live="polite"
    >
      <div className="toast__body">
        <div className="toast__message">{toast.message}</div>
        {toast.debug ? <div className="toast__debug">{toast.debug}</div> : null}
      </div>
      <button
        type="button"
        className="toast__close"
        onClick={() => onClose(toast.id)}
        aria-label="Close"
      >
        ×
      </button>
    </div>
  );
};

const ToastStack = ({ toasts, onClose }) => {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="toastStack" aria-live="polite">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onClose={onClose} />
      ))}
    </div>
  );
};

export default ToastStack;

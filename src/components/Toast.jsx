import React from 'react';
import ReactDOM from 'react-dom';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import './Toast.css';

export default function Toast() {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="toast-item__icon toast-item__icon--success" size={20} />;
      case 'error':
        return <XCircle className="toast-item__icon toast-item__icon--error" size={20} />;
      case 'warning':
        return <AlertTriangle className="toast-item__icon toast-item__icon--warning" size={20} />;
      default:
        return <Info className="toast-item__icon toast-item__icon--info" size={20} />;
    }
  };

  // Render outside app layout using a Portal
  return ReactDOM.createPortal(
    <div className="toast-container">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast-item toast-item--${toast.type}`}>
          <div className="toast-item__content">
            {getIcon(toast.type)}
            <p className="toast-item__message">{toast.message}</p>
            <button className="toast-item__close" onClick={() => removeToast(toast.id)}>
              <X size={16} />
            </button>
          </div>
          <div
            className="toast-item__progress"
            style={{ animationDuration: `${toast.duration}ms` }}
          />
        </div>
      ))}
    </div>,
    document.body
  );
}

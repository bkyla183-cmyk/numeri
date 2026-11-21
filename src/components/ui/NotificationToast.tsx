import React from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

export interface NotificationToastProps {
  visible: boolean;
  title: string;
  description?: string;
  variant?: 'success' | 'error';
  onDismiss: () => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({
  visible,
  title,
  description,
  variant = 'success',
  onDismiss,
}) => {
  if (!visible) return null;

  const isSuccess = variant === 'success';

  return (
    <div
      data-notification-toast
      role={isSuccess ? 'status' : 'alert'}
      aria-live={isSuccess ? 'polite' : 'assertive'}
      aria-atomic="true"
      className="fixed top-20 left-4 right-4 sm:left-auto sm:right-6 z-50 sm:w-96 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg p-3.5 flex items-start gap-3 transition-opacity duration-200 motion-reduce:transition-none"
    >
      <div
        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
          isSuccess
            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
            : 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
        }`}
      >
        {isSuccess ? (
          <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
        ) : (
          <AlertCircle className="w-4 h-4" aria-hidden="true" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 leading-snug">
          {title}
        </p>
        {description && (
          <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400 truncate mt-0.5">
            {description}
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss notification"
        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
      >
        <X className="w-3.5 h-3.5" aria-hidden="true" />
      </button>
    </div>
  );
};

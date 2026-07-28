// components/Alert.tsx
// components/Alert.tsx
'use client';

import { useEffect } from 'react';
import { createPortal } from 'react-dom';

type AlertVariant = 'success' | 'error' | 'warning' | 'progress';

interface AlertAction {
  label: string;
  onClick: () => void;
}

interface AlertProps {
  isOpen: boolean;
  variant: AlertVariant;
  title: string;
  message?: string;
  primaryAction?: AlertAction;
  onDismiss?: () => void;
  autoDismiss?: boolean;
  duration?: number;
}

const CONFIG: Record<AlertVariant, {
  icon: string;
  iconBg: string;
  iconColor: string;
  spin?: boolean;
}> = {
  success: {
    icon:      'ti-circle-check',
    iconBg:    'bg-green-50',
    iconColor: 'text-green-700',
  },
  error: {
    icon:      'ti-alert-circle',
    iconBg:    'bg-red-50',
    iconColor: 'text-red-700',
  },
  warning: {
    icon:      'ti-alert-triangle',
    iconBg:    'bg-amber-50',
    iconColor: 'text-amber-700',
  },
  progress: {
    icon:      'ti-loader-2',
    iconBg:    'bg-blue-50',
    iconColor: 'text-blue-700',
    spin:       true,
  },
};

function AlertModal({
  variant,
  title,
  message,
  primaryAction,
  onDismiss,
}: Omit<AlertProps, 'isOpen' | 'autoDismiss' | 'duration'>) {
  const config  = CONFIG[variant];
  const isDismissible = variant !== 'progress';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="alert-title"
      aria-describedby={message ? 'alert-message' : undefined}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4"
      onClick={e => {
        // Dismiss on backdrop click
        if (e.target === e.currentTarget) onDismiss?.();
      }}
    >
      <div className="flex w-full max-w-[320px] font-serif flex-col items-center
        gap-4 rounded-xl bg-white px-7 py-8 text-center">

        {/* Icon */}
        <div className={`flex h-12 w-12 items-center justify-center
          rounded-full ${config.iconBg}`}>
          <i
            className={`ti ${config.icon} text-[22px] ${config.iconColor}
              ${config.spin ? 'animate-spin' : ''}`}
            aria-hidden="true"
          />
        </div>

        {/* Text */}
        <div className="space-y-1">
          <p id="alert-title" className="text-[15px] font-medium text-gray-900">
            {title}
          </p>
          {message && (
            <p id="alert-message" className="text-xs leading-relaxed text-gray-400">
              {message}
            </p>
          )}
        </div>

        {/* Actions — hidden for progress */}
        {isDismissible && (
          <div className="mt-1 flex w-full gap-2">
            <button
              onClick={onDismiss}
              className="flex-1 rounded-lg border border-gray-200 bg-transparent
                py-2 text-sm text-gray-500 transition-colors hover:bg-gray-50"
            >
              Dismiss
            </button>
            {primaryAction && (
              <button
                onClick={primaryAction.onClick}
                className="flex-1 rounded-lg border-none bg-[#2C2417] py-2
                  text-sm font-medium text-[#F5EDD8] transition-colors
                  hover:bg-[#3D3020]"
              >
                {primaryAction.label}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export function Alert({
  isOpen,
  autoDismiss = false,
  duration = 4000,
  onDismiss,
  ...rest
}: AlertProps) {
  // Lock scroll while open
  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // Auto-dismiss timer
  useEffect(() => {
    if (!isOpen || !autoDismiss) return;
    const timer = setTimeout(() => onDismiss?.(), duration);
    return () => clearTimeout(timer);
  }, [isOpen, autoDismiss, duration]);

  if (!isOpen) return null;

  return createPortal(
    <AlertModal {...rest} onDismiss={onDismiss} />,
    document.body
  );
}
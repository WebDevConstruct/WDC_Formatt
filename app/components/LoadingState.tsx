'use client';

import { useEffect } from 'react';
import { createPortal } from 'react-dom';

interface LoaderProps {
  title?: string;
  message?: string;
  isOpen: boolean;
}

function LoaderModal({ title = 'Loading', message }: Omit<LoaderProps, 'isOpen'>) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45"
    >
      <div className="flex w-[300px] flex-col items-center gap-4 rounded-xl bg-white px-8 py-10 text-center">

        {/* Icon */}
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#F5EDD8]">
          <i
            className="ti ti-loader-2 animate-spin text-2xl text-[#2C2417]"
            aria-hidden="true"
          />
        </div>

        {/* Text */}
        <div className="space-y-1">
          <p className="text-[15px] font-medium text-gray-800">{title}</p>
          {message && (
            <p className="text-xs leading-relaxed text-gray-400">{message}</p>
          )}
        </div>

        {/* Indeterminate progress bar */}
        <div className="h-1 w-44 overflow-hidden rounded-full bg-gray-100">
          <div className="h-full animate-[loaderbar_1.8s_ease-in-out_infinite] rounded-full bg-[#2C2417]" />
        </div>
      </div>
    </div>
  );
}

export function Loader({ isOpen, title, message }: LoaderProps) {
  // Lock background scroll while modal is open
  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <LoaderModal title={title} message={message} />,
    document.body
  );
}
'use client';



import { createPortal } from 'react-dom';
import { useEffect, useState } from 'react';


type PdfGeneratingLoaderProps = {
  mainText : string;
  description : string;
  component : React.ReactNode
}
export default function PdfGeneratingLoader({mainText, description, component}: PdfGeneratingLoaderProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const callback = ()=> {
    setMounted(true);

    }
    callback();
    // lock background scroll while modal is open
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div className="formatt-overlay">
      <div className="formatt-modal" role="dialog" aria-modal="true" aria-label="Generating PDF">
        <div className="formatt-modal__icon-wrap">
          {component}
        </div>

        <p className="formatt-modal__title">{mainText}</p>
        <p className="formatt-modal__subtitle">{description}</p>

        <div className="formatt-modal__track">
          <div className="formatt-modal__bar" />
        </div>
      </div>

      <style jsx>{`
        .formatt-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.45);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .formatt-modal {
          background: #ffffff;
          border-radius: 12px;
          padding: 2.5rem 2rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          width: 320px;
        }

        .formatt-modal__icon-wrap {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: #e6f1fb;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.25rem;
        }

        .formatt-modal__icon {
          width: 26px;
          height: 26px;
          color: #185fa5;
          animation: formatt-pulse 1.6s ease-in-out infinite;
        }

        .formatt-modal__title {
          font-size: 16px;
          font-weight: 500;
          margin: 0 0 6px;
          color: #111;
        }

        .formatt-modal__subtitle {
          font-size: 13px;
          color: #6b6b6b;
          margin: 0 0 18px;
        }

        .formatt-modal__track {
          width: 200px;
          height: 6px;
          background: #f1efe8;
          border-radius: 99px;
          margin: 0 auto;
          overflow: hidden;
        }

        .formatt-modal__bar {
          height: 100%;
          width: 10%;
          background: #185fa5;
          border-radius: 99px;
          animation: formatt-loadbar 1.8s ease-in-out infinite;
        }

        @keyframes formatt-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }

        @keyframes formatt-loadbar {
          0% { width: 10%; margin-left: 0%; }
          50% { width: 60%; margin-left: 30%; }
          100% { width: 10%; margin-left: 90%; }
        }
      `}</style>
    </div>,
    document.body
  );
}



export const SpatulaIcon = ({ className }: { className?: string })=>  {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M14 3 5 12c-1.2 1.2-1.2 3.4 0 4.6 1.2 1.2 3.4 1.2 4.6 0l9-9" />
      <path d="M19 3 21 5" />
      <path d="M17 1 23 7" />
      <path d="M3 21l4-4" />
    </svg>
  );
}
export const FileIcon = ({ className }: { className?: string })=> {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <line x1="10" y1="9" x2="8" y2="9" />
    </svg>
  );
}
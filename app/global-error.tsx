"use client";
import Link from "next/link";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error securely to your analytics or console log stream
    console.error("Global Application Error Captured:", error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div className="flex flex-col items-center justify-center min-h-screen bg-white text-black px-6 selection:bg-black selection:text-white">
          <div className="max-w-md w-full text-center space-y-8">
            {/* Minimal Error Icon / Graphic */}
            <div className="flex justify-center">
              <div className="w-16 h-16 border-4 border-black flex items-center justify-center font-black text-2xl select-none animate-pulse">
                !
              </div>
            </div>

            {/* Message Content */}
            <div className="space-y-3">
              <h1 className="text-3xl font-black tracking-tighter uppercase">
                Application Error
              </h1>
              <p className="text-sm text-zinc-500 max-w-xs mx-auto leading-relaxed">
                Something went wrong on our end. A critical exception has interrupted the system sequence.
              </p>
            </div>

            {/* Optional: Error Digest Code for debugging tracking */}
            {error.digest && (
              <div className="bg-zinc-100 text-[10px] font-mono py-1.5 px-3 rounded text-zinc-600 inline-block tracking-tight">
                Error Digest ID: {error.digest}
              </div>
            )}

            {/* Interactive Recovery Call to Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={() => reset()}
                className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-2.5 text-sm font-medium transition-colors border border-black bg-black text-white hover:bg-white hover:text-black focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
              >
                Try Again
              </button>
              
              <Link
                href="/"
                className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-2.5 text-sm font-medium transition-colors border border-zinc-300 bg-white text-black hover:border-black focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
              >
                Go Home
              </Link>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
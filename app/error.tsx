'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the actual error to an error reporting service or Vercel logs
    console.error("Caught in Global Error Boundary:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <div className="bg-red-50 text-red-900 p-8 rounded-2xl max-w-lg w-full shadow-sm border border-red-100">
        <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
        <p className="mb-6 text-red-800 opacity-90">
          We encountered an unexpected error while loading this page. Our team has been notified.
        </p>
        
        {process.env.NODE_ENV === 'development' && (
          <div className="text-left bg-black/5 p-4 rounded-xl text-sm font-mono overflow-auto mb-6 text-red-950">
            <p className="font-bold mb-2">Error Details (Dev Only):</p>
            {error.message}
            {error.digest && <p className="mt-2 text-xs opacity-70">Digest: {error.digest}</p>}
          </div>
        )}

        <div className="flex gap-4 justify-center">
          <button
            className="px-6 py-2.5 bg-red-900 text-white font-medium rounded-xl hover:bg-red-950 transition-colors"
            onClick={() => reset()}
          >
            Try again
          </button>
          <button
            className="px-6 py-2.5 bg-white text-red-900 border border-red-200 font-medium rounded-xl hover:bg-red-50 transition-colors"
            onClick={() => window.location.href = '/'}
          >
            Go Home
          </button>
        </div>
      </div>
    </div>
  );
}

'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center bg-white">
          <div className="bg-red-50 text-red-900 p-8 rounded-2xl max-w-lg w-full shadow-sm border border-red-100">
            <h2 className="text-2xl font-bold mb-4">Critical Application Error</h2>
            <p className="mb-6 text-red-800 opacity-90">
              We encountered a severe error while initializing the application. Our team has been notified.
            </p>
            
            {process.env.NODE_ENV === 'development' && (
              <div className="text-left bg-black/5 p-4 rounded-xl text-sm font-mono overflow-auto mb-6 text-red-950">
                <p className="font-bold mb-2">Error Details (Dev Only):</p>
                {error.message}
                {error.digest && <p className="mt-2 text-xs opacity-70">Digest: {error.digest}</p>}
              </div>
            )}

            <button
              className="px-6 py-2.5 bg-red-900 text-white font-medium rounded-xl hover:bg-red-950 transition-colors"
              onClick={() => reset()}
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}

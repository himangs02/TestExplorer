'use client';

import { useState, useEffect, useRef } from 'react';
import { User } from 'lucide-react';

export default function PrincipalAvatar({
  src,
  schoolName
}: {
  src?: string | null;
  schoolName: string;
}) {
  const [imgStatus, setImgStatus] = useState<'loading' | 'loaded' | 'error'>(
    src ? 'loading' : 'error'
  );
  const imgRef = useRef<HTMLImageElement>(null);

  // If src changes, reset status
  useEffect(() => {
    if (src) {
      setImgStatus('loading');
    } else {
      setImgStatus('error');
    }
  }, [src]);

  // Timeout fallback: if image hasn't loaded in 8s, show fallback
  useEffect(() => {
    if (imgStatus !== 'loading') return;
    const timeout = setTimeout(() => {
      setImgStatus(prev => (prev === 'loading' ? 'error' : prev));
    }, 8000);
    return () => clearTimeout(timeout);
  }, [imgStatus]);

  // Verify image actually decoded on mount (handles cached 403 responses)
  useEffect(() => {
    if (!src || imgStatus !== 'loading') return;
    const img = imgRef.current;
    if (img && img.complete) {
      // Image loaded from cache before React had a chance to attach events
      if (img.naturalWidth === 0 || img.naturalHeight === 0) {
        setImgStatus('error');
      } else {
        setImgStatus('loaded');
      }
    }
  }, [src, imgStatus]);

  return (
    <div className="w-full max-w-[260px] relative rounded-2xl overflow-hidden shadow-xl border-4 border-white bg-slate-100 shrink-0 flex items-center justify-center">
      {imgStatus !== 'error' && src ? (
        <img
          ref={imgRef}
          src={src}
          alt="Principal"
          className={`w-full h-auto max-h-[350px] object-contain block rounded-xl transition-opacity duration-300 ${
            imgStatus === 'loaded' ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={(e) => {
            const target = e.target as HTMLImageElement;
            if (target.naturalWidth === 0 || target.naturalHeight === 0) {
              setImgStatus('error');
            } else {
              setImgStatus('loaded');
            }
          }}
          onError={() => setImgStatus('error')}
          referrerPolicy="no-referrer"
        />
      ) : (
        <div className="w-full aspect-square flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-slate-100 text-slate-500 p-4">
          <div className="w-16 h-16 rounded-full bg-white shadow-md flex items-center justify-center text-blue-600 mb-2 border border-blue-100">
            <User className="w-8 h-8" />
          </div>
          <span className="text-xs font-bold text-slate-700 tracking-wider">Principal&apos;s Desk</span>
          <span className="text-[10px] text-slate-400 font-medium truncate max-w-[140px] text-center mt-0.5">
            {schoolName}
          </span>
        </div>
      )}
    </div>
  );
}


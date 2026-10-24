"use client";

import { useState } from "react";

interface BlogImageProps {
  src?: string | null;
  alt: string;
  className?: string;
}

export default function BlogImage({ src, alt, className = "" }: BlogImageProps) {
  const [imgSrc, setImgSrc] = useState<string>(src || "/placeholder.jpg");
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return (
      <div className="w-full h-full bg-linear-to-br from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center p-4">
        <div className="text-center text-white">
          <svg
            className="w-10 h-10 mx-auto mb-1 text-white/80"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
          </svg>
          <span className="text-[11px] font-bold text-white/90 line-clamp-1">TestExplorer Notes</span>
        </div>
      </div>
    );
  }

  return (
    <img
      src={imgSrc}
      alt={alt}
      loading="lazy"
      onError={() => {
        setHasError(true);
      }}
      className={className}
    />
  );
}

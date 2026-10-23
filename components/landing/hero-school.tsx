"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

// Helper to convert Google Drive links to direct image links
function formatImageUrl(url?: string | null): string {
  if (!url || typeof url !== 'string' || !url.trim()) {
    return "/images/placeholder-school.jpg";
  }
  const trimmed = url.trim();
  try {
    if (trimmed.includes('drive.google.com')) {
      const urlObj = new URL(trimmed);
      const pathMatch = urlObj.pathname.match(/\/(?:file\/)?d\/([a-zA-Z0-9_-]+)/);
      const idParam = urlObj.searchParams.get('id');
      const fileId = pathMatch ? pathMatch[1] : idParam;
      if (fileId) {
        return `https://lh3.googleusercontent.com/d/${fileId}`;
      }
    }
  } catch {}
  return trimmed;
}

export default function HeroSchool({ school }: { school: any }) {
  const initialUrl = formatImageUrl(school?.hero_image_url);
  const [imgSrc, setImgSrc] = useState(initialUrl);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const formatted = formatImageUrl(school?.hero_image_url);
    setImgSrc(formatted);
    setHasError(false);
  }, [school?.hero_image_url]);

  const handleImageError = () => {
    if (!hasError) {
      setHasError(true);
      setImgSrc("/images/placeholder-school.jpg");
    }
  };

  return (
    <section className="relative min-h-[500px] md:min-h-[700px] lg:min-h-[900px] w-full overflow-hidden py-0 bg-slate-900">
      {/* 1. Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src={imgSrc}
          alt={`${school?.name || 'School'} Campus`}
          fill
          sizes="100vw"
          className="object-cover transition-opacity duration-500"
          priority
          onError={handleImageError}
          unoptimized={true}
        />
        <div className="absolute inset-0 bg-black/15 bg-blend-overlay" />
      </div>

      {/* 2. Content Container */}
    </section>
  );
}

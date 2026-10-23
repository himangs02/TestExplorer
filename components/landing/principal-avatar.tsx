'use client';

import { useState } from 'react';
import { User } from 'lucide-react';

export default function PrincipalAvatar({
  src,
  schoolName
}: {
  src?: string | null;
  schoolName: string;
}) {
  const [hasError, setHasError] = useState(false);

  return (
    <div className="w-full max-w-[260px] relative rounded-2xl overflow-hidden shadow-xl border-4 border-white bg-slate-100 shrink-0 flex items-center justify-center">
      {!hasError && src ? (
        <img
          src={src}
          alt="Principal"
          className="w-full h-auto max-h-[350px] object-contain block rounded-xl"
          onError={() => setHasError(true)}
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

'use client';

import React, { useState } from 'react';
import { PredictionResponse } from '@/lib/predictor/types';
import { X, Share2, Copy, Check, MessageCircle, Twitter, Award } from 'lucide-react';
import { toast } from 'sonner';

interface PredictionShareModalProps {
  prediction: PredictionResponse;
  onClose: () => void;
}

export const PredictionShareModal: React.FC<PredictionShareModalProps> = ({
  prediction,
  onClose
}) => {
  const [copied, setCopied] = useState(false);
  const bestCollege = prediction.colleges[0]?.instituteName || 'Top Tier Institute';

  const shareText = `🎯 My ${prediction.exam.name} Prediction on Test Explorer:\n` +
    `• Estimated AIR: ~${prediction.rankPrediction.estimatedRank.toLocaleString('en-IN')}\n` +
    (prediction.rankPrediction.estimatedPercentile ? `• Percentile: ${prediction.rankPrediction.estimatedPercentile}%\n` : '') +
    `• Top Eligible College: ${bestCollege}\n` +
    `• Total Colleges Unlocked: ${prediction.totalColleges}\n` +
    `Check your rank & college chances at: ${typeof window !== 'undefined' ? window.location.href : 'https://testexplorer.in/predictor'}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    toast.success('Share text copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsApp = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };

  const handleTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl border-2 border-gray-200 shadow-2xl max-w-md w-full p-6 md:p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6">
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
            Share Your Results
          </span>
          <h3 className="text-xl font-black text-gray-900 tracking-tight">
            Share Your College Prediction
          </h3>
        </div>

        {/* Visual Share Card */}
        <div className="p-6 rounded-3xl bg-linear-to-br from-slate-900 via-indigo-950 to-blue-950 text-white shadow-xl relative overflow-hidden mb-6 border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 bg-blue-600 rounded-md flex items-center justify-center font-bold text-xs">
                TE
              </div>
              <span className="text-xs font-black tracking-tight">Test Explorer</span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 bg-white/10 rounded-full">
              {prediction.exam.name} 2027
            </span>
          </div>

          <span className="text-[11px] font-semibold text-blue-300 uppercase tracking-wider block">
            Estimated AIR
          </span>
          <div className="text-3xl font-black text-white tracking-tight my-1">
            ≈ {prediction.rankPrediction.estimatedRank.toLocaleString('en-IN')}
          </div>

          <div className="mt-4 pt-3 border-t border-white/10 text-xs space-y-1">
            <div className="flex justify-between text-blue-200">
              <span>Top Eligible Match:</span>
              <strong className="text-white text-right line-clamp-1 max-w-[180px]">{bestCollege}</strong>
            </div>
            <div className="flex justify-between text-blue-200">
              <span>Eligible Institutions:</span>
              <strong className="text-emerald-400 font-black">{prediction.totalColleges} Colleges</strong>
            </div>
          </div>
        </div>

        {/* Share Buttons */}
        <div className="space-y-2.5">
          <button
            onClick={handleWhatsApp}
            className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-sm transition-all"
          >
            <MessageCircle className="w-4 h-4" />
            Share on WhatsApp
          </button>

          <button
            onClick={handleTwitter}
            className="w-full h-12 bg-slate-900 hover:bg-black text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-sm transition-all"
          >
            <Twitter className="w-4 h-4" />
            Share on X / Twitter
          </button>

          <button
            onClick={handleCopy}
            className="w-full h-12 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-sm rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied to Clipboard!' : 'Copy Summary Link'}
          </button>
        </div>
      </div>
    </div>
  );
};

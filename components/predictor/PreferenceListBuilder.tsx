'use client';

import React, { useState } from 'react';
import { CollegePredictionItem } from '@/lib/predictor/types';
import { ListOrdered, ArrowUp, ArrowDown, Trash2, Download, Copy, Check, Shield, Target, Flame } from 'lucide-react';
import { toast } from 'sonner';

interface PreferenceListBuilderProps {
  initialColleges: CollegePredictionItem[];
  onClose: () => void;
}

export const PreferenceListBuilder: React.FC<PreferenceListBuilderProps> = ({
  initialColleges,
  onClose
}) => {
  const [list, setList] = useState<CollegePredictionItem[]>(initialColleges.slice(0, 15));
  const [copied, setCopied] = useState(false);

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= list.length) return;

    const updated = [...list];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setList(updated);
  };

  const removeItem = (id: string) => {
    setList(list.filter((item) => item.id !== id));
  };

  const handleCopy = () => {
    const text = list
      .map(
        (col, idx) =>
          `${idx + 1}. ${col.instituteName} - ${col.branch} (${col.course}) | Chance: ${col.chance} | Quota: ${col.quota}`
      )
      .join('\n');

    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Preference list copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const text = `TEST EXPLORER - COLLEGE PREFERENCE LIST\nGenerated on: ${new Date().toLocaleDateString()}\n\n` +
      list
        .map(
          (col, idx) =>
            `${idx + 1}. [${col.tier.toUpperCase()}] ${col.instituteName}\n   Branch: ${col.branch}\n   Previous Closing Rank: ~${col.previousClosingRank}\n   Admission Chance: ${col.chance} (${col.chancePercentage}%)\n   Counselling: ${col.counselling}\n`
        )
        .join('\n');

    const element = document.createElement('a');
    const file = new Blob([text], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `TestExplorer_Preference_List_${Date.now()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success('Preference list downloaded!');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl border-2 border-gray-200 shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 md:p-8 relative">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
                <ListOrdered className="w-4 h-4" />
              </span>
              <span className="text-xs font-bold text-purple-600 uppercase tracking-wider">
                Counselling Strategy
              </span>
            </div>
            <h3 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight">
              Build Your JoSAA / MCC Preference List
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Organized into Dream, Target, and Safe tiers. Reorder choices to fit your priorities.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy List'}
            </button>
            <button
              onClick={handleDownload}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Export
            </button>
          </div>
        </div>

        {/* List items */}
        <div className="py-6 space-y-3">
          {list.map((item, index) => {
            const isDream = item.tier === 'Dream';
            const isTarget = item.tier === 'Target';
            const isSafe = item.tier === 'Safe';

            return (
              <div
                key={item.id}
                className="p-4 rounded-2xl border-2 border-gray-200 hover:border-gray-300 bg-gray-50/70 flex items-center justify-between gap-3 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-gray-900 text-white font-black text-sm flex items-center justify-center shrink-0">
                    {index + 1}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-black uppercase flex items-center gap-1 ${
                          isDream
                            ? 'bg-purple-100 text-purple-800'
                            : isTarget
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {isDream ? <Flame className="w-2.5 h-2.5" /> : isTarget ? <Target className="w-2.5 h-2.5" /> : <Shield className="w-2.5 h-2.5" />}
                        {item.tier} Choice
                      </span>
                      <span className="text-xs text-gray-500 font-semibold">
                        Closing: ~{item.previousClosingRank.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <h5 className="text-sm font-black text-gray-900 leading-snug">
                      {item.instituteName}
                    </h5>
                    <p className="text-xs font-semibold text-blue-600">
                      {item.branch} ({item.course})
                    </p>
                  </div>
                </div>

                {/* Controls: Up, Down, Remove */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    disabled={index === 0}
                    onClick={() => moveItem(index, 'up')}
                    className="w-8 h-8 rounded-lg bg-white border border-gray-200 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-gray-700 cursor-pointer"
                    title="Move choice up"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    disabled={index === list.length - 1}
                    onClick={() => moveItem(index, 'down')}
                    className="w-8 h-8 rounded-lg bg-white border border-gray-200 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-gray-700 cursor-pointer"
                    title="Move choice down"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="w-8 h-8 rounded-lg bg-white border border-gray-200 hover:bg-rose-50 hover:text-rose-600 flex items-center justify-center text-gray-400 cursor-pointer"
                    title="Remove from preference list"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
          <span className="text-xs text-gray-400">
            *This list is for planning. Final choices must be filled in the official counselling portal.
          </span>
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-gray-900 hover:bg-gray-800 text-white text-xs font-bold rounded-xl cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

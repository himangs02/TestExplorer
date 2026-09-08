'use client';

import React, { useState } from 'react';
import { Upload, CheckCircle2, AlertTriangle, FileSpreadsheet, X } from 'lucide-react';
import { toast } from 'sonner';

export const CsvImporter: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [csvContent, setCsvContent] = useState<string>('');
  const [sourceName, setSourceName] = useState<string>('Official JoSAA / MCC Round 6');
  const [year, setYear] = useState<number>(2025);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewRows, setPreviewRows] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [resultMessage, setResultMessage] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setCsvContent(text);
      parsePreview(text);
    };
    reader.readAsText(file);
  };

  const parsePreview = (text: string) => {
    const lines = text.trim().split('\n').filter(Boolean);
    if (lines.length > 0) {
      const hdrs = lines[0].split(',').map((h) => h.trim());
      setHeaders(hdrs);

      const rows = lines.slice(1, 6).map((line) => {
        const cols = line.split(',').map((c) => c.trim());
        const rowObj: any = {};
        hdrs.forEach((h, i) => {
          rowObj[h] = cols[i] || '';
        });
        return rowObj;
      });
      setPreviewRows(rows);
    }
  };

  const handleImport = async () => {
    if (!csvContent) {
      toast.error('Please upload or paste CSV data first.');
      return;
    }

    setIsProcessing(true);
    setResultMessage(null);

    try {
      const res = await fetch('/api/predictor/admin/import-cutoffs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          csvData: csvContent,
          sourceName,
          year
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to import CSV');
      }

      setResultMessage(data.message);
      toast.success(data.message);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl border-2 border-gray-200 shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 md:p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <FileSpreadsheet className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
              Data Management
            </span>
          </div>
          <h3 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight">
            Import Historical Cutoff CSV Dataset
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            Upload verified counselling cutoff sheets to keep prediction algorithms updated without modifying application code.
          </p>
        </div>

        {/* Source metadata */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
              Data Source Authority
            </label>
            <input
              type="text"
              value={sourceName}
              onChange={(e) => setSourceName(e.target.value)}
              className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-800"
              placeholder="e.g. JoSAA Round 6 Official"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
              Counselling Year
            </label>
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value, 10))}
              className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-800"
            />
          </div>
        </div>

        {/* File Dropzone */}
        <div className="border-2 border-dashed border-gray-300 hover:border-blue-500 rounded-2xl p-6 text-center bg-gray-50/50 mb-4 transition-colors">
          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-xs font-bold text-gray-700">
            Click to upload CSV file or drag and drop
          </p>
          <p className="text-[11px] text-gray-400 mt-0.5">
            Columns: exam, institute, branch, category, closing_rank, quota, round, etc.
          </p>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="mt-3 text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
          />
        </div>

        {/* Preview rows */}
        {previewRows.length > 0 && (
          <div className="mb-4">
            <h5 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Preview Data ({headers.join(', ')})
            </h5>
            <div className="overflow-x-auto rounded-xl border border-gray-200 max-h-40">
              <table className="w-full text-left text-[11px] bg-white">
                <thead className="bg-gray-100 text-gray-700 font-bold border-b border-gray-200">
                  <tr>
                    {headers.slice(0, 6).map((h) => (
                      <th key={h} className="p-2 whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {previewRows.map((row, idx) => (
                    <tr key={idx}>
                      {headers.slice(0, 6).map((h) => (
                        <td key={h} className="p-2 whitespace-nowrap text-gray-600">
                          {row[h]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {resultMessage && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2 mb-4">
            <CheckCircle2 className="w-4 h-4" />
            {resultMessage}
          </div>
        )}

        <button
          onClick={handleImport}
          disabled={isProcessing || !csvContent}
          className="w-full h-12 bg-gray-900 hover:bg-gray-800 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition-all cursor-pointer"
        >
          {isProcessing ? 'Validating & Importing Records...' : 'Import Dataset'}
        </button>
      </div>
    </div>
  );
};

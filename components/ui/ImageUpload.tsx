'use client'

import { useState } from 'react'
import { Upload, X, Loader2, ImageIcon } from 'lucide-react'

interface ImageUploadProps {
  label: string
  value: string | null
  onChange: (url: string) => void
  bucket?: string
}

export default function ImageUpload({ 
  label, 
  value, 
  onChange, 
  bucket = 'school-assets' 
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch('/api/upload-image', {
            method: 'POST',
            body: formData,
        });
        if (!res.ok) {
            throw new Error('Upload failed');
        }
        const data = await res.json();
        onChange(data.url);
    } catch (error) {
        console.error('Upload failed:', error);
        alert('Error uploading image');
    } finally {
        setUploading(false);
    }
};

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      
      {value ? (
        // Preview State
        <div className="relative w-full aspect-video md:aspect-[3/1] bg-gray-100 rounded-xl overflow-hidden border border-gray-200 group">
          <img 
            src={value} 
            alt="Upload preview" 
            className="w-full h-full object-cover"
          />
          <button
            onClick={() => onChange('')} // Clear image
            type="button"
            className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        // Upload State
        <div className="w-full">
          <label className={`
            flex flex-col items-center justify-center w-full h-48 
            border-2 border-dashed border-gray-300 rounded-xl 
            cursor-pointer bg-gray-50 hover:bg-gray-100 hover:border-blue-400 transition-all
            ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
          `}>
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              {uploading ? (
                <>
                  <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-3" />
                  <p className="text-sm text-gray-500">Uploading...</p>
                </>
              ) : (
                <>
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-full mb-3">
                     <Upload className="w-6 h-6" />
                  </div>
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold text-gray-900">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-400">SVG, PNG, JPG or GIF (MAX. 2MB)</p>
                </>
              )}
            </div>
            <input 
              type="file" 
              className="hidden" 
              accept="image/*"
              disabled={uploading}
              onChange={handleUpload}
            />
          </label>
        </div>
      )}
    </div>
  )
}
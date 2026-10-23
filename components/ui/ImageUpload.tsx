'use client'

import { useState, useEffect } from 'react'
import { Upload, X, Loader2, Link as LinkIcon, ImageOff } from 'lucide-react'
import { toast } from 'sonner'

interface ImageUploadProps {
  label: string
  value: string | null
  onChange: (url: string) => void
  bucket?: string
}

function formatUrl(url: string): string {
  if (!url) return ''
  try {
    if (url.includes('drive.google.com')) {
      const urlObj = new URL(url)
      const pathMatch = urlObj.pathname.match(/\/(?:file\/)?d\/([a-zA-Z0-9_-]+)/)
      const idParam = urlObj.searchParams.get('id')
      const fileId = pathMatch ? pathMatch[1] : idParam
      if (fileId) {
        return `https://lh3.googleusercontent.com/d/${fileId}`
      }
    }
  } catch {}
  return url
}

export default function ImageUpload({ 
  label, 
  value, 
  onChange, 
  bucket = 'school-assets' 
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [showUrlInput, setShowUrlInput] = useState(false)
  const [urlInputVal, setUrlInputVal] = useState('')
  const [imgError, setImgError] = useState(false)

  useEffect(() => {
    setImgError(false)
  }, [value])

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
            throw new Error(`Upload failed (status: ${res.status})`);
        }
        const data = await res.json();
        if (data.url) {
          onChange(data.url);
          setImgError(false);
          toast.success('Image uploaded successfully');
        } else {
          throw new Error(data.error || 'Failed to upload image');
        }
    } catch (error: any) {
        console.error('Upload failed:', error);
        toast.error(error.message || 'Error uploading image');
    } finally {
        setUploading(false);
    }
  };

  const handleApplyUrl = () => {
    if (!urlInputVal.trim()) return
    const formatted = formatUrl(urlInputVal.trim())
    onChange(formatted)
    setImgError(false)
    setUrlInputVal('')
    setShowUrlInput(false)
  }

  const displayUrl = value ? formatUrl(value) : ''

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
        {!value && (
          <button
            type="button"
            onClick={() => setShowUrlInput(!showUrlInput)}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
          >
            <LinkIcon className="w-3 h-3" />
            {showUrlInput ? 'Upload file instead' : 'Or paste URL / Google Drive link'}
          </button>
        )}
      </div>
      
      {value ? (
        // Preview State
        <div className="relative w-full aspect-video md:aspect-[3/1] bg-gray-100 rounded-xl overflow-hidden border border-gray-200 group">
          {imgError ? (
            <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-gray-50 text-gray-400 text-center">
              <ImageOff className="w-8 h-8 text-gray-400 mb-1" />
              <p className="text-xs font-semibold text-gray-600">Could not load preview</p>
              <p className="text-[11px] text-gray-400">Click remove (X) to clear or upload a new file</p>
            </div>
          ) : (
            <img 
              src={displayUrl} 
              alt="Upload preview" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
              onError={() => setImgError(true)}
            />
          )}
          <button
            onClick={() => {
              onChange('')
              setImgError(false)
            }}
            type="button"
            className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full opacity-90 group-hover:opacity-100 transition-opacity hover:bg-red-700 shadow-md cursor-pointer"
            title="Remove image"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : showUrlInput ? (
        // Direct URL Input State
        <div className="space-y-2 p-4 bg-gray-50 rounded-xl border border-gray-200">
          <label className="block text-xs font-semibold text-gray-600">Enter image URL or Google Drive link:</label>
          <div className="flex gap-2">
            <input 
              type="text"
              value={urlInputVal}
              onChange={(e) => setUrlInputVal(e.target.value)}
              placeholder="https://... or Google Drive link"
              className="flex-1 px-3 py-2 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleApplyUrl()
                }
              }}
            />
            <button
              type="button"
              onClick={handleApplyUrl}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
            >
              Apply
            </button>
          </div>
          <p className="text-[11px] text-gray-500">Google Drive links will be automatically converted to direct images.</p>
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
                  <p className="text-xs text-gray-400">SVG, PNG, JPG, AVIF or WEBP (MAX. 5MB)</p>
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

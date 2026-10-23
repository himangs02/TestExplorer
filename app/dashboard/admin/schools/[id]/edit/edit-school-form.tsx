'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Save, Loader2, Building, Image as ImageIcon, User } from 'lucide-react'
import { updateSchoolAction } from '../../actions'
import ImageUpload from '@/components/ui/ImageUpload'

export default function EditSchoolForm({ school }: { school: any }) {
  const [isPending, setIsPending] = useState(false)
  const [currentHero, setCurrentHero] = useState(school.hero_image_url || '')
  const [currentLogo, setCurrentLogo] = useState(school.logo_url || '')
  const [currentImage, setCurrentImage] = useState(school.principal_image || '')
  const router = useRouter()

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsPending(true)
    
    try {
      const formData = new FormData(event.currentTarget)
      formData.set('hero_image_url', currentHero.trim())
      formData.set('logo_url', currentLogo.trim())
      formData.set('principal_image', currentImage.trim())
      
      const result = await updateSchoolAction(formData)
      
      if (result && 'error' in result) {
        toast.error(result.error)
      } else {
        toast.success('School updated successfully!')
        router.push('/dashboard/admin/schools')
        router.refresh()
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to update school')
    } finally {
      setIsPending(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <input type="hidden" name="id" value={school.id} />

      {/* Section 1: Basic Information */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-2">
          <Building className="w-5 h-5 text-blue-600" /> Basic School Information
        </h2>

        <div>
          <label className="block text-sm font-bold text-gray-800 mb-1.5">School Name</label>
          <input 
            name="name" 
            type="text" 
            defaultValue={school.name}
            required
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black outline-none transition-all text-sm font-medium"
            placeholder="e.g. Springfield Public School"
          />
        </div>
        
        {/* Subdomain Slug */}
        <div>
          <label className="block text-sm font-bold text-gray-800 mb-1.5">Subdomain Slug</label>
          <div className="flex items-center">
            <span className="px-4 py-3 bg-gray-100 border border-r-0 border-gray-200 text-gray-500 font-semibold text-sm rounded-l-xl select-none">
              testexplorer.in/
            </span>
            <input 
              name="slug" 
              type="text" 
              defaultValue={school.slug}
              required
              className="flex-1 px-4 py-3 rounded-r-xl border border-gray-200 focus:ring-2 focus:ring-black outline-none transition-all text-sm font-medium"
            />
          </div>
          <p className="text-xs text-amber-600 mt-1.5 font-medium">
            Warning: Changing this modifies the school&apos;s URL (e.g. /{school.slug}).
          </p>
        </div>

        {/* Welcome Message */}
        <div>
          <label className="block text-sm font-bold text-gray-800 mb-1.5">Welcome Message</label>
          <textarea 
            name="welcome_message" 
            defaultValue={school.welcome_message || ''}
            rows={3}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black outline-none transition-all text-sm font-medium resize-none"
            placeholder="Welcome message displayed on the school banner..."
          />
        </div>
      </div>

      {/* Section 2: Visual Branding & Images */}
      <div className="space-y-6 pt-2">
        <h2 className="text-base font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-2">
          <ImageIcon className="w-5 h-5 text-indigo-600" /> Branding & Hero Media
        </h2>

        {/* Hero / Banner Image */}
        <div className="p-5 bg-gray-50/70 rounded-2xl border border-gray-200/80 space-y-2">
          <ImageUpload 
            label="Hero Banner Image"
            value={currentHero}
            onChange={setCurrentHero}
          />
          <p className="text-xs text-gray-500">
            This banner displays across the top of the school&apos;s landing page. Click to upload an image from your device, or paste a direct image URL / Google Drive link.
          </p>
        </div>

        {/* School Logo */}
        <div className="p-5 bg-gray-50/70 rounded-2xl border border-gray-200/80 space-y-2">
          <ImageUpload 
            label="School Logo"
            value={currentLogo}
            onChange={setCurrentLogo}
          />
          <p className="text-xs text-gray-500">
            Recommended: High-resolution PNG or JPG with transparent or clean background.
          </p>
        </div>
      </div>

      {/* Section 3: Principal's Desk */}
      <div className="space-y-4 pt-2">
        <h2 className="text-base font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-2">
          <User className="w-5 h-5 text-emerald-600" /> Principal&apos;s Desk
        </h2>

        <div className="p-5 bg-gray-50/70 rounded-2xl border border-gray-200/80 space-y-2">
          <ImageUpload 
            label="Principal Photo"
            value={currentImage}
            onChange={setCurrentImage}
          />
          <p className="text-xs text-gray-500">
            Upload the principal&apos;s portrait photo or paste an image link.
          </p>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-800 mb-1.5">Principal Message</label>
          <textarea 
            name="principal_message" 
            defaultValue={school.principal_message || ''}
            rows={5}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black outline-none transition-all text-sm font-medium"
            placeholder="A message to students and parents from the principal..."
          />
        </div>
      </div>

      {/* Submit Button */}
      <div className="pt-4">
        <button 
          type="submit" 
          disabled={isPending} 
          className="w-full py-4 bg-black text-white font-bold rounded-xl hover:bg-gray-800 transition-all flex items-center justify-center gap-2 shadow-lg shadow-black/10 disabled:opacity-60 cursor-pointer"
        >
          {isPending ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" /> Saving Changes...
            </>
          ) : (
            <>
              <Save className="w-5 h-5" /> Save Changes
            </>
          )}
        </button>
      </div>
    </form>
  )
}
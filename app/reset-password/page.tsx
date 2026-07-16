'use client'

import Link from 'next/link'
import { resetPassword } from '@/app/auth/actions'
import { useState, Suspense } from 'react'
import { Loader2, Lock, CheckCircle2 } from 'lucide-react'
import { useSearchParams } from 'next/navigation'

function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const handleSubmit = async (formData: FormData) => {
    setLoading(true)
    setMessage(null)

    if (!token) {
      setMessage({ type: 'error', text: 'Missing reset token.' })
      setLoading(false)
      return
    }
    
    formData.append('token', token)
    const result = await resetPassword(formData)

    if (result?.error) {
      setMessage({ type: 'error', text: result.error })
    } else {
      setMessage({ 
        type: 'success', 
        text: 'Your password has been successfully reset.' 
      })
    }
    setLoading(false)
  }

  return (
    <div className="w-full max-w-md">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-black text-gray-900 mb-2">Reset Password</h1>
        <p className="text-gray-500">
          Enter your new password below.
        </p>
      </div>

      {/* Success State */}
      {message?.type === 'success' ? (
        <div className="bg-green-50 border border-green-100 p-8 rounded-3xl text-center">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Password Reset Successful</h3>
          <p className="text-gray-600 mb-6 text-sm">
            You can now log in with your new password.
          </p>
          <Link 
            href="/login"
            className="block w-full bg-black text-white font-bold py-3 rounded-xl hover:bg-gray-800 transition-all"
          >
            Go to Login
          </Link>
        </div>
      ) : (
        /* Input Form */
        <form action={handleSubmit} className="space-y-6">
          {!token && (
            <div className="p-4 bg-yellow-50 text-yellow-700 text-sm font-medium rounded-xl border border-yellow-100 mb-4">
              Warning: No reset token found in the URL. You won't be able to reset your password.
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">New Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
              <input 
                name="password" 
                type="password" 
                required 
                placeholder="Enter new password"
                className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all bg-gray-50 focus:bg-white" 
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">Confirm New Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
              <input 
                name="confirmPassword" 
                type="password" 
                required 
                placeholder="Confirm new password"
                className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all bg-gray-50 focus:bg-white" 
              />
            </div>
          </div>

          {message?.type === 'error' && (
            <div className="p-4 bg-red-50 text-red-600 text-sm font-medium rounded-xl border border-red-100">
              {message.text}
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading || !token} 
            className="w-full bg-black text-white font-bold text-lg py-4 rounded-xl hover:bg-gray-900 transition-transform active:scale-[0.99] flex items-center justify-center shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Reset Password"}
          </button>
        </form>
      )}
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-orange-100 rounded-full blur-3xl opacity-50 -z-10" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-50 rounded-full blur-3xl opacity-50 -z-10" />
      
      <Suspense fallback={
        <div className="flex items-center justify-center p-12">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      }>
        <ResetPasswordForm />
      </Suspense>
    </div>
  )
}

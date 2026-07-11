'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { Loader2 } from 'lucide-react'
import Link from 'next/link'

interface LoginFormProps {
  schoolSlug?: string
  schoolName?: string
}

export default function LoginForm({ schoolSlug, schoolName }: LoginFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const result = await signIn('credentials', {
      redirect: false,
      email,
      password,
      schoolSlug: schoolSlug || ''
    })
    
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    } else {
      window.location.href = '/dashboard'
    }
  }

  return (
    <div className="w-full max-w-md space-y-8">
      <div className="text-center">
        <h2 className="mt-6 text-3xl font-black text-gray-900 tracking-tight">
          {schoolName ? `Log in to ${schoolName}` : 'Welcome Back'}
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Enter your credentials to access the exam portal.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        
        {/* --- CRITICAL FIX: HIDDEN INPUT --- */}
        <input type="hidden" name="schoolSlug" value={schoolSlug || ''} />
        {/* ---------------------------------- */}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Email Address</label>
            <input name="email" type="email" required className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black outline-none" placeholder="you@example.com" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Password</label>
            <input name="password" type="password" required className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black outline-none" placeholder="••••••••" />
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg font-medium">
            {error}
          </div>
        )}

        <button type="submit" disabled={loading} className="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50 disabled:cursor-not-allowed transition-all">
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign in'}
        </button>
      </form>
      
      <div className="text-center mt-4">
        <p className="text-sm text-gray-600">
          Don't have an account?{' '}
          <Link href={schoolSlug ? '/signup' : '/signup'} className="font-bold text-blue-600 hover:text-blue-500">
            Get Started
          </Link>
        </p>
      </div>
    </div>
  )
}
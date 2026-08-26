'use client'

import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Eye, EyeOff, Loader2, Trophy, Zap, CheckCircle2, ArrowRight, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    setLoading(true)
    setError(null)
    const toastId = toast.loading('Signing in...')
    
    const result = await signIn('credentials', {
      email,
      password,
      redirect: false
    })
    
    toast.dismiss(toastId)
    if (result?.error) {
      setError(result.error === 'CredentialsSignin' ? 'Invalid email or password' : result.error)
      setLoading(false)
      toast.error(result.error === 'CredentialsSignin' ? 'Invalid email or password' : result.error)
    } else {
      toast.success('Signed in successfully!')
      router.push('/dashboard')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden grid lg:grid-cols-12 min-h-[640px]">
        
        {/* --- Left Column: Rich Gradient Hero Banner & Visual --- */}
        <div className="hidden lg:flex lg:col-span-6 bg-linear-to-br from-orange-500 via-[#FF6B35] to-[#E76F51] p-10 text-white flex-col justify-between relative overflow-hidden">
          
          {/* Ambient Background Circles */}
          <div className="absolute -top-20 -left-20 w-72 h-72 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-black/10 rounded-full blur-2xl pointer-events-none" />
          
          {/* Top Branding */}
          <div className="relative z-10">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center font-black text-xl shadow-inner border border-white/20">
                TE
              </div>
              <span className="font-extrabold text-2xl tracking-tight">TestExplorer</span>
            </Link>
          </div>

          {/* Center Graphic & Highlights */}
          <div className="relative z-10 my-auto py-6 space-y-6">
            
            {/* Embedded Clean Study SVG Illustration */}
            <div className="w-full max-w-[340px] mx-auto flex items-center justify-center">
              <svg viewBox="0 0 400 320" className="w-full h-auto drop-shadow-xl" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Desk Surface */}
                <path d="M40 250H360C365.5 250 370 254.5 370 260C370 265.5 365.5 270 360 270H40C34.5 270 30 265.5 30 260C30 254.5 34.5 250 40 250Z" fill="white" fillOpacity="0.3"/>
                <rect x="70" y="270" width="16" height="40" rx="4" fill="white" fillOpacity="0.2"/>
                <rect x="314" y="270" width="16" height="40" rx="4" fill="white" fillOpacity="0.2"/>
                
                {/* Laptop Screen */}
                <rect x="130" y="110" width="140" height="95" rx="8" fill="#1E293B"/>
                <rect x="136" y="116" width="128" height="83" rx="4" fill="#0F172A"/>
                {/* Code/Graph lines inside screen */}
                <circle cx="152" cy="130" r="4" fill="#38BDF8"/>
                <circle cx="164" cy="130" r="4" fill="#34D399"/>
                <circle cx="176" cy="130" r="4" fill="#F472B6"/>
                <path d="M148 175L175 152L200 162L230 138L250 148" stroke="#38BDF8" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M148 185H252" stroke="white" strokeOpacity="0.2" strokeWidth="2" strokeLinecap="round"/>
                
                {/* Laptop Base */}
                <path d="M110 205H290L275 220H125L110 205Z" fill="#CBD5E1"/>
                <rect x="180" y="208" width="40" height="4" rx="2" fill="#94A3B8"/>
                
                {/* Coffee Mug */}
                <rect x="80" y="210" width="28" height="36" rx="4" fill="#FEF08A"/>
                <path d="M108 218C114 218 116 224 116 228C116 232 114 238 108 238" stroke="#FEF08A" strokeWidth="4" strokeLinecap="round"/>
                
                {/* Books Stack */}
                <rect x="290" y="235" width="60" height="15" rx="3" fill="#38BDF8"/>
                <rect x="295" y="220" width="50" height="15" rx="3" fill="#F43F5E"/>
                <rect x="300" y="205" width="42" height="15" rx="3" fill="#10B981"/>
                
                {/* Floating Success Pill */}
                <g className="animate-bounce" style={{ animationDuration: '3s' }}>
                  <rect x="230" y="50" width="130" height="42" rx="21" fill="white" filter="drop-shadow(0px 8px 16px rgba(0,0,0,0.15))"/>
                  <circle cx="252" cy="71" r="13" fill="#10B981"/>
                  <path d="M246 71L250 75L258 67" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <text x="272" y="70" fill="#0F172A" fontSize="10" fontWeight="bold">Score: 99.8%</text>
                  <text x="272" y="82" fill="#64748B" fontSize="8" fontWeight="600">All India Rank 1</text>
                </g>
                
                {/* Floating Clock */}
                <g>
                  <rect x="40" y="70" width="105" height="38" rx="19" fill="white" fillOpacity="0.95" filter="drop-shadow(0px 8px 16px rgba(0,0,0,0.12))"/>
                  <circle cx="60" cy="89" r="11" fill="#FFEDD5"/>
                  <path d="M60 84V89L63 92" stroke="#EA580C" strokeWidth="2" strokeLinecap="round"/>
                  <text x="78" y="87" fill="#0F172A" fontSize="9" fontWeight="bold">Timed Practice</text>
                  <text x="78" y="98" fill="#EA580C" fontSize="8" fontWeight="600">Live Mock Tests</text>
                </g>
              </svg>
            </div>

            {/* Feature Highlights */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="flex items-center gap-2.5 bg-white/10 backdrop-blur-xs px-3.5 py-2.5 rounded-xl border border-white/15">
                <Trophy className="w-4 h-4 text-amber-200 shrink-0" />
                <span className="text-xs font-bold leading-tight">National Level Mocks</span>
              </div>
              <div className="flex items-center gap-2.5 bg-white/10 backdrop-blur-xs px-3.5 py-2.5 rounded-xl border border-white/15">
                <Zap className="w-4 h-4 text-amber-200 shrink-0" />
                <span className="text-xs font-bold leading-tight">Instant Score Analytics</span>
              </div>
            </div>
          </div>

          {/* Bottom Security Note */}
          <div className="relative z-10 flex items-center gap-2 text-xs text-white/80 font-medium">
            <ShieldCheck className="w-4 h-4" />
            <span>Secure exam portal with real-time test evaluation</span>
          </div>
        </div>

        {/* --- Right Column: Login Form --- */}
        <div className="lg:col-span-6 flex flex-col justify-center px-8 sm:px-12 py-12">
          <div className="w-full max-w-md mx-auto">
            
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
                Log In
              </h1>
              <p className="text-gray-500 text-sm mt-1.5 font-medium">
                Welcome back! Enter your credentials to access your dashboard.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Email */}
              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-gray-800">
                  Email Address
                </label>
                <input 
                  name="email" 
                  type="email" 
                  required 
                  className="w-full px-4 py-3.5 rounded-xl bg-gray-50 border-2 border-gray-200 text-gray-900 placeholder-gray-400 font-medium focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all text-sm"
                  placeholder="name@example.com"
                />
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-bold text-gray-800">
                    Password
                  </label>
                  <Link 
                    href="/forgot-password" 
                    className="text-xs font-bold text-orange-600 hover:text-orange-700 hover:underline"
                  >
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative">
                  <input 
                    name="password" 
                    type={showPassword ? "text" : "password"} 
                    required 
                    className="w-full px-4 py-3.5 pr-12 rounded-xl bg-gray-50 border-2 border-gray-200 text-gray-900 placeholder-gray-400 font-medium focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all text-sm"
                    placeholder="Enter your password"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Error Alert */}
              {error && (
                <div className="p-3.5 bg-red-50 text-red-700 text-xs font-semibold rounded-xl border border-red-200 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-600 shrink-0" />
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-gray-900 hover:bg-black text-white font-bold text-base py-3.5 rounded-xl shadow-lg shadow-gray-900/15 hover:shadow-gray-900/25 transition-all active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed mt-2"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <span>Log In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Signup Link */}
              <div className="pt-4 text-center text-sm font-medium text-gray-600 border-t border-gray-100">
                Don&apos;t have an account?{' '}
                <Link 
                  href="/signup" 
                  className="font-bold text-orange-600 hover:text-orange-700 hover:underline inline-flex items-center gap-1"
                >
                  Create an account
                </Link>
              </div>
            </form>

          </div>
        </div>

      </div>
    </div>
  )
}
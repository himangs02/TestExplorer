'use client'
import Link from 'next/link'
import { signup } from '@/app/auth/actions'
import { useState } from 'react'
import { Eye, EyeOff, Loader2, GraduationCap, MapPin, Building } from 'lucide-react'
import Image from 'next/image'
import SearchSchoolInput from '@/components/signup/schoolSearchInput'
import { toast } from "sonner"
import { State, City } from 'country-state-city'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'

interface SignupFormProps {
  school?: { id: string; name: string } | null
  redirectTo?: string     // For Ad Funnel Redirects
  prefilledEmail?: string // For Admin Invite Links
}

export default function SignupForm({ school, redirectTo, prefilledEmail }: SignupFormProps) {
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  
  const [selectedStream, setSelectedStream] = useState<string>("") 
  const [selectedStateIso, setSelectedStateIso] = useState<string>("")
  const [selectedCity, setSelectedCity] = useState<string>("")
  

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError(null)
    
    const formData = new FormData(event.currentTarget)
    
    // FIX 4: Convert State ISO Code (e.g. "HR") to Name (e.g. "Haryana")
    // The select input returns the Code, but database usually wants the Name.
    if (selectedStateIso) {
      const stateData = State.getStateByCodeAndCountry(selectedStateIso, 'IN')
      if (stateData) {
        formData.set('state', stateData.name)
      }
    }

    const toastId = toast.loading('Creating your account...')

    try {
      const result = await signup(formData)

      if (result?.error) {
        toast.dismiss(toastId)
        toast.error(result.error)
        setError(result.error)
        setLoading(false)
      } else if (result?.success) {
        toast.dismiss(toastId)
        toast.success('Account created successfully!')
        
        // Auto-login after successful signup
        const email = formData.get('email') as string
        const password = formData.get('password') as string
        await signIn('credentials', {
          email,
          password,
          redirect: false
        })

        const destination = redirectTo || (result as any)?.redirectUrl || '/categories'
        router.push(destination)
      }
    } catch (err) {
      toast.dismiss(toastId)
      toast.error('An unexpected error occurred.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white relative overflow-hidden p-4">

      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-12 lg:gap-20 items-center z-10">

        <div className="w-full max-w-md mx-auto order-2 lg:order-1">
          <div className="mb-10">
            <h1 className="text-5xl font-extrabold text-orange-600 mb-3 tracking-tight">Create Account</h1>
            <p className="text-gray-500 text-lg">
              {school 
                ? `Join ${school.name} learning portal.` 
                : "Start your learning journey today."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Hidden Input for Redirect (Ad Funnel) */}
            {redirectTo && (
               <input type="hidden" name="redirectTo" value={redirectTo} />
            )}
            
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">Full Name</label>
              <input 
                name="fullName"
                type="text" 
                required 
                className="w-full px-5 py-4 rounded-xl bg-gray-100 border-2 border-transparent focus:bg-white focus:border-orange-500 outline-none transition-all placeholder-gray-400 font-medium"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">Email Address</label>
              <input 
                name="email" 
                type="email" 
                required 
                defaultValue={prefilledEmail || ''} // Handle prefilled email
                readOnly={!!prefilledEmail}         // Lock it if prefilled (Invite mode)
                className={`w-full px-5 py-4 rounded-xl border-2 outline-none transition-all font-medium 
                  ${prefilledEmail 
                    ? 'bg-orange-50/50 border-orange-100 text-gray-600 cursor-not-allowed' 
                    : 'bg-gray-100 border-transparent focus:bg-white focus:border-orange-500 placeholder-gray-400'
                  }`}
                placeholder="john@example.com"
              />
            </div>

            <div className="space-y-2">
                 <SearchSchoolInput 
                   prefilledSchool={school}
                   readOnly={!!school}
                 />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">Stream</label>
              <div className="relative">
                <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                <select
                  name="stream"
                  value={selectedStream}
                  onChange={(e) => setSelectedStream(e.target.value)}
                  className="w-full pl-12 pr-5 py-4 rounded-xl bg-gray-100 border-2 border-transparent focus:bg-white focus:border-orange-500 outline-none transition-all appearance-none cursor-pointer font-medium text-gray-700"
                  required
                >
                  <option value="" disabled>Select your stream</option>
                  <option value="Non-Medical">Non-Medical (PCM)</option>
                  <option value="Medical">Medical (PCB)</option>
                  <option value="Commerce">Commerce</option>
                  <option value="Arts">Arts / Humanities</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">Contact Number</label>
              <input 
                name="phone" 
                type="text" 
                required 
                className="w-full px-5 py-4 rounded-xl bg-gray-100 border-2 border-transparent focus:bg-white focus:border-orange-500 outline-none transition-all placeholder-gray-400 font-medium"
                placeholder="+91 98765 43210"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">State</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                  <select
                    name="state"
                    value={selectedStateIso}
                    onChange={(e) => {
                      setSelectedStateIso(e.target.value);
                      setSelectedCity("");
                    }}
                    className="w-full pl-12 pr-4 py-4 rounded-xl bg-gray-100 border-2 border-transparent focus:bg-white focus:border-orange-500 outline-none transition-all appearance-none cursor-pointer font-medium text-gray-700 text-sm"
                    required
                  >
                    <option value="" disabled>Select State</option>
                    {State.getStatesOfCountry('IN').map((state) => (
                      <option key={state.isoCode} value={state.isoCode}>
                        {state.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">City</label>
                <div className="relative">
                  <Building className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                  <select
                    name="city"
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    disabled={!selectedStateIso}
                    className="w-full pl-12 pr-4 py-4 rounded-xl bg-gray-100 border-2 border-transparent focus:bg-white focus:border-orange-500 outline-none transition-all appearance-none cursor-pointer font-medium text-gray-700 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    required
                  >
                    <option value="" disabled>Select City</option>
                    {selectedStateIso && City.getCitiesOfState('IN', selectedStateIso).map((city) => (
                      <option key={city.name} value={city.name}>{city.name}</option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <label className="block text-sm font-bold text-gray-900 mb-2">Password</label>
              <input 
                name="password" 
                type={showPassword ? "text" : "password"} 
                required 
                className="w-full px-5 py-4 rounded-xl bg-gray-100 border-2 border-transparent focus:bg-white focus:border-orange-500 outline-none transition-all placeholder-gray-400 font-medium pr-12"
                placeholder="Min. 8 characters"
              />
               <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-[42px] text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {error && (
              <div className="p-4 bg-red-50 text-red-600 text-sm rounded-xl font-medium border border-red-100 flex items-center gap-2">
                {error}
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-black hover:bg-gray-900 text-white font-bold text-lg py-4 rounded-full transition-transform hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center shadow-xl shadow-orange-100 mt-6"
            >
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Create Account"}
            </button>
          </form>
        </div>

        <div className="hidden lg:flex flex-col justify-center items-center relative h-full min-h-[700px] order-1 lg:order-2">
           <div className="absolute top-0 right-0 p-6 z-20">
              <p className="text-base font-semibold text-gray-700">
                Already have an account?{' '}
                <Link 
                  href="/login" 
                  className="inline-block ml-2 text-orange-600 hover:text-orange-700 font-bold transition-colors"
                >
                  Log In →
                </Link>
              </p>
           </div>

           <div className="relative z-10 w-full max-w-[420px] mx-auto">
             <div className="bg-linear-to-br from-orange-500 via-[#FF6B35] to-[#E76F51] rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
               <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-xl pointer-events-none" />
               <div className="relative z-10 space-y-6">
                 <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center font-black text-xl border border-white/20">
                     TE
                   </div>
                   <div>
                     <h3 className="font-bold text-lg leading-tight">Join TestExplorer</h3>
                     <p className="text-white/80 text-xs font-medium">India's Premier Exam Prep Network</p>
                   </div>
                 </div>

                 <div className="py-4">
                   <svg viewBox="0 0 340 200" className="w-full h-auto drop-shadow-md" fill="none" xmlns="http://www.w3.org/2000/svg">
                     <rect x="20" y="20" width="300" height="160" rx="16" fill="white" fillOpacity="0.15" stroke="white" strokeOpacity="0.3" strokeWidth="2"/>
                     <rect x="40" y="45" width="48" height="48" rx="12" fill="white" fillOpacity="0.25"/>
                     <circle cx="64" cy="69" r="12" fill="#FDE047"/>
                     <path d="M60 69L63 72L69 66" stroke="#854D0E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                     <rect x="104" y="48" width="140" height="14" rx="4" fill="white" fillOpacity="0.9"/>
                     <rect x="104" y="70" width="90" height="10" rx="3" fill="white" fillOpacity="0.6"/>
                     <path d="M40 120L110 95L180 130L250 80L300 100" stroke="#38BDF8" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
                     <circle cx="250" cy="80" r="6" fill="#38BDF8" stroke="white" strokeWidth="2"/>
                   </svg>
                 </div>

                 <div className="space-y-2.5 pt-2 border-t border-white/20">
                   <div className="flex items-center gap-2 text-xs font-semibold">
                     <span className="w-2 h-2 rounded-full bg-emerald-300"></span>
                     <span>Full Chapter-Wise Practice & Mock Tests</span>
                   </div>
                   <div className="flex items-center gap-2 text-xs font-semibold">
                     <span className="w-2 h-2 rounded-full bg-amber-300"></span>
                     <span>National Ranking & Real-time Percentile</span>
                   </div>
                 </div>
               </div>
             </div>
           </div>
        </div>
      </div>
    </div>
  )
}
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { ArrowLeft, Building2, Lock, Mail, User } from 'lucide-react'
import Link from 'next/link'
import bcrypt from 'bcryptjs'

export default function AddSchoolPage() {
  
  async function createSchool(formData: FormData) {
    'use server'
    
    // 2. Extract Form Data
    const name = formData.get('name') as string
    const slug = (formData.get('slug') as string).toLowerCase()
    const adminName = formData.get('adminName') as string
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    // Check if user email is taken
    const existingUser = await prisma.users.findUnique({ where: { email } })
    if (existingUser) {
      throw new Error('Failed to create admin user. Email is already taken.')
    }

    // Check if slug is taken
    const existingOrg = await prisma.organizations.findUnique({ where: { slug } })
    if (existingOrg) {
      throw new Error('Failed to create school. Slug might be taken.')
    }

    try {
      // Use transaction to ensure both or neither are created
      await prisma.$transaction(async (tx) => {
        // 3. Create the Organization (School)
        const org = await tx.organizations.create({
          data: {
            name,
            slug,
            welcome_message: `Welcome to ${name}`,
          }
        })

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10)

        // 4. Create the School Admin User (Auth)
        const authUser = await tx.users.create({
          data: {
            name: adminName,
            email,
            password: hashedPassword,
            role: 'school_admin'
          }
        })

        // 5. Create Profile & Link to Org
        await tx.profiles.upsert({
          where: { id: authUser.id },
          update: {
            full_name: adminName,
            role: 'school_admin',
            organization_id: org.id
          },
          create: {
            id: authUser.id,
            email: email,
            full_name: adminName,
            role: 'school_admin',
            organization_id: org.id
          }
        })
      })
    } catch (error: any) {
      console.error('Transaction Error:', error)
      throw new Error('Failed to create school and user.')
    }

    redirect('/dashboard/admin/schools')
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      <Link href="/dashboard/admin/schools" className="flex items-center gap-2 text-gray-500 font-bold mb-8 hover:text-black">
        <ArrowLeft className="w-4 h-4" /> Back to Schools
      </Link>

      <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-xl shadow-gray-100">
        <div className="mb-8 border-b border-gray-100 pb-6">
           <h1 className="text-3xl font-black text-gray-900 mb-2">Onboard New School</h1>
           <p className="text-gray-500">Create the school entity and its primary administrator account.</p>
        </div>
        
        <form action={createSchool} className="space-y-6">
          
          {/* Section 1: School Details */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
              <Building2 className="w-4 h-4" /> School Information
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">School Name</label>
                <input name="name" type="text" placeholder="e.g. Springfield High" required className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Subdomain Slug</label>
                <input name="slug" type="text" placeholder="springfield" required className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black outline-none" />
              </div>
            </div>
          </div>

          <div className="h-px bg-gray-100 my-4" />

          {/* Section 2: Admin Credentials */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
              <User className="w-4 h-4" /> Admin Credentials
            </h3>
            
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">Admin Full Name</label>
              <input name="adminName" type="text" placeholder="Principal Skinner" required className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black outline-none" />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                  <input name="email" type="email" placeholder="admin@school.com" required className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Set Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                  <input name="password" type="text" placeholder="Secret123" required className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black outline-none" />
                </div>
              </div>
            </div>
            
            <div className="bg-yellow-50 text-yellow-800 text-xs p-3 rounded-lg font-medium">
              Note: You (Super Admin) are setting this password. Copy it now to send to the client.
            </div>
          </div>

          <button type="submit" className="w-full py-4 bg-black text-white font-bold rounded-xl hover:bg-gray-800 transition-all shadow-lg mt-6">
            Create School & User
          </button>
        </form>
      </div>
    </div>
  )
}
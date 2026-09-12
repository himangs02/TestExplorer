import { getCurrentSchool } from "@/lib/db/school";
import { Mail, MapPin, Phone, Building2 } from "lucide-react";

export default async function ContactPage() {
  const school = await getCurrentSchool();

  // Define Display Constants (Default to Test Explorer if no school)
  const contactInfo = {
    title: "Let's Talk",
    description: "Have a question about our pricing, features, or just want to say hi? Drop us a line.",
    email: school?.email || "hello@testexplorer.com",
    phone: school?.phone || "+91 98765 43210",
    companyName: school?.name || "Test Explorer Inc."
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-20 px-4">
      <div className="w-full max-w-6xl bg-white rounded-[2rem] shadow-xl overflow-hidden flex flex-col md:flex-row">
        
        {/* Left: Info Section */}
        <div className="w-full md:w-2/5 bg-gray-900 text-white p-8 md:p-12 flex flex-col justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-4">{contactInfo.title}</h2>
            <p className="text-gray-400 mb-8 text-base leading-relaxed">
              {contactInfo.description}
            </p>
            
            <div className="space-y-6">
              {/* Email */}
              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <p className="text-[11px] text-gray-400 uppercase font-bold tracking-wider mb-0.5">Email</p>
                  <p className="font-medium text-base">{contactInfo.email}</p>
                </div>
              </div>
              
              {/* Phone */}
              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4 text-green-400" />
                </div>
                <div>
                  <p className="text-[11px] text-gray-400 uppercase font-bold tracking-wider mb-0.5">Phone</p>
                  <p className="font-medium text-base">{contactInfo.phone}</p>
                </div>
              </div>

              {/* Organization Name (Visual consistency) */}
              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                  <Building2 className="w-4 h-4 text-purple-400" />
                </div>
                <div>
                  <p className="text-[11px] text-gray-400 uppercase font-bold tracking-wider mb-0.5">Organization</p>
                  <p className="font-medium text-base">{contactInfo.companyName}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 md:mt-0 pt-8 border-t border-gray-800">
             <p className="text-sm text-gray-500">© {new Date().getFullYear()} {contactInfo.companyName}</p>
          </div>
        </div>

        {/* Right: Form Section */}
        <div className="w-full md:w-3/5 p-10 md:p-16">
          <form className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-900">First Name</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all" 
                  placeholder="John" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-900">Last Name</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all" 
                  placeholder="Doe" 
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-900">Email Address</label>
              <input 
                type="email" 
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all" 
                placeholder="john@example.com" 
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-900">Message</label>
              <textarea 
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all h-32 resize-none" 
                placeholder="Tell us what you need..."
              />
            </div>

            <button 
              type="submit" 
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-[0.98]"
            >
              Send Message
            </button>
          </form>
        </div>
        
      </div>
    </div>
  );
}
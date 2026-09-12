import { Zap, Gift, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function SchoolPromo({ schoolName }: { schoolName: string }) {
  return (
    <section className="py-8 sm:py-10 px-4">
      <div className="max-w-3xl sm:max-w-4xl mx-auto relative group">
        {/* Animated background glow */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 via-indigo-500 to-emerald-500 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>

        <div className="relative bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 md:p-9 shadow-xl flex flex-col lg:flex-row items-center justify-between gap-6 sm:gap-8 overflow-hidden">

          {/* Decorative Rings */}
          <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-blue-50 rounded-full blur-2xl opacity-60 pointer-events-none"></div>

          <div className="flex-1 space-y-3.5 sm:space-y-4 text-center lg:text-left z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-600 text-white text-[9px] sm:text-[10px] font-black uppercase tracking-wider shadow-md shadow-blue-200">
              <Zap className="w-3 h-3 fill-current" /> School Partnership
            </div>

            <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-gray-900 leading-tight tracking-tight">
              Premium Learning <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                100% Sponsored
              </span>
            </h2>

            <p className="text-gray-500 text-[11px] sm:text-xs font-medium max-w-md mx-auto lg:mx-0 leading-relaxed">
              Exclusive benefit for students of <span className="text-gray-900 font-bold underline decoration-blue-500/30 underline-offset-4">{schoolName}</span>.
              Get full access to all mock tests and materials.
            </p>

            <div className="flex flex-wrap justify-center lg:justify-start gap-3 text-[11px] sm:text-xs font-bold text-gray-600">
              <div className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Full Syllabus</div>
              <div className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Expert Analysis</div>
            </div>
          </div>

          {/* Price Card */}
          <div className="shrink-0 bg-slate-50 p-5 sm:p-6 rounded-2xl border border-slate-100 text-center min-w-[220px] sm:min-w-[240px] relative shadow-xs">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-tight shadow-xs whitespace-nowrap">
              School Discount Applied
            </div>

            <div className="space-y-1 mt-2">
              <div className="relative inline-block">
                {/* LARGE STRIKE-THROUGH PRICE */}
                <span className="text-lg sm:text-xl font-black text-gray-400 opacity-50 tracking-tight">
                  ₹1000
                </span>
                {/* THE RED BOLD LINE */}
                <div className="absolute top-1/2 left-0 w-full h-[3px] md:h-[4px] bg-red-500 -rotate-12 rounded-full shadow-xs"></div>
              </div>

              <div className="flex flex-col items-center">
                <span className="text-3xl sm:text-4xl font-black text-blue-600 tracking-tight drop-shadow-xs">
                  FREE
                </span>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">For your lifetime</span>
              </div>
            </div>

            <Link
              href="/exams/cuet"
              className="block mt-5 w-full bg-gray-900 hover:bg-blue-600 text-white font-bold py-2.5 sm:py-3 rounded-xl transition-all duration-300 shadow-md hover:shadow-blue-200 flex items-center justify-center gap-2 group active:scale-95 text-center text-xs"
            >
              Get Started Now
              <Gift className="w-3.5 h-3.5 group-hover:rotate-12 transition-transform" />
            </Link>
          </div>

        </div>
      </div>
    </section>
  );
}
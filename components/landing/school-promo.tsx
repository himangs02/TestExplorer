import { Zap, Gift, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function SchoolPromo({ schoolName }: { schoolName: string }) {
  return (
    <section className="py-3 sm:py-4 px-4">
      <div className="max-w-2xl sm:max-w-3xl mx-auto relative group">
        {/* Animated background glow */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 via-indigo-500 to-emerald-500 rounded-2xl blur-sm opacity-20 group-hover:opacity-35 transition duration-500"></div>

        <div className="relative bg-white border border-gray-100 rounded-2xl p-4 sm:p-5 md:p-6 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6 overflow-hidden">

          {/* Decorative subtle background circle */}
          <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-blue-50 rounded-full blur-xl opacity-60 pointer-events-none"></div>

          {/* Left info column */}
          <div className="flex-1 space-y-2 text-center sm:text-left z-10">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-600 text-white text-[9px] font-black uppercase tracking-wider shadow-xs">
              <Zap className="w-2.5 h-2.5 fill-current" /> School Partnership
            </div>

            <h2 className="text-lg sm:text-xl md:text-2xl font-black text-gray-900 leading-tight tracking-tight">
              Premium Learning{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                100% Sponsored
              </span>
            </h2>

            <p className="text-gray-500 text-[11px] sm:text-xs font-medium max-w-md mx-auto sm:mx-0 leading-relaxed">
              Exclusive benefit for students of <span className="text-gray-900 font-bold underline decoration-blue-500/30 underline-offset-2">{schoolName}</span>. Get full access to all mock tests and materials.
            </p>

            <div className="flex flex-wrap justify-center sm:justify-start gap-2.5 text-[11px] font-bold text-gray-600 pt-0.5">
              <div className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-emerald-500" /> Full Syllabus</div>
              <div className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-emerald-500" /> Expert Analysis</div>
            </div>
          </div>

          {/* Compact Price Card */}
          <div className="shrink-0 bg-slate-50/90 p-3 sm:p-3.5 rounded-xl border border-slate-100 text-center min-w-[170px] sm:min-w-[190px] relative shadow-xs">
            <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-[8px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-tight shadow-2xs whitespace-nowrap">
              School Discount Applied
            </div>

            <div className="space-y-0.5 mt-1">
              <div className="relative inline-block">
                {/* STRIKE-THROUGH PRICE */}
                <span className="text-sm sm:text-base font-black text-gray-400 opacity-60 tracking-tight">
                  ₹1000
                </span>
                {/* THE RED BOLD LINE */}
                <div className="absolute top-1/2 left-0 w-full h-[2px] bg-red-500 -rotate-12 rounded-full"></div>
              </div>

              <div className="flex flex-col items-center">
                <span className="text-2xl sm:text-3xl font-black text-blue-600 tracking-tight leading-none">
                  FREE
                </span>
                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">For your lifetime</span>
              </div>
            </div>

            <Link
              href="/exams/cuet"
              className="mt-2.5 w-full bg-gray-900 hover:bg-blue-600 text-white font-bold py-1.5 sm:py-2 px-3 rounded-lg transition-all duration-200 shadow-xs flex items-center justify-center gap-1.5 group active:scale-95 text-center text-xs"
            >
              <span>Get Started Now</span>
              <Gift className="w-3 h-3 group-hover:rotate-12 transition-transform" />
            </Link>
          </div>

        </div>
      </div>
    </section>
  );
}
import { BookOpen, MonitorPlay, BarChart3, Award, ArrowRight } from "lucide-react";

export default function Steps() {
  const steps = [
    {
      step: "01",
      title: "Choose Your Exam",
      desc: "Select the entrance exam you're preparing for.",
      gradient: "from-blue-600 to-cyan-500",
      iconBg: "bg-blue-50 text-blue-600 border-blue-200",
      numBg: "bg-blue-600 text-white shadow-blue-500/30",
      icon: BookOpen
    },
    {
      step: "02",
      title: "Take Mock Test",
      desc: "Attempt tests in a real exam-like environment.",
      gradient: "from-amber-500 to-orange-500",
      iconBg: "bg-orange-50 text-orange-600 border-orange-200",
      numBg: "bg-orange-500 text-white shadow-orange-500/30",
      icon: MonitorPlay
    },
    {
      step: "03",
      title: "Get Instant Results",
      desc: "View score, accuracy, time taken & percentile.",
      gradient: "from-purple-600 to-indigo-600",
      iconBg: "bg-purple-50 text-purple-600 border-purple-200",
      numBg: "bg-purple-600 text-white shadow-purple-500/30",
      icon: BarChart3
    },
    {
      step: "04",
      title: "Rank Predictor",
      desc: "Know your expected rank and eligible colleges.",
      gradient: "from-emerald-500 to-teal-600",
      iconBg: "bg-teal-50 text-teal-600 border-teal-200",
      numBg: "bg-teal-500 text-white shadow-teal-500/30",
      icon: Award
    }
  ];

  return (
    <section className="py-12 sm:py-16 px-4 sm:px-6 bg-slate-50/70 border-b border-gray-100 relative">
      <div className="container mx-auto">

        {/* Section Header */}
        <div className="text-center mb-10 sm:mb-14 max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-black text-gray-950 tracking-tight">
            How You Practice on <span className="text-blue-600">Test Explorer</span>
          </h2>
          <p className="text-sm text-gray-500 font-medium mt-1.5">
            A simple and effective process to help you achieve your goals.
          </p>
        </div>

        {/* Horizontal Timeline Process */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {steps.map((item, i) => {
            const IconComp = item.icon;
            const isLast = i === steps.length - 1;

            return (
              <div
                key={i}
                className="relative bg-white rounded-3xl p-6 border border-gray-200/80 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group"
              >
                {/* Connecting Arrow for Desktop (between cards) */}
                {!isLast && (
                  <div className="hidden lg:flex absolute -right-3.5 top-1/2 -translate-y-1/2 z-20 w-7 h-7 rounded-full bg-white border border-gray-200 text-gray-400 items-center justify-center shadow-xs">
                    <ArrowRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                  </div>
                )}

                <div>
                  {/* Step Header: Circle Number + Icon */}
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-sm shadow-md ${item.numBg}`}>
                      {item.step}
                    </div>
                    <div className={`w-11 h-11 rounded-2xl border flex items-center justify-center ${item.iconBg} group-hover:scale-110 transition-transform`}>
                      <IconComp className="w-5 h-5" />
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-base sm:text-lg font-bold text-gray-950 mb-2 tracking-tight group-hover:text-blue-600 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500 font-medium leading-relaxed">
                    {item.desc}
                  </p>
                </div>

                {/* Bottom decorative bar */}
                <div className="mt-5 pt-3 border-t border-gray-100 flex items-center gap-1.5">
                  <div className={`h-1 rounded-full bg-gradient-to-r ${item.gradient} w-8 group-hover:w-full transition-all duration-300`} />
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
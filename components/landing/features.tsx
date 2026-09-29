import { Layers, Monitor, BarChart3, Trophy } from "lucide-react";

const features = [
  {
    icon: Layers,
    title: "Multiple Exam Categories",
    desc: "From CUET to JEE, access structured content for every major entrance exam in one place.",
    gradient: "from-blue-600 to-cyan-500",
    iconBg: "bg-blue-50 text-blue-600 border-blue-200/60",
  },
  {
    icon: Monitor,
    title: "Real Exam Interface",
    desc: "Familiarize yourself with the actual NTA exam environment to boost confidence and speed.",
    gradient: "from-orange-500 to-amber-500",
    iconBg: "bg-orange-50 text-orange-600 border-orange-200/60",
  },
  {
    icon: BarChart3,
    title: "Detailed Analysis",
    desc: "Go beyond scores. Track accuracy, time-spent, and weak areas with our smart analytics.",
    gradient: "from-teal-500 to-emerald-500",
    iconBg: "bg-teal-50 text-teal-600 border-teal-200/60",
  },
  {
    icon: Trophy,
    title: "All India Rank",
    desc: "Compete with thousands of students and gauge your true potential before the big day.",
    gradient: "from-amber-500 to-yellow-500",
    iconBg: "bg-amber-50 text-amber-600 border-amber-200/60",
  },
];

export default function Features() {
  return (
    <section id="features" className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 bg-white relative">
      <div className="container mx-auto">
        <div className="text-center mb-10 sm:mb-14 max-w-2xl mx-auto">
          <div className="inline-flex items-center text-blue-600 text-xs font-bold uppercase tracking-wider mb-2">
            <span>Built For Exam Aspirants</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-950 tracking-tight">
            Why students <span className="text-blue-600">love us</span>
          </h2>
          <p className="text-sm text-gray-500 font-medium mt-2">
            We don't just give you questions. We give you a roadmap to success.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => {
            const IconComp = f.icon;
            return (
              <div 
                key={i} 
                className="p-7 rounded-3xl border border-gray-200/80 bg-white hover:border-gray-300 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className={`w-13 h-13 rounded-2xl border ${f.iconBg} flex items-center justify-center mb-6 shadow-2xs group-hover:scale-110 transition-transform`}>
                    <IconComp className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-950 mb-2.5 tracking-tight group-hover:text-blue-600 transition-colors">
                    {f.title}
                  </h3>
                  <p className="text-gray-500 leading-relaxed text-xs sm:text-sm font-medium">
                    {f.desc}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100 flex items-center">
                  <div className={`h-1 w-6 rounded-full bg-linear-to-r ${f.gradient} group-hover:w-16 transition-all duration-300`} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
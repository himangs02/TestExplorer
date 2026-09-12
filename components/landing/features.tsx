import { Globe, Monitor, BarChart3, Trophy } from "lucide-react";

const features = [
  {
    icon: <Globe className="w-6 h-6" />,
    title: "Multiple Exam Categories",
    desc: "From CUET to JEE, access structured content for every major entrance exam in one place.",
    color: "bg-blue-100 text-blue-700",
  },
  {
    icon: <Monitor className="w-6 h-6" />,
    title: "Real Exam Interface",
    desc: "Familiarize yourself with the actual NTA exam environment to boost confidence and speed.",
    color: "bg-orange-100 text-orange-700",
  },
  {
    icon: <BarChart3 className="w-6 h-6" />,
    title: "Detailed Analysis",
    desc: "Go beyond scores. Track accuracy, time-spent, and weak areas with our smart analytics.",
    color: "bg-teal-100 text-teal-700",
  },
  {
    icon: <Trophy className="w-6 h-6" />,
    title: "All India Rank",
    desc: "Compete with thousands of students and gauge your true potential before the big day.",
    color: "bg-purple-100 text-purple-700",
  },
];

export default function Features() {
  return (
    <section className="pt-14 md:pt-20 pb-8 md:pb-10 px-4 bg-white">
      <div className="container mx-auto">
        <div className="text-center mb-8 max-w-2xl mx-auto">
          <h2 className="text-lg sm:text-xl md:text-2xl font-black text-gray-900 mb-1.5 tracking-tight">
            Why students <span className="text-blue-600">love us</span>
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 font-medium">
            We don't just give you questions. We give you a roadmap to success.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <div key={i} className="p-7 rounded-3xl border border-gray-100 bg-white hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className={`w-11 h-11 rounded-2xl ${f.color} flex items-center justify-center mb-5`}>
                {f.icon}
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{f.title}</h3>
              <p className="text-gray-500 leading-relaxed text-xs sm:text-sm font-medium">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
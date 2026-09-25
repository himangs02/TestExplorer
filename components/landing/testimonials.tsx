'use client'
import styles from "./marquee.module.css";

// Helper function to handle Google Drive links
const getValidImageUrl = (url: string) => {
  if (!url) return '';
  if (!url.includes('drive.google.com')) return url;

  // Extract File ID from various Drive URL formats
  const fileId = url.match(/\/d\/([^/]+)/)?.[1] || url.match(/id=([^&]+)/)?.[1];

  // The most reliable proxy URL format
  return fileId ? `https://lh3.googleusercontent.com/d/${fileId}` : url;
};

export default function Testimonials({ data }: { data?: any[] }) {
  const defaultTestimonials = [
    {
      name: "Varun S",
      role: "Student, APS Warangal",
      text: "The platform offered by Test Explorer is precisely mapped with CUET conducted by NTA.",
      gradient: "from-blue-600 to-violet-600",
      image: "/testimonials/varun.jpg"
    },
    {
      name: "S.K Malhotra",
      role: "SKM Classes (Owner)",
      text: "I have been running my coaching centre successfully for more than 2 decades.",
      gradient: "from-orange-400 to-red-500",
      image: "/testimonials/sk_malhotra.jpg",
    },
    {
      name: "Manish Kumar",
      role: "Student, DPS Patna",
      text: "I solved MCQs on the platform for hardly one month but in a consistent manner.",
      gradient: "from-emerald-400 to-teal-600",
      image: "/testimonials/manish.jpg"
    },
    {
      name: "Priya Sharma",
      role: "Student, KV Delhi",
      text: "The analytics helped me find my weak areas in Physics instantly.",
      gradient: "from-pink-500 to-rose-500",
      image: "/testimonials/priya.jpg"
    }
  ];

  const fallbackAvatars = [
    "/testimonials/varun.jpg",
    "/testimonials/sk_malhotra.jpg",
    "/testimonials/manish.jpg",
    "/testimonials/priya.jpg"
  ];

  const testimonialsToShow = data && data.length > 0
    ? data.map((t, index) => ({
      name: t.student_name,
      role: t.course_name,
      text: t.message,
      image: getValidImageUrl(t.student_image) || fallbackAvatars[index % fallbackAvatars.length],
      gradient: index % 3 === 0 ? "from-blue-600 to-violet-600" :
        index % 3 === 1 ? "from-orange-400 to-red-500" :
          "from-emerald-400 to-teal-600"
    }))
    : defaultTestimonials;

  // LOGIC: Only scroll if we have more than 3 testimonials
  const shouldScroll = testimonialsToShow.length > 3;
  const scrollList = shouldScroll ? [...testimonialsToShow, ...testimonialsToShow] : testimonialsToShow;

  return (
    <section className="py-8 sm:py-10 md:py-12 bg-white overflow-hidden">
      <div className="container mx-auto px-4 mb-6 sm:mb-8 text-center">
        <span className="bg-black text-white px-3.5 py-0.5 rounded-full text-[11px] sm:text-xs font-bold uppercase tracking-wider">
          Testimonials
        </span>
        <h2 className="text-xl sm:text-2xl md:text-3xl font-black mt-2 tracking-tight">
          Don't just take our word for it.
        </h2>
      </div>

      <div className="relative w-full overflow-hidden">
        {/* Only show side fade gradients if scrolling */}
        {shouldScroll && (
          <>
            <div className="absolute top-0 bottom-0 left-0 w-32 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
            <div className="absolute top-0 bottom-0 right-0 w-32 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
          </>
        )}

        {/* If shouldScroll is true, we use the track animation class. 
            Otherwise, we use a simple flexbox with centering. */}
        <div className={shouldScroll ? styles.track : "flex flex-wrap justify-center gap-8 px-4"}>
          {scrollList.map((t, i) => (
            <div
              key={i}
              className={`
                relative shrink-0 w-[330px] md:w-[380px] h-[320px] rounded-[2rem] p-7 text-white 
                bg-gradient-to-br ${t.gradient} shadow-xl 
                hover:scale-[1.02] transition-transform duration-300 flex flex-col justify-between
              `}
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-full border-4 border-white/30 mb-3 overflow-hidden bg-white/10 flex items-center justify-center shrink-0">
                  <img
                    src={t.image}
                    alt={t.name || 'Student'}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y";
                    }}
                  />
                </div>

                <h3 className="text-lg font-bold mb-0.5">{t.name}</h3>
                <p className="text-[9px] font-bold uppercase tracking-wider mb-4 opacity-80 bg-black/10 px-2.5 py-0.5 rounded-full">
                  {t.role}
                </p>

                <p className="text-xs sm:text-sm font-medium leading-relaxed opacity-95 line-clamp-4">
                  "{t.text}"
                </p>
              </div>

              <div className="flex justify-center mt-3">
                <div className="w-10 h-1 bg-white/30 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
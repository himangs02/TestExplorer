"use client";
import { useState } from "react";
import { Plus, Minus, HelpCircle } from "lucide-react";

export const faqs = [
  { 
    q: "How does the Test Explorer Rank & College Predictor 2027 actually work, and is that rank official?", 
    a: "No. It is not an NTA, JoSAA, or MCC rank. The predictor takes the marks, percentile, or rank you enter and compares them with multi-year verified cutoffs across 1,500+ premier colleges. It then estimates a 2027 rank range, admission chances, and a list of colleges you may be eligible for. JEE-style results are mapped through JoSAA logic; NEET-style results through MCC logic. The output depends on three things: the score you typed, historical cutoff bands, and the category or quota you selected. Treat it as a planning tool, not a seat letter. First build a realistic score range from full-length mocks, put that range into the predictor, then use the Preference Optimizer to think about college order. Read a band of colleges, not a single guaranteed campus." 
  },
  { 
    q: "Can I prepare for JEE, NEET, CUET, and CLAT from one account, or do I need separate signups?", 
    a: "The platform supports five major exams: JEE Main, JEE Advanced, NEET UG, CUET UG, and CLAT UG. You choose an exam card on the home page and start a mock in that stream, so one login can cover more than one exam. The paper pattern, timer, marking scheme, and college map are different for each exam. Do not apply the CUET three-section MCQ pattern to JEE Advanced or NEET. The clean way to use it: pick one primary exam, finish its mocks and analytics, and run the predictor on that exam's counselling system only. If you add a second exam, start a separate mock stream and keep the weak-area data apart. School and coaching batches should also be grouped exam-wise, or the All India Rank comparison becomes meaningless." 
  },
  { 
    q: "What does “real exam interface” mean? Does the timer, navigation, and marking feel like the NTA paper?", 
    a: "It does not mean the screen is a pixel copy of the official NTA portal. It means you practise under exam conditions: a timed paper, a clear section flow, and instant results after submit — score, accuracy, time taken, and percentile. Most marks are lost by students who only solve untimed PDFs at home and then freeze when speed and negative marking show up in the hall. A Test Explorer mock is useful only if you sit it in one sitting, at a fixed time of day, the way you will sit the real paper. Ten random questions will not give you a percentile you can trust." 
  },
  { 
    q: "How do the AI-driven analytics find weak areas, and what should I do after I see them?", 
    a: "The analytics are not only a count of wrong answers. They read accuracy, time spent, and topic mix together. A Physics chapter can show a high score and a high time cost at once — the concept is there, the speed is not. That is the loop students mention in the testimonials: consistent MCQs, then an instant weak-area read. Use it in four steps. Take a full mock. Write down three weak topics from time and accuracy, not from memory. Spend the next three days only on that bucket. Take a fresh full mock after a week and check whether both accuracy and time moved. If you keep adding mocks and skip the analysis, your attempt count rises and your rank does not." 
  },
  { 
    q: "What does All India Rank on this platform measure? Will it get me a seat in 2027 counselling?", 
    a: "The All India Rank here is your standing among Test Explorer's active test-takers. It is not the official JEE or NEET AIR. It is useful as a weekly benchmark, especially when a school or coaching network of 100+ institutions is on the same mock. It is risky if you treat it as a counselling number. The platform population is smaller than the official NTA population and can be biased. Use platform AIR to ask “am I improving against this cohort?” Use the Rank & College Predictor 2027 to ask “historically, which colleges close around this score?” Never enter the platform AIR into a JoSAA or MCC form." 
  },
  { 
    q: "Where do the “multi-year verified cutoffs” come from, and how much should I trust them for 2027?", 
    a: "The site ties those cutoffs to JoSAA and MCC counselling systems and to 1,500+ premier colleges. The model is built on previous cycles' closing ranks and marks bands. It cannot see 2027 paper difficulty, applicant volume, or seat-matrix changes in advance. The predictor is trustworthy when you read it as ranges: safe, target, and stretch colleges. It is weak when you read one campus as guaranteed. Category, state quota, home state, and NIT–IIIT–GFTI differences are finer on the official portals than on any predictor screen. Take the number you get, check it against the last two or three official opening–closing lists, then let the Preference Optimizer help you order the list." 
  },
  { 
    q: "How is the Preference Optimizer different from official choice filling, and when should I use it?", 
    a: "Official JoSAA, MCC, or CUET choice filling is the legal process that allots a seat. The Preference Optimizer is only a planning layer. It helps you put colleges in a sensible order around your predicted score so you do not submit a list of dream campuses with no mid-tier safety options. Use it when three things are true: your last two or three full mocks have a stable average, your category and quota are selected correctly, and you are willing to keep a mix of stretch, target, and safe options. Do not use it after a single mock, and do not copy it into the official portal in the last hour without reading opening–closing ranks. The final lock always happens on the official portal." 
  },
  { 
    q: "How do I start with free practice, and what should the first week look like?", 
    a: "Use Start Practicing Free, pick an exam card — NEET-UG, Engineering, CLAT, or CUET — take a mock, read the result, then open the predictor. A useful first week: Day 1 is a diagnostic full mock with no shortcuts. Day 2 is analysis only, three weak topics written down. Days 3 to 5 are short practice blocks on those topics. Day 6 is a second full mock in the same exam. Day 7 is the predictor using the average of both mocks. Do not freeze a college list that week. Coaching batches should put the whole group on the same mock window so AIR and analytics are comparable. Plan limits after login are not published on the public homepage, so confirm what “unlimited” covers inside the account instead of assuming every feature stays free forever." 
  },
  { 
    q: "Is Test Explorer only for self-study students, or can a school or coaching centre run it as a batch tool?", 
    a: "Both. A student uses mocks, analytics, the community, and the predictor. An institute uses the same stack for consistency: the site claims trust from 100+ schools, and coaching testimonials talk about NTA-style mapping and regular practice. A centre gets value only when the batch shares one exam stream, one mock calendar, and one review huddle. If every student sits a different paper, AIR stops meaning anything. A self-study student has to supply the discipline: at least one full-length paper a week, and no next mock until the last analysis is done. A centre can add a teaching layer on top — reteach the weak chapter, run a counselling workshop with the predictor, and use the Preference Optimizer as a rehearsal, never as a replacement for the official form." 
  },
  { 
    q: "Should I enter marks, percentile, or rank into the predictor? What breaks if category or quota is wrong?", 
    a: "Enter the most official-like number you actually have. During mock season, raw marks plus accuracy are the honest starting point, because any percentile is still platform-only. After an official mock or NTA percentile is out, percentile becomes useful, especially for JEE Main, where rank conversion moves every year. Enter a rank only after the authority rank exists — that is when the predictor should shift from “where might I land?” to “which list is safe?” If category, gender, state quota, PwD, or All-India versus home-state is wrong, the college list can look impressive and still be useless. NEET splits AIQ and state counselling. JEE splits JoSAA and CSAB. The 2027 predictor is only as good as the same ticks you will use on the official form." 
  }
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 bg-white border-t border-gray-100">
      <div className="w-full max-w-4xl mx-auto">
        
        {/* Section Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-1.5 text-blue-600 text-xs font-bold uppercase tracking-wider mb-2">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Got Questions?</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-gray-950 tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-sm text-gray-500 font-medium mt-1.5 max-w-xl mx-auto">
            Everything you need to know about Test Explorer and entrance exam preparations.
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-3.5">
          {faqs.map((item, i) => {
            const isOpen = openIndex === i;
            return (
              <div 
                key={i}
                className={`overflow-hidden rounded-2xl border transition-all duration-300 ${
                  isOpen 
                    ? "border-blue-200 bg-blue-50/20 shadow-sm" 
                    : "border-gray-200/90 bg-white hover:border-gray-300"
                }`}
              >
                <button
                  type="button"
                  suppressHydrationWarning
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left transition-all cursor-pointer gap-4"
                >
                  <span className={`font-bold text-sm sm:text-base leading-snug ${isOpen ? "text-blue-700" : "text-gray-900"}`}>
                    {item.q}
                  </span>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                    isOpen ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600"
                  }`}>
                    {isOpen ? (
                      <Minus className="w-4 h-4" />
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                  </div>
                </button>
                
                <div 
                  className={`px-5 overflow-hidden transition-all duration-300 ease-in-out ${
                    isOpen ? "max-h-[800px] pb-5 opacity-100" : "max-h-0 pb-0 opacity-0"
                  }`}
                >
                  <p className="text-xs sm:text-sm text-gray-600 font-medium leading-relaxed border-t border-blue-100/60 pt-3.5">
                    {item.a}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}

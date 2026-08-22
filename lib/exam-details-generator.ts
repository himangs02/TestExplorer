export function generateExamDetails(courseTitle: string, slug: string, subjectNames: string[] = []) {
  const normTitle = courseTitle.toLowerCase()
  const year = new Date().getFullYear() + 1

  // Determine Exam Category Presets
  const isNeet = normTitle.includes('neet')
  const isClat = normTitle.includes('clat') || normTitle.includes('law')
  const isCuet = normTitle.includes('cuet')
  const isJee = normTitle.includes('jee') || normTitle.includes('advance') || normTitle.includes('iit')
  const isGate = normTitle.includes('gate')
  const isCat = normTitle.includes('cat') || normTitle.includes('mba')

  let examFullName = courseTitle
  let conductingBody = 'National Testing Agency (NTA)'
  let officialWebsite = 'exams.nta.ac.in'
  let examLevel = 'National Level Entrance Examination'
  let examDuration = '180 Minutes (3 Hours)'
  let totalMarks = '300 Marks'
  let mode = 'Computer Based Test (CBT)'
  let coursesOffered = 'Undergraduate Degree Programmes'
  let targetColleges = 'Leading Central & State Universities'

  if (isNeet) {
    examFullName = 'National Eligibility cum Entrance Test (UG)'
    conductingBody = 'National Testing Agency (NTA)'
    officialWebsite = 'neet.nta.nic.in'
    examDuration = '200 Minutes (3 Hours 20 Mins)'
    totalMarks = '720 Marks'
    mode = 'Pen & Paper Mode (OMR Based)'
    coursesOffered = 'MBBS, BDS, BAMS, BHMS, BSMS, BUMS & BSc Nursing'
    targetColleges = 'AIIMS, JIPMER, Central & State Govt Medical Colleges'
  } else if (isClat) {
    examFullName = 'Common Law Admission Test (CLAT)'
    conductingBody = 'Consortium of National Law Universities (NLUs)'
    officialWebsite = 'consortiumofnlus.ac.in'
    examDuration = '120 Minutes (2 Hours)'
    totalMarks = '120 Marks'
    mode = 'Offline (Pen and Paper)'
    coursesOffered = '5-Year Integrated BA/BBA LLB & LLM Programmes'
    targetColleges = '24+ National Law Universities (NLSIU, NALSAR, WBNUJS, etc.)'
  } else if (isCuet) {
    examFullName = 'Common University Entrance Test (CUET UG)'
    conductingBody = 'National Testing Agency (NTA)'
    officialWebsite = 'cuetug.ntaonline.in'
    examDuration = '45 to 60 Minutes per Subject'
    totalMarks = 'Varies per Subject (200-250 Marks)'
    mode = 'Hybrid Mode (CBT & Pen-Paper)'
    coursesOffered = 'BA, BSc, BCom, BVoc, Integrated Programmes'
    targetColleges = 'DU, BHU, JNU, JMI, AMU & 250+ Universities'
  } else if (isJee) {
    examFullName = normTitle.includes('advance') 
      ? 'Joint Entrance Examination (Advanced)' 
      : 'Joint Entrance Examination (Main)'
    conductingBody = normTitle.includes('advance') ? 'IITs (Organizing IIT)' : 'National Testing Agency (NTA)'
    officialWebsite = normTitle.includes('advance') ? 'jeeadv.ac.in' : 'jeemain.nta.nic.in'
    examDuration = '180 Minutes (3 Hours)'
    totalMarks = '300 Marks'
    mode = 'Computer Based Test (CBT)'
    coursesOffered = 'B.Tech, B.E., B.Arch, B.Planning'
    targetColleges = normTitle.includes('advance') ? '23 IITs' : '31 NITs, 26 IIITs, 38 GFTIs'
  }

  const defaultSubjects = subjectNames.length > 0 ? subjectNames : (
    isNeet ? ['Physics', 'Chemistry', 'Biology (Botany & Zoology)'] :
    isClat ? ['Legal Reasoning', 'English Language', 'Current Affairs & GK', 'Logical Reasoning', 'Quantitative Techniques'] :
    isCuet ? ['Language (English / Hindi)', 'Domain Specific Subjects', 'General Aptitude Test'] :
    isJee ? ['Physics', 'Chemistry', 'Mathematics'] :
    ['General Awareness', 'Reasoning & Aptitude', 'Core Subjects']
  )

  const tagline = `${examFullName} ${year}`
  const description = `${examFullName} (${courseTitle}) is India's premier ${examLevel.toLowerCase()} conducted annually by ${conductingBody} for admission into ${coursesOffered} across top-tier institutions including ${targetColleges}.

Over hundreds of thousands of aspirants appear every year. The examination evaluates conceptual understanding, application-based problem solving, and time management. TestExplorer provides comprehensive chapter-wise practice, full-length mock tests, performance analytics, and predictive score reports tailored specifically to ${courseTitle} patterns.`

  const tableOfContents = [
    `${courseTitle} Highlights`,
    `What's New in ${courseTitle}?`,
    `${courseTitle} Important Dates`,
    'Eligibility Criteria',
    'Application Process & Fees',
    'Exam Pattern & Marking Scheme',
    'Syllabus & Core Subjects',
    'Preparation Tips & Strategy',
    'Admit Card Guidelines',
    'Answer Key & Results',
    'Cutoff Trends',
    'Counselling & Admissions'
  ]

  const highlights = [
    { label: 'Exam Name', value: examFullName },
    { label: 'Short Name', value: courseTitle },
    { label: 'Conducting Body', value: conductingBody },
    { label: 'Exam Level', value: examLevel },
    { label: 'Exam Frequency', value: 'Annual (Once / Twice a Year)' },
    { label: 'Exam Mode', value: mode },
    { label: 'Total Duration', value: examDuration },
    { label: 'Total Marks', value: totalMarks },
    { label: 'Marking Scheme', value: '+4 for correct, -1 for incorrect, 0 for unattempted' },
    { label: 'Official Website', value: officialWebsite },
    { label: 'Helpdesk Email / Phone', value: `support@${officialWebsite} • 011-40759000` }
  ]

  const importantDates = [
    { event: `${courseTitle} Notification Release`, date: `November ${year - 1}` },
    { event: 'Online Application Window Opens', date: `December ${year - 1}` },
    { event: 'Last Date for Application Submission', date: `January - February ${year}` },
    { event: 'Application Correction Window', date: `February ${year}` },
    { event: 'Advance City Intimation Slip', date: `10 Days Before Exam` },
    { event: 'Admit Card Download Starts', date: `3-4 Days Before Exam` },
    { event: `${courseTitle} Examination Date`, date: `April - May ${year}` },
    { event: 'Provisional Answer Key Release', date: `1 Week After Exam` },
    { event: `${courseTitle} Final Result & Rank List`, date: `June ${year}` },
    { event: 'Counselling & Seat Allotment', date: `July - August ${year}` }
  ]

  const eligibility = {
    title: `${courseTitle} Eligibility Criteria`,
    intro: `Candidates must satisfy the following fundamental eligibility requirements prescribed by ${conductingBody} before applying:`,
    components: [
      {
        label: 'Qualifying Examination',
        text: 'Candidates must have passed or be appearing in Class 12th or equivalent examination from a recognized central/state board.'
      },
      {
        label: 'Subject Requirements',
        text: `Mandatory subjects required: ${defaultSubjects.join(', ')}.`
      },
      {
        label: 'Minimum Percentage',
        text: 'General/OBC candidates require a minimum of 50-60% aggregate in qualifying subjects (40-45% for SC/ST/PwD categories).'
      },
      {
        label: 'Age Limit',
        text: 'No upper age limit for most national entrance examinations, unless specifically restricted by council regulations.'
      },
      {
        label: 'Nationality',
        text: 'Indian Citizens, Non-Resident Indians (NRIs), Overseas Citizens of India (OCI), and Foreign Nationals are eligible.'
      }
    ],
    outro: 'Detailed category-wise reservations follow Government of India guidelines (15% SC, 7.5% ST, 27% OBC-NCL, 10% EWS, 5% PwD).'
  }

  const applicationProcess = {
    intro: `Applications for ${courseTitle} must be submitted exclusively online via the official portal (${officialWebsite}).`,
    steps_title: 'Step-by-Step Application Procedure',
    steps_intro: 'Follow these 4 simple steps to complete your registration:',
    steps: [
      'Step 1 (Online Registration): Register with Name, Email ID, Mobile Number and generate Application Number and Password.',
      'Step 2 (Fill Application Form): Enter Personal Details, Educational Qualifications, Exam City Preferences, and Category.',
      'Step 3 (Document Upload): Upload clear scanned passport photograph, signature, and category certificates in JPG/PDF format.',
      'Step 4 (Fee Payment): Pay the examination application fee securely through Net Banking, UPI, Credit/Debit Card.'
    ],
    documents_title: 'Required Documents for Application',
    documents_intro: 'Keep scanned digital copies ready before starting registration:',
    documents_list: [
      'Recent Passport Photograph (10 KB to 200 KB, white background)',
      'Candidate Signature (4 KB to 30 KB, black/blue ink on white paper)',
      'Class 10th Certificate / Marksheet (for Date of Birth verification)',
      'Category / Caste Certificate (EWS, OBC-NCL, SC, ST if applicable)',
      'Valid Government Photo ID (Aadhaar Card, Passport, Voter ID)'
    ],
    document_specs_title: 'Digital Upload Specifications',
    document_specs: [
      { name: 'Passport Size Photograph', type: 'JPG / JPEG', size: '10 KB – 200 KB' },
      { name: 'Signature', type: 'JPG / JPEG', size: '4 KB – 30 KB' },
      { name: 'Category Certificate', type: 'PDF', size: '50 KB – 300 KB' },
      { name: 'Class 10th Certificate', type: 'PDF', size: '50 KB – 300 KB' }
    ],
    fee_title: `${courseTitle} Application Fee Structure`,
    fee_intro: 'Application fees vary by candidate category:',
    correction_window: {
      intro: `${conductingBody} provides a one-time correction facility after the registration closes.`,
      dates: `Active for 3-5 days in February ${year}`,
      steps_title: 'How to Edit Application Form',
      steps: [
        'Visit the official website and click on Candidate Login.',
        'Enter Application Number, Password, and Security PIN.',
        'Click on "Correction in Application Form" tab.',
        'Review and update permissible fields (Exam City, Category, Academic Details).',
        'Save changes, pay additional balance fee if category changes, and download the revised Confirmation Page.'
      ],
      fields_intro: 'Editable and Non-Editable Fields:',
      editable_any_one: {
        title: 'Fields Allowed to Change (Any One):',
        fields: ["Candidate's Father Name", "Candidate's Mother Name", 'Photograph / Signature Re-upload']
      },
      editable_all: {
        title: 'Fields Allowed to Correct (All):',
        fields: ['Class 10 & 12 Academic Details', 'Category / Sub-category', 'Exam City Choices', 'Medium of Question Paper']
      }
    }
  }

  const applicationFee = [
    { category: 'General / Unreserved', fee: '₹ 1,000 – ₹ 1,700', extra_subject: '₹ 500' },
    { category: 'Gen-EWS / OBC-NCL', fee: '₹ 900 – ₹ 1,600', extra_subject: '₹ 450' },
    { category: 'SC / ST / PwD / Third Gender', fee: '₹ 500 – ₹ 1,000', extra_subject: '₹ 300' },
    { category: 'Outside India (International Centres)', fee: '₹ 3,000 – ₹ 6,000', extra_subject: '₹ 1,500' }
  ]

  const examPattern = {
    intro: `${courseTitle} follows a standardized objective format designed to assess speed, accuracy, and depth of knowledge.`,
    sections: defaultSubjects.map((sub, idx) => ({
      section: `Section ${String.fromCharCode(65 + idx)}: ${sub}`,
      questions: isNeet ? '45 Questions (180 Marks)' : isClat ? '24-30 Questions (24-30 Marks)' : '25-30 Questions',
      duration: '45-60 Mins per section'
    }))
  }

  const markingScheme = {
    intro: 'Standard marking scheme applied across all multiple-choice sections:',
    correct: '+4 Marks for each correct response',
    incorrect: '-1 Mark deducted for each incorrect response (Negative Marking)',
    unattempted: '0 Marks (No penalty for skipped questions)',
    rules: [
      'If more than one option is found to be correct and you marked any one, full marks are awarded.',
      'If all options are found to be correct, full marks are awarded to all who attempted.',
      'If a question is dropped due to technical error, full marks are awarded to all candidates.'
    ]
  }

  const syllabus = defaultSubjects.map(sub => ({
    subject: sub,
    topics: [
      'Fundamental Concepts & Core Principles',
      'High-Yield Theory & Analytical Problem Solving',
      'Previous 10 Years Question Patterns',
      'Advanced Applications & Practice Sets'
    ]
  }))

  const preparation = {
    intro: `Cracking ${courseTitle} with a top rank requires disciplined study, daily topic practice, and continuous mock test benchmarking.`,
    tips: [
      'Master the Core Syllabus: Focus 80% of your time on high-weightage topics and foundational NCERT / standard concepts.',
      'Daily Chapter-Wise Practice: Solve at least 30-50 practice questions per chapter to lock in formulas and concepts.',
      'Take Timed Mock Tests: Practice with real exam timers on TestExplorer to master time management and eliminate exam anxiety.',
      'Analyze Weak Areas: Review answer explanations and pinpoint conceptual gaps after every test attempt.',
      'Systematic Revision: Maintain a formula sheet and revision notes to review key summaries weekly.'
    ]
  }

  const admitCard = {
    intro: `The ${courseTitle} Admit Card is an essential identity document released online approximately 3-7 days before the exam date.`,
    download_title: `Steps to Download ${courseTitle} Admit Card:`,
    download_steps: [
      `Go to the official website: ${officialWebsite}.`,
      'Click on the link "Download Admit Card".',
      'Enter your Application Number, Date of Birth, and Security PIN.',
      'Review the printed details (Name, Roll Number, Exam Centre, Shift Timing).',
      'Download and print 2-3 clear color copies.'
    ],
    details_title: 'Details Mentioned on Admit Card:',
    details_list: [
      'Candidate Name, Roll Number & Application Number',
      'Father Name, Date of Birth & Category',
      'Exam Date, Shift Timing & Reporting Time',
      'Exam Centre Code and Full Address',
      'Passport Photograph and Signature',
      'Important Exam Day Instructions & COVID / Security Guidelines'
    ],
    correction_note: 'In case of any discrepancy in your name or photo, immediately contact the official helpline.'
  }

  const answerKey = {
    intro: `${conductingBody} publishes the Provisional Answer Key and candidate response sheets shortly after the exam.`,
    access_steps_title: 'How to Download Answer Key & OMR / Response Sheet:',
    access_steps: [
      `Visit the official website ${officialWebsite}.`,
      'Log in with your credentials.',
      'Click on "View Question Paper & Response Sheet".',
      'Download the answer key PDF and compare with your marked responses.'
    ],
    challenge_title: 'Answer Key Challenge Process:',
    challenge_fee: '₹ 200 per challenged question (non-refundable processing fee)',
    challenge_steps: [
      'Select the Question ID you wish to challenge.',
      'Upload valid supporting proof / textbook justification in PDF format.',
      'Pay the non-refundable processing fee online.',
      'The expert panel reviews challenges and releases the Final Answer Key.'
    ]
  }

  const results = {
    intro: `${courseTitle} Results and All India Ranks (AIR) will be declared on the official portal.`,
    check_steps_title: 'How to Check Scorecard & Rank:',
    check_steps: [
      `Visit ${officialWebsite} and click on "${courseTitle} Scorecard".`,
      'Enter Application Number, Date of Birth, and Security PIN.',
      'Your scorecard with Subject-wise Percentile, Total Score, and AIR Rank will be displayed.',
      'Download and save the PDF for counselling sessions.'
    ],
    details_printed_title: 'Information on Scorecard:',
    details_printed_intro: 'Ensure all details on your scorecard are accurate:',
    details_list: [
      'Candidate Details (Name, Roll Number, Category, Nationality)',
      'Total Marks Scored & Section-wise Marks',
      'All India Rank (AIR) & Category Rank',
      'Qualifying Cutoff Status for Counselling'
    ]
  }

  const cutoffs = {
    intro: `Cutoff scores for ${courseTitle} depend on exam difficulty, total applicants, and seat availability.`,
    factors_text: 'Key factors influencing cutoffs include total test-takers, seat matrix, and relative difficulty across shifts.',
    table_title: 'Estimated Qualifying Cutoff Percentile / Marks',
    data: [
      { college: 'Top Tier Institutions', programme: 'Core Degree', category: 'General (UR)', rank: 'Top 1% - 3%', score: '97+ Percentile' },
      { college: 'Premier Central Colleges', programme: 'Regular Degree', category: 'OBC-NCL', rank: 'Top 5% - 8%', score: '92+ Percentile' },
      { college: 'State Level Universities', programme: 'All Streams', category: 'SC / ST', rank: 'Top 15% - 20%', score: '80+ Percentile' },
      { college: 'Government Institutes', programme: 'Reserved Quota', category: 'EWS', rank: 'Top 6% - 10%', score: '90+ Percentile' }
    ]
  }

  const counselling = {
    intro: `Qualified candidates can register for centralized online counselling for seat allotment across participating universities.`,
    documents_title: 'Mandatory Documents Required for Counselling Verification:',
    documents_intro: 'Original documents and self-attested photocopies required:',
    documents_list: [
      `${courseTitle} Rank Card & Scorecard`,
      `${courseTitle} Admit Card`,
      'Class 10th & 12th Marksheets and Passing Certificates',
      'Category / Caste Certificate (if applicable)',
      'Character Certificate & Migration Certificate',
      'Valid Government Photo Identity Proof',
      'Passport Size Photographs (6-8 copies matching admit card)'
    ]
  }

  const participatingUniversities = {
    intro: `Top universities and premier colleges accept ${courseTitle} scores for admission:`,
    groups: [
      {
        type: 'Top National Institutions',
        names: isNeet 
          ? ['AIIMS New Delhi', 'JIPMER Puducherry', 'King George Medical University', 'VMMC New Delhi', 'Kasturba Medical College']
          : isClat 
          ? ['NLSIU Bangalore', 'NALSAR Hyderabad', 'WBNUJS Kolkata', 'NLU Delhi', 'NLIU Bhopal']
          : isCuet 
          ? ['University of Delhi (DU)', 'Banaras Hindu University (BHU)', 'Jawaharlal Nehru University (JNU)', 'Jamia Millia Islamia', 'Aligarh Muslim University']
          : isJee 
          ? ['IIT Bombay', 'IIT Delhi', 'IIT Madras', 'NIT Trichy', 'NIT Surathkal', 'IIIT Hyderabad']
          : ['Leading Central Universities', 'Top State Govt Colleges', 'Premier Autonomous Institutes']
      }
    ]
  }

  const faqs = [
    {
      question: `How many times can I attempt ${courseTitle}?`,
      answer: `Most national entrance exams allow candidates to attempt as long as they meet the qualifying eligibility and educational criteria.`
    },
    {
      question: `Is there negative marking in ${courseTitle}?`,
      answer: `Yes, standard marking is +4 for correct answers and -1 mark deducted for incorrect answers.`
    },
    {
      question: `How can I practice with authentic mock tests for ${courseTitle}?`,
      answer: `You can practice full chapter-wise tests and full-length simulated mock exams directly on TestExplorer with instant AI-driven analytics.`
    },
    {
      question: `Can I change my exam centre after admit card release?`,
      answer: `No, exam centre allotments once printed on the admit card are final and cannot be changed.`
    }
  ]

  const whatsNew = `For ${year}, the examination authority has introduced enhanced biometric verification at centres and standardized hybrid CBT modes to ensure transparency and security for all candidates across India.`

  return {
    tagline,
    description,
    table_of_contents: tableOfContents,
    tabs: {
      highlights_intro: `Essential details for ${courseTitle} ${year}:`,
      whats_new: whatsNew,
      highlights,
      important_dates_intro: `Key dates and deadlines for ${courseTitle} ${year} admissions:`,
      important_dates: importantDates,
      eligibility,
      application_fee: applicationFee,
      application_process: applicationProcess,
      documents: applicationProcess.document_specs,
      exam_pattern: examPattern,
      marking_scheme: markingScheme,
      syllabus_intro: `Official syllabus outline covering key subject domains:`,
      syllabus,
      participating_universities: participatingUniversities,
      preparation,
      admit_card: admitCard,
      answer_key: answerKey,
      results,
      cutoffs,
      counselling,
      faqs
    }
  }
}

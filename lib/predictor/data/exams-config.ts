import { ExamConfig, ExamId } from '../types';

export const EXAM_CONFIGS: Record<ExamId, ExamConfig> = {
  'jee-main': {
    id: 'jee-main',
    name: 'JEE Main',
    fullName: 'Joint Entrance Examination (Main)',
    year: 2027,
    maxMarks: 300,
    supportedInputModes: ['marks', 'percentile', 'rank'],
    description: 'Premier national exam for admission into NITs, IIITs, CFTIs, GFTIs, and eligibility for JEE Advanced.',
    counsellingBodies: ['JoSAA', 'CSAB'],
    collegeTypes: ['All', 'NIT', 'IIIT', 'GFTI', 'State College'],
    popularBranches: [
      'Computer Science and Engineering',
      'Artificial Intelligence & Data Science',
      'Electronics & Communication Engineering',
      'Electrical Engineering',
      'Mechanical Engineering',
      'Civil Engineering',
      'Chemical Engineering',
      'Information Technology',
      'Biotechnology'
    ],
    badgeColor: 'bg-blue-600 text-white',
    iconName: 'GraduationCap',
    hasHomeState: true,
    hasGenderPool: true,
    hasQuota: true,
    hasSubjectSelection: false,
    hasTargetUniversity: false,
    courses: ['B.Tech', 'B.E', 'B.Arch', 'Integrated M.Tech']
  },
  'jee-advanced': {
    id: 'jee-advanced',
    name: 'JEE Advanced',
    fullName: 'Joint Entrance Examination (Advanced)',
    year: 2027,
    maxMarks: 360,
    supportedInputModes: ['marks', 'rank'],
    description: 'Gateway to all 23 elite Indian Institutes of Technology (IITs) for undergraduate engineering programmes.',
    counsellingBodies: ['JoSAA'],
    collegeTypes: ['IIT'],
    popularBranches: [
      'Computer Science and Engineering',
      'Data Science and Artificial Intelligence',
      'Electrical Engineering',
      'Electronics & Electrical Communication',
      'Mechanical Engineering',
      'Aerospace Engineering',
      'Chemical Engineering',
      'Engineering Physics',
      'Civil Engineering'
    ],
    badgeColor: 'bg-indigo-600 text-white',
    iconName: 'Rocket',
    hasHomeState: false,
    hasGenderPool: true,
    hasQuota: false,
    hasSubjectSelection: false,
    hasTargetUniversity: false,
    courses: ['B.Tech', 'BS', 'Dual Degree (B.Tech + M.Tech)']
  },
  'neet': {
    id: 'neet',
    name: 'NEET UG',
    fullName: 'National Eligibility cum Entrance Test (UG)',
    year: 2027,
    maxMarks: 720,
    supportedInputModes: ['marks', 'percentile', 'rank'],
    description: 'Unified single-window entrance exam for admission to MBBS, BDS, and AYUSH programmes across India.',
    counsellingBodies: ['MCC', 'State Quota'],
    collegeTypes: ['All', 'AIIMS', 'Central University', 'Govt Medical', 'Deemed Medical'],
    popularBranches: [
      'MBBS (Bachelor of Medicine and Bachelor of Surgery)',
      'BDS (Bachelor of Dental Surgery)',
      'BAMS (Ayurveda)',
      'BHMS (Homeopathy)',
      'B.V.Sc & AH (Veterinary Science)'
    ],
    badgeColor: 'bg-emerald-600 text-white',
    iconName: 'Stethoscope',
    hasHomeState: true,
    hasGenderPool: false,
    hasQuota: true,
    hasSubjectSelection: false,
    hasTargetUniversity: false,
    courses: ['MBBS', 'BDS', 'BAMS', 'BHMS']
  },
  'cuet': {
    id: 'cuet',
    name: 'CUET UG',
    fullName: 'Common University Entrance Test (UG)',
    year: 2027,
    maxMarks: 800,
    supportedInputModes: ['marks', 'percentile', 'rank'],
    description: 'Centralized exam for admission to top Central & State Universities including Delhi University, BHU, JNU, and more.',
    counsellingBodies: ['DU CSAS', 'BHU Portal', 'University Counselling'],
    collegeTypes: ['Central University', 'State College'],
    popularBranches: [
      'B.Com (Hons)',
      'B.A. (Hons) Economics',
      'B.A. (Hons) English',
      'B.A. (Hons) Political Science',
      'B.Sc (Hons) Computer Science',
      'B.Sc (Hons) Mathematics',
      'B.Sc (Hons) Physics',
      'B.A. (Hons) Psychology'
    ],
    badgeColor: 'bg-purple-600 text-white',
    iconName: 'BookOpen',
    hasHomeState: false,
    hasGenderPool: false,
    hasQuota: false,
    hasSubjectSelection: true,
    hasTargetUniversity: true,
    courses: ['B.A. (Hons)', 'B.Com (Hons)', 'B.Sc (Hons)', 'BBA / BMS']
  },
  'clat': {
    id: 'clat',
    name: 'CLAT UG',
    fullName: 'Common Law Admission Test (UG)',
    year: 2027,
    maxMarks: 120,
    supportedInputModes: ['marks', 'percentile', 'rank'],
    description: 'National entrance test for admission to 26+ National Law Universities (NLUs) for 5-year integrated law courses.',
    counsellingBodies: ['Consortium of NLUs'],
    collegeTypes: ['NLU'],
    popularBranches: [
      'B.A. LL.B. (Hons)',
      'B.B.A. LL.B. (Hons)',
      'B.Sc. LL.B. (Hons)',
      'B.Com. LL.B. (Hons)'
    ],
    badgeColor: 'bg-amber-600 text-white',
    iconName: 'Scale',
    hasHomeState: true,
    hasGenderPool: false,
    hasQuota: true,
    hasSubjectSelection: false,
    hasTargetUniversity: false,
    courses: ['B.A. LL.B. (Hons)', 'B.B.A. LL.B. (Hons)']
  }
};

export const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan',
  'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh',
  'Uttarakhand', 'West Bengal', 'Chandigarh', 'Jammu & Kashmir', 'Ladakh'
];

export const CUET_UNIVERSITIES = [
  'University of Delhi (DU)',
  'Banaras Hindu University (BHU)',
  'Jawaharlal Nehru University (JNU)',
  'Jamia Millia Islamia (JMI)',
  'University of Allahabad',
  'Aligarh Muslim University (AMU)',
  'Babasaheb Bhimrao Ambedkar University',
  'Central University of Rajasthan',
  'Central University of Haryana',
  'Central University of Punjab'
];

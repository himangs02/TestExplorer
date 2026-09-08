export type ExamId = 'jee-main' | 'jee-advanced' | 'neet' | 'cuet' | 'clat';

export type InputMode = 'marks' | 'percentile' | 'rank';

export type Category = 'OPEN' | 'GEN-EWS' | 'OBC-NCL' | 'SC' | 'ST';

export type Gender = 'Gender-Neutral' | 'Female-only';

export type Quota = 'AI' | 'HS' | 'OS' | 'State' | 'All India';

export type AdmissionChance = 'HIGH' | 'MODERATE' | 'LOW' | 'AMBITIOUS';

export interface ExamConfig {
  id: ExamId;
  name: string;
  fullName: string;
  year: number;
  maxMarks: number;
  supportedInputModes: InputMode[];
  description: string;
  counsellingBodies: string[];
  collegeTypes: string[];
  popularBranches: string[];
  badgeColor: string;
  iconName: string;
  hasHomeState: boolean;
  hasGenderPool: boolean;
  hasQuota: boolean;
  hasSubjectSelection: boolean;
  hasTargetUniversity: boolean;
  courses: string[];
}

export interface ScoreRankPoint {
  score: number;
  percentile?: number;
  rank: number;
  candidateCount?: number;
}

export interface CutoffRecord {
  id: string;
  exam: ExamId;
  instituteId: string;
  instituteName: string;
  instituteType: 'IIT' | 'NIT' | 'IIIT' | 'GFTI' | 'AIIMS' | 'Govt Medical' | 'Deemed Medical' | 'Central University' | 'NLU' | 'State College';
  city: string;
  state: string;
  course: string;
  branch: string;
  counselling: 'JoSAA' | 'CSAB' | 'MCC' | 'State Quota' | 'DU CSAS' | 'BHU Portal' | 'University Counselling' | 'Consortium of NLUs' | string;
  category: Category;
  gender: Gender;
  quota: Quota;
  round: number;
  year: number;
  openingRank: number;
  closingRank: number;
  tuitionFeePerYear?: string;
  avgPackageLpa?: number;
  highestPackageLpa?: number;
  nirfRank?: number;
  source: string;
  lastUpdated: string;
}

export interface PredictionRequest {
  exam: ExamId;
  inputMode: InputMode;
  inputValue: number;
  category?: Category;
  gender?: Gender;
  isPwd?: boolean;
  homeState?: string;
  preferredBranch?: string;
  preferredCourse?: string;
  preferredCollegeType?: string;
  targetUniversity?: string;
  subjects?: string[];
  quota?: Quota;
}

export interface RankPredictionResult {
  estimatedRank: number;
  rankRange: { min: number; max: number };
  estimatedPercentile?: number;
  confidence: 'High' | 'Medium' | 'Moderate';
  interpretation: string;
  isOfficial: false;
  disclaimer: string;
}

export interface CollegePredictionItem {
  id: string;
  instituteId: string;
  instituteName: string;
  instituteType: string;
  city: string;
  state: string;
  course: string;
  branch: string;
  counselling: string;
  category: Category;
  gender: Gender;
  quota: Quota;
  previousClosingRank: number;
  closingRanksByYear: { [year: number]: number };
  candidateRank: number;
  chance: AdmissionChance;
  chancePercentage: number;
  tuitionFeePerYear?: string;
  avgPackageLpa?: number;
  highestPackageLpa?: number;
  nirfRank?: number;
  source: string;
  tier: 'Dream' | 'Target' | 'Safe';
}

export interface PredictionResponse {
  success: boolean;
  exam: ExamConfig;
  rankPrediction: RankPredictionResult;
  colleges: CollegePredictionItem[];
  totalColleges: number;
  summary: {
    highChanceCount: number;
    moderateChanceCount: number;
    lowChanceCount: number;
    ambitiousCount: number;
  };
  metadata: {
    datasetYear: number;
    totalHistoricalCutoffsAnalyzed: number;
  };
}

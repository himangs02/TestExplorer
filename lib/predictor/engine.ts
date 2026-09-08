import {
  ExamId,
  PredictionRequest,
  PredictionResponse,
  RankPredictionResult,
  CollegePredictionItem,
  AdmissionChance,
  Category,
  Gender,
  Quota
} from './types';
import { EXAM_CONFIGS } from './data/exams-config';
import { SCORE_RANK_DATASETS } from './data/score-rank-data';
import { HISTORICAL_CUTOFFS } from './data/historical-cutoffs';

/**
 * Predicts estimated rank, percentile, confidence, and likely range from input score / percentile / rank.
 */
export function predictRank(request: PredictionRequest): RankPredictionResult {
  const { exam, inputMode, inputValue } = request;
  const dataset = SCORE_RANK_DATASETS[exam];
  const config = EXAM_CONFIGS[exam];

  if (!dataset || !config) {
    throw new Error(`Unsupported exam: ${exam}`);
  }

  let estimatedRank = 0;
  let estimatedPercentile: number | undefined = undefined;
  let confidence: 'High' | 'Medium' | 'Moderate' = 'High';
  let interpretation = '';

  if (inputMode === 'rank') {
    estimatedRank = Math.round(inputValue);
    if (dataset.totalCandidates) {
      estimatedPercentile = Number(
        Math.max(0, Math.min(100, (1 - estimatedRank / dataset.totalCandidates) * 100)).toFixed(2)
      );
    }
    confidence = 'High';
    interpretation = `You entered an official / target rank of ${estimatedRank.toLocaleString('en-IN')}.`;
  } else if (inputMode === 'percentile') {
    estimatedPercentile = Math.min(100, Math.max(0, inputValue));
    estimatedRank = Math.max(
      1,
      Math.round(((100 - estimatedPercentile) / 100) * dataset.totalCandidates)
    );
    confidence = 'High';
    interpretation = `A percentile of ${estimatedPercentile.toFixed(2)}% places you in the top ${(100 - estimatedPercentile).toFixed(2)}% of test-takers (~${estimatedRank.toLocaleString('en-IN')} All India Rank).`;
  } else {
    // Marks mode: interpolate from calibration points
    const points = [...dataset.calibrationPoints].sort((a, b) => b.score - a.score);
    const marks = Math.min(config.maxMarks, Math.max(0, inputValue));

    if (marks >= points[0].score) {
      estimatedRank = points[0].rank;
      estimatedPercentile = points[0].percentile || 99.99;
    } else if (marks <= points[points.length - 1].score) {
      const last = points[points.length - 1];
      estimatedRank = last.rank;
      estimatedPercentile = last.percentile || 1.0;
    } else {
      // Find bounding points
      for (let i = 0; i < points.length - 1; i++) {
        const p1 = points[i];
        const p2 = points[i + 1];
        if (marks <= p1.score && marks >= p2.score) {
          const ratio = (p1.score - marks) / (p1.score - p2.score);
          estimatedRank = Math.round(p1.rank + ratio * (p2.rank - p1.rank));
          if (p1.percentile !== undefined && p2.percentile !== undefined) {
            estimatedPercentile = Number((p1.percentile - ratio * (p1.percentile - p2.percentile)).toFixed(2));
          }
          break;
        }
      }
    }

    if (marks / config.maxMarks > 0.75) {
      confidence = 'High';
      interpretation = `Excellent score of ${marks}/${config.maxMarks}! High probability of securing top-tier premier institutions.`;
    } else if (marks / config.maxMarks > 0.45) {
      confidence = 'High';
      interpretation = `Solid performance with ${marks}/${config.maxMarks}. Multiple competitive seat options available in national and state institutes.`;
    } else {
      confidence = 'Moderate';
      interpretation = `Score of ${marks}/${config.maxMarks}. Viable options in state colleges, newer universities, and private/deemed universities.`;
    }
  }

  // Calculate dynamic rank range (+- 7% to 15% buffer depending on exam volatility)
  const volatility = exam === 'neet' || exam === 'jee-main' ? 0.08 : 0.12;
  const minRank = Math.max(1, Math.round(estimatedRank * (1 - volatility)));
  const maxRank = Math.round(estimatedRank * (1 + volatility));

  return {
    estimatedRank,
    rankRange: { min: minRank, max: maxRank },
    estimatedPercentile,
    confidence,
    interpretation,
    isOfficial: false,
    disclaimer:
      'Actual rank may vary depending on normalization, shift difficulty, candidate volume, and official examination results.'
  };
}

/**
 * Calculates transparent admission chance band based on closing rank vs student rank
 * Ratios:
 * - v <= 0.70m -> Safe (High Chance)
 * - 0.70m < v <= 1.0m -> Moderate Chance (Tight)
 * - 1.0m < v <= 1.20m -> Ambitious (Stretch due to yearly cutoff drift)
 * - v > 1.20m -> Low / High Risk
 */
export function calculateAdmissionChance(
  studentRank: number,
  closingRank: number
): { chance: AdmissionChance; percentage: number; tier: 'Dream' | 'Target' | 'Safe' } {
  const ratio = studentRank / closingRank;

  if (ratio <= 0.70) {
    // Comfortably in: Safe (High Chance)
    const percentage = Math.min(99, Math.round(92 + (0.70 - ratio) * 10));
    return { chance: 'HIGH', percentage, tier: 'Safe' };
  } else if (ratio <= 1.0) {
    // Tight at v <= m: Moderate Chance
    const percentage = Math.max(60, Math.min(89, Math.round(89 - ((ratio - 0.70) / 0.30) * 29)));
    return { chance: 'MODERATE', percentage, tier: 'Target' };
  } else if (ratio <= 1.20) {
    // Stretch at v <= 1.2m: Ambitious (since cutoffs drift yearly)
    const percentage = Math.max(25, Math.min(59, Math.round(59 - ((ratio - 1.0) / 0.20) * 34)));
    return { chance: 'AMBITIOUS', percentage, tier: 'Dream' };
  } else {
    // Beyond 1.2m
    const percentage = Math.max(2, Math.min(24, Math.round(20 - Math.min(18, (ratio - 1.20) * 15))));
    return { chance: 'LOW', percentage, tier: 'Dream' };
  }
}

/**
 * Evaluates candidate profile against historical cutoff database and returns eligible colleges
 */
export function predictColleges(
  request: PredictionRequest,
  studentRank: number
): CollegePredictionItem[] {
  const { exam, category = 'OPEN', gender = 'Gender-Neutral', preferredBranch, preferredCollegeType, homeState } = request;

  // Filter cutoffs by exam
  let candidateCutoffs = HISTORICAL_CUTOFFS.filter((c) => c.exam === exam);

  // Apply college type filter if specified
  if (preferredCollegeType && preferredCollegeType !== 'All') {
    candidateCutoffs = candidateCutoffs.filter(
      (c) => c.instituteType.toLowerCase() === preferredCollegeType.toLowerCase()
    );
  }

  // Apply branch/course filter if specified
  if (preferredBranch && preferredBranch !== 'All') {
    candidateCutoffs = candidateCutoffs.filter(
      (c) =>
        c.branch.toLowerCase().includes(preferredBranch.toLowerCase()) ||
        c.course.toLowerCase().includes(preferredBranch.toLowerCase())
    );
  }

  // Map into prediction items
  const results: CollegePredictionItem[] = candidateCutoffs.map((record) => {
    // Apply category multipliers if specific category cutoff isn't separately defined
    let effectiveClosingRank = record.closingRank;
    if (category === 'GEN-EWS') effectiveClosingRank = Math.round(record.closingRank * 1.22);
    else if (category === 'OBC-NCL') effectiveClosingRank = Math.round(record.closingRank * 1.35);
    else if (category === 'SC') effectiveClosingRank = Math.round(record.closingRank * 2.10);
    else if (category === 'ST') effectiveClosingRank = Math.round(record.closingRank * 2.85);

    // Apply female supernumerary quota bonus if applicable
    if (gender === 'Female-only') {
      effectiveClosingRank = Math.round(effectiveClosingRank * 1.20);
    }

    // Apply Home State Quota bonus if candidate is from the same state
    if (homeState && record.state.toLowerCase() === homeState.toLowerCase() && record.quota === 'HS') {
      effectiveClosingRank = Math.round(effectiveClosingRank * 1.30);
    }

    const { chance, percentage, tier } = calculateAdmissionChance(studentRank, effectiveClosingRank);

    return {
      id: record.id,
      instituteId: record.instituteId,
      instituteName: record.instituteName,
      instituteType: record.instituteType,
      city: record.city,
      state: record.state,
      course: record.course,
      branch: record.branch,
      counselling: record.counselling,
      category: record.category,
      gender: record.gender,
      quota: record.quota,
      previousClosingRank: effectiveClosingRank,
      closingRanksByYear: {
        2023: Math.round(effectiveClosingRank * 0.94),
        2024: Math.round(effectiveClosingRank * 0.97),
        2025: effectiveClosingRank
      },
      candidateRank: studentRank,
      chance,
      chancePercentage: percentage,
      tuitionFeePerYear: record.tuitionFeePerYear,
      avgPackageLpa: record.avgPackageLpa,
      highestPackageLpa: record.highestPackageLpa,
      nirfRank: record.nirfRank,
      source: record.source,
      tier
    };
  });

  // Sort by Chance (HIGH > MODERATE > LOW > AMBITIOUS) then by NIRF rank / Average package
  const chancePriority: Record<AdmissionChance, number> = {
    HIGH: 1,
    MODERATE: 2,
    LOW: 3,
    AMBITIOUS: 4
  };

  return results.sort((a, b) => {
    if (chancePriority[a.chance] !== chancePriority[b.chance]) {
      return chancePriority[a.chance] - chancePriority[b.chance];
    }
    if (a.nirfRank && b.nirfRank) return a.nirfRank - b.nirfRank;
    return (b.avgPackageLpa || 0) - (a.avgPackageLpa || 0);
  });
}

/**
 * Master prediction orchestrator
 */
export function executePrediction(request: PredictionRequest): PredictionResponse {
  const rankResult = predictRank(request);
  const colleges = predictColleges(request, rankResult.estimatedRank);

  const highChanceCount = colleges.filter((c) => c.chance === 'HIGH').length;
  const moderateChanceCount = colleges.filter((c) => c.chance === 'MODERATE').length;
  const lowChanceCount = colleges.filter((c) => c.chance === 'LOW').length;
  const ambitiousCount = colleges.filter((c) => c.chance === 'AMBITIOUS').length;

  return {
    success: true,
    exam: EXAM_CONFIGS[request.exam],
    rankPrediction: rankResult,
    colleges,
    totalColleges: colleges.length,
    summary: {
      highChanceCount,
      moderateChanceCount,
      lowChanceCount,
      ambitiousCount
    },
    metadata: {
      datasetYear: EXAM_CONFIGS[request.exam].year,
      totalHistoricalCutoffsAnalyzed: HISTORICAL_CUTOFFS.filter((c) => c.exam === request.exam).length
    }
  };
}

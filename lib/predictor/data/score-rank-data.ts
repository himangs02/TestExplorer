import { ExamId, ScoreRankPoint } from '../types';

export interface ScoreRankDataset {
  exam: ExamId;
  year: number;
  totalMarks: number;
  totalCandidates: number;
  calibrationPoints: ScoreRankPoint[];
}

export const SCORE_RANK_DATASETS: Record<ExamId, ScoreRankDataset> = {
  'jee-main': {
    exam: 'jee-main',
    year: 2025,
    totalMarks: 300,
    totalCandidates: 1420000,
    calibrationPoints: [
      { score: 295, percentile: 99.998, rank: 35 },
      { score: 285, percentile: 99.99, rank: 140 },
      { score: 270, percentile: 99.95, rank: 710 },
      { score: 250, percentile: 99.85, rank: 2130 },
      { score: 235, percentile: 99.65, rank: 4970 },
      { score: 220, percentile: 99.40, rank: 8520 },
      { score: 205, percentile: 99.00, rank: 14200 },
      { score: 190, percentile: 98.50, rank: 21300 },
      { score: 175, percentile: 97.80, rank: 31240 },
      { score: 160, percentile: 96.80, rank: 45440 },
      { score: 145, percentile: 95.50, rank: 63900 },
      { score: 130, percentile: 93.80, rank: 88040 },
      { score: 115, percentile: 91.50, rank: 120700 },
      { score: 100, percentile: 88.50, rank: 163300 },
      { score: 85, percentile: 84.00, rank: 227200 },
      { score: 70, percentile: 77.00, rank: 326600 },
      { score: 55, percentile: 67.00, rank: 468600 },
      { score: 40, percentile: 52.00, rank: 681600 },
      { score: 25, percentile: 32.00, rank: 965600 },
      { score: 10, percentile: 12.00, rank: 1249600 },
      { score: 0, percentile: 1.00, rank: 1400000 }
    ]
  },
  'jee-advanced': {
    exam: 'jee-advanced',
    year: 2025,
    totalMarks: 360,
    totalCandidates: 185000,
    calibrationPoints: [
      { score: 335, rank: 15 },
      { score: 315, rank: 85 },
      { score: 290, rank: 320 },
      { score: 265, rank: 850 },
      { score: 240, rank: 1750 },
      { score: 215, rank: 3200 },
      { score: 195, rank: 5100 },
      { score: 175, rank: 7800 },
      { score: 155, rank: 11200 },
      { score: 140, rank: 14500 },
      { score: 125, rank: 18900 },
      { score: 110, rank: 24000 },
      { score: 95, rank: 30500 },
      { score: 80, rank: 39000 },
      { score: 65, rank: 50000 },
      { score: 50, rank: 65000 }
    ]
  },
  'neet': {
    exam: 'neet',
    year: 2025,
    totalMarks: 720,
    totalCandidates: 2380000,
    calibrationPoints: [
      { score: 715, percentile: 99.999, rank: 65 },
      { score: 700, percentile: 99.98, rank: 480 },
      { score: 685, percentile: 99.90, rank: 2400 },
      { score: 670, percentile: 99.70, rank: 7100 },
      { score: 655, percentile: 99.35, rank: 15500 },
      { score: 640, percentile: 98.85, rank: 27400 },
      { score: 625, percentile: 98.10, rank: 45200 },
      { score: 600, percentile: 96.50, rank: 83300 },
      { score: 575, percentile: 94.20, rank: 138000 },
      { score: 550, percentile: 91.00, rank: 214000 },
      { score: 500, percentile: 83.50, rank: 392000 },
      { score: 450, percentile: 74.00, rank: 618000 },
      { score: 400, percentile: 63.00, rank: 880000 },
      { score: 350, percentile: 50.00, rank: 1190000 },
      { score: 300, percentile: 36.00, rank: 1520000 },
      { score: 200, percentile: 16.00, rank: 1999000 },
      { score: 100, percentile: 4.00, rank: 2280000 }
    ]
  },
  'cuet': {
    exam: 'cuet',
    year: 2025,
    totalMarks: 800,
    totalCandidates: 1490000,
    calibrationPoints: [
      { score: 795, percentile: 99.99, rank: 150 },
      { score: 780, percentile: 99.90, rank: 1500 },
      { score: 760, percentile: 99.60, rank: 6000 },
      { score: 740, percentile: 99.00, rank: 15000 },
      { score: 710, percentile: 97.80, rank: 33000 },
      { score: 670, percentile: 95.50, rank: 67000 },
      { score: 620, percentile: 91.50, rank: 126000 },
      { score: 570, percentile: 86.00, rank: 208000 },
      { score: 500, percentile: 76.00, rank: 357000 },
      { score: 420, percentile: 62.00, rank: 566000 },
      { score: 340, percentile: 46.00, rank: 804000 },
      { score: 250, percentile: 28.00, rank: 1070000 }
    ]
  },
  'clat': {
    exam: 'clat',
    year: 2025,
    totalMarks: 120,
    totalCandidates: 76000,
    calibrationPoints: [
      { score: 112, percentile: 99.99, rank: 10 },
      { score: 105, percentile: 99.90, rank: 75 },
      { score: 98, percentile: 99.65, rank: 270 },
      { score: 92, percentile: 99.10, rank: 680 },
      { score: 86, percentile: 98.20, rank: 1370 },
      { score: 80, percentile: 96.80, rank: 2430 },
      { score: 74, percentile: 94.80, rank: 3950 },
      { score: 68, percentile: 91.50, rank: 6460 },
      { score: 60, percentile: 85.00, rank: 11400 },
      { score: 52, percentile: 76.00, rank: 18240 },
      { score: 44, percentile: 64.00, rank: 27360 },
      { score: 35, percentile: 48.00, rank: 39520 },
      { score: 25, percentile: 28.00, rank: 54720 }
    ]
  }
};

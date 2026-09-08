import { Metadata } from 'next';
import { PredictorDashboard } from '@/components/predictor/PredictorDashboard';

export const metadata: Metadata = {
  title: 'CLAT NLU Predictor 2027 - National Law Universities Cutoffs & Chances',
  description:
    'Predict which NLU (NLSIU Bengaluru, NALSAR, WBNUJS, NLU Jodhpur, GNLU) you can get into based on your CLAT score and rank.',
  openGraph: {
    title: 'CLAT College Predictor 2027 | Test Explorer',
    description: 'Find your target NLU for 5-year B.A. LL.B. programmes based on Consortium of NLUs closing ranks.',
    type: 'website'
  }
};

export default function ClatPredictorAlias() {
  return (
    <main className="min-h-screen bg-gray-50/50 pb-20">
      <PredictorDashboard defaultExam="clat" />
    </main>
  );
}

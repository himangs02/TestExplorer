import { Metadata } from 'next';
import { PredictorDashboard } from '@/components/predictor/PredictorDashboard';

export const metadata: Metadata = {
  title: 'JEE Main College Predictor 2027 - NITs, IIITs & GFTIs Admission Chances',
  description:
    'Calculate your JEE Main 2027 estimated rank and predict eligible NITs, IIITs, and GFTIs based on JoSAA & CSAB previous year closing ranks.',
  openGraph: {
    title: 'JEE Main College Predictor 2027 | Test Explorer',
    description: 'Find your eligible NITs, IIITs, and engineering colleges based on your JEE Main marks or percentile.',
    type: 'website'
  }
};

export default function JeeMainPredictorAlias() {
  return (
    <main className="min-h-screen bg-gray-50/50 pb-20">
      <PredictorDashboard defaultExam="jee-main" />
    </main>
  );
}

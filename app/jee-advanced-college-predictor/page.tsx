import { Metadata } from 'next';
import { PredictorDashboard } from '@/components/predictor/PredictorDashboard';

export const metadata: Metadata = {
  title: 'JEE Advanced College Predictor 2027 - Find Eligible IITs & Branches',
  description:
    'Predict which of the 23 IITs you can get admission to with your JEE Advanced marks and rank based on verified JoSAA round 6 cutoffs.',
  openGraph: {
    title: 'JEE Advanced College Predictor 2027 | Test Explorer',
    description: 'Find your eligible IITs and branches for JoSAA counselling.',
    type: 'website'
  }
};

export default function JeeAdvancedPredictorAlias() {
  return (
    <main className="min-h-screen bg-gray-50/50 pb-20">
      <PredictorDashboard defaultExam="jee-advanced" />
    </main>
  );
}

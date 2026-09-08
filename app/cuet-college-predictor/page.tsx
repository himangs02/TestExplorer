import { Metadata } from 'next';
import { PredictorDashboard } from '@/components/predictor/PredictorDashboard';

export const metadata: Metadata = {
  title: 'CUET College Predictor 2027 - Delhi University, BHU, JNU Course Predictor',
  description:
    'Predict your admission chances in Delhi University (DU CSAS), BHU, and Central Universities with your CUET UG score and subjects.',
  openGraph: {
    title: 'CUET College Predictor 2027 | Test Explorer',
    description: 'Check your chances for top DU colleges like SRCC, Hindu, Hansraj, St. Stephens, and BHU.',
    type: 'website'
  }
};

export default function CuetPredictorAlias() {
  return (
    <main className="min-h-screen bg-gray-50/50 pb-20">
      <PredictorDashboard defaultExam="cuet" />
    </main>
  );
}

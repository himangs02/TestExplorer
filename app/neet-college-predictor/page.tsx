import { Metadata } from 'next';
import { PredictorDashboard } from '@/components/predictor/PredictorDashboard';

export const metadata: Metadata = {
  title: 'NEET College Predictor 2027 - MBBS, BDS, AIIMS & Govt Medical Colleges',
  description:
    'Free NEET UG 2027 rank and medical college predictor. Check admission chances for AIIMS, Central Universities, and Government Medical Colleges.',
  openGraph: {
    title: 'NEET College Predictor 2027 | Test Explorer',
    description: 'Find MBBS and BDS admission chances across AIIMS and government medical colleges.',
    type: 'website'
  }
};

export default function NeetPredictorAlias() {
  return (
    <main className="min-h-screen bg-gray-50/50 pb-20">
      <PredictorDashboard defaultExam="neet" />
    </main>
  );
}

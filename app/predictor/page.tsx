import { Metadata } from 'next';
import { PredictorDashboard } from '@/lib/../components/predictor/PredictorDashboard';
import { ExamId } from '@/lib/predictor/types';

export const metadata: Metadata = {
  title: 'Exam Rank & College Predictor 2027 | Test Explorer',
  description:
    'Free College and Rank Predictor for JEE Main, JEE Advanced, NEET UG, CUET UG, and CLAT. Predict your All India Rank and discover eligible colleges based on verified cutoffs.',
  openGraph: {
    title: 'Exam Rank & College Predictor 2027 | Test Explorer',
    description:
      'Predict your rank and discover eligible colleges for JEE, NEET, CUET, and CLAT with verified JoSAA & MCC cutoff data.',
    type: 'website'
  }
};

export default async function PredictorPage({
  searchParams
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const exam = (params.exam as ExamId) || 'jee-main';
  const score = params.score ? parseFloat(params.score as string) : undefined;
  const mode = (params.mode as any) || 'marks';
  const category = (params.category as any) || 'OPEN';
  const state = params.state as string | undefined;
  const branch = params.branch as string | undefined;

  return (
    <main className="min-h-screen bg-gray-50/50 pb-20">
      <PredictorDashboard
        defaultExam={exam}
        initialQuery={{
          exam,
          inputMode: mode,
          inputValue: score,
          category,
          homeState: state,
          preferredBranch: branch
        }}
      />
    </main>
  );
}

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PredictorDashboard } from '@/components/predictor/PredictorDashboard';
import { EXAM_CONFIGS } from '@/lib/predictor/data/exams-config';
import { ExamId } from '@/lib/predictor/types';

export async function generateMetadata({
  params
}: {
  params: Promise<{ exam: string }>;
}): Promise<Metadata> {
  const { exam } = await params;
  const config = EXAM_CONFIGS[exam as ExamId];

  if (!config) {
    return {
      title: 'Exam Predictor | Test Explorer'
    };
  }

  return {
    title: `${config.name} Rank & College Predictor 2027 | Test Explorer`,
    description: `Predict your ${config.fullName} estimated rank, percentile, and discover eligible colleges, branches, and admission probability based on historical cutoffs.`,
    openGraph: {
      title: `${config.name} Rank & College Predictor 2027 | Test Explorer`,
      description: `Free ${config.name} college and rank prediction engine. Discover NITs, IITs, Medical Colleges, NLUs and Central Universities you can get admission in.`,
      type: 'website'
    }
  };
}

export default async function ExamPredictorPage({
  params,
  searchParams
}: {
  params: Promise<{ exam: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { exam } = await params;
  const sParams = await searchParams;

  const validExam = EXAM_CONFIGS[exam as ExamId];
  if (!validExam) {
    notFound();
  }

  const score = sParams.score ? parseFloat(sParams.score as string) : undefined;
  const mode = (sParams.mode as any) || 'marks';
  const category = (sParams.category as any) || 'OPEN';
  const state = sParams.state as string | undefined;
  const branch = sParams.branch as string | undefined;

  return (
    <main className="min-h-screen bg-gray-50/50 pb-20">
      <PredictorDashboard
        defaultExam={exam as ExamId}
        initialQuery={{
          exam: exam as ExamId,
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

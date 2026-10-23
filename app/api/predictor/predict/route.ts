import { NextRequest, NextResponse } from 'next/server';
import { executePrediction } from '@/lib/predictor/engine';
import { PredictionRequest } from '@/lib/predictor/types';

export async function POST(req: NextRequest) {
  try {
    const body: PredictionRequest = await req.json();

    if (!body.exam || !body.inputMode || body.inputValue === undefined || body.inputValue === null) {
      return NextResponse.json(
        { error: 'Missing required prediction fields (exam, inputMode, inputValue).' },
        { status: 400 }
      );
    }

    const val = Number(body.inputValue);
    if (isNaN(val) || val < 0) {
      return NextResponse.json(
        { error: 'Invalid score/rank value. Please enter a valid non-negative number.' },
        { status: 400 }
      );
    }

    const { EXAM_CONFIGS } = await import('@/lib/predictor/data/exams-config');
    const examConfig = EXAM_CONFIGS[body.exam];
    if (examConfig) {
      if (body.inputMode === 'marks' && val > examConfig.maxMarks) {
        return NextResponse.json(
          { error: `Marks cannot exceed the maximum of ${examConfig.maxMarks} for ${examConfig.name}. Please enter a valid score.` },
          { status: 400 }
        );
      }
      if (body.inputMode === 'percentile' && (val > 100 || val < 0)) {
        return NextResponse.json(
          { error: 'Percentile must be between 0 and 100.' },
          { status: 400 }
        );
      }
      if (body.inputMode === 'rank' && val < 1) {
        return NextResponse.json(
          { error: 'Rank must be at least 1.' },
          { status: 400 }
        );
      }
    }

    const response = executePrediction(body);
    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Prediction API error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to generate rank & college prediction.' },
      { status: 500 }
    );
  }
}

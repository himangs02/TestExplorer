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

    if (isNaN(Number(body.inputValue)) || Number(body.inputValue) < 0) {
      return NextResponse.json(
        { error: 'Invalid score/rank value. Please enter a valid non-negative number.' },
        { status: 400 }
      );
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

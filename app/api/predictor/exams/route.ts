import { NextResponse } from 'next/server';
import { EXAM_CONFIGS, INDIAN_STATES, CUET_UNIVERSITIES } from '@/lib/predictor/data/exams-config';

export async function GET() {
  return NextResponse.json({
    exams: EXAM_CONFIGS,
    states: INDIAN_STATES,
    cuetUniversities: CUET_UNIVERSITIES
  });
}

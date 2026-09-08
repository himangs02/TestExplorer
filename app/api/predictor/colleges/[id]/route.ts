import { NextRequest, NextResponse } from 'next/server';
import { HISTORICAL_CUTOFFS } from '@/lib/predictor/data/historical-cutoffs';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const collegeCutoffs = HISTORICAL_CUTOFFS.filter(
    (c) => c.instituteId === id || c.id === id
  );

  if (!collegeCutoffs || collegeCutoffs.length === 0) {
    return NextResponse.json(
      { error: 'College not found or no historical cutoff data available.' },
      { status: 404 }
    );
  }

  const primary = collegeCutoffs[0];

  return NextResponse.json({
    instituteId: primary.instituteId,
    instituteName: primary.instituteName,
    instituteType: primary.instituteType,
    city: primary.city,
    state: primary.state,
    course: primary.course,
    branch: primary.branch,
    tuitionFeePerYear: primary.tuitionFeePerYear,
    avgPackageLpa: primary.avgPackageLpa,
    highestPackageLpa: primary.highestPackageLpa,
    nirfRank: primary.nirfRank,
    counselling: primary.counselling,
    source: primary.source,
    lastUpdated: primary.lastUpdated,
    allBranches: collegeCutoffs.map((c) => ({
      id: c.id,
      branch: c.branch,
      course: c.course,
      category: c.category,
      gender: c.gender,
      quota: c.quota,
      round: c.round,
      year: c.year,
      closingRank: c.closingRank,
      openingRank: c.openingRank
    }))
  });
}

import { NextRequest, NextResponse } from 'next/server';
import { CutoffRecord } from '@/lib/predictor/types';

export async function POST(req: NextRequest) {
  try {
    const { csvData, sourceName, year } = await req.json();

    if (!csvData || typeof csvData !== 'string') {
      return NextResponse.json(
        { error: 'Invalid or missing CSV data string.' },
        { status: 400 }
      );
    }

    const lines = csvData.trim().split('\n').map((l) => l.trim()).filter(Boolean);
    if (lines.length < 2) {
      return NextResponse.json(
        { error: 'CSV must contain at least a header line and one data row.' },
        { status: 400 }
      );
    }

    const header = lines[0].split(',').map((h) => h.trim().toLowerCase());
    const requiredHeaders = ['exam', 'institute', 'branch', 'category', 'closing_rank'];
    const missingHeaders = requiredHeaders.filter((rh) => !header.includes(rh));

    if (missingHeaders.length > 0) {
      return NextResponse.json(
        {
          error: `Missing required CSV columns: ${missingHeaders.join(', ')}. Supported columns: exam, institute, branch, category, gender, quota, round, opening_rank, closing_rank, tuition_fee, avg_package, highest_package, nirf_rank.`
        },
        { status: 400 }
      );
    }

    const importedRecords: Partial<CutoffRecord>[] = [];
    const parseErrors: string[] = [];

    for (let i = 1; i < lines.length; i++) {
      const row = lines[i].split(',').map((c) => c.trim());
      if (row.length !== header.length) {
        parseErrors.push(`Row ${i + 1}: Column count mismatch (expected ${header.length}, got ${row.length})`);
        continue;
      }

      const rowObj: any = {};
      header.forEach((col, idx) => {
        rowObj[col] = row[idx];
      });

      const closingRank = parseInt(rowObj.closing_rank, 10);
      if (isNaN(closingRank) || closingRank <= 0) {
        parseErrors.push(`Row ${i + 1}: Invalid closing rank "${rowObj.closing_rank}"`);
        continue;
      }

      importedRecords.push({
        id: `import-${Date.now()}-${i}`,
        exam: rowObj.exam,
        instituteName: rowObj.institute,
        branch: rowObj.branch,
        category: rowObj.category || 'OPEN',
        gender: rowObj.gender || 'Gender-Neutral',
        quota: rowObj.quota || 'AI',
        round: parseInt(rowObj.round, 10) || 1,
        year: parseInt(rowObj.year, 10) || year || 2025,
        openingRank: parseInt(rowObj.opening_rank, 10) || closingRank,
        closingRank: closingRank,
        source: sourceName || 'Admin CSV Import',
        lastUpdated: new Date().toISOString().split('T')[0]
      });
    }

    return NextResponse.json({
      success: true,
      message: `Successfully processed ${importedRecords.length} records.`,
      recordsProcessed: importedRecords.length,
      errors: parseErrors,
      sampleRecords: importedRecords.slice(0, 5)
    });
  } catch (err: any) {
    console.error('CSV import error:', err);
    return NextResponse.json(
      { error: err?.message || 'Failed to import CSV dataset.' },
      { status: 500 }
    );
  }
}

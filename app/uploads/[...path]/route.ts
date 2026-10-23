import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params;
  const filePathArray = resolvedParams?.path;
  if (!filePathArray || filePathArray.length === 0) {
    return new NextResponse('File not found', { status: 404 });
  }

  const filename = filePathArray.join('/');
  // Prevent directory traversal attacks
  const safeFilename = path.normalize(filename).replace(/^(\.\.[\/\\])+/, '');

  // Look in public/uploads first
  const publicUploadPath = path.resolve(process.cwd(), 'public', 'uploads', safeFilename);

  try {
    const data = await fs.readFile(publicUploadPath);
    const ext = path.extname(safeFilename).toLowerCase().replace('.', '');
    const mimeTypes: Record<string, string> = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      webp: 'image/webp',
      avif: 'image/avif',
      svg: 'image/svg+xml'
    };

    return new NextResponse(data, {
      headers: {
        'Content-Type': mimeTypes[ext] || 'image/jpeg',
        'Cache-Control': 'public, max-age=31536000, immutable'
      }
    });
  } catch {
    return new NextResponse('File not found', { status: 404 });
  }
}

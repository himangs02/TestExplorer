import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { promises as fs } from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as Blob | null;
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const mimeType = file.type || 'image/jpeg';

    // Base64 data URI guarantees 100% persistence in database (stored in MySQL LongText),
    // eliminates local-vs-production disk discrepancies, Vercel/Docker 404 static asset errors,
    // and guarantees instant preview and rendering across all environments (local, Hostinger, Vercel).
    const base64 = buffer.toString('base64');
    const dataUri = `data:${mimeType};base64,${base64}`;
    return NextResponse.json({ url: dataUri });
  } catch (error) {
    console.error('Upload API error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}

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

    // In serverless / Vercel / container environments, serverless functions have ephemeral filesystems.
    // Base64 data URI guarantees 100% persistence in database (stored in MySQL LongText),
    // eliminates Vercel 404 static asset errors, and guarantees instant preview and rendering.
    const isServerless = process.env.VERCEL === '1' || Boolean(process.env.VERCEL) || process.env.NODE_ENV === 'production';

    if (isServerless) {
      const base64 = buffer.toString('base64');
      const dataUri = `data:${mimeType};base64,${base64}`;
      return NextResponse.json({ url: dataUri });
    }

    // On local development, try saving to public/uploads or fallback to data URI
    try {
      const extension = mimeType.split('/')[1] || 'jpg';
      const fileName = `${randomUUID()}.${extension}`;
      const uploadDir = path.resolve(process.cwd(), 'public', 'uploads');
      await fs.mkdir(uploadDir, { recursive: true });
      const filePath = path.join(uploadDir, fileName);
      await fs.writeFile(filePath, buffer);
      const urlPath = `/uploads/${fileName}`;
      return NextResponse.json({ url: urlPath });
    } catch {
      const base64 = buffer.toString('base64');
      const dataUri = `data:${mimeType};base64,${base64}`;
      return NextResponse.json({ url: dataUri });
    }
  } catch (error) {
    console.error('Upload API error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}

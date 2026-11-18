import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, studentClass, schoolName, phone, address, email, exam, estimatedRank } = body;

    // Basic validation
    if (!name?.trim()) {
      return NextResponse.json({ error: 'Please enter your full name.' }, { status: 400 });
    }
    if (!studentClass?.trim()) {
      return NextResponse.json({ error: 'Please select your class (10, 11, 12, etc.).' }, { status: 400 });
    }
    if (!schoolName?.trim()) {
      return NextResponse.json({ error: 'Please enter your school or institute name.' }, { status: 400 });
    }
    if (!phone?.trim() || phone.replace(/\D/g, '').length < 10) {
      return NextResponse.json({ error: 'Please enter a valid 10-digit mobile number.' }, { status: 400 });
    }

    const cleanPhone = phone.replace(/\D/g, '');
    const leadEmail = email?.trim() || `${cleanPhone}@lead.testexplorer.com`;

    const messageLines = [
      `📱 Student Mobile: ${phone.trim()}`,
      `🎓 Class: Class ${studentClass.trim()}`,
      `🏫 School / Institute: ${schoolName.trim()}`,
      address?.trim() ? `📍 Address / Location: ${address.trim()}` : null,
      exam ? `🎯 Target Exam: ${exam}` : null,
      estimatedRank ? `📊 Estimated Rank: ${estimatedRank}` : null,
      `⏰ Captured At: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`
    ].filter(Boolean).join('\n');

    // Save lead inquiry to contact_messages so it is immediately visible in Admin Inbox
    await prisma.contact_messages.create({
      data: {
        name: name.trim(),
        email: leadEmail,
        subject: `[Predictor Lead] ${name.trim()} (Class ${studentClass.trim()}) - ${schoolName.trim()}`,
        message: messageLines,
        status: 'unread'
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Student details saved successfully. Full prediction report unlocked!'
    });
  } catch (error: any) {
    console.error('Error saving predictor unlock lead:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to save student details. Please try again.' },
      { status: 500 }
    );
  }
}

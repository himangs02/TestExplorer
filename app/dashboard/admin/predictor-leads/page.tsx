import React from 'react';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import PredictorLeadsClient, { ParsedPredictorLead } from '@/components/admin/PredictorLeadsClient';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Rank Predictor Leads | Admin Dashboard',
  description: 'View and manage student inquiries collected through the College Rank Predictor.'
};

export default async function PredictorLeadsPage() {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;

  if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
    redirect('/dashboard');
  }

  // 1. Fetch all predictor inquiries
  const rawMessages = await prisma.contact_messages.findMany({
    where: {
      OR: [
        { subject: { contains: 'Predictor' } },
        { message: { contains: 'Estimated Rank' } },
        { message: { contains: '__LEAD_JSON__' } }
      ]
    },
    orderBy: {
      created_at: 'desc'
    }
  });

  // 2. Parse lead details
  const parsedLeads: ParsedPredictorLead[] = rawMessages.map((msg) => {
    let studentClass = '12';
    let schoolName = 'General';
    let phone = '';
    let address = '';
    let exam = 'JEE Main';
    let estimatedRank = '';

    // Check for structured JSON first
    const jsonMatch = msg.message.match(/__LEAD_JSON__:(.*)$/m);
    if (jsonMatch && jsonMatch[1]) {
      try {
        const parsed = JSON.parse(jsonMatch[1]);
        studentClass = parsed.studentClass || studentClass;
        schoolName = parsed.schoolName || schoolName;
        phone = parsed.phone || phone;
        address = parsed.address || address;
        exam = parsed.exam || exam;
        estimatedRank = parsed.estimatedRank?.toString() || estimatedRank;
      } catch (e) {
        console.error('Failed to parse lead json:', e);
      }
    } else {
      // Regex fallbacks for older or custom submissions
      const phoneMatch = msg.message.match(/📱\s*Student Mobile:\s*(.*)/i) || msg.message.match(/Phone:\s*(.*)/i);
      if (phoneMatch) phone = phoneMatch[1].trim();

      const classMatch = msg.message.match(/🎓\s*Class:\s*(?:Class\s*)?(.*)/i) || msg.message.match(/Class:\s*(.*)/i);
      if (classMatch) studentClass = classMatch[1].trim();

      const schoolMatch = msg.message.match(/🏫\s*School\s*(?:\/\s*Institute)?:\s*(.*)/i) || msg.message.match(/School:\s*(.*)/i);
      if (schoolMatch) schoolName = schoolMatch[1].trim();

      const addressMatch = msg.message.match(/📍\s*Address\s*(?:\/\s*Location)?:\s*(.*)/i) || msg.message.match(/Address:\s*(.*)/i);
      if (addressMatch) address = addressMatch[1].trim();

      const examMatch = msg.message.match(/🎯\s*Target Exam:\s*(.*)/i) || msg.message.match(/Exam:\s*(.*)/i);
      if (examMatch) exam = examMatch[1].trim();

      const rankMatch = msg.message.match(/📊\s*Estimated Rank:\s*(.*)/i) || msg.message.match(/Rank:\s*(.*)/i);
      if (rankMatch) estimatedRank = rankMatch[1].trim();
    }

    return {
      id: msg.id,
      name: msg.name,
      email: msg.email || '',
      phone: phone || msg.email?.replace(/@.*/, '') || '—',
      studentClass,
      schoolName,
      address,
      exam,
      estimatedRank,
      createdAt: (msg.created_at || new Date()).toISOString(),
      rawMessage: msg.message
    };
  });

  // Server action to delete lead
  async function deleteLeadAction(id: string) {
    'use server';
    try {
      await prisma.contact_messages.delete({
        where: { id }
      });
      revalidatePath('/dashboard/admin/predictor-leads');
      return { success: true };
    } catch (err: any) {
      console.error('Failed to delete lead:', err);
      return { error: err.message || 'Failed to delete lead' };
    }
  }

  return (
    <PredictorLeadsClient
      initialLeads={parsedLeads}
      onDeleteLead={deleteLeadAction}
    />
  );
}

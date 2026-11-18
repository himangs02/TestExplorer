'use client';

import React, { useState } from 'react';
import {
  Lock,
  LockOpen,
  X,
  User,
  GraduationCap,
  Building,
  Phone,
  MapPin,
  Mail,
  ShieldCheck
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

interface UnlockDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  examName?: string;
  totalColleges?: number;
  estimatedRank?: number | string;
}

export const UnlockDetailsModal: React.FC<UnlockDetailsModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  examName = 'Competitive Exam',
  totalColleges = 50,
  estimatedRank
}) => {
  const [name, setName] = useState('');
  const [studentClass, setStudentClass] = useState('12');
  const [schoolName, setSchoolName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Please enter your full name.');
      return;
    }

    if (!schoolName.trim()) {
      toast.error('Please enter your school or coaching institute name.');
      return;
    }

    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      toast.error('Please enter a valid 10-digit mobile number.');
      return;
    }

    if (!address.trim()) {
      toast.error('Please enter your city / address.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/predictor/unlock-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          studentClass,
          schoolName: schoolName.trim(),
          phone: cleanPhone,
          address: address.trim(),
          email: email.trim(),
          exam: examName,
          estimatedRank: estimatedRank || undefined
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit details.');
      }

      // Persist unlock state locally so they stay unlocked throughout their session
      localStorage.setItem('predictor_lead_unlocked', 'true');
      localStorage.setItem(
        'predictor_lead_data',
        JSON.stringify({ name, studentClass, schoolName, phone: cleanPhone, address })
      );

      toast.success('🎉 Full college report and cutoffs unlocked successfully!');
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const classOptions = [
    { label: 'Class 10', value: '10' },
    { label: 'Class 11', value: '11' },
    { label: 'Class 12', value: '12' },
    { label: '12th Pass / Dropper', value: '12th Pass' }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden my-8">
        {/* Top Gradient Header */}
        <div className="relative bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-900 text-white p-6 sm:p-7">
          {/* Close button */}
          <button
            onClick={onClose}
            type="button"
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-all cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-400 to-blue-500 text-slate-950 flex items-center justify-center shadow-md font-bold">
              <LockOpen className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <h3 className="text-xl font-black text-white tracking-tight">
                Unlock All {totalColleges}+ Colleges
              </h3>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Fill in your academic profile to unlock the full list of eligible institutions, closing cutoffs, category reservation ranks, and admission chances for <span className="text-cyan-300 font-bold">{examName}</span>.
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-7 space-y-4">
          {/* 1. Student Full Name */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-blue-600" />
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Rahul Sharma"
              className="w-full h-11 px-4 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
            />
          </div>

          {/* 2. Class Selector */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
              Current Class / Academic Year <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {classOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setStudentClass(opt.value)}
                  className={`h-10 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                    studentClass === opt.value
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-200'
                      : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* 3. School Name */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-blue-600" />
              School / College Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={schoolName}
              onChange={(e) => setSchoolName(e.target.value)}
              placeholder="e.g. Delhi Public School / Little Angels"
              className="w-full h-11 px-4 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
            />
          </div>

          {/* 4. Phone Number & City Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-blue-600" />
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                required
                maxLength={10}
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                placeholder="10-digit mobile number"
                className="w-full h-11 px-4 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-blue-600" />
                City / Address <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. Sonipat, Delhi NCR"
                className="w-full h-11 px-4 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
              />
            </div>
          </div>

          {/* 5. Email Address (Optional) */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-gray-400" />
              Email Address <span className="text-gray-400 text-[10px] normal-case">(Optional, to receive PDF report)</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. student@gmail.com"
              className="w-full h-11 px-4 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
            />
          </div>

          {/* Submit Action */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-sm rounded-2xl shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Unlocking Report...
                </span>
              ) : (
                <>
                  <LockOpen className="w-4 h-4" />
                  <span>Submit & Unlock All Colleges</span>
                </>
              )}
            </button>
          </div>

          {/* Bottom Security Note & Login Link */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 text-[11px] text-gray-500 border-t border-gray-100">
            <span className="flex items-center gap-1 text-gray-400 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Verified Counseling Data
            </span>
            <span>
              Already registered?{' '}
              <Link href="/login" className="font-bold text-blue-600 hover:underline">
                Log In
              </Link>
            </span>
          </div>
        </form>
      </div>
    </div>
  );
};

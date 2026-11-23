'use client';

import React, { useState, useMemo } from 'react';
import {
  Search,
  Download,
  GraduationCap,
  Building,
  Phone,
  MapPin,
  Calendar,
  Trash2,
  ExternalLink,
  MessageCircle,
  Copy,
  Check,
  Target,
  Sparkles,
  Users,
  Eye,
  X
} from 'lucide-react';
import { toast } from 'sonner';

export interface ParsedPredictorLead {
  id: string;
  name: string;
  email: string;
  phone: string;
  studentClass: string;
  schoolName: string;
  address: string;
  exam: string;
  estimatedRank: string;
  createdAt: string;
  rawMessage: string;
}

interface PredictorLeadsClientProps {
  initialLeads: ParsedPredictorLead[];
  onDeleteLead?: (id: string) => Promise<{ success?: boolean; error?: string }>;
}

export default function PredictorLeadsClient({
  initialLeads,
  onDeleteLead
}: PredictorLeadsClientProps) {
  const [leads, setLeads] = useState<ParsedPredictorLead[]>(initialLeads);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('ALL');
  const [selectedExam, setSelectedExam] = useState<string>('ALL');
  const [selectedLeadForDetail, setSelectedLeadForDetail] = useState<ParsedPredictorLead | null>(null);
  const [copiedPhoneId, setCopiedPhoneId] = useState<string | null>(null);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);

  // Copy phone helper
  const handleCopyPhone = (id: string, phone: string) => {
    navigator.clipboard.writeText(phone);
    setCopiedPhoneId(id);
    toast.success(`Copied ${phone} to clipboard!`);
    setTimeout(() => setCopiedPhoneId(null), 2000);
  };

  // Delete lead handler
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this lead?')) return;
    setIsDeletingId(id);
    try {
      if (onDeleteLead) {
        const res = await onDeleteLead(id);
        if (res?.error) throw new Error(res.error);
      }
      setLeads((prev) => prev.filter((l) => l.id !== id));
      if (selectedLeadForDetail?.id === id) {
        setSelectedLeadForDetail(null);
      }
      toast.success('Lead deleted successfully');
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete lead');
    } finally {
      setIsDeletingId(null);
    }
  };

  // Filtered leads
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      // Class filter
      if (selectedClass !== 'ALL' && !lead.studentClass.toLowerCase().includes(selectedClass.toLowerCase())) {
        return false;
      }

      // Exam filter
      if (selectedExam !== 'ALL' && !lead.exam.toLowerCase().includes(selectedExam.toLowerCase())) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = lead.name.toLowerCase().includes(q);
        const matchesSchool = lead.schoolName.toLowerCase().includes(q);
        const matchesPhone = lead.phone.includes(q);
        const matchesAddress = lead.address.toLowerCase().includes(q);
        const matchesExam = lead.exam.toLowerCase().includes(q);
        if (!matchesName && !matchesSchool && !matchesPhone && !matchesAddress && !matchesExam) {
          return false;
        }
      }

      return true;
    });
  }, [leads, selectedClass, selectedExam, searchQuery]);

  // KPI calculations
  const stats = useMemo(() => {
    const total = leads.length;
    const class12 = leads.filter(
      (l) => l.studentClass.includes('12') || l.studentClass.toLowerCase().includes('pass')
    ).length;
    const class11 = leads.filter((l) => l.studentClass.includes('11')).length;
    const class10 = leads.filter((l) => l.studentClass.includes('10')).length;
    return { total, class12, class11, class10 };
  }, [leads]);

  // Export to CSV
  const handleExportCSV = () => {
    if (leads.length === 0) {
      toast.error('No leads available to export.');
      return;
    }

    const headers = [
      'ID',
      'Student Name',
      'Mobile Number',
      'Class',
      'School / Institute',
      'City / Address',
      'Target Exam',
      'Estimated Rank',
      'Email',
      'Date Captured'
    ];

    const rows = filteredLeads.map((l) => [
      `"${l.id}"`,
      `"${l.name.replace(/"/g, '""')}"`,
      `"${l.phone}"`,
      `"${l.studentClass}"`,
      `"${l.schoolName.replace(/"/g, '""')}"`,
      `"${l.address.replace(/"/g, '""')}"`,
      `"${l.exam}"`,
      `"${l.estimatedRank}"`,
      `"${l.email}"`,
      `"${new Date(l.createdAt).toLocaleString('en-IN')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `testexplorer_predictor_leads_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Exported ${filteredLeads.length} leads to CSV!`);
  };

  const getClassBadgeStyle = (cls: string) => {
    if (cls.includes('12')) return 'bg-blue-100 text-blue-800 border-blue-200';
    if (cls.includes('11')) return 'bg-purple-100 text-purple-800 border-purple-200';
    if (cls.includes('10')) return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    return 'bg-amber-100 text-amber-800 border-amber-200';
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 p-4 sm:p-6 md:p-8">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold mb-2">
            <Target className="w-3.5 h-3.5" />
            <span>Admissions Intelligence & Student Inquiries</span>
          </div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">
            Rank Predictor Leads
          </h1>
          <p className="text-sm text-gray-500 font-medium mt-1">
            Real-time student contact details, class levels, schools, and target exams from the college predictor.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 hover:bg-black text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          <span>Export CSV Report</span>
        </button>
      </div>

      {/* 2. KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Total Leads</span>
            <Users className="w-5 h-5 text-blue-600" />
          </div>
          <h3 className="text-2xl font-black text-gray-900">{stats.total}</h3>
          <p className="text-[11px] text-gray-400 mt-1 font-medium">All student submissions</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Class 12 / Dropper</span>
            <GraduationCap className="w-5 h-5 text-blue-600" />
          </div>
          <h3 className="text-2xl font-black text-blue-600">{stats.class12}</h3>
          <p className="text-[11px] text-gray-400 mt-1 font-medium">Immediate counseling candidates</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Class 11</span>
            <GraduationCap className="w-5 h-5 text-purple-600" />
          </div>
          <h3 className="text-2xl font-black text-purple-600">{stats.class11}</h3>
          <p className="text-[11px] text-gray-400 mt-1 font-medium">Pre-final year aspirants</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Class 10 Foundation</span>
            <GraduationCap className="w-5 h-5 text-emerald-600" />
          </div>
          <h3 className="text-2xl font-black text-emerald-600">{stats.class10}</h3>
          <p className="text-[11px] text-gray-400 mt-1 font-medium">Junior foundation leads</p>
        </div>
      </div>

      {/* 3. Filter Bar & Search */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, school, phone, city, or exam..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-9 pr-4 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-900 focus:bg-white focus:border-blue-600 outline-none transition-all"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Class Filter */}
          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl text-xs font-bold">
            {['ALL', '12', '11', '10'].map((cls) => (
              <button
                key={cls}
                type="button"
                onClick={() => setSelectedClass(cls)}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  selectedClass === cls
                    ? 'bg-white text-gray-900 shadow-xs font-black'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {cls === 'ALL' ? 'All Classes' : `Class ${cls}`}
              </button>
            ))}
          </div>

          {/* Exam Filter */}
          <select
            value={selectedExam}
            onChange={(e) => setSelectedExam(e.target.value)}
            className="h-9 px-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 outline-none cursor-pointer"
          >
            <option value="ALL">All Exams</option>
            <option value="jee-main">JEE Main</option>
            <option value="jee-advanced">JEE Advanced</option>
            <option value="neet">NEET UG</option>
            <option value="cuet">CUET UG</option>
            <option value="clat">CLAT UG</option>
          </select>
        </div>
      </div>

      {/* 4. Leads Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        {filteredLeads.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-200">
                  <th className="p-4 text-[11px] font-black text-gray-500 uppercase tracking-wider">Student Name</th>
                  <th className="p-4 text-[11px] font-black text-gray-500 uppercase tracking-wider">Class</th>
                  <th className="p-4 text-[11px] font-black text-gray-500 uppercase tracking-wider">School / Institute</th>
                  <th className="p-4 text-[11px] font-black text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="p-4 text-[11px] font-black text-gray-500 uppercase tracking-wider">Location</th>
                  <th className="p-4 text-[11px] font-black text-gray-500 uppercase tracking-wider">Target Exam</th>
                  <th className="p-4 text-[11px] font-black text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="p-4 text-[11px] font-black text-gray-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {filteredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-blue-50/30 transition-colors">
                    {/* Student Name */}
                    <td className="p-4">
                      <div className="font-black text-gray-900 text-sm">{lead.name}</div>
                      {lead.email && !lead.email.includes('@lead.testexplorer.com') && (
                        <div className="text-[11px] text-gray-400 font-medium">{lead.email}</div>
                      )}
                    </td>

                    {/* Class */}
                    <td className="p-4">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getClassBadgeStyle(lead.studentClass)}`}>
                        {lead.studentClass.startsWith('Class') ? lead.studentClass : `Class ${lead.studentClass}`}
                      </span>
                    </td>

                    {/* School */}
                    <td className="p-4 max-w-[200px]">
                      <div className="font-semibold text-gray-800 truncate" title={lead.schoolName}>
                        {lead.schoolName}
                      </div>
                    </td>

                    {/* Contact Phone & Actions */}
                    <td className="p-4">
                      <div className="flex items-center gap-1.5 font-bold text-gray-900">
                        <Phone className="w-3.5 h-3.5 text-blue-600" />
                        <a href={`tel:${lead.phone}`} className="hover:text-blue-600 hover:underline">
                          {lead.phone}
                        </a>
                        <button
                          type="button"
                          onClick={() => handleCopyPhone(lead.id, lead.phone)}
                          title="Copy Phone"
                          className="p-1 text-gray-400 hover:text-blue-600 cursor-pointer"
                        >
                          {copiedPhoneId === lead.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <a
                          href={`https://wa.me/91${lead.phone}`}
                          target="_blank"
                          rel="noreferrer"
                          title="Chat on WhatsApp"
                          className="p-1 text-emerald-600 hover:text-emerald-700"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </td>

                    {/* Location */}
                    <td className="p-4 text-gray-600 max-w-[150px] truncate" title={lead.address}>
                      {lead.address || '—'}
                    </td>

                    {/* Target Exam & Rank */}
                    <td className="p-4">
                      <div className="font-bold text-gray-800">{lead.exam || 'General'}</div>
                      {lead.estimatedRank && (
                        <div className="text-[11px] text-blue-600 font-semibold">
                          Est. Rank: #{lead.estimatedRank}
                        </div>
                      )}
                    </td>

                    {/* Date */}
                    <td className="p-4 text-gray-400 whitespace-nowrap text-[11px]">
                      {new Date(lead.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setSelectedLeadForDetail(lead)}
                          className="p-1.5 rounded-lg text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          disabled={isDeletingId === lead.id}
                          onClick={() => handleDelete(lead.id)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer disabled:opacity-50"
                          title="Delete Lead"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* Empty State */
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
              <Target className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-gray-900">No Predictor Leads Found</h4>
            <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
              {searchQuery || selectedClass !== 'ALL' || selectedExam !== 'ALL'
                ? 'Try adjusting your search criteria or resetting filters.'
                : 'Student inquiries submitted through the college rank predictor will show up here.'}
            </p>
          </div>
        )}
      </div>

      {/* 5. Detail Modal */}
      {selectedLeadForDetail && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-gray-100">
            <button
              onClick={() => setSelectedLeadForDetail(null)}
              className="absolute top-5 right-5 p-1.5 rounded-full text-gray-400 hover:text-gray-900 hover:bg-gray-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-lg">
                {selectedLeadForDetail.name[0]?.toUpperCase() || 'S'}
              </div>
              <div>
                <h3 className="text-lg font-black text-gray-900">{selectedLeadForDetail.name}</h3>
                <span className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold border mt-0.5 ${getClassBadgeStyle(selectedLeadForDetail.studentClass)}`}>
                  {selectedLeadForDetail.studentClass}
                </span>
              </div>
            </div>

            <div className="space-y-3 text-xs bg-gray-50 p-4 rounded-2xl border border-gray-100 mb-5">
              <div className="flex justify-between">
                <span className="text-gray-400 font-bold uppercase tracking-wider">Mobile</span>
                <a href={`tel:${selectedLeadForDetail.phone}`} className="font-bold text-blue-600 hover:underline">
                  {selectedLeadForDetail.phone}
                </a>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400 font-bold uppercase tracking-wider">School</span>
                <span className="font-bold text-gray-900 text-right">{selectedLeadForDetail.schoolName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400 font-bold uppercase tracking-wider">Location</span>
                <span className="font-bold text-gray-900 text-right">{selectedLeadForDetail.address || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400 font-bold uppercase tracking-wider">Target Exam</span>
                <span className="font-bold text-gray-900">{selectedLeadForDetail.exam || 'General'}</span>
              </div>
              {selectedLeadForDetail.estimatedRank && (
                <div className="flex justify-between">
                  <span className="text-gray-400 font-bold uppercase tracking-wider">Estimated Rank</span>
                  <span className="font-black text-blue-600">#{selectedLeadForDetail.estimatedRank}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-400 font-bold uppercase tracking-wider">Date Captured</span>
                <span className="text-gray-600">
                  {new Date(selectedLeadForDetail.createdAt).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={`tel:${selectedLeadForDetail.phone}`}
                className="flex-1 h-11 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
              >
                <Phone className="w-4 h-4" />
                <span>Call Student</span>
              </a>
              <a
                href={`https://wa.me/91${selectedLeadForDetail.phone}`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

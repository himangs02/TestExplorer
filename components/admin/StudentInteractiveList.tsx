"use client";

import { useState } from "react";
import { 
  Phone, MapPin, User, GraduationCap, Calendar, Clock, 
  ChevronDown, ChevronUp, LayoutList, Table as TableIcon 
} from "lucide-react";
import EnrollmentManager from "./enrollment-manager";

interface Student {
  id: string;
  full_name: string | null;
  email: string | null;
  phone?: string | null;
  phone_no?: string | null;
  address?: string | null;
  stream?: string | null;
  created_at?: string | Date | null;
  organizations?: {
    name: string;
  } | null;
}

interface StudentInteractiveListProps {
  students: Student[];
  allSubjects?: any[];
  showEnrollment?: boolean;
}

export default function StudentInteractiveList({
  students,
  allSubjects = [],
  showEnrollment = true,
}: StudentInteractiveListProps) {
  const [expandedStudentIds, setExpandedStudentIds] = useState<Record<string, boolean>>({});
  const [viewMode, setViewMode] = useState<"auto" | "table" | "cards">("auto");

  const toggleStudent = (id: string) => {
    setExpandedStudentIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const toggleAll = () => {
    const allExpanded = students.every((s) => expandedStudentIds[s.id]);
    if (allExpanded) {
      setExpandedStudentIds({});
    } else {
      const all: Record<string, boolean> = {};
      students.forEach((s) => {
        all[s.id] = true;
      });
      setExpandedStudentIds(all);
    }
  };

  if (students.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-3xl p-12 text-center text-gray-400 font-medium shadow-2xs">
        No students found matching your filters.
      </div>
    );
  }

  const allExpanded = students.length > 0 && students.every((s) => expandedStudentIds[s.id]);

  // Determine which UI to show based on viewMode
  // "auto": cards on mobile/tablet/14" (xl:hidden), table on wide screens (hidden xl:block)
  // "table": force table
  // "cards": force cards
  const showTableClass = 
    viewMode === "table" ? "block" : 
    viewMode === "cards" ? "hidden" : 
    "hidden xl:block";

  const showCardsClass = 
    viewMode === "cards" ? "block space-y-3" : 
    viewMode === "table" ? "hidden" : 
    "xl:hidden space-y-3";

  return (
    <div className="space-y-4">
      {/* Top Toolbar: Count & View Switcher */}
      <div className="flex items-center justify-between px-1 text-xs text-gray-500 font-medium">
        <span>
          Showing <strong className="text-gray-900 font-bold">{students.length}</strong> {students.length === 1 ? 'student' : 'students'}
        </span>

        <div className="flex items-center gap-2">
          {/* Expand/Collapse All (Visible in card view) */}
          <div className={viewMode === "table" ? "hidden" : "xl:hidden"}>
            <button
              onClick={toggleAll}
              className="text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 py-1 px-2.5 rounded-lg hover:bg-blue-50 transition-colors"
            >
              {allExpanded ? (
                <>
                  <ChevronUp className="w-3.5 h-3.5" /> Collapse All
                </>
              ) : (
                <>
                  <ChevronDown className="w-3.5 h-3.5" /> Expand All
                </>
              )}
            </button>
          </div>

          {/* Quick Layout Mode Switcher */}
          <div className="flex items-center bg-gray-100 p-0.5 rounded-xl border border-gray-200">
            <button
              onClick={() => setViewMode(viewMode === "table" ? "auto" : "table")}
              title="Table View"
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                viewMode === "table" 
                  ? "bg-white text-gray-900 shadow-2xs" 
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Table</span>
            </button>
            <button
              onClick={() => setViewMode(viewMode === "cards" ? "auto" : "cards")}
              title="Card / Dropdown View"
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                viewMode === "cards" 
                  ? "bg-white text-gray-900 shadow-2xs" 
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              <LayoutList className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cards</span>
            </button>
          </div>
        </div>
      </div>

      {/* --- STREAMLINED DESKTOP TABLE VIEW --- */}
      <div className={`${showTableClass} bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-2xs`}>
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse table-auto">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
                <th className="px-4 py-3.5">Student Name</th>
                <th className="px-3 py-3.5 whitespace-nowrap">Stream</th>
                <th className="px-3 py-3.5 whitespace-nowrap">Phone Number</th>
                {showEnrollment && <th className="px-3 py-3.5 hidden 2xl:table-cell">Address</th>}
                <th className="px-3 py-3.5 whitespace-nowrap">Joined Date & Time</th>
                {showEnrollment && <th className="px-4 py-3.5 text-right whitespace-nowrap">Access Control</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {students.map((student) => {
                const phone = student.phone || student.phone_no;
                return (
                  <tr key={student.id} className="hover:bg-gray-50/80 transition-colors group">
                    {/* NAME */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-linear-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center text-gray-700 font-bold text-sm border border-gray-200 shadow-2xs shrink-0">
                          {student.full_name?.charAt(0).toUpperCase() || <User className="w-4 h-4" />}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-gray-900 text-sm truncate max-w-[150px] 2xl:max-w-[200px]">
                            {student.full_name || "Unknown"}
                          </div>
                          <div className="text-[11px] text-gray-400 truncate max-w-[150px] 2xl:max-w-[200px]">
                            {student.email || "No email"}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* STREAM */}
                    <td className="px-3 py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full w-fit border border-blue-100">
                        <GraduationCap className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                        <span>{student.stream || "N/A"}</span>
                      </div>
                    </td>

                    {/* PHONE */}
                    <td className="px-3 py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-xs font-medium text-gray-600">
                        <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span>{phone || <span className="text-gray-300 italic">--</span>}</span>
                      </div>
                    </td>

                    {/* ADDRESS (Visible on 2XL screens) */}
                    {showEnrollment && (
                      <td className="px-3 py-3.5 hidden 2xl:table-cell">
                        <div className="flex items-center gap-1.5 text-xs font-medium text-gray-600 max-w-[180px]">
                          <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          <span className="truncate">
                            {student.address || <span className="text-gray-300 italic">No address</span>}
                          </span>
                        </div>
                      </td>
                    )}

                    {/* JOINED DATE & TIME */}
                    <td className="px-3 py-3.5 whitespace-nowrap">
                      {student.created_at ? (
                        <div className="flex flex-col text-xs" suppressHydrationWarning>
                          <span className="font-semibold text-gray-800 flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                            {new Date(student.created_at).toLocaleDateString("en-GB", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                          <span className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5 pl-5 font-medium">
                            <Clock className="w-3 h-3 text-gray-400 shrink-0" />
                            {new Date(student.created_at).toLocaleTimeString("en-US", {
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: true,
                            })}
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-300 italic text-xs">--</span>
                      )}
                    </td>

                    {/* MANAGE ACCESS BUTTON */}
                    {showEnrollment && (
                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <EnrollmentManager
                          studentId={student.id}
                          studentName={student.full_name ?? "Unknown"}
                          allSubjects={allSubjects || []}
                        />
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- RESPONSIVE CARD / DROPDOWN VIEW --- */}
      <div className={showCardsClass}>
        {students.map((student) => {
          const isExpanded = !!expandedStudentIds[student.id];
          const phone = student.phone || student.phone_no;

          return (
            <div
              key={student.id}
              className="bg-white border border-gray-200 rounded-2xl shadow-2xs overflow-hidden transition-all duration-200 hover:border-gray-300"
            >
              {/* Primary Card Header / Trigger */}
              <div
                onClick={() => toggleStudent(student.id)}
                className="p-3.5 sm:p-4 flex items-center justify-between gap-3 cursor-pointer select-none hover:bg-gray-50/60 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 bg-linear-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center text-gray-700 font-bold border border-gray-200 shadow-2xs shrink-0">
                    {student.full_name?.charAt(0).toUpperCase() || <User className="w-5 h-5" />}
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-gray-900 text-sm truncate">
                      {student.full_name || "Unknown"}
                    </div>
                    <div className="text-xs text-gray-400 truncate">
                      {student.email || "No email"}
                    </div>
                    <div className="mt-1 flex items-center gap-1.5 text-[11px] font-semibold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full w-fit border border-blue-100">
                      <GraduationCap className="w-3 h-3 text-blue-500 shrink-0" />
                      <span>{student.stream || "N/A"}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <div className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors">
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-200 ${
                        isExpanded ? "rotate-180 text-blue-600" : ""
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* Collapsible Dropdown Details */}
              {isExpanded && (
                <div className="px-4 pb-4 pt-2 border-t border-gray-100 bg-gray-50/60 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-gray-600">
                    {/* Phone */}
                    <div className="flex items-center gap-2 p-2.5 bg-white rounded-xl border border-gray-150">
                      <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <div className="min-w-0">
                        <span className="text-[10px] text-gray-400 block font-semibold uppercase">Phone</span>
                        <span className="font-medium text-gray-800">{phone || "Not provided"}</span>
                      </div>
                    </div>

                    {/* Address */}
                    {showEnrollment && (
                      <div className="flex items-center gap-2 p-2.5 bg-white rounded-xl border border-gray-150">
                        <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <div className="min-w-0">
                          <span className="text-[10px] text-gray-400 block font-semibold uppercase">Address</span>
                          <span className="font-medium text-gray-800 truncate block">
                            {student.address || "No address"}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Joined Date & Time */}
                    <div className="flex items-center gap-2 p-2.5 bg-white rounded-xl border border-gray-150 sm:col-span-2">
                      <Calendar className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <span className="text-[10px] text-gray-400 block font-semibold uppercase">Joined Date & Time</span>
                        <div className="flex items-center gap-2 font-medium text-gray-800">
                          {student.created_at ? (
                            <>
                              <span>
                                {new Date(student.created_at).toLocaleDateString("en-GB", {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                })}
                              </span>
                              <span className="text-gray-400 font-normal">at</span>
                              <span className="flex items-center gap-1 text-gray-600">
                                <Clock className="w-3 h-3 text-gray-400" />
                                {new Date(student.created_at).toLocaleTimeString("en-US", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  hour12: true,
                                })}
                              </span>
                            </>
                          ) : (
                            <span className="text-gray-400">--</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Access Control Button */}
                  {showEnrollment && (
                    <div className="pt-1 flex justify-end">
                      <EnrollmentManager
                        studentId={student.id}
                        studentName={student.full_name ?? "Unknown"}
                        allSubjects={allSubjects || []}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

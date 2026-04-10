"use client";

import React, { useEffect, useState } from 'react';
import { Download, FileText } from 'lucide-react';
import { downloadStudentWeekReportAPI } from '../../lib/api';

type Member = {
  id: string;
  name: string;
  email: string;
  role?: string;
};

type GroupInfo = {
  id: string;
  name: string;
  topic?: string | null;
  supervisor?: {
    name?: string;
    email?: string;
  } | null;
  members: Member[];
};

type WeekInfo = {
  id: string;
  name: string;
  phase_title?: string | null;
  status?: string;
  submission_comments?: string | null;
  submitted_at?: string | null;
};

type ReportStudent = {
  name: string;
  reg: string;
  mobile: string;
  email: string;
};

type ReportFormState = {
  courseCode: string;
  semesterSection: string;
  facultySupervisor: string;
  weekInfo: string;
  projectTitle: string;
  programmingLanguage: string;
  projectStatus: string;
  weeklySummary: string;
  individualContribution: string;
  students: ReportStudent[];
};

type StudentReportFormProps = {
  group: GroupInfo;
  activeWeek: WeekInfo | null;
};

function buildWeekLabel(activeWeek: WeekInfo | null) {
  if (!activeWeek) return '';
  if (!activeWeek.submitted_at) return activeWeek.name;
  const submittedDate = new Date(activeWeek.submitted_at);
  return `${activeWeek.name} - ${submittedDate.toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
  })}`;
}

function createInitialForm(group: GroupInfo, activeWeek: WeekInfo | null): ReportFormState {
  return {
    courseCode: 'AIM2270',
    semesterSection: 'IV / B',
    facultySupervisor: group.supervisor?.name || '',
    weekInfo: buildWeekLabel(activeWeek),
    projectTitle: group.topic || group.name,
    programmingLanguage: '',
    projectStatus: activeWeek?.status || '',
    weeklySummary: activeWeek?.submission_comments || '',
    individualContribution: '',
    students: group.members.map((member) => ({
      name: member.name,
      reg: '',
      mobile: '',
      email: member.email,
    })),
  };
}

export default function StudentReportForm({ group, activeWeek }: StudentReportFormProps) {
  const [form, setForm] = useState<ReportFormState>(() => createInitialForm(group, activeWeek));
  const [isGenerating, setIsGenerating] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    setForm(createInitialForm(group, activeWeek));
    setStatusMessage('');
    setErrorMessage('');
  }, [group, activeWeek]);

  const updateField = (field: keyof Omit<ReportFormState, 'students'>, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const updateStudentField = (index: number, field: keyof ReportStudent, value: string) => {
    setForm((current) => ({
      ...current,
      students: current.students.map((student, i) =>
        i === index ? { ...student, [field]: value } : student
      ),
    }));
  };

  const handleDownload = async () => {
    if (!activeWeek) {
      setErrorMessage('Select a week before generating the report.');
      return;
    }

    setIsGenerating(true);
    setStatusMessage('');
    setErrorMessage('');

    try {
      const blob = await downloadStudentWeekReportAPI(activeWeek.id, form);
      const objectUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = `${group.name}_${activeWeek.name}_Weekly_Report.pdf`.replace(/\s+/g, '_');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(objectUrl);
      setStatusMessage('Weekly progress report downloaded.');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to generate report.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="rounded-2xl border border-[#E8DDCC] bg-[#FCFAF7] p-6 shadow-sm">
      <div className="mb-6 flex flex-col gap-4 border-b border-[#E8DDCC] pb-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-[#8C6D56]">
            <FileText size={16} />
            <span className="text-[10px] font-bold uppercase tracking-[0.18em]">Weekly Report Generator</span>
          </div>
          <h3 className="font-serif text-2xl font-bold text-gray-900">Formal Progress Report</h3>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-600">
            Fill in the academic details below and download a formatted PDF weekly report that you can submit to your supervisor.
          </p>
        </div>

        <button
          className="flex items-center justify-center gap-2 rounded-lg bg-[#784E35] px-5 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#5A3A28] disabled:cursor-not-allowed disabled:bg-gray-400"
          onClick={handleDownload}
          disabled={isGenerating || !activeWeek}
        >
          <Download size={16} />
          {isGenerating ? 'Generating...' : 'Download PDF'}
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="text-sm font-semibold text-[#5B4636]">
          Course Code
          <input
            className="mt-2 w-full rounded-lg border border-[#E3D8CB] bg-white px-4 py-3 text-sm outline-none transition-colors focus:border-[#A06B40]"
            value={form.courseCode}
            onChange={(e) => updateField('courseCode', e.target.value)}
          />
        </label>
        <label className="text-sm font-semibold text-[#5B4636]">
          Semester / Section
          <input
            className="mt-2 w-full rounded-lg border border-[#E3D8CB] bg-white px-4 py-3 text-sm outline-none transition-colors focus:border-[#A06B40]"
            value={form.semesterSection}
            onChange={(e) => updateField('semesterSection', e.target.value)}
          />
        </label>
        <label className="text-sm font-semibold text-[#5B4636]">
          Faculty Supervisor
          <input
            className="mt-2 w-full rounded-lg border border-[#E3D8CB] bg-white px-4 py-3 text-sm outline-none transition-colors focus:border-[#A06B40]"
            value={form.facultySupervisor}
            onChange={(e) => updateField('facultySupervisor', e.target.value)}
          />
        </label>
        <label className="text-sm font-semibold text-[#5B4636]">
          Week / Date Label
          <input
            className="mt-2 w-full rounded-lg border border-[#E3D8CB] bg-white px-4 py-3 text-sm outline-none transition-colors focus:border-[#A06B40]"
            value={form.weekInfo}
            onChange={(e) => updateField('weekInfo', e.target.value)}
          />
        </label>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <label className="text-sm font-semibold text-[#5B4636]">
          Project Title
          <input
            className="mt-2 w-full rounded-lg border border-[#E3D8CB] bg-white px-4 py-3 text-sm outline-none transition-colors focus:border-[#A06B40]"
            value={form.projectTitle}
            onChange={(e) => updateField('projectTitle', e.target.value)}
          />
        </label>
        <label className="text-sm font-semibold text-[#5B4636]">
          Programming Language / Stack
          <input
            className="mt-2 w-full rounded-lg border border-[#E3D8CB] bg-white px-4 py-3 text-sm outline-none transition-colors focus:border-[#A06B40]"
            value={form.programmingLanguage}
            onChange={(e) => updateField('programmingLanguage', e.target.value)}
            placeholder="React, Node.js, SQLite, Python..."
          />
        </label>
      </div>

      <div className="mt-4">
        <label className="text-sm font-semibold text-[#5B4636]">
          Project Status (% completed or review status)
          <input
            className="mt-2 w-full rounded-lg border border-[#E3D8CB] bg-white px-4 py-3 text-sm outline-none transition-colors focus:border-[#A06B40]"
            value={form.projectStatus}
            onChange={(e) => updateField('projectStatus', e.target.value)}
            placeholder="45% complete / Submitted / Pending review"
          />
        </label>
      </div>

      <div className="mt-6">
        <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.16em] text-gray-500">Students</p>
        <div className="grid gap-4 md:grid-cols-2">
          {form.students.map((student, index) => (
            <div key={`${student.email || student.name}-${index}`} className="rounded-xl border border-[#E8DDCC] bg-white p-4">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-[#8C6D56]">Student {index + 1}</p>
              <div className="grid gap-3">
                <input className="rounded-lg border border-[#E3D8CB] bg-[#FCFAF7] px-3 py-2 text-sm outline-none focus:border-[#A06B40]" value={student.name} onChange={(e) => updateStudentField(index, 'name', e.target.value)} placeholder="Full name" />
                <input className="rounded-lg border border-[#E3D8CB] bg-[#FCFAF7] px-3 py-2 text-sm outline-none focus:border-[#A06B40]" value={student.reg} onChange={(e) => updateStudentField(index, 'reg', e.target.value)} placeholder="Registration number" />
                <input className="rounded-lg border border-[#E3D8CB] bg-[#FCFAF7] px-3 py-2 text-sm outline-none focus:border-[#A06B40]" value={student.mobile} onChange={(e) => updateStudentField(index, 'mobile', e.target.value)} placeholder="Mobile number" />
                <input className="rounded-lg border border-[#E3D8CB] bg-[#FCFAF7] px-3 py-2 text-sm outline-none focus:border-[#A06B40]" value={student.email} onChange={(e) => updateStudentField(index, 'email', e.target.value)} placeholder="Email address" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-4">
        <label className="text-sm font-semibold text-[#5B4636]">
          Weekly Project Progress Summary
          <textarea className="mt-2 min-h-[130px] w-full rounded-xl border border-[#E3D8CB] bg-white px-4 py-3 text-sm outline-none focus:border-[#A06B40]" value={form.weeklySummary} onChange={(e) => updateField('weeklySummary', e.target.value)} placeholder="Describe what the group completed this week." />
        </label>
        <label className="text-sm font-semibold text-[#5B4636]">
          Individual Contribution of Each Student
          <textarea className="mt-2 min-h-[130px] w-full rounded-xl border border-[#E3D8CB] bg-white px-4 py-3 text-sm outline-none focus:border-[#A06B40]" value={form.individualContribution} onChange={(e) => updateField('individualContribution', e.target.value)} placeholder="Example: Aditi - model training, Rahul - UI implementation, ..." />
        </label>
      </div>

      {(statusMessage || errorMessage) && (
        <div className={`mt-4 rounded-lg px-4 py-3 text-sm font-medium ${errorMessage ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
          {errorMessage || statusMessage}
        </div>
      )}
    </div>
  );
}

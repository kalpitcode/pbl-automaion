import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Download, FileText, MessageSquare, UploadCloud } from 'lucide-react';
import { downloadStudentSubmissionFileAPI, submitWeekAPI } from '../../lib/api';
import type { Week } from '../../dashboard/student/page';

interface SubmissionAreaProps {
  weeks: Week[];
  onSubmissionSaved: () => Promise<void>;
}

type SelectedUpload = {
  name: string;
  type: string;
  size: number;
  contentBase64: string;
};

function hasSubmissionData(week: Week | null) {
  if (!week) return false;

  return Boolean(
    week.submitted_at ||
      week.submitted_file_name ||
      (typeof week.submission_comments === 'string' && week.submission_comments.trim()) ||
      ['DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED'].includes((week.status || '').toUpperCase())
  );
}

function getDisplayStatus(week: Week | null) {
  if (!week) return 'PENDING';
  if (!hasSubmissionData(week) && week.status.toUpperCase() === 'PENDING') {
    return 'AWAITING_SUBMISSION';
  }

  return week.status.toUpperCase();
}

function formatFileSize(size?: number | null) {
  if (!size) return '';
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(2)} MB`;
}

async function toBase64(file: File) {
  const buffer = await file.arrayBuffer();
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000;

  for (let index = 0; index < bytes.length; index += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize));
  }

  return window.btoa(binary);
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; text: string; label: string }> = {
    AWAITING_SUBMISSION: { bg: 'bg-gray-200', text: 'text-gray-700', label: 'Awaiting Submission' },
    DRAFT: { bg: 'bg-[#F8BC95]', text: 'text-[#6B4B38]', label: 'Draft' },
    PENDING: { bg: 'bg-[#C48C62]', text: 'text-white', label: 'Pending' },
    SUBMITTED: { bg: 'bg-[#845EC2]', text: 'text-white', label: 'Submitted' },
    APPROVED: { bg: 'bg-[#1E824C]', text: 'text-white', label: 'Approved' },
    REJECTED: { bg: 'bg-[#B94040]', text: 'text-white', label: 'Rejected' },
  };
  const cfg = map[status.toUpperCase()] ?? map.PENDING;
  return (
    <span className={`${cfg.bg} ${cfg.text} text-[10px] font-bold px-3 py-1 rounded-[4px] tracking-wider uppercase`}>
      {cfg.label}
    </span>
  );
}

export function SubmissionArea({ weeks, onSubmissionSaved }: SubmissionAreaProps) {
  const [activeWeekId, setActiveWeekId] = useState<string | null>(
    weeks.length > 0 ? weeks[0].id : null
  );
  const [comments, setComments] = useState('');
  const [selectedFile, setSelectedFile] = useState<SelectedUpload | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const activeWeek = weeks.find(w => w.id === activeWeekId) ?? weeks[0] ?? null;
  const displayStatus = getDisplayStatus(activeWeek);
  const currentUploadedFile = useMemo(() => {
    if (!activeWeek?.submitted_file_name) return null;
    return {
      name: activeWeek.submitted_file_name,
      type: activeWeek.submitted_file_type || 'application/octet-stream',
      size: activeWeek.submitted_file_size || 0,
    };
  }, [activeWeek]);

  // Split weeks functionally
  const regularWeeks = weeks.filter(w => w.week_number <= 12);
  const termWeeks = weeks.filter(w => w.week_number > 12);
  const pastWeeks = weeks.filter(w => w.status === 'APPROVED' || w.status === 'REJECTED');

  useEffect(() => {
    if (!weeks.length) {
      setActiveWeekId(null);
      return;
    }

    if (!activeWeekId || !weeks.some((week) => week.id === activeWeekId)) {
      const preferredWeek =
        [...weeks].reverse().find((week) => ['REJECTED', 'DRAFT', 'SUBMITTED', 'PENDING'].includes(week.status)) ||
        weeks[0];
      setActiveWeekId(preferredWeek.id);
    }
  }, [weeks, activeWeekId]);

  useEffect(() => {
    setComments(activeWeek?.submission_comments || '');
    setSelectedFile(null);
    setStatusMessage('');
    setErrorMessage('');
  }, [activeWeekId, activeWeek?.submission_comments]);

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelection = async (file: File | null) => {
    setStatusMessage('');
    setErrorMessage('');

    if (!file) {
      return;
    }

    const extension = file.name.split('.').pop()?.toLowerCase() || '';
    if (!['pdf', 'doc', 'docx'].includes(extension)) {
      setErrorMessage('Only PDF, DOC, and DOCX files are allowed.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage('Please keep uploads under 10 MB.');
      return;
    }

    const contentBase64 = await toBase64(file);
    setSelectedFile({
      name: file.name,
      type: file.type,
      size: file.size,
      contentBase64,
    });
  };

  const handleFileInputChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    await handleFileSelection(file);
    event.target.value = '';
  };

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    await handleFileSelection(event.dataTransfer.files?.[0] || null);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleDownloadCurrentFile = async () => {
    if (!activeWeek?.submitted_file_name) {
      return;
    }

    try {
      const blob = await downloadStudentSubmissionFileAPI(activeWeek.id);
      const objectUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = activeWeek.submitted_file_name;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(objectUrl);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to download the uploaded file.');
    }
  };

  const handleSubmit = async (isDraft: boolean) => {
    if (!activeWeek) {
      setErrorMessage('Select a week before uploading.');
      return;
    }

    if (displayStatus === 'APPROVED') {
      setErrorMessage('Approved reports are locked and cannot be changed.');
      return;
    }

    setIsSubmitting(true);
    setStatusMessage('');
    setErrorMessage('');

    try {
      await submitWeekAPI(activeWeek.id, {
        comments,
        isDraft,
        file: selectedFile || undefined,
      });
      await onSubmissionSaved();
      setSelectedFile(null);
      setStatusMessage(isDraft ? 'Draft saved successfully.' : 'Weekly report submitted successfully.');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to save your weekly report.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <div className="bg-white flex-1 shadow-sm rounded-xl py-12 px-14 mb-8">

        {/* Header */}
        <div className="mb-10">
          <h2 className="font-serif font-bold text-3xl text-foreground tracking-tight mb-3">
            Weekly Report Submission
          </h2>
          <p className="text-gray-600 text-sm">
            Document your progress and academic insights for the current sprint.
          </p>
        </div>

        {/* Week Selector */}
        {weeks.length > 0 ? (
          <div className="mb-10">
            <p className="text-[11px] font-bold text-gray-500 mb-4 tracking-[0.15em] uppercase">
              Select Academic Week
            </p>
            <div className="flex flex-wrap gap-3 mb-4">
              {regularWeeks.map((week) => (
                <button
                  key={week.id}
                  onClick={() => setActiveWeekId(week.id)}
                  className={`w-12 h-12 rounded-[4px] font-bold text-sm flex items-center justify-center transition-colors shadow-sm ${
                    activeWeekId === week.id
                      ? 'bg-[#6F4E37] text-white shadow-md'
                      : 'bg-[#F9F4EF] text-[#8C6D56] hover:bg-[#F0E6DA]'
                  }`}
                >
                  {String(week.week_number).padStart(2, '0')}
                </button>
              ))}
            </div>
            
            {/* Term Submissions */}
            {termWeeks.length > 0 && (
               <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-gray-100">
                 {termWeeks.map((week) => (
                    <button
                      key={week.id}
                      onClick={() => setActiveWeekId(week.id)}
                      className={`px-6 py-3 rounded-[4px] font-bold text-sm flex items-center justify-center transition-colors shadow-sm ${
                        activeWeekId === week.id
                          ? 'bg-[#6F4E37] text-white shadow-md'
                          : 'bg-[#F9F4EF] text-[#8C6D56] hover:bg-[#F0E6DA]'
                      }`}
                    >
                      {week.name}
                    </button>
                 ))}
               </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-gray-400 italic mb-10">No academic weeks configured yet.</p>
        )}

        {/* Active Week Phase Bar */}
        {activeWeek && (
          <div className="bg-[#FAF6F0] rounded-md p-4 mb-10 flex items-center justify-between border border-[#EBE3D5]">
            <div className="flex items-center space-x-3">
              <div className="w-2.5 h-2.5 rounded-full bg-[#A06B40] shrink-0"></div>
              <p className="text-sm font-bold text-gray-800">
                {activeWeek.name}{activeWeek.phase_title ? `: ${activeWeek.phase_title}` : ''}
              </p>
            </div>
            <StatusBadge status={displayStatus} />
          </div>
        )}

        {/* Upload Box */}
        <div
          className="border-2 border-dashed border-[#DAC5AA] rounded-2xl flex flex-col items-center justify-center py-20 mb-6 bg-white/50"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <div className="w-12 h-12 bg-[#76543A] rounded-full flex items-center justify-center text-white mb-6">
            <UploadCloud size={24} />
          </div>
          <h3 className="text-lg font-bold text-foreground mb-3">Upload Weekly Report</h3>
          <p className="text-sm text-gray-500 text-center max-w-sm mb-6 leading-relaxed">
            Drag and drop your PDF, DOC, or DOCX file here, or click to browse files from your computer.
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx"
            className="hidden"
            onChange={handleFileInputChange}
          />
          <button
            className="bg-white border text-sm font-bold text-[#76543A] border-gray-200 px-6 py-2 rounded shadow-sm hover:bg-gray-50 transition-colors"
            onClick={openFilePicker}
            type="button"
          >
            Select Files
          </button>
        </div>

        {(selectedFile || currentUploadedFile) && (
          <div className="mb-10 rounded-xl border border-[#E8DDCC] bg-[#FAF6F0] p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E8DDCC] text-[#76543A]">
                  <FileText size={18} />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">
                    {selectedFile?.name || currentUploadedFile?.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {selectedFile
                      ? `Selected now - ${formatFileSize(selectedFile.size)}`
                      : `Uploaded${activeWeek?.submitted_at ? ` on ${new Date(activeWeek.submitted_at).toLocaleDateString()}` : ''} - ${formatFileSize(currentUploadedFile?.size)}`}
                  </p>
                </div>
              </div>
              {currentUploadedFile && !selectedFile && (
                <button
                  className="flex items-center gap-2 rounded bg-white px-4 py-2 text-xs font-bold text-[#76543A] shadow-sm transition-colors hover:bg-gray-50"
                  onClick={handleDownloadCurrentFile}
                  type="button"
                >
                  <Download size={14} />
                  Download
                </button>
              )}
            </div>
          </div>
        )}

        {/* Comments Area */}
        <div className="mb-10">
          <div className="flex items-center space-x-3 text-foreground font-bold text-sm mb-4">
            <MessageSquare size={16} />
            <span>Submission Comments</span>
          </div>
          <textarea
            className="w-full bg-[#EFEBE4] border-0 rounded-lg p-5 text-sm text-gray-700 min-h-[140px] focus:ring-1 focus:ring-primary focus:outline-none resize-none placeholder-gray-500 font-medium"
            placeholder="Add notes for your supervisor regarding this week's progress or specific blockers..."
            value={comments}
            onChange={(event) => setComments(event.target.value)}
          ></textarea>
        </div>

        {activeWeek?.supervisor_feedback && (
          <div className="mb-10 rounded-xl border border-red-100 bg-red-50 p-5">
            <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.15em] text-red-700">Supervisor Feedback</p>
            <p className="text-sm leading-relaxed text-red-900">{activeWeek.supervisor_feedback}</p>
          </div>
        )}

        {(statusMessage || errorMessage) && (
          <div
            className={`mb-6 rounded-lg px-4 py-3 text-sm font-medium ${
              errorMessage ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
            }`}
          >
            {errorMessage || statusMessage}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4">
          <button
            className="bg-[#F8BC95] hover:bg-[#E8A57A] text-[#815E41] font-bold py-3.5 px-8 rounded shadow-sm text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-60"
            onClick={() => handleSubmit(true)}
            type="button"
            disabled={isSubmitting || !activeWeek}
          >
            Save Draft
          </button>
          <button
            className="bg-[#6B4B38] hover:bg-[#5C4030] text-white font-bold py-3.5 px-8 rounded shadow-sm text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-60"
            onClick={() => handleSubmit(false)}
            type="button"
            disabled={isSubmitting || !activeWeek}
          >
            {isSubmitting ? 'Saving...' : 'Submit Report'}
          </button>
        </div>
      </div>

      {/* Past Reports Row */}
      {pastWeeks.length > 0 && (
        <div className="flex space-x-6">
          {pastWeeks.slice(0, 2).map((week) => (
            <div key={week.id} className="flex-1 bg-sidebar rounded-xl p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-bold text-gray-500 mb-1 tracking-widest uppercase">
                    {week.name} Report
                  </p>
                  <p className="text-sm font-bold text-foreground">
                    {week.phase_title ?? 'Report'}
                  </p>
                </div>
                <StatusBadge status={week.status} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

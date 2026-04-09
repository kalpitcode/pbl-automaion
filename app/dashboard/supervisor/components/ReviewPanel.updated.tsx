import React, { useEffect, useState } from 'react';
import { History, Users } from 'lucide-react';
import { approveWeekAPI, rejectWeekAPI } from '../../../lib/api';
import WeeklyReportForm from './WeeklyReportForm';

type ReviewPanelProps = {
  groupData: any;
  onUpdate: () => void;
};

function getInitials(name: string) {
  if (!name) return '??';
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; text: string; label: string }> = {
    PENDING: { bg: 'bg-[#C48C62]', text: 'text-white', label: 'Pending' },
    SUBMITTED: { bg: 'bg-[#845EC2]', text: 'text-white', label: 'Submitted' },
    APPROVED: { bg: 'bg-[#1E824C]', text: 'text-white', label: 'Approved' },
    REJECTED: { bg: 'bg-[#B94040]', text: 'text-white', label: 'Rejected' },
  };
  const config = map[(status || 'PENDING').toUpperCase()] ?? map.PENDING;

  return (
    <span className={`${config.bg} ${config.text} rounded-[4px] px-3 py-1 text-[10px] font-bold uppercase tracking-wider`}>
      {config.label}
    </span>
  );
}

export default function ReviewPanel({ groupData, onUpdate }: ReviewPanelProps) {
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedWeekId, setSelectedWeekId] = useState<string>('');
  const [reviewAction, setReviewAction] = useState('APPROVE');

  useEffect(() => {
    if (groupData?.weeks?.length > 0) {
      const reviewableWeek = groupData.weeks.find((week: any) =>
        ['SUBMITTED', 'PENDING'].includes(week.status)
      );
      setSelectedWeekId(reviewableWeek?.id || groupData.weeks[0].id);
      setFeedback('');
    }
  }, [groupData]);

  if (!groupData) {
    return (
      <div className="flex h-full flex-1 flex-col items-center justify-center bg-white text-gray-400">
        <p className="animate-pulse">Select a group to begin review</p>
      </div>
    );
  }

  const activeWeek = groupData.weeks?.find((week: any) => week.id === selectedWeekId) || null;
  const needsReview = activeWeek ? ['PENDING', 'SUBMITTED'].includes(activeWeek.status) : false;
  const execSummary =
    activeWeek?.submission_comments ||
    (needsReview ? 'No submission summary provided yet.' : 'No submission summary provided.');

  const handleSubmitReview = async () => {
    if (!activeWeek) return;

    if (reviewAction === 'REJECT' && !feedback.trim()) {
      alert('Feedback is required when requesting revisions.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (reviewAction === 'APPROVE') {
        await approveWeekAPI(groupData.group.id, activeWeek.id);
      } else {
        await rejectWeekAPI(groupData.group.id, activeWeek.id, feedback);
      }

      setFeedback('');
      onUpdate();
    } catch (error: any) {
      alert(error.message || 'Error processing review');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-full flex-1 overflow-y-auto bg-white px-10 py-6">
      <div className="mb-2 flex items-center gap-2">
        <span className="h-1.5 w-1.5 rounded-full bg-orange-400"></span>
        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Active Review</span>
      </div>

      <div className="mb-6 flex items-start justify-between border-b border-gray-100 pb-6">
        <div>
          <h1 className="mb-2 font-serif text-4xl font-bold text-gray-900">{groupData.group.name}</h1>
          <p className="mb-3 text-sm font-medium text-[#A06B40]">{groupData.group.topic || 'No topic assigned'}</p>

          <div className="mt-4 flex items-center gap-2">
            <Users size={14} className="text-gray-400" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Members</span>
            <div className="ml-2 flex flex-wrap gap-2">
              {groupData.group.members?.map((member: any) => (
                <div
                  key={member.id}
                  className="flex items-center gap-1.5 rounded border border-[#E8DDCC] bg-[#F9F4EF] px-2 py-1 shadow-sm"
                >
                  <div className="flex h-4 w-4 items-center justify-center rounded bg-[#DAC5AA] text-[8px] font-bold text-[#76543A]">
                    {getInitials(member.name)}
                  </div>
                  <span className="text-xs font-semibold text-[#8C6D56]">{member.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1">
          <label className="mb-1 text-[10px] font-bold uppercase tracking-widest text-gray-400">
            Submission Cycle
          </label>
          <select
            className="min-w-[220px] cursor-pointer rounded bg-[#F4EBE3] px-4 py-2.5 text-sm font-bold text-[#784E35] shadow-sm outline-none focus:ring-2 focus:ring-[#784E35]"
            value={selectedWeekId}
            onChange={(event) => {
              setSelectedWeekId(event.target.value);
              setFeedback('');
            }}
          >
            {groupData.weeks?.map((week: any) => (
              <option key={week.id} value={week.id}>
                {week.name} {week.status !== 'PENDING' ? `[${week.status}]` : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mb-8 flex items-center justify-between rounded-xl border border-[#EBE3D5] bg-[#FAF6F0] p-4">
        <div className="flex items-center gap-4">
          <StatusBadge status={activeWeek?.status || 'PENDING'} />
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Submission Log</p>
            <p className="mt-1 text-sm font-bold text-gray-900">
              {activeWeek?.submitted_at
                ? `Uploaded on ${new Date(activeWeek.submitted_at).toLocaleDateString()} at ${new Date(
                    activeWeek.submitted_at
                  ).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                : 'No files uploaded yet.'}
            </p>
          </div>
        </div>
        <button className="flex items-center gap-2 rounded px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-[#76543A] transition-colors hover:bg-[#E8DDCC]">
          <History size={14} />
          History
        </button>
      </div>

      <div className="mb-8">
        <h3 className="mb-4 text-[11px] font-bold uppercase tracking-[0.15em] text-gray-500">Executive Summary</h3>
        <div className="rounded-lg border border-dashed border-[#DAC5AA] bg-white p-6">
          <p className="font-serif text-[15px] italic leading-relaxed text-[#784E35]">{execSummary}</p>
        </div>
      </div>

      <WeeklyReportForm group={groupData.group} activeWeek={activeWeek} />

      <div className="mb-10 mt-10 border-t border-gray-100 pt-8">
        <h3 className="mb-2 font-serif text-2xl font-bold text-gray-900">Provide Feedback</h3>
        <p className="mb-6 text-sm text-gray-500">
          Review the submission above and decide on its academic standing.
        </p>

        <textarea
          className="mb-4 min-h-[140px] w-full resize-none rounded-lg bg-[#EFEBE4] p-5 text-sm font-medium text-gray-800 outline-none placeholder-gray-500 focus:ring-1 focus:ring-[#76543A]"
          placeholder={
            needsReview
              ? 'Enter academic feedback or guidance for revisions here...'
              : '(Submission is not awaiting review)'
          }
          value={feedback}
          onChange={(event) => setFeedback(event.target.value)}
          disabled={!needsReview}
        ></textarea>

        <div className="flex items-center justify-between rounded-xl border border-[#EBE3D5] bg-[#FAF6F0] p-4">
          <div className="flex items-center gap-3">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-600">Decision:</label>
            <select
              className="cursor-pointer rounded border border-[#DAC5AA] bg-white px-3 py-2 text-sm font-bold text-[#76543A] shadow-sm outline-none"
              value={reviewAction}
              onChange={(event) => setReviewAction(event.target.value)}
              disabled={!needsReview}
            >
              <option value="APPROVE">Approve & Advance</option>
              <option value="REJECT">Request Revisions</option>
            </select>
          </div>

          <button
            className={`rounded px-8 py-3 text-sm font-bold shadow-sm transition-colors ${
              !needsReview
                ? 'cursor-not-allowed bg-gray-300 text-gray-500'
                : reviewAction === 'APPROVE'
                  ? 'bg-[#1E824C] text-white hover:bg-[#156338]'
                  : 'bg-[#B94040] text-white hover:bg-[#8F3030]'
            }`}
            onClick={handleSubmitReview}
            disabled={isSubmitting || !needsReview}
          >
            {isSubmitting ? 'Processing...' : reviewAction === 'APPROVE' ? 'Confirm Approval' : 'Submit Rejection'}
          </button>
        </div>
      </div>
    </div>
  );
}

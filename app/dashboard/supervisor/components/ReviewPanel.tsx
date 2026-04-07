import React, { useState, useEffect } from 'react';
import { History, Download, Users } from 'lucide-react';
import { approveWeekAPI, rejectWeekAPI } from '../../../lib/api';

type ReviewPanelProps = {
  groupData: any;
  onUpdate: () => void;
};

// Reusable Initial Helper to match student dashboard
function getInitials(name: string) {
  if (!name) return '??';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

// Reusable Status Badge to match student dashboard exactly
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; text: string; label: string }> = {
    PENDING:  { bg: 'bg-[#C48C62]',  text: 'text-white',         label: 'Pending'  },
    APPROVED: { bg: 'bg-[#1E824C]',  text: 'text-white',         label: 'Approved' },
    REJECTED: { bg: 'bg-[#B94040]',  text: 'text-white',         label: 'Rejected' },
  };
  const cfg = map[(status || 'PENDING').toUpperCase()] ?? map.PENDING;
  return (
    <span className={`${cfg.bg} ${cfg.text} text-[10px] font-bold px-3 py-1 rounded-[4px] tracking-wider uppercase`}>
      {cfg.label}
    </span>
  );
}

export default function ReviewPanel({ groupData, onUpdate }: ReviewPanelProps) {
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedWeekId, setSelectedWeekId] = useState<string>('');
  const [reviewAction, setReviewAction] = useState<string>('APPROVE');

  // When group changes, auto-select a week that needs attention
  useEffect(() => {
    if (groupData?.weeks?.length > 0) {
      const pendingWeek = groupData.weeks.find((w: any) => w.status === 'PENDING');
      setSelectedWeekId(pendingWeek?.id || groupData.weeks[0].id);
      setFeedback(''); // Reset feedback when group changes
    }
  }, [groupData]);

  if (!groupData) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-gray-400 h-full bg-white">
        <p className="animate-pulse">Select a group to begin review</p>
      </div>
    );
  }

  const activeWeek = groupData.weeks?.find((w: any) => w.id === selectedWeekId) || null;
  const isPending = activeWeek?.status === 'PENDING';

  // Restore the dynamic summary but keep a fallback
  const execSummary = activeWeek?.submission_comments || (isPending ? "No submission summary provided yet." : "No submission summary provided.");

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
    } catch (err: any) {
      alert(err.message || 'Error processing review');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto px-10 py-6 max-w-4xl bg-white h-full">
      
      {/* Top Banner / Header */}
      <div className="flex items-center gap-2 mb-2">
        <span className="w-1.5 h-1.5 rounded-full bg-orange-400"></span>
        <span className="text-[10px] font-bold text-gray-500 tracking-widest uppercase">Active Review</span>
      </div>
      
      <div className="flex justify-between items-start mb-6 border-b border-gray-100 pb-6">
        <div>
          <h1 className="text-4xl font-serif font-bold text-gray-900 mb-2">{groupData.group.name}</h1>
          <p className="text-[#A06B40] text-sm font-medium mb-3">
            {groupData.group.topic || 'No topic assigned'}
          </p>
          
          {/* Members List (Matching Student UI Style) */}
          <div className="flex items-center gap-2 mt-4">
             <Users size={14} className="text-gray-400" />
             <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Members</span>
             <div className="flex flex-wrap gap-2 ml-2">
                {groupData.group.members?.map((member: any) => (
                  <div key={member.id} className="flex items-center bg-[#F9F4EF] rounded border border-[#E8DDCC] px-2 py-1 gap-1.5 shadow-sm">
                    <div className="w-4 h-4 rounded bg-[#DAC5AA] flex items-center justify-center text-[8px] font-bold text-[#76543A]">
                      {getInitials(member.name)}
                    </div>
                    <span className="text-xs font-semibold text-[#8C6D56]">{member.name}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
        
        <div className="flex flex-col items-end gap-1">
          <label className="text-[10px] font-bold text-gray-400 tracking-widest uppercase mb-1">
            Submission Cycle
          </label>
          <select 
            className="bg-[#F4EBE3] border-none px-4 py-2.5 rounded text-[#784E35] font-bold text-sm focus:ring-2 focus:ring-[#784E35] outline-none cursor-pointer shadow-sm min-w-[200px]"
            value={selectedWeekId}
            onChange={(e) => {
               setSelectedWeekId(e.target.value);
               setFeedback('');
            }}
          >
            {groupData.weeks?.map((w: any) => (
              <option key={w.id} value={w.id}>
                {w.name} {w.status !== 'PENDING' ? `[${w.status}]` : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Dynamic Status Section */}
      <div className="flex justify-between items-center mb-8 bg-[#FAF6F0] p-4 rounded-xl border border-[#EBE3D5]">
        <div className="flex items-center gap-4">
          <StatusBadge status={activeWeek?.status || 'PENDING'} />
          <div>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Submission Log</p>
            <p className="text-sm font-bold text-gray-900 mt-1">
              {activeWeek?.submitted_at 
                ? `Uploaded on ${new Date(activeWeek.submitted_at).toLocaleDateString()} at ${new Date(activeWeek.submitted_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}` 
                : 'No files uploaded yet.'}
            </p>
          </div>
        </div>
        <button className="flex items-center gap-2 text-[#76543A] hover:bg-[#E8DDCC] px-3 py-1.5 rounded transition-colors text-xs font-bold uppercase tracking-wider">
          <History size={14} />
          History
        </button>
      </div>

      {/* Executive Summary */}
      <div className="mb-8">
        <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-[0.15em] mb-4">Executive Summary</h3>
        <div className="bg-white p-6 rounded-lg border border-dashed border-[#DAC5AA]">
          <p className="italic font-serif text-[#784E35] leading-relaxed text-[15px]">
            {execSummary}
          </p>
        </div>
      </div>

      {/* Submitted Artifacts */}
      <div className="mb-8">
        <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-4">Core Deliverable</h3>
        <div className="border border-gray-200 p-4 rounded-lg flex items-center justify-between bg-white hover:bg-gray-50 transition-colors shadow-sm w-max min-w-[350px]">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[#E8DDCC] rounded shadow-inner flex items-center justify-center overflow-hidden">
               <div className="w-full h-full flex flex-col text-[#784E35]">
                 <div className="bg-[#DABCA3] h-3 w-3/4 self-end rounded-bl"></div>
                 <div className="flex-1 flex items-center justify-center border-t-2 border-[#DABCA3] bg-[#E8DDCC] mb-1 mx-1 line-clamp-3 overflow-hidden text-[6px]">...</div>
               </div>
            </div>
            <div>
              <p className="font-bold text-gray-800 text-sm">
                {activeWeek ? `${activeWeek.name.replace(/\s/g, '_')}_Final.pdf` : 'Submission_File.pdf'}
              </p>
              <p className="text-[10px] font-bold text-gray-400 mt-0.5">4.2 MB • PDF Document</p>
            </div>
          </div>
          <button className="text-[#A06B40] hover:text-[#76543A] bg-[#F9F4EF] p-2 rounded-full transition-colors ml-6">
            <Download size={16} />
          </button>
        </div>
      </div>

      {/* Supervisor Feedback Form - Matching Student Area aesthetic */}
      <div className="mb-10 mt-10 border-t border-gray-100 pt-8">
        <h3 className="font-serif text-2xl font-bold text-gray-900 mb-2">Provide Feedback</h3>
        <p className="text-gray-500 text-sm mb-6">Review the submission above and decide on its academic standing.</p>
        
        <textarea
          className="w-full bg-[#EFEBE4] border-none p-5 rounded-lg min-h-[140px] focus:ring-1 focus:ring-[#76543A] outline-none resize-none placeholder-gray-500 font-medium text-sm text-gray-800 mb-4"
          placeholder={isPending ? "Enter academic feedback or guidance for revisions here..." : "(Submission is not pending review)"}
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          disabled={!isPending}
        ></textarea>
        
        <div className="flex justify-between items-center bg-[#FAF6F0] p-4 rounded-xl border border-[#EBE3D5]">
            <div className="flex items-center gap-3">
              <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Decision:</label>
              <select 
                className="bg-white border border-[#DAC5AA] px-3 py-2 rounded text-sm font-bold text-[#76543A] shadow-sm outline-none cursor-pointer"
                value={reviewAction}
                onChange={(e) => setReviewAction(e.target.value)}
                disabled={!isPending}
              >
                <option value="APPROVE">Approve & Advance</option>
                <option value="REJECT">Request Revisions</option>
              </select>
            </div>
            
            <button 
              className={`px-8 py-3 rounded text-sm font-bold shadow-sm transition-colors ${
                 !isPending 
                 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                 : reviewAction === 'APPROVE'
                   ? 'bg-[#1E824C] hover:bg-[#156338] text-white'
                   : 'bg-[#B94040] hover:bg-[#8F3030] text-white'
              }`}
              onClick={handleSubmitReview}
              disabled={isSubmitting || !isPending}
            >
              {isSubmitting ? 'Processing...' : (reviewAction === 'APPROVE' ? 'Confirm Approval' : 'Submit Rejection')}
            </button>
        </div>
      </div>

    </div>
  );
}

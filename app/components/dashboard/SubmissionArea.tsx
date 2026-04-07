import React, { useState } from 'react';
import { UploadCloud, MessageSquare } from 'lucide-react';
import type { Week } from '../../dashboard/student/page';

interface SubmissionAreaProps {
  weeks: Week[];
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; text: string; label: string }> = {
    PENDING:  { bg: 'bg-[#C48C62]',  text: 'text-white',         label: 'Pending'  },
    APPROVED: { bg: 'bg-[#1E824C]',  text: 'text-white',         label: 'Approved' },
    REJECTED: { bg: 'bg-[#B94040]',  text: 'text-white',         label: 'Rejected' },
  };
  const cfg = map[status.toUpperCase()] ?? map.PENDING;
  return (
    <span className={`${cfg.bg} ${cfg.text} text-[10px] font-bold px-3 py-1 rounded-[4px] tracking-wider uppercase`}>
      {cfg.label}
    </span>
  );
}

export function SubmissionArea({ weeks }: SubmissionAreaProps) {
  const [activeWeekId, setActiveWeekId] = useState<string | null>(
    weeks.length > 0 ? weeks[0].id : null
  );

  const activeWeek = weeks.find(w => w.id === activeWeekId) ?? weeks[0] ?? null;

  // Split weeks functionally
  const regularWeeks = weeks.filter(w => w.week_number <= 12);
  const termWeeks = weeks.filter(w => w.week_number > 12);
  const pastWeeks = weeks.filter(w => w.status === 'APPROVED' || w.status === 'REJECTED');

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
            <StatusBadge status={activeWeek.status} />
          </div>
        )}

        {/* Upload Box */}
        <div className="border-2 border-dashed border-[#DAC5AA] rounded-2xl flex flex-col items-center justify-center py-20 mb-10 bg-white/50">
          <div className="w-12 h-12 bg-[#76543A] rounded-full flex items-center justify-center text-white mb-6">
            <UploadCloud size={24} />
          </div>
          <h3 className="text-lg font-bold text-foreground mb-3">Upload Weekly Report</h3>
          <p className="text-sm text-gray-500 text-center max-w-sm mb-6 leading-relaxed">
            Drag and drop your PDF or DOCX file here, or click to browse files from your computer.
          </p>
          <button className="bg-white border text-sm font-bold text-[#76543A] border-gray-200 px-6 py-2 rounded shadow-sm hover:bg-gray-50 transition-colors">
            Select Files
          </button>
        </div>

        {/* Comments Area */}
        <div className="mb-10">
          <div className="flex items-center space-x-3 text-foreground font-bold text-sm mb-4">
            <MessageSquare size={16} />
            <span>Submission Comments</span>
          </div>
          <textarea
            className="w-full bg-[#EFEBE4] border-0 rounded-lg p-5 text-sm text-gray-700 min-h-[140px] focus:ring-1 focus:ring-primary focus:outline-none resize-none placeholder-gray-500 font-medium"
            placeholder="Add notes for your supervisor regarding this week's progress or specific blockers..."
          ></textarea>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4">
          <button className="bg-[#F8BC95] hover:bg-[#E8A57A] text-[#815E41] font-bold py-3.5 px-8 rounded shadow-sm text-sm transition-colors">
            Save Draft
          </button>
          <button className="bg-[#6B4B38] hover:bg-[#5C4030] text-white font-bold py-3.5 px-8 rounded shadow-sm text-sm transition-colors">
            Submit Report
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

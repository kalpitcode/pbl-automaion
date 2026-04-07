import React from 'react';
import { Users, Shield } from 'lucide-react';
import type { Group, Week } from '../../dashboard/student/page';

interface ProjectSidebarProps {
  group: Group | null;
  currentUserId: string;
  weeks: Week[];
}

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

export function ProjectSidebar({ group, currentUserId, weeks }: ProjectSidebarProps) {
  const totalWeeks = weeks.length;
  const completedWeeks = weeks.filter(w => w.status === 'APPROVED').length;
  if (!group) {
    return (
      <div className="w-72 flex flex-col h-full space-y-6">
        <div className="bg-sidebar rounded-xl p-6 shadow-sm flex items-center justify-center min-h-[200px]">
          <p className="text-sm text-gray-400 italic text-center">You are not assigned to a group yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-72 flex flex-col h-full space-y-6">
      
      {/* Top Card: Group & Members */}
      <div className="bg-sidebar rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <h3 className="font-bold text-lg tracking-tight text-[#784E35]">{group.name}</h3>
          <Users size={20} className="text-[#784E35]" />
        </div>

        {/* Supervisor */}
        <div className="mb-6">
          <p className="text-[11px] font-bold text-gray-500 mb-3 tracking-[0.15em] uppercase">Project Supervisor</p>
          {group.supervisor ? (
            <div className="bg-white p-3 rounded flex items-center space-x-3 shadow-sm border border-gray-100">
              <div className="w-8 h-8 rounded bg-[#B06020] text-white flex items-center justify-center text-xs font-bold shrink-0">
                {getInitials(group.supervisor.name)}
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">{group.supervisor.name}</p>
                <p className="text-xs text-gray-500">{group.supervisor.email}</p>
              </div>
            </div>
          ) : (
            <p className="text-xs text-gray-400 italic">No supervisor assigned yet.</p>
          )}
        </div>

        {/* Members */}
        <div className="mb-8">
          <p className="text-[11px] font-bold text-gray-500 mb-3 tracking-[0.15em] uppercase">Members</p>
          <div className="space-y-2">
            {group.members.map((member) => {
              const isMe = member.id === currentUserId;
              return (
                <div key={member.id} className="bg-white p-3 rounded flex items-center justify-between shadow-sm border border-gray-100">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 rounded bg-gray-100 flex items-center justify-center">
                      <span className="text-[10px] font-bold text-gray-600">{getInitials(member.name)}</span>
                    </div>
                    <p className="text-sm font-bold text-foreground">
                      {member.name}{isMe ? ' (You)' : ''}
                    </p>
                  </div>
                  {isMe && (
                    <span className="text-[9px] font-bold bg-[#E8DDCC] text-[#784E35] px-2 py-0.5 rounded-sm uppercase tracking-wide">
                      You
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Milestones Completed */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <p className="text-xs font-bold text-gray-500">Milestones Completed</p>
            <p className="text-xs font-bold text-[#784E35]">{completedWeeks} / {totalWeeks}</p>
          </div>
          <div className="w-full bg-[#E8DDCC] h-2 rounded-full overflow-hidden">
            <div
              className="bg-[#8A5A44] h-full transition-all duration-500"
              style={{ width: totalWeeks > 0 ? `${(completedWeeks / totalWeeks) * 100}%` : '0%' }}
            ></div>
          </div>
        </div>
      </div>

      {/* Upcoming Deadlines — static placeholder until deadline model is built */}
      <div className="bg-sidebar rounded-xl p-6 flex-1 shadow-sm">
        <h4 className="font-bold text-sm mb-5 text-foreground">Upcoming Deadlines</h4>
        <p className="text-xs text-gray-400 italic">No deadlines configured yet.</p>
      </div>
      
    </div>
  );
}

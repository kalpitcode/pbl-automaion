import React from 'react';
import { LayoutDashboard, Users, Clock, Archive, HelpCircle, GraduationCap } from 'lucide-react';
import Link from 'next/link';

export default function SupervisorSidebar() {
  return (
    <div className="w-64 bg-[#F4EBE3] min-h-screen border-r border-[#E8DDCC] flex flex-col justify-between py-6">
      
      {/* Top Section */}
      <div>
        {/* Brand */}
        <div className="px-6 flex items-center gap-3 mb-12">
          <div className="w-8 h-8 rounded-md bg-[#784E35] flex items-center justify-center text-white">
            <GraduationCap size={20} />
          </div>
          <div>
            <h1 className="font-bold text-gray-900 leading-tight">Project Portal</h1>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">Supervisor Workspace</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-1 px-4">
          <Link href="/dashboard/supervisor" className="flex items-center gap-3 px-4 py-3 bg-white text-[#784E35] rounded-xl shadow-sm transition-colors text-sm font-bold border border-[#E8DDCC] relative">
            <LayoutDashboard size={18} />
            <span>Approval Queue</span>
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[#784E35] rounded-r-md"></div>
          </Link>
          <Link href="/dashboard/supervisor/groups" className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-[#E8DDCC] rounded-xl transition-colors text-sm font-medium">
            <Users size={18} />
            <span>Assigned Groups</span>
          </Link>
          <Link href="#" className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-[#E8DDCC] rounded-xl transition-colors text-sm font-medium">
            <Clock size={18} />
            <span>Submission Queue</span>
          </Link>
          <Link href="#" className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-[#E8DDCC] rounded-xl transition-colors text-sm font-medium">
            <Archive size={18} />
            <span>Archive</span>
          </Link>
        </nav>
      </div>

      {/* Bottom Section */}
      <div className="px-6 flex flex-col gap-4">
        <button className="w-full bg-[#784E35] text-white py-3 rounded-lg text-sm font-bold hover:bg-[#5A3A28] transition-colors shadow-sm">
          Batch Review
        </button>
        <button className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors text-sm font-medium">
          <HelpCircle size={18} />
          Help Center
        </button>
      </div>

    </div>
  );
}

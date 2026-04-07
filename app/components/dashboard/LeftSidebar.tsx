import React from 'react';
import { LayoutDashboard, Compass, BarChart2, Folder, UserCircle2 } from 'lucide-react';
import Link from 'next/link';

interface LeftSidebarProps {
  user: { name: string; email: string } | null;
}

export function LeftSidebar({ user }: LeftSidebarProps) {
  return (
    <div className="bg-sidebar w-64 rounded-xl flex flex-col p-6 h-full shadow-sm">
      {/* Profile Section */}
      <div className="flex items-center space-x-3 mb-10">
        <div className="w-12 h-12 bg-[#2E3C4E] text-white rounded-lg flex items-center justify-center font-serif text-xl overflow-hidden shadow-sm">
           {/* Replace with actual image later if needed */}
           <UserCircle2 size={32} />
        </div>
        <div>
          <h3 className="font-bold text-sm text-foreground">{user?.name || 'Jordan Smith'} <span className="text-gray-400 font-normal text-xs">(You)</span></h3>
          <p className="text-xs text-gray-500">PBL Portal</p>
        </div>
      </div>

      {/* Nav Links */}
      <div className="flex flex-col flex-1">
        <h4 className="font-bold text-lg mb-6 tracking-tight text-foreground">Project Workspace</h4>
        
        <nav className="space-y-2">
          <Link href="#" className="flex items-center space-x-3 bg-white px-4 py-3 rounded-md text-sm font-semibold text-[#784E35] shadow-sm border border-transparent">
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </Link>
          <Link href="#" className="flex items-center space-x-3 px-4 py-3 rounded-md text-sm font-medium text-gray-600 hover:bg-white/50 hover:text-gray-900 transition-colors">
            <Compass size={18} />
            <span>Milestones</span>
          </Link>
          <Link href="#" className="flex items-center space-x-3 px-4 py-3 rounded-md text-sm font-medium text-gray-600 hover:bg-white/50 hover:text-gray-900 transition-colors">
            <BarChart2 size={18} />
            <span>Evaluations</span>
          </Link>
          <Link href="#" className="flex items-center space-x-3 px-4 py-3 rounded-md text-sm font-medium text-gray-600 hover:bg-white/50 hover:text-gray-900 transition-colors">
            <Folder size={18} />
            <span>Resources</span>
          </Link>
        </nav>
      </div>

      {/* New Submission Button */}
      <div className="mt-8">
        <button className="w-full bg-[#784E35] hover:bg-primary-hover text-white py-3 rounded text-sm font-bold tracking-wide transition-colors shadow-sm">
          New Submission
        </button>
      </div>
    </div>
  );
}

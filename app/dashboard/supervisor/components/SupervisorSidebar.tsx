'use client';

import React from 'react';
import { LayoutDashboard, Users, Clock, Archive, HelpCircle, GraduationCap, Award, ClipboardList } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function SupervisorSidebar() {
  const pathname = usePathname();

  const navItems = [
    { href: '/dashboard/supervisor', icon: LayoutDashboard, label: 'Overview' },
    { href: '/dashboard/supervisor/requests', icon: ClipboardList, label: 'Approval Queue' },
    { href: '/dashboard/supervisor/groups', icon: Users, label: 'Assigned Groups' },
    { href: '/dashboard/supervisor/grades', icon: Award, label: 'Grade Students' },
    { href: '#', icon: Clock, label: 'Submission Queue' },
    { href: '#', icon: Archive, label: 'Archive' },
  ];

  return (
    <div className="w-64 bg-[#F4EBE3] min-h-screen border-r border-[#E8DDCC] flex flex-col justify-between py-6">
      
      {/* Top Section */}
      <div>
        {/* Brand */}
        <div className="px-6 flex items-center gap-3 mb-10">
          <div className="w-9 h-9 rounded-lg bg-[#784E35] flex items-center justify-center text-white shadow-sm">
            <GraduationCap size={20} />
          </div>
          <div>
            <h1 className="font-bold text-gray-900 leading-tight text-[15px]">Project Portal</h1>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">Supervisor Workspace</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-1 px-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm relative ${
                  isActive
                    ? 'bg-white text-[#784E35] font-bold shadow-sm border border-[#E8DDCC]'
                    : 'text-gray-600 hover:bg-[#E8DDCC] font-medium'
                }`}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[#784E35] rounded-r-md"></div>
                )}
                <Icon size={18} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section */}
      <div className="px-6 flex flex-col gap-4">
        <button className="w-full bg-[#784E35] text-white py-3 rounded-lg text-sm font-bold hover:bg-[#5A3A28] transition-colors shadow-sm flex items-center justify-center gap-2">
          <ClipboardList size={16} />
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

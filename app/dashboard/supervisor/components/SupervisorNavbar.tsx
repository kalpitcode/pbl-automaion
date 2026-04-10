'use client';

import React from 'react';
import { Bell, Settings, Search } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function SupervisorNavbar({ user }: { user: any }) {
  const router = useRouter();
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/');
  };

  return (
    <div className="h-16 bg-[#FAF6F0] flex items-center justify-between px-8 text-sm border-b border-[#E8DDCC]">
      
      {/* Left Links */}
      <div className="flex items-center gap-8 font-medium">
        <Link href="#" className="font-bold text-gray-900 text-[15px]">Academic Editorial</Link>
        <Link href="/dashboard/supervisor" className="text-gray-900 font-semibold border-b-2 border-[#784E35] pb-0.5 transition-colors">Dashboard</Link>
        <Link href="#" className="text-gray-400 hover:text-gray-700 transition-colors">Analytics</Link>
        <Link href="#" className="text-gray-400 hover:text-gray-700 transition-colors">Resources</Link>
      </div>

      {/* Search + Right Actions */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 bg-white border border-[#E8DDCC] rounded-lg px-3 py-2 text-gray-400 text-sm">
          <Search size={14} />
          <span>Search projects...</span>
        </div>
        <button className="text-gray-400 hover:text-gray-800 transition-colors p-2 hover:bg-white rounded-lg">
          <Bell size={18} />
        </button>
        <button className="text-gray-400 hover:text-gray-800 transition-colors p-2 hover:bg-white rounded-lg">
          <Settings size={18} />
        </button>
        
        {/* User Avatar */}
        <div className="flex items-center gap-2 cursor-pointer" onClick={handleLogout} title="Click to logout">
          <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-[#E8DDCC]">
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#784E35] to-[#A06B40] text-white font-bold text-sm">
              {user?.name?.charAt(0).toUpperCase() || 'S'}
            </div>
          </div>
        </div>
      </div>
      
    </div>
  );
}

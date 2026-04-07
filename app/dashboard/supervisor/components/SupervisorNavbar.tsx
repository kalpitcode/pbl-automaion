import React from 'react';
import { Bell, Search } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function SupervisorNavbar({ user }: { user: any }) {
  const router = useRouter();
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/');
  };

  return (
    <div className="h-20 bg-[#FAF6F0] flex items-center justify-between px-8 text-sm">
      
      {/* Left Links */}
      <div className="flex items-center gap-8 font-medium">
        <Link href="#" className="font-bold text-gray-900 text-base">Academic Editorial</Link>
        <Link href="#" className="text-gray-500 hover:text-gray-900 transition-colors">Dashboard</Link>
        <Link href="#" className="text-gray-500 hover:text-gray-900 transition-colors">Analytics</Link>
        <Link href="#" className="text-gray-500 hover:text-gray-900 transition-colors">Resources</Link>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-6">
        <button className="text-gray-500 hover:text-gray-800 transition-colors bg-white p-2 border border-gray-200 rounded-full shadow-sm">
          <Bell size={18} />
        </button>
        <button className="bg-[#784E35] text-white px-5 py-2.5 rounded-lg font-bold hover:bg-[#5A3A28] transition-colors shadow-sm text-sm">
          New Project
        </button>
        
        {/* User Dropdown / Avatar */}
        <div className="flex items-center gap-3 relative cursor-pointer" onClick={handleLogout} title="Click to logout">
          <div className="w-10 h-10 rounded-xl bg-gray-200 overflow-hidden border border-gray-300">
            {/* Simple placeholder for avatar relying on first initial or just icon */}
            <div className="w-full h-full flex items-center justify-center bg-[#E8DDCC] text-[#784E35] font-bold text-lg">
              {user?.name?.charAt(0).toUpperCase() || 'S'}
            </div>
          </div>
        </div>
      </div>
      
    </div>
  );
}

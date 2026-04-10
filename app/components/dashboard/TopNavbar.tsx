"use client";
import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface TopNavbarProps {
  onLogout?: () => void;
  user?: any;
}

export const TopNavbar = ({ onLogout, user }: TopNavbarProps) => {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/');
    onLogout?.();
  };

  return (
    <div className="bg-[#FAF6F0] border-b border-[#E8DDCC] h-14 px-10 flex items-center justify-between">
      {/* Left: Brand */}
      <div className="flex items-center">
        <span className="font-bold text-gray-900 text-[15px] tracking-tight">Academic Editorial</span>
      </div>

      {/* Center: Nav Links */}
      <div className="flex items-center gap-8 text-sm font-medium">
        <Link 
          href="/dashboard/student" 
          className="text-gray-900 font-semibold border-b-2 border-[#784E35] pb-0.5"
        >
          Dashboard
        </Link>
        <Link 
          href="#" 
          className="text-gray-400 hover:text-gray-700 transition-colors"
        >
          Reports
        </Link>
        <Link 
          href="#" 
          className="text-gray-400 hover:text-gray-700 transition-colors"
        >
          Evaluations
        </Link>
      </div>

      {/* Right: Logout */}
      <button
        onClick={handleLogout}
        className="text-sm text-gray-500 hover:text-gray-900 font-medium transition-colors"
      >
        Logout
      </button>
    </div>
  );
};

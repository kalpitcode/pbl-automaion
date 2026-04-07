import React from 'react';
import Link from 'next/link';
import { LogOut } from 'lucide-react';

interface TopNavbarProps {
  onLogout: () => void;
}

export function TopNavbar({ onLogout }: TopNavbarProps) {
  return (
    <nav className="flex items-center justify-between py-6 px-10 border-b border-transparent">
      {/* Brand */}
      <div className="flex-1">
        <h1 className="font-serif text-2xl font-bold text-primary tracking-tight">Academic Editorial</h1>
      </div>

      {/* Center Links */}
      <div className="flex-1 flex justify-center space-x-12">
        <Link href="/dashboard/student" className="text-primary font-semibold border-b-2 border-primary pb-1">Dashboard</Link>
        <Link href="#" className="text-gray-500 hover:text-primary transition-colors font-medium">Reports</Link>
        <Link href="#" className="text-gray-500 hover:text-primary transition-colors font-medium">Evaluations</Link>
      </div>

      {/* Right Actions */}
      <div className="flex-1 flex justify-end">
        <button 
          onClick={onLogout}
          className="flex items-center space-x-2 text-gray-500 hover:text-primary transition-colors text-sm font-medium uppercase tracking-wider"
        >
          <span>Logout</span>
        </button>
      </div>
    </nav>
  );
}

"use client";
import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Award, Bell, User } from 'lucide-react';

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
    <div className="bg-white border-b shadow-sm h-16 px-6 flex items-center justify-between">
      {/* Left: Logo */}
      <div className="flex items-center gap-2">
        <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
          <Award className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">PBL Portal</h1>
          <p className="text-xs text-gray-500 font-medium">{user?.role || 'Loading...'}</p>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-4">
        <button className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
          <Bell className="w-5 h-5" />
        </button>
        
        <div className="flex items-center gap-3 p-2 pr-4 border-l border-gray-200">
          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-gray-600" />
          </div>
          <span className="text-sm font-semibold text-gray-900 min-w-0 truncate max-w-32">
            {user?.name || 'User'}
          </span>
          <button
            onClick={handleLogout}
            className="text-sm text-red-600 hover:text-red-800 font-medium px-3 py-1 hover:bg-red-50 rounded transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};


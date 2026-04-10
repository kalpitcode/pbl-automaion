"use client";
import React, { useEffect, useState } from 'react';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import Link from 'next/link';
import { getMeAPI } from '../../lib/api';
import SupervisorSidebar from './components/SupervisorSidebar';
import { TopNavbar } from '../../components/dashboard/TopNavbar';
import { Users, Award } from 'lucide-react';


export default function SupervisorDashboard() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userRes = await getMeAPI();
        setUser(userRes.user);
      } catch (err) {
        console.error('Dashboard load error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['SUPERVISOR']}>
        <div className="min-h-screen bg-white flex items-center justify-center">
          <p className="text-gray-400">Loading dashboard...</p>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['SUPERVISOR']}>
      <div className="min-h-screen bg-white flex w-full h-screen overflow-hidden">
        
        {/* Left Sidebar */}
        <SupervisorSidebar />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          
          <TopNavbar user={user} />

          <div className="flex-1 overflow-auto p-8 bg-gray-50">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Supervisor Dashboard</h1>
              <p className="text-xl text-gray-600 mt-2">Manage groups, submissions, and grading</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-white rounded-xl border p-8 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-6">Get Started</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <span className="text-2xl font-bold text-blue-600">1</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Review Requests</h4>
                      <p className="text-sm text-gray-600">Click "Supervisor Requests" to approve groups</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-xl">
                    <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                      <span className="text-2xl font-bold text-emerald-600">2</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Grade Students</h4>
                      <p className="text-sm text-gray-600">Use "Grade Students" to enter CWS/MTE/ETE marks</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border rounded-xl p-8 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-4">
                  <Link href="/dashboard/supervisor/requests" className="block p-4 bg-white hover:bg-gray-50 rounded-lg border transition-all text-center">
                    <Users size={20} className="mx-auto mb-2 text-gray-600" />
                    <span className="font-semibold text-sm">Requests</span>
                  </Link>
                  <Link href="/dashboard/supervisor/grades" className="block p-4 bg-white hover:bg-gray-50 rounded-xl border transition-all text-center">
                    <Award size={20} className="mx-auto mb-2 text-blue-600" />
                    <span className="font-semibold text-sm text-blue-600">Grade Now</span>
                  </Link>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                  <Users size={24} className="text-gray-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Your Groups</h3>
              </div>
              <p className="text-gray-500 mb-6">Navigate to "My Groups" or "Grade Students" to manage your assigned groups.</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-6 bg-gray-50 rounded-lg border-dashed border-2 border-gray-200 text-center h-24 flex flex-col items-center justify-center">
                  <Users size={32} className="text-gray-400 mb-2" />
                  <span className="text-sm text-gray-500">No groups yet</span>
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </ProtectedRoute>
  );
}


"use client";
import React, { useEffect, useState } from 'react';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import Link from 'next/link';
import { getMeAPI, getSupervisorGroupsAPI } from '../../lib/api';
import SupervisorSidebar from './components/SupervisorSidebar';
import SupervisorNavbar from './components/SupervisorNavbar';
import { Users, Award, ArrowRight, Sparkles, Star, ClipboardList, ImageOff } from 'lucide-react';


export default function SupervisorDashboard() {
  const [user, setUser] = useState<any>(null);
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userRes = await getMeAPI();
        setUser(userRes.user);
        try {
          const groupsRes = await getSupervisorGroupsAPI();
          setGroups(groupsRes.groups || []);
        } catch {
          setGroups([]);
        }
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
        <div className="min-h-screen bg-[#FAF6F0] flex items-center justify-center">
          <p className="text-gray-400 animate-pulse">Loading dashboard...</p>
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
          
          <SupervisorNavbar user={user} />

          <div className="flex-1 overflow-auto p-8 bg-[#FAF6F0]">
            
            {/* Page Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Supervisor Dashboard</h1>
              <p className="text-gray-500 mt-2">Manage your project cohorts, review student progress, and finalize grades.</p>
            </div>

            {/* Cards Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              
              {/* Get Started Card */}
              <div className="lg:col-span-2 bg-white rounded-2xl border border-[#E8DDCC] p-8 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-bold text-gray-900">Get Started</h3>
                  <div className="w-10 h-10 bg-[#FAF6F0] rounded-xl flex items-center justify-center">
                    <Sparkles size={20} className="text-[#A06B40]" />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Review Requests */}
                  <div className="bg-[#FAF6F0] rounded-xl p-6 border border-[#E8DDCC]/50">
                    <h4 className="font-bold text-gray-900 mb-2 text-[15px]">Review Requests</h4>
                    <p className="text-sm text-gray-500 leading-relaxed mb-4">
                      Check the pending approvals for project proposals and milestone completions.
                    </p>
                    <Link 
                      href="/dashboard/supervisor/requests" 
                      className="text-[#784E35] font-semibold text-sm flex items-center gap-1 hover:gap-2 transition-all"
                    >
                      Continue <ArrowRight size={14} />
                    </Link>
                  </div>

                  {/* Grade Students */}
                  <div className="bg-[#FAF6F0] rounded-xl p-6 border border-[#E8DDCC]/50">
                    <h4 className="font-bold text-gray-900 mb-2 text-[15px]">Grade Students</h4>
                    <p className="text-sm text-gray-500 leading-relaxed mb-4">
                      Access submitted assignments and provide detailed qualitative feedback.
                    </p>
                    <Link 
                      href="/dashboard/supervisor/grades" 
                      className="text-[#784E35] font-semibold text-sm flex items-center gap-1 hover:gap-2 transition-all"
                    >
                      Open Queue <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              </div>

              {/* Quick Actions Card */}
              <div className="bg-gradient-to-br from-[#F5D5B8] to-[#FADEC9] rounded-2xl p-6 border border-[#E8C9A8] shadow-sm flex flex-col">
                <h3 className="text-lg font-bold text-gray-900 mb-5">Quick Actions</h3>
                
                <div className="space-y-3 flex-1">
                  <Link 
                    href="/dashboard/supervisor/requests" 
                    className="flex items-center gap-3 bg-[#3D2B1F] hover:bg-[#2A1E15] text-white px-5 py-3.5 rounded-xl font-semibold text-sm transition-colors shadow-sm"
                  >
                    <ClipboardList size={16} />
                    Requests
                  </Link>
                  <Link 
                    href="/dashboard/supervisor/grades" 
                    className="flex items-center gap-3 bg-white hover:bg-gray-50 text-gray-900 px-5 py-3.5 rounded-xl font-semibold text-sm transition-colors shadow-sm border border-[#E8DDCC]"
                  >
                    <Star size={16} className="text-[#A06B40]" />
                    Grade Now
                  </Link>
                </div>

                {/* Weekly Insight */}
                <div className="mt-5 bg-white/60 rounded-xl p-4 border border-[#E8C9A8]/50">
                  <p className="text-[10px] text-gray-600 uppercase tracking-widest font-bold mb-1">Weekly Insight</p>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {groups.length > 0
                      ? `${groups.length} student group${groups.length !== 1 ? 's' : ''} ${groups.length !== 1 ? 'are' : 'is'} waiting for milestone feedback.`
                      : 'No groups assigned yet. Check your approval queue.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Your Groups Section */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Your Groups</h3>
                <Link href="/dashboard/supervisor/groups" className="text-sm text-gray-500 hover:text-[#784E35] font-medium transition-colors">
                  Manage All Cohorts
                </Link>
              </div>
              
              {groups.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {groups.map((group: any) => (
                    <Link 
                      key={group.id} 
                      href={`/dashboard/supervisor/groups`}
                      className="bg-white rounded-2xl border border-[#E8DDCC] p-6 shadow-sm hover:shadow-md hover:border-[#784E35]/30 transition-all group"
                    >
                      <h4 className="font-bold text-gray-900 mb-1 group-hover:text-[#784E35] transition-colors">{group.name}</h4>
                      <p className="text-xs text-gray-500 mb-3 line-clamp-1">{group.topic || 'No topic set'}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <Users size={12} />
                        <span>{group.members?.length || 0} members</span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="bg-[#F4EBE3]/50 rounded-2xl border border-[#E8DDCC] p-12 text-center">
                  <div className="w-16 h-16 bg-[#E8DDCC]/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <ImageOff size={28} className="text-gray-400" />
                  </div>
                  <h4 className="text-lg font-bold text-gray-900 mb-2">No groups yet</h4>
                  <p className="text-sm text-gray-500 max-w-md mx-auto">
                    You haven&apos;t been assigned to any project cohorts for this semester. New groups will appear here once students request your supervision.
                  </p>
                </div>
              )}
            </div>

          </div>
          
        </div>
      </div>
    </ProtectedRoute>
  );
}

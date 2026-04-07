"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import { getMeAPI, getMyGroupAPI, getMyGroupWeeksAPI } from '../../lib/api';
import { TopNavbar } from '../../components/dashboard/TopNavbar';
import { LeftSidebar } from '../../components/dashboard/LeftSidebar';
import { ProjectSidebar } from '../../components/dashboard/ProjectSidebar';
import { SubmissionArea } from '../../components/dashboard/SubmissionArea';

// ---- Types ----
export interface GroupMember {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface GroupSupervisor {
  id: string;
  name: string;
  email: string;
}

export interface Group {
  id: string;
  name: string;
  supervisor: GroupSupervisor | null;
  members: GroupMember[];
}

export interface Week {
  id: string;
  week_number: number;
  name: string;
  phase_title: string | null;
  status: string;
}

export default function StudentDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<{ id: string; name: string; email: string; role: string } | null>(null);
  const [group, setGroup] = useState<Group | null>(null);
  const [weeks, setWeeks] = useState<Week[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const meRes = await getMeAPI();
        setUser(meRes.user);

        const groupRes = await getMyGroupAPI();
        
        if (!groupRes.group) {
          router.push('/dashboard/student/onboarding');
          return;
        }

        if (groupRes.group.status !== 'APPROVED') {
          router.push('/dashboard/student/waiting');
          return;
        }

        setGroup(groupRes.group);

        const weeksRes = await getMyGroupWeeksAPI();
        setWeeks(weeksRes.weeks);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-gray-400 text-sm animate-pulse">Loading workspace...</p>
      </div>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['STUDENT']}>
      <div className="min-h-screen bg-background flex flex-col font-sans">
        
        {/* Top Navbar */}
        <header>
          <div className="max-w-[1600px] mx-auto w-full">
            <TopNavbar onLogout={handleLogout} />
          </div>
        </header>

        {/* Main Workspace Layout */}
        <main className="flex-1 px-10 py-8 flex space-x-8 max-w-[1600px] mx-auto w-full mb-10 overflow-hidden">
          
          {/* Left Sidebar */}
          <aside className="shrink-0 flex flex-col justify-start">
            <LeftSidebar user={user} />
          </aside>

          {/* Project Details Sidebar */}
          <aside className="shrink-0 flex flex-col justify-start">
            <ProjectSidebar group={group} currentUserId={user?.id ?? ''} weeks={weeks} />
          </aside>

          {/* Main Submission Area */}
          <section className="flex-1 flex flex-col min-w-0">
            <SubmissionArea weeks={weeks} />
          </section>

        </main>
      </div>
    </ProtectedRoute>
  );
}

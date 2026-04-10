"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import { getMeAPI, getMyGroupAPI, getMyGroupWeeksAPI, getMyGradesAPI } from '../../lib/api';
import { TopNavbar } from '../../components/dashboard/TopNavbar';
import { LeftSidebar } from '../../components/dashboard/LeftSidebar';
import { ProjectSidebar } from '../../components/dashboard/ProjectSidebar';
import { SubmissionArea } from '../../components/dashboard/SubmissionArea';
import { Award, TrendingUp } from 'lucide-react';


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
  submission_comments?: string | null;
  submitted_file_name?: string | null;
  submitted_file_type?: string | null;
  submitted_file_size?: number | null;
  submitted_at?: string | null;
  supervisor_feedback?: string | null;
}

interface GradeRecord {
  id: string;
  cws: number | null;
  mte: number | null;
  ete: number | null;
  total: number | null;
  is_published: boolean;
  supervisor: { name: string };
  group: { name: string };
}

export default function StudentDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<{ id: string; name: string; email: string; role: string } | null>(null);
  const [group, setGroup] = useState<Group | null>(null);
  const [weeks, setWeeks] = useState<Week[]>([]);
  const [grades, setGrades] = useState<GradeRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const loadWeeks = async () => {
    const weeksRes = await getMyGroupWeeksAPI();
    setWeeks(weeksRes.weeks);
  };

  const loadGrades = async () => {
    try {
      const gradesRes = await getMyGradesAPI();
      setGrades(gradesRes.grades || []);
    } catch {
      setGrades([]);
    }
  };

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
        await Promise.all([loadWeeks(), loadGrades()]);
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

  // Get the first published grade record (there should be one per group)
  const myGrade = grades.length > 0 ? grades[0] : null;

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
            <SubmissionArea weeks={weeks} onSubmissionSaved={loadWeeks} />
          </section>

        </main>

        {/* Dynamic Grades Bar */}
        <div className="px-10 py-4 bg-gradient-to-r from-[#F4EBE3] to-[#FAF6F0] border-t border-[#E8DDCC] sticky bottom-0">
          <div className="max-w-[1600px] mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#784E35]/10 rounded-lg flex items-center justify-center">
                <Award size={16} className="text-[#784E35]" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-sm">My Final Grades</h3>
                <p className="text-xs text-gray-500">
                  {myGrade
                    ? `Graded by ${myGrade.supervisor.name}`
                    : 'Awaiting supervisor publication'}
                </p>
              </div>
            </div>

            {myGrade ? (
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-4 text-sm">
                  <div className="text-center">
                    <div className="text-xs text-gray-500 font-medium">CWS</div>
                    <div className="font-mono font-bold text-gray-900">{myGrade.cws ?? '--'}<span className="text-gray-400 text-xs">/30</span></div>
                  </div>
                  <div className="w-px h-8 bg-[#E8DDCC]"></div>
                  <div className="text-center">
                    <div className="text-xs text-gray-500 font-medium">MTE</div>
                    <div className="font-mono font-bold text-gray-900">{myGrade.mte ?? '--'}<span className="text-gray-400 text-xs">/30</span></div>
                  </div>
                  <div className="w-px h-8 bg-[#E8DDCC]"></div>
                  <div className="text-center">
                    <div className="text-xs text-gray-500 font-medium">ETE</div>
                    <div className="font-mono font-bold text-gray-900">{myGrade.ete ?? '--'}<span className="text-gray-400 text-xs">/40</span></div>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-[#784E35]/10 px-4 py-2 rounded-xl">
                  <TrendingUp size={14} className="text-[#784E35]" />
                  <span className="font-mono font-bold text-[#784E35] text-lg">{myGrade.total ?? '--'}</span>
                  <span className="text-gray-500 text-xs">/100</span>
                </div>
              </div>
            ) : (
              <div className="text-xs text-gray-400 font-mono">Total: --/100</div>
            )}
          </div>
        </div>

      </div>
    </ProtectedRoute>
  );
}


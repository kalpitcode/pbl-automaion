"use client";
import React, { useEffect, useState } from 'react';
import { ProtectedRoute } from '../../../components/ProtectedRoute';
import SupervisorSidebar from '../components/SupervisorSidebar';
import SupervisorNavbar from '../components/SupervisorNavbar';
import { Edit3, Check, Award, AlertCircle } from 'lucide-react';
import { getGradesAPI, createGradeAPI, updateGradeAPI, publishGradesAPI, getMeAPI } from '../../../lib/api';

interface StudentGrade {
  id: string;
  name: string;
  email: string;
  memberRole: string;
  cws: number | null;
  mte: number | null;
  ete: number | null;
  total: number | null;
  is_published: boolean;
  gradeId: string | null;
}

interface GroupGrades {
  id: string;
  name: string;
  students: StudentGrade[];
}

export default function GradesPage() {
  const [user, setUser] = useState<any>(null);
  const [grades, setGrades] = useState<GroupGrades[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [localMarks, setLocalMarks] = useState<{cws: number, mte: number, ete: number}>({cws: 0, mte: 0, ete: 0});
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [feedback, setFeedback] = useState<{type: 'success' | 'error', message: string} | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => setFeedback(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  const loadData = async () => {
    try {
      const [userRes, gradesRes] = await Promise.all([getMeAPI(), getGradesAPI()]);
      setUser(userRes.user);
      setGrades(gradesRes.grades || []);
    } catch (err) {
      console.error('Load error:', err);
      setGrades([]);
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (student: StudentGrade, groupId: string) => {
    setEditingId(student.id);
    setEditingGroupId(groupId);
    setLocalMarks({
      cws: student.cws || 0,
      mte: student.mte || 0,
      ete: student.ete || 0
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingGroupId(null);
  };

  const saveEdit = async (student: StudentGrade) => {
    setSaving(true);
    try {
      if (student.gradeId) {
        // Update existing grade
        await updateGradeAPI(student.gradeId, localMarks);
      } else {
        // Create new grade
        await createGradeAPI({
          studentId: student.id,
          groupId: editingGroupId!,
          ...localMarks
        });
      }
      setFeedback({ type: 'success', message: `Marks saved for ${student.name}` });
      await loadData();
      setEditingId(null);
      setEditingGroupId(null);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to save marks' });
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    setPublishing(true);
    try {
      await publishGradesAPI();
      setFeedback({ type: 'success', message: 'All marks published to students!' });
      await loadData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to publish' });
    } finally {
      setPublishing(false);
    }
  };

  // Check if any grades exist and all are published
  const allPublished = grades.length > 0 &&
    grades.every(g => g.students.every(s => s.gradeId && s.is_published));

  // Check if there are any grade records that could be published  
  const hasAnyGrades = grades.some(g => g.students.some(s => s.gradeId !== null));

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['SUPERVISOR']}>
        <div className="min-h-screen bg-[#FAF6F0] flex items-center justify-center">
          <p className="text-gray-400 animate-pulse">Loading grades...</p>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['SUPERVISOR']}>
      <div className="min-h-screen bg-white flex w-full h-screen overflow-hidden">
        <SupervisorSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <SupervisorNavbar user={user} />

          <div className="flex-1 overflow-auto p-8 bg-[#FAF6F0]">

            {/* Toast Feedback */}
            {feedback && (
              <div className={`fixed top-6 right-6 z-50 px-6 py-3 rounded-xl shadow-lg text-sm font-semibold flex items-center gap-2 transition-all animate-in ${
                feedback.type === 'success'
                  ? 'bg-green-50 text-green-800 border border-green-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                {feedback.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
                {feedback.message}
              </div>
            )}

            {/* Header */}
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Student Grades</h1>
                <p className="text-gray-500 mt-1">Assign CWS, MTE, and ETE marks for your students</p>
              </div>
              {hasAnyGrades && (
                <button 
                  onClick={handlePublish}
                  disabled={publishing || allPublished}
                  className="bg-[#784E35] disabled:bg-gray-300 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-[#5A3A28] disabled:cursor-not-allowed transition-colors shadow-sm"
                >
                  <Award size={18} />
                  {publishing ? 'Publishing...' : allPublished ? 'All Published ✓' : 'Publish All Marks'}
                </button>
              )}
            </div>

            {/* Empty State */}
            {grades.length === 0 ? (
              <div className="bg-white rounded-2xl border border-[#E8DDCC] p-16 text-center shadow-sm">
                <div className="w-16 h-16 bg-[#F4EBE3] rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Award size={32} className="text-[#784E35]" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No Groups Assigned</h3>
                <p className="text-gray-500">Approve supervisor requests first to see your groups here.</p>
              </div>
            ) : (
              <div className="grid gap-6">
                {grades.map(group => (
                  <div key={group.id} className="bg-white border border-[#E8DDCC] rounded-2xl shadow-sm overflow-hidden">
                    {/* Group Header */}
                    <div className="bg-gradient-to-r from-[#F4EBE3] to-[#FAF6F0] px-8 py-6 border-b border-[#E8DDCC]">
                      <h2 className="text-2xl font-bold text-gray-900">{group.name}</h2>
                      <p className="text-sm text-gray-500 mt-1">{group.students.length} student{group.students.length !== 1 ? 's' : ''}</p>
                    </div>

                    {/* Grades Table */}
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-[#FAF6F0]">
                          <tr>
                            <th className="px-8 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Student</th>
                            <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">CWS (30)</th>
                            <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">MTE (30)</th>
                            <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">ETE (40)</th>
                            <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">Total (100)</th>
                            <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">Status</th>
                            <th className="w-32"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E8DDCC]">
                          {group.students.map(student => (
                            <tr key={student.id} className="hover:bg-[#FAF6F0] transition-colors">
                              <td className="px-8 py-5">
                                <div className="font-semibold text-gray-900">{student.name}</div>
                                <div className="text-sm text-gray-500">{student.email}</div>
                                <div className="text-xs text-[#784E35] uppercase font-bold mt-1">{student.memberRole}</div>
                              </td>
                              <td className="px-6 py-5 text-center font-mono font-semibold text-lg text-gray-900">
                                {editingId === student.id ? (
                                  <input 
                                    type="number" 
                                    min="0" max="30"
                                    value={localMarks.cws}
                                    onChange={(e) => setLocalMarks({...localMarks, cws: parseInt(e.target.value) || 0})}
                                    className="w-20 p-2 border border-[#E8DDCC] rounded-lg text-center font-mono focus:ring-2 focus:ring-[#784E35] focus:border-transparent outline-none"
                                  />
                                ) : student.cws ?? '--'}
                              </td>
                              <td className="px-6 py-5 text-center font-mono font-semibold text-lg text-gray-900">
                                {editingId === student.id ? (
                                  <input 
                                    type="number" 
                                    min="0" max="30"
                                    value={localMarks.mte}
                                    onChange={(e) => setLocalMarks({...localMarks, mte: parseInt(e.target.value) || 0})}
                                    className="w-20 p-2 border border-[#E8DDCC] rounded-lg text-center font-mono focus:ring-2 focus:ring-[#784E35] focus:border-transparent outline-none"
                                  />
                                ) : student.mte ?? '--'}
                              </td>
                              <td className="px-6 py-5 text-center font-mono font-semibold text-lg text-gray-900">
                                {editingId === student.id ? (
                                  <input 
                                    type="number" 
                                    min="0" max="40"
                                    value={localMarks.ete}
                                    onChange={(e) => setLocalMarks({...localMarks, ete: parseInt(e.target.value) || 0})}
                                    className="w-20 p-2 border border-[#E8DDCC] rounded-lg text-center font-mono focus:ring-2 focus:ring-[#784E35] focus:border-transparent outline-none"
                                  />
                                ) : student.ete ?? '--'}
                              </td>
                              <td className="px-6 py-5 text-center">
                                <span className="font-mono font-bold text-xl text-[#784E35]">
                                  {editingId === student.id
                                    ? localMarks.cws + localMarks.mte + localMarks.ete
                                    : student.total ?? '--'}
                                </span>
                              </td>
                              <td className="px-6 py-5 text-center">
                                <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${
                                  student.is_published 
                                    ? 'bg-green-50 text-green-700 border border-green-200' 
                                    : student.gradeId
                                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                      : 'bg-gray-100 text-gray-500 border border-gray-200'
                                }`}>
                                  {student.is_published ? 'Published' : student.gradeId ? 'Draft' : 'No marks'}
                                </span>
                              </td>
                              <td className="px-6 py-5 text-right">
                                {editingId === student.id ? (
                                  <div className="flex items-center gap-2 justify-end">
                                    <button 
                                      onClick={() => saveEdit(student)} 
                                      disabled={saving}
                                      className="bg-[#784E35] text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-[#5A3A28] transition-colors disabled:opacity-50 flex items-center gap-1"
                                    >
                                      <Check size={14} />
                                      {saving ? 'Saving...' : 'Save'}
                                    </button>
                                    <button 
                                      onClick={cancelEdit}
                                      className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                ) : (
                                  <button 
                                    onClick={() => startEdit(student, group.id)} 
                                    className="text-[#784E35] hover:text-[#5A3A28] hover:bg-[#F4EBE3] p-2 rounded-lg transition-colors"
                                    title="Edit marks"
                                  >
                                    <Edit3 size={18} />
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

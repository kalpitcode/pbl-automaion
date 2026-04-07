"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '../../../components/ProtectedRoute';
import { getMeAPI, getMyGroupAPI, createGroupAPI, joinGroupAPI, getSupervisorsAPI, requestSupervisorAPI } from '../../../lib/api';

export default function OnboardingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1);
  const [groupName, setGroupName] = useState('');
  const [error, setError] = useState('');
  
  // Supervisor selection
  const [supervisors, setSupervisors] = useState<any[]>([]);
  const [selectedSupervisor, setSelectedSupervisor] = useState('');

  useEffect(() => {
    const checkState = async () => {
      try {
        const { group } = await getMyGroupAPI();
        if (group) {
          if (group.status !== 'APPROVED') {
            router.push('/dashboard/student/waiting');
          } else {
            router.push('/dashboard/student');
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    checkState();
  }, [router]);

  useEffect(() => {
    if (step === 3) {
      getSupervisorsAPI().then(res => setSupervisors(res.supervisors)).catch(console.error);
    }
  }, [step]);

  const handleCreate = async () => {
    setError('');
    if (!groupName.trim()) return setError('Group name is required');
    try {
      await createGroupAPI(groupName);
      setStep(2); // Move to "Add Members" info page
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleJoin = async () => {
    setError('');
    if (!groupName.trim()) return setError('Group name is required');
    try {
      await joinGroupAPI(groupName);
      router.push('/dashboard/student/waiting'); // Members go straight to waiting
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleSendRequest = async () => {
    setError('');
    if (!selectedSupervisor) return setError('Please select a supervisor');
    try {
      await requestSupervisorAPI(selectedSupervisor);
      router.push('/dashboard/student/waiting');
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <ProtectedRoute allowedRoles={['STUDENT']}>
      <div className="min-h-screen flex flex-col items-center bg-[#fdfbf7] md:bg-[var(--background)]">
        {/* Navbar */}
        <div className="w-full h-16 flex items-center px-8 text-black font-semibold">
           Academic Portal
        </div>

        {/* Content */}
        <div className="flex-1 flex w-full items-center justify-center p-4 pb-20">
          <div className="bg-white rounded-md shadow-sm w-full max-w-md p-10 pt-12 pb-12 border border-[#f0ebe1]">
            {step === 1 && (
              <>
                <h1 className="text-[2rem] font-bold mb-4 text-center text-[#212121] tracking-tight">Start Your Journey</h1>
                <p className="text-[13px] text-center text-[#666] mb-8 max-w-[280px] mx-auto leading-relaxed">
                  Create a new group as a leader or join an existing one using a unique name.
                </p>

                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-extrabold uppercase tracking-widest text-[#666] mb-2 px-1">Group Name</label>
                    <input
                      type="text"
                      value={groupName}
                      onChange={(e) => setGroupName(e.target.value)}
                      className="w-full bg-[#fcfaf8] border border-[#f0ebe1] rounded p-3 text-[13px] focus:outline-none focus:border-[#d7c9b8] transition-colors"
                      placeholder="Enter group name (lowercase, unique)"
                    />
                  </div>
                  {error && <p className="text-red-500 text-xs text-center">{error}</p>}
                  
                  <div className="flex flex-col gap-3 mt-4">
                    <button onClick={handleCreate} className="w-full bg-[#654e48] text-white py-3 rounded text-[13px] font-bold hover:bg-[#523d38] transition-colors flex justify-center items-center gap-2">
                      Create Group (Leader)
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-[14px] h-[14px]">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                      </svg>
                    </button>
                    <button onClick={handleJoin} className="w-full bg-white border border-[#f0ebe1] text-[#333] font-bold py-3 rounded text-[13px] hover:bg-[#faf9f7] transition-colors">
                      Join Group
                    </button>
                  </div>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <h1 className="text-[2rem] font-bold mb-6 text-center text-[#553628] tracking-tight">Add Members</h1>
                <p className="mb-6 text-[15px] text-center text-gray-600 leading-relaxed max-w-[280px] mx-auto">
                  You are now the group leader of <strong className="text-[#A06B40] font-bold">{groupName}</strong>! Tell your peers to join this group using exactly this name.
                </p>
                <div className="text-center text-[13px] text-gray-400 mb-8 font-medium">
                  Max members: 4
                </div>
                <button 
                  onClick={() => setStep(3)} 
                  className="w-full bg-[#523326] text-white p-3 rounded font-semibold text-[14px] hover:bg-[#43291e] transition-colors"
                >
                  Proceed to Select Supervisor
                </button>
              </>
            )}

            {step === 3 && (
              <>
                <h1 className="text-[2rem] font-bold mb-6 text-center text-[#5B3E31] tracking-tight">Select Supervisor</h1>
                <p className="mb-8 text-[14px] text-center text-gray-500 max-w-[300px] mx-auto leading-relaxed">
                  Select a supervisor from the list below to send an approval request.
                </p>
                <div className="space-y-6">
                  <div className="relative">
                    <select
                      value={selectedSupervisor}
                      onChange={(e) => setSelectedSupervisor(e.target.value)}
                      className="w-full bg-white border border-[#f0ebe1] rounded p-3 text-[14px] appearance-none focus:outline-none focus:border-[#d7c9b8] cursor-pointer text-[#5B3E31]"
                    >
                      <option value="">-- Choose a Supervisor --</option>
                      {supervisors.map(s => (
                        <option key={s.id} value={s.id}>{s.name} ({s.email})</option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-[#A06B40]">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-[14px] h-[14px]">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                      </svg>
                    </div>
                  </div>

                  {error && <p className="text-red-500 text-xs text-center">{error}</p>}

                  <button 
                    onClick={handleSendRequest} 
                    className="w-full bg-[#4E352A] flex justify-center items-center gap-2 text-white p-3.5 rounded text-[14px] font-semibold hover:bg-[#3d2921] transition-colors"
                  >
                    Send Request
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 ml-1">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                    </svg>
                  </button>
                </div>
              </>
            )}

          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

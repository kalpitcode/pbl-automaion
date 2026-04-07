"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '../../../components/ProtectedRoute';
import { getMyGroupAPI, getSupervisorsAPI, requestSupervisorAPI } from '../../../lib/api';

export default function WaitingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [group, setGroup] = useState<any>(null);
  const [role, setRole] = useState('');
  
  // Supervisor rejection/reselection flow
  const [supervisors, setSupervisors] = useState<any[]>([]);
  const [selectedSupervisor, setSelectedSupervisor] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchState = async () => {
    try {
      const { group: gData, myRole } = await getMyGroupAPI();
      if (!gData) {
        router.push('/dashboard/student/onboarding');
        return;
      }
      
      if (gData.status === 'APPROVED') {
        router.push('/dashboard/student');
        return;
      }
      
      setGroup(gData);
      setRole(myRole);
      
      if (gData.status === 'REJECTED' && myRole === 'LEADER') {
        const supRes = await getSupervisorsAPI();
        setSupervisors(supRes.supervisors);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchState();
  }, [router]);

  const handleResendRequest = async () => {
    setError('');
    setSuccess('');
    if (!selectedSupervisor) return setError('Please select a supervisor');
    
    try {
      await requestSupervisorAPI(selectedSupervisor);
      setSuccess('Request sent! Waiting for approval.');
      // Re-fetch to update status to PENDING
      await fetchState();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/');
  };

  if (loading || !group) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <ProtectedRoute allowedRoles={['STUDENT']}>
      <div className="min-h-screen flex flex-col bg-[#fcfaf7]">
        {/* Navbar */}
        <div className="w-full h-[72px] flex items-center px-8 text-black font-semibold">
           Academic Portal
        </div>

        {/* Content */}
        <div className="flex-1 flex text-black items-center justify-center p-4 pb-20">
          <div className="w-full max-w-[680px] bg-white p-12 rounded-[4px] border border-[#f0ebe1] shadow-sm relative leading-relaxed">
            <button 
              onClick={handleLogout} 
              className="absolute top-10 right-10 text-[11px] font-medium text-[#c0a693] hover:text-[#4E3524] transition-colors"
            >
              Logout
            </button>

            <div className="flex justify-center mb-8">
               <h1 className="text-[26px] font-bold tracking-wider text-[#4E3524] uppercase">GROUP STATUS</h1>
            </div>
            <div className="flex justify-center mb-10 -mt-[26px]">
               <div className="w-12 h-[3px] bg-[#d4a373]"></div>
            </div>

            <div className="mb-10 rounded border border-[#f0ebe1] p-8 pb-10">
              <div className="flex justify-between items-start mb-6 border-b border-[#f3eee7] pb-8">
                <div>
                  <h2 className="font-bold text-[28px] text-[#4E3524] tracking-tight leading-none mb-2">{group.name}</h2>
                  <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-gray-500">GROUP IDENTITY</p>
                </div>
                <div>
                  <span className={`px-[18px] py-[6px] rounded-full text-[10px] font-bold tracking-widest ${
                    group.status === 'PENDING' ? 'text-[#c69165] border border-[#decca3] bg-[#fffcf5]' : 
                    group.status === 'APPROVED' ? 'text-green-600 border border-green-200 bg-green-50' : 
                    'text-red-500 border border-red-200 bg-red-50'
                  }`}>
                    {group.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8 mt-6">
                <div>
                  <h3 className="text-[10px] font-bold tracking-[0.1em] text-[#999] uppercase mb-4">MEMBERS</h3>
                  <ul className="text-[13px] text-[#4E3524] space-y-[14px]">
                    {group.members?.map((m: any) => (
                      <li key={m.id} className="flex items-center gap-2.5">
                        <div className="w-[5px] h-[5px] bg-[#bd8052] rounded-full"></div>
                        <span className="font-medium whitespace-nowrap">{m.name} <span className="text-[10px] text-gray-400 font-normal uppercase ml-1">({m.role})</span></span>
                      </li>
                    ))}
                  </ul>
                </div>

                {group.supervisor_request && (
                  <div>
                    <h3 className="text-[10px] font-bold tracking-[0.1em] text-[#999] uppercase mb-4">REQUESTED SUPERVISOR</h3>
                    <div className="flex items-center gap-2.5 text-[13px] text-[#4E3524] font-medium">
                      <div className="w-[5px] h-[5px] bg-[#bd8052] rounded-full"></div>
                      <span>{group.supervisor_request.supervisor.name}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {group.status === 'PENDING' && (
               <div className="text-center mt-[50px] mb-8">
                 <p className="text-[#888] italic text-[14px] mb-8">Waiting for supervisor approval...</p>
                 <button 
                   onClick={fetchState} 
                   className="text-[11px] font-bold tracking-[0.15em] uppercase text-[#5B3E31] border-b border-[#5B3E31] pb-0.5 hover:text-[#A06B40] hover:border-[#A06B40] transition-colors inline-flex items-center gap-1.5"
                 >
                   REFRESH STATUS
                   <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5 -mt-0.5">
                     <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                   </svg>
                 </button>
               </div>
            )}

            {group.status === 'REJECTED' && (
              <div className="mt-8 text-center bg-red-50 border border-red-100 p-6 rounded">
                <h3 className="text-red-600 font-bold mb-2">Your request was rejected.</h3>
                
                {role === 'LEADER' ? (
                  <>
                    <p className="text-sm text-gray-600 mb-4">Please select another supervisor and submit a new request.</p>
                    <div className="space-y-4 max-w-sm mx-auto">
                      <select
                        value={selectedSupervisor}
                        onChange={(e) => setSelectedSupervisor(e.target.value)}
                        className="w-full border border-red-200 rounded p-2 text-sm focus:outline-none focus:border-red-400"
                      >
                        <option value="">-- Choose a Supervisor --</option>
                        {supervisors.map(s => (
                          <option key={s.id} value={s.id}>{s.name} ({s.email})</option>
                        ))}
                      </select>

                      {error && <p className="text-red-600 text-xs">{error}</p>}
                      {success && <p className="text-green-600 text-xs">{success}</p>}

                      <button 
                        onClick={handleResendRequest} 
                        className="w-full bg-[#4E3524] text-white p-2.5 rounded text-sm font-semibold hover:bg-[#3d2a1d] transition-colors"
                      >
                        Send New Request
                      </button>
                    </div>
                  </>
                ) : (
                  <p className="text-[13px] text-gray-600">Please wait for your group leader to submit a new request.</p>
                )}
              </div>
            )}

          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

"use client";
import React, { useEffect, useState } from 'react';
import { ProtectedRoute } from '../../components/ProtectedRoute';
import { getMeAPI, getSupervisorRequestsAPI, approveSupervisorRequestAPI, rejectSupervisorRequestAPI } from '../../lib/api';
import SupervisorSidebar from './components/SupervisorSidebar';
import SupervisorNavbar from './components/SupervisorNavbar';
import { CheckCircle, XCircle } from 'lucide-react';

export default function SupervisorRequests() {
  const [user, setUser] = useState<any>(null);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const userRes = await getMeAPI();
      setUser(userRes.user);

      const reqRes = await getSupervisorRequestsAPI();
      setRequests(reqRes.requests || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      await approveSupervisorRequestAPI(id);
      fetchData(); // refresh list
    } catch (err) {
      console.error('Approval error:', err);
    }
  };

  const handleReject = async (id: string) => {
    try {
      await rejectSupervisorRequestAPI(id);
      fetchData(); // refresh list
    } catch (err) {
      console.error('Rejection error:', err);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['SUPERVISOR']}>
      <div className="min-h-screen bg-white flex w-full h-screen overflow-hidden">
        
        {/* Left Sidebar */}
        <SupervisorSidebar />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          
          <SupervisorNavbar user={user} />

          <div className="flex-1 overflow-auto p-8 bg-gray-50">
            <h1 className="text-2xl font-bold mb-6 text-gray-900">Approval Queue</h1>
            <p className="text-gray-600 mb-8">Review and accept or reject requests from student groups who want you as their supervisor.</p>

            {loading ? (
               <p className="text-gray-400">Loading requests...</p>
            ) : requests.length === 0 ? (
               <div className="bg-white p-10 rounded-xl border flex flex-col items-center justify-center text-gray-500 shadow-sm">
                 <CheckCircle size={48} className="text-green-500 mb-4 opacity-50" />
                 <p className="text-lg">No pending requests</p>
                 <p className="text-sm">You are all caught up!</p>
               </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {requests.map(req => (
                    <div key={req.id} className="bg-white border rounded-xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col">
                       <div className="mb-4">
                         <span className="text-xs font-bold bg-orange-100 text-orange-600 px-2 py-1 rounded uppercase tracking-wider">Pending</span>
                       </div>
                       <h2 className="text-xl font-bold mb-2">{req.group.name}</h2>
                       <div className="flex-1">
                         <h3 className="text-sm font-semibold text-gray-500 mb-2 mt-4 uppercase">Members ({req.group.members.length}/4)</h3>
                         <ul className="text-sm text-gray-700 space-y-1 mb-6">
                           {req.group.members.map((m: any) => (
                             <li key={m.id} className="flex items-center gap-2">
                               <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
                               {m.name}
                             </li>
                           ))}
                         </ul>
                       </div>
                       
                       <div className="flex gap-3 mt-4 pt-4 border-t">
                         <button 
                           onClick={() => handleReject(req.id)}
                           className="flex-1 py-2 flex items-center justify-center gap-2 border border-red-200 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-semibold"
                         >
                           <XCircle size={16} /> Reject
                         </button>
                         <button 
                           onClick={() => handleApprove(req.id)}
                           className="flex-1 py-2 flex items-center justify-center gap-2 bg-green-600 text-white hover:bg-green-700 rounded-lg transition-colors text-sm font-semibold"
                         >
                           <CheckCircle size={16} /> Approve
                         </button>
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

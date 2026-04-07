"use client";
import React, { useEffect, useState } from 'react';
import { ProtectedRoute } from '../../../components/ProtectedRoute';
import { getMeAPI, getSupervisorGroupsAPI, getSupervisorGroupDetailAPI } from '../../../lib/api';
import SupervisorSidebar from '../components/SupervisorSidebar';
import SupervisorNavbar from '../components/SupervisorNavbar';
import GroupList from '../components/GroupList';
import ReviewPanel from '../components/ReviewPanel';

export default function SupervisorDashboard() {
  const [user, setUser] = useState<any>(null);
  const [groups, setGroups] = useState<any[]>([]);
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  const [activeGroupData, setActiveGroupData] = useState<any>(null);

  const fetchProfileAndGroups = async () => {
    try {
      const userRes = await getMeAPI();
      setUser(userRes.user);

      const groupsRes = await getSupervisorGroupsAPI();
      setGroups(groupsRes.groups || []);
      
      if (groupsRes.groups?.length > 0 && !activeGroupId) {
        setActiveGroupId(groupsRes.groups[0].id);
      }
    } catch (err) {
      console.error('Error fetching dashboard initial data:', err);
    }
  };

  const fetchActiveGroupDetail = async (id: string) => {
    try {
      const detailRes = await getSupervisorGroupDetailAPI(id);
      setActiveGroupData(detailRes);
    } catch (err) {
      console.error('Error fetching group detail:', err);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchProfileAndGroups();
  }, []);

  // Fetch updated detail when active group changes
  useEffect(() => {
    if (activeGroupId) {
      fetchActiveGroupDetail(activeGroupId);
    }
  }, [activeGroupId]);

  const handleUpdate = () => {
    if (activeGroupId) {
      fetchActiveGroupDetail(activeGroupId);
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

          <div className="flex-1 overflow-hidden p-6 gap-6 flex">
            {/* Left Panel: Group List */}
            <GroupList 
              groups={groups} 
              activeGroupId={activeGroupId} 
              onSelectGroup={setActiveGroupId} 
            />

            {/* Right Panel: Active Review Detail */}
            <div className="flex-1 bg-white border border-[#E8DDCC] rounded-xl overflow-hidden shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
               <ReviewPanel groupData={activeGroupData} onUpdate={handleUpdate} />
            </div>
          </div>
          
        </div>
      </div>
    </ProtectedRoute>
  );
}

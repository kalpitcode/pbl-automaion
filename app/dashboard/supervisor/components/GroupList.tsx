import React from 'react';

type GroupListProps = {
  groups: any[];
  activeGroupId: string | null;
  onSelectGroup: (id: string) => void;
};

export default function GroupList({ groups, activeGroupId, onSelectGroup }: GroupListProps) {
  
  // Helper to determine group overall status based on their weeks.
  // For the UI matching, we'll just mock it or infer from data if available.
  const getSimulatedStatus = (groupName: string) => {
    if (groupName.includes('Delta')) return { label: 'PENDING', className: 'bg-[#B1714E] text-white', week: 'Week 8' };
    if (groupName.includes('Sigma')) return { label: 'BEHIND', className: 'bg-[#FFD6D6] text-[#A33434]', week: '' };
    return { label: 'UP TO DATE', className: 'bg-[#EADECE] text-[#784E35]', week: '' };
  };

  return (
    <div className="w-80 bg-[#FAF6F0] rounded-xl p-6 flex flex-col h-full overflow-y-auto">
      
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-1">Assigned Groups</h2>
        <p className="text-sm text-gray-500">{groups.length} active research clusters</p>
      </div>

      <div className="flex flex-col gap-3">
        {groups.map((group) => {
          const isActive = group.id === activeGroupId;
          const status = getSimulatedStatus(group.name);
          
          return (
            <div 
              key={group.id}
              onClick={() => onSelectGroup(group.id)}
              className={`
                p-4 rounded-xl cursor-pointer transition-all border
                ${isActive 
                  ? 'bg-white border-[#784E35] shadow-sm relative' 
                  : 'bg-transparent border-transparent hover:bg-white/50'}
              `}
            >
              {/* Active left bar */}
              {isActive && (
                <div className="absolute left-0 top-3 bottom-3 w-1 bg-[#784E35] rounded-r-md"></div>
              )}
              
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-semibold text-gray-900">{group.name}</h3>
                 <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${status.className}`}>
                    {status.label}
                 </span>
              </div>
              
              <div className="flex justify-between items-end">
                {/* Simulated Avatars */}
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full bg-yellow-600 border-2 border-white flex items-center justify-center text-xs text-white z-20">U</div>
                  <div className="w-8 h-8 rounded-full bg-blue-800 border-2 border-white flex items-center justify-center text-xs text-white z-10">M</div>
                  {isActive && (
                    <div className="w-8 h-8 rounded-full bg-gray-600 border-2 border-white flex items-center justify-center text-xs text-white z-0">S</div>
                  )}
                  {isActive && (
                    <div className="w-8 h-8 rounded-full bg-[#E8DDCC] border-2 border-white flex items-center justify-center text-[10px] text-[#784E35] font-bold z-0">
                      +2
                    </div>
                  )}
                </div>
                
                {status.week && (
                  <span className="text-xs text-gray-500 italic font-serif disabled">{status.week}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

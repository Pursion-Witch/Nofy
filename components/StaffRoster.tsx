
import React from 'react';
import { UserProfile, Department, Terminal } from '../types';
import { User, Coffee, Clock, Laptop, Shield, MapPin, Activity } from 'lucide-react';

interface StaffRosterProps {
  currentUser: UserProfile;
  allUsers: UserProfile[];
}

export const StaffRoster: React.FC<StaffRosterProps> = ({ currentUser, allUsers }) => {
  
  // FILTERING LOGIC
  const getVisibleStaff = () => {
    // 1. AOCC User: Sees IT Systems & Other AOCC Staff
    if (currentUser.department === Department.AOCC || currentUser.department === Department.IT_SYSTEMS) {
      return allUsers.filter(u => 
        u.department === Department.IT_SYSTEMS || 
        u.department === Department.AOCC
      );
    }

    // 2. Terminal Ops User: Sees Staff in their assigned Terminal
    // We check if the user's allowedTerminals overlap (assuming 1 main terminal for Ops)
    const myTerminal = currentUser.allowedTerminals[0];
    
    return allUsers.filter(u => {
      // Show if user is in same department group OR is supporting that terminal
      if (u.department === Department.TERMINAL_OPS) {
         return u.allowedTerminals.includes(myTerminal);
      }
      return false; // Default hide others for now to keep it clean
    });
  };

  const staffList = getVisibleStaff().filter(u => u.id !== currentUser.id); // Exclude self
  
  // Group by Status
  const online = staffList.filter(u => u.status === 'ONLINE');
  const busy = staffList.filter(u => u.status === 'BUSY');
  const breakTime = staffList.filter(u => u.status === 'BREAK');
  const offline = staffList.filter(u => u.status === 'OFFLINE' || u.status === 'LEAVE');

  const StatusSection = ({ title, users, colorClass, icon }: any) => (
    <div className="mb-6">
       <h4 className={`text-xs font-bold uppercase mb-3 flex items-center gap-2 ${colorClass}`}>
          {icon} {title} ({users.length})
       </h4>
       <div className="space-y-2">
          {users.map((u: UserProfile) => (
             <div key={u.id} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-3 flex items-center gap-3">
                <div className="relative">
                   <div className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center text-slate-300 font-bold border border-slate-600">
                      {u.name.charAt(0)}
                   </div>
                   {/* Status Dot */}
                   <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-slate-900 ${
                      u.status === 'ONLINE' ? 'bg-emerald-500' :
                      u.status === 'BUSY' ? 'bg-amber-500' :
                      u.status === 'BREAK' ? 'bg-blue-400' : 'bg-slate-500'
                   }`}></div>
                </div>
                <div>
                   <div className="text-sm font-bold text-slate-200">{u.name}</div>
                   <div className="text-[10px] text-slate-500 flex items-center gap-1.5">
                      <span className="bg-slate-700/50 px-1.5 py-0.5 rounded">{u.role}</span>
                      {u.department === Department.IT_SYSTEMS && <Laptop className="w-3 h-3 text-indigo-400" />}
                      {u.department === Department.AOCC && <Activity className="w-3 h-3 text-rose-400" />}
                   </div>
                </div>
             </div>
          ))}
          {users.length === 0 && <div className="text-[10px] text-slate-600 italic pl-2">No staff currently {title.toLowerCase()}</div>}
       </div>
    </div>
  );

  return (
    <div className="h-full overflow-y-auto p-4 custom-scrollbar">
       
       {/* Header Summary */}
       <div className="mb-6 bg-slate-800 rounded-xl p-4 border border-slate-700 shadow-lg">
          <h3 className="text-sm font-bold text-white mb-1">
             {currentUser.department === Department.AOCC ? 'IT & AOCC Command' : 'Terminal Ops Team'}
          </h3>
          <p className="text-[10px] text-slate-400 mb-3">Real-time attendance & status monitor</p>
          <div className="flex gap-2">
             <div className="flex-1 bg-emerald-900/20 py-2 rounded-lg text-center border border-emerald-500/20">
                <div className="text-lg font-black text-emerald-400">{online.length}</div>
                <div className="text-[9px] text-emerald-200/70 font-bold uppercase">Online</div>
             </div>
             <div className="flex-1 bg-amber-900/20 py-2 rounded-lg text-center border border-amber-500/20">
                <div className="text-lg font-black text-amber-400">{busy.length}</div>
                <div className="text-[9px] text-amber-200/70 font-bold uppercase">Busy</div>
             </div>
             <div className="flex-1 bg-blue-900/20 py-2 rounded-lg text-center border border-blue-500/20">
                <div className="text-lg font-black text-blue-400">{breakTime.length}</div>
                <div className="text-[9px] text-blue-200/70 font-bold uppercase">Break</div>
             </div>
          </div>
       </div>

       <StatusSection 
         title="Active Now" 
         users={online} 
         colorClass="text-emerald-400" 
         icon={<Activity className="w-3 h-3" />} 
       />

       <StatusSection 
         title="Busy / In Task" 
         users={busy} 
         colorClass="text-amber-400" 
         icon={<Clock className="w-3 h-3" />} 
       />

       <StatusSection 
         title="On Break" 
         users={breakTime} 
         colorClass="text-blue-400" 
         icon={<Coffee className="w-3 h-3" />} 
       />

       <StatusSection 
         title="Offline / Off Shift" 
         users={offline} 
         colorClass="text-slate-500" 
         icon={<User className="w-3 h-3" />} 
       />

    </div>
  );
};

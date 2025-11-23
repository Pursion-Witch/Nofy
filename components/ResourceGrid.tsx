
import React from 'react';
import { ResourceStatus, Terminal } from '../types';
import { Briefcase, Plane, DoorOpen, Box, Users } from 'lucide-react';

interface ResourceGridProps {
  resources: ResourceStatus[];
  currentTerminal: Terminal;
}

const getIcon = (type: string) => {
  switch (type) {
    case 'CHECK_IN': return <Box className="w-4 h-4" />;
    case 'CAROUSEL': return <Briefcase className="w-4 h-4" />;
    case 'GATE': return <DoorOpen className="w-4 h-4" />;
    default: return <Plane className="w-4 h-4" />;
  }
};

export const ResourceGrid: React.FC<ResourceGridProps> = ({ resources, currentTerminal }) => {
  
  // FIX 3 & 4: Filter based on Terminal and show relevant grouping
  const visibleResources = resources.filter(r => r.terminal === currentTerminal);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      
      {/* Dynamic Queue/Check-in Status */}
      <div className="bg-slate-800 rounded-lg border border-slate-700 p-3">
         <h4 className="text-xs font-bold text-slate-400 uppercase mb-2 flex items-center gap-2">
            <Users className="w-4 h-4" /> Check-in Queues
         </h4>
         <div className="space-y-2">
            {currentTerminal === Terminal.T1 ? (
               // T1: Counters 1-29
               <div className="grid grid-cols-4 gap-1">
                  {[...Array(12)].map((_, i) => (
                     <div key={i} className={`h-6 rounded text-[9px] flex items-center justify-center font-bold ${
                        i === 4 || i === 5 ? 'bg-amber-500 text-white animate-pulse' : 'bg-emerald-900/30 text-emerald-400'
                     }`}>
                        {i+1}
                     </div>
                  ))}
               </div>
            ) : (
               // T2: Islands A-D
               <div className="space-y-2">
                  {['Island A', 'Island B', 'Island C', 'Island D'].map(island => (
                     <div key={island} className="flex justify-between items-center p-2 rounded bg-slate-900/50">
                        <span className="text-xs text-slate-300">{island}</span>
                        <div className="flex items-center gap-2">
                           <span className={`text-[10px] font-bold ${island === 'Island B' ? 'text-amber-500' : 'text-emerald-500'}`}>
                              {island === 'Island B' ? '12 min' : '4 min'}
                           </span>
                           <div className={`w-2 h-2 rounded-full ${island === 'Island B' ? 'bg-amber-500' : 'bg-emerald-500'}`}></div>
                        </div>
                     </div>
                  ))}
               </div>
            )}
         </div>
      </div>

      {/* Standard Resources */}
      {['GATE', 'CAROUSEL'].map(type => {
        const items = visibleResources.filter(r => r.type === type);
        return (
          <div key={type} className="bg-slate-800 rounded-lg border border-slate-700 p-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase mb-2 flex items-center gap-2">
              {getIcon(type)}
              {type.replace('_', ' ')}
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {items.length === 0 ? (
                 <div className="col-span-2 text-[10px] text-slate-500 italic text-center py-2">No data for {currentTerminal}</div>
              ) : (
                 items.map(item => (
                    <div key={item.id} className={`p-2 rounded border text-center relative ${
                      item.status === 'AVAILABLE' ? 'bg-emerald-900/20 border-emerald-800' :
                      item.status === 'MAINTENANCE' ? 'bg-red-900/20 border-red-800' :
                      'bg-sky-900/20 border-sky-800'
                    }`}>
                      <span className="text-xs font-bold text-white block">{item.id}</span>
                      {item.assignedTo && <span className="text-[10px] text-sky-300 block truncate">{item.assignedTo}</span>}
                      <span className={`absolute top-1 right-1 w-1.5 h-1.5 rounded-full ${
                        item.status === 'AVAILABLE' ? 'bg-emerald-500' :
                        item.status === 'MAINTENANCE' ? 'bg-red-500' : 'bg-sky-500'
                      }`}></span>
                    </div>
                  ))
              )}
            </div>
          </div>
        )
      })}
    </div>
  );
};

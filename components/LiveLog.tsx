import React, { useState } from 'react';
import { LogEntry, IncidentSeverity, Agency } from '../types';
// Fixed: Added missing Activity import from lucide-react
import { Building2, Maximize2, X, AlertTriangle, Shield, Info, Activity } from 'lucide-react';

interface LiveLogProps {
  logs: LogEntry[];
}

export const LiveLog: React.FC<LiveLogProps> = ({ logs }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getIntensityConfig = (sev: IncidentSeverity) => {
    switch (sev) {
      case IncidentSeverity.CRITICAL:
      case IncidentSeverity.URGENT:
        return { color: 'border-red-500 bg-red-950/20 text-red-200', tier: 'RED', icon: <AlertTriangle className="w-3 h-3" /> };
      case IncidentSeverity.HIGH:
        return { color: 'border-orange-500 bg-orange-950/20 text-orange-200', tier: 'ORANGE', icon: <Shield className="w-3 h-3" /> };
      default:
        return { color: 'border-blue-500 bg-blue-950/20 text-blue-200', tier: 'BLUE', icon: <Info className="w-3 h-3" /> };
    }
  };

  const LogContent = () => (
    <div className="space-y-3">
        {logs.length === 0 && (
            <div className="text-center py-10 text-slate-500 text-sm italic">
                System heartbeat stable. No logs.
            </div>
        )}
        {[...logs].reverse().map((log) => {
          const config = getIntensityConfig(log.severity);
          return (
            <div key={log.id} className={`p-4 rounded-xl border-l-4 ${config.color} animate-in fade-in slide-in-from-right-2 duration-300`}>
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                   <span className="text-[9px] font-mono text-slate-500 bg-slate-900/50 px-1.5 py-0.5 rounded border border-slate-700">
                      {log.timestamp.toLocaleTimeString([], { hour12: false })}
                   </span>
                   <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full flex items-center gap-1 border ${
                      config.tier === 'RED' ? 'bg-red-500 text-white border-red-400' :
                      config.tier === 'ORANGE' ? 'bg-orange-500 text-white border-orange-400' :
                      'bg-blue-600 text-white border-blue-400'
                   }`}>
                      {config.icon} {config.tier}
                   </span>
                </div>
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{log.originDept}</span>
              </div>
              <p className="text-sm font-semibold tracking-tight leading-snug">{log.message}</p>
              
              <div className="mt-3 flex items-center justify-between border-t border-slate-700/30 pt-2">
                 <div className="flex gap-1">
                   {log.targetDept.slice(0, 2).map(dept => (
                      <span key={dept} className="text-[8px] bg-slate-800 text-slate-400 px-1 rounded uppercase font-bold">{dept.split('_')[0]}</span>
                   ))}
                 </div>
                 {log.agenciesInvolved.length > 0 && (
                    <div className="flex items-center gap-1 text-[9px] text-slate-500">
                       <Building2 className="w-3 h-3" /> {log.agenciesInvolved.length} External
                    </div>
                 )}
              </div>
            </div>
          );
        })}
    </div>
  );

  return (
    <>
      <div className="bg-slate-800 rounded-2xl border border-slate-700/50 shadow-xl overflow-hidden h-full flex flex-col relative">
        <div className="p-4 border-b border-slate-700/50 bg-slate-800/80 backdrop-blur flex justify-between items-center">
          <h3 className="font-bold text-white flex items-center gap-2 text-sm uppercase tracking-widest">
            <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse shadow-[0_0_8px_#6366f1]"></span>
            Neural Feed
          </h3>
          <div className="flex items-center gap-2">
             <span className="text-[10px] font-black text-slate-500 bg-slate-900 px-2 py-0.5 rounded-full border border-slate-700">{logs.length} EVT</span>
             <button onClick={() => setIsExpanded(true)} className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-500 hover:text-indigo-400 transition-colors">
                <Maximize2 className="w-4 h-4" />
             </button>
          </div>
        </div>
        
        <div className="flex-grow overflow-y-auto p-4 custom-scrollbar bg-slate-950/20">
          <LogContent />
        </div>
      </div>

      {isExpanded && (
        <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-300">
           <div className="w-full max-w-3xl h-full bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
              <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
                 <h2 className="text-xl font-black text-white flex items-center gap-3">
                    <Activity className="w-6 h-6 text-indigo-500" />
                    FULL OPERATIONS AUDIT
                 </h2>
                 <button onClick={() => setIsExpanded(false)} className="p-3 hover:bg-slate-800 rounded-full text-slate-500 hover:text-white transition-all">
                    <X className="w-6 h-6" />
                 </button>
              </div>
              <div className="flex-grow overflow-y-auto p-8 custom-scrollbar">
                 <LogContent />
              </div>
           </div>
        </div>
      )}
    </>
  );
};

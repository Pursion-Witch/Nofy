
import React, { useState } from 'react';
import { Phone, Shield, HeartPulse, Sparkles, RadioTower, Clock } from 'lucide-react';
import { Department, LogEntry, IncidentSeverity, Terminal } from '../types';

interface DirectoryProps {
  onLogCall: (log: LogEntry) => void;
  currentTerminal: Terminal;
}

export const Directory: React.FC<DirectoryProps> = ({ onLogCall, currentTerminal }) => {
  const [lastCall, setLastCall] = useState<string | null>(null);

  const handleCall = (deptName: string, deptEnum: Department) => {
    // 1. Simulate "Call"
    setLastCall(`Calling ${deptName}...`);
    
    // 2. Auto-log the call
    const log: LogEntry = {
      id: Date.now().toString(),
      timestamp: new Date(),
      message: `[OUTBOUND CALL] User initiated call to ${deptName} via Speed Dial.`,
      category: 'CALL_LOG',
      severity: IncidentSeverity.LOW,
      originDept: Department.TERMINAL_OPS, // Assuming generic user
      targetDept: [deptEnum],
      agenciesInvolved: [],
      terminal: currentTerminal
    };
    onLogCall(log);

    // 3. Clear status
    setTimeout(() => setLastCall(null), 3000);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
      
      {/* BUTTON 3: ROLE-BASED SPEED DIAL */}
      <div>
         <h2 className="text-xl font-bold text-slate-200 mb-4 px-2 flex items-center gap-2">
            <Phone className="w-5 h-5 text-indigo-400" />
            Quick Directory
         </h2>
         
         {lastCall && (
            <div className="mb-4 bg-emerald-500/20 text-emerald-300 p-3 rounded-xl border border-emerald-500/50 text-center font-bold animate-pulse">
               {lastCall}
            </div>
         )}

         <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => handleCall('Medical / First Response', Department.SAFETY_QUALITY)}
              className="p-4 bg-rose-900/20 border border-rose-800 hover:bg-rose-900/40 rounded-xl flex flex-col items-center gap-2 transition-all active:scale-95"
            >
               <div className="w-10 h-10 rounded-full bg-rose-600 flex items-center justify-center text-white shadow-lg">
                  <HeartPulse className="w-6 h-6" />
               </div>
               <span className="text-sm font-bold text-rose-200">Medical Emergency</span>
               <span className="text-[10px] text-rose-400">Loc: 8891</span>
            </button>

            <button 
              onClick={() => handleCall('Security Command', Department.SECURITY)}
              className="p-4 bg-slate-800 border border-slate-700 hover:bg-slate-700 rounded-xl flex flex-col items-center gap-2 transition-all active:scale-95"
            >
               <div className="w-10 h-10 rounded-full bg-slate-600 flex items-center justify-center text-white shadow-lg">
                  <Shield className="w-6 h-6" />
               </div>
               <span className="text-sm font-bold text-slate-200">Security / PNP</span>
               <span className="text-[10px] text-slate-400">Loc: 1102</span>
            </button>

            <button 
              onClick={() => handleCall('AOCC Control', Department.AOCC)}
              className="p-4 bg-amber-900/20 border border-amber-800 hover:bg-amber-900/40 rounded-xl flex flex-col items-center gap-2 transition-all active:scale-95"
            >
               <div className="w-10 h-10 rounded-full bg-amber-600 flex items-center justify-center text-white shadow-lg">
                  <RadioTower className="w-6 h-6" />
               </div>
               <span className="text-sm font-bold text-amber-200">Ops Control (AOCC)</span>
               <span className="text-[10px] text-amber-400">Loc: 5500</span>
            </button>

            <button 
              onClick={() => handleCall('Janitorial Supervisor', Department.SAFETY_QUALITY)}
              className="p-4 bg-sky-900/20 border border-sky-800 hover:bg-sky-900/40 rounded-xl flex flex-col items-center gap-2 transition-all active:scale-95"
            >
               <div className="w-10 h-10 rounded-full bg-sky-600 flex items-center justify-center text-white shadow-lg">
                  <Sparkles className="w-6 h-6" />
               </div>
               <span className="text-sm font-bold text-sky-200">Clean Up / Facilities</span>
               <span className="text-[10px] text-sky-400">Mobile: 0917...</span>
            </button>
         </div>
      </div>

      {/* External Agencies List */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
         <div className="p-3 bg-slate-900 border-b border-slate-700 text-xs font-bold text-slate-400 uppercase">
            External Agencies
         </div>
         <div className="divide-y divide-slate-700">
            {['Bureau of Immigration', 'Bureau of Customs', 'OTS (Office of Trans Security)', 'PAGASA Weather Stn'].map((agency, i) => (
               <div key={i} className="p-3 flex justify-between items-center hover:bg-slate-700/50 transition-colors">
                  <span className="text-sm font-medium text-slate-300">{agency}</span>
                  <button className="p-2 bg-slate-700 hover:bg-indigo-600 rounded-full transition-colors text-white">
                     <Phone className="w-3 h-3" />
                  </button>
               </div>
            ))}
         </div>
      </div>
    </div>
  );
};

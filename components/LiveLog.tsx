

import React, { useState } from 'react';
import { LogEntry, IncidentSeverity, Agency } from '../types';
import { AlertCircle, CheckCircle, Info, Building2, Maximize2, X, Minimize2 } from 'lucide-react';

interface LiveLogProps {
  logs: LogEntry[];
}

export const LiveLog: React.FC<LiveLogProps> = ({ logs }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getSeverityColor = (sev: IncidentSeverity) => {
    switch (sev) {
      case IncidentSeverity.CRITICAL: return 'border-red-500 bg-red-900/10 text-red-200';
      case IncidentSeverity.URGENT: return 'border-rose-500 bg-rose-900/10 text-rose-200';
      case IncidentSeverity.HIGH: return 'border-orange-500 bg-orange-900/10 text-orange-200';
      case IncidentSeverity.MEDIUM: return 'border-yellow-500 bg-yellow-900/10 text-yellow-200';
      default: return 'border-sky-500 bg-sky-900/10 text-slate-200';
    }
  };

  const LogContent = () => (
    <div className="space-y-3">
        {logs.length === 0 && (
            <div className="text-center py-10 text-slate-500 text-sm italic">
                No active logs. System ready.
            </div>
        )}
        {[...logs].reverse().map((log) => (
          <div key={log.id} className={`p-3 rounded-lg border-l-4 ${getSeverityColor(log.severity)} bg-slate-800/50`}>
            <div className="flex justify-between items-start mb-1">
              <span className="text-[10px] font-mono opacity-70">
                {log.timestamp.toLocaleTimeString()}
              </span>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
                 log.severity === 'CRITICAL' || log.severity === 'URGENT' ? 'bg-red-500 text-white' : 'bg-slate-700 text-slate-300'
              }`}>
                {log.severity}
              </span>
            </div>
            <p className="text-sm font-medium">{log.message}</p>
            
            {/* Agency Tags */}
            {log.agenciesInvolved && log.agenciesInvolved.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {log.agenciesInvolved.map(agency => (
                  <span key={agency} className="inline-flex items-center gap-1 text-[10px] bg-slate-900 border border-slate-600 px-1.5 py-0.5 rounded text-slate-300">
                    <Building2 className="w-3 h-3" /> {agency.replace('_', ' ')}
                  </span>
                ))}
              </div>
            )}

            {/* AI Analysis Hint */}
            {log.aiAnalysis && (
                 <div className="mt-2 p-2 bg-black/20 rounded text-xs text-slate-400 font-mono border-t border-white/5">
                    <span className="text-sky-500 font-bold mr-1">NEXUS_CORE:</span> 
                    {log.aiAnalysis.substring(0, 100)}...
                 </div>
            )}
          </div>
        ))}
    </div>
  );

  return (
    <>
      <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-lg overflow-hidden h-full flex flex-col relative">
        <div className="p-4 border-b border-slate-700 bg-slate-800/50 backdrop-blur flex justify-between items-center">
          <h3 className="font-bold text-white flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            Live Operations Log
          </h3>
          <div className="flex items-center gap-2">
             <span className="text-xs text-slate-400">{logs.length} Events</span>
             <button 
                onClick={() => setIsExpanded(true)}
                className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white transition-colors"
             >
                <Maximize2 className="w-4 h-4" />
             </button>
          </div>
        </div>
        
        <div className="flex-grow overflow-y-auto p-4 custom-scrollbar">
          <LogContent />
        </div>
      </div>

      {/* EXPANDED MODAL */}
      {isExpanded && (
        <div className="fixed inset-0 z-50 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center p-4">
           <div className="w-full max-w-2xl h-[85vh] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col animate-in zoom-in-95 duration-200">
              <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-800/50 rounded-t-2xl">
                 <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-indigo-400" />
                    Full Operations Log
                 </h2>
                 <button 
                   onClick={() => setIsExpanded(false)}
                   className="p-2 hover:bg-slate-700 rounded-full text-slate-400 hover:text-white"
                 >
                    <X className="w-6 h-6" />
                 </button>
              </div>
              <div className="flex-grow overflow-y-auto p-6 custom-scrollbar">
                 <LogContent />
              </div>
           </div>
        </div>
      )}
    </>
  );
};
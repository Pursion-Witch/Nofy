
import React, { useState, useMemo } from 'react';
import { LogEntry, IncidentSeverity, Agency, UpdateType, LogUpdate, UserProfile, Department } from '../types';
import { Building2, Maximize2, X, AlertTriangle, Shield, Info, Activity, MessageCircle, Clock, Send, CheckCircle2, Filter, ChevronDown } from 'lucide-react';
import { api } from '../virtualBackend';

interface LiveLogProps {
  logs: LogEntry[];
  currentUser?: UserProfile;
}

type PriorityFilter = 'ALL' | 'RED' | 'ORANGE' | 'BLUE' | 'RESOLVED';

export const LiveLog: React.FC<LiveLogProps> = ({ logs, currentUser }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeUpdateLog, setActiveUpdateLog] = useState<LogEntry | null>(null);
  const [filterType, setFilterType] = useState<PriorityFilter>('ALL');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // Submission Form State
  const [updateType, setUpdateType] = useState<UpdateType>('UPDATE');
  const [updateContent, setUpdateContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  // PRIORITY SORTING LOGIC: Red -> Orange -> Blue -> Resolved
  const processedLogs = useMemo(() => {
    let list = [...logs];

    // Filter Logic
    if (filterType !== 'ALL') {
        list = list.filter(log => {
            if (filterType === 'RESOLVED') return log.isResolved;
            if (log.isResolved) return false; // Hide resolved if specific tier selected
            const tier = getIntensityConfig(log.severity).tier;
            return tier === filterType;
        });
    }

    // Sorting Logic
    return list.sort((a, b) => {
        // Rule 1: Resolved always goes last
        if (a.isResolved && !b.isResolved) return 1;
        if (!a.isResolved && b.isResolved) return -1;

        // Rule 2: Tier priority for unresolved
        const tierWeights = { 'RED': 3, 'ORANGE': 2, 'BLUE': 1 };
        const aTier = getIntensityConfig(a.severity).tier as keyof typeof tierWeights;
        const bTier = getIntensityConfig(b.severity).tier as keyof typeof tierWeights;

        if (tierWeights[aTier] !== tierWeights[bTier]) {
            return tierWeights[bTier] - tierWeights[aTier];
        }

        // Rule 3: Time priority (Newest first) within same tier
        return b.timestamp.getTime() - a.timestamp.getTime();
    });
  }, [logs, filterType]);

  const handleOpenUpdate = (log: LogEntry) => {
      setActiveUpdateLog(log);
  };

  const submitUpdate = async () => {
      if (!activeUpdateLog || !updateContent.trim() || !currentUser) return;
      setIsSubmitting(true);

      const newUpdate: LogUpdate = {
          id: Date.now().toString(),
          timestamp: new Date(),
          authorName: currentUser.name,
          authorDept: currentUser.department,
          type: updateType,
          content: updateContent
      };

      try {
          await api.commands.addLogUpdate(activeUpdateLog.id, newUpdate);
          const updatedLogs = await api.queries.getLogs();
          const refreshedLog = updatedLogs.find(l => l.id === activeUpdateLog.id);
          if (refreshedLog) setActiveUpdateLog(refreshedLog);
          setUpdateContent('');
          setUpdateType('UPDATE');
      } catch (err) {
          console.error("Failed to add log update:", err);
      } finally {
          setIsSubmitting(false);
      }
  };

  const LogList = ({ items }: { items: LogEntry[] }) => (
    <div className="space-y-3">
        {items.length === 0 && (
            <div className="text-center py-10 text-slate-500 text-sm italic">
                No logs found matching selection.
            </div>
        )}
        {items.map((log) => {
          const config = getIntensityConfig(log.severity);
          const isIncident = log.category === 'INCIDENT' || ['CRITICAL', 'HIGH', 'URGENT'].includes(log.severity);
          const latestUpdate = log.updates && log.updates.length > 0 ? log.updates[log.updates.length - 1] : null;
          
          return (
            <div key={log.id} className={`p-4 rounded-xl border-l-4 ${config.color} animate-in fade-in slide-in-from-right-2 duration-300 relative transition-all`}>
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                   <span className="text-[9px] font-mono text-slate-500 bg-slate-900/50 px-1.5 py-0.5 rounded border border-slate-700">
                      {log.timestamp.toLocaleTimeString([], { hour12: false })}
                   </span>
                   {!log.isResolved ? (
                       <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full flex items-center gap-1 border ${
                          config.tier === 'RED' ? 'bg-red-500 text-white border-red-400 shadow-[0_0_8px_rgba(239,68,68,0.4)]' :
                          config.tier === 'ORANGE' ? 'bg-orange-500 text-white border-orange-400' :
                          'bg-blue-600 text-white border-blue-400'
                       }`}>
                          {config.icon} {config.tier}
                       </span>
                   ) : (
                       <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full flex items-center gap-1 bg-emerald-600 text-white border border-emerald-400">
                          <CheckCircle2 className="w-3 h-3" /> RESOLVED
                       </span>
                   )}
                </div>
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{log.originDept}</span>
              </div>
              <p className="text-sm font-semibold tracking-tight leading-snug">{log.message}</p>
              
              {latestUpdate && (
                  <div className="mt-2 p-2 bg-black/20 rounded-lg border border-white/5 flex items-start gap-2">
                      <div className={`mt-0.5 px-1 py-0.5 rounded text-[8px] font-black shrink-0 ${
                          latestUpdate.type === 'INFORMATION' ? 'bg-blue-600 text-white' :
                          latestUpdate.type === 'UPDATE' ? 'bg-yellow-600 text-slate-900' :
                          'bg-emerald-600 text-white'
                      }`}>{latestUpdate.type}</div>
                      <p className="text-[11px] text-slate-400 italic line-clamp-1 flex-1">
                          "{latestUpdate.content}" — <span className="font-bold">{latestUpdate.authorName}</span>
                      </p>
                  </div>
              )}
              
              <div className="mt-3 flex items-center justify-between border-t border-slate-700/30 pt-2 flex-wrap gap-2">
                 <div className="flex gap-1 flex-wrap">
                   {log.targetDept.slice(0, 3).map(dept => (
                      <span key={dept} className="text-[8px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded uppercase font-bold border border-slate-700">{dept.split('_')[0]}</span>
                   ))}
                   {log.requestedTeams?.map(team => (
                      <span key={team} className="text-[8px] bg-indigo-900/40 text-indigo-300 px-1.5 py-0.5 rounded uppercase font-black border border-indigo-500/30">
                         REQ:{team}
                      </span>
                   ))}
                 </div>
                 
                 <div className="flex items-center gap-2">
                    {isIncident && !log.isResolved && (
                        <button 
                            onClick={() => handleOpenUpdate(log)}
                            className="flex items-center gap-1 px-2 py-1 rounded bg-slate-700 hover:bg-indigo-600 text-white text-[10px] font-bold transition-all shadow-sm"
                        >
                            <MessageCircle className="w-3 h-3" /> UPDATE
                        </button>
                    )}
                    {log.updates && log.updates.length > 0 && log.isResolved && (
                        <button 
                            onClick={() => handleOpenUpdate(log)}
                            className="flex items-center gap-1 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 text-[10px] font-bold transition-all"
                        >
                            <Activity className="w-3 h-3" /> HISTORY
                        </button>
                    )}
                 </div>
              </div>
            </div>
          );
        })}
    </div>
  );

  return (
    <>
      <div className="bg-slate-800 rounded-2xl border border-slate-700/50 shadow-xl overflow-hidden h-full flex flex-col relative">
        <div className="p-4 border-b border-slate-700/50 bg-slate-800/80 backdrop-blur flex justify-between items-center z-10">
          <div className="flex items-center gap-3">
            <h3 className="font-bold text-white flex items-center gap-2 text-sm uppercase tracking-widest">
              <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse shadow-[0_0_8px_#6366f1]"></span>
              Neural Feed
            </h3>
            
            {/* Filter Dropdown */}
            <div className="relative">
                <button 
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-[9px] font-black border transition-all ${
                    filterType === 'ALL' ? 'bg-slate-900 text-slate-400 border-slate-700' : 
                    filterType === 'RED' ? 'bg-red-600 text-white border-red-500' :
                    filterType === 'ORANGE' ? 'bg-orange-500 text-white border-orange-400' :
                    filterType === 'BLUE' ? 'bg-blue-600 text-white border-blue-500' :
                    'bg-emerald-600 text-white border-emerald-500'
                  }`}
                >
                    <Filter className="w-2.5 h-2.5" />
                    {filterType}
                    <ChevronDown className={`w-2.5 h-2.5 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {isFilterOpen && (
                    <div className="absolute left-0 top-full mt-1 w-28 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 origin-top-left flex flex-col p-1 z-50">
                        {(['ALL', 'RED', 'ORANGE', 'BLUE', 'RESOLVED'] as PriorityFilter[]).map(t => (
                            <button
                                key={t}
                                onClick={() => { setFilterType(t); setIsFilterOpen(false); }}
                                className={`w-full text-left px-2 py-1.5 rounded-lg text-[9px] font-bold transition-colors ${
                                    filterType === t ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-700 hover:text-white'
                                }`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                )}
            </div>
          </div>

          <div className="flex items-center gap-2">
             <span className="hidden sm:inline text-[10px] font-black text-slate-500 bg-slate-900 px-2 py-0.5 rounded-full border border-slate-700">{processedLogs.length} EVT</span>
             <button onClick={() => setIsExpanded(true)} className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-500 hover:text-indigo-400 transition-colors">
                <Maximize2 className="w-4 h-4" />
             </button>
          </div>
        </div>
        
        <div className="flex-grow overflow-y-auto p-4 custom-scrollbar bg-slate-950/20">
          <LogList items={processedLogs} />
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
                 <LogList items={processedLogs} />
              </div>
           </div>
        </div>
      )}

      {/* UPDATE INCIDENT MODAL */}
      {activeUpdateLog && (
          <div className="fixed inset-0 z-[200] bg-slate-950/90 backdrop-blur flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh]">
                  <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
                      <div>
                          <h3 className="text-white font-bold flex items-center gap-2">
                             <MessageCircle className="w-4 h-4 text-indigo-400" /> Resolution Log
                          </h3>
                      </div>
                      <button onClick={() => setActiveUpdateLog(null)} className="p-2 hover:bg-slate-800 rounded-full text-slate-400">
                          <X className="w-5 h-5" />
                      </button>
                  </div>

                  <div className="p-4 bg-indigo-900/10 border-b border-slate-800">
                      <div className="text-[10px] font-black text-indigo-400 uppercase mb-1">ORIGINAL REPORT</div>
                      <p className="text-sm text-slate-200 font-medium italic">"{activeUpdateLog.message}"</p>
                  </div>

                  <div className="flex-grow overflow-y-auto p-4 space-y-3 custom-scrollbar bg-slate-950/50 min-h-[150px]">
                      {(!activeUpdateLog.updates || activeUpdateLog.updates.length === 0) ? (
                          <div className="text-center py-10 text-slate-600 text-xs italic">No updates reported yet.</div>
                      ) : (
                          activeUpdateLog.updates.map((u) => (
                              <div key={u.id} className={`p-3 rounded-xl border flex flex-col gap-1.5 animate-in slide-in-from-bottom-2 ${
                                  u.type === 'INFORMATION' ? 'bg-blue-600/10 border-blue-500/20' :
                                  u.type === 'UPDATE' ? 'bg-yellow-600/10 border-yellow-500/20' :
                                  'bg-emerald-600/10 border-emerald-500/20'
                              }`}>
                                  <div className="flex justify-between items-center">
                                      <div className="flex items-center gap-2">
                                          <span className={`text-[9px] font-black px-1.5 py-0.5 rounded border ${
                                              u.type === 'INFORMATION' ? 'bg-blue-600 text-white border-blue-400' :
                                              u.type === 'UPDATE' ? 'bg-yellow-600 text-slate-900 border-yellow-400' :
                                              'bg-emerald-600 text-white border-emerald-400'
                                          }`}>
                                              {u.type}
                                          </span>
                                          <span className="text-[9px] text-slate-400 font-mono flex items-center gap-1">
                                              <Clock className="w-3 h-3" /> {u.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                          </span>
                                      </div>
                                      <div className="text-[9px] font-bold text-slate-500 uppercase">{u.authorName} ({u.authorDept})</div>
                                  </div>
                                  <p className="text-sm text-slate-200 leading-relaxed">{u.content}</p>
                              </div>
                          ))
                      )}
                  </div>

                  {!activeUpdateLog.isResolved && (
                    <div className="p-4 border-t border-slate-800 bg-slate-900">
                        <div className="grid grid-cols-1 gap-3">
                            <div>
                                <label className="text-[10px] font-bold text-slate-500 uppercase ml-1 block mb-1">Update Type</label>
                                <div className="flex gap-2">
                                    {(['INFORMATION', 'UPDATE', 'RESOLUTION'] as UpdateType[]).map(t => (
                                        <button
                                            key={t}
                                            onClick={() => setUpdateType(t)}
                                            className={`flex-1 py-2 rounded-lg text-[10px] font-black border transition-all ${
                                                updateType === t 
                                                  ? t === 'INFORMATION' ? 'bg-blue-600 border-blue-500 text-white' :
                                                    t === 'UPDATE' ? 'bg-yellow-600 border-yellow-500 text-slate-900' :
                                                    'bg-emerald-600 border-emerald-500 text-white'
                                                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
                                            }`}
                                        >
                                            {t}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-500 uppercase ml-1 block mb-1">Update Description</label>
                                <textarea
                                    value={updateContent}
                                    onChange={e => setUpdateContent(e.target.value)}
                                    rows={4}
                                    placeholder="Provide latest status..."
                                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-sm text-white focus:ring-1 focus:ring-indigo-500 outline-none resize-none"
                                />
                            </div>
                            <button 
                                onClick={submitUpdate}
                                disabled={!updateContent.trim() || isSubmitting}
                                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white font-black rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                            >
                                {isSubmitting ? <Activity className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                SUBMIT UPDATE
                            </button>
                        </div>
                    </div>
                  )}

                  {activeUpdateLog.isResolved && (
                      <div className="p-4 bg-emerald-900/10 border-t border-emerald-500/20 text-center">
                          <p className="text-emerald-400 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                             <CheckCircle2 className="w-4 h-4" /> This incident has been resolved.
                          </p>
                      </div>
                  )}
              </div>
          </div>
      )}
    </>
  );
};

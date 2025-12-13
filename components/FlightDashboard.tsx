
import React, { useState } from 'react';
import { Flight, Terminal, Department, UserProfile } from '../types';
import { 
  Plane, AlertTriangle, Clock, MapPin, 
  Accessibility, Stethoscope, Baby, Crown, 
  Filter, AlertCircle, FileText, Luggage, Megaphone, ArrowRight, UserCheck, Lock, Eye
} from 'lucide-react';
import { FlightManifest } from './FlightManifest';

interface FlightDashboardProps {
  flights: Flight[];
  currentTerminal: Terminal;
  userRole: Department;
  currentUser?: UserProfile;
}

type TabMode = 'INCOMING' | 'OUTGOING' | 'ISSUES';
type FilterScope = 'ALL' | 'T1' | 'T2';

export const FlightDashboard: React.FC<FlightDashboardProps> = ({ flights, currentTerminal, userRole, currentUser }) => {
  const [activeTab, setActiveTab] = useState<TabMode>('OUTGOING');
  const [aoccFilter, setAoccFilter] = useState<FilterScope>('ALL');
  const [selectedManifestFlight, setSelectedManifestFlight] = useState<Flight | null>(null);
  
  // Quick Action State
  const [advisoryOpenId, setAdvisoryOpenId] = useState<string | null>(null);

  // PERMISSION LOGIC:
  const isAOCC = userRole === Department.AOCC || userRole === Department.IT_SYSTEMS;
  
  // RBAC Checks
  const canEdit = currentUser?.accessLevel === 'ADMIN' || currentUser?.accessLevel === 'OPERATOR';
  const canViewManifest = canEdit || currentUser?.accessLevel === 'VIEWER';

  const getFilteredFlights = () => {
    let scopeFiltered = flights;
    
    // 1. Terminal Scope
    if (isAOCC) {
        if (aoccFilter !== 'ALL') {
            scopeFiltered = flights.filter(f => f.terminal === aoccFilter);
        }
    } else {
        // Strict Lock for others
        scopeFiltered = flights.filter(f => f.terminal === currentTerminal);
    }

    // 2. Tab Scope
    switch (activeTab) {
        case 'INCOMING':
            return scopeFiltered.filter(f => f.type === 'ARRIVAL' && f.status !== 'CANCELLED');
        case 'OUTGOING':
            return scopeFiltered.filter(f => f.type === 'DEPARTURE' && f.status !== 'CANCELLED');
        case 'ISSUES':
            return scopeFiltered.filter(f => f.status === 'CANCELLED' || f.status === 'DELAYED' || f.criticalIssue);
        default:
            return scopeFiltered;
    }
  };

  const visibleFlights = getFilteredFlights();

  // Helper for Pax Load Color
  const getLoadColor = (pax: number, cap: number) => {
    const percentage = (pax / cap) * 100;
    if (percentage >= 90) return 'bg-amber-500'; // Warning
    if (percentage >= 75) return 'bg-emerald-500'; // Healthy
    return 'bg-sky-500'; // Low
  };

  const getPercentage = (pax: number, cap: number) => Math.round((pax / cap) * 100);

  const handleSwitchFlight = (targetFlightNumber: string) => {
      const target = flights.find(f => f.flightNumber.replace(/\s/g, '') === targetFlightNumber.replace(/\s/g, ''));
      if (target) {
          setSelectedManifestFlight(target);
      } else {
          alert(`Simulating redirect to connecting flight: ${targetFlightNumber}. (Flight not in mock database)`);
      }
  };

  const sendAdvisory = (type: string, flightNum: string) => {
      if (!canEdit) return;
      alert(`[SIMULATION] Sending advisory "${type}" to all passengers of ${flightNum}. Apps and Screens updating.`);
      setAdvisoryOpenId(null);
  };

  return (
    <div className="space-y-4 pb-20 min-h-screen">
      
      {/* HEADER & CONTROLS */}
      <div className="sticky top-[96px] z-40 bg-slate-900/95 backdrop-blur-sm pb-2 pt-2 shadow-lg -mx-4 px-4 border-b border-slate-800">
          <div className="flex items-center justify-between mb-3">
             <h2 className="text-xl font-bold text-slate-200 flex items-center gap-2">
                <Plane className="w-5 h-5 text-indigo-400" />
                Flight Control
             </h2>
             
             {isAOCC && (
                <div className="flex bg-slate-800 rounded-lg p-0.5 border border-slate-700">
                    {['ALL', 'T1', 'T2'].map((scope) => (
                        <button
                            key={scope}
                            onClick={() => setAoccFilter(scope as FilterScope)}
                            className={`px-3 py-1 text-[10px] font-bold rounded ${
                                aoccFilter === scope ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                            }`}
                        >
                            {scope}
                        </button>
                    ))}
                </div>
             )}
             
             {!isAOCC && (
                 <span className="text-[10px] font-bold bg-slate-800 text-slate-400 px-2 py-1 rounded border border-slate-700">
                    {currentTerminal} VIEW
                 </span>
             )}
          </div>

          <div className="flex gap-2">
             <button 
                onClick={() => setActiveTab('INCOMING')}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                   activeTab === 'INCOMING' 
                   ? 'bg-sky-900/30 border-sky-500 text-sky-400' 
                   : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}
             >
                ARRIVALS
             </button>
             <button 
                onClick={() => setActiveTab('OUTGOING')}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                   activeTab === 'OUTGOING' 
                   ? 'bg-emerald-900/30 border-emerald-500 text-emerald-400' 
                   : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}
             >
                DEPARTURES
             </button>
             <button 
                onClick={() => setActiveTab('ISSUES')}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                   activeTab === 'ISSUES' 
                   ? 'bg-rose-900/30 border-rose-500 text-rose-400' 
                   : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}
             >
                ISSUES ({flights.filter(f => f.status === 'CANCELLED' || f.status === 'DELAYED').length})
             </button>
          </div>
      </div>

      {/* LIST VIEW */}
      <div className="space-y-3 px-1">
        {visibleFlights.length === 0 && (
            <div className="text-center py-10 text-slate-500 italic text-sm">
                No flights found for this view.
            </div>
        )}

        {visibleFlights.map((f, idx) => {
            const isHighLoad = getPercentage(f.paxCount, f.capacity) >= 90;
            const isIssue = activeTab === 'ISSUES';
            const isDisrupted = f.status === 'CANCELLED' || f.status === 'DELAYED';

            return (
                <div 
                  key={idx} 
                  className={`bg-slate-800 rounded-xl border relative overflow-visible transition-all active:scale-[0.99] ${
                      isIssue ? 'border-rose-500 shadow-rose-900/20' : 'border-slate-700 shadow-lg'
                  }`}
                >
                    {/* High Load Warning Strip */}
                    {!isIssue && isHighLoad && (
                        <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>
                    )}
                    
                    <div className="p-4">
                        {/* ROW 1: Identity & Route */}
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-slate-700 flex items-center justify-center text-slate-300 font-black text-sm border border-slate-600">
                                    {f.airline.substring(0, 2).toUpperCase()}
                                </div>
                                <div>
                                    <div className="text-lg font-black text-white leading-none mb-1">
                                        {f.flightNumber}
                                    </div>
                                    <div className="flex items-center gap-1 text-xs text-slate-400">
                                        <span className="font-bold text-slate-300">{f.type === 'DEPARTURE' ? f.destination : f.origin}</span>
                                        {isAOCC && <span className="ml-1 text-[9px] px-1 bg-slate-700 rounded text-slate-400">{f.terminal}</span>}
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className={`text-sm font-bold ${
                                    f.status === 'ON TIME' ? 'text-emerald-400' : 
                                    f.status === 'LANDED' ? 'text-emerald-400' :
                                    f.status === 'DELAYED' ? 'text-amber-500' : 
                                    f.status === 'CANCELLED' ? 'text-rose-500' : 'text-sky-400'
                                }`}>
                                    {f.status}
                                </div>
                                <div className="flex items-center justify-end gap-1 text-xs text-slate-400 font-mono mt-0.5">
                                    <Clock className="w-3 h-3" />
                                    <span className={f.status === 'DELAYED' ? 'text-amber-500 font-bold' : ''}>
                                        {f.status === 'LANDED' || f.status === 'APPROACHING' || f.status === 'DELAYED' ? f.estimatedTime : f.scheduledTime}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* ROW 2: Operational Data */}
                        <div className="grid grid-cols-2 gap-2 mb-4 bg-slate-900/50 rounded-lg p-2 border border-slate-700/50">
                            <div className="flex items-center gap-2">
                                <Filter className="w-4 h-4 text-indigo-400" />
                                <div>
                                    <div className="text-[9px] text-slate-500 uppercase font-bold">
                                        {f.type === 'ARRIVAL' ? 'Carousel' : 'Check-In'}
                                    </div>
                                    <div className="text-sm font-bold text-slate-200">
                                        {f.type === 'ARRIVAL' ? (f.carousel || 'TBD') : (
                                            f.terminal === 'T1' ? (f.assignedCounters || 'TBD') : (f.assignedIsland || 'TBD')
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 border-l border-slate-700 pl-2">
                                <div className="flex flex-col gap-1 w-full">
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-3 h-3 text-emerald-400" />
                                        <div className="text-xs font-bold text-white">
                                            Gate {f.gate || 'TBD'}
                                        </div>
                                    </div>
                                    {f.type === 'DEPARTURE' && (
                                        <div className="flex items-center gap-2 mt-1">
                                            <Luggage className="w-3 h-3 text-sky-400" />
                                            <div className="text-[10px] font-bold text-sky-200">
                                                Drop: {f.bagDrop || 'N/A'}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* ISSUE REASON ROW */}
                        {isIssue && f.reasonCode && (
                            <div className="mb-4 p-2 bg-rose-900/20 border border-rose-900/50 rounded flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4 text-rose-500" />
                                <span className="text-xs font-bold text-rose-300">Reason: {f.reasonCode}</span>
                            </div>
                        )}

                        {/* ROW 3: Pax Load & Buttons */}
                        <div className="flex flex-col gap-3">
                                {!isIssue && (
                                    <div>
                                        <div className="flex justify-between text-[10px] uppercase font-bold text-slate-500 mb-1">
                                            <span>Pax Load ({getPercentage(f.paxCount, f.capacity)}%)</span>
                                            <span className={isHighLoad ? 'text-amber-500' : 'text-slate-400'}>
                                                {f.paxCount} / {f.capacity}
                                            </span>
                                        </div>
                                        <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                                            <div 
                                                className={`h-full ${getLoadColor(f.paxCount, f.capacity)}`} 
                                                style={{ width: `${getPercentage(f.paxCount, f.capacity)}%` }}
                                            ></div>
                                        </div>
                                        {isHighLoad && (
                                            <div className="text-[9px] text-amber-500 font-bold mt-1 flex items-center gap-1">
                                                <AlertCircle className="w-3 h-3" /> Anticipate Queue Buildup
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className={`flex items-center justify-between pt-2 ${!isIssue ? 'border-t border-slate-700/50' : ''}`}>
                                   <div className="flex flex-wrap gap-2">
                                      {(f.ssr.wchr > 0 || f.ssr.meda > 0 || f.ssr.umnr > 0 || f.ssr.vip > 0) ? (
                                          <>
                                              {f.ssr.meda > 0 && <div className="flex items-center gap-1 px-2 py-1 rounded bg-rose-900/30 border border-rose-500/50 text-rose-300 text-[10px] font-bold"><Stethoscope className="w-3 h-3" /> MEDA: {f.ssr.meda}</div>}
                                              {f.ssr.wchr > 0 && <div className="flex items-center gap-1 px-2 py-1 rounded bg-indigo-900/30 border border-indigo-500/50 text-indigo-300 text-[10px] font-bold"><Accessibility className="w-3 h-3" /> WCHR: {f.ssr.wchr}</div>}
                                              {f.ssr.umnr > 0 && <div className="flex items-center gap-1 px-2 py-1 rounded bg-sky-900/30 border border-sky-500/50 text-sky-300 text-[10px] font-bold"><Baby className="w-3 h-3" /> UMNR: {f.ssr.umnr}</div>}
                                              {f.ssr.vip > 0 && <div className="flex items-center gap-1 px-2 py-1 rounded bg-amber-900/30 border border-amber-500/50 text-amber-300 text-[10px] font-bold"><Crown className="w-3 h-3" /> VIP: {f.ssr.vip}</div>}
                                          </>
                                      ) : (
                                          <div className="text-[10px] text-slate-600">No Special Requests</div>
                                      )}
                                   </div>

                                   <div className="flex gap-2">
                                       {/* ADVISORY BUTTON FOR DISRUPTED FLIGHTS (ONLY EDITORS) */}
                                       {canEdit && isDisrupted && (
                                           <div className="relative">
                                               <button 
                                                 onClick={() => setAdvisoryOpenId(advisoryOpenId === f.flightNumber ? null : f.flightNumber)}
                                                 className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-[10px] font-bold transition-all shadow-lg animate-pulse"
                                               >
                                                  <Megaphone className="w-3 h-3" />
                                                  ADVISE PAX
                                               </button>

                                               {advisoryOpenId === f.flightNumber && (
                                                  <div className="absolute right-0 bottom-full mb-2 w-48 bg-slate-900 border border-amber-500 rounded-xl shadow-2xl z-50 overflow-hidden animate-in zoom-in-95 origin-bottom-right">
                                                      <div className="bg-amber-600 p-2 text-white text-[10px] font-bold uppercase flex items-center gap-1">
                                                          <Megaphone className="w-3 h-3" /> Quick Broadcast
                                                      </div>
                                                      <button onClick={() => sendAdvisory('Proceed to Transfer Desk', f.flightNumber)} className="w-full text-left px-3 py-2 text-xs hover:bg-slate-800 text-slate-200 border-b border-slate-700 flex items-center gap-2">
                                                          <UserCheck className="w-3 h-3" /> Go to Help Desk
                                                      </button>
                                                      <button onClick={() => sendAdvisory('Gate Reassignment', f.flightNumber)} className="w-full text-left px-3 py-2 text-xs hover:bg-slate-800 text-slate-200 border-b border-slate-700 flex items-center gap-2">
                                                          <ArrowRight className="w-3 h-3" /> Gate Change
                                                      </button>
                                                      <button onClick={() => sendAdvisory('Wait for Announcement', f.flightNumber)} className="w-full text-left px-3 py-2 text-xs hover:bg-slate-800 text-slate-200 flex items-center gap-2">
                                                          <Clock className="w-3 h-3" /> Wait at Area
                                                      </button>
                                                  </div>
                                               )}
                                           </div>
                                       )}

                                       {/* MANIFEST BUTTON WITH PERMISSION LOGIC */}
                                       {canViewManifest ? (
                                           <button 
                                             onClick={(e) => { e.stopPropagation(); setSelectedManifestFlight(f); }}
                                             className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                                                 canEdit 
                                                 ? 'bg-slate-700 hover:bg-indigo-600 hover:text-white text-slate-300' 
                                                 : 'bg-slate-800 border border-slate-600 hover:bg-slate-700 text-slate-400'
                                             }`}
                                           >
                                              {canEdit ? <FileText className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                                              {canEdit ? 'MANIFEST' : 'VIEW ONLY'}
                                           </button>
                                       ) : (
                                           <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/50 border border-slate-700 text-slate-600 text-[10px] font-bold cursor-not-allowed">
                                              <Lock className="w-3 h-3" /> RESTRICTED
                                           </div>
                                       )}
                                   </div>
                                </div>
                           </div>
                    </div>
                </div>
            );
        })}
      </div>

      {/* MANIFEST MODAL */}
      {selectedManifestFlight && (
         <FlightManifest 
            flight={selectedManifestFlight} 
            onClose={() => setSelectedManifestFlight(null)} 
            onSwitchFlight={handleSwitchFlight}
            readOnly={!canEdit} // Pass readOnly prop if user is a VIEWER
         />
      )}

    </div>
  );
};
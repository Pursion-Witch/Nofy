
import React, { useState, useEffect } from 'react';
import { 
  Briefcase, AlertTriangle, CheckCircle2, Megaphone, 
  Stethoscope, UserCheck, X, Search, CreditCard, 
  Plane, Ship, MoreVertical, Send, ShieldCheck, Clock
} from 'lucide-react';
import { OFWPassenger, OFWStatus } from '../types';

interface CebBalikDashboardProps {
  onClose: () => void;
  onNavigate: (dashboard: 'CONNECTS' | 'PLUS') => void;
}

const MOCK_OFWS: OFWPassenger[] = [
  { 
    id: 'ofw1', name: 'Ricardo Dalisay', passport: 'P1234567A',
    flightNumber: 'EK 338', airline: 'Emirates', flightStatus: 'ARRIVED',
    status: OFWStatus.AT_IMMIGRATION, connectingType: 'NONE'
  },
  { 
    id: 'ofw2', name: 'Maria Clara', passport: 'P7654321B',
    flightNumber: 'QR 924', airline: 'Qatar Airways', flightStatus: 'ARRIVED',
    status: OFWStatus.BAG_DROP, connectingType: 'FLIGHT', connectingDetails: 'PR 1845 (DVO)'
  },
  { 
    id: 'ofw3', name: 'Crisostomo Ibarra', passport: 'P9988776C',
    flightNumber: 'CX 921', airline: 'Cathay Pacific', flightStatus: 'DELAYED',
    status: OFWStatus.ATTENTION, connectingType: 'SEA', connectingDetails: 'OceanJet (Bohol)',
    alertDetails: 'Missing OEC Document'
  },
  { 
    id: 'ofw4', name: 'Sisa Basilio', passport: 'P5544332D',
    flightNumber: 'TR 385', airline: 'Scoot', flightStatus: 'INBOUND',
    status: OFWStatus.DEPLANED, connectingType: 'NONE'
  },
  { 
    id: 'ofw5', name: 'Padre Damaso', passport: 'P1122334E',
    flightNumber: '5J 556', airline: 'Cebu Pacific', flightStatus: 'ARRIVED',
    status: OFWStatus.CLEARED, connectingType: 'FLIGHT', connectingDetails: 'DG 6022 (DGT)'
  },
  { 
    id: 'ofw6', name: 'Elias Salome', passport: 'P6677889F',
    flightNumber: 'PR 1845', airline: 'PAL', flightStatus: 'CANCELLED',
    status: OFWStatus.ATTENTION, connectingType: 'NONE',
    alertDetails: 'Flight Cancelled - Rebook Required'
  }
];

export const CebBalikDashboard: React.FC<CebBalikDashboardProps> = ({ onClose, onNavigate }) => {
  const [passengers, setPassengers] = useState<OFWPassenger[]>(MOCK_OFWS);
  const [search, setSearch] = useState('');
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  const [activeMobileMenuId, setActiveMobileMenuId] = useState<string | null>(null);
  const [processingTime, setProcessingTime] = useState(12); // Minutes

  // Simulate Processing Time Fluctuation
  useEffect(() => {
    const timer = setInterval(() => {
      setProcessingTime(prev => Math.max(5, Math.min(45, prev + (Math.random() > 0.5 ? 2 : -2))));
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Close menus on click outside
  useEffect(() => {
    const handleClickOutside = () => {
        setActiveMobileMenuId(null);
        setActiveTooltip(null);
    };
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  const filteredData = passengers.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.passport.toLowerCase().includes(search.toLowerCase()) ||
    p.flightNumber.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusBadge = (p: OFWPassenger) => {
    switch(p.status) {
      case OFWStatus.ATTENTION:
        return (
           <div 
             className="relative group cursor-pointer"
             onClick={(e) => { e.stopPropagation(); setActiveTooltip(activeTooltip === p.id ? null : p.id); }}
             onMouseEnter={() => setActiveTooltip(p.id)}
             onMouseLeave={() => setActiveTooltip(null)}
           >
              <span className="px-2 py-1 bg-red-600 text-white text-[10px] font-bold rounded flex items-center gap-1 animate-pulse w-fit">
                 <AlertTriangle className="w-3 h-3" /> ATTENTION
              </span>
              {/* Tooltip */}
              {activeTooltip === p.id && (
                  <div className="absolute left-0 bottom-full mb-2 w-48 p-2 bg-slate-800 border border-red-500 rounded-lg shadow-2xl z-50">
                      <div className="text-[10px] text-red-400 font-bold uppercase mb-1 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> Alert Reason
                      </div>
                      <div className="text-xs text-white">
                          {p.alertDetails || 'General Assistance Required'}
                      </div>
                  </div>
              )}
           </div>
        );
      case OFWStatus.AT_IMMIGRATION:
        return <span className="px-2 py-1 bg-amber-900/40 text-amber-300 border border-amber-500/30 text-[10px] font-bold rounded flex items-center gap-1 w-fit"><ShieldCheck className="w-3 h-3" /> IMMIGRATION</span>;
      case OFWStatus.CLEARED:
         return <span className="px-2 py-1 bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold rounded flex items-center gap-1 w-fit"><CheckCircle2 className="w-3 h-3" /> CLEARED</span>;
      default:
        return <span className="px-2 py-1 bg-slate-700 text-slate-300 text-[10px] font-bold rounded w-fit">{p.status.replace(/_/g, ' ')}</span>;
    }
  };

  const handleAction = (id: string, action: string) => {
    console.log(`Executing ${action} for OFW ID: ${id}`);
    alert(`Action Triggered: ${action}`);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-md flex flex-col animate-in fade-in duration-300 overflow-hidden h-[100dvh]">
      
      {/* Hide Scrollbar Style */}
      <style>{`
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      {/* HEADER */}
      <div className="bg-slate-900 border-b border-slate-800 p-4 flex justify-between items-center shadow-lg shrink-0 z-20">
        <div className="flex items-center gap-3 md:gap-4">
          <div className="p-2 md:p-3 bg-amber-500 rounded-xl shadow-lg shadow-amber-500/20">
             <Briefcase className="w-5 h-5 md:w-6 md:h-6 text-amber-950" />
          </div>
          <div>
            <h1 className="text-lg md:text-2xl font-black text-white tracking-tight flex flex-col md:block">
              CEB-BALIK <span className="text-amber-400 md:ml-2">COMMAND</span>
            </h1>
            <p className="text-[10px] md:text-xs text-slate-400 font-medium tracking-wide uppercase">Balik-Bayani Hub</p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors">
          <X className="w-6 h-6 md:w-8 md:h-8" />
        </button>
      </div>

      {/* DASHBOARD CONTENT CONTAINER */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        
        {/* STATS BAR */}
        <div className="w-full md:w-80 bg-slate-900 border-b md:border-b-0 md:border-r border-slate-800 p-4 md:p-6 flex md:flex-col gap-4 md:gap-6 overflow-x-auto md:overflow-y-auto shrink-0 hide-scrollbar z-10 max-h-[160px] md:max-h-full">
           
           {/* IMMIGRATION WIDGET */}
           <div className="min-w-[240px] md:min-w-0 bg-gradient-to-br from-amber-900/40 to-slate-800 p-4 md:p-5 rounded-2xl border border-amber-500/20 shrink-0">
              <h3 className="text-xs md:text-sm font-bold text-slate-300 mb-2 flex items-center gap-2">
                 <ShieldCheck className="w-4 h-4 text-amber-400" />
                 Immigration Status
              </h3>
              <div className="flex justify-between items-end">
                 <div className={`text-3xl md:text-4xl font-black ${processingTime > 30 ? 'text-red-400' : processingTime > 20 ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {processingTime}m
                 </div>
                 <div className="text-[10px] md:text-xs text-slate-400 font-bold mb-1 flex items-center gap-1">
                    Avg. Processing
                 </div>
              </div>
              <div className="mt-3 text-[9px] md:text-[10px] text-slate-400 uppercase font-bold tracking-wider">Dedicated OFW Lane</div>
           </div>

           {/* TOTAL ARRIVALS */}
           <div className="flex md:flex-col gap-4 shrink-0">
              <div className="hidden md:block text-xs font-bold text-slate-500 uppercase">Daily Inbound</div>
              
              <div className="min-w-[140px] md:min-w-0 flex items-center justify-between p-3 bg-slate-800 rounded-xl border border-slate-700">
                 <div className="flex items-center gap-2 md:gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                    <span className="text-xs md:text-sm font-bold text-slate-200">Arrived</span>
                 </div>
                 <span className="text-sm md:text-lg font-bold text-white">128</span>
              </div>
              
              <div className="min-w-[140px] md:min-w-0 flex items-center justify-between p-3 bg-slate-800 rounded-xl border border-slate-700">
                 <div className="flex items-center gap-2 md:gap-3">
                    <div className="w-2 h-2 rounded-full bg-sky-500 animate-pulse"></div>
                    <span className="text-xs md:text-sm font-bold text-slate-200">Inbound</span>
                 </div>
                 <span className="text-sm md:text-lg font-bold text-white">45</span>
              </div>
           </div>
        </div>

        {/* RIGHT: PASSENGER LIST */}
        <div className="flex-1 flex flex-col bg-slate-950 min-w-0 min-h-0 overflow-hidden">
           
           {/* TOOLBAR */}
           <div className="p-4 border-b border-slate-800 flex flex-col xl:flex-row gap-4 shrink-0 bg-slate-900/50 backdrop-blur z-10">
              {/* SEARCH */}
              <div className="relative w-full">
                 <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                 <input 
                    type="text" 
                    placeholder="Search OFW Name / Passport / Flight..." 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 text-white text-sm rounded-xl pl-9 pr-4 py-2 focus:outline-none focus:border-amber-500"
                 />
              </div>
           </div>

           {/* CONTENT AREA */}
           <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-950 hide-scrollbar pb-32">
              
              {/* DESKTOP TABLE VIEW */}
              <div className="hidden md:block">
                 <table className="w-full text-left border-collapse">
                    <thead>
                       <tr className="text-[10px] font-bold text-slate-500 uppercase border-b border-slate-800">
                          <th className="pb-3 pl-4">Passenger Info</th>
                          <th className="pb-3">Arrival Flight</th>
                          <th className="pb-3">Connection</th>
                          <th className="pb-3">Status</th>
                          <th className="pb-3 text-right pr-4">Quick Actions</th>
                       </tr>
                    </thead>
                    <tbody className="text-sm">
                       {filteredData.map(p => (
                          <tr key={p.id} className="border-b border-slate-800 hover:bg-slate-900/50 transition-colors group">
                             <td className="py-4 pl-4">
                                <div className="font-bold text-white">{p.name}</div>
                                <div className="text-xs text-slate-500 font-mono flex items-center gap-2">
                                   <span className="flex items-center gap-1 text-slate-400"><CreditCard className="w-3 h-3" /> {p.passport}</span>
                                </div>
                                {p.alertDetails && (
                                   <div className="mt-1 text-[10px] text-red-400 font-bold bg-red-900/10 px-1.5 py-0.5 rounded w-fit border border-red-900/20">
                                      {p.alertDetails}
                                   </div>
                                )}
                             </td>
                             <td className="py-4">
                                <div>
                                   <div className="font-bold text-slate-300">{p.airline}</div>
                                   <div className="flex items-center gap-2">
                                       <span className="text-sm text-white font-bold">{p.flightNumber}</span>
                                       <span className={`text-[10px] font-bold ${p.flightStatus === 'DELAYED' || p.flightStatus === 'CANCELLED' ? 'text-red-500' : 'text-emerald-500'}`}>
                                          {p.flightStatus}
                                       </span>
                                   </div>
                                </div>
                             </td>
                             <td className="py-4">
                                {p.connectingType !== 'NONE' ? (
                                    <button 
                                      onClick={() => onNavigate(p.connectingType === 'FLIGHT' ? 'CONNECTS' : 'PLUS')}
                                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all hover:scale-105 ${
                                        p.connectingType === 'FLIGHT' 
                                        ? 'bg-indigo-900/20 border-indigo-500/30 text-indigo-300 hover:bg-indigo-900/40'
                                        : 'bg-sky-900/20 border-sky-500/30 text-sky-300 hover:bg-sky-900/40'
                                      }`}
                                    >
                                       {p.connectingType === 'FLIGHT' ? <Plane className="w-3 h-3" /> : <Ship className="w-3 h-3" />}
                                       {p.connectingDetails}
                                    </button>
                                ) : (
                                    <span className="text-xs text-slate-600 italic">Terminating CEB</span>
                                )}
                             </td>
                             <td className="py-4">
                                {getStatusBadge(p)}
                             </td>
                             <td className="py-4 pr-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                   <button onClick={() => handleAction(p.id, 'Paging')} title="Call Passenger" className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors shadow-lg">
                                      <Megaphone className="w-4 h-4" />
                                   </button>
                                   <button onClick={() => handleAction(p.id, 'Help Desk')} title="Send to Help Desk" className="p-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg transition-colors">
                                      <UserCheck className="w-4 h-4" />
                                   </button>
                                   <button onClick={() => handleAction(p.id, 'Medical')} title="Medical Assistance" className="p-2 bg-rose-900/50 hover:bg-rose-600 text-rose-200 hover:text-white rounded-lg transition-colors border border-rose-800">
                                      <Stethoscope className="w-4 h-4" />
                                   </button>
                                </div>
                             </td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
              </div>

              {/* MOBILE CARD VIEW */}
              <div className="md:hidden space-y-3">
                 {filteredData.map(p => (
                    <div key={p.id} className="bg-slate-800 rounded-xl p-4 border border-slate-700 shadow-sm relative">
                        
                        {/* Pax Info */}
                        <div className="mb-3 pr-10">
                           <div className="font-bold text-white text-lg">{p.name}</div>
                           <div className="text-xs text-slate-400 font-mono flex gap-2">
                              <span>ID: {p.passport}</span>
                           </div>
                           {p.alertDetails && (
                              <div className="mt-1 text-[10px] text-red-400 font-bold bg-red-900/10 px-1.5 py-0.5 rounded w-fit border border-red-900/20">
                                 {p.alertDetails}
                              </div>
                           )}
                        </div>

                        {/* Flight Info */}
                        <div className="flex justify-between items-center mb-3 bg-slate-900/50 p-2 rounded-lg">
                           <div>
                              <div className="text-xs font-bold text-slate-300">{p.airline}</div>
                              <div className="text-sm font-bold text-white">{p.flightNumber}</div>
                           </div>
                           <div className={`text-xs font-bold ${p.flightStatus === 'DELAYED' || p.flightStatus === 'CANCELLED' ? 'text-red-500' : 'text-emerald-500'}`}>
                              {p.flightStatus}
                           </div>
                        </div>

                        {/* Connection */}
                        {p.connectingType !== 'NONE' && (
                           <div className="mb-3">
                              <button 
                                onClick={() => onNavigate(p.connectingType === 'FLIGHT' ? 'CONNECTS' : 'PLUS')}
                                className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg border text-xs font-bold ${
                                  p.connectingType === 'FLIGHT' 
                                  ? 'bg-indigo-900/20 border-indigo-500/30 text-indigo-300'
                                  : 'bg-sky-900/20 border-sky-500/30 text-sky-300'
                                }`}
                              >
                                 {p.connectingType === 'FLIGHT' ? <Plane className="w-3 h-3" /> : <Ship className="w-3 h-3" />}
                                 Connects to {p.connectingDetails}
                              </button>
                           </div>
                        )}

                        {/* Footer: Status & Actions */}
                        <div className="flex items-center justify-between">
                           <div>{getStatusBadge(p)}</div>
                           <div className="relative">
                              <button 
                                onClick={(e) => { e.stopPropagation(); setActiveMobileMenuId(activeMobileMenuId === p.id ? null : p.id); }}
                                className="p-2 bg-slate-700 hover:bg-amber-600 text-slate-300 hover:text-white rounded-lg transition-colors"
                              >
                                 <MoreVertical className="w-4 h-4" />
                              </button>
                              
                              {/* MOBILE COMPACT MENU */}
                              {activeMobileMenuId === p.id && (
                                 <div className="absolute right-0 bottom-full mb-2 w-48 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden animate-in zoom-in-95 origin-bottom-right">
                                     <div className="bg-slate-900/80 p-2 text-[10px] font-bold text-slate-500 uppercase border-b border-slate-700">Quick Actions</div>
                                     <button onClick={() => handleAction(p.id, 'Help Desk')} className="w-full text-left px-3 py-3 text-xs font-bold text-slate-200 hover:bg-slate-700 border-b border-slate-700/50 flex items-center gap-3">
                                        <UserCheck className="w-4 h-4 text-sky-400" /> Help Desk
                                     </button>
                                     <button onClick={() => handleAction(p.id, 'Immigration')} className="w-full text-left px-3 py-3 text-xs font-bold text-slate-200 hover:bg-slate-700 border-b border-slate-700/50 flex items-center gap-3">
                                        <ShieldCheck className="w-4 h-4 text-amber-400" /> Send to Immigration
                                     </button>
                                     <button onClick={() => handleAction(p.id, 'Paging')} className="w-full text-left px-3 py-3 text-xs font-bold text-slate-200 hover:bg-slate-700 border-b border-slate-700/50 flex items-center gap-3">
                                        <Megaphone className="w-4 h-4 text-indigo-400" /> Page Passenger
                                     </button>
                                     <button onClick={() => handleAction(p.id, 'Medical')} className="w-full text-left px-3 py-3 text-xs font-bold text-slate-200 hover:bg-slate-700 flex items-center gap-3">
                                        <Stethoscope className="w-4 h-4 text-rose-400" /> Medical Assist
                                     </button>
                                 </div>
                              )}
                           </div>
                        </div>
                    </div>
                 ))}
              </div>
           </div>

        </div>

      </div>
    </div>
  );
};

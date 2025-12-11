
import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, ArrowRightLeft, AlertTriangle, 
  CheckCircle2, Phone, Megaphone, Stethoscope, 
  UserCheck, X, Search, CreditCard
} from 'lucide-react';
import { TransferPassenger, TransferStatus } from '../types';

interface CebuConnectsDashboardProps {
  onClose: () => void;
}

const MOCK_TRANSFERS: TransferPassenger[] = [
  { 
    id: 't1', name: 'Maria Santos', pnr: 'XYZ123', identityDoc: 'P9827362',
    originFlight: 'PR 1845 (MNL)', originStatus: 'LANDED',
    connectingFlight: '5J 556 (DXB)', connectingStatus: 'ON TIME',
    connectionType: 'DOM-INTL', status: TransferStatus.CHECK_THRU_INTL,
    timeToDepart: 45
  },
  { 
    id: 't2', name: 'John Smith', pnr: 'ABC987', identityDoc: 'USA882190',
    originFlight: 'KE 631 (ICN)', originStatus: 'LANDED',
    connectingFlight: 'DG 6022 (DGT)', connectingStatus: 'BOARDING',
    connectionType: 'INTL-DOM', status: TransferStatus.AT_BAG_DROP,
    timeToDepart: 25
  },
  { 
    id: 't3', name: 'Li Wei', pnr: 'HJK456', identityDoc: 'CHN112932',
    originFlight: 'CX 921 (HKG)', originStatus: 'DELAYED',
    connectingFlight: 'PR 2850 (DVO)', connectingStatus: 'ON TIME',
    connectionType: 'INTL-DOM', status: TransferStatus.ATTENTION,
    timeToDepart: 15, alertDetails: 'Tight Connection: Expel Bag Required'
  },
  { 
    id: 't4', name: 'Elena Cruz', pnr: 'LMN789', identityDoc: 'P1122334',
    originFlight: 'Z2 350 (DVO)', originStatus: 'LANDED',
    connectingFlight: 'TR 385 (SIN)', connectingStatus: 'ON TIME',
    connectionType: 'DOM-INTL', status: TransferStatus.WAITING,
    timeToDepart: 55
  },
  { 
    id: 't5', name: 'Robert Johnson', pnr: 'QWE321', identityDoc: 'USA998822',
    originFlight: 'UA 191 (GUM)', originStatus: 'LANDED',
    connectingFlight: 'PR 1860 (MNL)', connectingStatus: 'DELAYED',
    connectionType: 'INTL-DOM', status: TransferStatus.MISSING,
    timeToDepart: 20
  },
  {
    id: 't6', name: 'Kenji Sato', pnr: 'JPN555', identityDoc: 'JP1234567',
    originFlight: 'JL 77 (NRT)', originStatus: 'LANDED',
    connectingFlight: 'KE 632 (ICN)', connectingStatus: 'ON TIME',
    connectionType: 'INTL-INTL', status: TransferStatus.CHECK_THRU_INTL,
    timeToDepart: 120
  },
  {
    id: 't7', name: 'Ana Reyes', pnr: 'DOM111', identityDoc: 'P5566778',
    originFlight: '5J 551 (MNL)', originStatus: 'ON TIME',
    connectingFlight: 'DG 650 (DGT)', connectingStatus: 'ON TIME',
    connectionType: 'DOM-DOM', status: TransferStatus.WAITING,
    timeToDepart: 60
  }
];

type FilterType = 'ALL' | 'CRITICAL' | 'DOM-INTL' | 'INTL-DOM' | 'DOM-DOM' | 'INTL-INTL';

export const CebuConnectsDashboard: React.FC<CebuConnectsDashboardProps> = ({ onClose }) => {
  const [transfers, setTransfers] = useState<TransferPassenger[]>(MOCK_TRANSFERS);
  const [filter, setFilter] = useState<FilterType>('ALL');
  const [search, setSearch] = useState('');
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  // Simulated countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setTransfers(prev => prev.map(t => ({
        ...t,
        timeToDepart: t.timeToDepart > 0 ? t.timeToDepart - 1 : 0
      })));
    }, 60000); // Update every minute
    return () => clearInterval(timer);
  }, []);

  const filteredData = transfers.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase()) || 
                          t.pnr.toLowerCase().includes(search.toLowerCase()) ||
                          t.identityDoc.toLowerCase().includes(search.toLowerCase());
    
    if (filter === 'ALL') return matchesSearch;
    if (filter === 'CRITICAL') return matchesSearch && (t.timeToDepart < 30 || t.status === TransferStatus.ATTENTION || t.status === TransferStatus.MISSING);
    return matchesSearch && t.connectionType === filter;
  });

  const getStatusBadge = (t: TransferPassenger) => {
    const status = t.status;
    switch(status) {
      case TransferStatus.ATTENTION:
        return (
           <div 
             className="relative group cursor-pointer"
             onClick={() => setActiveTooltip(activeTooltip === t.id ? null : t.id)}
             onMouseEnter={() => setActiveTooltip(t.id)}
             onMouseLeave={() => setActiveTooltip(null)}
           >
              <span className="px-2 py-1 bg-red-600 text-white text-[10px] font-bold rounded flex items-center gap-1 animate-pulse w-fit">
                 <AlertTriangle className="w-3 h-3" /> ATTENTION
              </span>
              {/* Tooltip */}
              {activeTooltip === t.id && (
                  <div className="absolute left-0 bottom-full mb-2 w-48 p-2 bg-slate-800 border border-red-500 rounded-lg shadow-2xl z-50">
                      <div className="text-[10px] text-red-400 font-bold uppercase mb-1 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> Alert Reason
                      </div>
                      <div className="text-xs text-white">
                          {t.alertDetails || 'General Assistance Required'}
                      </div>
                  </div>
              )}
           </div>
        );
      case TransferStatus.MISSING:
        return <span className="px-2 py-1 bg-amber-600 text-white text-[10px] font-bold rounded flex items-center gap-1 w-fit"><AlertTriangle className="w-3 h-3" /> MISSING</span>;
      case TransferStatus.CHECK_THRU_INTL:
      case TransferStatus.CHECK_THRU_DOM:
        return <span className="px-2 py-1 bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold rounded flex items-center gap-1 w-fit"><CheckCircle2 className="w-3 h-3" /> CHECK-THRU</span>;
      default:
        return <span className="px-2 py-1 bg-slate-700 text-slate-300 text-[10px] font-bold rounded w-fit">{status.replace(/_/g, ' ')}</span>;
    }
  };

  const getTimeColor = (mins: number) => {
    if (mins < 30) return 'text-red-500';
    if (mins < 45) return 'text-amber-500';
    return 'text-emerald-500';
  };

  const handleAction = (id: string, action: string) => {
    console.log(`Executing ${action} for passenger ID: ${id}`);
    // Logic to update status would go here
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-md flex flex-col animate-in fade-in duration-300 overflow-hidden">
      
      {/* HEADER */}
      <div className="bg-slate-900 border-b border-slate-800 p-4 flex justify-between items-center shadow-lg shrink-0">
        <div className="flex items-center gap-3 md:gap-4">
          <div className="p-2 md:p-3 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-500/20">
            <ArrowRightLeft className="w-5 h-5 md:w-6 md:h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg md:text-2xl font-black text-white tracking-tight flex flex-col md:block">
              CEBU CONNECTS <span className="text-indigo-400 md:ml-2">COMMAND</span>
            </h1>
            <p className="text-[10px] md:text-xs text-slate-400 font-medium tracking-wide uppercase">Inter-Terminal Transfer Hub</p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors">
          <X className="w-6 h-6 md:w-8 md:h-8" />
        </button>
      </div>

      {/* DASHBOARD CONTENT CONTAINER */}
      <div className="flex-grow flex flex-col md:flex-row overflow-hidden">
        
        {/* STATS BAR (Sidebar on Desktop, Horizontal Scroll on Mobile) */}
        <div className="w-full md:w-80 bg-slate-900 border-b md:border-b-0 md:border-r border-slate-800 p-4 md:p-6 flex md:flex-col gap-4 md:gap-6 overflow-x-auto md:overflow-y-auto shrink-0 hide-scrollbar">
           
           <div className="min-w-[240px] md:min-w-0 bg-gradient-to-br from-indigo-900/40 to-slate-800 p-4 md:p-5 rounded-2xl border border-indigo-500/20 shrink-0">
              <h3 className="text-xs md:text-sm font-bold text-slate-300 mb-2">Transfer Efficiency</h3>
              <div className="flex justify-between items-end">
                 <div className="text-3xl md:text-4xl font-black text-white">94%</div>
                 <div className="text-[10px] md:text-xs text-emerald-400 font-bold mb-1 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> On Target
                 </div>
              </div>
              <div className="mt-3 text-[9px] md:text-[10px] text-slate-400 uppercase font-bold tracking-wider">Avg Transfer Time: 28 mins</div>
           </div>

           <div className="flex md:flex-col gap-4 shrink-0">
              <div className="hidden md:block text-xs font-bold text-slate-500 uppercase">Active Connections</div>
              
              <div className="min-w-[140px] md:min-w-0 flex items-center justify-between p-3 bg-slate-800 rounded-xl border border-slate-700">
                 <div className="flex items-center gap-2 md:gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                    <span className="text-xs md:text-sm font-bold text-slate-200">INTL-DOM</span>
                 </div>
                 <span className="text-sm md:text-lg font-bold text-white">42</span>
              </div>
              
              <div className="min-w-[140px] md:min-w-0 flex items-center justify-between p-3 bg-slate-800 rounded-xl border border-slate-700">
                 <div className="flex items-center gap-2 md:gap-3">
                    <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                    <span className="text-xs md:text-sm font-bold text-slate-200">DOM-INTL</span>
                 </div>
                 <span className="text-sm md:text-lg font-bold text-white">38</span>
              </div>

              <div className="min-w-[140px] md:min-w-0 flex items-center justify-between p-3 bg-slate-800 rounded-xl border border-slate-700">
                 <div className="flex items-center gap-2 md:gap-3">
                    <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
                    <span className="text-xs md:text-sm font-bold text-amber-200">Critical</span>
                 </div>
                 <span className="text-sm md:text-lg font-bold text-amber-400">5</span>
              </div>
           </div>
        </div>

        {/* RIGHT: PASSENGER LIST */}
        <div className="flex-1 flex flex-col bg-slate-950 min-w-0">
           
           {/* TOOLBAR */}
           <div className="p-4 border-b border-slate-800 flex flex-col xl:flex-row gap-4">
              {/* FILTERS (Scrollable on small screens) */}
              <div className="flex items-center gap-2 bg-slate-900 p-1 rounded-lg border border-slate-700 overflow-x-auto hide-scrollbar w-full xl:w-auto">
                 {['ALL', 'CRITICAL', 'INTL-DOM', 'DOM-INTL', 'INTL-INTL', 'DOM-DOM'].map((f) => (
                    <button 
                       key={f}
                       onClick={() => setFilter(f as FilterType)} 
                       className={`px-3 md:px-4 py-2 text-[10px] md:text-xs font-bold rounded-md transition-all whitespace-nowrap ${
                          filter === f 
                          ? f === 'CRITICAL' ? 'bg-red-600 text-white' : 'bg-indigo-600 text-white' 
                          : 'text-slate-400 hover:text-white hover:bg-slate-800'
                       }`}
                    >
                       {f}
                    </button>
                 ))}
              </div>

              {/* SEARCH */}
              <div className="relative w-full xl:w-64 xl:ml-auto">
                 <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                 <input 
                    type="text" 
                    placeholder="Search Pax / ID / Flight..." 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 text-white text-sm rounded-xl pl-9 pr-4 py-2 focus:outline-none focus:border-indigo-500"
                 />
              </div>
           </div>

           {/* CONTENT AREA */}
           <div className="flex-grow overflow-y-auto p-4 md:p-6 bg-slate-950 custom-scrollbar">
              
              {/* DESKTOP TABLE VIEW (Hidden on Mobile) */}
              <div className="hidden md:block">
                 <table className="w-full text-left border-collapse">
                    <thead>
                       <tr className="text-[10px] font-bold text-slate-500 uppercase border-b border-slate-800">
                          <th className="pb-3 pl-4">Passenger Info</th>
                          <th className="pb-3">Connection Route</th>
                          <th className="pb-3 text-center">Time Remaining</th>
                          <th className="pb-3">Status</th>
                          <th className="pb-3 text-right pr-4">Quick Actions</th>
                       </tr>
                    </thead>
                    <tbody className="text-sm">
                       {filteredData.map(t => (
                          <tr key={t.id} className="border-b border-slate-800 hover:bg-slate-900/50 transition-colors group">
                             <td className="py-4 pl-4">
                                <div className="font-bold text-white">{t.name}</div>
                                <div className="text-xs text-slate-500 font-mono flex items-center gap-2">
                                   <span>PNR: {t.pnr}</span>
                                   <span className="text-slate-600">•</span>
                                   <span className="flex items-center gap-1 text-slate-400"><CreditCard className="w-3 h-3" /> {t.identityDoc}</span>
                                </div>
                                {t.alertDetails && (
                                   <div className="mt-1 text-[10px] text-red-400 font-bold bg-red-900/10 px-1.5 py-0.5 rounded w-fit border border-red-900/20">
                                      {t.alertDetails}
                                   </div>
                                )}
                             </td>
                             <td className="py-4">
                                <div className="flex items-center gap-2">
                                   <div>
                                      <div className="font-bold text-slate-300">{t.originFlight}</div>
                                      <div className={`text-[10px] font-bold ${t.originStatus === 'DELAYED' ? 'text-amber-500' : 'text-emerald-500'}`}>{t.originStatus}</div>
                                   </div>
                                   <ArrowRight className="w-4 h-4 text-slate-600" />
                                   <div>
                                      <div className="font-bold text-white">{t.connectingFlight}</div>
                                      <div className="text-[10px] font-bold text-slate-400">{t.connectingStatus}</div>
                                   </div>
                                </div>
                                <div className="mt-1 text-[10px] text-indigo-400 font-mono uppercase bg-indigo-900/10 px-1 rounded w-fit">{t.connectionType}</div>
                             </td>
                             <td className="py-4 text-center">
                                <div className={`text-2xl font-black ${getTimeColor(t.timeToDepart)}`}>
                                   {t.timeToDepart}m
                                </div>
                                <div className="text-[9px] text-slate-500 uppercase font-bold">To Departure</div>
                             </td>
                             <td className="py-4">
                                {getStatusBadge(t)}
                             </td>
                             <td className="py-4 pr-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                   <button onClick={() => handleAction(t.id, 'Paging')} title="Call Passenger" className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors shadow-lg">
                                      <Megaphone className="w-4 h-4" />
                                   </button>
                                   <button onClick={() => handleAction(t.id, 'Help Desk')} title="Send to Help Desk" className="p-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg transition-colors">
                                      <UserCheck className="w-4 h-4" />
                                   </button>
                                   <button onClick={() => handleAction(t.id, 'Medical')} title="Medical Assistance" className="p-2 bg-rose-900/50 hover:bg-rose-600 text-rose-200 hover:text-white rounded-lg transition-colors border border-rose-800">
                                      <Stethoscope className="w-4 h-4" />
                                   </button>
                                </div>
                             </td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
              </div>

              {/* MOBILE CARD VIEW (Visible on Mobile) */}
              <div className="md:hidden space-y-3">
                 {filteredData.map(t => (
                    <div key={t.id} className="bg-slate-800 rounded-xl p-4 border border-slate-700 shadow-sm relative overflow-hidden">
                        {/* Time Left Badge */}
                        <div className={`absolute top-0 right-0 px-3 py-1 rounded-bl-xl font-bold text-xs ${t.timeToDepart < 30 ? 'bg-red-600 text-white' : 'bg-slate-700 text-slate-300'}`}>
                           {t.timeToDepart}m left
                        </div>

                        {/* Pax Info */}
                        <div className="mb-3 pr-20">
                           <div className="font-bold text-white text-lg">{t.name}</div>
                           <div className="text-xs text-slate-400 font-mono flex gap-2">
                              <span>PNR: {t.pnr}</span>
                              <span className="text-slate-600">|</span>
                              <span>ID: {t.identityDoc}</span>
                           </div>
                           {t.alertDetails && (
                              <div className="mt-1 text-[10px] text-red-400 font-bold bg-red-900/10 px-1.5 py-0.5 rounded w-fit border border-red-900/20">
                                 {t.alertDetails}
                              </div>
                           )}
                        </div>

                        {/* Route Grid */}
                        <div className="grid grid-cols-[1fr,auto,1fr] items-center gap-2 mb-4 bg-slate-900/50 p-2 rounded-lg">
                           <div>
                              <div className="text-xs font-bold text-slate-300">{t.originFlight}</div>
                              <div className="text-[10px] font-bold text-emerald-500">{t.originStatus}</div>
                           </div>
                           <ArrowRight className="w-4 h-4 text-slate-600" />
                           <div className="text-right">
                              <div className="text-xs font-bold text-white">{t.connectingFlight}</div>
                              <div className="text-[10px] font-bold text-slate-400">{t.connectingStatus}</div>
                           </div>
                        </div>

                        {/* Footer: Status & Actions */}
                        <div className="flex items-center justify-between">
                           <div>{getStatusBadge(t)}</div>
                           <div className="flex gap-2">
                              <button onClick={() => handleAction(t.id, 'Paging')} className="p-2 bg-indigo-600 text-white rounded-lg">
                                 <Megaphone className="w-4 h-4" />
                              </button>
                              <button onClick={() => handleAction(t.id, 'Medical')} className="p-2 bg-rose-900/50 text-rose-200 border border-rose-800 rounded-lg">
                                 <Stethoscope className="w-4 h-4" />
                              </button>
                           </div>
                        </div>
                    </div>
                 ))}
              </div>

              {filteredData.length === 0 && (
                 <div className="p-10 text-center text-slate-500 italic">No passengers found matching filter.</div>
              )}
           </div>

        </div>

      </div>
    </div>
  );
};

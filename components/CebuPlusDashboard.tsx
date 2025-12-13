
import React, { useState, useEffect } from 'react';
import { 
  Ship, Plane, Bus, AlertTriangle, 
  CheckCircle2, Megaphone, Stethoscope, 
  UserCheck, X, Search, CreditCard, ArrowRight, Anchor, Send, Download, Phone, CarFront, Gauge, MoreVertical
} from 'lucide-react';
import { CebuPlusPassenger, CebuPlusStatus } from '../types';

interface CebuPlusDashboardProps {
  onClose: () => void;
}

const MOCK_CEBU_PLUS: CebuPlusPassenger[] = [
  { 
    id: 'cp1', name: 'Antonio Garcia', pnr: 'SEA101', identityDoc: 'P9912233',
    direction: 'AIRPORT_TO_SEAPORT',
    originTransport: 'PR 1845 (MNL)', originStatus: 'LANDED',
    connectingTransport: 'OceanJet 88 (Bohol)', connectingStatus: 'ON TIME',
    operator: 'OceanJet', operatorContact: '0917-OCEAN-01',
    assignedVehicle: 'Van-04', vehicleContact: '0998-DRV-004',
    status: CebuPlusStatus.IN_TRANSIT_SEAPORT,
    timeToDepart: 65
  },
  { 
    id: 'cp2', name: 'Sarah Miller', pnr: 'SEA202', identityDoc: 'USA112233',
    direction: 'SEAPORT_TO_AIRPORT',
    originTransport: 'SuperCat (Ormoc)', originStatus: 'DOCKED',
    connectingTransport: '5J 556 (DXB)', connectingStatus: 'CHECK-IN OPEN',
    operator: 'SuperCat', operatorContact: '0918-SCAT-02',
    assignedVehicle: 'Shuttle-B', vehicleContact: '0998-SHT-002',
    status: CebuPlusStatus.IN_TRANSIT_AIRPORT,
    timeToDepart: 120
  },
  { 
    id: 'cp3', name: 'Wei Zhang', pnr: 'SEA303', identityDoc: 'CHN887766',
    direction: 'AIRPORT_TO_SEAPORT',
    originTransport: 'CX 921 (HKG)', originStatus: 'DELAYED',
    connectingTransport: 'LiteFerry (Siquijor)', connectingStatus: 'ON TIME',
    operator: 'Lite Shipping', operatorContact: '0917-LITE-03',
    assignedVehicle: 'Pending', vehicleContact: '',
    status: CebuPlusStatus.ATTENTION,
    timeToDepart: 20, alertDetails: 'Missed Connection Risk'
  },
  { 
    id: 'cp4', name: 'Elena Torres', pnr: 'SEA404', identityDoc: 'P5544332',
    direction: 'SEAPORT_TO_AIRPORT',
    originTransport: 'OceanJet 12 (Bohol)', originStatus: 'DELAYED',
    connectingTransport: 'PR 2850 (DVO)', connectingStatus: 'ON TIME',
    operator: 'OceanJet', operatorContact: '0917-OCEAN-01',
    assignedVehicle: 'Van-02', vehicleContact: '0998-DRV-002',
    status: CebuPlusStatus.DELAYED,
    timeToDepart: 45
  },
  { 
    id: 'cp5', name: 'James Wilson', pnr: 'SEA505', identityDoc: 'GBR998877',
    direction: 'AIRPORT_TO_SEAPORT',
    originTransport: 'TR 385 (SIN)', originStatus: 'LANDED',
    connectingTransport: 'SuperCat (Camotes)', connectingStatus: 'BOARDING',
    operator: 'SuperCat', operatorContact: '0918-SCAT-02',
    assignedVehicle: 'Van-01', vehicleContact: '0998-DRV-001',
    status: CebuPlusStatus.CHECKED_THRU,
    timeToDepart: 35
  },
  { 
    id: 'cp6', name: 'Kenji Tanaka', pnr: 'SEA606', identityDoc: 'JPN112211',
    direction: 'SEAPORT_TO_AIRPORT',
    originTransport: 'FastCat (Dumaguete)', originStatus: 'IN TRANSIT',
    connectingTransport: 'JL 77 (NRT)', connectingStatus: 'ON TIME',
    operator: 'FastCat', operatorContact: '0919-FAST-05',
    assignedVehicle: 'Pending', vehicleContact: '',
    status: CebuPlusStatus.IN_TRANSIT_AIRPORT,
    timeToDepart: 180
  }
];

type FilterType = 'ALL' | 'AIRPORT_TO_SEAPORT' | 'SEAPORT_TO_AIRPORT' | 'CRITICAL';

export const CebuPlusDashboard: React.FC<CebuPlusDashboardProps> = ({ onClose }) => {
  const [passengers, setPassengers] = useState<CebuPlusPassenger[]>(MOCK_CEBU_PLUS);
  const [filter, setFilter] = useState<FilterType>('ALL');
  const [search, setSearch] = useState('');
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  const [activeMobileMenuId, setActiveMobileMenuId] = useState<string | null>(null);

  // Simulated countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setPassengers(prev => prev.map(p => ({
        ...p,
        timeToDepart: p.timeToDepart > 0 ? p.timeToDepart - 1 : 0
      })));
    }, 60000); // Update every minute
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

  const filteredData = passengers.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                          p.pnr.toLowerCase().includes(search.toLowerCase()) ||
                          p.identityDoc.toLowerCase().includes(search.toLowerCase()) ||
                          p.operator.toLowerCase().includes(search.toLowerCase());
    
    if (filter === 'ALL') return matchesSearch;
    if (filter === 'CRITICAL') return matchesSearch && (p.timeToDepart < 45 || p.status === CebuPlusStatus.ATTENTION || p.status === CebuPlusStatus.MISSING);
    return matchesSearch && p.direction === filter;
  });

  const getStatusBadge = (p: CebuPlusPassenger) => {
    switch(p.status) {
      case CebuPlusStatus.ATTENTION:
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
                          {p.alertDetails || 'Transport Interruption / Doc Check'}
                      </div>
                  </div>
              )}
           </div>
        );
      case CebuPlusStatus.MISSING:
        return <span className="px-2 py-1 bg-amber-600 text-white text-[10px] font-bold rounded flex items-center gap-1 w-fit"><AlertTriangle className="w-3 h-3" /> MISSING</span>;
      case CebuPlusStatus.IN_TRANSIT_SEAPORT:
      case CebuPlusStatus.IN_TRANSIT_AIRPORT:
        return <span className="px-2 py-1 bg-indigo-900/40 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold rounded flex items-center gap-1 w-fit"><Bus className="w-3 h-3" /> IN TRANSIT</span>;
      case CebuPlusStatus.CHECKED_THRU:
         return <span className="px-2 py-1 bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold rounded flex items-center gap-1 w-fit"><CheckCircle2 className="w-3 h-3" /> CHECKED THRU</span>;
      default:
        return <span className="px-2 py-1 bg-slate-700 text-slate-300 text-[10px] font-bold rounded w-fit">{p.status.replace(/_/g, ' ')}</span>;
    }
  };

  const getTimeColor = (mins: number) => {
    if (mins < 45) return 'text-red-500'; // Need more buffer for Sea-Air
    if (mins < 90) return 'text-amber-500';
    return 'text-emerald-500';
  };

  const handleAction = (id: string, action: string) => {
    console.log(`Executing ${action} for passenger ID: ${id}`);
    alert(`Action Triggered: ${action}`);
  };

  const handleContact = (type: string, contact: string, name: string) => {
      alert(`Connecting to ${type} (${name}) at ${contact}...`);
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
          <div className="p-2 md:p-3 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-500/20">
             <Ship className="w-5 h-5 md:w-6 md:h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg md:text-2xl font-black text-white tracking-tight flex flex-col md:block">
              CEBU+ <span className="text-indigo-400 md:ml-2">COMMAND</span>
            </h1>
            <p className="text-[10px] md:text-xs text-slate-400 font-medium tracking-wide uppercase">Sea-Air Intermodal Hub</p>
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
           
           <div className="min-w-[240px] md:min-w-0 bg-gradient-to-br from-sky-900/40 to-slate-800 p-4 md:p-5 rounded-2xl border border-sky-500/20 shrink-0">
              <h3 className="text-xs md:text-sm font-bold text-slate-300 mb-2">Intermodal Status</h3>
              <div className="flex justify-between items-end">
                 <div className="text-3xl md:text-4xl font-black text-white">98%</div>
                 <div className="text-[10px] md:text-xs text-emerald-400 font-bold mb-1 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Operational
                 </div>
              </div>
              <div className="mt-3 text-[9px] md:text-[10px] text-slate-400 uppercase font-bold tracking-wider">Avg Transit: 22 mins</div>
           </div>

           {/* TRAFFIC STATUS WIDGET */}
           <div className="min-w-[200px] md:min-w-0 bg-slate-800 p-4 rounded-xl border border-slate-700 shrink-0 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase">
                      <CarFront className="w-4 h-4 text-indigo-400" />
                      Traffic (10km)
                  </div>
                  <div className="px-2 py-0.5 rounded bg-amber-900/30 text-amber-400 text-[10px] font-bold border border-amber-500/30">
                      MODERATE
                  </div>
              </div>
              <div className="mt-2 flex items-center justify-between">
                  <div>
                      <div className="text-2xl font-black text-white">28m</div>
                      <div className="text-[9px] text-slate-500">Airport ↔ Seaport</div>
                  </div>
                  <Gauge className="w-8 h-8 text-slate-600" />
              </div>
           </div>

           <div className="flex md:flex-col gap-4 shrink-0">
              <div className="hidden md:block text-xs font-bold text-slate-500 uppercase">Vehicle Availability</div>
              
              <div className="min-w-[140px] md:min-w-0 flex items-center justify-between p-3 bg-slate-800 rounded-xl border border-slate-700">
                 <div className="flex items-center gap-2 md:gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                    <span className="text-xs md:text-sm font-bold text-slate-200">Available</span>
                 </div>
                 <span className="text-sm md:text-lg font-bold text-white">8</span>
              </div>

               <div className="min-w-[140px] md:min-w-0 flex items-center justify-between p-3 bg-slate-800 rounded-xl border border-slate-700">
                 <div className="flex items-center gap-2 md:gap-3">
                    <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
                    <span className="text-xs md:text-sm font-bold text-slate-200">In Transit</span>
                 </div>
                 <span className="text-sm md:text-lg font-bold text-white">4</span>
              </div>
           </div>
        </div>

        {/* RIGHT: PASSENGER LIST */}
        <div className="flex-1 flex flex-col bg-slate-950 min-w-0 min-h-0 overflow-hidden">
           
           {/* TOOLBAR */}
           <div className="p-4 border-b border-slate-800 flex flex-col xl:flex-row gap-4 shrink-0 bg-slate-900/50 backdrop-blur z-10">
              {/* FILTERS */}
              <div className="flex items-center gap-2 bg-slate-900 p-1 rounded-lg border border-slate-700 overflow-x-auto hide-scrollbar w-full xl:w-auto">
                 {['ALL', 'AIRPORT_TO_SEAPORT', 'SEAPORT_TO_AIRPORT', 'CRITICAL'].map((f) => (
                    <button 
                       key={f}
                       onClick={() => setFilter(f as FilterType)} 
                       className={`px-3 md:px-4 py-2 text-[10px] md:text-xs font-bold rounded-md transition-all whitespace-nowrap flex items-center gap-2 ${
                          filter === f 
                          ? f === 'CRITICAL' ? 'bg-red-600 text-white' : 'bg-indigo-600 text-white' 
                          : 'text-slate-400 hover:text-white hover:bg-slate-800'
                       }`}
                    >
                       {f === 'AIRPORT_TO_SEAPORT' && <><Plane className="w-3 h-3" /> <ArrowRight className="w-3 h-3" /> <Ship className="w-3 h-3" /></>}
                       {f === 'SEAPORT_TO_AIRPORT' && <><Ship className="w-3 h-3" /> <ArrowRight className="w-3 h-3" /> <Plane className="w-3 h-3" /></>}
                       {f === 'ALL' && 'ALL'}
                       {f === 'CRITICAL' && 'CRITICAL'}
                    </button>
                 ))}
              </div>

              {/* SEARCH */}
              <div className="relative w-full xl:w-64 xl:ml-auto">
                 <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                 <input 
                    type="text" 
                    placeholder="Search Pax / ID / Transport..." 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 text-white text-sm rounded-xl pl-9 pr-4 py-2 focus:outline-none focus:border-indigo-500"
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
                          <th className="pb-3">Route & Operator</th>
                          <th className="pb-3">Vehicle & Driver</th>
                          <th className="pb-3 text-center">Time Remaining</th>
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
                                   <span>PNR: {p.pnr}</span>
                                   <span className="text-slate-600">•</span>
                                   <span className="flex items-center gap-1 text-slate-400"><CreditCard className="w-3 h-3" /> {p.identityDoc}</span>
                                </div>
                                {p.alertDetails && (
                                   <div className="mt-1 text-[10px] text-red-400 font-bold bg-red-900/10 px-1.5 py-0.5 rounded w-fit border border-red-900/20">
                                      {p.alertDetails}
                                   </div>
                                )}
                             </td>
                             <td className="py-4">
                                <div className="flex items-center gap-2">
                                   <div>
                                      <div className="font-bold text-slate-300 flex items-center gap-1">
                                        {p.direction === 'AIRPORT_TO_SEAPORT' ? <Plane className="w-3 h-3 text-slate-500" /> : <Ship className="w-3 h-3 text-slate-500" />}
                                        {p.originTransport}
                                      </div>
                                      <div className={`text-[10px] font-bold ${p.originStatus === 'DELAYED' ? 'text-amber-500' : 'text-emerald-500'}`}>{p.originStatus}</div>
                                   </div>
                                   <ArrowRight className="w-4 h-4 text-slate-600" />
                                   <div>
                                      <div className="font-bold text-white flex items-center gap-1">
                                        {p.direction === 'AIRPORT_TO_SEAPORT' ? <Ship className="w-3 h-3 text-indigo-400" /> : <Plane className="w-3 h-3 text-indigo-400" />}
                                        {p.connectingTransport}
                                      </div>
                                      {/* OPERATOR DETAILS */}
                                      <div className="flex items-center gap-1 mt-1">
                                         <Anchor className="w-3 h-3 text-slate-500" />
                                         <span className="text-xs font-bold text-slate-300">{p.operator}</span>
                                      </div>
                                   </div>
                                </div>
                             </td>
                             <td className="py-4">
                                <div className="flex flex-col gap-1">
                                   <div className="flex items-center gap-2 bg-slate-800 px-2 py-1 rounded w-fit border border-slate-700">
                                       <Bus className="w-4 h-4 text-slate-400" />
                                       <span className="text-xs font-mono font-bold text-slate-200">{p.assignedVehicle}</span>
                                   </div>
                                   {p.vehicleContact && (
                                       <button 
                                         onClick={() => handleContact('Driver', p.vehicleContact, p.assignedVehicle)}
                                         className="flex items-center gap-1 text-[10px] text-indigo-400 hover:text-indigo-300 font-bold"
                                       >
                                          <Phone className="w-3 h-3" /> Contact Driver
                                       </button>
                                   )}
                                </div>
                             </td>
                             <td className="py-4 text-center">
                                <div className={`text-2xl font-black ${getTimeColor(p.timeToDepart)}`}>
                                   {p.timeToDepart}m
                                </div>
                                <div className="text-[9px] text-slate-500 uppercase font-bold">To Connection</div>
                             </td>
                             <td className="py-4">
                                {getStatusBadge(p)}
                             </td>
                             <td className="py-4 pr-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                   <button onClick={() => handleContact('Operator', p.operatorContact, p.operator)} title={`Call ${p.operator}`} className="p-2 bg-sky-700 hover:bg-sky-600 text-white rounded-lg transition-colors">
                                      <Phone className="w-4 h-4" />
                                   </button>
                                   <button onClick={() => handleAction(p.id, 'Req Info')} title={p.direction === 'AIRPORT_TO_SEAPORT' ? "Send Info to Seaport" : "Request Info from Seaport"} className="p-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg transition-colors">
                                      {p.direction === 'AIRPORT_TO_SEAPORT' ? <Send className="w-4 h-4" /> : <Download className="w-4 h-4" />}
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
                        {/* Time Left Badge */}
                        <div className={`absolute top-0 right-0 px-3 py-1 rounded-bl-xl font-bold text-xs ${p.timeToDepart < 45 ? 'bg-red-600 text-white' : 'bg-slate-700 text-slate-300'}`}>
                           {p.timeToDepart}m left
                        </div>

                        {/* Pax Info */}
                        <div className="mb-3 pr-20">
                           <div className="font-bold text-white text-lg">{p.name}</div>
                           <div className="text-xs text-slate-400 font-mono flex gap-2">
                              <span>PNR: {p.pnr}</span>
                              <span className="text-slate-600">|</span>
                              <span>ID: {p.identityDoc}</span>
                           </div>
                           {p.alertDetails && (
                              <div className="mt-1 text-[10px] text-red-400 font-bold bg-red-900/10 px-1.5 py-0.5 rounded w-fit border border-red-900/20">
                                 {p.alertDetails}
                              </div>
                           )}
                        </div>

                        {/* Route Grid */}
                        <div className="grid grid-cols-[1fr,auto,1fr] items-center gap-2 mb-3 bg-slate-900/50 p-2 rounded-lg">
                           <div>
                              <div className="text-xs font-bold text-slate-300 flex items-center gap-1">
                                {p.direction === 'AIRPORT_TO_SEAPORT' ? <Plane className="w-3 h-3" /> : <Ship className="w-3 h-3" />}
                                {p.originTransport}
                              </div>
                              <div className="text-[10px] font-bold text-emerald-500">{p.originStatus}</div>
                           </div>
                           <ArrowRight className="w-4 h-4 text-slate-600" />
                           <div className="text-right">
                              <div className="text-xs font-bold text-white flex items-center justify-end gap-1">
                                {p.connectingTransport}
                                {p.direction === 'AIRPORT_TO_SEAPORT' ? <Ship className="w-3 h-3" /> : <Plane className="w-3 h-3" />}
                              </div>
                              {/* Mobile Operator Info */}
                              <div className="flex items-center justify-end gap-1 mt-0.5">
                                 <Anchor className="w-3 h-3 text-slate-500" />
                                 <span className="text-[10px] font-bold text-slate-400">{p.operator}</span>
                              </div>
                           </div>
                        </div>

                        {/* Vehicle */}
                        <div className="flex items-center justify-between mb-3 bg-slate-900/30 p-2 rounded-lg">
                            <div className="flex items-center gap-2">
                                <Bus className="w-4 h-4 text-slate-400" />
                                <span className="text-xs font-mono text-slate-300"><span className="text-white font-bold">{p.assignedVehicle}</span></span>
                            </div>
                            {p.vehicleContact && (
                                <button onClick={() => handleContact('Driver', p.vehicleContact, p.assignedVehicle)} className="p-1.5 bg-slate-700 rounded text-slate-300 hover:text-white hover:bg-slate-600">
                                   <Phone className="w-3 h-3" />
                                </button>
                            )}
                        </div>

                        {/* Footer: Status & Actions */}
                        <div className="flex items-center justify-between">
                           <div>{getStatusBadge(p)}</div>
                           <div className="relative">
                              <button 
                                onClick={(e) => { e.stopPropagation(); setActiveMobileMenuId(activeMobileMenuId === p.id ? null : p.id); }}
                                className="p-2 bg-slate-700 hover:bg-indigo-600 text-slate-300 hover:text-white rounded-lg transition-colors"
                              >
                                 <MoreVertical className="w-4 h-4" />
                              </button>
                              
                              {/* MOBILE COMPACT MENU */}
                              {activeMobileMenuId === p.id && (
                                 <div className="absolute right-0 bottom-full mb-2 w-48 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden animate-in zoom-in-95 origin-bottom-right">
                                     <div className="bg-slate-900/80 p-2 text-[10px] font-bold text-slate-500 uppercase border-b border-slate-700">Quick Actions</div>
                                     <button onClick={() => handleContact('Operator', p.operatorContact, p.operator)} className="w-full text-left px-3 py-3 text-xs font-bold text-slate-200 hover:bg-slate-700 border-b border-slate-700/50 flex items-center gap-3">
                                        <Phone className="w-4 h-4 text-sky-400" /> Call Operator
                                     </button>
                                     <button onClick={() => handleAction(p.id, 'Req Info')} className="w-full text-left px-3 py-3 text-xs font-bold text-slate-200 hover:bg-slate-700 border-b border-slate-700/50 flex items-center gap-3">
                                        {p.direction === 'AIRPORT_TO_SEAPORT' ? <Send className="w-4 h-4 text-indigo-400" /> : <Download className="w-4 h-4 text-indigo-400" />}
                                        {p.direction === 'AIRPORT_TO_SEAPORT' ? 'Send Info' : 'Request Info'}
                                     </button>
                                     <button onClick={() => handleAction(p.id, 'Paging')} className="w-full text-left px-3 py-3 text-xs font-bold text-slate-200 hover:bg-slate-700 border-b border-slate-700/50 flex items-center gap-3">
                                        <Megaphone className="w-4 h-4 text-amber-400" /> Page Passenger
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

              {filteredData.length === 0 && (
                 <div className="p-10 text-center text-slate-500 italic">No passengers found matching filter.</div>
              )}
           </div>

        </div>

      </div>
    </div>
  );
};

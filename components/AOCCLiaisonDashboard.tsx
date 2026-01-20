
import React, { useState, useEffect } from 'react';
import { 
  X, RadioTower, Filter, Search, Plane, ArrowRight, 
  MapPin, User, Send, CheckCircle2, AlertTriangle, FileText, Menu
} from 'lucide-react';
import { Flight, Terminal, IncidentSeverity, Department } from '../types';

interface AOCCLiaisonDashboardProps {
  flights: Flight[];
  onClose: () => void;
  onRequestManifest: (flightNum: string) => void;
  onSendAlert: (msg: string, severity: IncidentSeverity) => void;
  onShowManifest: (flight: Flight) => void;
}

export const AOCCLiaisonDashboard: React.FC<AOCCLiaisonDashboardProps> = ({ 
    flights, onClose, onRequestManifest, onSendAlert, onShowManifest 
}) => {
  const [activeTab, setActiveTab] = useState<'FLIGHTS' | 'ASSIGN' | 'ALERTS'>('FLIGHTS');
  const [filterAirline, setFilterAirline] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Assignment Form State
  const [assignAirline, setAssignAirline] = useState('');
  const [assignType, setAssignType] = useState<'GATE' | 'COUNTER'>('GATE');
  const [assignFlightSearch, setAssignFlightSearch] = useState(''); // Text input for search
  const [showFlightSuggestions, setShowFlightSuggestions] = useState(false);
  const [assignResource, setAssignResource] = useState('');

  // Mock Airline Alerts
  const airlineAlerts = [
      { id: 1, airline: 'PAL', message: 'Delay due to tech issue', time: '10:00 AM' },
      { id: 2, airline: 'Cebu Pacific', message: 'Requesting wheelchair assist Gate 5', time: '10:15 AM' }
  ];

  const uniqueAirlines = Array.from(new Set(flights.map(f => f.airline)));

  const filteredFlights = flights.filter(f => {
      const matchAirline = filterAirline === 'ALL' || f.airline === filterAirline;
      const matchSearch = f.flightNumber.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          f.origin.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          f.destination.toLowerCase().includes(searchQuery.toLowerCase());
      return matchAirline && matchSearch;
  });

  // Filter flights for assignment suggestion
  const suggestedFlights = flights.filter(f => {
      const matchText = f.flightNumber.toLowerCase().includes(assignFlightSearch.toLowerCase());
      const matchAirline = !assignAirline || f.airline === assignAirline;
      return matchText && matchAirline;
  });

  const handleAssignment = () => {
      if(!assignAirline || !assignResource) return;
      onSendAlert(`[AOCC COMMAND] ${assignAirline} ${assignFlightSearch}: Assigned to ${assignType} ${assignResource}`, IncidentSeverity.LOW);
      alert("Command Sent to Airline.");
      setAssignFlightSearch('');
      setAssignResource('');
  };

  const NavButton = ({ tab, icon: Icon, label }: { tab: 'FLIGHTS' | 'ASSIGN' | 'ALERTS', icon: any, label: string }) => (
      <button 
        onClick={() => {
            setActiveTab(tab);
            setIsSidebarOpen(false);
        }}
        className={`p-4 md:p-3 rounded-xl flex items-center gap-3 text-sm font-bold transition-all w-full text-left ${
            activeTab === tab ? 'bg-amber-600 text-white' : 'text-slate-400 hover:bg-slate-800'
        }`}
      >
         <Icon className="w-5 h-5" /> {label}
      </button>
  );

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-md flex flex-col animate-in fade-in duration-300">
       
       {/* HEADER */}
       <div className="bg-slate-900 border-b border-slate-800 p-4 flex justify-between items-center shadow-lg z-20 relative">
          <div className="flex items-center gap-3 md:gap-4">
             {/* Mobile Toggle */}
             <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="md:hidden p-2 text-slate-400 hover:text-white">
                 <Menu className="w-6 h-6" />
             </button>

             <div className="w-10 h-10 md:w-12 md:h-12 bg-amber-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20">
                <RadioTower className="w-5 h-5 md:w-6 md:h-6 text-white" />
             </div>
             <div>
                <h1 className="text-lg md:text-2xl font-black text-white tracking-tight uppercase flex flex-col md:block">
                   AOCC <span className="text-amber-400 md:ml-2">LIAISON</span>
                </h1>
                <p className="text-[10px] md:text-xs text-slate-400 font-medium tracking-wide uppercase hidden md:block">Airline Coordination Desk</p>
             </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors">
             <X className="w-6 h-6 md:w-8 md:h-8" />
          </button>
       </div>

       <div className="flex-1 flex overflow-hidden relative">
           
           {/* SIDEBAR */}
           <div className={`
                absolute inset-y-0 left-0 z-10 w-64 bg-slate-900 border-r border-slate-800 p-4 flex flex-col gap-2 transform transition-transform duration-300
                md:relative md:translate-x-0
                ${isSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
           `}>
              <NavButton tab="FLIGHTS" icon={Plane} label="Flight Monitor" />
              <NavButton tab="ASSIGN" icon={CheckCircle2} label="Resource Assignment" />
              <NavButton tab="ALERTS" icon={AlertTriangle} label="Airline Alerts" />
           </div>

           {/* OVERLAY for Mobile */}
           {isSidebarOpen && (
               <div className="absolute inset-0 bg-black/50 z-0 md:hidden" onClick={() => setIsSidebarOpen(false)}></div>
           )}

           {/* MAIN CONTENT */}
           <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-950 w-full">
               
               {/* TAB: FLIGHT MONITOR */}
               {activeTab === 'FLIGHTS' && (
                  <div className="space-y-6">
                      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 bg-slate-900 p-4 rounded-xl border border-slate-800">
                          <div className="flex items-center gap-2 text-slate-400">
                              <Filter className="w-4 h-4" /> Filter:
                          </div>
                          <select 
                             value={filterAirline}
                             onChange={(e) => setFilterAirline(e.target.value)}
                             className="bg-slate-800 border border-slate-700 text-white rounded px-2 py-2 md:py-1 text-sm outline-none"
                          >
                              <option value="ALL">All Airlines</option>
                              {uniqueAirlines.map(a => <option key={a} value={a}>{a}</option>)}
                          </select>
                          <div className="flex-1 relative">
                              <input 
                                 type="text" 
                                 placeholder="Search Flight..." 
                                 value={searchQuery}
                                 onChange={(e) => setSearchQuery(e.target.value)}
                                 className="w-full bg-slate-800 border border-slate-700 text-white rounded px-3 py-2 md:py-1 pl-8 text-sm outline-none"
                              />
                              <Search className="absolute left-2.5 top-2.5 md:top-1.5 w-4 h-4 text-slate-500" />
                          </div>
                      </div>

                      <div className="grid grid-cols-1 gap-3">
                          {filteredFlights.map((f, i) => (
                              <div key={i} className="bg-slate-800 p-3 md:p-4 rounded-xl border border-slate-700 flex flex-col md:flex-row justify-between md:items-center gap-4 group hover:bg-slate-700 transition-colors">
                                  <div className="flex items-center gap-4">
                                      <div className={`p-2 rounded text-xs font-bold w-12 text-center ${f.type === 'DEPARTURE' ? 'bg-indigo-900/40 text-indigo-400' : 'bg-emerald-900/40 text-emerald-400'}`}>
                                          {f.type.substring(0,3)}
                                      </div>
                                      <div>
                                          <div className="font-bold text-white text-lg flex items-center gap-2">
                                              {f.flightNumber} 
                                              <span className="text-xs font-normal text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-600 hidden md:inline-block">{f.airline}</span>
                                          </div>
                                          <div className="text-xs text-slate-400 flex items-center gap-1">
                                              {f.origin} <ArrowRight className="w-3 h-3" /> {f.destination}
                                          </div>
                                      </div>
                                  </div>
                                  <div className="flex gap-2 w-full md:w-auto">
                                      <button 
                                        onClick={() => onShowManifest(f)}
                                        className="flex-1 md:flex-none justify-center px-3 py-2 bg-slate-600 hover:bg-indigo-600 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-2"
                                      >
                                          <FileText className="w-3 h-3" /> <span className="md:hidden">Manifest</span><span className="hidden md:inline">View Manifest</span>
                                      </button>
                                      <button 
                                        onClick={() => onRequestManifest(f.flightNumber)}
                                        className="flex-1 md:flex-none justify-center px-3 py-2 bg-slate-900 border border-slate-600 hover:bg-slate-800 text-slate-300 rounded-lg text-xs font-bold transition-colors"
                                      >
                                          Request Update
                                      </button>
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>
               )}

               {/* TAB: RESOURCE ASSIGNMENT */}
               {activeTab === 'ASSIGN' && (
                   <div className="max-w-2xl mx-auto bg-slate-900 p-6 md:p-8 rounded-2xl border border-slate-800">
                       <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                           <CheckCircle2 className="w-6 h-6 text-emerald-400" /> Assign Resources
                       </h2>
                       <div className="space-y-4">
                           <div>
                               <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Select Airline</label>
                               <select 
                                  value={assignAirline}
                                  onChange={(e) => setAssignAirline(e.target.value)}
                                  className="w-full bg-slate-800 border border-slate-700 text-white p-3 rounded-lg outline-none"
                               >
                                   <option value="">-- Select --</option>
                                   {uniqueAirlines.map(a => <option key={a} value={a}>{a}</option>)}
                               </select>
                           </div>
                           
                           <div className="grid grid-cols-2 gap-4">
                               <button 
                                  onClick={() => setAssignType('GATE')}
                                  className={`p-3 rounded-lg border text-sm font-bold flex items-center justify-center gap-2 ${assignType === 'GATE' ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400'}`}
                               >
                                   <MapPin className="w-4 h-4" /> Boarding Gate
                               </button>
                               <button 
                                  onClick={() => setAssignType('COUNTER')}
                                  className={`p-3 rounded-lg border text-sm font-bold flex items-center justify-center gap-2 ${assignType === 'COUNTER' ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-800 border-slate-700 text-slate-400'}`}
                               >
                                   <User className="w-4 h-4" /> Check-in Counter
                               </button>
                           </div>

                           <div className="relative">
                               <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Flight Number (Smart Search)</label>
                               <input 
                                  type="text" 
                                  value={assignFlightSearch}
                                  onFocus={() => setShowFlightSuggestions(true)}
                                  onBlur={() => setTimeout(() => setShowFlightSuggestions(false), 200)}
                                  onChange={(e) => setAssignFlightSearch(e.target.value)}
                                  placeholder="Type flight code e.g. PR 1845..."
                                  className="w-full bg-slate-800 border border-slate-700 text-white p-3 rounded-lg outline-none focus:ring-2 focus:ring-amber-500"
                               />
                               {/* Smart Dropdown */}
                               {showFlightSuggestions && assignFlightSearch && (
                                   <div className="absolute top-full left-0 w-full mt-1 bg-slate-800 border border-slate-600 rounded-lg shadow-2xl z-50 max-h-48 overflow-y-auto custom-scrollbar">
                                       {suggestedFlights.length === 0 ? (
                                           <div className="p-3 text-xs text-slate-500">No flights found</div>
                                       ) : (
                                           suggestedFlights.map((f, i) => (
                                               <button
                                                  key={i}
                                                  onClick={() => {
                                                      setAssignFlightSearch(f.flightNumber);
                                                      setAssignAirline(f.airline); // Auto-set airline
                                                  }}
                                                  className="w-full text-left p-3 hover:bg-slate-700 border-b border-slate-700/50 last:border-0 flex justify-between items-center group"
                                               >
                                                   <div>
                                                       <div className="text-sm font-bold text-white group-hover:text-amber-400">{f.flightNumber}</div>
                                                       <div className="text-[10px] text-slate-400">{f.airline} • {f.type === 'DEPARTURE' ? f.destination : f.origin}</div>
                                                   </div>
                                                   <div className="text-[10px] font-mono text-slate-500">{f.scheduledTime}</div>
                                               </button>
                                           ))
                                       )}
                                   </div>
                               )}
                           </div>

                           <div>
                               <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Resource ID (Search)</label>
                               <input 
                                  type="text" 
                                  value={assignResource}
                                  onChange={(e) => setAssignResource(e.target.value)}
                                  placeholder={assignType === 'GATE' ? "e.g. Gate 4, Gate 12..." : "e.g. Counter 1, Island A..."}
                                  className="w-full bg-slate-800 border border-slate-700 text-white p-3 rounded-lg outline-none"
                               />
                           </div>

                           <button 
                              onClick={handleAssignment}
                              className="w-full py-4 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 mt-4 active:scale-95 transition-transform"
                           >
                               <Send className="w-5 h-5" /> Send Command
                           </button>
                       </div>
                   </div>
               )}

               {/* TAB: ALERTS */}
               {activeTab === 'ALERTS' && (
                   <div className="max-w-2xl mx-auto space-y-4">
                       {airlineAlerts.map(alert => (
                           <div key={alert.id} className="bg-slate-800 p-4 rounded-xl border border-slate-700 border-l-4 border-l-red-500 flex justify-between items-center">
                               <div>
                                   <div className="font-bold text-white text-sm md:text-base">{alert.airline}: {alert.message}</div>
                                   <div className="text-xs text-slate-400">{alert.time}</div>
                               </div>
                               <button className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-xs text-white rounded ml-2">Ack</button>
                           </div>
                       ))}
                       {airlineAlerts.length === 0 && <div className="text-center text-slate-500">No active alerts from airlines.</div>}
                   </div>
               )}

           </div>
       </div>
    </div>
  );
};

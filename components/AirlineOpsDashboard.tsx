
import React, { useState } from 'react';
import { 
  X, Plane, CheckCircle2, Upload, AlertTriangle, 
  MessageSquare, Bell, User, Clock, MapPin, 
  Luggage, ClipboardList, Send, Info, Menu
} from 'lucide-react';
import { UserProfile, Flight, IncidentSeverity } from '../types';
import { processCommandInput } from '../geminiEngine';

interface AirlineOpsDashboardProps {
  user: UserProfile;
  flights: Flight[];
  onClose: () => void;
  onSendAlert: (msg: string, severity: IncidentSeverity) => void;
}

export const AirlineOpsDashboard: React.FC<AirlineOpsDashboardProps> = ({ user, flights, onClose, onSendAlert }) => {
  const [activeTab, setActiveTab] = useState<'STATUS' | 'ACTIONS' | 'REPORTS'>('STATUS');
  const [reportText, setReportText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile sidebar state

  // Filter flights for this airline
  const myFlights = flights.filter(f => f.airline === user.airline || user.airline === 'ALL_ACCESS_DEBUG');

  // Mock AOCC Assignments (In a real app, these would come from props/backend)
  const assignments = [
      { id: 1, type: 'GATE', detail: 'Gate 4 Assigned', flight: 'PR 1845', time: '08:00', status: 'CONFIRMED' },
      { id: 2, type: 'COUNTER', detail: 'Counters 1-4 Open', flight: 'PR 1845', time: '06:30', status: 'ACTIVE' },
      { id: 3, type: 'ALERT', detail: 'Weather Advisory: Exp. Delay', flight: 'ALL', time: '09:00', status: 'WARNING' }
  ];

  const handleReportSubmit = async () => {
      if(!reportText) return;
      setIsSubmitting(true);
      
      try {
          // Use the AI Service to process the report
          const result = await processCommandInput(reportText, user.role, user.department);
          
          let severity = IncidentSeverity.LOW;
          // Basic logic to guess severity if tool call implies it, or default to LOW
          if (result.toolCalls && result.toolCalls.length > 0) {
             // Simplified handling for the mockup
             severity = IncidentSeverity.MEDIUM; 
          }
          
          onSendAlert(`[AIRLINE REPORT] ${user.airline}: ${result.text || reportText}`, severity);
          setReportText('');
          alert("Report sent to AOCC.");
      } catch (e) {
          console.error(e);
          onSendAlert(`[AIRLINE REPORT] ${user.airline}: ${reportText}`, IncidentSeverity.LOW);
          setReportText('');
      } finally {
          setIsSubmitting(false);
      }
  };

  const NavButton = ({ tab, icon: Icon, label }: { tab: 'STATUS' | 'ACTIONS' | 'REPORTS', icon: any, label: string }) => (
      <button 
        onClick={() => {
            setActiveTab(tab);
            setIsSidebarOpen(false);
        }}
        className={`p-4 md:p-3 rounded-xl flex items-center gap-3 text-sm font-bold transition-all w-full text-left ${
            activeTab === tab ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800'
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
             {/* Mobile Sidebar Toggle */}
             <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="md:hidden p-2 text-slate-400 hover:text-white">
                 <Menu className="w-6 h-6" />
             </button>

             <div className="w-10 h-10 md:w-12 md:h-12 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <Plane className="w-5 h-5 md:w-6 md:h-6 text-white" />
             </div>
             <div>
                <h1 className="text-lg md:text-2xl font-black text-white tracking-tight uppercase flex flex-col md:block">
                   <span>{user.airline}</span> <span className="text-indigo-400 text-sm md:text-2xl">OPS</span>
                </h1>
                <p className="text-[10px] md:text-xs text-slate-400 font-medium tracking-wide uppercase hidden md:block">Airline Command Interface</p>
             </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors">
             <X className="w-6 h-6 md:w-8 md:h-8" />
          </button>
       </div>

       <div className="flex-1 flex overflow-hidden relative">
           
           {/* SIDEBAR NAVIGATION - Responsive */}
           <div className={`
                absolute inset-y-0 left-0 z-10 w-64 bg-slate-900 border-r border-slate-800 p-4 flex flex-col gap-2 transform transition-transform duration-300
                md:relative md:translate-x-0
                ${isSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
           `}>
              <NavButton tab="STATUS" icon={Bell} label="Status & Alerts" />
              <NavButton tab="ACTIONS" icon={Upload} label="Submit Data" />
              <NavButton tab="REPORTS" icon={MessageSquare} label="Report Incident" />
           </div>

           {/* OVERLAY for Mobile Sidebar */}
           {isSidebarOpen && (
               <div className="absolute inset-0 bg-black/50 z-0 md:hidden" onClick={() => setIsSidebarOpen(false)}></div>
           )}

           {/* MAIN CONTENT AREA */}
           <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-950 w-full">
               
               {/* TAB: STATUS & ALERTS */}
               {activeTab === 'STATUS' && (
                  <div className="max-w-4xl mx-auto space-y-6">
                      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4 md:p-6">
                          <h2 className="text-lg md:text-xl font-bold text-white mb-4 flex items-center gap-2">
                              <Bell className="w-5 h-5 md:w-6 md:h-6 text-amber-400" /> AOCC Assignments
                          </h2>
                          <div className="space-y-3">
                              {assignments.map(a => (
                                  <div key={a.id} className="bg-slate-800 p-3 md:p-4 rounded-xl border border-slate-700 flex flex-col md:flex-row md:justify-between md:items-center gap-3">
                                      <div className="flex items-center gap-4">
                                          <div className={`p-3 rounded-lg ${a.type === 'ALERT' ? 'bg-red-900/20 text-red-400' : 'bg-emerald-900/20 text-emerald-400'}`}>
                                              {a.type === 'GATE' && <MapPin className="w-5 h-5" />}
                                              {a.type === 'COUNTER' && <User className="w-5 h-5" />}
                                              {a.type === 'ALERT' && <AlertTriangle className="w-5 h-5" />}
                                          </div>
                                          <div>
                                              <div className="font-bold text-white text-sm md:text-base">{a.detail}</div>
                                              <div className="text-xs text-slate-400 font-mono">Flight: {a.flight} • Time: {a.time}</div>
                                          </div>
                                      </div>
                                      <span className="self-start md:self-center px-3 py-1 bg-slate-700 rounded text-xs font-bold text-slate-300">{a.status}</span>
                                  </div>
                              ))}
                          </div>
                      </div>

                      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4 md:p-6">
                          <h2 className="text-lg md:text-xl font-bold text-white mb-4 flex items-center gap-2">
                              <Clock className="w-5 h-5 md:w-6 md:h-6 text-sky-400" /> My Flights Status
                          </h2>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {myFlights.map(f => (
                                  <div key={f.flightNumber} className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                                      <div className="flex justify-between mb-2">
                                          <span className="font-bold text-white text-base md:text-lg">{f.flightNumber}</span>
                                          <span className={`text-xs font-bold px-2 py-1 rounded ${f.status === 'DELAYED' ? 'bg-red-900/40 text-red-400' : 'bg-emerald-900/40 text-emerald-400'}`}>
                                              {f.status}
                                          </span>
                                      </div>
                                      <div className="flex justify-between text-xs text-slate-400">
                                          <span>{f.origin} → {f.destination}</span>
                                          <span>Gate: {f.gate || 'TBD'}</span>
                                      </div>
                                  </div>
                              ))}
                              {myFlights.length === 0 && <div className="text-slate-500 italic">No active flights for {user.airline}</div>}
                          </div>
                      </div>
                  </div>
               )}

               {/* TAB: SUBMIT DATA */}
               {activeTab === 'ACTIONS' && (
                  <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                      <button className="bg-slate-800 hover:bg-slate-700 border border-slate-700 p-6 rounded-2xl flex flex-col items-center gap-4 transition-all group active:scale-95">
                          <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center group-hover:bg-indigo-600 transition-colors">
                              <ClipboardList className="w-8 h-8 text-white" />
                          </div>
                          <div className="text-center">
                              <h3 className="font-bold text-white text-lg">Send Manifest</h3>
                              <p className="text-sm text-slate-400 mt-1">Upload PAX/Crew List</p>
                          </div>
                      </button>

                      <button className="bg-slate-800 hover:bg-slate-700 border border-slate-700 p-6 rounded-2xl flex flex-col items-center gap-4 transition-all group active:scale-95">
                          <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center group-hover:bg-emerald-600 transition-colors">
                              <Plane className="w-8 h-8 text-white" />
                          </div>
                          <div className="text-center">
                              <h3 className="font-bold text-white text-lg">Departure Report</h3>
                              <p className="text-sm text-slate-400 mt-1">Confirm Off-Block</p>
                          </div>
                      </button>

                      <button className="bg-slate-800 hover:bg-slate-700 border border-slate-700 p-6 rounded-2xl flex flex-col items-center gap-4 transition-all group active:scale-95">
                          <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center group-hover:bg-sky-600 transition-colors">
                              <Luggage className="w-8 h-8 text-white" />
                          </div>
                          <div className="text-center">
                              <h3 className="font-bold text-white text-lg">Baggage Status</h3>
                              <p className="text-sm text-slate-400 mt-1">Load / Offload Report</p>
                          </div>
                      </button>
                  </div>
               )}

               {/* TAB: REPORT INCIDENT */}
               {activeTab === 'REPORTS' && (
                  <div className="max-w-2xl mx-auto">
                      <div className="bg-gradient-to-r from-indigo-900/20 to-purple-900/20 border border-indigo-500/30 rounded-xl p-4 md:p-6 mb-6">
                          <h3 className="text-indigo-300 font-bold mb-2 flex items-center gap-2 text-sm md:text-base">
                             <Info className="w-5 h-5" /> Smart Ops Reporter
                          </h3>
                          <p className="text-xs md:text-sm text-slate-400">
                             Use this to report delays, maintenance issues at the gate, or custom alerts to AOCC.
                             The AI will parse your text and categorize it for the Ops Center.
                          </p>
                      </div>
                      
                      <div className="space-y-4">
                          <textarea 
                             value={reportText}
                             onChange={(e) => setReportText(e.target.value)}
                             placeholder="e.g., Gate 4 printer is jammed, requesting IT assistance..."
                             className="w-full h-40 bg-slate-900 border border-slate-700 rounded-xl p-4 text-white focus:ring-2 focus:ring-indigo-500 outline-none text-sm md:text-base"
                          />
                          <button 
                             onClick={handleReportSubmit}
                             disabled={!reportText || isSubmitting}
                             className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                          >
                             {isSubmitting ? 'Sending...' : <><Send className="w-5 h-5" /> Send Report to AOCC</>}
                          </button>
                      </div>
                  </div>
               )}

           </div>
       </div>
    </div>
  );
};

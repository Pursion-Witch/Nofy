
import React, { useState, useEffect } from 'react';
import { 
  ArrowRightLeft, 
  Ship, 
  Briefcase, 
  Clock,
  AlertTriangle,
  Plane,
  Activity,
  DoorOpen,
  Users,
  Lock,
  CloudRain,
  Zap,
  ChevronRight,
  CheckCircle2,
  X,
  RadioTower
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip
} from 'recharts';
import { CebuConnectsDashboard } from './CebuConnectsDashboard';
import { CebuPlusDashboard } from './CebuPlusDashboard';
import { CebBalikDashboard } from './CebBalikDashboard';
import { AirlineOpsDashboard } from './AirlineOpsDashboard';
import { AOCCLiaisonDashboard } from './AOCCLiaisonDashboard';
import { Department, Flight, LogEntry, IncidentSeverity, UserProfile } from '../types';

// Departments authorized to view Cebu Connects & Cebu+
const STRATEGIC_ACCESS = [
  Department.AOCC,
  Department.IT_SYSTEMS,
  Department.TERMINAL_OPS,
  Department.SECURITY,
  Department.CUSTOMER_EXP,
  Department.APRON_PBB,
  Department.AIRLINE_OPS
];

interface StrategicOverviewProps {
  userDept?: Department;
  flights: Flight[];
  logs: LogEntry[];
  currentUser?: UserProfile; // Added to pass user context
  onSendAlert?: (msg: string, severity: IncidentSeverity) => void;
  onRequestManifest?: (flight: string) => void;
  onShowManifest?: (flight: Flight) => void;
}

// Generate forecast data for the chart
const generateFlowData = () => {
    return Array.from({ length: 12 }, (_, i) => ({
        time: `${(i * 2 + 6).toString().padStart(2, '0')}:00`,
        inbound: Math.floor(Math.random() * 500) + 200,
        outbound: Math.floor(Math.random() * 600) + 300,
    }));
};

const MetricCard = ({ title, value, sub, icon: Icon, color, trend, onClick }: any) => (
    <div 
        onClick={onClick}
        className={`p-3 lg:p-4 rounded-xl border border-${color}-500/30 bg-gradient-to-br from-${color}-900/20 to-slate-800 shadow-lg relative overflow-hidden group hover:border-${color}-500/50 transition-all ${onClick ? 'cursor-pointer active:scale-95' : ''}`}
    >
        <div className={`absolute -right-2 -bottom-2 opacity-10 group-hover:opacity-20 transition-opacity`}>
            <Icon className="w-12 h-12 lg:w-16 lg:h-16" />
        </div>
        <div className="flex justify-between items-start mb-1 lg:mb-2 relative z-10">
            <div className={`p-1.5 lg:p-2 rounded-lg bg-${color}-500/20 text-${color}-400`}>
                <Icon className="w-4 h-4 lg:w-5 lg:h-5" />
            </div>
            {trend && (
                <div className={`text-[9px] lg:text-[10px] font-bold px-1.5 py-0.5 rounded-full ${trend.includes('+') ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                    {trend}
                </div>
            )}
        </div>
        <div className="relative z-10">
            <div className="text-xl lg:text-2xl font-black text-white tracking-tight">{value}</div>
            <div className="text-[10px] lg:text-xs font-bold text-slate-400 uppercase tracking-wide truncate">{title}</div>
            {sub && <div className="text-[9px] lg:text-[10px] text-slate-500 mt-0.5 truncate">{sub}</div>}
        </div>
    </div>
);

export const StrategicOverview: React.FC<StrategicOverviewProps> = ({ 
    userDept, flights, logs, currentUser, onSendAlert, onRequestManifest, onShowManifest 
}) => {
  const [showCebuConnects, setShowCebuConnects] = useState(false);
  const [showCebuPlus, setShowCebuPlus] = useState(false);
  const [showCebBalik, setShowCebBalik] = useState(false);
  const [showAccessDenied, setShowAccessDenied] = useState(false);
  const [showIncidentsModal, setShowIncidentsModal] = useState(false);
  
  // New Role-Specific Dashboards
  const [showAirlineOps, setShowAirlineOps] = useState(false);
  const [showAOCCLiaison, setShowAOCCLiaison] = useState(false);

  const [flowData] = useState(generateFlowData());
  const [activeFeedTab, setActiveFeedTab] = useState<'ALERTS' | 'WATCHLIST'>('ALERTS');
  const [currentTime, setCurrentTime] = useState(new Date());

  // Live Clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Metrics Calculation
  const totalPax = flights.reduce((acc, f) => acc + f.paxCount, 0);
  const onTimeFlights = flights.filter(f => f.status === 'ON TIME' || f.status === 'LANDED').length;
  const otpRate = flights.length > 0 ? Math.round((onTimeFlights / flights.length) * 100) : 100;
  const criticalLogs = logs.filter(l => l.severity === IncidentSeverity.CRITICAL || l.severity === IncidentSeverity.HIGH);
  const delayedFlights = flights.filter(f => f.status === 'DELAYED' || f.status === 'CANCELLED');

  const checkAccess = () => {
    if (userDept && STRATEGIC_ACCESS.includes(userDept)) {
        return true;
    }
    setShowAccessDenied(true);
    setTimeout(() => setShowAccessDenied(false), 2000);
    return false;
  };

  const handleOpenCebuConnects = () => checkAccess() && setShowCebuConnects(true);
  const handleOpenCebuPlus = () => checkAccess() && setShowCebuPlus(true);
  const handleOpenCebBalik = () => checkAccess() && setShowCebBalik(true);

  const handleNavigateFromBalik = (dashboard: 'CONNECTS' | 'PLUS') => {
      setShowCebBalik(false);
      if (dashboard === 'CONNECTS') setShowCebuConnects(true);
      if (dashboard === 'PLUS') setShowCebuPlus(true);
  };

  return (
    <>
    {/* 
      MAIN CONTAINER 
    */}
    <div className="flex flex-col gap-3 lg:gap-4 h-auto lg:h-[calc(100vh-220px)] w-full pb-20 lg:pb-0">
      
      {/* ACCESS DENIED TOAST */}
      {showAccessDenied && (
         <div className="absolute top-10 left-1/2 -translate-x-1/2 z-[100] bg-rose-600 text-white px-4 py-2 rounded-full shadow-xl animate-in fade-in slide-in-from-top-4 font-bold text-xs lg:text-sm flex items-center gap-2">
            <Lock className="w-4 h-4" /> Access Restricted to Ops & AOCC
         </div>
      )}

      {/* ROW 1: KPI CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 lg:gap-4 shrink-0">
          <MetricCard 
             title="Total Pax" 
             value={totalPax.toLocaleString()} 
             sub="24h Projection" 
             icon={Users} 
             color="indigo" 
             trend="+8.5%"
          />
          <MetricCard 
             title="OTP Rate" 
             value={`${otpRate}%`} 
             sub="Target: 85%" 
             icon={Clock} 
             color="emerald" 
             trend={otpRate < 85 ? '-2.1%' : '+1.2%'}
          />
          <MetricCard 
             title="Incidents (View All)" 
             value={criticalLogs.length} 
             sub="Active Alerts" 
             icon={AlertTriangle} 
             color={criticalLogs.length > 0 ? "rose" : "slate"}
             onClick={() => setShowIncidentsModal(true)} 
          />
          <MetricCard 
             title="Gate Eff." 
             value="94%" 
             sub="Turnaround Time" 
             icon={DoorOpen} 
             color="sky" 
          />
      </div>

      {/* ROW 2: MAIN DASHBOARD BODY */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-3 lg:gap-4">
          
          {/* LEFT COL: STRATEGIC BUTTONS */}
          <div className="lg:col-span-3 flex flex-col gap-2 lg:gap-3 min-h-0 order-2 lg:order-1">
             
             {/* Clock Widget */}
             <div className="hidden lg:flex bg-slate-800 rounded-xl p-4 border border-slate-700 shadow-lg flex-col items-center justify-center relative overflow-hidden group shrink-0">
                 <div className="absolute inset-0 bg-gradient-to-b from-slate-800 to-slate-900 opacity-50"></div>
                 <div className="relative z-10 text-center">
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 flex items-center justify-center gap-1">
                        <Zap className="w-3 h-3 text-amber-400 fill-amber-400" /> LIVE OPS
                    </div>
                    <div className="text-4xl font-black text-white tracking-widest font-mono">
                        {currentTime.toLocaleTimeString([], {hour12:false})}
                    </div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                        {currentTime.toLocaleDateString([], {weekday: 'short', month: 'short', day: 'numeric'})}
                    </div>
                 </div>
                 <CloudRain className="absolute bottom-2 right-2 w-8 h-8 text-slate-700 opacity-20" />
             </div>

             {/* Strategic Buttons */}
             <div className="flex-1 flex flex-col gap-2 lg:gap-3 lg:overflow-y-auto custom-scrollbar">
                
                {/* ROLE SPECIFIC CARDS */}
                {userDept === Department.AIRLINE_OPS && (
                    <button onClick={() => setShowAirlineOps(true)} className="bg-gradient-to-r from-indigo-900 to-slate-800 rounded-xl border border-indigo-500 p-3 lg:p-4 hover:brightness-110 transition-all group relative overflow-hidden text-left flex items-center justify-between shadow-lg">
                        <div>
                            <div className="flex items-center gap-2 text-indigo-300 font-bold text-[10px] lg:text-xs uppercase mb-0.5">
                                <Plane className="w-3 h-3 lg:w-4 lg:h-4" /> Command
                            </div>
                            <div className="text-sm lg:text-lg font-black text-white">Airline Operations</div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-white" />
                    </button>
                )}

                {userDept === Department.AOCC && (
                    <button onClick={() => setShowAOCCLiaison(true)} className="bg-gradient-to-r from-amber-900 to-slate-800 rounded-xl border border-amber-500 p-3 lg:p-4 hover:brightness-110 transition-all group relative overflow-hidden text-left flex items-center justify-between shadow-lg">
                        <div>
                            <div className="flex items-center gap-2 text-amber-300 font-bold text-[10px] lg:text-xs uppercase mb-0.5">
                                <RadioTower className="w-3 h-3 lg:w-4 lg:h-4" /> Control
                            </div>
                            <div className="text-sm lg:text-lg font-black text-white">AOCC Liaison Desk</div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-white" />
                    </button>
                )}

                <button onClick={handleOpenCebuConnects} className="bg-slate-800 rounded-xl border border-slate-700 p-3 lg:p-4 hover:border-sky-500 transition-all group relative overflow-hidden text-left flex items-center justify-between shadow-sm">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-sky-500 opacity-50 group-hover:opacity-100 transition-opacity"></div>
                    <div>
                        <div className="flex items-center gap-2 text-sky-400 font-bold text-[10px] lg:text-xs uppercase mb-0.5">
                            <ArrowRightLeft className="w-3 h-3 lg:w-4 lg:h-4" /> Transfer
                        </div>
                        <div className="text-sm lg:text-lg font-black text-white">Cebu Connects</div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-sky-400 transition-colors" />
                </button>

                <button onClick={handleOpenCebuPlus} className="bg-slate-800 rounded-xl border border-slate-700 p-3 lg:p-4 hover:border-indigo-500 transition-all group relative overflow-hidden text-left flex items-center justify-between shadow-sm">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 opacity-50 group-hover:opacity-100 transition-opacity"></div>
                    <div>
                        <div className="flex items-center gap-2 text-indigo-400 font-bold text-[10px] lg:text-xs uppercase mb-0.5">
                            <Ship className="w-3 h-3 lg:w-4 lg:h-4" /> Intermodal
                        </div>
                        <div className="text-sm lg:text-lg font-black text-white">Cebu+</div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-indigo-400 transition-colors" />
                </button>

                <button onClick={handleOpenCebBalik} className="bg-slate-800 rounded-xl border border-slate-700 p-3 lg:p-4 hover:border-amber-500 transition-all group relative overflow-hidden text-left flex items-center justify-between shadow-sm">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500 opacity-50 group-hover:opacity-100 transition-opacity"></div>
                    <div>
                        <div className="flex items-center gap-2 text-amber-400 font-bold text-[10px] lg:text-xs uppercase mb-0.5">
                            <Briefcase className="w-3 h-3 lg:w-4 lg:h-4" /> OFW Hub
                        </div>
                        <div className="text-sm lg:text-lg font-black text-white">CEB-Balik</div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-amber-400 transition-colors" />
                </button>
             </div>
          </div>

          {/* CENTER COL: MAIN CHART */}
          <div className="lg:col-span-6 flex flex-col min-h-0 order-1 lg:order-2 h-[220px] lg:h-auto">
             <div className="bg-slate-800 rounded-xl border border-slate-700 p-1 lg:p-4 h-full shadow-lg flex flex-col relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 opacity-50"></div>
                
                <div className="flex justify-between items-center mb-2 px-3 pt-3 lg:px-0 lg:pt-0 shrink-0">
                   <div>
                      <h3 className="text-white font-bold flex items-center gap-2 text-sm lg:text-base">
                         <Activity className="w-4 h-4 lg:w-5 lg:h-5 text-indigo-400" />
                         Passenger Flow
                      </h3>
                   </div>
                   <div className="flex gap-2">
                      <div className="flex items-center gap-1 text-[9px] lg:text-[10px] text-sky-400 font-bold"><div className="w-1.5 h-1.5 lg:w-2 lg:h-2 bg-sky-500 rounded-full"></div> IN</div>
                      <div className="flex items-center gap-1 text-[9px] lg:text-[10px] text-emerald-400 font-bold"><div className="w-1.5 h-1.5 lg:w-2 lg:h-2 bg-emerald-500 rounded-full"></div> OUT</div>
                   </div>
                </div>

                <div className="flex-grow w-full min-h-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={flowData} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorIn" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0}/>
                                </linearGradient>
                                <linearGradient id="colorOut" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#34d399" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#34d399" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                            <XAxis dataKey="time" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                            <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px', fontSize: '12px', padding: '8px' }}
                                itemStyle={{ color: '#e2e8f0' }}
                            />
                            <Area type="monotone" dataKey="inbound" stroke="#38bdf8" fillOpacity={1} fill="url(#colorIn)" strokeWidth={2} />
                            <Area type="monotone" dataKey="outbound" stroke="#34d399" fillOpacity={1} fill="url(#colorOut)" strokeWidth={2} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
             </div>
          </div>

          {/* RIGHT COL: TABBED FEEDS */}
          <div className="lg:col-span-3 flex flex-col min-h-0 order-3 lg:order-3 h-[300px] lg:h-auto">
             <div className="bg-slate-800 rounded-xl border border-slate-700 h-full flex flex-col shadow-lg overflow-hidden">
                
                {/* Tabs */}
                <div className="flex border-b border-slate-700 bg-slate-900/50 shrink-0">
                    <button 
                      onClick={() => setActiveFeedTab('ALERTS')}
                      className={`flex-1 py-3 text-[10px] lg:text-xs font-bold uppercase transition-colors flex items-center justify-center gap-1.5 ${
                        activeFeedTab === 'ALERTS' 
                        ? 'text-white border-b-2 border-amber-500 bg-slate-800' 
                        : 'text-slate-500 hover:text-slate-300'
                      }`}
                    >
                       <AlertTriangle className="w-3 h-3" /> Alerts ({criticalLogs.length})
                    </button>
                    <button 
                      onClick={() => setActiveFeedTab('WATCHLIST')}
                      className={`flex-1 py-3 text-[10px] lg:text-xs font-bold uppercase transition-colors flex items-center justify-center gap-1.5 ${
                        activeFeedTab === 'WATCHLIST' 
                        ? 'text-white border-b-2 border-rose-500 bg-slate-800' 
                        : 'text-slate-500 hover:text-slate-300'
                      }`}
                    >
                       <Plane className="w-3 h-3" /> Issues ({delayedFlights.length})
                    </button>
                </div>

                {/* Feed Body */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
                   {activeFeedTab === 'ALERTS' && (
                       criticalLogs.length === 0 ? (
                           <div className="h-full flex flex-col items-center justify-center text-slate-500">
                               <CheckCircle2 className="w-8 h-8 opacity-20 mb-2" />
                               <span className="text-xs italic">All Clear</span>
                           </div>
                       ) : (
                           criticalLogs.map(log => (
                               <div key={log.id} className="bg-slate-900/50 rounded-lg p-3 border border-slate-700/50 hover:bg-slate-900 transition-colors">
                                   <div className="flex justify-between items-start mb-1">
                                       <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${log.severity === 'CRITICAL' ? 'bg-red-600 text-white' : 'bg-amber-600 text-white'}`}>
                                           {log.severity}
                                       </span>
                                       <span className="text-[9px] text-slate-500 font-mono">{log.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                   </div>
                                   <p className="text-xs text-slate-300 leading-tight">{log.message}</p>
                               </div>
                           ))
                       )
                   )}

                   {activeFeedTab === 'WATCHLIST' && (
                       delayedFlights.length === 0 ? (
                           <div className="h-full flex flex-col items-center justify-center text-slate-500">
                               <Plane className="w-8 h-8 opacity-20 mb-2" />
                               <span className="text-xs italic">No Delays</span>
                           </div>
                       ) : (
                           delayedFlights.map((f, i) => (
                               <div key={i} className="bg-slate-900/50 rounded-lg p-2 border-l-2 border-rose-500 flex justify-between items-center hover:bg-slate-900 transition-colors">
                                  <div>
                                      <div className="font-bold text-white text-xs">{f.airline} {f.flightNumber}</div>
                                      <div className="text-[9px] text-rose-400 font-bold uppercase">{f.status}</div>
                                  </div>
                                  <div className="text-right">
                                      <div className="text-[10px] font-mono text-slate-400">{f.estimatedTime}</div>
                                      <div className="text-[9px] text-slate-500">Gate {f.gate}</div>
                                  </div>
                               </div>
                           ))
                       )
                   )}
                </div>
             </div>
          </div>

      </div>
    </div>

    {/* OVERLAY DASHBOARDS */}
    {showCebuConnects && <CebuConnectsDashboard onClose={() => setShowCebuConnects(false)} />}
    {showCebuPlus && <CebuPlusDashboard onClose={() => setShowCebuPlus(false)} />}
    {showCebBalik && <CebBalikDashboard onClose={() => setShowCebBalik(false)} onNavigate={handleNavigateFromBalik} />}
    
    {/* NEW ROLE DASHBOARDS */}
    {showAirlineOps && currentUser && (
        <AirlineOpsDashboard 
            user={currentUser} 
            flights={flights} 
            onClose={() => setShowAirlineOps(false)} 
            onSendAlert={onSendAlert || console.log}
        />
    )}
    
    {showAOCCLiaison && (
        <AOCCLiaisonDashboard 
            flights={flights} 
            onClose={() => setShowAOCCLiaison(false)} 
            onRequestManifest={onRequestManifest || console.log}
            onSendAlert={onSendAlert || console.log}
            onShowManifest={onShowManifest || console.log}
        />
    )}

    {/* INCIDENTS LIST MODAL */}
    {showIncidentsModal && (
        <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95">
                <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-800">
                    <h3 className="font-bold text-white text-lg flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-rose-500" /> Active Incidents & Alerts
                    </h3>
                    <button onClick={() => setShowIncidentsModal(false)} className="text-slate-400 hover:text-white">
                        <X className="w-6 h-6" />
                    </button>
                </div>
                <div className="p-4 max-h-[60vh] overflow-y-auto space-y-2 custom-scrollbar">
                    {criticalLogs.length === 0 ? (
                        <div className="text-center text-slate-500 py-8">No active incidents.</div>
                    ) : (
                        criticalLogs.map(log => (
                           <div key={log.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col gap-2">
                               <div className="flex justify-between items-start">
                                   <div className={`text-xs font-bold px-2 py-1 rounded uppercase ${log.severity === 'CRITICAL' ? 'bg-red-900/40 text-red-400' : 'bg-amber-900/40 text-amber-400'}`}>
                                       {log.severity}
                                   </div>
                                   <div className="text-xs text-slate-500">{log.timestamp.toLocaleTimeString()}</div>
                               </div>
                               <div className="text-white font-medium">{log.message}</div>
                               <div className="text-xs text-slate-500 flex gap-2">
                                   <span>Origin: {log.originDept}</span>
                                   <span>Term: {log.terminal}</span>
                               </div>
                           </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    )}

    </>
  );
};

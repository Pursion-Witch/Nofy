
import React, { useState } from 'react';
import { 
  ArrowRightLeft, 
  Ship, 
  Briefcase, 
  CheckCircle2,
  TrafficCone,
  Users,
  Lock
} from 'lucide-react';
import { BarChart, Bar, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';
import { CebuConnectsDashboard } from './CebuConnectsDashboard';
import { Department } from '../types';

const dataTransfer = [
  { time: '08:00', minutes: 45 },
  { time: '10:00', minutes: 38 },
  { time: '12:00', minutes: 32 },
  { time: '14:00', minutes: 29 }, 
  { time: '16:00', minutes: 35 },
];

const dataOFW = [
  { day: 'Mon', pax: 120 },
  { day: 'Tue', pax: 150 },
  { day: 'Wed', pax: 180 },
  { day: 'Thu', pax: 200 },
  { day: 'Fri', pax: 250 },
];

// Departments authorized to view Cebu Connects
const CEBU_CONNECTS_ACCESS = [
  Department.AOCC,
  Department.IT_SYSTEMS,
  Department.TERMINAL_OPS,
  Department.SECURITY,
  Department.CUSTOMER_EXP,
  Department.APRON_PBB,
  Department.AIRLINE_MARKETING
];

interface StrategicOverviewProps {
  userDept?: Department;
}

export const StrategicOverview: React.FC<StrategicOverviewProps> = ({ userDept }) => {
  const [showCebuConnects, setShowCebuConnects] = useState(false);
  const [showAccessDenied, setShowAccessDenied] = useState(false);

  const handleOpenCebuConnects = () => {
    if (userDept && CEBU_CONNECTS_ACCESS.includes(userDept)) {
      setShowCebuConnects(true);
    } else {
      setShowAccessDenied(true);
      setTimeout(() => setShowAccessDenied(false), 2000);
    }
  };

  return (
    <>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 relative">
      
      {/* ACCESS DENIED TOAST */}
      {showAccessDenied && (
         <div className="absolute top-0 left-1/2 -translate-x-1/2 z-50 bg-rose-600 text-white px-4 py-2 rounded-full shadow-xl animate-in fade-in slide-in-from-top-4 font-bold text-sm flex items-center gap-2">
            <Lock className="w-4 h-4" /> Access Restricted to Ops & AOCC
         </div>
      )}

      {/* 0. TERMINAL FLOW STATUS */}
      <div className="bg-slate-800 rounded-2xl border border-slate-700/50 p-5 shadow-lg flex flex-col justify-between">
          <h3 className="text-slate-400 font-bold text-xs uppercase mb-2">Terminal Flow Status</h3>
          <div className="flex justify-center gap-4 py-2">
             <div className="flex flex-col items-center gap-1">
                <div className="w-10 h-10 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50 flex items-center justify-center">
                   <CheckCircle2 className="w-6 h-6 text-emerald-900" />
                </div>
                <span className="text-[10px] font-bold text-emerald-400">T1: SMOOTH</span>
             </div>
             <div className="w-px bg-slate-700"></div>
             <div className="flex flex-col items-center gap-1">
                <div className="w-10 h-10 rounded-full bg-amber-500 shadow-lg shadow-amber-500/50 flex items-center justify-center">
                   <TrafficCone className="w-6 h-6 text-amber-900" />
                </div>
                <span className="text-[10px] font-bold text-amber-400">T2: CONGESTED</span>
             </div>
          </div>
      </div>

      {/* 1. CEBU CONNECTS (Transfer Hub) - CLICKABLE */}
      <div 
        onClick={handleOpenCebuConnects}
        className="bg-slate-800 rounded-2xl border border-slate-700/50 p-5 shadow-lg flex flex-col min-h-[140px] relative overflow-hidden group cursor-pointer hover:border-indigo-500/50 transition-all active:scale-[0.98]"
      >
        <div className="absolute -right-6 -top-6 w-20 h-20 bg-sky-500/10 rounded-full blur-xl group-hover:bg-sky-500/20 transition-all"></div>
        <div className="flex items-start justify-between mb-2 relative z-10">
          <div>
            <h3 className="text-white font-bold text-sm flex items-center gap-2">
              <ArrowRightLeft className="text-sky-400 w-4 h-4" />
              CEBU CONNECTS
            </h3>
            <p className="text-[10px] text-slate-400 mt-1">Transfer Efficiency (T1⇄T2)</p>
          </div>
          <div className="text-right">
            <span className="block text-xl font-black text-emerald-400">29m</span>
            <span className="text-[9px] text-emerald-500/80 font-bold uppercase">Target: 30m</span>
          </div>
        </div>
        
        <div className="flex-grow h-16 w-full relative z-10 pointer-events-none">
           <ResponsiveContainer width="100%" height="100%">
             <LineChart data={dataTransfer}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <Line type="monotone" dataKey="minutes" stroke="#38bdf8" strokeWidth={2} dot={false} />
             </LineChart>
           </ResponsiveContainer>
        </div>
        <div className="absolute inset-0 bg-indigo-500/0 group-hover:bg-indigo-500/5 transition-colors"></div>
        <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-indigo-300 font-bold">Click to Expand</div>
      </div>

      {/* 2. CEBU+ (Airport to Seaport) */}
      <div className="bg-slate-800 rounded-2xl border border-slate-700/50 p-5 shadow-lg flex flex-col min-h-[140px] relative overflow-hidden group">
        <div className="absolute -right-6 -top-6 w-20 h-20 bg-indigo-500/10 rounded-full blur-xl group-hover:bg-indigo-500/20 transition-all"></div>
        <div className="flex items-start justify-between mb-2 relative z-10">
          <div>
            <h3 className="text-white font-bold text-sm flex items-center gap-2">
              <Ship className="text-indigo-400 w-4 h-4" />
              CEBU+
            </h3>
            <p className="text-[10px] text-slate-400 mt-1">Gateway to Tourism</p>
          </div>
          <span className="text-[9px] text-emerald-400 font-bold bg-emerald-900/30 px-2 py-0.5 rounded border border-emerald-500/30">OPERATIONAL</span>
        </div>
        <div className="space-y-3 mt-2 relative z-10">
             <div className="flex justify-between text-[10px] text-slate-300">
               <span>Port Link (Ferry)</span>
               <span className="text-white font-bold">15 min away</span>
            </div>
            <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
               <div className="bg-indigo-500 h-full w-[85%]"></div>
            </div>
            <div className="text-[9px] text-slate-400 text-right flex justify-between">
                <span>Next Ferry:</span>
                <span className="text-indigo-300 font-bold">14:30 (Camotes)</span>
            </div>
        </div>
      </div>

      {/* 3. CEB-BALIK (OFW Focus) */}
      <div className="bg-slate-800 rounded-2xl border border-slate-700/50 p-5 shadow-lg flex flex-col min-h-[140px] relative overflow-hidden group">
        <div className="absolute -right-6 -top-6 w-20 h-20 bg-amber-500/10 rounded-full blur-xl group-hover:bg-amber-500/20 transition-all"></div>
        <div className="flex items-start justify-between mb-2 relative z-10">
          <div>
            <h3 className="text-white font-bold text-sm flex items-center gap-2">
              <Briefcase className="text-amber-400 w-4 h-4" />
              CEB-BALIK
            </h3>
            <p className="text-[10px] text-slate-400 mt-1">Balik-Bayani Hub</p>
          </div>
          <div className="text-right">
             <span className="block text-xl font-black text-white">3.5%</span>
             <span className="text-[9px] text-slate-500 uppercase">of Total Pax</span>
          </div>
        </div>
        <div className="flex-grow h-16 w-full relative z-10">
             <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dataOFW}>
                   <Bar dataKey="pax" fill="#fbbf24" radius={[2, 2, 0, 0]} />
                </BarChart>
             </ResponsiveContainer>
        </div>
      </div>
    </div>

    {/* OVERLAY DASHBOARD */}
    {showCebuConnects && (
      <CebuConnectsDashboard onClose={() => setShowCebuConnects(false)} />
    )}
    </>
  );
};

import React from 'react';
import { 
  ArrowRightLeft, 
  Ship, 
  Briefcase, 
  TrafficCone,
  AlertOctagon,
  CheckCircle2
} from 'lucide-react';
import { BarChart, Bar, ResponsiveContainer, LineChart, Line, CartesianGrid, Tooltip } from 'recharts';

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

export const StrategicOverview: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      
      {/* BUTTON 2: QUICK STATUS TRAFFIC LIGHT */}
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

      {/* 1. Cebu Connects */}
      <div className="bg-slate-800 rounded-2xl border border-slate-700/50 p-5 shadow-lg flex flex-col min-h-[140px]">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="text-slate-200 font-bold text-sm flex items-center gap-2">
              <ArrowRightLeft className="text-sky-400 w-4 h-4" />
              Connects
            </h3>
          </div>
          <div className="text-right">
            <span className="block text-lg font-bold text-emerald-400">29m</span>
          </div>
        </div>
        
        <div className="flex-grow h-16 w-full">
           <ResponsiveContainer width="100%" height="100%">
             <LineChart data={dataTransfer}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <Line type="monotone" dataKey="minutes" stroke="#38bdf8" strokeWidth={2} dot={false} />
             </LineChart>
           </ResponsiveContainer>
        </div>
      </div>

      {/* 2. Cebu+ */}
      <div className="bg-slate-800 rounded-2xl border border-slate-700/50 p-5 shadow-lg flex flex-col min-h-[140px]">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="text-slate-200 font-bold text-sm flex items-center gap-2">
              <Ship className="text-indigo-400 w-4 h-4" />
              Cebu+
            </h3>
          </div>
          <span className="text-[10px] text-emerald-400 font-bold bg-emerald-900/30 px-2 py-0.5 rounded">OPTIMAL</span>
        </div>
        <div className="space-y-2 mt-2">
             <div className="flex justify-between text-[10px] text-slate-300">
               <span>Port Link</span>
               <span>15 min</span>
            </div>
            <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
               <div className="bg-indigo-500 h-full w-[85%]"></div>
            </div>
            <div className="text-[9px] text-slate-500 text-right">Next Ferry: 14:30</div>
        </div>
      </div>

      {/* 3. CEB-Balik */}
      <div className="bg-slate-800 rounded-2xl border border-slate-700/50 p-5 shadow-lg flex flex-col min-h-[140px]">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="text-slate-200 font-bold text-sm flex items-center gap-2">
              <Briefcase className="text-amber-400 w-4 h-4" />
              Balik
            </h3>
          </div>
          <span className="text-lg font-bold text-white">3.5%</span>
        </div>
        <div className="flex-grow h-16 w-full">
             <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dataOFW}>
                   <Bar dataKey="pax" fill="#fbbf24" radius={[2, 2, 0, 0]} />
                </BarChart>
             </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

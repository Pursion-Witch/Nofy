
import React, { useState } from 'react';
import { 
  Phone, Shield, HeartPulse, Sparkles, RadioTower, Search, 
  Siren, Flame, Stethoscope, Anchor, Truck, CloudRain, 
  AlertTriangle, FileText, Thermometer, Building2,
  Mail, Globe, Facebook, Video, MessageSquare, Send, X, MoreHorizontal, Mic
} from 'lucide-react';
import { Department, LogEntry, IncidentSeverity, Terminal } from '../types';

interface DirectoryProps {
  onLogCall: (log: LogEntry) => void;
  currentTerminal: Terminal;
}

// Data Structure with Socials & Contact Info
const EXTERNAL_AGENCIES = [
  { 
    name: 'Bureau of Customs', 
    icon: <FileText className="w-4 h-4 text-amber-400" />, 
    phone: 'Local 2209',
    email: 'mactan@customs.gov.ph',
    website: 'customs.gov.ph',
    facebook: 'BureauOfCustomsPH'
  },
  { 
    name: 'Bureau of Immigration', 
    icon: <FileText className="w-4 h-4 text-indigo-400" />, 
    phone: 'Local 2210',
    email: 'xinfo@immigration.gov.ph',
    website: 'immigration.gov.ph',
    facebook: 'officialbureauofimmigration'
  },
  { 
    name: 'Bureau of Quarantine', 
    icon: <Thermometer className="w-4 h-4 text-rose-400" />, 
    phone: 'Local 2215',
    email: 'boq.cebu@doh.gov.ph',
    website: 'quarantine.doh.gov.ph',
    facebook: 'BureauofQuarantine'
  },
  { 
    name: 'Department of Health (DOH)', 
    icon: <Stethoscope className="w-4 h-4 text-emerald-400" />, 
    phone: '1555',
    email: 'doh.region7@doh.gov.ph',
    website: 'doh.gov.ph',
    facebook: 'DOHgovph',
    tiktok: 'dohgovph'
  },
  { 
    name: 'Mactan Fire Department (BFP)', 
    icon: <Flame className="w-4 h-4 text-orange-500" />, 
    phone: '160',
    facebook: 'bfpregion7'
  },
  { 
    name: 'Mactan Island Traffic Management', 
    icon: <Truck className="w-4 h-4 text-slate-400" />, 
    phone: '(032) 340-0000',
    facebook: 'lapulaputraffic'
  },
  { 
    name: 'Mactan Police Force (PNP)', 
    icon: <Siren className="w-4 h-4 text-blue-500" />, 
    phone: '166',
    facebook: 'pnp.lapulapu',
    tiktok: 'pnp_goodvibes'
  },
  { 
    name: 'NDRRMC (Disaster Response)', 
    icon: <AlertTriangle className="w-4 h-4 text-red-500" />, 
    phone: '911',
    website: 'ndrrmc.gov.ph',
    facebook: 'NDRRMC',
    twitter: 'NDRRMC_OpCen'
  },
  { 
    name: 'OTS (Office of Trans Security)', 
    icon: <Shield className="w-4 h-4 text-sky-400" />, 
    phone: 'Local 2280',
    email: 'pio@ots.gov.ph',
    website: 'ots.gov.ph',
    facebook: 'ots_dotr'
  },
  { 
    name: 'PAGASA Weather Stn', 
    icon: <CloudRain className="w-4 h-4 text-blue-300" />, 
    phone: '(032) 340-1234',
    website: 'bagong.pagasa.dost.gov.ph',
    facebook: 'PAGASA.DOST.GOV.PH'
  },
  { 
    name: 'Philippine Coast Guard', 
    icon: <Anchor className="w-4 h-4 text-cyan-400" />, 
    phone: '(032) 232-1234',
    website: 'coastguard.gov.ph',
    facebook: 'coastguardph',
    tiktok: 'coastguardph'
  },
].sort((a, b) => a.name.localeCompare(b.name));

export const Directory: React.FC<DirectoryProps> = ({ onLogCall, currentTerminal }) => {
  const [lastCall, setLastCall] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Widget State
  const [expandedAgency, setExpandedAgency] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');

  const handleCall = (deptName: string, deptEnum?: Department) => {
    // 1. Simulate "Call"
    setLastCall(`Calling ${deptName}...`);
    setExpandedAgency(null); // Close widget
    
    // 2. Auto-log the call
    const log: LogEntry = {
      id: Date.now().toString(),
      timestamp: new Date(),
      message: `[OUTBOUND CALL] Voice call initiated to ${deptName}.`,
      category: 'CALL_LOG',
      severity: IncidentSeverity.LOW,
      originDept: Department.TERMINAL_OPS,
      targetDept: deptEnum ? [deptEnum] : [],
      agenciesInvolved: [],
      terminal: currentTerminal
    };
    onLogCall(log);

    // 3. Clear status
    setTimeout(() => setLastCall(null), 3000);
  };

  const handleSendMessage = (deptName: string) => {
    if (!messageInput.trim()) return;

    // 1. Simulate Sending
    setLastCall(`Message sent to ${deptName}`);
    setExpandedAgency(null);
    setMessageInput('');

    // 2. Log
    const log: LogEntry = {
        id: Date.now().toString(),
        timestamp: new Date(),
        message: `[DIGITAL DISPATCH] To ${deptName}: "${messageInput}"`,
        category: 'OPERATIONAL',
        severity: IncidentSeverity.LOW,
        originDept: Department.TERMINAL_OPS,
        targetDept: [],
        agenciesInvolved: [],
        terminal: currentTerminal
    };
    onLogCall(log);
    setTimeout(() => setLastCall(null), 3000);
  };

  const filteredAgencies = EXTERNAL_AGENCIES.filter(agency => 
    agency.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
      
      {/* SECTION 1: INTERNAL SPEED DIAL */}
      <div>
         <h2 className="text-xl font-bold text-slate-200 mb-4 px-2 flex items-center gap-2">
            <Phone className="w-5 h-5 text-indigo-400" />
            Internal Speed Dial
         </h2>
         
         {lastCall && (
            <div className="mb-4 bg-emerald-500/20 text-emerald-300 p-3 rounded-xl border border-emerald-500/50 text-center font-bold animate-pulse">
               {lastCall}
            </div>
         )}

         <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <button 
              onClick={() => handleCall('Medical / First Response', Department.SAFETY_QUALITY)}
              className="p-4 bg-rose-900/20 border border-rose-800 hover:bg-rose-900/40 rounded-xl flex flex-col items-center gap-2 transition-all active:scale-95 group"
            >
               <div className="w-10 h-10 rounded-full bg-rose-600 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                  <HeartPulse className="w-6 h-6" />
               </div>
               <div className="text-center">
                   <span className="block text-sm font-bold text-rose-200">Medical Emergency</span>
                   <span className="text-[10px] text-rose-400">Loc: 8891</span>
               </div>
            </button>

            <button 
              onClick={() => handleCall('Security Command', Department.SECURITY)}
              className="p-4 bg-slate-800 border border-slate-700 hover:bg-slate-700 rounded-xl flex flex-col items-center gap-2 transition-all active:scale-95 group"
            >
               <div className="w-10 h-10 rounded-full bg-slate-600 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                  <Shield className="w-6 h-6" />
               </div>
               <div className="text-center">
                   <span className="block text-sm font-bold text-slate-200">Security / PNP</span>
                   <span className="text-[10px] text-slate-400">Loc: 1102</span>
               </div>
            </button>

            <button 
              onClick={() => handleCall('AOCC Control', Department.AOCC)}
              className="p-4 bg-amber-900/20 border border-amber-800 hover:bg-amber-900/40 rounded-xl flex flex-col items-center gap-2 transition-all active:scale-95 group"
            >
               <div className="w-10 h-10 rounded-full bg-amber-600 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                  <RadioTower className="w-6 h-6" />
               </div>
               <div className="text-center">
                   <span className="block text-sm font-bold text-amber-200">Ops Control (AOCC)</span>
                   <span className="text-[10px] text-amber-400">Loc: 5500</span>
               </div>
            </button>

            <button 
              onClick={() => handleCall('Janitorial Supervisor', Department.SAFETY_QUALITY)}
              className="p-4 bg-sky-900/20 border border-sky-800 hover:bg-sky-900/40 rounded-xl flex flex-col items-center gap-2 transition-all active:scale-95 group"
            >
               <div className="w-10 h-10 rounded-full bg-sky-600 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                  <Sparkles className="w-6 h-6" />
               </div>
               <div className="text-center">
                   <span className="block text-sm font-bold text-sky-200">Clean Up / Facilities</span>
                   <span className="text-[10px] text-sky-400">Mobile: 0917...</span>
               </div>
            </button>
         </div>
      </div>

      {/* SECTION 2: EXTERNAL AGENCIES */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-lg">
         {/* Search Header */}
         <div className="p-4 bg-slate-900 border-b border-slate-700">
            <h3 className="text-xs font-bold text-slate-400 uppercase mb-3 flex items-center gap-2">
                <Building2 className="w-4 h-4" /> External Agency Directory
            </h3>
            <div className="relative">
                <input 
                  type="text" 
                  placeholder="Search agencies..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-white text-sm rounded-lg pl-9 pr-4 py-2 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                />
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
            </div>
         </div>

         {/* List */}
         <div className="divide-y divide-slate-700 max-h-[420px] overflow-y-auto custom-scrollbar">
            {filteredAgencies.length === 0 ? (
                <div className="p-8 text-center text-slate-500 italic text-sm">
                    No agencies found matching "{searchQuery}"
                </div>
            ) : (
                filteredAgencies.map((agency, i) => (
                   <div key={i} className={`flex flex-col transition-all ${expandedAgency === agency.name ? 'bg-slate-700/40' : 'hover:bg-slate-700/30'}`}>
                      
                      {/* Agency Header Row */}
                      <div className="p-4 flex justify-between items-start">
                         <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-slate-800 rounded-xl border border-slate-700 shadow-sm">
                               {agency.icon}
                            </div>
                            <div>
                               <div className="text-sm font-bold text-slate-200">{agency.name}</div>
                               <div className="text-xs text-slate-500 font-mono flex items-center gap-1.5 mt-0.5">
                                   <Phone className="w-3 h-3" /> {agency.phone}
                               </div>
                            </div>
                         </div>
                         
                         {/* Toggle Widget Button */}
                         <button 
                           onClick={() => setExpandedAgency(expandedAgency === agency.name ? null : agency.name)}
                           className={`p-2 rounded-lg transition-all flex items-center gap-2 text-xs font-bold ${
                              expandedAgency === agency.name 
                              ? 'bg-slate-600 text-white shadow-inner' 
                              : 'bg-slate-700 text-slate-300 hover:text-white hover:bg-indigo-600'
                           }`}
                        >
                            {expandedAgency === agency.name ? (
                                <><X className="w-4 h-4" /> Close</>
                            ) : (
                                <><MoreHorizontal className="w-4 h-4" /> Connect</>
                            )}
                         </button>
                      </div>

                      {/* CONTACT INFO STRIP (Always Visible if present) */}
                      {(agency.email || agency.website || agency.facebook || (agency as any).tiktok) && !expandedAgency && (
                          <div className="px-4 pb-4 pl-[66px] flex flex-wrap gap-2">
                              {agency.email && <div className="p-1 rounded bg-slate-800/50 border border-slate-700/50"><Mail className="w-3 h-3 text-slate-500" /></div>}
                              {agency.website && <div className="p-1 rounded bg-slate-800/50 border border-slate-700/50"><Globe className="w-3 h-3 text-slate-500" /></div>}
                              {agency.facebook && <div className="p-1 rounded bg-slate-800/50 border border-slate-700/50"><Facebook className="w-3 h-3 text-slate-500" /></div>}
                              {(agency as any).tiktok && <div className="p-1 rounded bg-slate-800/50 border border-slate-700/50"><Video className="w-3 h-3 text-slate-500" /></div>}
                          </div>
                      )}

                      {/* EXPANDABLE WIDGET */}
                      {expandedAgency === agency.name && (
                         <div className="mx-4 mb-4 p-4 bg-slate-800 rounded-xl border border-slate-600 shadow-2xl animate-in zoom-in-95 origin-top">
                            <div className="flex justify-between items-center mb-4">
                               <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-2">
                                  <RadioTower className="w-3 h-3" /> Comm Center
                               </h4>
                               <div className="text-[10px] text-slate-500">Secure Line</div>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                               {/* Option A: Voice Call */}
                               <button 
                                  onClick={() => handleCall(agency.name)}
                                  className="flex items-center justify-center gap-3 w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-all shadow-lg active:scale-[0.98]"
                               >
                                  <div className="p-1 bg-emerald-700/50 rounded-full"><Phone className="w-4 h-4" /></div>
                                  <span>Voice Call ({agency.phone})</span>
                               </button>
                               
                               {/* Option B: Message Widget */}
                               <div className="bg-slate-900 rounded-xl p-1 border border-slate-700 flex items-center">
                                  <div className="pl-3 pr-2 text-slate-500">
                                     <MessageSquare className="w-4 h-4" />
                                  </div>
                                  <input 
                                     type="text" 
                                     placeholder={`Message ${agency.name}...`}
                                     value={messageInput}
                                     onChange={(e) => setMessageInput(e.target.value)}
                                     className="flex-grow bg-transparent text-sm text-white py-2 focus:outline-none"
                                     onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(agency.name)}
                                  />
                                  <button 
                                     onClick={() => handleSendMessage(agency.name)}
                                     disabled={!messageInput.trim()}
                                     className="p-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg m-1 transition-colors"
                                  >
                                     <Send className="w-4 h-4" />
                                  </button>
                               </div>
                            </div>

                            {/* Social Links Expanded */}
                            <div className="mt-4 pt-4 border-t border-slate-700 flex gap-3 justify-center">
                               {agency.email && (
                                  <a href={`mailto:${agency.email}`} className="text-slate-400 hover:text-white flex flex-col items-center gap-1">
                                     <Mail className="w-4 h-4" /> <span className="text-[9px]">Email</span>
                                  </a>
                               )}
                               {agency.facebook && (
                                  <a href={`https://facebook.com/${agency.facebook}`} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-blue-400 flex flex-col items-center gap-1">
                                     <Facebook className="w-4 h-4" /> <span className="text-[9px]">FB</span>
                                  </a>
                               )}
                               {agency.website && (
                                  <a href={`https://${agency.website}`} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-emerald-400 flex flex-col items-center gap-1">
                                     <Globe className="w-4 h-4" /> <span className="text-[9px]">Web</span>
                                  </a>
                               )}
                            </div>
                         </div>
                      )}

                   </div>
                ))
            )}
         </div>
      </div>
    </div>
  );
};

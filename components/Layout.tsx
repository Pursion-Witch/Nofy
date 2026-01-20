import React, { useState, useEffect } from 'react';
import { LogOut, Plane, RadioTower, Menu, X, User, Search, AlertTriangle, Lock, Users, ChevronDown, BellRing, Activity, Clock, Coffee, Shield, MessageSquare, Presentation } from 'lucide-react';
import { UserProfile, ChatMessage, Terminal, LogEntry, IncidentSeverity, ChatChannel } from '../types';
import { StaffRoster } from './StaffRoster';
import { ChatInterface } from './ChatInterface';
import { PitchMode } from './PitchMode';

interface LayoutProps {
  children: React.ReactNode;
  user: UserProfile;
  currentTerminal: Terminal;
  onTerminalChange: (t: Terminal) => void;
  onLogout: () => void;
  // Chat Props
  chatChannels: ChatChannel[];
  chatMessages: ChatMessage[];
  onSendMessage: (channelId: string, content: string) => void;
  onCreateChannel: (name: string, participants: string[], type: 'DIRECT' | 'GROUP') => void;
  mockUsers: UserProfile[];
  onStatusChange?: (status: string) => void; 
  latestCriticalLog?: LogEntry | null; 
  isTourActive?: boolean; 
}

const NofyLogo = () => (
  <div className="flex items-center gap-1 select-none">
    <div className="flex items-end">
       <span className="text-2xl font-black text-white tracking-wide">NOF</span>
       <div className="relative mx-0.5">
         <span className="text-3xl font-black text-indigo-400 leading-none">Y</span>
         <RadioTower className="absolute -top-2 -left-2 w-4 h-4 text-sky-500 fill-sky-900/40 transform -rotate-12" strokeWidth={2.5} />
         <Plane className="absolute -top-2 -right-2 w-4 h-4 text-rose-500 fill-rose-900/40 transform -rotate-12" strokeWidth={2.5} />
       </div>
    </div>
  </div>
);

export const Layout: React.FC<LayoutProps> = ({ 
  children, user, currentTerminal, onTerminalChange, onLogout, 
  chatChannels, chatMessages, onSendMessage, onCreateChannel, mockUsers, 
  onStatusChange, latestCriticalLog, isTourActive
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [menuTab, setMenuTab] = useState<'PROFILE' | 'ROSTER'>('PROFILE');
  const [alertsExpanded, setAlertsExpanded] = useState(false);
  const [showCriticalPopup, setShowCriticalPopup] = useState(false);
  const [showFullChat, setShowFullChat] = useState(false);
  const [showPitchMode, setShowPitchMode] = useState(false);

  const canSwitchTerminal = user.allowedTerminals.length > 1;
  const unreadCount = chatChannels.reduce((acc, ch) => acc + (ch.unreadCount || 0), 0);

  useEffect(() => {
    if (latestCriticalLog && !isTourActive) {
      setShowCriticalPopup(true);
      const timer = setTimeout(() => setShowCriticalPopup(false), 8000);
      return () => clearTimeout(timer);
    }
  }, [latestCriticalLog, isTourActive]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 font-sans overflow-x-hidden">
      
      {/* PITCH MODE OVERLAY */}
      {showPitchMode && <PitchMode onClose={() => setShowPitchMode(false)} />}

      {/* CRITICAL INCIDENT POPUP */}
      {showCriticalPopup && latestCriticalLog && !isTourActive && (
        <div className="fixed inset-x-0 top-0 h-[50vh] z-[100] bg-rose-950/95 backdrop-blur-md border-b-4 border-rose-500 shadow-2xl animate-in slide-in-from-top duration-500 flex flex-col items-center justify-center p-6 text-center">
            <div className="w-20 h-20 rounded-full bg-rose-600 animate-pulse flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(225,29,72,0.6)]">
               <AlertTriangle className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-white uppercase tracking-widest mb-2">
               {latestCriticalLog.severity} ALERT
            </h1>
            <p className="text-xl md:text-2xl text-rose-200 font-bold max-w-3xl">
               {latestCriticalLog.message}
            </p>
            <div className="mt-8 flex gap-4">
               <button 
                 onClick={() => setShowCriticalPopup(false)}
                 className="px-8 py-3 bg-white text-rose-900 font-black rounded-full hover:bg-rose-100 transition-colors"
               >
                  ACKNOWLEDGE
               </button>
            </div>
        </div>
      )}

      {/* FULL SCREEN CHAT OVERLAY */}
      {showFullChat && (
        <ChatInterface 
          currentUser={user}
          channels={chatChannels}
          messages={chatMessages}
          onSendMessage={onSendMessage}
          onCreateChannel={onCreateChannel}
          onClose={() => setShowFullChat(false)}
          allUsers={mockUsers}
        />
      )}

      {/* HEADER BAR */}
      <div className="sticky top-0 z-50 bg-slate-900 shadow-xl">
        <div className={`border-b border-slate-800 relative transition-all duration-300 bg-slate-950 ${alertsExpanded ? 'h-auto py-4' : 'h-8 py-1 overflow-hidden'}`}>
           <div className="max-w-7xl mx-auto px-4 flex justify-between items-start">
              <div className={`flex-grow ${alertsExpanded ? '' : 'overflow-hidden'}`}>
                 {alertsExpanded ? (
                    <div className="space-y-3">
                       <div className="text-xs font-bold text-slate-500 uppercase mb-2">Active Alerts</div>
                       <div className="flex items-center gap-2 text-amber-500 text-xs font-bold bg-amber-900/10 p-2 rounded border border-amber-900/30">
                          <AlertTriangle className="w-4 h-4 animate-pulse" /> 
                          AOCC: 5J-556 DELAYED (TECH)
                       </div>
                       <div className="flex items-center gap-2 text-rose-500 text-xs font-bold bg-rose-900/10 p-2 rounded border border-rose-900/30">
                          <AlertTriangle className="w-4 h-4" /> 
                          URGENT: UV REPORTED @ T2 ISLAND B
                       </div>
                       <div className="flex items-center gap-2 text-sky-400 text-xs font-bold bg-sky-900/10 p-2 rounded border border-sky-900/30">
                          <RadioTower className="w-4 h-4" /> 
                          GATE CHANGE: PR-1845 TO GATE 6
                       </div>
                    </div>
                 ) : (
                    <div className="whitespace-nowrap animate-marquee flex items-center gap-8 text-[11px] font-bold uppercase tracking-widest">
                       <span className="flex items-center gap-2 text-amber-500">
                          <AlertTriangle className="w-3 h-3 animate-pulse" /> 
                          AOCC: 5J-556 DELAYED (TECH)
                       </span>
                       <span className="flex items-center gap-2 text-rose-500 animate-pulse">
                          <AlertTriangle className="w-3 h-3" /> 
                          URGENT: UV REPORTED @ T2 ISLAND B
                       </span>
                       <span className="flex items-center gap-2 text-sky-400">
                          <RadioTower className="w-3 h-3" /> 
                          GATE CHANGE: PR-1845 TO GATE 6
                       </span>
                       <span className="flex items-center gap-2 text-slate-400">
                          WEATHER: LIGHT RAIN - APRON SLIPPERY
                       </span>
                    </div>
                 )}
              </div>
              <button onClick={() => setAlertsExpanded(!alertsExpanded)} className="ml-4 p-1 hover:bg-slate-800 rounded text-slate-400">
                 <ChevronDown className={`w-4 h-4 transition-transform ${alertsExpanded ? 'rotate-180' : ''}`} />
              </button>
           </div>
        </div>

        <header className="bg-slate-900 border-b border-slate-800 px-4 py-3">
          <div className="max-w-md md:max-w-7xl mx-auto flex justify-between items-center">
            <NofyLogo />
            <div className="flex items-center gap-3">
               <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-800 rounded-full border border-slate-700 hidden md:flex">
                  <div className={`w-3 h-3 rounded-full shadow-lg ${currentTerminal === Terminal.T1 ? 'bg-emerald-500 shadow-emerald-500/50' : 'bg-slate-700 opacity-30'}`}></div>
                  <div className={`w-3 h-3 rounded-full shadow-lg ${currentTerminal === Terminal.T2 ? 'bg-amber-500 shadow-amber-500/50' : 'bg-slate-700 opacity-30'}`}></div>
               </div>
               {canSwitchTerminal ? (
                 <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700">
                    <button onClick={() => onTerminalChange(Terminal.T1)} className={`px-3 py-1.5 rounded-md text-[10px] font-bold transition-all ${currentTerminal === Terminal.T1 ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>T1</button>
                    <button onClick={() => onTerminalChange(Terminal.T2)} className={`px-3 py-1.5 rounded-md text-[10px] font-bold transition-all ${currentTerminal === Terminal.T2 ? 'bg-amber-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>T2</button>
                 </div>
               ) : (
                 <div className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 rounded-lg border border-slate-700">
                    <Lock className="w-3 h-3 text-slate-500" />
                    <span className={`text-[10px] font-bold ${currentTerminal === Terminal.T1 ? 'text-emerald-400' : 'text-amber-400'}`}>{currentTerminal === Terminal.T1 ? 'DOMESTIC (T1)' : 'INTL (T2)'}</span>
                 </div>
               )}
               <div className="w-px h-6 bg-slate-800 mx-1"></div>
               <button id="header-chat" onClick={() => setShowFullChat(true)} className="relative p-2 hover:bg-indigo-900/30 rounded-full transition-colors group" title="Team Chat">
                  <MessageSquare className="w-5 h-5 text-indigo-400 group-hover:text-indigo-300" />
                  {unreadCount > 0 && <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 text-white text-[8px] flex items-center justify-center rounded-full border border-slate-900"></span>}
               </button>
               <button onClick={() => { setMenuTab('PROFILE'); setIsMenuOpen(true); }} className="p-2 hover:bg-slate-800 rounded-full transition-colors">
                  <Menu className="w-5 h-5 text-slate-300" />
               </button>
            </div>
          </div>
        </header>
      </div>

      <main className="max-w-md md:max-w-7xl mx-auto px-4 py-4 mb-20 transition-all">
        {children}
      </main>

      {isMenuOpen && (
        <div className="fixed inset-0 z-[60] flex justify-end">
           <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setIsMenuOpen(false)}></div>
           <div className="relative w-[85%] max-w-sm bg-slate-900 h-full shadow-2xl border-l border-slate-800 animate-in slide-in-from-right duration-300 flex flex-col">
              <div className="flex items-center justify-between p-4 border-b border-slate-800">
                 <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <User className="w-5 h-5 text-indigo-400" /> NOFY Network
                 </h2>
                 <button onClick={() => setIsMenuOpen(false)} className="p-1 hover:bg-slate-800 rounded-full"><X className="w-5 h-5 text-slate-400" /></button>
              </div>
              <div className="flex border-b border-slate-800">
                 <button onClick={() => setMenuTab('PROFILE')} className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider ${menuTab === 'PROFILE' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-slate-500 hover:text-slate-300'}`}>Profile</button>
                 <button onClick={() => setMenuTab('ROSTER')} className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider ${menuTab === 'ROSTER' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-slate-500 hover:text-slate-300'}`}>Team</button>
              </div>
              <div className="flex-grow overflow-hidden bg-slate-900">
                 {menuTab === 'PROFILE' && (
                    <div className="h-full overflow-y-auto p-6 space-y-6 custom-scrollbar">
                       <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 text-center relative overflow-hidden">
                          <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-b from-indigo-900/50 to-transparent"></div>
                          <div className="relative z-10">
                             <div className="w-20 h-20 mx-auto rounded-full bg-slate-700 border-4 border-slate-800 flex items-center justify-center text-2xl font-bold text-indigo-300 mb-3 shadow-lg">{user.name.charAt(0)}</div>
                             <h3 className="text-xl font-bold text-white">{user.name}</h3>
                             <p className="text-indigo-300 font-medium text-sm mb-3">{user.role}</p>
                             <div className="grid grid-cols-2 gap-2 mb-3">
                                {['ONLINE', 'BUSY', 'BREAK', 'OFFLINE'].map((status) => (
                                   <button key={status} onClick={() => onStatusChange && onStatusChange(status)} className={`px-2 py-1.5 rounded-lg text-[10px] font-bold border transition-all flex items-center justify-center gap-1 ${user.status === status ? (status === 'ONLINE' ? 'bg-emerald-600 border-emerald-500 text-white' : status === 'BUSY' ? 'bg-amber-600 border-amber-500 text-white' : status === 'BREAK' ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-600 border-slate-500 text-white') : 'bg-slate-900 border-slate-700 text-slate-400 hover:bg-slate-800'}`}>
                                      {status === 'ONLINE' && <Activity className="w-3 h-3" />}
                                      {status === 'BUSY' && <AlertTriangle className="w-3 h-3" />}
                                      {status === 'BREAK' && <Coffee className="w-3 h-3" />}
                                      {status === 'OFFLINE' && <LogOut className="w-3 h-3" />}
                                      {status}
                                   </button>
                                ))}
                             </div>
                             <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-600 text-[10px] text-slate-400"><RadioTower className="w-3 h-3" />{user.department.replace('_', ' ')}</div>
                          </div>
                          <button onClick={onLogout} className="mt-6 w-full py-2 bg-rose-900/20 hover:bg-rose-900/40 text-rose-300 text-xs font-bold rounded-lg border border-rose-900/50 flex items-center justify-center gap-2 transition-colors"><LogOut className="w-3 h-3" /> End Shift</button>
                       </div>

                       {/* PITCH MODE TRIGGER */}
                       <button 
                          onClick={() => {
                              setShowPitchMode(true);
                              setIsMenuOpen(false);
                          }}
                          className="w-full py-3 bg-gradient-to-r from-purple-900/40 to-indigo-900/40 border border-purple-500/30 rounded-xl flex items-center justify-center gap-2 text-purple-300 font-bold hover:brightness-110 transition-all group"
                       >
                          <Presentation className="w-5 h-5 group-hover:scale-110 transition-transform" />
                          Launch Pitch Script
                       </button>

                       <div>
                          <h4 className="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center gap-2"><Search className="w-3 h-3" /> Department Directory</h4>
                          <div className="space-y-2">
                             {mockUsers.filter(u => u.id !== user.id).map(u => (
                                <div key={u.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
                                   <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-300">{u.name.charAt(0)}</div>
                                   <div>
                                      <div className="text-sm font-bold text-slate-200">{u.name}</div>
                                      <div className="text-[10px] text-slate-500">{u.role} • {u.department.split('_')[0]}</div>
                                   </div>
                                   <div className={`ml-auto w-2 h-2 rounded-full ${u.status === 'ONLINE' ? 'bg-emerald-500' : u.status === 'BUSY' ? 'bg-amber-500' : 'bg-slate-600'}`}></div>
                                </div>
                             ))}
                          </div>
                       </div>
                    </div>
                 )}
                 {menuTab === 'ROSTER' && <StaffRoster currentUser={user} allUsers={mockUsers} />}
              </div>
           </div>
        </div>
      )}
      <style>{`@keyframes marquee { 0% { transform: translateX(100%); } 100% { transform: translateX(-100%); } } .animate-marquee { animation: marquee 20s linear infinite; }`}</style>
    </div>
  );
};

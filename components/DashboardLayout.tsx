import React, { useState } from 'react';
import { LogOut, Plane, RadioTower, Menu, X, User, Search, AlertTriangle, Lock } from 'lucide-react';
import { UserProfile, ChatMessage, Terminal } from '../types';
import { DirectChat } from './DirectChat';

interface DashboardLayoutProps {
  children: React.ReactNode;
  user: UserProfile;
  currentTerminal: Terminal;
  onTerminalChange: (t: Terminal) => void;
  onLogout: () => void;
  // Chat Props
  chatMessages: ChatMessage[];
  onSendMessage: (content: string) => void;
  mockUsers: UserProfile[];
}

const NofyLogo = () => (
  <div className="flex items-center gap-1 select-none">
    <div className="flex items-end">
       <span className="text-2xl font-black text-white tracking-wide">NOF</span>
       <div className="relative mx-0.5">
         <span className="text-3xl font-black text-indigo-400 leading-none">Y</span>
         {/* Tower: Blue */}
         <RadioTower className="absolute -top-2 -left-2 w-4 h-4 text-sky-500 fill-sky-900/40 transform -rotate-12" strokeWidth={2.5} />
         {/* Plane: Red */}
         <Plane className="absolute -top-2 -right-2 w-4 h-4 text-rose-500 fill-rose-900/40 transform -rotate-12" strokeWidth={2.5} />
       </div>
    </div>
  </div>
);

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, user, currentTerminal, onTerminalChange, onLogout, chatMessages, onSendMessage, mockUsers }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [menuTab, setMenuTab] = useState<'PROFILE' | 'CHAT'>('PROFILE');

  const canSwitchTerminal = user.allowedTerminals.length > 1;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 font-sans overflow-x-hidden">
      
      {/* BUTTON 2: DASHBOARD - Unified Command Feed / Silent Airport Ticker */}
      <div className="bg-slate-950 border-b border-slate-800 overflow-hidden py-1 relative shadow-inner">
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
      </div>

      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 px-4 py-3 sticky top-0 z-30 shadow-md">
        <div className="max-w-md md:max-w-7xl mx-auto flex justify-between items-center">
          <NofyLogo />
          
          <div className="flex items-center gap-3">
             {/* BUTTON 2: Traffic Light Status for Terminal */}
             <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-800 rounded-full border border-slate-700">
                <div className={`w-3 h-3 rounded-full shadow-lg ${currentTerminal === Terminal.T1 ? 'bg-emerald-500 shadow-emerald-500/50' : 'bg-slate-700 opacity-30'}`}></div>
                <div className={`w-3 h-3 rounded-full shadow-lg ${currentTerminal === Terminal.T2 ? 'bg-amber-500 shadow-amber-500/50' : 'bg-slate-700 opacity-30'}`}></div>
             </div>

             {/* BUTTON 4: Terminal Filter Toggle */}
             {canSwitchTerminal ? (
               <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700">
                  <button 
                    onClick={() => onTerminalChange(Terminal.T1)}
                    className={`px-3 py-1.5 rounded-md text-[10px] font-bold transition-all ${
                      currentTerminal === Terminal.T1 ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    T1
                  </button>
                  <button 
                    onClick={() => onTerminalChange(Terminal.T2)}
                    className={`px-3 py-1.5 rounded-md text-[10px] font-bold transition-all ${
                      currentTerminal === Terminal.T2 ? 'bg-amber-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    T2
                  </button>
               </div>
             ) : (
               <div className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 rounded-lg border border-slate-700">
                  <Lock className="w-3 h-3 text-slate-500" />
                  <span className={`text-[10px] font-bold ${currentTerminal === Terminal.T1 ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {currentTerminal === Terminal.T1 ? 'DOMESTIC (T1)' : 'INTL (T2)'}
                  </span>
               </div>
             )}

             {/* Menu Toggle */}
             <button 
                onClick={() => setIsMenuOpen(true)}
                className="relative p-2 hover:bg-slate-800 rounded-full transition-colors"
             >
                <Menu className="w-5 h-5 text-slate-300" />
                {chatMessages.filter(m => !m.isRead && m.senderId !== user.id).length > 0 && (
                   <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border border-slate-900"></span>
                )}
             </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md md:max-w-7xl mx-auto px-4 py-4 mb-20 transition-all">
        {children}
      </main>

      {/* Right Side Drawer / Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
           {/* Backdrop */}
           <div 
             className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
             onClick={() => setIsMenuOpen(false)}
           ></div>

           {/* Drawer Content */}
           <div className="relative w-[85%] max-w-sm bg-slate-900 h-full shadow-2xl border-l border-slate-800 animate-in slide-in-from-right duration-300 flex flex-col">
              
              {/* Drawer Header */}
              <div className="flex items-center justify-between p-4 border-b border-slate-800">
                 <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <User className="w-5 h-5 text-indigo-400" />
                    NOFY Network
                 </h2>
                 <button onClick={() => setIsMenuOpen(false)} className="p-1 hover:bg-slate-800 rounded-full">
                    <X className="w-5 h-5 text-slate-400" />
                 </button>
              </div>

              {/* Drawer Tabs */}
              <div className="flex border-b border-slate-800">
                 <button 
                   onClick={() => setMenuTab('PROFILE')}
                   className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider ${menuTab === 'PROFILE' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-slate-500 hover:text-slate-300'}`}
                 >
                   My Profile
                 </button>
                 <button 
                   onClick={() => setMenuTab('CHAT')}
                   className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider ${menuTab === 'CHAT' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-slate-500 hover:text-slate-300'}`}
                 >
                   Direct Chat
                 </button>
              </div>

              {/* Drawer Body */}
              <div className="flex-grow overflow-hidden">
                 
                 {/* TAB: PROFILE & DIRECTORY */}
                 {menuTab === 'PROFILE' && (
                    <div className="h-full overflow-y-auto p-6 space-y-6">
                       
                       {/* My Card */}
                       <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 text-center relative overflow-hidden">
                          <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-b from-indigo-900/50 to-transparent"></div>
                          <div className="relative z-10">
                             <div className="w-20 h-20 mx-auto rounded-full bg-slate-700 border-4 border-slate-800 flex items-center justify-center text-2xl font-bold text-indigo-300 mb-3 shadow-lg">
                                {user.name.charAt(0)}
                             </div>
                             <h3 className="text-xl font-bold text-white">{user.name}</h3>
                             <p className="text-indigo-300 font-medium text-sm mb-1">{user.role}</p>
                             <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-600 text-[10px] text-slate-400">
                                <RadioTower className="w-3 h-3" />
                                {user.department.replace('_', ' ')}
                             </div>
                             <div className="mt-2 text-[10px] text-slate-500 font-mono uppercase">
                                Access: {user.allowedTerminals.join(' + ')}
                             </div>
                          </div>
                          
                          <button onClick={onLogout} className="mt-6 w-full py-2 bg-rose-900/20 hover:bg-rose-900/40 text-rose-300 text-xs font-bold rounded-lg border border-rose-900/50 flex items-center justify-center gap-2 transition-colors">
                             <LogOut className="w-3 h-3" /> End Shift
                          </button>
                       </div>

                       {/* System Directory */}
                       <div>
                          <h4 className="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center gap-2">
                             <Search className="w-3 h-3" /> Department Directory
                          </h4>
                          <div className="space-y-2">
                             {mockUsers.filter(u => u.id !== user.id).map(u => (
                                <div key={u.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
                                   <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-300">
                                      {u.name.charAt(0)}
                                   </div>
                                   <div>
                                      <div className="text-sm font-bold text-slate-200">{u.name}</div>
                                      <div className="text-[10px] text-slate-500">{u.role} • {u.department.split('_')[0]}</div>
                                   </div>
                                   <div className={`ml-auto w-2 h-2 rounded-full ${u.status === 'ONLINE' ? 'bg-emerald-500' : 'bg-slate-600'}`}></div>
                                </div>
                             ))}
                          </div>
                       </div>
                    </div>
                 )}

                 {/* TAB: DIRECT CHAT */}
                 {menuTab === 'CHAT' && (
                    <DirectChat 
                       currentUser={user} 
                       messages={chatMessages} 
                       onSendMessage={onSendMessage}
                       mockUsers={mockUsers}
                    />
                 )}
              </div>
           </div>
        </div>
      )}
      
      {/* Marquee Animation Style */}
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .animate-marquee {
          animation: marquee 20s linear infinite;
        }
      `}</style>
    </div>
  );
};
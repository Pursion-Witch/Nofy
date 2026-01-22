
import React, { useState, useEffect } from 'react';
import { LogOut, RadioTower, Menu, X, User, MessageSquare, AlertTriangle, Presentation, Wifi, WifiOff, RefreshCw, Settings, UserCircle, MessageCircle, CheckCircle2 } from 'lucide-react';
import { UserProfile, ChatMessage, Terminal, LogEntry, ChatChannel } from '../types';
import { ChatInterface } from './ChatInterface';
import { api, SyncStatus } from '../virtualBackend';

interface LayoutProps {
  children: React.ReactNode;
  user: UserProfile;
  currentTerminal: Terminal;
  onTerminalChange: (t: Terminal) => void;
  onLogout: () => void;
  chatChannels: ChatChannel[];
  chatMessages: ChatMessage[];
  onSendMessage: (channelId: string, content: string) => void;
  onCreateChannel: (name: string, participants: string[], type: 'DIRECT' | 'GROUP') => void;
  mockUsers: UserProfile[];
  onStatusChange?: (status: string) => void; 
  latestCriticalLog?: any | null; // Supports AlertPayload
  isTourActive?: boolean;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, user, currentTerminal, onTerminalChange, onLogout, 
  chatChannels, chatMessages, onSendMessage, onCreateChannel, mockUsers, 
  onStatusChange, latestCriticalLog, isTourActive
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeAlerts, setActiveAlerts] = useState<any[]>([]);
  const [showFullChat, setShowFullChat] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(api.syncStatus);

  useEffect(() => {
    return api.subscribe((event) => {
      if (event.type === 'SYNC_STATUS_CHANGED') {
        setSyncStatus(event.payload);
      }
    });
  }, []);

  useEffect(() => {
    if (latestCriticalLog) {
      // Avoid duplicate alerts for the same ID
      setActiveAlerts(prev => {
          if (prev.some(a => a.id === latestCriticalLog.id)) return prev;
          return [latestCriticalLog, ...prev].slice(0, 3);
      });
    }
  }, [latestCriticalLog]);

  const removeAlert = (id: string) => setActiveAlerts(prev => prev.filter(a => a.id !== id));

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 font-sans overflow-x-hidden">
      
      {showFullChat && (
        <ChatInterface 
          currentUser={user} channels={chatChannels} messages={chatMessages}
          onSendMessage={onSendMessage} onCreateChannel={onCreateChannel}
          onClose={() => setShowFullChat(false)} allUsers={mockUsers}
        />
      )}

      {/* ALERT QUEUE */}
      <div className="fixed top-20 inset-x-4 z-[100] flex flex-col gap-2 pointer-events-none">
        {activeAlerts.map((alert, i) => {
          const isResolution = alert.type === 'RESOLUTION';
          const isUpdate = alert.type === 'UPDATE';
          const isNew = alert.type === 'NEW_INCIDENT';

          return (
            <div 
                key={alert.id} 
                className={`pointer-events-auto border p-4 rounded-2xl shadow-2xl flex items-center justify-between animate-in slide-in-from-right duration-300 ${
                    isResolution ? 'bg-emerald-600 border-emerald-400' :
                    isUpdate ? 'bg-indigo-600 border-indigo-400' :
                    'bg-rose-600 border-rose-400'
                }`} 
                style={{ zIndex: 100 - i }}
            >
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-black/20 rounded-xl">
                        {isResolution ? <CheckCircle2 className="w-5 h-5 text-emerald-200" /> :
                         isUpdate ? <MessageCircle className="w-5 h-5 text-indigo-200" /> :
                         <AlertTriangle className="w-5 h-5 text-rose-200 animate-pulse" />}
                    </div>
                    <div>
                        <div className="text-[10px] font-black uppercase opacity-80 flex items-center gap-2">
                            <span>{alert.type.replace('_', ' ')}</span>
                            <span>•</span>
                            <span>{alert.originDept}</span>
                            {alert.author && (
                                <>
                                    <span>•</span>
                                    <span className="bg-black/20 px-1 rounded">BY: {alert.author}</span>
                                </>
                            )}
                        </div>
                        <div className="text-sm font-bold leading-tight">{alert.message}</div>
                    </div>
                </div>
                <button onClick={() => removeAlert(alert.id)} className="p-2 hover:bg-black/10 rounded-full shrink-0 ml-2">
                    <X className="w-4 h-4" />
                </button>
            </div>
          );
        })}
      </div>

      <header className="sticky top-0 z-50 bg-slate-950 border-b border-slate-800 p-4 flex justify-between items-center h-16">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 font-black text-2xl tracking-tighter">
            NOF<span className="text-indigo-400">Y</span> <RadioTower className="w-5 h-5 text-indigo-500" />
          </div>
          
          <div className={`hidden md:flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black border transition-all duration-500 ${
            syncStatus === 'ONLINE' ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-500' :
            syncStatus === 'SYNCING' ? 'bg-indigo-950/30 border-indigo-500/30 text-indigo-400' :
            'bg-rose-950/30 border-rose-500/30 text-rose-500 animate-pulse'
          }`}>
            {syncStatus === 'ONLINE' && <><Wifi className="w-3 h-3" /> NETWORK STABLE</>}
            {syncStatus === 'SYNCING' && <><RefreshCw className="w-3 h-3 animate-spin" /> PUSHING DATA...</>}
            {syncStatus === 'OFFLINE' && <><WifiOff className="w-3 h-3" /> DEAD ZONE (OUTBOX ACTIVE)</>}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="md:hidden">
             {syncStatus !== 'ONLINE' && (
               <div className={`p-2 rounded-full ${syncStatus === 'OFFLINE' ? 'bg-rose-600' : 'bg-indigo-600'}`}>
                 {syncStatus === 'OFFLINE' ? <WifiOff className="w-4 h-4 text-white" /> : <RefreshCw className="w-4 h-4 text-white animate-spin" />}
               </div>
             )}
          </div>
          <button 
            id="header-chat"
            onClick={() => setShowFullChat(true)} 
            className="p-2 hover:bg-slate-800 rounded-full text-indigo-400 relative"
          >
            <MessageSquare />
            {chatChannels.some(c => c.unreadCount) && <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full"></span>}
          </button>
          <button onClick={() => setIsMenuOpen(true)} className="p-2 hover:bg-slate-800 rounded-full"><Menu /></button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 mb-20">
        {children}
      </main>

      {isMenuOpen && (
        <div className="fixed inset-0 z-[150] flex justify-end">
           <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)}></div>
           <div className="relative w-80 bg-slate-900 h-full border-l border-slate-800 p-6 flex flex-col">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-bold flex items-center gap-2"><User className="text-indigo-400" /> Profile</h2>
                <X onClick={() => setIsMenuOpen(false)} className="cursor-pointer text-slate-400 hover:text-white" />
              </div>
              <div className="flex-grow space-y-6 overflow-y-auto custom-scrollbar">
                 <div className="text-center bg-slate-800 p-6 rounded-3xl border border-slate-700">
                    <div className="w-20 h-20 bg-indigo-600 rounded-full mx-auto mb-3 flex items-center justify-center text-3xl font-black">{user.name.charAt(0)}</div>
                    <h3 className="text-xl font-bold text-white">{user.name}</h3>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">{user.role}</p>
                 </div>
                 
                 <div className="space-y-2">
                    <button className="w-full py-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-2xl text-slate-300 font-bold flex items-center px-4 gap-3 transition-colors opacity-70 cursor-not-allowed">
                       <UserCircle className="w-5 h-5 text-indigo-400" /> Account
                    </button>
                    <button className="w-full py-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-2xl text-slate-300 font-bold flex items-center px-4 gap-3 transition-colors opacity-70 cursor-not-allowed">
                       <Settings className="w-5 h-5 text-indigo-400" /> Settings
                    </button>
                 </div>
                 
                 <button onClick={onLogout} className="w-full py-4 bg-rose-950/20 hover:bg-rose-950/40 text-rose-500 font-bold rounded-2xl border border-rose-900/30 transition-colors">End Shift</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

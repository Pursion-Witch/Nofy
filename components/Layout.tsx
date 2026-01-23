
import React, { useState, useEffect, useRef } from 'react';
import { RadioTower, Menu, X, User, MessageSquare, AlertTriangle, Wifi, WifiOff, RefreshCw, Settings, UserCircle, MessageCircle, CheckCircle2, Siren, Plane, Cloud, Clock } from 'lucide-react';
import { UserProfile, ChatMessage, Terminal, ChatChannel, LogEntry } from '../types';
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
  latestCriticalLog?: any | null; 
  activeCriticalLogs?: LogEntry[];
  cancelledFlights?: string[];
  delayedFlights?: string[];
  gateChanges?: string[];
  isTourActive?: boolean;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, user, chatChannels, chatMessages, onSendMessage, onCreateChannel, mockUsers, 
  onLogout, latestCriticalLog, activeCriticalLogs = [],
  cancelledFlights = [], delayedFlights = [], gateChanges = []
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeAlerts, setActiveAlerts] = useState<any[]>([]);
  const [showFullChat, setShowFullChat] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(api.syncStatus);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => {
      clearInterval(timer);
      return api.subscribe((event) => {
        if (event.type === 'SYNC_STATUS_CHANGED') setSyncStatus(event.payload);
      });
    }
  }, []);

  // Handle auto-vanishing alerts (5 seconds)
  useEffect(() => {
    if (latestCriticalLog) {
      const alertId = latestCriticalLog.id;
      
      setActiveAlerts(prev => {
          const existsIndex = prev.findIndex(a => a.incidentId === latestCriticalLog.incidentId);
          if (existsIndex >= 0) {
              const updated = [...prev];
              updated[existsIndex] = latestCriticalLog;
              return updated;
          }
          return [latestCriticalLog, ...prev].slice(0, 3);
      });

      // Auto-remove after 5 seconds
      const timer = setTimeout(() => {
        removeAlert(alertId);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [latestCriticalLog]);

  const removeAlert = (id: string) => setActiveAlerts(prev => prev.filter(a => a.id !== id));

  // Feed items construction
  const redAlertItems = activeCriticalLogs.filter(l => ['CRITICAL', 'URGENT'].includes(l.severity)).map(l => `ALERT: ${l.message}`);
  const orangeAlertItems = activeCriticalLogs.filter(l => l.severity === 'HIGH').map(l => `ISSUE: ${l.message}`);
  
  const TickerItem = ({ text, colorClass, icon: Icon }: any) => (
    <span className={`flex items-center gap-2 mx-6 text-[10px] md:text-xs font-bold uppercase tracking-tight whitespace-nowrap shrink-0 ${colorClass}`}>
       {Icon && <Icon className="w-3.5 h-3.5" />}
       {text}
    </span>
  );

  const tickerContent = (
    <>
      <TickerItem 
        text={`${currentTime.toLocaleDateString([], { month: 'short', day: 'numeric' })} | ${currentTime.toLocaleTimeString([], { hour12: false })}`} 
        colorClass="text-slate-500" 
        icon={Clock}
      />
      <TickerItem 
        text="WEATHER: 28°C SCATTERED CLOUDS | HUMIDITY: 78% | WIND: 12KT NE" 
        colorClass="text-slate-400" 
        icon={Cloud}
      />
      {redAlertItems.map((msg, i) => <TickerItem key={`red-${i}`} text={msg} colorClass="text-rose-500" icon={AlertTriangle} />)}
      {orangeAlertItems.map((msg, i) => <TickerItem key={`orange-${i}`} text={msg} colorClass="text-amber-500" icon={AlertTriangle} />)}
      {cancelledFlights.map((msg, i) => <TickerItem key={`cnl-${i}`} text={`CANCELLED: ${msg}`} colorClass="text-rose-500" icon={X} />)}
      {delayedFlights.map((msg, i) => <TickerItem key={`dly-${i}`} text={`DELAYED: ${msg}`} colorClass="text-amber-500" icon={Clock} />)}
      {gateChanges.map((msg, i) => <TickerItem key={`gate-${i}`} text={msg} colorClass="text-blue-500" icon={Plane} />)}
    </>
  );

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 font-sans overflow-x-hidden">
      
      <style>{`
        @keyframes ticker {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-50%, 0, 0); }
        }
        .animate-ticker {
          display: inline-flex;
          animation: ticker 60s linear infinite;
          width: max-content;
        }
        .animate-ticker:hover {
          animation-play-state: paused;
        }
      `}</style>

      {showFullChat && (
        <ChatInterface 
          currentUser={user} channels={chatChannels} messages={chatMessages}
          onSendMessage={onSendMessage} onCreateChannel={onCreateChannel}
          onClose={() => setShowFullChat(false)} allUsers={mockUsers}
        />
      )}

      {/* ALERT QUEUE (Popups - 5s duration) */}
      <div className="fixed top-24 md:top-28 inset-x-4 z-[100] flex flex-col gap-2 pointer-events-none">
        {activeAlerts.map((alert, i) => {
          const isResolution = alert.type === 'RESOLUTION';
          const isUpdate = alert.type === 'UPDATE';

          return (
            <div 
                key={alert.id} 
                className={`pointer-events-auto border p-4 rounded-2xl shadow-2xl flex items-center justify-between animate-in slide-in-from-right duration-300 max-w-xl mx-auto w-full transition-opacity duration-500 ${
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
                                    <span className="bg-black/20 px-1 rounded uppercase">BY: {alert.author}</span>
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

      <header className="sticky top-0 z-[60] bg-slate-950 border-b border-slate-800 p-4 flex justify-between items-center h-16 shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="flex items-center select-none pt-1">
             <div className="relative flex items-end">
                <span className="text-2xl font-black text-white tracking-tight relative">
                  NOF
                  <RadioTower className="absolute -top-3.5 right-0.5 w-4 h-4 text-sky-400" />
                </span>
                <span className="text-3xl font-black text-indigo-500 relative ml-0.5 leading-none">
                  Y
                  <Plane className="absolute -top-2.5 -right-2 w-4 h-4 text-rose-500 transform rotate-12" />
                </span>
             </div>
          </div>
          
          <div className={`hidden lg:flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black border transition-all duration-500 ${
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
          <button id="header-chat" onClick={() => setShowFullChat(true)} className="p-2 hover:bg-slate-800 rounded-full text-indigo-400 relative">
            <MessageSquare />
            {chatChannels.some(c => c.unreadCount) && <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full"></span>}
          </button>
          <button onClick={() => setIsMenuOpen(true)} className="p-2 hover:bg-slate-800 rounded-full"><Menu /></button>
        </div>
      </header>

      {/* LIVE AIRPORT OPERATIONS FEED (v0.65) */}
      <div className="sticky top-16 z-50 bg-black border-b border-slate-800 h-8 flex items-center overflow-hidden shadow-xl">
          <div className="absolute left-0 top-0 bottom-0 bg-slate-900 px-3 flex items-center gap-2 z-10 border-r border-slate-800 shadow-[4px_0_10px_rgba(0,0,0,0.5)]">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-[9px] font-black text-slate-300 uppercase tracking-tighter whitespace-nowrap">Live Ops</span>
          </div>
          <div className="flex-1 relative overflow-hidden pl-24">
              <div className="animate-ticker">
                  {/* Repeat content for seamless looping */}
                  {tickerContent}
                  {tickerContent}
                  {tickerContent}
              </div>
          </div>
          {/* Scanline/Gradient Overlay */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.05] bg-[radial-gradient(#fff_1px,transparent_1px)] bg-[size:4px_4px]"></div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-6 mb-20 mt-2">
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
                 <button onClick={onLogout} className="w-full py-4 bg-rose-950/20 hover:bg-rose-950/40 text-rose-500 font-bold rounded-2xl border border-rose-900/30 transition-colors">End Shift</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

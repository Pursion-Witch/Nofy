import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { LoginScreen } from './components/LoginScreen';
import { AuthScreen } from './components/AuthScreen';
import { CommandInterface } from './components/CommandInterface';
import { StrategicOverview } from './components/StrategicDashboard';
import { Directory } from './components/Directory';
import { FlightDashboard } from './components/FlightDashboard';
import { TaskModule } from './components/TaskModule';
import { OnboardingTour } from './components/OnboardingTour'; 
import { FlightManifest } from './components/FlightManifest';
import { api } from './virtualBackend';
import { LogEntry, UserRole, Department, IncidentSeverity, Flight, UserProfile, ChatMessage, Terminal, ChatChannel, AccessLevel } from './types';
import { LayoutDashboard, Phone, Plane, ClipboardList, AlertOctagon } from 'lucide-react';

type Tab = 'report' | 'dash' | 'directory' | 'flights' | 'tasks';
type AuthState = 'AUTH' | 'ONBOARDING' | 'APP';

export default function App() {
  const [authState, setAuthState] = useState<AuthState>('AUTH');
  const [tempAuthData, setTempAuthData] = useState<{email: string, name?: string, isNewUser: boolean} | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('tasks'); 
  const [currentTerminal, setCurrentTerminal] = useState<Terminal>(Terminal.T2); 
  const [showOnboarding, setShowOnboarding] = useState(false);
  
  // Backend Managed State
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [flights, setFlights] = useState<Flight[]>([]);
  const [channels, setChannels] = useState<ChatChannel[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [mockUsers, setMockUsers] = useState<UserProfile[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [forcedManifestFlight, setForcedManifestFlight] = useState<Flight | null>(null);

  // Unified Fetch Logic
  const fetchData = async () => {
    const [f, l, c, u] = await Promise.all([
      api.queries.getFlights(),
      api.queries.getLogs(),
      api.queries.getChannels(),
      api.queries.getUsers()
    ]);
    setFlights(f);
    setLogs(l);
    setChannels(c);
    setMockUsers(u);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
    // Subscribe to backend changes
    return api.subscribe(() => fetchData());
  }, []);

  const handleAuthenticated = (email: string, name?: string, isNewUser: boolean = false) => {
    setTempAuthData({ email, name, isNewUser });
    setAuthState('ONBOARDING');
  };

  const handleProfileSetup = (role: UserRole, dept: Department, name: string, allowedTerminals: Terminal[], accessLevel: AccessLevel, employeeId: string, airline?: string) => {
    if (!tempAuthData) return;
    const newUser: UserProfile = { id: 'current-user', name, email: tempAuthData.email, role, department: dept, status: 'ONLINE', allowedTerminals, accessLevel, employeeId, airline };
    setUser(newUser);
    setCurrentTerminal(allowedTerminals.length === 1 ? allowedTerminals[0] : Terminal.T2);
    setAuthState('APP');
    if (tempAuthData.isNewUser) setShowOnboarding(true);
  };

  const handleLogout = () => { setUser(null); setTempAuthData(null); setAuthState('AUTH'); setActiveTab('tasks'); };
  
  const handleNewLog = (log: LogEntry) => { 
    api.commands.addLog(log);
    if (['CRITICAL', 'HIGH', 'URGENT'].includes(log.severity)) setActiveTab('tasks'); 
  };
  
  const handleSendMessage = (channelId: string, content: string) => {
     if (!user) return;
     const newMsg: ChatMessage = { id: Date.now().toString(), channelId, senderId: user.id, senderName: user.name, content, timestamp: new Date(), isRead: true };
     api.commands.sendMessage(newMsg);
  };

  const handleCreateChannel = (name: string, participants: string[], type: 'DIRECT' | 'GROUP') => {
      const newChannel: ChatChannel = { id: `c-${Date.now()}`, name, type, participants, lastMessage: type === 'GROUP' ? 'Group created' : 'Chat started', lastMessageTime: new Date() };
      api.commands.createChannel(newChannel);
  };

  const handleStatusChange = (status: string) => { if (user) setUser({ ...user, status }); };

  const handleSendAlert = (msg: string, severity: IncidentSeverity) => {
      if(!user) return;
      handleNewLog({ id: Date.now().toString(), timestamp: new Date(), message: msg, category: 'OPERATIONAL', severity, originDept: user.department, targetDept: [Department.AOCC], agenciesInvolved: [], terminal: currentTerminal, relatedAirline: user.airline });
  };

  if (authState === 'AUTH') return <AuthScreen onAuthenticated={handleAuthenticated} />;
  if (authState === 'ONBOARDING' && tempAuthData) return <LoginScreen onLogin={handleProfileSetup} initialEmail={tempAuthData.email} initialName={tempAuthData.name} isNewUser={tempAuthData.isNewUser} />;
  if (!user || isLoading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-indigo-400 font-bold animate-pulse">CONNECTING TO MCIA COMMAND...</div>;

  const visibleLogs = logs.filter(log => (!log.terminal || log.terminal === currentTerminal));
  const latestCriticalLog = logs.length > 0 && ['CRITICAL', 'HIGH'].includes(logs[0].severity) ? logs[0] : null;

  return (
    <>
      {showOnboarding && <OnboardingTour onComplete={() => setShowOnboarding(false)} userDept={user.department} onSwitchTab={setActiveTab} />}
      {forcedManifestFlight && <FlightManifest flight={forcedManifestFlight} onClose={() => setForcedManifestFlight(null)} readOnly={user.accessLevel === 'VIEWER'} />}
      <Layout 
        user={user} 
        currentTerminal={currentTerminal} 
        onTerminalChange={setCurrentTerminal} 
        onLogout={handleLogout} 
        chatChannels={channels} 
        chatMessages={messages} 
        onSendMessage={handleSendMessage} 
        onCreateChannel={handleCreateChannel} 
        mockUsers={mockUsers} 
        onStatusChange={handleStatusChange} 
        latestCriticalLog={latestCriticalLog}
        isTourActive={showOnboarding}
      >
        <div className="h-full">
          {activeTab === 'report' && <CommandInterface role={user.role} department={user.department} userName={user.name} currentTerminal={currentTerminal} onNewLog={handleNewLog} onBack={() => setActiveTab('tasks')} />}
          {activeTab === 'dash' && <div className="animate-in fade-in zoom-in-95 duration-200"><h2 className="text-xl font-bold text-slate-200 mb-4 px-2">Unified Command Center</h2><StrategicOverview userDept={user.department} flights={flights} logs={visibleLogs} currentUser={user} onSendAlert={handleSendAlert} onRequestManifest={console.log} onShowManifest={(f) => { setActiveTab('flights'); setForcedManifestFlight(f); }} /></div>}
          {activeTab === 'directory' && <Directory onLogCall={handleNewLog} currentTerminal={currentTerminal} />}
          {activeTab === 'flights' && <FlightDashboard flights={flights} currentTerminal={currentTerminal} userRole={user.department} currentUser={user} />}
          {activeTab === 'tasks' && <TaskModule logs={visibleLogs} />}
        </div>
        <div className="fixed bottom-0 left-0 w-full bg-slate-900 border-t border-slate-800 pb-safe z-40 shadow-[0_-5px_20px_rgba(0,0,0,0.3)]">
          <div className="flex justify-between items-end max-w-md md:max-w-7xl mx-auto px-2 relative pt-2 pb-1">
             <button id="nav-report" onClick={() => setActiveTab('report')} className={`flex-1 py-2 flex flex-col items-center gap-1 transition-all ${activeTab === 'report' ? 'text-indigo-400 -translate-y-1' : 'text-slate-400 hover:text-white'}`}>
               <AlertOctagon className={`w-6 h-6 ${activeTab === 'report' ? 'fill-indigo-900/30' : ''}`} />
               <span className="text-[9px] font-bold uppercase">Report</span>
             </button>
             <button id="nav-dash" onClick={() => setActiveTab('dash')} className={`flex-1 py-2 flex flex-col items-center gap-1 transition-all ${activeTab === 'dash' ? 'text-indigo-400 -translate-y-1' : 'text-slate-400 hover:text-white'}`}>
               <LayoutDashboard className={`w-6 h-6 ${activeTab === 'dash' ? 'fill-indigo-900/30' : ''}`} />
               <span className="text-[9px] font-bold uppercase">Dashboard</span>
             </button>
             <button id="nav-directory" onClick={() => setActiveTab('directory')} className={`flex-1 py-2 flex flex-col items-center gap-1 transition-all ${activeTab === 'directory' ? 'text-indigo-400 -translate-y-1' : 'text-slate-400 hover:text-white'}`}>
               <Phone className={`w-6 h-6 ${activeTab === 'directory' ? 'fill-indigo-900/30' : ''}`} />
               <span className="text-[9px] font-bold uppercase">Directory</span>
             </button>
             <button id="nav-flights" onClick={() => setActiveTab('flights')} className={`flex-1 py-2 flex flex-col items-center gap-1 transition-all ${activeTab === 'flights' ? 'text-indigo-400 -translate-y-1' : 'text-slate-400 hover:text-white'}`}>
               <Plane className={`w-6 h-6 ${activeTab === 'flights' ? 'fill-indigo-900/30' : ''}`} />
               <span className="text-[9px] font-bold uppercase">Flights</span>
             </button>
             <button id="nav-tasks" onClick={() => setActiveTab('tasks')} className={`flex-1 py-2 flex flex-col items-center gap-1 transition-all ${activeTab === 'tasks' ? 'text-indigo-400 -translate-y-1' : 'text-slate-400 hover:text-white'}`}>
               <ClipboardList className={`w-6 h-6 ${activeTab === 'tasks' ? 'fill-indigo-900/30' : ''}`} />
               <span className="text-[9px] font-bold uppercase">My Tasks</span>
             </button>
          </div>
        </div>
      </Layout>
    </>
  );
}

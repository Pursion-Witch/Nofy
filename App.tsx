
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
import { api, BackendEvent } from './virtualBackend';
import { LogEntry, UserRole, Department, IncidentSeverity, Flight, UserProfile, ChatMessage, Terminal, ChatChannel, AccessLevel } from './types';
import { LayoutDashboard, Phone, Plane, ClipboardList, AlertOctagon } from 'lucide-react';

type Tab = 'report' | 'dash' | 'directory' | 'flights' | 'tasks';
type AuthState = 'AUTH' | 'ONBOARDING' | 'APP';

export interface AlertPayload {
  id: string;
  incidentId: string; // Used for stacking/collapsing
  type: 'NEW_INCIDENT' | 'UPDATE' | 'RESOLUTION';
  severity: IncidentSeverity;
  originDept: Department;
  message: string;
  author?: string;
  timestamp: Date;
  isGlobal?: boolean;
}

export default function App() {
  // DEMO BUILD: Initializing straight to the main app with AOCC role
  const [authState, setAuthState] = useState<AuthState>('APP');
  const [tempAuthData, setTempAuthData] = useState<{email: string, name?: string, isNewUser: boolean} | null>(null);
  
  // DEMO BUILD: Pre-configured Audience User
  const [user, setUser] = useState<UserProfile | null>({
    id: 'demo-audience',
    employeeId: 'DEMO-2025',
    name: 'Audience Member',
    email: 'demo@mcia.ph',
    role: 'Audience',
    department: Department.AOCC,
    status: 'ONLINE',
    allowedTerminals: [Terminal.T1, Terminal.T2],
    accessLevel: 'ADMIN'
  });

  // DEMO BUILD: Start on Dashboard for maximum impact
  const [activeTab, setActiveTab] = useState<Tab>('dash'); 
  const [currentTerminal, setCurrentTerminal] = useState<Terminal>(Terminal.T2); 
  const [showOnboarding, setShowOnboarding] = useState(false);
  
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [flights, setFlights] = useState<Flight[]>([]);
  const [channels, setChannels] = useState<ChatChannel[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [mockUsers, setMockUsers] = useState<UserProfile[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [forcedManifestFlight, setForcedManifestFlight] = useState<Flight | null>(null);
  const [activeAlert, setActiveAlert] = useState<AlertPayload | null>(null);

  const fetchData = async () => {
    const [f, l, c, u, m] = await Promise.all([
      api.queries.getFlights(),
      api.queries.getLogs(),
      api.queries.getChannels(),
      api.queries.getUsers(),
      api.queries.getMessages()
    ]);
    setFlights(f);
    setLogs(l);
    setChannels(c);
    setMockUsers(u);
    setMessages(m);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
    return api.subscribe((event: BackendEvent) => {
      fetchData();
      
      if (!user) return;
      const isGlobalUser = user.department === Department.AOCC || user.department === Department.IT_SYSTEMS;

      if (event.type === 'LOG_ADDED') {
          const log = event.payload;
          const isRelevant = isGlobalUser || log.terminal === currentTerminal || log.severity === IncidentSeverity.CRITICAL;
          
          if (isRelevant && ['CRITICAL', 'HIGH', 'URGENT'].includes(log.severity)) {
              setActiveAlert({
                  id: log.id,
                  incidentId: log.id,
                  type: 'NEW_INCIDENT',
                  severity: log.severity,
                  originDept: log.originDept,
                  message: log.message,
                  timestamp: log.timestamp
              });
          }
      } else if (event.type === 'LOG_UPDATED') {
          const log = event.payload;
          const latestUpdate = log.updates && log.updates.length > 0 ? log.updates[log.updates.length - 1] : null;
          
          const isRelevant = isGlobalUser || log.terminal === currentTerminal || log.severity === IncidentSeverity.CRITICAL;
          const isHighPriority = ['CRITICAL', 'HIGH', 'URGENT'].includes(log.severity) || (latestUpdate?.type === 'RESOLUTION');

          if (latestUpdate && isRelevant && isHighPriority) {
              setActiveAlert({
                  id: `${log.id}-${latestUpdate.id}`,
                  incidentId: log.id, 
                  type: latestUpdate.type as any,
                  severity: log.severity,
                  originDept: latestUpdate.authorDept,
                  message: latestUpdate.content,
                  author: latestUpdate.authorName,
                  timestamp: latestUpdate.timestamp
              });
          }
      }
    });
  }, [user, currentTerminal]);

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

  const handleLogout = () => { setUser(null); setTempAuthData(null); setAuthState('AUTH'); setActiveTab('dash'); };
  const handleNewLog = (log: LogEntry) => { api.commands.addLog(log); if (['CRITICAL', 'HIGH', 'URGENT'].includes(log.severity)) setActiveTab('tasks'); };
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

  if (authState === 'AUTH') return <AuthScreen onAuthenticated={handleAuthenticated} />;
  if (authState === 'ONBOARDING' && tempAuthData) return <LoginScreen onLogin={handleProfileSetup} initialEmail={tempAuthData.email} initialName={tempAuthData.name} isNewUser={tempAuthData.isNewUser} />;
  if (!user || isLoading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-indigo-400 font-bold animate-pulse">CONNECTING TO MCIA COMMAND...</div>;

  const visibleLogs = logs.filter(log => {
      if (log.originDept === user.department) return true;
      const isAOCC = user.department === Department.AOCC || user.department === Department.IT_SYSTEMS;
      const isHighPriority = [IncidentSeverity.CRITICAL, IncidentSeverity.URGENT, IncidentSeverity.HIGH].includes(log.severity);
      if (isAOCC) return true;
      if (isHighPriority) return true;
      return !log.terminal || log.terminal === currentTerminal;
  });

  // OPS FEED LOGIC (v0.65)
  const activeCriticalLogs = logs.filter(l => 
    !l.isResolved && [IncidentSeverity.CRITICAL, IncidentSeverity.URGENT, IncidentSeverity.HIGH].includes(l.severity)
  );

  const cancelledFlights = flights.filter(f => f.status === 'CANCELLED').map(f => `${f.flightNumber} (${f.airline})`);
  const delayedFlights = flights.filter(f => f.status === 'DELAYED').map(f => `${f.flightNumber} -> ETD: ${f.estimatedTime}`);
  const gateChanges = logs.filter(l => l.message.toLowerCase().includes('gate change') || l.message.toLowerCase().includes('gate reassigned')).map(l => l.message);
  // Demo fallback for gate changes if logs are empty
  if (gateChanges.length === 0) {
      gateChanges.push("PR 1845: GATE CHANGE TO 4", "5J 556: GATE REASSIGNED TO 6");
  }

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
        latestCriticalLog={activeAlert} 
        activeCriticalLogs={activeCriticalLogs} 
        cancelledFlights={cancelledFlights}
        delayedFlights={delayedFlights}
        gateChanges={gateChanges}
        isTourActive={showOnboarding}
      >
        <div className="h-full">
          {activeTab === 'report' && <CommandInterface role={user.role} department={user.department} userName={user.name} currentTerminal={currentTerminal} onNewLog={handleNewLog} onBack={() => setActiveTab('dash')} />}
          {activeTab === 'dash' && <StrategicOverview userDept={user.department} flights={flights} logs={visibleLogs} currentUser={user} onSendAlert={(msg, sev) => handleNewLog({ id: Date.now().toString(), timestamp: new Date(), message: msg, category: 'OPERATIONAL', severity: sev, originDept: user.department, targetDept: [Department.AOCC], agenciesInvolved: [], terminal: currentTerminal })} onShowManifest={(f) => { setActiveTab('flights'); setForcedManifestFlight(f); }} />}
          {activeTab === 'directory' && <Directory onLogCall={handleNewLog} currentTerminal={currentTerminal} />}
          {activeTab === 'flights' && <FlightDashboard flights={flights} currentTerminal={currentTerminal} userRole={user.department} currentUser={user} />}
          {activeTab === 'tasks' && <TaskModule logs={visibleLogs} user={user} />}
        </div>
        <div className="fixed bottom-0 left-0 w-full bg-slate-900 border-t border-slate-800 pb-safe z-40 shadow-[0_-5px_20px_rgba(0,0,0,0.3)]">
          <div className="flex justify-between items-end max-w-md md:max-w-7xl mx-auto px-2 relative pt-2 pb-1">
             <button id="nav-report" onClick={() => setActiveTab('report')} className={`flex-1 py-2 flex flex-col items-center gap-1 transition-all ${activeTab === 'report' ? 'text-indigo-400 -translate-y-1' : 'text-slate-400 hover:text-white'}`}>
               <AlertOctagon className="w-6 h-6" />
               <span className="text-[9px] font-bold uppercase">Report</span>
             </button>
             <button id="nav-dash" onClick={() => setActiveTab('dash')} className={`flex-1 py-2 flex flex-col items-center gap-1 transition-all ${activeTab === 'dash' ? 'text-indigo-400 -translate-y-1' : 'text-slate-400 hover:text-white'}`}>
               <LayoutDashboard className="w-6 h-6" />
               <span className="text-[9px] font-bold uppercase">Dashboard</span>
             </button>
             <button id="nav-directory" onClick={() => setActiveTab('directory')} className={`flex-1 py-2 flex flex-col items-center gap-1 transition-all ${activeTab === 'directory' ? 'text-indigo-400 -translate-y-1' : 'text-slate-400 hover:text-white'}`}>
               <Phone className="w-6 h-6" />
               <span className="text-[9px] font-bold uppercase">Directory</span>
             </button>
             <button id="nav-flights" onClick={() => setActiveTab('flights')} className={`flex-1 py-2 flex flex-col items-center gap-1 transition-all ${activeTab === 'flights' ? 'text-indigo-400 -translate-y-1' : 'text-slate-400 hover:text-white'}`}>
               <Plane className="w-6 h-6" />
               <span className="text-[9px] font-bold uppercase">Flights</span>
             </button>
             <button id="nav-tasks" onClick={() => setActiveTab('tasks')} className={`flex-1 py-2 flex flex-col items-center gap-1 transition-all ${activeTab === 'tasks' ? 'text-indigo-400 -translate-y-1' : 'text-slate-400 hover:text-white'}`}>
               <ClipboardList className="w-6 h-6" />
               <span className="text-[9px] font-bold uppercase">My Tasks</span>
             </button>
          </div>
        </div>
      </Layout>
    </>
  );
}

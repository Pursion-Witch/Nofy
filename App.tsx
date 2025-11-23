import React, { useState } from 'react';
import { DashboardLayout } from './components/DashboardLayout';
import { LoginScreen } from './components/LoginScreen';
import { AuthScreen } from './components/AuthScreen';
import { CommandInterface } from './components/CommandInterface';
import { StrategicOverview } from './components/StrategicDashboard';
import { Directory } from './components/Directory';
import { FlightDashboard } from './components/FlightDashboard';
import { TaskModule } from './components/TaskModule';
import { LogEntry, ResourceStatus, UserRole, Department, IncidentSeverity, Flight, PatientCase, UserProfile, ChatMessage, Terminal, Agency } from './types';
import { LayoutDashboard, Phone, Plane, ClipboardList, AlertOctagon } from 'lucide-react';

const INITIAL_LOGS: LogEntry[] = [
  // CRITICAL: Security / Emergency
  {
    id: 'log-1',
    timestamp: new Date(Date.now() - 1000 * 60 * 2), // 2 mins ago
    message: 'FIRE ALARM ACTIVATED: Zone D, Concession Area. Evacuation Protocol Standby.',
    category: 'INCIDENT',
    severity: IncidentSeverity.CRITICAL,
    originDept: Department.SECURITY,
    targetDept: [Department.AOCC, Department.SAFETY_QUALITY],
    agenciesInvolved: [Agency.BFP],
    terminal: Terminal.T2
  },
  // URGENT: Medical
  {
    id: 'log-2',
    timestamp: new Date(Date.now() - 1000 * 60 * 12), // 12 mins ago
    message: 'Medical Emergency: Passenger collapsed at Gate 4. Breathing faint. Medics en route.',
    category: 'PASSENGER',
    severity: IncidentSeverity.URGENT,
    originDept: Department.TERMINAL_OPS,
    targetDept: [Department.SAFETY_QUALITY],
    agenciesInvolved: [],
    terminal: Terminal.T1
  },
  // HIGH: Operations / Resources
  {
    id: 'log-3',
    timestamp: new Date(Date.now() - 1000 * 60 * 25), // 25 mins ago
    message: 'Carousel 2 Breakdown. Belt snapped. Diverting PR1845 baggage to Carousel 3.',
    category: 'RESOURCE',
    severity: IncidentSeverity.HIGH,
    originDept: Department.APRON_PBB,
    targetDept: [Department.TERMINAL_OPS, Department.AOCC],
    agenciesInvolved: [],
    terminal: Terminal.T1
  },
  // STRATEGIC: AOCC Broadcast
  {
    id: 'log-4',
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    message: 'Cebu Connects Protocol active. Inter-terminal transfer bus frequency increased due to heavy rain.',
    category: 'STRATEGIC',
    severity: IncidentSeverity.LOW,
    originDept: Department.AOCC,
    targetDept: [Department.TERMINAL_OPS],
    agenciesInvolved: [],
    terminal: Terminal.T1
  },
  // MEDIUM: System Issue
  {
    id: 'log-5',
    timestamp: new Date(Date.now() - 1000 * 60 * 45),
    message: 'FIDS Screen Bank B (Check-in) flickering intermittently. IT ticket #9921 created.',
    category: 'SYSTEM',
    severity: IncidentSeverity.MEDIUM,
    originDept: Department.IT_SYSTEMS,
    targetDept: [Department.TERMINAL_OPS],
    agenciesInvolved: [],
    terminal: Terminal.T2
  },
  // LOW: Facilities
  {
    id: 'log-6',
    timestamp: new Date(Date.now() - 1000 * 60 * 60),
    message: 'Spill reported near Pre-departure entrance. Janitorial dispatched.',
    category: 'OPERATIONAL',
    severity: IncidentSeverity.LOW,
    originDept: Department.TERMINAL_OPS,
    targetDept: [Department.SAFETY_QUALITY],
    agenciesInvolved: [],
    terminal: Terminal.T1
  },
  // CALL LOG
  {
    id: 'log-7',
    timestamp: new Date(Date.now() - 1000 * 60 * 90),
    message: '[OUTBOUND CALL] Security Desk to Immigration Control regarding excessive queue length.',
    category: 'CALL_LOG',
    severity: IncidentSeverity.LOW,
    originDept: Department.SECURITY,
    targetDept: [Department.TERMINAL_OPS],
    agenciesInvolved: [],
    terminal: Terminal.T2
  }
];

const INITIAL_FLIGHTS: Flight[] = [
  // --- T1 DOMESTIC ---
  { 
    flightNumber: 'PR 1845', 
    airline: 'PAL', 
    type: 'DEPARTURE',
    origin: 'CEB',
    destination: 'Manila (MNL)', 
    status: 'ON TIME', 
    gate: '4', 
    paxCount: 178, 
    capacity: 180, // High Load
    scheduledTime: '09:30',
    estimatedTime: '09:30',
    assignedCounters: '1-4', 
    terminal: Terminal.T1,
    ssr: { wchr: 2, meda: 0, umnr: 1, vip: 0 }
  },
  { 
    flightNumber: 'DG 6022', 
    airline: 'Cebgo', 
    type: 'ARRIVAL',
    origin: 'Dumaguete (DGT)', 
    destination: 'CEB',
    status: 'LANDED', 
    gate: '2', 
    paxCount: 72, 
    capacity: 78,
    scheduledTime: '08:45',
    estimatedTime: '08:42',
    carousel: 'Belt 1',
    terminal: Terminal.T1,
    ssr: { wchr: 1, meda: 0, umnr: 0, vip: 0 }
  },
  {
    flightNumber: 'Z2 350',
    airline: 'AirAsia',
    type: 'DEPARTURE',
    origin: 'CEB',
    destination: 'Davao (DVO)',
    status: 'CANCELLED',
    reasonCode: 'Aircraft Maintenance',
    gate: '6',
    paxCount: 140,
    capacity: 180,
    scheduledTime: '11:00',
    estimatedTime: '--:--',
    assignedCounters: '10-12',
    terminal: Terminal.T1,
    criticalIssue: 'Pax Re-booking required',
    ssr: { wchr: 0, meda: 0, umnr: 0, vip: 0 }
  },

  // --- T2 INTERNATIONAL ---
  { 
    flightNumber: '5J 556', 
    airline: 'Cebu Pacific', 
    type: 'DEPARTURE',
    origin: 'CEB',
    destination: 'Dubai (DXB)', 
    status: 'DELAYED', 
    reasonCode: 'Late Inbound Aircraft',
    gate: '6', 
    paxCount: 420, 
    capacity: 430, // Very High Load
    scheduledTime: '14:00',
    estimatedTime: '15:30',
    assignedIsland: 'A', 
    terminal: Terminal.T2,
    ssr: { wchr: 5, meda: 1, umnr: 0, vip: 2 }, // MEDA Case
    criticalIssue: 'Provide water/snacks at Gate'
  },
  { 
    flightNumber: 'TR 385', 
    airline: 'Scoot', 
    type: 'DEPARTURE',
    origin: 'CEB',
    destination: 'Singapore (SIN)', 
    status: 'BOARDING', 
    gate: '22', 
    paxCount: 165, 
    capacity: 180,
    scheduledTime: '10:15',
    estimatedTime: '10:15',
    assignedIsland: 'B', 
    terminal: Terminal.T2,
    ssr: { wchr: 1, meda: 0, umnr: 2, vip: 0 }
  },
  { 
    flightNumber: 'KE 631', 
    airline: 'Korean Air', 
    type: 'ARRIVAL',
    origin: 'Incheon (ICN)', 
    destination: 'CEB',
    status: 'APPROACHING', 
    gate: '24', 
    paxCount: 280, 
    capacity: 290,
    scheduledTime: '11:30',
    estimatedTime: '11:25',
    carousel: 'Belt 4',
    terminal: Terminal.T2,
    ssr: { wchr: 8, meda: 0, umnr: 0, vip: 5 } // High WCHR load
  }
];

const INITIAL_PATIENTS: PatientCase[] = [
  { id: 'MED-001', flightNumber: '5J 556', condition: 'Hypertension', status: 'WAITING_MEDIC' }
];

const MOCK_USERS: UserProfile[] = [
  { id: 'u1', name: 'Ops. Sarah L.', email: 'sarah@mcia.ph', role: 'Terminal Manager', department: Department.TERMINAL_OPS, status: 'ONLINE', allowedTerminals: [Terminal.T1] },
  { id: 'u2', name: 'Engr. Mark D.', email: 'mark@mcia.ph', role: 'Systems Admin', department: Department.IT_SYSTEMS, status: 'BUSY', allowedTerminals: [Terminal.T1, Terminal.T2] },
  { id: 'u3', name: 'Capt. R. Santos', email: 'santos@mcia.ph', role: 'Security Chief', department: Department.SECURITY, status: 'ONLINE', allowedTerminals: [Terminal.T2] },
];

// MAPPING 5 BUTTONS
type Tab = 'report' | 'dash' | 'directory' | 'flights' | 'tasks';
type AuthState = 'AUTH' | 'ONBOARDING' | 'APP';

export default function App() {
  const [authState, setAuthState] = useState<AuthState>('AUTH');
  const [tempAuthData, setTempAuthData] = useState<{email: string, name?: string} | null>(null);

  const [user, setUser] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('tasks'); 
  const [currentTerminal, setCurrentTerminal] = useState<Terminal>(Terminal.T2); 
  
  const [logs, setLogs] = useState<LogEntry[]>(INITIAL_LOGS);
  const [flights, setFlights] = useState<Flight[]>(INITIAL_FLIGHTS);
  
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
     { id: 'm1', senderId: 'u2', senderName: 'Engr. Mark D.', content: 'FIDS Screen 4 is rebooting, FYI.', timestamp: new Date(Date.now() - 1000 * 60 * 5), isRead: false }
  ]);

  // Stage 1: Auth (Login/Signup/Google)
  const handleAuthenticated = (email: string, name?: string) => {
    setTempAuthData({ email, name });
    setAuthState('ONBOARDING');
  };

  // Stage 2: Profile Setup / Role Selection
  const handleProfileSetup = (role: UserRole, dept: Department, name: string, allowedTerminals: Terminal[]) => {
    if (!tempAuthData) return;

    setUser({
      id: 'current-user',
      name: name,
      email: tempAuthData.email,
      role: role,
      department: dept,
      status: 'ONLINE',
      allowedTerminals
    });
    
    // Auto-set terminal
    if (allowedTerminals.length === 1) {
       setCurrentTerminal(allowedTerminals[0]);
    } else {
       setCurrentTerminal(Terminal.T2);
    }

    if (!MOCK_USERS.find(u => u.name === name)) {
       MOCK_USERS.push({ id: 'current-user', name, email: tempAuthData.email, role, department: dept, status: 'ONLINE', allowedTerminals });
    }

    setAuthState('APP');
  };

  const handleLogout = () => {
    setUser(null);
    setTempAuthData(null);
    setAuthState('AUTH');
    setActiveTab('tasks');
  };

  const handleNewLog = (log: LogEntry) => {
    setLogs(prev => [...prev, log]);
    if (log.severity === IncidentSeverity.CRITICAL || log.severity === IncidentSeverity.HIGH || log.severity === IncidentSeverity.URGENT) {
       setActiveTab('tasks');
    }
  };

  const handleSendMessage = (content: string) => {
     if (!user) return;
     const newMsg: ChatMessage = {
        id: Date.now().toString(),
        senderId: user.id,
        senderName: user.name,
        content: content,
        timestamp: new Date(),
        isRead: true
     };
     setChatMessages(prev => [...prev, newMsg]);
  };

  // --- RENDER LOGIC ---

  if (authState === 'AUTH') {
    return <AuthScreen onAuthenticated={handleAuthenticated} />;
  }

  if (authState === 'ONBOARDING' && tempAuthData) {
    return (
      <LoginScreen 
        onLogin={handleProfileSetup} 
        initialEmail={tempAuthData.email}
        initialName={tempAuthData.name}
      />
    );
  }

  if (!user) return null; // Should not happen

  // DATA FILTERS
  const visibleLogs = logs.filter(log => {
      if (!log.terminal) return true;
      return log.terminal === currentTerminal;
  });

  let flightDataForDashboard = flights;
  if (user.allowedTerminals.length === 1) {
      flightDataForDashboard = flights.filter(f => f.terminal === user.allowedTerminals[0]);
  } else {
      flightDataForDashboard = flights;
  }

  return (
    <DashboardLayout 
      user={user} 
      currentTerminal={currentTerminal}
      onTerminalChange={setCurrentTerminal}
      onLogout={handleLogout}
      chatMessages={chatMessages}
      onSendMessage={handleSendMessage}
      mockUsers={MOCK_USERS}
    >
      
      <div className="h-full">
        
        {/* BUTTON 1: REPORT INCIDENT */}
        {activeTab === 'report' && (
           <div className="animate-in fade-in zoom-in-95 duration-200 h-[75vh]">
             <CommandInterface 
                role={user.role} 
                department={user.department} 
                userName={user.name}
                currentTerminal={currentTerminal}
                onNewLog={handleNewLog}
              />
           </div>
        )}

        {/* BUTTON 2: DASHBOARD */}
        {activeTab === 'dash' && (
           <div className="animate-in fade-in zoom-in-95 duration-200">
             <h2 className="text-xl font-bold text-slate-200 mb-4 px-2">Unified Command Center</h2>
             <StrategicOverview />
           </div>
        )}

        {/* BUTTON 3: DIRECTORY */}
        {activeTab === 'directory' && (
           <div className="animate-in fade-in zoom-in-95 duration-200">
             <Directory onLogCall={handleNewLog} currentTerminal={currentTerminal} />
           </div>
        )}

        {/* BUTTON 4: FLIGHTS */}
        {activeTab === 'flights' && (
           <div className="animate-in fade-in zoom-in-95 duration-200">
              <FlightDashboard 
                  flights={flightDataForDashboard} 
                  currentTerminal={currentTerminal}
                  userRole={user.department} // Pass Dept for specific permissions
              />
           </div>
        )}

        {/* BUTTON 5: MY TASKS */}
        {activeTab === 'tasks' && (
           <div className="animate-in fade-in zoom-in-95 duration-200 h-[75vh]">
             <TaskModule logs={visibleLogs} />
           </div>
        )}

      </div>

      {/* BOTTOM NAVIGATION BAR */}
      <div className="fixed bottom-0 left-0 w-full bg-slate-900 border-t border-slate-800 pb-safe z-40 shadow-[0_-5px_20px_rgba(0,0,0,0.3)]">
        <div className="flex justify-between items-end max-w-md md:max-w-7xl mx-auto px-2 relative pt-2 pb-1">
           
           <button 
             onClick={() => setActiveTab('report')}
             className={`flex-1 py-2 flex flex-col items-center gap-1 transition-all ${activeTab === 'report' ? 'text-indigo-400 -translate-y-1' : 'text-slate-500 hover:text-slate-300'}`}
           >
             <AlertOctagon className={`w-6 h-6 ${activeTab === 'report' ? 'fill-indigo-900/30' : ''}`} />
             <span className="text-[9px] font-bold uppercase">Report</span>
           </button>

           <button 
             onClick={() => setActiveTab('dash')}
             className={`flex-1 py-2 flex flex-col items-center gap-1 transition-all ${activeTab === 'dash' ? 'text-indigo-400 -translate-y-1' : 'text-slate-500 hover:text-slate-300'}`}
           >
             <LayoutDashboard className={`w-6 h-6 ${activeTab === 'dash' ? 'fill-indigo-900/30' : ''}`} />
             <span className="text-[9px] font-bold uppercase">Dashboard</span>
           </button>

           <button 
             onClick={() => setActiveTab('directory')}
             className={`flex-1 py-2 flex flex-col items-center gap-1 transition-all ${activeTab === 'directory' ? 'text-indigo-400 -translate-y-1' : 'text-slate-500 hover:text-slate-300'}`}
           >
             <Phone className={`w-6 h-6 ${activeTab === 'directory' ? 'fill-indigo-900/30' : ''}`} />
             <span className="text-[9px] font-bold uppercase">Directory</span>
           </button>

           <button 
             onClick={() => setActiveTab('flights')}
             className={`flex-1 py-2 flex flex-col items-center gap-1 transition-all ${activeTab === 'flights' ? 'text-indigo-400 -translate-y-1' : 'text-slate-500 hover:text-slate-300'}`}
           >
             <Plane className={`w-6 h-6 ${activeTab === 'flights' ? 'fill-indigo-900/30' : ''}`} />
             <span className="text-[9px] font-bold uppercase">Flights</span>
           </button>

           <button 
             onClick={() => setActiveTab('tasks')}
             className={`flex-1 py-2 flex flex-col items-center gap-1 transition-all ${activeTab === 'tasks' ? 'text-indigo-400 -translate-y-1' : 'text-slate-500 hover:text-slate-300'}`}
           >
             <ClipboardList className={`w-6 h-6 ${activeTab === 'tasks' ? 'fill-indigo-900/30' : ''}`} />
             <span className="text-[9px] font-bold uppercase">My Tasks</span>
           </button>

        </div>
      </div>

    </DashboardLayout>
  );
}
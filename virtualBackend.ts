
import { 
  Flight, LogEntry, Task, UserProfile, ChatChannel, ChatMessage, 
  Terminal, Department, IncidentSeverity, AccessLevel, PassengerStatus 
} from './types';

// --- TYPES & EVENTS ---

export type BackendEvent = 
  | { type: 'LOG_ADDED'; payload: LogEntry }
  | { type: 'TASK_UPDATED'; payload: Task }
  | { type: 'TASK_ADDED'; payload: Task }
  | { type: 'TASK_DELETED'; payload: string }
  | { type: 'MESSAGE_SENT'; payload: ChatMessage }
  | { type: 'CHANNEL_CREATED'; payload: ChatChannel }
  | { type: 'SYNC_STATE'; payload: AirportDatabase };

interface AirportDatabase {
  flights: Flight[];
  logs: LogEntry[];
  tasks: Task[];
  channels: ChatChannel[];
  messages: ChatMessage[];
  users: UserProfile[];
}

const DB_KEY = 'NOFY_VIRTUAL_DB_V4';
const SYNC_CHANNEL = 'nofy_ops_sync';

// --- SERVICE IMPLEMENTATION ---

class BackendService {
  private db: AirportDatabase;
  private subscribers: Set<(event: BackendEvent) => void> = new Set();
  private broadcast: BroadcastChannel;

  constructor() {
    this.db = this.load();
    this.broadcast = new BroadcastChannel(SYNC_CHANNEL);
    
    this.broadcast.onmessage = (event) => {
      const backendEvent = event.data as BackendEvent;
      if (backendEvent.type === 'SYNC_STATE') {
        this.db = backendEvent.payload;
        this.notify(backendEvent);
      } else {
        this.handleExternalEvent(backendEvent);
      }
    };
  }

  private load(): AirportDatabase {
    const saved = localStorage.getItem(DB_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        parsed.logs = parsed.logs.map((l: any) => ({ ...l, timestamp: new Date(l.timestamp) }));
        parsed.messages = parsed.messages.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) }));
        parsed.channels = parsed.channels.map((c: any) => ({ 
          ...c, 
          lastMessageTime: c.lastMessageTime ? new Date(c.lastMessageTime) : undefined 
        }));
        return parsed;
      } catch (e) {
        console.error("DB Corruption, resetting", e);
      }
    }
    return this.getInitialData();
  }

  private save(event: BackendEvent) {
    localStorage.setItem(DB_KEY, JSON.stringify(this.db));
    this.notify(event);
    this.broadcast.postMessage(event);
  }

  private notify(event: BackendEvent) {
    this.subscribers.forEach(sub => sub(event));
  }

  private handleExternalEvent(event: BackendEvent) {
    switch(event.type) {
      case 'LOG_ADDED': this.db.logs.push(event.payload); break;
      case 'TASK_UPDATED': this.db.tasks = this.db.tasks.map(t => t.id === event.payload.id ? event.payload : t); break;
      case 'TASK_ADDED': this.db.tasks.push(event.payload); break;
      case 'TASK_DELETED': this.db.tasks = this.db.tasks.filter(t => t.id !== event.payload); break;
      case 'MESSAGE_SENT': this.db.messages.push(event.payload); break;
    }
    this.notify(event);
  }

  public subscribe(callback: (event: BackendEvent) => void) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  public queries = {
    getFlights: async (): Promise<Flight[]> => {
      await this.delay(100);
      return [...this.db.flights];
    },
    getLogs: async (): Promise<LogEntry[]> => {
      return [...this.db.logs].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    },
    getTasks: async (): Promise<Task[]> => {
      return [...this.db.tasks].sort((a, b) => a.dueTime.localeCompare(b.dueTime));
    },
    getChannels: async (): Promise<ChatChannel[]> => {
      return [...this.db.channels];
    },
    getMessages: async (channelId: string): Promise<ChatMessage[]> => {
      return this.db.messages.filter(m => m.channelId === channelId);
    },
    getUsers: async (): Promise<UserProfile[]> => {
      return [...this.db.users];
    }
  };

  public commands = {
    addLog: async (log: LogEntry) => {
      this.db.logs.push(log);
      this.save({ type: 'LOG_ADDED', payload: log });
    },
    updateTask: async (taskId: string, updates: Partial<Task>) => {
      this.db.tasks = this.db.tasks.map(t => t.id === taskId ? { ...t, ...updates } : t);
      const updated = this.db.tasks.find(t => t.id === taskId);
      if (updated) this.save({ type: 'TASK_UPDATED', payload: updated });
    },
    addTask: async (task: Task) => {
      this.db.tasks.push(task);
      this.save({ type: 'TASK_ADDED', payload: task });
    },
    deleteTask: async (taskId: string) => {
      this.db.tasks = this.db.tasks.filter(t => t.id !== taskId);
      this.save({ type: 'TASK_DELETED', payload: taskId });
    },
    sendMessage: async (msg: ChatMessage) => {
      this.db.messages.push(msg);
      this.db.channels = this.db.channels.map(c => 
        c.id === msg.channelId 
          ? { ...c, lastMessage: msg.content, lastMessageTime: msg.timestamp, unreadCount: (c.unreadCount || 0) + 1 } 
          : c
      );
      this.save({ type: 'MESSAGE_SENT', payload: msg });
    },
    createChannel: async (channel: ChatChannel) => {
      this.db.channels.unshift(channel);
      this.save({ type: 'CHANNEL_CREATED', payload: channel });
    }
  };

  private delay(ms: number) {
    return new Promise(res => setTimeout(res, ms));
  }

  private getInitialData(): AirportDatabase {
    return {
      flights: [
        { flightNumber: 'PR 1845', airline: 'Philippine Airlines', type: 'DEPARTURE', origin: 'CEB', destination: 'Manila (MNL)', status: 'ON TIME', gate: '4', paxCount: 178, capacity: 180, scheduledTime: '09:30', estimatedTime: '09:30', assignedCounters: '1-4', bagDrop: 'Counter 1', terminal: Terminal.T1, ssr: { wchr: 2, meda: 0, umnr: 1, vip: 0 } },
        { flightNumber: '5J 556', airline: 'Cebu Pacific', type: 'DEPARTURE', origin: 'CEB', destination: 'Dubai (DXB)', status: 'DELAYED', reasonCode: 'Late Inbound Aircraft', gate: '6', paxCount: 420, capacity: 430, scheduledTime: '14:00', estimatedTime: '15:30', assignedIsland: 'A', bagDrop: 'A1-A6', terminal: Terminal.T2, ssr: { wchr: 5, meda: 1, umnr: 0, vip: 2 }, criticalIssue: 'Provide water/snacks at Gate' },
        { flightNumber: 'DG 6022', airline: 'Cebu Pacific', type: 'ARRIVAL', origin: 'Dumaguete (DGT)', destination: 'CEB', status: 'LANDED', gate: '2', paxCount: 72, capacity: 78, scheduledTime: '08:45', estimatedTime: '08:42', carousel: 'Belt 1', terminal: Terminal.T1, ssr: { wchr: 1, meda: 0, umnr: 0, vip: 0 } }
      ],
      logs: [
        { id: 'log-1', timestamp: new Date(Date.now() - 1000 * 60 * 2), message: 'FIRE ALARM ACTIVATED: Zone D, Concession Area. Evacuation Protocol Standby.', category: 'INCIDENT', severity: IncidentSeverity.CRITICAL, originDept: Department.SECURITY, targetDept: [Department.AOCC, Department.SAFETY_QUALITY], agenciesInvolved: [], terminal: Terminal.T2 },
        { id: 'log-2', timestamp: new Date(Date.now() - 1000 * 60 * 12), message: 'Medical Emergency: Passenger collapsed at Gate 4. Breathing faint.', category: 'PASSENGER', severity: IncidentSeverity.URGENT, originDept: Department.TERMINAL_OPS, targetDept: [Department.SAFETY_QUALITY], agenciesInvolved: [], terminal: Terminal.T1 }
      ],
      tasks: [
        { id: 't1', title: '08:00 Queue Check', description: 'Monitor check-in density.', dueTime: '08:00', status: 'COMPLETED', type: 'QUEUE_CHECK' },
        { id: 't2', title: '08:30 Hazard Patrol', description: 'Confirm Zone B is clear of spills.', dueTime: '08:30', status: 'PENDING', type: 'HAZARD_CHECK' }
      ],
      channels: [
        { id: 'c1', name: 'AOCC Core Team', type: 'GROUP', participants: ['u2', 'u_aocc1'], lastMessage: 'System online.', lastMessageTime: new Date() }
      ],
      messages: [],
      users: [
        { id: 'u2', name: 'Engr. Mark D.', email: 'mark@mcia.ph', role: 'Systems Admin', department: Department.IT_SYSTEMS, status: 'ONLINE', allowedTerminals: [Terminal.T1, Terminal.T2], accessLevel: 'ADMIN', employeeId: 'SYS-001' },
        { id: 'u_aocc1', name: 'Ops Commander', email: 'cmd@mcia.ph', role: 'Senior Ops Chief', department: Department.AOCC, status: 'ONLINE', allowedTerminals: [Terminal.T1, Terminal.T2], accessLevel: 'ADMIN', employeeId: 'AOCC-001' },
        { id: 'u3', name: 'Capt. R. Santos', email: 'santos@mcia.ph', role: 'Security Chief', department: Department.SECURITY, status: 'ONLINE', allowedTerminals: [Terminal.T2], accessLevel: 'VIEWER', employeeId: 'T2-SEC-001' }
      ]
    };
  }
}

export const api = new BackendService();


import { 
  Flight, LogEntry, Task, UserProfile, ChatChannel, ChatMessage, 
  Terminal, Department, IncidentSeverity, AccessLevel, PassengerStatus, LogUpdate
} from './types';

// --- PERSISTENCE TYPES ---

export type SyncStatus = 'ONLINE' | 'OFFLINE' | 'SYNCING' | 'ERROR';

export type BackendEvent = 
  | { type: 'LOG_ADDED'; payload: LogEntry }
  | { type: 'LOG_UPDATED'; payload: LogEntry }
  | { type: 'TASK_UPDATED'; payload: Task }
  | { type: 'TASK_ADDED'; payload: Task }
  | { type: 'TASK_DELETED'; payload: string }
  | { type: 'CHANNEL_CREATED'; payload: ChatChannel }
  | { type: 'SYNC_STATUS_CHANGED'; payload: SyncStatus }
  | { type: 'MESSAGE_SENT'; payload: ChatMessage }
  | { type: 'SYNC_STATE'; payload: AirportDatabase };

interface AirportDatabase {
  flights: Flight[];
  logs: LogEntry[];
  tasks: Task[];
  channels: ChatChannel[];
  messages: ChatMessage[];
  users: UserProfile[];
}

const DB_KEY = 'NOFY_VIRTUAL_DB_V7_RESILIENT';
const SYNC_CHANNEL = 'nofy_ops_sync';

class BackendService {
  private db: AirportDatabase;
  private subscribers: Set<(event: BackendEvent) => void> = new Set();
  private broadcast: BroadcastChannel;
  private outbox: any[] = [];
  public syncStatus: SyncStatus = 'ONLINE';

  constructor() {
    this.db = this.load();
    this.broadcast = new BroadcastChannel(SYNC_CHANNEL);
    
    // Simulate real-world network fluctuations
    this.initNetworkMonitoring();

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

  private initNetworkMonitoring() {
    window.addEventListener('online', () => this.handleConnectivityChange('ONLINE'));
    window.addEventListener('offline', () => this.handleConnectivityChange('OFFLINE'));
    
    // Randomly simulate "Dead Zones" for demo purposes
    setInterval(() => {
      if (Math.random() > 0.95) {
        this.handleConnectivityChange('OFFLINE');
        setTimeout(() => this.handleConnectivityChange('ONLINE'), 3000);
      }
    }, 15000);
  }

  private handleConnectivityChange(status: SyncStatus) {
    this.syncStatus = status;
    this.notify({ type: 'SYNC_STATUS_CHANGED', payload: status });
    if (status === 'ONLINE' && this.outbox.length > 0) {
      this.processOutbox();
    }
  }

  private async processOutbox() {
    this.handleConnectivityChange('SYNCING');
    await new Promise(r => setTimeout(r, 1000)); // Simulate upload latency
    console.log(`NOFY SYNC: Processing ${this.outbox.length} queued events.`);
    this.outbox = [];
    this.saveToDisk();
    this.handleConnectivityChange('ONLINE');
  }

  private load(): AirportDatabase {
    const saved = localStorage.getItem(DB_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Re-hydrate dates
        parsed.logs = parsed.logs.map((l: any) => ({ 
          ...l, 
          timestamp: new Date(l.timestamp),
          updates: (l.updates || []).map((u: any) => ({ ...u, timestamp: new Date(u.timestamp) }))
        }));
        parsed.messages = parsed.messages.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) }));
        parsed.channels = parsed.channels.map((c: any) => ({ 
          ...c, 
          lastMessageTime: c.lastMessageTime ? new Date(c.lastMessageTime) : undefined 
        }));
        return parsed;
      } catch (e) { console.error("Re-init DB", e); }
    }
    return this.getInitialData();
  }

  private saveToDisk() {
    localStorage.setItem(DB_KEY, JSON.stringify(this.db));
    this.broadcast.postMessage({ type: 'SYNC_STATE', payload: this.db });
  }

  private recordChange(event: BackendEvent) {
    // Update local memory immediately (Optimistic UI)
    switch(event.type) {
      case 'LOG_ADDED': 
        this.db.logs.unshift(event.payload); 
        break;
      case 'LOG_UPDATED':
        this.db.logs = this.db.logs.map(l => l.id === event.payload.id ? event.payload : l);
        break;
      case 'MESSAGE_SENT': 
        this.db.messages.push(event.payload); 
        this.db.channels = this.db.channels.map(c => 
          c.id === event.payload.channelId 
            ? { ...c, lastMessage: event.payload.content, lastMessageTime: event.payload.timestamp } 
            : c
        );
        break;
      case 'TASK_UPDATED': 
        this.db.tasks = this.db.tasks.map(t => t.id === event.payload.id ? event.payload : t); 
        break;
      case 'TASK_ADDED': 
        this.db.tasks.push(event.payload); 
        break;
      case 'TASK_DELETED': 
        this.db.tasks = this.db.tasks.filter(t => t.id !== event.payload); 
        break;
      case 'CHANNEL_CREATED': 
        this.db.channels.unshift(event.payload); 
        break;
    }

    if (this.syncStatus === 'OFFLINE') {
      console.warn("NOFY OFFLINE: Change queued in Outbox.");
      this.outbox.push(event);
    } else {
      this.saveToDisk();
    }
    
    this.notify(event);
  }

  private notify(event: BackendEvent) {
    this.subscribers.forEach(sub => sub(event));
  }

  private handleExternalEvent(event: BackendEvent) {
    this.notify(event);
  }

  public subscribe(callback: (event: BackendEvent) => void) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  // --- API: QUERIES ---

  public queries = {
    getFlights: async () => [...this.db.flights],
    getLogs: async () => [...this.db.logs].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()),
    getTasks: async () => [...this.db.tasks],
    getChannels: async () => [...this.db.channels],
    getMessages: async () => [...this.db.messages],
    getUsers: async () => [...this.db.users],
    getSyncStatus: () => this.syncStatus
  };

  // --- API: COMMANDS ---

  public commands = {
    addLog: async (log: LogEntry) => {
      this.recordChange({ type: 'LOG_ADDED', payload: log });
    },
    addLogUpdate: async (logId: string, update: LogUpdate) => {
      const log = this.db.logs.find(l => l.id === logId);
      if (log) {
          const updatedLog: LogEntry = {
              ...log,
              updates: [...(log.updates || []), update],
              isResolved: update.type === 'RESOLUTION' ? true : log.isResolved
          };
          this.recordChange({ type: 'LOG_UPDATED', payload: updatedLog });
      }
    },
    updateTask: async (taskId: string, updates: Partial<Task>) => {
      const task = this.db.tasks.find(t => t.id === taskId);
      if (task) {
        this.recordChange({ type: 'TASK_UPDATED', payload: { ...task, ...updates } });
      }
    },
    addTask: async (task: Task) => {
      this.recordChange({ type: 'TASK_ADDED', payload: task });
    },
    deleteTask: async (taskId: string) => {
      this.recordChange({ type: 'TASK_DELETED', payload: taskId });
    },
    sendMessage: async (msg: ChatMessage) => {
      this.recordChange({ type: 'MESSAGE_SENT', payload: msg });
    },
    createChannel: async (channel: ChatChannel) => {
      this.recordChange({ type: 'CHANNEL_CREATED', payload: channel });
    }
  };

  private getInitialData(): AirportDatabase {
    return {
      flights: [
        { flightNumber: 'PR 1845', airline: 'Philippine Airlines', type: 'DEPARTURE', origin: 'CEB', destination: 'Manila (MNL)', status: 'ON TIME', gate: '4', paxCount: 178, capacity: 180, scheduledTime: '09:30', estimatedTime: '09:30', terminal: Terminal.T1, ssr: { wchr: 2, meda: 0, umnr: 1, vip: 0 } },
        { flightNumber: '5J 556', airline: 'Cebu Pacific', type: 'DEPARTURE', origin: 'CEB', destination: 'Dubai (DXB)', status: 'DELAYED', reasonCode: 'Late Inbound Aircraft', gate: '6', paxCount: 420, capacity: 430, scheduledTime: '14:00', estimatedTime: '15:30', assignedIsland: 'A', bagDrop: 'A1-A6', terminal: Terminal.T2, ssr: { wchr: 5, meda: 1, umnr: 0, vip: 2 } },
      ],
      logs: [
        { id: 'initial-critical-1', timestamp: new Date(), message: 'FIRE ALARM ACTIVATED: Terminal 2, Zone B Concourse. Automated evacuation standby.', category: 'INCIDENT', severity: IncidentSeverity.CRITICAL, originDept: Department.SECURITY, targetDept: [Department.AOCC, Department.SAFETY_QUALITY], agenciesInvolved: [], terminal: Terminal.T2, isResolved: false },
        { id: 'initial-critical-2', timestamp: new Date(Date.now() - 1000 * 60 * 5), message: 'SECURITY BREACH: Unauthorized access at Gate 5 perimeter. Response team dispatched.', category: 'INCIDENT', severity: IncidentSeverity.URGENT, originDept: Department.SECURITY, targetDept: [Department.AOCC], agenciesInvolved: [], terminal: Terminal.T1, isResolved: false }
      ],
      tasks: [
        { id: 't1', title: '08:00 Queue Check', description: 'Monitor check-in density.', dueTime: '08:00', status: 'COMPLETED', type: 'QUEUE_CHECK' },
        { id: 't2', title: '08:30 Hazard Patrol', description: 'Confirm Zone B clear.', dueTime: '08:30', status: 'PENDING', type: 'HAZARD_CHECK' }
      ],
      channels: [
        { id: 'c1', name: 'AOCC Core Team', type: 'GROUP', participants: ['u1'], lastMessage: 'System online.', lastMessageTime: new Date() }
      ],
      messages: [],
      users: [
        { id: 'u1', employeeId: 'SYS-001', name: 'Duty Chief', email: 'chief@mcia.ph', role: 'Ops Lead', department: Department.AOCC, status: 'ONLINE', allowedTerminals: [Terminal.T1, Terminal.T2], accessLevel: 'ADMIN' }
      ]
    };
  }
}

export const api = new BackendService();

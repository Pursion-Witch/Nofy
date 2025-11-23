

export type UserRole = string;

export enum Department {
  AOCC = 'AOCC_CORE', // The "Brain"
  SECURITY = 'SECURITY', // National, Local, PNP
  TERMINAL_OPS = 'TERMINAL_OPS', // Flow, Facilities, Immigration
  SAFETY_QUALITY = 'SAFETY_QUALITY', // Sanitation, Waste
  APRON_PBB = 'APRON_PBB', // Boarding bridges, Ground parking
  IT_SYSTEMS = 'IT_SYSTEMS',
  AIRLINE_MARKETING = 'AIRLINE_MARKETING',
  CUSTOMER_EXP = 'CUSTOMER_EXP' // Voice of customer, Govt relations
}

export enum IncidentSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
  CRITICAL = 'CRITICAL'
}

export enum Agency {
  PAGASA = 'PAGASA',
  DOH = 'DOH',
  DOTR = 'DOTR',
  DRRMC = 'DRRMC',
  CEBU_PORT = 'CEBU_PORT',
  PNP = 'PNP_AVIATION',
  BI = 'BUREAU_IMMIGRATION',
  OTS = 'OTS_SECURITY',
  BFP = 'BFP'
}

export enum Terminal {
  T1 = 'T1',
  T2 = 'T2'
}

export interface LogEntry {
  id: string;
  timestamp: Date;
  message: string;
  category: 'INCIDENT' | 'STRATEGIC' | 'PASSENGER' | 'RESOURCE' | 'SYSTEM' | 'OPERATIONAL' | 'CALL_LOG';
  severity: IncidentSeverity;
  originDept: Department;
  targetDept?: Department[]; // Who needs to see this?
  agenciesInvolved: Agency[];
  aiAnalysis?: string;
  terminal?: Terminal;
}

export interface ResourceStatus {
  id: string;
  type: 'CHECK_IN' | 'CAROUSEL' | 'GATE' | 'PARKING_STAND';
  status: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE';
  assignedTo?: string; // e.g., "PR123" or "Cebu Pacific"
  terminal: Terminal;
  locationGroup?: string; // e.g. "Island A", "North Wing"
  queueTimeMin?: number; // For check-in queues
}

export interface FlightSSR {
  wchr: number; // Wheelchair
  meda: number; // Medical Case
  umnr: number; // Unaccompanied Minor
  vip: number;
}

export interface Flight {
  flightNumber: string;
  airline: string;
  type: 'ARRIVAL' | 'DEPARTURE';
  origin: string;      // Used for Arrivals
  destination: string; // Used for Departures
  status: 'ON TIME' | 'DELAYED' | 'CANCELLED' | 'BOARDING' | 'LANDED' | 'CHECK-IN' | 'APPROACHING';
  gate: string;
  terminal: Terminal;
  
  // Time
  scheduledTime: string; // "14:30"
  estimatedTime: string; // "14:45"

  // Capacity & Load
  paxCount: number;
  capacity: number; // Total seats

  // Operational Context
  assignedCounters?: string; // T1
  assignedIsland?: string; // T2
  carousel?: string; // For Arrivals

  // Critical Ops Data
  ssr: FlightSSR; // Special Service Requests
  criticalIssue?: string; // General alert text
  reasonCode?: string; // Detailed reason for Delay/Cancel (e.g. "Technical", "Weather")
}

export interface PatientCase {
  id: string;
  flightNumber: string;
  condition: string; // e.g., "Cardiac", "Wheelchair", "Pregnant"
  status: 'WAITING_MEDIC' | 'TRANSPORTING' | 'CLEARED';
}

// Strategic Pillars
export enum StrategicPillar {
  CEBU_CONNECTS = 'Cebu Connects',
  CEBU_PLUS = 'Cebu+',
  CEB_BALIK = 'CEB-Balik'
}

// Chat & User System
export interface UserProfile {
  id: string;
  name: string;
  email: string; // Added email
  role: string;
  department: Department;
  avatarUrl?: string;
  status: 'ONLINE' | 'BUSY' | 'OFFLINE';
  allowedTerminals: Terminal[];
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: Date;
  isRead: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  dueTime: string; // e.g. "08:30"
  status: 'PENDING' | 'COMPLETED';
  type: 'QUEUE_CHECK' | 'HAZARD_CHECK' | 'ROAMING';
}
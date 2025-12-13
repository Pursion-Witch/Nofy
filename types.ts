
export type UserRole = string;

export enum Department {
  AOCC = 'AOCC_CORE', // The "Brain"
  SECURITY = 'SECURITY', // National, Local, PNP
  TERMINAL_OPS = 'TERMINAL_OPS', // Flow, Facilities, Immigration
  SAFETY_QUALITY = 'SAFETY_QUALITY', // Sanitation, Waste
  APRON_PBB = 'APRON_PBB', // Boarding bridges, Ground parking
  IT_SYSTEMS = 'IT_SYSTEMS',
  AIRLINE_OPS = 'AIRLINE_OPS', // Flight crews, Boarding, Check-in
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
  BFP = 'BFP',
  PNP = 'PNP'
}

export enum StrategicPillar {
  CEBU_CONNECTS = 'CEBU_CONNECTS',
  CEBU_PLUS = 'CEBU_PLUS',
  BALIK_BAYANI = 'BALIK_BAYANI'
}

export enum Terminal {
  T1 = 'T1',
  T2 = 'T2'
}

export type UserStatus = 'ONLINE' | 'BUSY' | 'AWAY' | 'OFFLINE' | 'BREAK' | 'LEAVE';

// New Access Levels
export type AccessLevel = 'ADMIN' | 'OPERATOR' | 'VIEWER' | 'RESTRICTED';

export interface UserProfile {
  id: string;
  employeeId: string; // New: Specific ID based on role
  name: string;
  email: string;
  role: string;
  department: Department;
  status: UserStatus | string;
  allowedTerminals: Terminal[];
  accessLevel: AccessLevel; // New: Controls UI permission
  airline?: string; // New field for Airline Ops privacy
}

export interface ChatChannel {
  id: string;
  name: string;
  type: 'DIRECT' | 'GROUP';
  participants: string[]; // User IDs
  lastMessage?: string;
  lastMessageTime?: Date;
  unreadCount?: number;
  avatar?: string; // For groups
}

export interface ChatMessage {
  id: string;
  channelId: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: Date;
  isRead: boolean;
}

export interface LogEntry {
  id: string;
  timestamp: Date;
  message: string;
  category: 'INCIDENT' | 'PASSENGER' | 'RESOURCE' | 'STRATEGIC' | 'SYSTEM' | 'OPERATIONAL' | 'CALL_LOG' | 'AIRLINE_REQ';
  severity: IncidentSeverity;
  originDept: Department;
  targetDept: Department[];
  agenciesInvolved: Agency[];
  terminal: Terminal;
  aiAnalysis?: string;
  relatedAirline?: string; // For filtering alerts
}

export interface ResourceStatus {
  id: string;
  type: 'CHECK_IN' | 'CAROUSEL' | 'GATE' | 'PARKING_STAND';
  status: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE' | 'CLOSED';
  assignedTo?: string; // Flight Number
  terminal: Terminal;
}

export interface SSRObject {
  wchr: number;
  meda: number;
  umnr: number;
  vip: number;
}

export interface Flight {
  flightNumber: string;
  airline: string;
  type: 'ARRIVAL' | 'DEPARTURE';
  origin: string;
  destination: string;
  status: 'ON TIME' | 'DELAYED' | 'CANCELLED' | 'LANDED' | 'BOARDING' | 'APPROACHING';
  gate?: string;
  carousel?: string; // Arrivals
  assignedCounters?: string; // Departures Check-in
  assignedIsland?: string; // Departures Check-in (T2)
  bagDrop?: string; // Departures Bag Drop
  paxCount: number;
  capacity: number;
  scheduledTime: string;
  estimatedTime: string;
  terminal: Terminal;
  reasonCode?: string;
  criticalIssue?: string;
  ssr: SSRObject;
}

export interface PatientCase {
  id: string;
  flightNumber: string;
  condition: string;
  status: 'WAITING_MEDIC' | 'TREATED' | 'TRANSPORTED';
}

export interface Task {
  id: string;
  title: string;
  description: string;
  dueTime: string;
  status: 'PENDING' | 'COMPLETED' | 'MISSED';
  type: 'QUEUE_CHECK' | 'HAZARD_CHECK' | 'ROAMING' | 'EQUIPMENT_CHECK';
}

// MANIFEST TYPES
export enum PassengerStatus {
  // DEPARTURE
  CHECKED_IN = 'CHECKED_IN',
  BOARDED = 'BOARDED',
  NO_SHOW = 'NO_SHOW',
  MISSING = 'MISSING',
  OFFLOADED = 'OFFLOADED',
  
  // ARRIVAL / TRANSFER
  DEPLANED = 'DEPLANED',
  AT_BAG_DROP = 'AT_BAG_DROP',
  TRANSFER_DOMESTIC = 'TRANSFER_DOMESTIC',
  TRANSFER_INTL = 'TRANSFER_INTL',

  // EMERGENCY / ALERT
  ATTENTION = 'ATTENTION'
}

export enum TransferStatus {
  ARRIVED = 'ARRIVED',
  DEPLANED = 'DEPLANED',
  AT_BAG_DROP = 'AT_BAG_DROP',
  CHECK_THRU_DOM = 'CHECK_THRU_DOM', // Domestic Connection
  CHECK_THRU_INTL = 'CHECK_THRU_INTL', // International Connection
  WAITING = 'WAITING',
  DELAYED = 'DELAYED',
  MISSING = 'MISSING',
  ATTENTION = 'ATTENTION'
}

// CEBU+ TYPES (Sea-Air)
export enum CebuPlusStatus {
  ARRIVED = 'ARRIVED',
  DEPLANED = 'DEPLANED',        // From Flight
  DISEMBARKED = 'DISEMBARKED',  // From Ferry
  BAG_DROP = 'BAG_DROP',
  IN_TRANSIT_SEAPORT = 'IN_TRANSIT_SEAPORT', // On the bus/van to Seaport
  IN_TRANSIT_AIRPORT = 'IN_TRANSIT_AIRPORT', // On the bus/van to Airport
  CHECKED_THRU = 'CHECKED_THRU',
  WAITING = 'WAITING',
  DELAYED = 'DELAYED',
  BOARDED = 'BOARDED',
  MISSING = 'MISSING',
  ATTENTION = 'ATTENTION'
}

export interface CebuPlusPassenger {
  id: string;
  name: string;
  pnr: string;
  identityDoc: string;
  direction: 'AIRPORT_TO_SEAPORT' | 'SEAPORT_TO_AIRPORT';
  originTransport: string; // Flight Number or Ferry Name
  originStatus: string;
  connectingTransport: string; // Ferry Name or Flight Number
  connectingStatus: string; // Ferry Operator or Flight Status
  operator: string;
  operatorContact: string;
  assignedVehicle: string; // e.g. "Van-01", "Shuttle-A"
  vehicleContact: string;
  status: CebuPlusStatus;
  timeToDepart: number; // Minutes
  alertDetails?: string;
}

// CEB-BALIK TYPES (OFW)
export enum OFWStatus {
  DEPLANED = 'DEPLANED',
  AT_IMMIGRATION = 'AT_IMMIGRATION',
  BAG_DROP = 'BAG_DROP',
  CLEARED = 'CLEARED',
  ATTENTION = 'ATTENTION'
}

export interface OFWPassenger {
  id: string;
  name: string;
  passport: string;
  flightNumber: string;
  airline: string;
  flightStatus: 'INBOUND' | 'ARRIVED' | 'DELAYED' | 'CANCELLED';
  status: OFWStatus;
  connectingType: 'FLIGHT' | 'SEA' | 'NONE';
  connectingDetails?: string; // "PR 2850" or "OceanJet"
  alertDetails?: string;
}

export interface TransferPassenger {
  id: string;
  name: string;
  pnr: string;
  identityDoc: string; // Added field
  originFlight: string;
  originStatus: string; // Landed, Delayed
  connectingFlight: string;
  connectingStatus: string; // On Time, Boarding
  connectionType: 'INTL-INTL' | 'DOM-DOM' | 'INTL-DOM' | 'DOM-INTL';
  status: TransferStatus;
  timeToDepart: number; // Minutes remaining
  alertDetails?: string;
}

export enum TravelClass {
  ECONOMY = 'ECONOMY',
  BUSINESS = 'BUSINESS',
  FIRST = 'FIRST'
}

export interface Passenger {
  id: string;
  pnr: string;
  name: string;
  seat: string;
  class: TravelClass;
  status: PassengerStatus;
  gender: 'M' | 'F';
  nationality: string;
  isVip: boolean;
  ssrCodes: string[];
  medicalInfo?: string;
  baggageCount: number;
  hasBoarded: boolean;
  identityDoc: string;
  // New Fields
  alertDetails?: string; 
  connectingFlight?: string;
}

export interface CrewMember {
  id: string;
  name: string;
  role: 'CAPTAIN' | 'FIRST_OFFICER' | 'PURSER' | 'CABIN_CREW' | 'SECURITY';
  employeeId: string;
  isOnboard: boolean;
}

export interface Manifest {
  flightNumber: string;
  passengers: Passenger[];
  crew: CrewMember[];
}
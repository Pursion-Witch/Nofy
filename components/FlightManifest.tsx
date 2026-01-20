
import React, { useState, useEffect, useRef } from 'react';
import { 
  X, User, Search, Filter, Shield, AlertTriangle, 
  CheckCircle2, Crown, Stethoscope, Plane, Luggage, 
  MoreVertical, Megaphone, Ambulance, Accessibility, FileText, ArrowRightLeft, Siren, ExternalLink, ChevronDown, Activity, Baby, EyeOff, EarOff, MapPin, Building2, Eye
} from 'lucide-react';
import { Flight, Manifest, Passenger, CrewMember, PassengerStatus, TravelClass } from '../types';

interface FlightManifestProps {
  flight: Flight;
  onClose: () => void;
  onSwitchFlight?: (targetFlightNumber: string) => void;
  readOnly?: boolean; // New Prop for Permissions
}

// --- MOCK DATA GENERATOR ---
const NAMES_FIRST = ['Juan', 'Maria', 'Jose', 'Ana', 'Pedro', 'Luis', 'Sofia', 'Miguel', 'Elena', 'Antonio', 'David', 'Sarah', 'James', 'Emily', 'Robert', 'Jennifer'];
const NAMES_LAST = ['Santos', 'Reyes', 'Cruz', 'Garcia', 'Mendoza', 'Torres', 'Flores', 'Lim', 'Tan', 'Dela Cruz', 'Smith', 'Johnson', 'Williams', 'Brown', 'Jones'];
const NATIONALITIES = ['PHL', 'PHL', 'PHL', 'USA', 'KOR', 'JPN', 'CHN', 'SGP', 'GBR'];
const ALERT_REASONS = [
    'Security: Unruly Behavior',
    'Operations: Late Connection',
    'Immigration: Document Check',
    'Operations: Lost Item Reported'
];

// SPECIFIC MEDICAL CONDITIONS
const MEDICAL_CONDITIONS = [
    'Dementia - Needs Escort',
    'Heart Condition - Avoid Stress',
    'Pregnant (28 Weeks)',
    'Diabetic - Insulin Maintenance',
    'PWD - Non-ambulatory',
    'Hypertension Monitor',
    'Vision Impaired - Blind',
    'Hearing Impaired - Deaf'
];

const generateMockManifest = (flight: Flight): Manifest => {
  const passengers: Passenger[] = [];
  const crew: CrewMember[] = [];
  const isArrival = flight.type === 'ARRIVAL';

  // Generate Crew
  crew.push({ id: 'c1', name: 'Capt. Roberto Diaz', role: 'CAPTAIN', employeeId: 'CPT-8821', isOnboard: true });
  crew.push({ id: 'c2', name: 'FO. James Lim', role: 'FIRST_OFFICER', employeeId: 'FO-9921', isOnboard: true });
  crew.push({ id: 'c3', name: 'Sarah Mendoza', role: 'PURSER', employeeId: 'CC-1120', isOnboard: true });
  for (let i = 0; i < 4; i++) {
     crew.push({ 
        id: `cc-${i}`, 
        name: `${NAMES_FIRST[i % NAMES_FIRST.length]} ${NAMES_LAST[i % NAMES_LAST.length]}`, 
        role: 'CABIN_CREW', 
        employeeId: `CC-20${i}`, 
        isOnboard: true 
     });
  }

  // Generate Passengers
  for (let i = 0; i < flight.paxCount; i++) {
    const isBiz = i < 12; // First 12 Business
    const gender = Math.random() > 0.5 ? 'M' : 'F';
    const statusRand = Math.random();
    
    let status = PassengerStatus.BOARDED; // Default
    let alertDetails = undefined;
    let connectingFlight = undefined;
    let medicalInfo = undefined;
    let ssr = [];

    // ASSIGN MEDICAL CONDITIONS RANDOMLY (Higher chance for demo visibility)
    if (Math.random() > 0.85) {
        medicalInfo = MEDICAL_CONDITIONS[Math.floor(Math.random() * MEDICAL_CONDITIONS.length)];
        ssr.push('MEDA');
        if (medicalInfo.includes('PWD') || medicalInfo.includes('Non-ambulatory')) ssr.push('WCHR');
        if (medicalInfo.includes('Pregnant')) ssr.push('PREG');
        if (medicalInfo.includes('Blind')) ssr.push('BLND');
        if (medicalInfo.includes('Deaf')) ssr.push('DEAF');
    }

    if (isArrival) {
       // ARRIVAL LOGIC
       if (statusRand > 0.98) {
          status = PassengerStatus.ATTENTION;
          alertDetails = ALERT_REASONS[Math.floor(Math.random() * ALERT_REASONS.length)];
       }
       else if (statusRand > 0.85) status = PassengerStatus.DEPLANED;
       else if (statusRand > 0.60) status = PassengerStatus.AT_BAG_DROP;
       else if (statusRand > 0.40) {
           status = PassengerStatus.TRANSFER_INTL;
           connectingFlight = `PR ${Math.floor(100 + Math.random() * 900)}`;
       }
       else if (statusRand > 0.30) {
           status = PassengerStatus.TRANSFER_DOMESTIC;
           connectingFlight = `5J ${Math.floor(300 + Math.random() * 600)}`;
       }
       else status = PassengerStatus.DEPLANED; 
       
       if (flight.status === 'APPROACHING') status = PassengerStatus.CHECKED_IN; 
    } else {
       // DEPARTURE LOGIC
       if (statusRand > 0.99) {
           status = PassengerStatus.ATTENTION; // Emergency at Gate
           alertDetails = 'Gate: Missing Travel Docs';
       }
       else if (statusRand > 0.95) status = PassengerStatus.MISSING;
       else if (statusRand > 0.85) status = PassengerStatus.CHECKED_IN; // Not yet boarded
       else if (statusRand > 0.98) status = PassengerStatus.NO_SHOW;
       else status = PassengerStatus.BOARDED;
    }

    if (Math.random() > 0.95 && !ssr.includes('WCHR')) ssr.push('WCHR');
    if (Math.random() > 0.9) ssr.push('VGML');

    // Generate Passport/ID
    const idPrefix = Math.random() > 0.5 ? 'P' : 'ID';
    const idNum = Math.floor(1000000 + Math.random() * 9000000);

    passengers.push({
      id: `p-${i}`,
      pnr: Math.random().toString(36).substring(2, 8).toUpperCase(),
      name: `${NAMES_FIRST[Math.floor(Math.random() * NAMES_FIRST.length)]} ${NAMES_LAST[Math.floor(Math.random() * NAMES_LAST.length)]}`,
      seat: `${Math.floor(i / 6) + 1}${['A','B','C','D','E','F'][i % 6]}`,
      class: isBiz ? TravelClass.BUSINESS : TravelClass.ECONOMY,
      status: status,
      gender: gender,
      nationality: NATIONALITIES[Math.floor(Math.random() * NATIONALITIES.length)],
      isVip: isBiz || Math.random() > 0.98,
      ssrCodes: ssr,
      medicalInfo: medicalInfo,
      baggageCount: Math.floor(Math.random() * 3),
      hasBoarded: status === PassengerStatus.BOARDED,
      identityDoc: `${idPrefix}${idNum}`,
      alertDetails,
      connectingFlight
    });
  }

  return { flightNumber: flight.flightNumber, passengers, crew };
};

export const FlightManifest: React.FC<FlightManifestProps> = ({ flight, onClose, onSwitchFlight, readOnly = false }) => {
  const [manifest, setManifest] = useState<Manifest | null>(null);
  const [activeTab, setActiveTab] = useState<'PAX' | 'CREW'>('PAX');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<PassengerStatus | 'ALL' | 'MEDICAL'>('ALL');
  const [activeActionId, setActiveActionId] = useState<string | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    setManifest(generateMockManifest(flight));
  }, [flight]);

  useEffect(() => {
    const handleClickOutside = () => {
       setActiveActionId(null);
       setIsFilterOpen(false);
    };
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  if (!manifest) return <div className="p-10 text-center text-slate-400">Loading Manifest...</div>;

  const filteredPax = manifest.passengers.filter(p => {
     const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           p.pnr.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           p.identityDoc.toLowerCase().includes(searchQuery.toLowerCase());
     
     if (statusFilter === 'ALL') return matchesSearch;
     if (statusFilter === 'MEDICAL') return matchesSearch && (p.medicalInfo !== undefined || p.ssrCodes.includes('WCHR') || p.ssrCodes.includes('MEDA'));
     
     return matchesSearch && p.status === statusFilter;
  });

  const isArrival = flight.type === 'ARRIVAL';
  const medicalCount = manifest.passengers.filter(p => p.medicalInfo || p.ssrCodes.includes('WCHR')).length;
  const checkedInCount = manifest.passengers.filter(p => p.status === PassengerStatus.CHECKED_IN || p.status === PassengerStatus.BOARDED).length;
  const boardedCount = manifest.passengers.filter(p => p.status === PassengerStatus.BOARDED).length;
  const missingCount = manifest.passengers.filter(p => p.status === PassengerStatus.MISSING || p.status === PassengerStatus.NO_SHOW).length;

  const handleAction = (action: string, paxName: string) => {
    console.log(`Executing ${action} for ${paxName}`);
    setActiveActionId(null);
  };

  const getStatusBadge = (p: Passenger) => {
      switch (p.status) {
          case PassengerStatus.BOARDED:
              return <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md border text-[10px] font-bold bg-emerald-900/20 border-emerald-500/30 text-emerald-400"><CheckCircle2 className="w-3 h-3" /> BOARDED</div>;
          case PassengerStatus.MISSING:
              return <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md border text-[10px] font-bold bg-rose-900/20 border-rose-500/30 text-rose-400 animate-pulse"><AlertTriangle className="w-3 h-3" /> MISSING</div>;
          case PassengerStatus.CHECKED_IN:
              return <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md border text-[10px] font-bold bg-sky-900/20 border-sky-500/30 text-sky-400">CHECKED IN</div>;
          case PassengerStatus.ATTENTION:
              return (
                  <div className="relative group cursor-help inline-block">
                      <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md border text-[10px] font-bold bg-red-600 text-white animate-pulse">
                          <Siren className="w-3 h-3" /> ATTENTION
                      </div>
                      <div className="absolute left-0 bottom-full mb-2 w-48 p-2 bg-slate-800 border border-red-500 rounded-lg shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 pointer-events-none">
                          <div className="text-[10px] text-red-400 font-bold uppercase mb-1 flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" /> Alert Reason
                          </div>
                          <div className="text-xs text-white">
                              {p.alertDetails || 'General Assistance Required'}
                          </div>
                      </div>
                  </div>
              );
          case PassengerStatus.DEPLANED:
              return <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md border text-[10px] font-bold bg-slate-700 border-slate-500 text-slate-300">DEPLANED</div>;
          case PassengerStatus.AT_BAG_DROP:
              return <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md border text-[10px] font-bold bg-indigo-900/20 border-indigo-500/30 text-indigo-300"><Luggage className="w-3 h-3" /> AT BAG DROP</div>;
          case PassengerStatus.TRANSFER_DOMESTIC:
              return (
                  <button 
                    onClick={(e) => { e.stopPropagation(); onSwitchFlight && p.connectingFlight && onSwitchFlight(p.connectingFlight); }}
                    className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md border text-[10px] font-bold bg-purple-900/20 border-purple-500/30 text-purple-300 hover:bg-purple-900/40 hover:scale-105 transition-all"
                  >
                      <ArrowRightLeft className="w-3 h-3" /> {p.connectingFlight || 'DOM-TRNSF'} <ExternalLink className="w-2 h-2 ml-0.5" />
                  </button>
              );
          case PassengerStatus.TRANSFER_INTL:
              return (
                  <button 
                    onClick={(e) => { e.stopPropagation(); onSwitchFlight && p.connectingFlight && onSwitchFlight(p.connectingFlight); }}
                    className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md border text-[10px] font-bold bg-orange-900/20 border-orange-500/30 text-orange-300 hover:bg-orange-900/40 hover:scale-105 transition-all"
                  >
                      <ArrowRightLeft className="w-3 h-3" /> {p.connectingFlight || 'INT-TRNSF'} <ExternalLink className="w-2 h-2 ml-0.5" />
                  </button>
              );
          default:
              return <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md border text-[10px] font-bold bg-slate-700 border-slate-600 text-slate-400">{p.status.replace('_', ' ')}</div>;
      }
  };

  const getFilterOptions = () => {
      let opts = ['ALL', 'MEDICAL', 'ATTENTION'];
      if (isArrival) {
          opts = [...opts, 'DEPLANED', 'AT_BAG_DROP', 'TRANSFER_DOMESTIC', 'TRANSFER_INTL'];
      } else {
          opts = [...opts, 'BOARDED', 'MISSING', 'CHECKED_IN', 'NO_SHOW'];
      }
      return opts;
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/90 backdrop-blur-sm animate-in fade-in duration-200">
       <div className="w-full md:max-w-[85vw] lg:max-w-5xl bg-slate-900 h-full shadow-2xl border-l border-slate-800 flex flex-col animate-in slide-in-from-right duration-300">
          
          {/* HEADER */}
          <div className="p-4 md:p-6 border-b border-slate-800 bg-slate-900 sticky top-0 z-20 shadow-md">
             <div className="flex justify-between items-start mb-4">
                <div>
                   <h2 className="text-xl md:text-2xl font-black text-white flex flex-wrap items-center gap-2 md:gap-3">
                      <Plane className={`w-5 h-5 md:w-6 md:h-6 text-indigo-500 transform ${isArrival ? 'rotate-45' : '-rotate-45'}`} />
                      {flight.airline} {flight.flightNumber}
                   </h2>
                   {/* OPERATOR & DESTINATION LINE */}
                   <div className="flex items-center gap-3 text-sm text-slate-400 mt-1">
                        {readOnly && (
                            <div className="flex items-center gap-1 px-2 py-0.5 bg-amber-900/20 border border-amber-600/30 rounded text-amber-500 text-xs font-bold">
                                <Eye className="w-3 h-3" /> READ ONLY ACCESS
                            </div>
                        )}
                        <span className="text-slate-600">|</span>
                        <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-emerald-500" />
                            <span>To: <span className="font-bold text-white">{flight.destination}</span></span>
                        </div>
                   </div>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors">
                   <X className="w-6 h-6" />
                </button>
             </div>

             {/* STATS BAR - 5 COLUMNS */}
             <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                <div className="bg-slate-800 p-2 rounded-lg border border-slate-700">
                   <div className="text-[10px] uppercase text-slate-500 font-bold">Total Pax</div>
                   <div className="text-xl font-bold text-white">{manifest.passengers.length}</div>
                </div>
                
                <div className={`p-2 rounded-lg border ${medicalCount > 0 ? 'bg-rose-900/20 border-rose-500/30' : 'bg-slate-800 border-slate-700'}`}>
                   <div className={`text-[10px] uppercase font-bold flex items-center gap-1 ${medicalCount > 0 ? 'text-rose-400' : 'text-slate-500'}`}>
                      <Stethoscope className="w-3 h-3" /> Medical
                   </div>
                   <div className={`text-xl font-bold ${medicalCount > 0 ? 'text-rose-200' : 'text-white'}`}>{medicalCount}</div>
                </div>

                <div className="bg-slate-800 p-2 rounded-lg border border-slate-700">
                   <div className="text-[10px] uppercase text-sky-500 font-bold">Checked In</div>
                   <div className="text-xl font-bold text-sky-200">{checkedInCount}</div>
                </div>

                <div className="bg-slate-800 p-2 rounded-lg border border-slate-700">
                   <div className="text-[10px] uppercase text-emerald-500 font-bold">Boarded</div>
                   <div className="text-xl font-bold text-emerald-200">{boardedCount}</div>
                </div>

                <div className={`p-2 rounded-lg border ${missingCount > 0 ? 'bg-amber-900/20 border-amber-500/30' : 'bg-slate-800 border-slate-700'}`}>
                   <div className={`text-[10px] uppercase font-bold ${missingCount > 0 ? 'text-amber-400' : 'text-slate-500'}`}>Missing/No-Show</div>
                   <div className={`text-xl font-bold ${missingCount > 0 ? 'text-amber-200' : 'text-white'}`}>{missingCount}</div>
                </div>
             </div>
          </div>

          {/* TABS & FILTERS */}
          <div className="px-4 md:px-6 py-3 border-b border-slate-800 bg-slate-900/95 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sticky top-[160px] z-10">
             <div className="flex bg-slate-800 rounded-lg p-1 w-full md:w-auto">
                <button onClick={() => setActiveTab('PAX')} className={`flex-1 md:flex-none px-4 py-2 text-xs font-bold rounded-md transition-all ${activeTab === 'PAX' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}>PASSENGERS</button>
                <button onClick={() => setActiveTab('CREW')} className={`flex-1 md:flex-none px-4 py-2 text-xs font-bold rounded-md transition-all ${activeTab === 'CREW' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}>CREW</button>
             </div>

             {activeTab === 'PAX' && (
                <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto md:flex-1 justify-end">
                   <div className="relative w-full md:w-64">
                      <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                      <input 
                         type="text" 
                         placeholder="Search Name, PNR, ID..."
                         value={searchQuery}
                         onChange={(e) => setSearchQuery(e.target.value)}
                         className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg pl-9 pr-3 py-2 focus:outline-none focus:border-indigo-500"
                      />
                   </div>
                   
                   {/* DROPDOWN FILTER */}
                   <div className="relative w-full md:w-auto">
                      <button 
                        onClick={(e) => { e.stopPropagation(); setIsFilterOpen(!isFilterOpen); }}
                        className={`w-full md:w-48 bg-slate-800 border border-slate-700 px-3 py-2 rounded-lg text-slate-300 hover:text-white flex items-center justify-between gap-2 ${isFilterOpen ? 'ring-2 ring-indigo-500 border-transparent' : ''}`}
                      >
                         <div className="flex items-center gap-2">
                            <Filter className="w-4 h-4" />
                            <span className="text-xs font-bold">{statusFilter === 'ALL' ? 'All Statuses' : statusFilter.replace('_', ' ')}</span>
                         </div>
                         <ChevronDown className={`w-4 h-4 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
                      </button>
                      
                      {isFilterOpen && (
                        <div className="absolute right-0 top-full mt-2 w-full md:w-48 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl p-1 z-50 animate-in zoom-in-95">
                             {getFilterOptions().map(status => (
                                <button 
                                  key={status}
                                  onClick={() => { setStatusFilter(status as any); setIsFilterOpen(false); }}
                                  className={`w-full text-left px-3 py-2 text-xs font-bold rounded-lg uppercase flex items-center justify-between ${
                                     statusFilter === status 
                                        ? 'bg-indigo-600 text-white' 
                                        : status === 'MEDICAL' ? 'text-rose-400 hover:bg-slate-700' : 'text-slate-300 hover:bg-slate-700'
                                  }`}
                                >
                                   {status.replace('_', ' ')}
                                   {statusFilter === status && <CheckCircle2 className="w-3 h-3" />}
                                   {status === 'MEDICAL' && statusFilter !== 'MEDICAL' && <Stethoscope className="w-3 h-3" />}
                                </button>
                             ))}
                        </div>
                      )}
                   </div>
                </div>
             )}
          </div>

          {/* LIST CONTENT */}
          <div className="flex-grow overflow-y-auto bg-slate-900 p-4 md:p-6 pb-20">
             {activeTab === 'CREW' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   {manifest.crew.map(member => (
                      <div key={member.id} className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex items-center gap-4">
                         <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center border border-slate-600">
                            <User className="w-6 h-6 text-indigo-400" />
                         </div>
                         <div>
                            <div className="text-sm font-bold text-white">{member.name}</div>
                            <div className="text-xs text-slate-400 font-mono">{member.role.replace('_', ' ')} • ID: {member.employeeId}</div>
                            <div className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-900/30 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                               <CheckCircle2 className="w-3 h-3" /> ONBOARD
                            </div>
                         </div>
                      </div>
                   ))}
                </div>
             )}

             {activeTab === 'PAX' && (
                <div className="space-y-2">
                   {filteredPax.map(pax => (
                      <div key={pax.id} className={`group bg-slate-800/50 hover:bg-slate-800 border hover:border-indigo-500/50 rounded-lg p-3 md:grid md:grid-cols-12 gap-2 md:gap-4 items-center transition-all relative ${
                          pax.medicalInfo || pax.ssrCodes.includes('WCHR') ? 'border-rose-500/30 bg-rose-900/10' : 'border-slate-700/50'
                      }`}>
                         {/* Name & Seat */}
                         <div className="col-span-4 flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm ${
                                  pax.class === 'BUSINESS' ? 'bg-amber-900/20 text-amber-400 border border-amber-500/30' : 'bg-slate-700 text-slate-300'
                               }`}>
                                  {pax.seat}
                            </div>
                            <div>
                                <div className="text-sm font-bold text-white flex items-center gap-2">
                                   {pax.name}
                                   {pax.isVip && <Crown className="w-3 h-3 text-amber-400 fill-amber-400" />}
                                   {pax.ssrCodes.includes('WCHR') && <Accessibility className="w-3 h-3 text-sky-400" />}
                                   {pax.ssrCodes.includes('PREG') && <Baby className="w-3 h-3 text-pink-400" />}
                                   {pax.ssrCodes.includes('BLND') && <EyeOff className="w-3 h-3 text-slate-400" />}
                                   {pax.ssrCodes.includes('DEAF') && <EarOff className="w-3 h-3 text-slate-400" />}
                                </div>
                                <div className="text-xs text-slate-500 flex items-center gap-2">
                                   {pax.class} • {pax.pnr}
                                </div>
                                {/* MEDICAL ALERT LINE - NOW PROMINENT */}
                                {pax.medicalInfo && (
                                    <div className="mt-1 flex items-center gap-1 text-[10px] text-rose-300 font-bold bg-rose-900/40 px-2 py-0.5 rounded w-fit border border-rose-500/30 animate-pulse">
                                        <Activity className="w-3 h-3" />
                                        {pax.medicalInfo}
                                    </div>
                                )}
                            </div>
                         </div>

                         {/* Status */}
                         <div className="col-span-3">
                            {getStatusBadge(pax)}
                         </div>

                         {/* Info */}
                         <div className="col-span-3">
                            <div className="text-xs font-mono text-slate-400 mb-1">{pax.identityDoc}</div>
                            {/* SSR Tags */}
                            <div className="flex gap-1 flex-wrap">
                                {pax.ssrCodes.map(code => (
                                    <span key={code} className="text-[9px] px-1 bg-slate-700 rounded text-slate-300 border border-slate-600">
                                        {code}
                                    </span>
                                ))}
                            </div>
                         </div>

                         {/* Actions - HIDDEN IF READ ONLY */}
                         <div className="col-span-2 relative flex justify-end">
                             {!readOnly && (
                                <>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); setActiveActionId(activeActionId === pax.id ? null : pax.id); }}
                                        className="p-1.5 hover:bg-slate-700 rounded text-slate-400 hover:text-white"
                                    >
                                        <MoreVertical className="w-4 h-4" />
                                    </button>
                                    {activeActionId === pax.id && (
                                        <div className="absolute right-0 top-8 w-56 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-[60] overflow-hidden animate-in zoom-in-95">
                                        <div className="p-2 border-b border-slate-700 bg-slate-900/50 text-[10px] font-bold text-slate-500 uppercase">Report Incident</div>
                                        <button onClick={() => handleAction('PAGE_PASSENGER', pax.name)} className="w-full text-left px-4 py-3 text-xs font-bold text-slate-200 hover:bg-indigo-600/20 hover:text-indigo-400 flex items-center gap-3"><Megaphone className="w-4 h-4" /> Call to Gate</button>
                                        <button onClick={() => handleAction('MEDICAL_ASSIST', pax.name)} className="w-full text-left px-4 py-3 text-xs font-bold text-slate-200 hover:bg-rose-900/20 hover:text-rose-400 flex items-center gap-3"><Ambulance className="w-4 h-4" /> Medical Assist</button>
                                        <button onClick={() => handleAction('TRANSPORT_ASSIST', pax.name)} className="w-full text-left px-4 py-3 text-xs font-bold text-slate-200 hover:bg-sky-900/20 hover:text-sky-400 flex items-center gap-3"><Accessibility className="w-4 h-4" /> Wheelchair / Transport</button>
                                        </div>
                                    )}
                                </>
                             )}
                         </div>
                      </div>
                   ))}
                </div>
             )}
          </div>
       </div>
    </div>
  );
};
import React, { useState } from 'react';
import { Send, Loader2, PackageX, HeartPulse, Sparkles, Clipboard, ArrowLeft, Languages, Activity, MapPin, Building2, Shield, Wrench, Siren, AlertTriangle } from 'lucide-react';
import { LogEntry, IncidentSeverity, Department, UserRole, Terminal } from '../types';
import { processCommandInput } from "../services/neuralClient";

interface CommandInterfaceProps {
  role: UserRole;
  department: Department;
  userName: string;
  currentTerminal: Terminal;
  onNewLog: (log: LogEntry) => void;
  onBack: () => void;
}

const CATEGORIES = [
  { id: 'GENERAL', label: 'General Report', icon: <Sparkles className="w-5 h-5" /> },
  { id: 'SECURITY', label: 'Security / Safety', icon: <Shield className="w-4 h-4" /> },
  { id: 'FACILITIES', label: 'Facilities / Ops', icon: <Wrench className="w-4 h-4" /> },
  { id: 'MEDICAL', label: 'Medical Emergency', icon: <Siren className="w-4 h-4" /> }
];

const LOCATION_OPTIONS = ['Terminal 1', 'Terminal 2', 'Arrival Area', 'Apron', 'Other'];

const TEAMS_BY_CAT = {
  SECURITY: ['MCIA Security', 'Police', 'Fire Department', 'K9 Unit'],
  FACILITIES: ['Janitorial', 'Maintenance', 'Power', 'Water'],
  MEDICAL: ['MCIA Clinic', 'Local Hospital', 'Quarantine Team']
};

export const CommandInterface: React.FC<CommandInterfaceProps> = ({ role, department, userName, currentTerminal, onNewLog, onBack }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('GENERAL');
  const [rawLogText, setRawLogText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Manual States
  const [incidentType, setIncidentType] = useState('');
  const [location, setLocation] = useState(LOCATION_OPTIONS[0]);
  const [description, setDescription] = useState('');
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);

  // AI Logic State
  const [aiPreview, setAiPreview] = useState<{
    translation: string;
    severity: IncidentSeverity;
    tier: 'RED' | 'ORANGE' | 'BLUE';
    depts: Department[];
  } | null>(null);

  const toggleTeam = (team: string) => {
    setSelectedTeams(prev => prev.includes(team) ? prev.filter(t => t !== team) : [...prev, team]);
  };

  /**
   * AI NEURAL PARSING LOGIC
   * Specifically tuned for the DeepSeek-V3 "Snappy" Translation Backend
   */
  const handleAIParse = async () => {
    if (!rawLogText.trim()) return;
    setIsProcessing(true);
    setAiPreview(null);

    try {
      // 1. Send to DeepSeek-V3 via our API
      const result = await processCommandInput(rawLogText, role, department);
      
      // 2. Handle structured Tool Calls (Success)
      if (result.toolCalls && result.toolCalls.length > 0) {
        const args = result.toolCalls[0].args as any;

        // Immediately capture the Intensity Flag (RED/ORANGE/BLUE)
        const tier = (args.intensityLevel || 'BLUE') as 'RED' | 'ORANGE' | 'BLUE';
        
        // Map severity string to Enum
        const severity = args.severity as IncidentSeverity || (
          tier === 'RED' ? IncidentSeverity.CRITICAL : 
          tier === 'ORANGE' ? IncidentSeverity.HIGH : IncidentSeverity.LOW
        );

        setAiPreview({
          translation: args.translatedMessage || "Translation processed.",
          severity: severity,
          tier: tier,
          depts: args.targetDepts || [Department.AOCC]
        });
      } 
      // 3. Handle Fallback (if API fails or returns raw text)
      else {
        setAiPreview({
          translation: result.text || rawLogText,
          severity: IncidentSeverity.LOW,
          tier: 'BLUE',
          depts: [Department.AOCC]
        });
      }
    } catch (e) {
      console.error("Neural Error:", e);
      alert("Neural Link Interrupted. Check signal.");
    } finally {
      setIsProcessing(false);
    }
  };

  const finalizeLog = () => {
    if (!aiPreview) return;
    onNewLog({
      id: Date.now().toString(),
      timestamp: new Date(),
      message: aiPreview.translation,
      category: 'OPERATIONAL',
      severity: aiPreview.severity,
      originDept: department,
      targetDept: aiPreview.depts,
      agenciesInvolved: [],
      terminal: currentTerminal,
    });
    onBack();
  };

  const submitManualForm = () => {
    if (!incidentType || !description) return;
    
    // Scoped Manual Severity Detection
    let severity = IncidentSeverity.LOW;
    let tier: 'RED' | 'ORANGE' | 'BLUE' = 'BLUE';

    if (selectedCategory === 'MEDICAL' || selectedCategory === 'SECURITY') {
        severity = IncidentSeverity.HIGH;
        tier = 'ORANGE';
    }

    onNewLog({
      id: Date.now().toString(),
      timestamp: new Date(),
      message: `[${incidentType.toUpperCase()}] ${description}`,
      category: 'INCIDENT',
      severity,
      originDept: department,
      targetDept: [Department.AOCC],
      agenciesInvolved: [],
      requestedTeams: selectedTeams,
      terminal: currentTerminal,
    });
    onBack();
  };

  return (
    <div className="bg-slate-800 rounded-2xl border border-slate-700/50 shadow-xl overflow-hidden flex flex-col h-full">
      {/* HEADER */}
      <div className="bg-slate-900/80 p-4 border-b border-slate-700 flex items-center gap-4">
         <button onClick={onBack} className="p-2 hover:bg-slate-800 rounded-full text-slate-400">
            <ArrowLeft className="w-5 h-5" />
         </button>
         <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
           <Activity className="w-5 h-5 text-indigo-400" />
           NEURAL COMMAND
         </h2>
      </div>

      <div className="flex-grow p-4 overflow-y-auto pb-10 custom-scrollbar">
        <div className="space-y-6">
           
           {/* CATEGORY SELECTOR */}
           <div className="grid grid-cols-4 gap-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => { setSelectedCategory(cat.id); setAiPreview(null); }}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                    selectedCategory === cat.id ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg' : 'bg-slate-700/50 border-slate-600 text-slate-400'
                  }`}
                >
                   {cat.icon}
                   <span className="text-[8px] font-black uppercase text-center leading-tight">{cat.label.split(' ')[0]}</span>
                </button>
              ))}
           </div>

           {/* AI TRANSLATION INTERFACE (GENERAL) */}
           {selectedCategory === 'GENERAL' && (
             <div className="space-y-4 animate-in fade-in zoom-in-95">
                <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-3">
                   <p className="text-[10px] text-indigo-300 font-bold uppercase tracking-widest flex items-center gap-2">
                     <Languages className="w-3 h-3" /> Cebuano / Tagalog / English Relay
                   </p>
                </div>
                
                {!aiPreview ? (
                  <>
                    <textarea 
                        value={rawLogText}
                        onChange={(e) => setRawLogText(e.target.value)}
                        placeholder="Naay aso sa Terminal 2 departure area..."
                        className="w-full h-32 bg-slate-900 border border-slate-700 rounded-xl p-4 text-sm text-white focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                    />
                    <button 
                        onClick={handleAIParse}
                        disabled={!rawLogText || isProcessing}
                        className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg"
                    >
                        {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                        {isProcessing ? 'TRANSLATING...' : 'TRANSLATE & FLAG'}
                    </button>
                  </>
                ) : (
                  <div className="space-y-4">
                     {/* TRANSLATION RESULT CARD */}
                     <div className="p-4 bg-slate-900 rounded-xl border border-indigo-500/30">
                        <div className="text-[10px] font-black text-indigo-400 uppercase mb-2">Aviation English Translation</div>
                        <p className="text-md text-white font-medium leading-relaxed">{aiPreview.translation}</p>
                     </div>

                     {/* INTENSITY FLAG - SCRICT SCOPING */}
                     <div className={`p-4 rounded-xl border-2 flex items-center justify-between transition-all ${
                        aiPreview.tier === 'RED' ? 'bg-red-950/30 border-red-500/50' :
                        aiPreview.tier === 'ORANGE' ? 'bg-orange-950/30 border-orange-500/50' :
                        'bg-blue-950/30 border-blue-500/50'
                     }`}>
                        <div className="flex items-center gap-4">
                           <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              aiPreview.tier === 'RED' ? 'bg-red-500 text-white animate-pulse' :
                              aiPreview.tier === 'ORANGE' ? 'bg-orange-500 text-white' :
                              'bg-blue-500 text-white'
                           }`}>
                              <AlertTriangle className="w-5 h-5" />
                           </div>
                           <div>
                              <div className="text-[10px] font-bold text-slate-400 uppercase">Detection Result</div>
                              <div className={`text-lg font-black tracking-tighter ${
                                 aiPreview.tier === 'RED' ? 'text-red-500' : 
                                 aiPreview.tier === 'ORANGE' ? 'text-orange-500' : 'text-blue-400'
                              }`}>{aiPreview.tier} TIER INCIDENT</div>
                           </div>
                        </div>
                     </div>

                     <div className="flex gap-2">
                        <button onClick={() => setAiPreview(null)} className="flex-1 py-3 bg-slate-700 text-white font-bold rounded-xl text-xs">RESET</button>
                        <button onClick={finalizeLog} className={`flex-[2] py-3 text-white font-black rounded-xl text-sm flex items-center justify-center gap-2 shadow-xl ${
                           aiPreview.tier === 'RED' ? 'bg-red-600' : 
                           aiPreview.tier === 'ORANGE' ? 'bg-orange-600' : 'bg-blue-600'
                        }`}>
                           <Send className="w-4 h-4" /> CONFIRM BROADCAST
                        </button>
                     </div>
                  </div>
                )}
             </div>
           )}

           {/* MANUAL FORMS (Fallback for No Signal / Specific Tasks) */}
           {selectedCategory !== 'GENERAL' && (
             <div className="space-y-4 animate-in slide-in-from-bottom-2">
                <input 
                  type="text" 
                  value={incidentType}
                  onChange={e => setIncidentType(e.target.value)}
                  placeholder="Incident Title"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white"
                />
                <textarea 
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Details..."
                  rows={3}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white"
                />
                <button 
                  onClick={submitManualForm}
                  className="w-full bg-slate-600 py-3 rounded-xl text-white font-bold text-sm"
                >
                  BROADCAST MANUAL
                </button>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

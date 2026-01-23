import React, { useState } from 'react';
import { Send, Loader2, PackageX, HeartPulse, CheckSquare, AlertTriangle, Users, Sparkles, Clipboard, ArrowLeft, Languages, Activity, MapPin, Building2, Shield, Wrench, Siren } from 'lucide-react';
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
  { id: 'SECURITY', label: 'Security / Safety', icon: <PackageX className="w-4 h-4" /> },
  { id: 'FACILITIES', label: 'Facilities / Ops', icon: <Users className="w-4 h-4" /> },
  { id: 'MEDICAL', label: 'Medical Emergency', icon: <HeartPulse className="w-4 h-4" /> }
];

const LOCATION_OPTIONS = [
  'Terminal 1', 'Terminal 2', 'Arrival Area', 'Apron', 'Other'
];

const TEAMS_BY_CAT = {
  SECURITY: ['MCIA Security', 'Police', 'Fire Department', 'K9 Unit', 'Immigration', 'Coast Guard'],
  FACILITIES: ['Janitorial', 'Maintenance', 'Power', 'Water', 'Customer Service', 'Baggage Handling'],
  MEDICAL: ['MCIA Clinic', 'Local Hospital', 'Quarantine Team', 'Department of Health', 'NDRRMC']
};

export const CommandInterface: React.FC<CommandInterfaceProps> = ({ role, department, userName, currentTerminal, onNewLog, onBack }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('GENERAL');
  const [rawLogText, setRawLogText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [incidentType, setIncidentType] = useState('');
  const [location, setLocation] = useState(LOCATION_OPTIONS[0]);
  const [description, setDescription] = useState('');
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);

  const [aiPreview, setAiPreview] = useState<{
    translation: string;
    severity: IncidentSeverity;
    tier: 'RED' | 'ORANGE' | 'BLUE';
    depts: Department[];
  } | null>(null);

  const toggleTeam = (team: string) => {
    setSelectedTeams(prev => 
      prev.includes(team) ? prev.filter(t => t !== team) : [...prev, team]
    );
  };

  /**
   * UPDATED BACKEND LOGIC: DeepSeek-V3 Snappy Relay
   */
  const handleAIParse = async () => {
    if (!rawLogText.trim()) return;
    setIsProcessing(true);
    setAiPreview(null);

    try {
      const result = await processCommandInput(rawLogText, role, department);
      
      if (result.toolCalls && result.toolCalls.length > 0) {
        const args = result.toolCalls[0].args as any;

        // Capture AI-determined Intensity Flag (RED/ORANGE/BLUE)
        const tier = (args.intensityLevel || 'BLUE') as 'RED' | 'ORANGE' | 'BLUE';
        
        // Map string from AI to our TypeScript Enum
        const severity = args.severity as IncidentSeverity || (
            tier === 'RED' ? IncidentSeverity.CRITICAL : 
            tier === 'ORANGE' ? IncidentSeverity.HIGH : IncidentSeverity.LOW
        );

        setAiPreview({
          translation: args.translatedMessage || "Aviation translation processed.",
          severity: severity,
          tier: tier,
          depts: args.targetDepts || [Department.AOCC]
        });
      } else {
        // Fallback for unexpected response structure
        setAiPreview({
          translation: result.text || rawLogText,
          severity: IncidentSeverity.LOW,
          tier: 'BLUE',
          depts: [Department.AOCC]
        });
      }
    } catch (e) {
      console.error("AI Error:", e);
      alert("Neural Link timed out. Switch to manual form below.");
    } finally {
      setIsProcessing(false);
    }
  };

  const finalizeLog = () => {
    if (!aiPreview) return;

    onNewLog({
      id: Date.now().toString(),
      timestamp: new Date(),
      message: aiPreview.translation, // The English Translation from AI
      category: 'OPERATIONAL',
      severity: aiPreview.severity,
      originDept: department,
      targetDept: aiPreview.depts,
      agenciesInvolved: [],
      terminal: currentTerminal,
    });

    onBack();
  };

  const submitManualForm = async () => {
    if (!incidentType || !description) return;
    setIsProcessing(true);

    try {
      const manualSummary = `[${incidentType.toUpperCase()}] at ${location}. ${description}`;
      onNewLog({
        id: Date.now().toString(),
        timestamp: new Date(),
        message: manualSummary, 
        category: selectedCategory === 'SECURITY' ? 'INCIDENT' : selectedCategory === 'MEDICAL' ? 'PASSENGER' : 'OPERATIONAL',
        severity: IncidentSeverity.MEDIUM,
        originDept: department,
        targetDept: [Department.AOCC],
        agenciesInvolved: [],
        requestedTeams: selectedTeams,
        terminal: location === 'Terminal 1' ? Terminal.T1 : location === 'Terminal 2' ? Terminal.T2 : currentTerminal,
      });
      onBack();
    } finally {
      setIsProcessing(false);
    }
  };

  const renderManualForm = (type: 'SECURITY' | 'FACILITIES' | 'MEDICAL') => {
    const teams = TEAMS_BY_CAT[type];
    const categoryLabel = CATEGORIES.find(c => c.id === type)?.label;
    const Icon = type === 'SECURITY' ? Shield : type === 'FACILITIES' ? Wrench : Siren;

    return (
      <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
        <div className="bg-slate-700/30 border border-slate-600 rounded-xl p-4 flex items-center gap-3">
          <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400">
             <Icon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">{categoryLabel} Form</h3>
          </div>
        </div>

        <div className="space-y-3">
           <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Incident Type</label>
              <input 
                type="text" 
                value={incidentType}
                onChange={e => setIncidentType(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white outline-none"
              />
           </div>

           <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Location</label>
              <select 
                value={location}
                onChange={e => setLocation(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white outline-none"
              >
                {LOCATION_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
           </div>

           <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Description</label>
              <textarea 
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={4}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white outline-none resize-none"
              />
           </div>
        </div>

        <button 
           onClick={submitManualForm}
           className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2"
        >
           {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
           BROADCAST REPORT
        </button>
      </div>
    );
  };

  return (
    <div className="bg-slate-800 rounded-2xl border border-slate-700/50 shadow-xl overflow-hidden flex flex-col h-full relative">
      <div className="bg-slate-900/80 p-4 border-b border-slate-700 flex items-center gap-4">
         <button onClick={onBack} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 transition-colors">
            <ArrowLeft className="w-5 h-5" />
         </button>
         <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-indigo-400" />
            REPORT COMMAND
         </h2>
      </div>

      <div className="flex-grow p-4 overflow-y-auto custom-scrollbar pb-10">
        <div className="space-y-6">
           <button
             onClick={() => { setSelectedCategory('GENERAL'); setAiPreview(null); }}
             className={`w-full p-6 rounded-2xl border flex flex-col items-center justify-center gap-2 transition-all ${
               selectedCategory === 'GENERAL' ? 'bg-indigo-600 border-indigo-500 text-white shadow-2xl' : 'bg-slate-700/50 border-slate-600 text-slate-400 hover:bg-slate-700'
             }`}
           >
              <Sparkles className={`w-8 h-8 ${selectedCategory === 'GENERAL' ? 'text-white' : 'text-indigo-400'}`} />
              <div className="text-center">
                 <span className="text-lg font-black uppercase tracking-tight block">General Report</span>
                 <span className="text-[10px] opacity-70 font-bold uppercase tracking-widest">AI-Powered Neural Relay</span>
              </div>
           </button>

           {selectedCategory === 'GENERAL' && (
             <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                {!aiPreview ? (
                  <>
                    <div className="relative">
                        <textarea 
                            value={rawLogText}
                            onChange={(e) => setRawLogText(e.target.value)}
                            placeholder="e.g. 'Naay gubot sa Gate 5, nag-away ang pasahero.'"
                            className="w-full h-32 bg-slate-900 border border-slate-700 rounded-xl p-4 text-sm text-white outline-none resize-none font-mono"
                        />
                    </div>
                    <button 
                        onClick={handleAIParse}
                        disabled={!rawLogText || isProcessing}
                        className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2"
                    >
                        {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Activity className="w-5 h-5" />}
                        SCAN REPORT
                    </button>
                  </>
                ) : (
                  <div className="space-y-4 animate-in zoom-in-95 duration-300">
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="p-3 bg-slate-900 rounded-xl border border-slate-700">
                           <div className="text-[9px] font-black text-slate-500 uppercase mb-2">Original Input</div>
                           <p className="text-xs text-slate-400 italic">"{rawLogText}"</p>
                        </div>
                        <div className="p-3 bg-slate-900 rounded-xl border border-indigo-500/30">
                           <div className="text-[9px] font-black text-indigo-400 uppercase mb-2">English Translation</div>
                           <p className="text-sm text-white font-medium">{aiPreview.translation}</p>
                        </div>
                     </div>

                     <div className={`p-4 bg-slate-900 rounded-xl border flex items-center justify-between ${
                        aiPreview.tier === 'RED' ? 'border-red-500/50' : aiPreview.tier === 'ORANGE' ? 'border-orange-500/50' : 'border-blue-500/50'
                     }`}>
                        <div className="flex items-center gap-3">
                           <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 ${
                              aiPreview.tier === 'RED' ? 'border-red-500/20 bg-red-900/20 text-red-500' :
                              aiPreview.tier === 'ORANGE' ? 'border-orange-500/20 bg-orange-900/20 text-orange-500' :
                              'border-blue-500/20 bg-blue-900/20 text-blue-500'
                           }`}>
                              <AlertTriangle className="w-6 h-6" />
                           </div>
                           <div>
                              <div className="text-xs font-bold text-white uppercase tracking-wider">Detected Intensity</div>
                              <div className={`text-lg font-black ${
                                 aiPreview.tier === 'RED' ? 'text-red-500' : 
                                 aiPreview.tier === 'ORANGE' ? 'text-orange-500' : 'text-blue-400'
                              }`}>{aiPreview.tier} TIER</div>
                           </div>
                        </div>
                     </div>

                     <div className="flex gap-2">
                        <button onClick={() => setAiPreview(null)} className="flex-1 py-3 bg-slate-700 text-white font-bold rounded-xl text-sm">RE-SCAN</button>
                        <button onClick={finalizeLog} className={`flex-[2] py-3 text-white font-black rounded-xl text-sm flex items-center justify-center gap-2 ${
                           aiPreview.tier === 'RED' ? 'bg-red-600' : aiPreview.tier === 'ORANGE' ? 'bg-orange-600' : 'bg-blue-600'
                        }`}>
                           <Send className="w-4 h-4" /> BROADCAST LOG
                        </button>
                     </div>
                  </div>
                )}
             </div>
           )}

           <div className="h-px bg-slate-700/50 w-full my-4"></div>

           <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {CATEGORIES.filter(c => c.id !== 'GENERAL').map(cat => (
                <button
                  key={cat.id}
                  onClick={() => { setSelectedCategory(cat.id); setAiPreview(null); }}
                  className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
                    selectedCategory === cat.id ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-700/50 border-slate-600 text-slate-400'
                  }`}
                >
                   {cat.icon}
                   <span className="text-[10px] font-black uppercase text-center">{cat.label.split(' / ')[0]}</span>
                </button>
              ))}
           </div>

           {selectedCategory === 'SECURITY' && renderManualForm('SECURITY')}
           {selectedCategory === 'FACILITIES' && renderManualForm('FACILITIES')}
           {selectedCategory === 'MEDICAL' && renderManualForm('MEDICAL')}
        </div>
      </div>
    </div>
  );
};


import React, { useState } from 'react';
import { Send, Loader2, PackageX, HeartPulse, CheckSquare, AlertTriangle, Users, Sparkles, Clipboard, ArrowLeft, Languages, Activity } from 'lucide-react';
import { LogEntry, IncidentSeverity, Department, UserRole, Terminal } from '../types';
import { processCommandInput } from '../geminiEngine';

interface CommandInterfaceProps {
  role: UserRole;
  department: Department;
  userName: string;
  currentTerminal: Terminal;
  onNewLog: (log: LogEntry) => void;
  onBack: () => void;
}

const CATEGORIES = [
  { id: 'SECURITY', label: 'Security / Safety', icon: <PackageX className="w-4 h-4" /> },
  { id: 'FACILITIES', label: 'Facilities / Ops', icon: <Users className="w-4 h-4" /> },
  { id: 'MEDICAL', label: 'Medical Emergency', icon: <HeartPulse className="w-4 h-4" /> },
  { id: 'AI_PARSER', label: 'AI Log Parser', icon: <Sparkles className="w-4 h-4" /> }
];

export const CommandInterface: React.FC<CommandInterfaceProps> = ({ role, department, userName, currentTerminal, onNewLog, onBack }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [rawLogText, setRawLogText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // AI Preview State
  const [aiPreview, setAiPreview] = useState<{
    translation: string;
    severity: IncidentSeverity;
    tier: 'RED' | 'ORANGE' | 'BLUE';
    depts: Department[];
  } | null>(null);

  const handleAIParse = async () => {
    if (!rawLogText.trim()) return;
    setIsProcessing(true);
    setAiPreview(null);

    try {
      const result = await processCommandInput(rawLogText, role, department);
      
      // If the model called a tool (Preferred)
      if (result.toolCalls && result.toolCalls.length > 0) {
        const tool = result.toolCalls[0];
        const args = tool.args as any;

        const severity = args.severity as IncidentSeverity || (args.intensityLevel === 'BLUE' ? IncidentSeverity.LOW : IncidentSeverity.HIGH);
        const tier = args.intensityLevel || (['CRITICAL', 'URGENT'].includes(severity) ? 'RED' : severity === 'HIGH' ? 'ORANGE' : 'BLUE');

        setAiPreview({
          translation: args.translatedMessage || result.text || "Translation failed.",
          severity: severity,
          tier: tier as any,
          depts: args.targetDepts || [Department.AOCC]
        });
      } 
      // Fallback: If model returned text but NO tool call
      else if (result.text) {
        // Heuristic detection since tool call failed
        const textLower = result.text.toLowerCase();
        let tier: 'RED' | 'ORANGE' | 'BLUE' = 'BLUE';
        let severity = IncidentSeverity.LOW;

        if (textLower.includes('fire') || textLower.includes('medical') || textLower.includes('emergency')) {
            tier = 'RED';
            severity = IncidentSeverity.CRITICAL;
        } else if (textLower.includes('broken') || textLower.includes('queue') || textLower.includes('high')) {
            tier = 'ORANGE';
            severity = IncidentSeverity.HIGH;
        }

        setAiPreview({
          translation: result.text,
          severity: severity,
          tier: tier,
          depts: [Department.AOCC, department]
        });
      }
      else {
        // Ultimate fallback
        setAiPreview({
          translation: rawLogText,
          severity: IncidentSeverity.LOW,
          tier: 'BLUE',
          depts: [Department.AOCC]
        });
      }
    } catch (e) {
      console.error("AI Error:", e);
      alert("AI Neural Link timed out or failed to parse.");
    } finally {
      setIsProcessing(false);
    }
  };

  const finalizeLog = () => {
    if (!aiPreview) return;

    const newLog: LogEntry = {
      id: Date.now().toString(),
      timestamp: new Date(),
      message: aiPreview.translation,
      category: 'OPERATIONAL',
      severity: aiPreview.severity,
      originDept: department,
      targetDept: aiPreview.depts,
      agenciesInvolved: [],
      terminal: currentTerminal,
    };

    onNewLog(newLog);
    onBack();
  };

  return (
    <div className="bg-slate-800 rounded-2xl border border-slate-700/50 shadow-xl overflow-hidden flex flex-col h-full relative">
      <div className="bg-slate-900/80 p-4 border-b border-slate-700 flex items-center gap-4">
         <button onClick={onBack} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
         </button>
         <div>
            <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              NEURAL LOGBOOK
            </h2>
         </div>
      </div>

      <div className="flex-grow p-4 overflow-y-auto custom-scrollbar">
        <div className="mb-4">
           <label className="block text-[10px] font-bold text-slate-500 uppercase mb-3 tracking-widest">Select Entry Mode</label>
           <div className="grid grid-cols-2 gap-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => { setSelectedCategory(cat.id); setAiPreview(null); }}
                  className={`p-3 rounded-xl border flex items-center justify-center gap-2 transition-all ${
                    selectedCategory === cat.id ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-700/50 border-slate-600 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                   {cat.icon}
                   <span className="text-xs font-bold">{cat.label}</span>
                </button>
              ))}
           </div>
        </div>

        {selectedCategory === 'AI_PARSER' && (
             <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                <div className="bg-indigo-900/10 border border-indigo-500/20 rounded-xl p-4">
                   <div className="flex items-center gap-2 text-indigo-300 font-bold text-xs mb-1">
                      <Languages className="w-4 h-4" /> TRILINGUAL ENGINE
                   </div>
                   <p className="text-[10px] text-slate-500">Paste raw reports in Visayan, Tagalog, or English. NOFY will translate and detect severity automatically.</p>
                </div>
                
                {!aiPreview ? (
                  <>
                    <div className="relative">
                        <textarea 
                            value={rawLogText}
                            onChange={(e) => setRawLogText(e.target.value)}
                            placeholder="e.g. 'Naay gubot sa Gate 5, nag-away ang pasahero.'"
                            className="w-full h-32 bg-slate-900 border border-slate-700 rounded-xl p-4 text-sm text-white focus:ring-2 focus:ring-indigo-500 outline-none resize-none font-mono"
                        />
                        <button className="absolute bottom-3 right-3 p-2 text-slate-500 hover:text-white bg-slate-800 rounded-lg">
                            <Clipboard className="w-4 h-4" />
                        </button>
                    </div>
                    
                    <button 
                        onClick={handleAIParse}
                        disabled={!rawLogText || isProcessing}
                        className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-900/20"
                    >
                        {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Activity className="w-5 h-5" />}
                        SCAN REPORT
                    </button>
                  </>
                ) : (
                  <div className="space-y-4 animate-in zoom-in-95 duration-300">
                     <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-slate-900 rounded-xl border border-slate-700">
                           <div className="text-[9px] font-black text-slate-500 uppercase mb-2">Original Input</div>
                           <p className="text-xs text-slate-400 italic">"{rawLogText}"</p>
                        </div>
                        <div className="p-3 bg-slate-900 rounded-xl border border-indigo-500/30">
                           <div className="text-[9px] font-black text-indigo-400 uppercase mb-2 flex items-center gap-1">
                              <Languages className="w-3 h-3" /> English Translation
                           </div>
                           <p className="text-sm text-white font-medium">{aiPreview.translation}</p>
                        </div>
                     </div>

                     <div className="p-4 bg-slate-900 rounded-xl border border-slate-700 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                           <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 ${
                              aiPreview.tier === 'RED' ? 'border-red-500/20 bg-red-900/20 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]' :
                              aiPreview.tier === 'ORANGE' ? 'border-orange-500/20 bg-orange-900/20 text-orange-500' :
                              'border-blue-500/20 bg-blue-900/20 text-blue-500'
                           }`}>
                              <AlertTriangle className="w-6 h-6" />
                           </div>
                           <div>
                              <div className="text-xs font-bold text-white uppercase tracking-wider">Detected Intensity</div>
                              <div className={`text-lg font-black ${
                                 aiPreview.tier === 'RED' ? 'text-red-500' : 
                                 aiPreview.tier === 'ORANGE' ? 'text-orange-500' : 
                                 'text-blue-400'
                              }`}>{aiPreview.tier} TIER</div>
                           </div>
                        </div>
                        <div className="text-right">
                           <div className="text-[10px] font-bold text-slate-500 uppercase">Routing To</div>
                           <div className="text-xs font-bold text-indigo-300">{aiPreview.depts.join(' + ')}</div>
                        </div>
                     </div>

                     <div className="flex gap-2">
                        <button onClick={() => setAiPreview(null)} className="flex-1 py-3 bg-slate-700 text-white font-bold rounded-xl text-sm">RE-SCAN</button>
                        <button onClick={finalizeLog} className={`flex-[2] py-3 text-white font-black rounded-xl text-sm flex items-center justify-center gap-2 shadow-xl ${
                           aiPreview.tier === 'RED' ? 'bg-red-600 hover:bg-red-500' : 
                           aiPreview.tier === 'ORANGE' ? 'bg-orange-600 hover:bg-orange-500' : 
                           'bg-blue-600 hover:bg-blue-500'
                        }`}>
                           <Send className="w-4 h-4" /> BROADCAST LOG
                        </button>
                     </div>
                  </div>
                )}
             </div>
        )}
      </div>
    </div>
  );
};

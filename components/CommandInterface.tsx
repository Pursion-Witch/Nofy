import React, { useState } from 'react';
import { Send, Loader2, AlertTriangle, Sparkles, ArrowLeft, Languages, Activity, Building2, Shield, Wrench, Siren, Info } from 'lucide-react';
import { LogEntry, IncidentSeverity, Department, UserRole, Terminal } from '../types';
import { processCommandInput } from "../services/neuralClient";

export const CommandInterface: React.FC<any> = ({ role, department, currentTerminal, onNewLog, onBack }) => {
  const [rawLogText, setRawLogText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // The AI now fills all of this automatically
  const [aiPreview, setAiPreview] = useState<{
    translation: string;
    category: string;
    subtag: string;
    tier: 'RED' | 'ORANGE' | 'BLUE';
    depts: Department[];
  } | null>(null);

  const handleAIParse = async () => {
    if (!rawLogText.trim()) return;
    setIsProcessing(true);
    setAiPreview(null);

    try {
      const result = await processCommandInput(rawLogText, role, department);
      if (result.toolCalls && result.toolCalls.length > 0) {
        const args = result.toolCalls[0].args as any;
        setAiPreview({
          translation: args.translatedMessage,
          category: args.category || 'OPERATIONAL',
          subtag: args.subtag || 'General',
          tier: args.intensityLevel || 'BLUE',
          depts: args.targetDepts || [Department.AOCC]
        });
      }
    } catch (e) {
      alert("Neural Link Timeout. Check signal.");
    } finally {
      setIsProcessing(false);
    }
  };

  const finalizeLog = () => {
    if (!aiPreview) return;
    onNewLog({
      id: Date.now().toString(),
      timestamp: new Date(),
      message: `[${aiPreview.subtag.toUpperCase()}] ${aiPreview.translation}`,
      category: aiPreview.category as any,
      severity: aiPreview.tier === 'RED' ? IncidentSeverity.CRITICAL : aiPreview.tier === 'ORANGE' ? IncidentSeverity.HIGH : IncidentSeverity.LOW,
      originDept: department,
      targetDept: aiPreview.depts,
      terminal: currentTerminal,
    });
    onBack();
  };

  // Helper for Icon Selection
  const getCategoryIcon = (cat: string) => {
    switch(cat) {
      case 'SECURITY': return <Shield className="w-4 h-4" />;
      case 'MEDICAL': return <Siren className="w-4 h-4" />;
      case 'FACILITIES': return <Wrench className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  return (
    <div className="bg-slate-800 rounded-2xl border border-slate-700/50 shadow-xl overflow-hidden flex flex-col h-full">
      {/* HEADER */}
      <div className="bg-slate-900/80 p-4 border-b border-slate-700 flex items-center gap-4">
         <button onClick={onBack} className="p-2 hover:bg-slate-800 rounded-full text-slate-400"><ArrowLeft className="w-5 h-5" /></button>
         <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2"><Building2 className="w-5 h-5 text-indigo-400" /> NEURAL RELAY</h2>
      </div>

      <div className="flex-grow p-4 overflow-y-auto pb-10 custom-scrollbar">
        <div className="space-y-6">
          
          {/* Main Input Area */}
          <div className="space-y-4">
             <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-3 flex items-center justify-between">
                <span className="text-[10px] text-indigo-300 font-bold uppercase tracking-widest flex items-center gap-2"><Languages className="w-3 h-3" /> Trilingual Mode Active</span>
                <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
             </div>

             {!aiPreview ? (
               <>
                 <textarea 
                    value={rawLogText}
                    onChange={(e) => setRawLogText(e.target.value)}
                    placeholder="Describe incident in Cebuano, Tagalog, or English..."
                    className="w-full h-40 bg-slate-900 border border-slate-700 rounded-2xl p-4 text-white focus:ring-2 focus:ring-indigo-500 outline-none resize-none font-medium"
                 />
                 <button 
                    onClick={handleAIParse}
                    disabled={!rawLogText || isProcessing}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 text-white font-bold py-5 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-lg"
                 >
                    {isProcessing ? <Loader2 className="w-6 h-6 animate-spin" /> : <Activity className="w-6 h-6" />}
                    {isProcessing ? 'ANALYZING SITUATION...' : 'PROCESS NEURAL LOG'}
                 </button>
               </>
             ) : (
               <div className="space-y-4 animate-in zoom-in-95">
                  {/* AUTO-TAGGED RESULT */}
                  <div className={`p-4 rounded-2xl border-2 flex flex-col gap-3 ${
                    aiPreview.tier === 'RED' ? 'bg-red-950/20 border-red-500/40' :
                    aiPreview.tier === 'ORANGE' ? 'bg-orange-950/20 border-orange-500/40' :
                    'bg-blue-950/20 border-blue-500/40'
                  }`}>
                    <div className="flex items-center justify-between">
                       <div className={`px-3 py-1 rounded-full text-[10px] font-black flex items-center gap-2 ${
                         aiPreview.tier === 'RED' ? 'bg-red-500 text-white' :
                         aiPreview.tier === 'ORANGE' ? 'bg-orange-500 text-white' :
                         'bg-blue-500 text-white'
                       }`}>
                          {getCategoryIcon(aiPreview.category)}
                          {aiPreview.category} : {aiPreview.subtag}
                       </div>
                       <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{aiPreview.tier} TIER</div>
                    </div>

                    <div className="bg-slate-900/50 p-3 rounded-xl border border-white/5">
                       <div className="text-[9px] font-bold text-slate-500 uppercase mb-1">Aviation Translation</div>
                       <p className="text-white font-medium leading-relaxed">{aiPreview.translation}</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button onClick={() => setAiPreview(null)} className="flex-1 py-4 bg-slate-700 text-white font-bold rounded-xl text-xs">RE-EDIT</button>
                    <button onClick={finalizeLog} className={`flex-[2] py-4 text-white font-black rounded-xl text-sm flex items-center justify-center gap-2 ${
                       aiPreview.tier === 'RED' ? 'bg-red-600' : 
                       aiPreview.tier === 'ORANGE' ? 'bg-orange-600' : 'bg-blue-600'
                    }`}>
                       <Send className="w-4 h-4" /> BROADCAST TO {aiPreview.depts[0]}
                    </button>
                  </div>
               </div>
             )}
          </div>

          <div className="h-px bg-slate-700/50 w-full"></div>
          <p className="text-[9px] text-slate-500 text-center uppercase font-bold tracking-tighter">AI identifies categories automatically based on airport safety protocols.</p>
        </div>
      </div>
    </div>
  );
};


import React, { useState } from 'react';
import { Send, Loader2, PackageX, HeartPulse, CheckSquare, AlertTriangle, Users, FileText, ToggleLeft, ToggleRight, Sparkles, Clipboard, Camera, ArrowLeft } from 'lucide-react';
import { LogEntry, IncidentSeverity, Department, UserRole, Terminal } from '../types';
import { processCommandInput } from '../services/geminiService';

interface CommandInterfaceProps {
  role: UserRole;
  department: Department;
  userName: string;
  currentTerminal: Terminal;
  onNewLog: (log: LogEntry) => void;
  onBack: () => void;
}

// Cascading Dropdown Options
const CATEGORIES = [
  { id: 'SECURITY', label: 'Security / Safety', icon: <PackageX className="w-4 h-4" /> },
  { id: 'FACILITIES', label: 'Facilities / Ops', icon: <Users className="w-4 h-4" /> },
  { id: 'MAINTENANCE', label: 'Maintenance', icon: <CheckSquare className="w-4 h-4" /> },
  { id: 'MEDICAL', label: 'Medical Emergency', icon: <HeartPulse className="w-4 h-4" /> },
  { id: 'AI_PARSER', label: 'AI Log Parser', icon: <Sparkles className="w-4 h-4" /> }
];

const SUB_CATEGORIES: Record<string, string[]> = {
  'SECURITY': ['Unattended Bag (UV)', 'Suspicious Person', 'Access Breach', 'Disorderly Conduct'],
  'FACILITIES': ['Queue Congestion', 'Crowd Control', 'Lighting Issue', 'AC/Temperature'],
  'MAINTENANCE': ['Spill/Clean Up', 'Broken Conveyor', 'Restroom Issue', 'Broken Seat'],
  'MEDICAL': ['Passenger Fainting', 'Wheelchair Assist', 'Injury', 'Cardiac']
};

export const CommandInterface: React.FC<CommandInterfaceProps> = ({ role, department, userName, currentTerminal, onNewLog, onBack }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('');
  
  // Dynamic Fields
  const [waitTime, setWaitTime] = useState<string>('');
  const [hasPhoto, setHasPhoto] = useState(false);
  const [customText, setCustomText] = useState('');
  const [isHighPriority, setIsHighPriority] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // AI Parser Fields
  const [rawLogText, setRawLogText] = useState('');
  
  // UV Protocol State
  const [uvChecks, setUvChecks] = useState<{page1?: Date, page2?: Date, page3?: Date}>({});

  const resetForm = () => {
    setSelectedCategory('');
    setSelectedSubCategory('');
    setWaitTime('');
    setHasPhoto(false);
    setCustomText('');
    setRawLogText('');
    setIsHighPriority(false);
    setUvChecks({});
    setIsProcessing(false);
  };

  const handleAIParse = async () => {
      setIsProcessing(true);
      
      try {
        // Call Real Gemini Service
        const result = await processCommandInput(rawLogText, role, department);
        
        let severity = IncidentSeverity.LOW;
        let finalMessage = result.text || rawLogText; // Default to raw if AI fails completely

        // CRITICAL FIX: Extract translated message from Tool Calls
        if (result.toolCalls && result.toolCalls.length > 0) {
            const tool = result.toolCalls[0];
            
            // Extract Severity
            // @ts-ignore
            if (tool.args && tool.args.severity) {
                // @ts-ignore
                severity = tool.args.severity as IncidentSeverity;
            }
            // @ts-ignore
            if (tool.args && tool.args.priority === 'URGENT') {
                severity = IncidentSeverity.URGENT;
            }

            // Extract Translated Message (This is the key fix)
            // @ts-ignore
            if (tool.args && tool.args.message) {
                // @ts-ignore
                finalMessage = tool.args.message;
            }
        } else {
            // Fallback keywords if no tool called (simulation or error)
            const textLower = rawLogText.toLowerCase();
            if (textLower.includes('sunog') || textLower.includes('fire')) severity = IncidentSeverity.CRITICAL;
            else if (textLower.includes('sakit') || textLower.includes('faint')) severity = IncidentSeverity.URGENT;
        }

        const newLog: LogEntry = {
            id: Date.now().toString(),
            timestamp: new Date(),
            message: `[AI PARSED] ${finalMessage}`, // Contains the translated text
            category: 'OPERATIONAL',
            severity: severity,
            originDept: department,
            targetDept: [Department.AOCC],
            agenciesInvolved: [],
            terminal: currentTerminal,
            // Removed aiAnalysis field as requested
        };

        onNewLog(newLog);
        setIsProcessing(false);
        resetForm();
        onBack();

      } catch (e) {
        console.error(e);
        setIsProcessing(false);
        alert("AI Processing Failed. Please submit manually.");
      }
  };

  const handleSubmit = () => {
    setIsProcessing(true);
    
    // Construct Message
    let message = `[${selectedCategory}]`;
    let severity = IncidentSeverity.LOW;
    let targetDept = [Department.TERMINAL_OPS];

    // Logic based on inputs
    if (selectedCategory === 'CUSTOM') {
       message = `[CUSTOM] ${customText}`;
       severity = isHighPriority ? IncidentSeverity.HIGH : IncidentSeverity.LOW;
       if (isHighPriority) targetDept.push(Department.AOCC);

    } else if (selectedCategory === 'SECURITY') {
       message += ` ${selectedSubCategory}`;
       if (selectedSubCategory === 'Unattended Bag (UV)') {
          message += ` - UV PROTOCOL: 3 Pages Completed. Call Security.`;
          severity = IncidentSeverity.CRITICAL;
          targetDept.push(Department.SECURITY, Department.AOCC);
       } else {
          severity = IncidentSeverity.HIGH;
          targetDept.push(Department.SECURITY);
       }
    } else if (selectedCategory === 'FACILITIES') {
       message += ` ${selectedSubCategory}`;
       if (selectedSubCategory === 'Queue Congestion') {
          message += ` - Wait Time: ${waitTime}. Location: ${currentTerminal === Terminal.T1 ? 'Counter Area' : 'Island Zone'}`;
          severity = waitTime === '>15 mins' ? IncidentSeverity.MEDIUM : IncidentSeverity.LOW;
       }
    } else if (selectedCategory === 'MAINTENANCE') {
        message += ` ${selectedSubCategory}`;
        if (hasPhoto) message += ` (PHOTO ATTACHED)`;
        severity = IncidentSeverity.LOW;
        targetDept.push(Department.SAFETY_QUALITY);
    } else if (selectedCategory === 'MEDICAL') {
        message += ` ${selectedSubCategory}`;
        severity = IncidentSeverity.URGENT;
        targetDept.push(Department.SAFETY_QUALITY); // Medical is often under safety
    }

    const newLog: LogEntry = {
      id: Date.now().toString(),
      timestamp: new Date(),
      message: message,
      category: 'INCIDENT',
      severity: severity,
      originDept: department,
      targetDept: targetDept,
      agenciesInvolved: [],
      terminal: currentTerminal
    };

    setTimeout(() => {
      onNewLog(newLog);
      setIsProcessing(false);
      resetForm();
      onBack(); // Navigate back to feed
    }, 1000);
  };

  return (
    <div className="bg-slate-800 rounded-2xl border border-slate-700/50 shadow-xl overflow-hidden flex flex-col h-full relative">
      
      {/* Header */}
      <div className="bg-slate-900/80 p-4 border-b border-slate-700 flex items-center gap-4">
         <button 
           onClick={onBack}
           className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors"
           title="Back to Live Log"
         >
            <ArrowLeft className="w-5 h-5" />
         </button>
         <div>
            <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-indigo-400" />
              REPORT INCIDENT
            </h2>
            <p className="text-[10px] text-slate-400">Digital Logbook & AI Parser</p>
         </div>
      </div>

      <div className="flex-grow p-4 overflow-y-auto">
        
        {/* Step 1: Category */}
        <div className="mb-4">
           <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Select Report Type</label>
           <div className="grid grid-cols-2 gap-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => { setSelectedCategory(cat.id); setSelectedSubCategory(''); }}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                    selectedCategory === cat.id 
                    ? 'bg-indigo-600 border-indigo-500 text-white' 
                    : 'bg-slate-700/50 border-slate-600 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                   {cat.icon}
                   <span className="text-xs font-bold">{cat.label}</span>
                </button>
              ))}
           </div>
        </div>

        {/* AI PARSER MODE */}
        {selectedCategory === 'AI_PARSER' && (
             <div className="mb-4 animate-in fade-in slide-in-from-top-2">
                <div className="bg-gradient-to-r from-indigo-900/30 to-purple-900/30 border border-indigo-500/30 rounded-xl p-4 mb-3">
                   <div className="flex items-center gap-2 text-indigo-300 font-bold text-xs mb-2">
                      <Sparkles className="w-4 h-4" /> SMART LOG PARSER (Trilingual)
                   </div>
                   <p className="text-[10px] text-slate-400 leading-relaxed">
                      Paste unstructured text from Emails, Viber, or SMS. Supports <strong>English, Tagalog, and Visayan</strong>. 
                      Auto-translates to English and detects severity.
                   </p>
                </div>
                
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Paste Raw Text</label>
                <div className="relative">
                    <textarea 
                        value={rawLogText}
                        onChange={(e) => setRawLogText(e.target.value)}
                        placeholder="e.g. 'Naay gubot sa Gate 5, nag-away ang pasahero.' (Detected -> High Severity + Translation)"
                        className="w-full h-32 bg-slate-900 border border-slate-600 rounded-xl p-3 text-sm text-white focus:ring-2 focus:ring-indigo-500 outline-none resize-none font-mono"
                    />
                    <button className="absolute top-2 right-2 p-1 text-slate-500 hover:text-white bg-slate-800 rounded">
                        <Clipboard className="w-4 h-4" />
                    </button>
                </div>
                
                <button 
                    onClick={handleAIParse}
                    disabled={!rawLogText || isProcessing}
                    className="w-full mt-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2"
                >
                    {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                    PROCESS & SUBMIT
                </button>
             </div>
        )}

        {/* PRE-DEFINED SUB-CATEGORIES */}
        {selectedCategory && selectedCategory !== 'CUSTOM' && selectedCategory !== 'AI_PARSER' && (
           <div className="mb-4 animate-in fade-in slide-in-from-top-2">
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Specific Issue</label>
              <select 
                className="w-full bg-slate-900 border border-slate-600 text-white rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                value={selectedSubCategory}
                onChange={(e) => setSelectedSubCategory(e.target.value)}
              >
                 <option value="">-- Select Issue --</option>
                 {SUB_CATEGORIES[selectedCategory]?.map(sub => (
                    <option key={sub} value={sub}>{sub}</option>
                 ))}
              </select>
           </div>
        )}

        {/* LOGIC BRANCH: UV PROTOCOL */}
        {selectedSubCategory === 'Unattended Bag (UV)' && (
           <div className="bg-rose-900/10 border border-rose-500/30 rounded-xl p-4 mb-4 animate-in zoom-in-95">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-sm mb-3">
                 <AlertTriangle className="w-4 h-4" /> 
                 REMINDER: NO TOUCH PROTOCOL
              </div>
              <div className="space-y-3">
                 {['page1', 'page2', 'page3'].map((step, idx) => (
                    <div key={step} className="flex items-center gap-3">
                       <button 
                         onClick={() => setUvChecks(prev => ({...prev, [step]: new Date()}))}
                         disabled={idx > 0 && !uvChecks[`page${idx}` as keyof typeof uvChecks]}
                         className={`w-6 h-6 rounded border flex items-center justify-center transition-colors ${
                            uvChecks[step as keyof typeof uvChecks] 
                            ? 'bg-emerald-500 border-emerald-500 text-white' 
                            : 'bg-slate-800 border-slate-600'
                         }`}
                       >
                          {uvChecks[step as keyof typeof uvChecks] && <CheckSquare className="w-4 h-4" />}
                       </button>
                       <span className={`text-sm ${uvChecks[step as keyof typeof uvChecks] ? 'text-emerald-400' : 'text-slate-400'}`}>
                          Page {idx+1} Done {uvChecks[step as keyof typeof uvChecks] && `(${uvChecks[step as keyof typeof uvChecks]?.toLocaleTimeString()})`}
                       </span>
                    </div>
                 ))}
              </div>
           </div>
        )}

        {/* LOGIC BRANCH: MAINTENANCE */}
        {selectedCategory === 'MAINTENANCE' && selectedSubCategory && (
           <div className="mb-4 animate-in zoom-in-95">
              <button 
                onClick={() => setHasPhoto(!hasPhoto)}
                className={`w-full py-3 rounded-xl border border-dashed flex items-center justify-center gap-2 ${
                   hasPhoto ? 'bg-emerald-900/20 border-emerald-500 text-emerald-400' : 'bg-slate-800 border-slate-600 text-slate-400 hover:bg-slate-700'
                }`}
              >
                 <Camera className="w-4 h-4" />
                 {hasPhoto ? 'Photo Attached' : 'Attach Evidence Photo (Required)'}
              </button>
           </div>
        )}

      </div>

      {/* Footer Submit */}
      {selectedCategory !== 'AI_PARSER' && (
        <div className="p-4 bg-slate-900 border-t border-slate-800">
            <button 
                disabled={
                !selectedCategory || isProcessing ||
                (selectedCategory !== 'CUSTOM' && !selectedSubCategory) ||
                (selectedCategory === 'CUSTOM' && !customText) ||
                (selectedSubCategory === 'Unattended Bag (UV)' && !uvChecks.page3) ||
                (selectedCategory === 'MAINTENANCE' && !hasPhoto)
                }
                onClick={handleSubmit}
                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
            >
                {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                {selectedSubCategory === 'Unattended Bag (UV)' && !uvChecks.page3 ? 'Complete 3 Pages First' : 'SUBMIT REPORT'}
            </button>
        </div>
      )}

    </div>
  );
};

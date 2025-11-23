

import React, { useState } from 'react';
import { Send, Loader2, PackageX, HeartPulse, Clock, PlayCircle, Camera, CheckSquare, AlertTriangle, Users, FileText, ToggleLeft, ToggleRight } from 'lucide-react';
import { LogEntry, IncidentSeverity, Agency, Department, UserRole, Terminal } from '../types';

interface CommandInterfaceProps {
  role: UserRole;
  department: Department;
  userName: string;
  currentTerminal: Terminal;
  onNewLog: (log: LogEntry) => void;
}

// Cascading Dropdown Options
const CATEGORIES = [
  { id: 'SECURITY', label: 'Security / Safety', icon: <PackageX className="w-4 h-4" /> },
  { id: 'FACILITIES', label: 'Facilities / Ops', icon: <Users className="w-4 h-4" /> },
  { id: 'MAINTENANCE', label: 'Maintenance', icon: <CheckSquare className="w-4 h-4" /> },
  { id: 'MEDICAL', label: 'Medical Emergency', icon: <HeartPulse className="w-4 h-4" /> },
  { id: 'CUSTOM', label: 'Custom / Other', icon: <FileText className="w-4 h-4" /> }
];

const SUB_CATEGORIES: Record<string, string[]> = {
  'SECURITY': ['Unattended Bag (UV)', 'Suspicious Person', 'Access Breach', 'Disorderly Conduct'],
  'FACILITIES': ['Queue Congestion', 'Crowd Control', 'Lighting Issue', 'AC/Temperature'],
  'MAINTENANCE': ['Spill/Clean Up', 'Broken Conveyor', 'Restroom Issue', 'Broken Seat'],
  'MEDICAL': ['Passenger Fainting', 'Wheelchair Assist', 'Injury', 'Cardiac']
};

export const CommandInterface: React.FC<CommandInterfaceProps> = ({ role, department, userName, currentTerminal, onNewLog }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('');
  
  // Dynamic Fields
  const [waitTime, setWaitTime] = useState<string>('');
  const [hasPhoto, setHasPhoto] = useState(false);
  const [customText, setCustomText] = useState('');
  const [isHighPriority, setIsHighPriority] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // UV Protocol State
  const [uvChecks, setUvChecks] = useState<{page1?: Date, page2?: Date, page3?: Date}>({});

  const resetForm = () => {
    setSelectedCategory('');
    setSelectedSubCategory('');
    setWaitTime('');
    setHasPhoto(false);
    setCustomText('');
    setIsHighPriority(false);
    setUvChecks({});
    setIsProcessing(false);
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
    }, 1000);
  };

  return (
    <div className="bg-slate-800 rounded-2xl border border-slate-700/50 shadow-xl overflow-hidden flex flex-col h-full relative">
      
      {/* Header */}
      <div className="bg-slate-900/80 p-4 border-b border-slate-700">
         <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
           <CheckSquare className="w-5 h-5 text-indigo-400" />
           REPORT INCIDENT
         </h2>
         <p className="text-[10px] text-slate-400">Digital Logbook & Ops Form</p>
      </div>

      <div className="flex-grow p-4 overflow-y-auto">
        
        {/* Step 1: Category */}
        <div className="mb-4">
           <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Select Category</label>
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

        {/* CUSTOM WRITE MODE */}
        {selectedCategory === 'CUSTOM' && (
           <div className="mb-4 animate-in fade-in slide-in-from-top-2">
               <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Description</label>
               <textarea 
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  placeholder="Describe the situation..."
                  className="w-full h-32 bg-slate-900 border border-slate-600 rounded-xl p-3 text-sm text-white focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
               />
               <div className="mt-4 flex items-center justify-between p-3 bg-slate-900 rounded-xl border border-slate-700">
                  <span className="text-sm font-bold text-slate-300">High Priority?</span>
                  <button 
                    onClick={() => setIsHighPriority(!isHighPriority)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${isHighPriority ? 'bg-amber-600 text-white' : 'bg-slate-700 text-slate-400'}`}
                  >
                     {isHighPriority ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6" />}
                     <span className="text-xs font-bold">{isHighPriority ? 'YES' : 'NO'}</span>
                  </button>
               </div>
           </div>
        )}

        {/* PRE-DEFINED SUB-CATEGORIES */}
        {selectedCategory && selectedCategory !== 'CUSTOM' && (
           <div className="mb-4 animate-in fade-in slide-in-from-top-2">
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Specific Issue</label>
              <select 
                className="w-full bg-slate-900 border border-slate-600 text-white rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                value={selectedSubCategory}
                onChange={(e) => setSelectedSubCategory(e.target.value)}
              >
                 <option value="">-- Select Issue --</option>
                 {SUB_CATEGORIES[selectedCategory].map(sub => (
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

        {/* LOGIC BRANCH: QUEUE */}
        {selectedSubCategory === 'Queue Congestion' && (
           <div className="bg-slate-700/30 rounded-xl p-4 mb-4 animate-in zoom-in-95">
               <div className="text-xs font-bold text-slate-400 mb-2 uppercase">
                  Location: {currentTerminal === Terminal.T1 ? 'TERMINAL 1 (Counters 1-29)' : 'TERMINAL 2 (Islands A-D)'}
               </div>
               <label className="block text-xs font-bold text-slate-300 mb-2">Est. Wait Time</label>
               <div className="flex gap-2">
                  {['< 5 mins', '5-10 mins', '>15 mins'].map(opt => (
                     <button
                        key={opt}
                        onClick={() => setWaitTime(opt)}
                        className={`flex-1 py-2 rounded text-xs font-bold border ${
                           waitTime === opt
                           ? opt === '>15 mins' ? 'bg-red-600 border-red-500 text-white' : 'bg-indigo-600 border-indigo-500 text-white'
                           : 'bg-slate-800 border-slate-600 text-slate-400'
                        }`}
                     >
                        {opt}
                     </button>
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

    </div>
  );
};
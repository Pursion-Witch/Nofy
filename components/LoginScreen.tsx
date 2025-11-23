
import React, { useState, useEffect } from 'react';
import { 
  Shield, Users, Monitor, Truck, 
  Activity, RadioTower, Globe, 
  ChevronRight, ArrowLeft, HeartHandshake, Smile, Map, Check
} from 'lucide-react';
import { UserRole, Department, Terminal } from '../types';

interface LoginScreenProps {
  onLogin: (role: UserRole, dept: Department, name: string, allowedTerminals: Terminal[]) => void;
  initialEmail: string;
  initialName?: string;
}

const OPERATIONAL_DEPTS = [
  { id: Department.SECURITY, label: 'Security', icon: <Shield className="w-5 h-5" /> },
  { id: Department.TERMINAL_OPS, label: 'Terminal Operations', icon: <Users className="w-5 h-5" /> },
  { id: Department.SAFETY_QUALITY, label: 'Safety & Quality', icon: <HeartHandshake className="w-5 h-5" /> },
  { id: Department.APRON_PBB, label: 'Apron & PBB', icon: <Truck className="w-5 h-5" /> },
  { id: Department.AIRLINE_MARKETING, label: 'Airline Marketing', icon: <Globe className="w-5 h-5" /> },
  { id: Department.CUSTOMER_EXP, label: 'Customer Experience', icon: <Smile className="w-5 h-5" /> }
];

// Group Definitions
const DEPT_GROUPS = [
  {
    id: 'AOCC_CORE',
    title: 'AOCC Command',
    subtitle: 'Master Control',
    description: 'Reads ALL Terminal Data (T1 + T2).',
    icon: <RadioTower className="w-8 h-8 md:w-10 md:h-10 text-indigo-200" />,
    color: 'indigo',
    allowedTerminals: [Terminal.T1, Terminal.T2],
    departments: [
      { id: Department.AOCC, label: 'AOCC Admin', icon: <Activity className="w-5 h-5" /> },
      { id: Department.IT_SYSTEMS, label: 'IT Systems', icon: <Monitor className="w-5 h-5" /> }
    ]
  },
  {
    id: 'DOMESTIC_OPS',
    title: 'Domestic Terminal Ops',
    subtitle: 'Terminal 1 Only',
    description: 'Restricted View: Domestic flights & pax data only.',
    icon: <Map className="w-8 h-8 md:w-10 md:h-10 text-emerald-200" />,
    color: 'emerald',
    allowedTerminals: [Terminal.T1],
    departments: OPERATIONAL_DEPTS
  },
  {
    id: 'INTL_OPS',
    title: 'International Terminal Ops',
    subtitle: 'Terminal 2 Only',
    description: 'Restricted View: International flights & pax data only.',
    icon: <Globe className="w-8 h-8 md:w-10 md:h-10 text-amber-200" />,
    color: 'amber',
    allowedTerminals: [Terminal.T2],
    departments: OPERATIONAL_DEPTS
  }
];

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, initialEmail, initialName }) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedGroup, setSelectedGroup] = useState<typeof DEPT_GROUPS[0] | null>(null);
  const [selectedDept, setSelectedDept] = useState<Department | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [name, setName] = useState(initialName || '');

  useEffect(() => {
    if (initialName) setName(initialName);
  }, [initialName]);

  const handleGroupSelect = (group: typeof DEPT_GROUPS[0]) => {
    setSelectedGroup(group);
    setStep(2);
  };

  const handleDeptSelect = (dept: Department) => {
    setSelectedDept(dept);
    setStep(3);
  };

  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedDept && name && selectedRole && selectedGroup) {
      onLogin(selectedRole, selectedDept, name, selectedGroup.allowedTerminals);
    }
  };

  const SmallLogo = () => (
    <div className="flex items-center gap-2 mb-6 opacity-60">
       <div className="flex items-end select-none">
          <span className="text-xl font-black text-white tracking-wide">NOF</span>
          <span className="text-2xl font-black text-indigo-400 leading-none">Y</span>
       </div>
       <div className="h-4 w-px bg-slate-600 mx-1"></div>
       <span className="text-xs font-bold text-slate-400 uppercase">Profile Setup</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-md my-auto py-8">
        
        <SmallLogo />

        <div className="bg-slate-800/80 backdrop-blur-sm rounded-3xl border border-slate-700/50 shadow-xl overflow-hidden flex flex-col transition-all duration-300">
          
          {/* Header Bar */}
          <div className="px-6 py-4 bg-slate-900/30 border-b border-slate-700/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
               {step > 1 ? (
                 <button onClick={() => setStep(prev => prev - 1 as any)} className="text-slate-400 hover:text-white flex items-center gap-1 text-sm font-bold transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back
                 </button>
               ) : (
                 <span className="text-slate-400 text-sm font-bold">Select Duty Zone</span>
               )}
            </div>
            <div className="flex gap-1.5">
               {[1, 2, 3].map(s => (
                 <div key={s} className={`h-1.5 w-8 rounded-full transition-all duration-500 ${step >= s ? 'bg-indigo-400' : 'bg-slate-700'}`}></div>
               ))}
            </div>
          </div>

          <div className="p-6">
            
            {/* STEP 1: GROUP SELECTION */}
            {step === 1 && (
              <div className="space-y-4">
                <div className="mb-4 text-center">
                    <div className="w-16 h-16 mx-auto rounded-full bg-slate-700 border-2 border-slate-600 flex items-center justify-center text-2xl font-bold text-indigo-400 mb-2">
                        {name ? name.charAt(0) : '?'}
                    </div>
                    <h2 className="text-white font-bold text-lg">Welcome, {name || 'Officer'}</h2>
                    <p className="text-slate-400 text-xs">{initialEmail}</p>
                </div>
                {DEPT_GROUPS.map((group) => {
                  let colorClass = '';
                  if (group.color === 'indigo') colorClass = 'bg-indigo-900/20 border-indigo-500/30 hover:bg-indigo-900/30 hover:border-indigo-400/50';
                  if (group.color === 'emerald') colorClass = 'bg-emerald-900/20 border-emerald-500/30 hover:bg-emerald-900/30 hover:border-emerald-400/50';
                  if (group.color === 'amber') colorClass = 'bg-amber-900/20 border-amber-500/30 hover:bg-amber-900/30 hover:border-amber-400/50';

                  let iconBg = '';
                  if (group.color === 'indigo') iconBg = 'bg-indigo-500/20';
                  if (group.color === 'emerald') iconBg = 'bg-emerald-500/20';
                  if (group.color === 'amber') iconBg = 'bg-amber-500/20';

                  return (
                    <button
                      key={group.id}
                      onClick={() => handleGroupSelect(group)}
                      className={`w-full group relative p-5 rounded-2xl border text-left transition-all duration-200 active:scale-[0.98] ${colorClass}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-xl ${iconBg}`}>
                            {group.icon}
                          </div>
                          <div>
                              <h3 className="text-lg font-bold text-white">{group.title}</h3>
                              <p className="text-xs text-slate-300 opacity-80">{group.subtitle}</p>
                              <p className="text-[10px] text-slate-400 mt-1">{group.description}</p>
                          </div>
                        </div>
                        <ChevronRight className="text-slate-500 group-hover:text-white transition-colors" />
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* STEP 2: DEPARTMENT SELECTION */}
            {step === 2 && selectedGroup && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                 <div className="text-center mb-6">
                    <h2 className="text-lg font-bold text-white">
                      {selectedGroup.title}
                    </h2>
                    <p className="text-sm text-slate-400">{selectedGroup.description}</p>
                 </div>
                 <div className="grid grid-cols-1 gap-3">
                    {selectedGroup.departments.map((dept) => (
                      <button
                        key={dept.id}
                        onClick={() => handleDeptSelect(dept.id)}
                        className="flex items-center gap-4 p-4 rounded-xl bg-slate-700/30 hover:bg-slate-700 border border-slate-600/50 hover:border-indigo-500/50 transition-all group"
                      >
                         <div className="p-2 bg-slate-800 rounded-lg text-slate-400 group-hover:text-indigo-300 group-hover:bg-slate-900 transition-colors">
                            {dept.icon}
                         </div>
                         <span className="font-medium text-slate-200 group-hover:text-white">{dept.label}</span>
                      </button>
                    ))}
                 </div>
              </div>
            )}

            {/* STEP 3: ROLE & NAME CONFIRMATION */}
            {step === 3 && (
              <form onSubmit={handleFinalSubmit} className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="text-center mb-6">
                   <h2 className="text-lg font-bold text-white">Finalize Profile</h2>
                   <p className="text-sm text-slate-400">Complete authentication</p>
                </div>

import React, { useState, useEffect } from 'react';
import { 
  Plane, Shield, Users, Monitor, Truck, 
  Activity, RadioTower, Globe, Briefcase, 
  ChevronRight, ArrowLeft, HeartHandshake, Smile, Map, Check, Key
} from 'lucide-react';
import { UserRole, Department, Terminal, AccessLevel } from '../types';

interface LoginScreenProps {
  onLogin: (role: UserRole, dept: Department, name: string, allowedTerminals: Terminal[], accessLevel: AccessLevel, employeeId: string, airline?: string) => void;
  initialEmail: string;
  initialName?: string;
  isNewUser?: boolean;
}

const OPERATIONAL_DEPTS = [
  { id: Department.TERMINAL_OPS, label: 'Terminal Operations', icon: <Users className="w-5 h-5" /> },
  { id: Department.AIRLINE_OPS, label: 'Airline Operations', icon: <Plane className="w-5 h-5" /> },
  { id: Department.SECURITY, label: 'Security', icon: <Shield className="w-5 h-5" /> },
  { id: Department.SAFETY_QUALITY, label: 'Safety & Quality', icon: <HeartHandshake className="w-5 h-5" /> },
  { id: Department.APRON_PBB, label: 'Apron & PBB', icon: <Truck className="w-5 h-5" /> },
  { id: Department.CUSTOMER_EXP, label: 'Customer Experience', icon: <Smile className="w-5 h-5" /> }
];

const AIRLINES = [
    'Philippine Airlines', 'Cebu Pacific', 'AirAsia', 'Scoot', 'Korean Air', 'Cathay Pacific', 'Emirates', 'Qatar Airways', 'Jeju Air'
];

// Group Definitions
const DEPT_GROUPS = [
  {
    id: 'AOCC_CORE',
    title: 'AOCC Command',
    subtitle: 'Admins & IT Systems',
    description: 'Central brain. Reads all terminal data.',
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
    title: 'Domestic Ops (T1)',
    subtitle: 'Terminal 1 Only',
    description: 'Local flights and passenger handling.',
    icon: <Map className="w-8 h-8 md:w-10 md:h-10 text-emerald-200" />,
    color: 'emerald',
    allowedTerminals: [Terminal.T1],
    departments: OPERATIONAL_DEPTS
  },
  {
    id: 'INTL_OPS',
    title: 'International Ops (T2)',
    subtitle: 'Terminal 2 Only',
    description: 'Global flights, Customs, Immigration.',
    icon: <Globe className="w-8 h-8 md:w-10 md:h-10 text-amber-200" />,
    color: 'amber',
    allowedTerminals: [Terminal.T2],
    departments: OPERATIONAL_DEPTS
  }
];

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, initialEmail, initialName, isNewUser }) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedGroup, setSelectedGroup] = useState<typeof DEPT_GROUPS[0] | null>(null);
  const [selectedDept, setSelectedDept] = useState<Department | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [selectedAirline, setSelectedAirline] = useState<string>('');
  const [name, setName] = useState(initialName || '');

  // Access Calculation State
  const [generatedId, setGeneratedId] = useState('');
  const [computedAccess, setComputedAccess] = useState<AccessLevel>('RESTRICTED');

  useEffect(() => {
    if (initialName) setName(initialName);
  }, [initialName]);

  const handleGroupSelect = (group: typeof DEPT_GROUPS[0]) => {
    setSelectedGroup(group);
    setStep(2);
  };

  const handleDeptSelect = (dept: Department) => {
    setSelectedDept(dept);
    
    // CALCULATE PERMISSIONS & ID
    if (selectedGroup) {
        let access: AccessLevel = 'RESTRICTED';
        let idPrefix = '';

        // 1. Determine Terminal Prefix
        if (selectedGroup.id === 'AOCC_CORE') idPrefix = 'AOCC';
        else if (selectedGroup.id === 'DOMESTIC_OPS') idPrefix = 'T1';
        else idPrefix = 'T2';

        // 2. Determine Dept Code and Access Level
        let deptCode = 'OPS';
        
        switch (dept) {
            case Department.AOCC:
            case Department.IT_SYSTEMS:
                access = 'ADMIN';
                deptCode = dept === Department.AOCC ? 'ADM' : 'SYS';
                break;
            case Department.TERMINAL_OPS:
                access = 'OPERATOR';
                deptCode = 'OPS';
                break;
            case Department.AIRLINE_OPS:
                access = 'OPERATOR';
                deptCode = 'AIR';
                break;
            case Department.SECURITY:
                access = 'VIEWER';
                deptCode = 'SEC';
                break;
            case Department.SAFETY_QUALITY:
                access = 'RESTRICTED';
                deptCode = 'SFT';
                break;
            case Department.APRON_PBB:
                access = 'RESTRICTED';
                deptCode = 'PBB';
                break;
            case Department.CUSTOMER_EXP:
                access = 'RESTRICTED';
                deptCode = 'CXP';
                break;
        }

        const randomNum = Math.floor(1000 + Math.random() * 9000);
        setGeneratedId(`${idPrefix}-${deptCode}-${randomNum}`);
        setComputedAccess(access);
    }
    
    setStep(3);
  };

  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedDept && name && selectedRole && selectedGroup) {
      onLogin(selectedRole, selectedDept, name, selectedGroup.allowedTerminals, computedAccess, generatedId, selectedAirline || undefined);
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
                <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700 text-center">
                   <div className="text-[10px] text-slate-400 uppercase font-bold mb-1">Generated Employee ID</div>
                   <div className="text-2xl font-black text-white tracking-widest font-mono flex items-center justify-center gap-2">
                       {generatedId}
                       <Key className="w-4 h-4 text-indigo-400" />
                   </div>
                   <div className={`mt-2 inline-flex px-2 py-0.5 rounded text-[10px] font-bold border ${
                       computedAccess === 'ADMIN' ? 'bg-indigo-900/30 text-indigo-400 border-indigo-500/30' :
                       computedAccess === 'OPERATOR' ? 'bg-emerald-900/30 text-emerald-400 border-emerald-500/30' :
                       computedAccess === 'VIEWER' ? 'bg-amber-900/30 text-amber-400 border-amber-500/30' :
                       'bg-slate-700 text-slate-400 border-slate-600'
                   }`}>
                       PERMISSION: {computedAccess}
                   </div>
                </div>

                <div className="space-y-4">
                  {/* AIRLINE OPS SPECIFIC SELECTOR */}
                  {selectedDept === Department.AIRLINE_OPS && (
                      <div>
                        <label className="block text-xs font-bold text-amber-400 uppercase mb-2 ml-1">Select Airline</label>
                        <select
                            value={selectedAirline}
                            onChange={(e) => setSelectedAirline(e.target.value)}
                            required
                            className="w-full bg-slate-900 border border-slate-600 rounded-xl p-4 text-white placeholder-slate-500 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all"
                        >
                            <option value="">-- Choose Airline --</option>
                            {AIRLINES.map(air => (
                                <option key={air} value={air}>{air}</option>
                            ))}
                        </select>
                      </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2 ml-1">Rank / Job Title</label>
                    <input 
                        type="text"
                        placeholder="e.g. Operations Supervisor"
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value)}
                        required
                        autoFocus
                        className="w-full bg-slate-900 border border-slate-600 rounded-xl p-4 text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2 ml-1">Confirm Display Name</label>
                    <input 
                      type="text"
                      placeholder="e.g. Capt. Reyes"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="w-full bg-slate-900 border border-slate-600 rounded-xl p-4 text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={selectedDept === Department.AIRLINE_OPS && !selectedAirline}
                  className="w-full mt-4 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-500/20 transition-all transform active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  <Check className="w-5 h-5" />
                  {isNewUser ? 'FINALIZE ACCOUNT' : 'ENTER OPS'}
                </button>
              </form>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

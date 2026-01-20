
import React, { useState, useEffect } from 'react';
import { X, Plane, MessageSquare, AlertOctagon, Info, LayoutDashboard, ClipboardList, Phone, CheckCircle2, Sparkles, AlertTriangle, Activity } from 'lucide-react';
import { Department } from '../types';

interface OnboardingTourProps {
  onComplete: () => void;
  userDept: Department;
  onSwitchTab: (tab: any) => void;
}

interface Step {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  targetId?: string;
  activeTab?: string;
  isNavigation?: boolean; 
}

export const OnboardingTour: React.FC<OnboardingTourProps> = ({ onComplete, userDept, onSwitchTab }) => {
  const [stepIndex, setStepIndex] = useState(0);
  const [highlightRect, setHighlightRect] = useState<DOMRect | null>(null);
  const [cardPosition, setCardPosition] = useState<'top' | 'bottom'>('bottom'); 
  
  const steps: Step[] = [
    {
      id: 1,
      title: "Welcome to NOFY",
      description: "Your unified command center. Tap 'My Tasks' to manage your shift.",
      icon: <Info className="w-5 h-5 text-white" />,
      targetId: 'nav-tasks', 
      isNavigation: true
    },
    {
      id: 2,
      title: "My Tasks",
      description: "Track your shift duties here. Use the '+' button to add new tasks.",
      icon: <ClipboardList className="w-5 h-5 text-indigo-400" />,
      activeTab: 'tasks',
      targetId: 'task-add-btn',
      isNavigation: false
    },
    {
      id: 3,
      title: "Navigation",
      description: "Let's check the air traffic. Tap 'Flights' to switch views.",
      icon: <Plane className="w-5 h-5 text-sky-400" />,
      targetId: 'nav-flights',
      isNavigation: true
    },
    {
      id: 4,
      title: "Flight Control",
      description: "Monitor live status. Use these tabs to filter Arrivals or Departures.",
      icon: <FilterIcon className="w-5 h-5 text-sky-300" />,
      activeTab: 'flights',
      targetId: 'flight-tabs',
      isNavigation: false
    },
    {
      id: 5,
      title: "Navigation",
      description: "Time to view analytics. Tap 'Dashboard'.",
      icon: <LayoutDashboard className="w-5 h-5 text-amber-400" />,
      targetId: 'nav-dash',
      isNavigation: true
    },
    {
      id: 6,
      title: "Strategic Dashboard",
      description: "The pulse of operations. Monitor key metrics like Passenger Flow and OTP.",
      icon: <Activity className="w-5 h-5 text-amber-300" />,
      activeTab: 'dash',
      targetId: 'dash-kpi-grid',
      isNavigation: false
    },
    {
      id: 7,
      title: "Navigation",
      description: "Need to log an issue? Tap 'Report'.",
      icon: <AlertOctagon className="w-5 h-5 text-rose-400" />,
      targetId: 'nav-report',
      isNavigation: true
    },
    {
      id: 8,
      title: "AI Log Parser",
      description: "Paste raw text here. The AI automatically categorizes and translates it.",
      icon: <Sparkles className="w-5 h-5 text-purple-400" />,
      activeTab: 'report',
      targetId: 'cmd-category-grid',
      isNavigation: false
    },
    {
      id: 9,
      title: "Navigation",
      description: "Find important contacts. Tap 'Directory'.",
      icon: <Phone className="w-5 h-5 text-emerald-400" />,
      targetId: 'nav-directory',
      isNavigation: true
    },
    {
      id: 10,
      title: "Team Chat",
      description: "Finally, stay connected. Tap the Chat icon to open your messages.",
      icon: <MessageSquare className="w-5 h-5 text-indigo-400" />,
      activeTab: 'directory',
      targetId: 'header-chat',
      isNavigation: true
    },
    {
      id: 11,
      title: "You're Ready!",
      description: "NOFY is armed and ready. Stay safe and keep the airport moving.",
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
      isNavigation: false
    }
  ];

  const currentStep = steps[stepIndex];

  useEffect(() => {
    if (currentStep.activeTab) {
        onSwitchTab(currentStep.activeTab);
    }

    const updatePosition = () => {
        if (currentStep.targetId) {
            const el = document.getElementById(currentStep.targetId);
            if (el) {
                const rect = el.getBoundingClientRect();
                setHighlightRect(rect);
                
                const screenHeight = window.innerHeight;
                const screenCenter = screenHeight / 2;
                
                if (rect.top > screenCenter) {
                    setCardPosition('top');
                } else {
                    setCardPosition('bottom');
                }

            } else {
                setTimeout(() => {
                    const retryEl = document.getElementById(currentStep.targetId!);
                    if (retryEl) {
                        const rect = retryEl.getBoundingClientRect();
                        setHighlightRect(rect);
                        setCardPosition(rect.top > window.innerHeight / 2 ? 'top' : 'bottom');
                    }
                }, 500);
            }
        } else {
            setHighlightRect(null); 
            setCardPosition('bottom'); 
        }
    };

    const timer = setTimeout(updatePosition, 350);
    window.addEventListener('resize', updatePosition);

    return () => {
        clearTimeout(timer);
        window.removeEventListener('resize', updatePosition);
    };
  }, [stepIndex, currentStep]);

  const handleAdvance = () => {
      if (currentStep.isNavigation && currentStep.targetId) {
          const el = document.getElementById(currentStep.targetId);
          if (el) el.click();
      }

      if (stepIndex < steps.length - 1) {
          setStepIndex(prev => prev + 1);
      } else {
          onComplete();
      }
  };

  function FilterIcon(props: any) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
        </svg>
      );
  }

  return (
    <div className="fixed inset-0 z-[200] overflow-hidden pointer-events-none">
      
      {/* HIGHLIGHTER (The "Hole") - Pointer events auto to allow clicking the target */}
      {highlightRect && (
          <div 
            onClick={handleAdvance}
            className="absolute cursor-pointer z-[210] transition-all duration-300 ease-out animate-pulse pointer-events-auto"
            style={{
                top: highlightRect.top,
                left: highlightRect.left,
                width: highlightRect.width,
                height: highlightRect.height,
                boxShadow: '0 0 0 9999px rgba(15, 23, 42, 0.4)', 
                borderRadius: '12px',
                border: '2px solid rgba(129, 140, 248, 0.8)'
            }}
          >
          </div>
      )}

      {/* EXPLANATION CARD - Opaque for clarity, positioned dynamically */}
      <div 
        className={`absolute left-0 right-0 flex justify-center z-[230] transition-all duration-500 ${
            cardPosition === 'top' ? 'top-20' : 'bottom-24'
        }`}
      >
         <div className="w-[90%] max-w-sm bg-slate-900 border border-slate-600 rounded-2xl shadow-2xl p-5 pointer-events-auto flex flex-col gap-3 animate-in zoom-in-95 duration-300">
             
             {/* Header */}
             <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-indigo-900/50 rounded-xl border border-indigo-500/50 text-indigo-300">
                        {currentStep.icon}
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-white leading-tight">{currentStep.title}</h3>
                        <div className="text-[10px] font-bold text-indigo-300 uppercase tracking-wide mt-0.5">
                            Step {stepIndex + 1} of {steps.length}
                        </div>
                    </div>
                </div>
                <button onClick={onComplete} className="text-slate-400 hover:text-white transition-colors bg-slate-800 hover:bg-slate-700 rounded-full p-1.5">
                    <X className="w-4 h-4" />
                </button>
             </div>

             {/* Content */}
             <p className="text-sm text-slate-200 leading-relaxed font-medium pl-1">
                {currentStep.description}
             </p>

             {/* Progress */}
             <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden mt-1">
                 <div 
                    className="h-full bg-indigo-500 transition-all duration-500" 
                    style={{ width: `${((stepIndex + 1) / steps.length) * 100}%` }}
                 ></div>
             </div>

             {/* Finish Button (Only on last step) */}
             {stepIndex === steps.length - 1 && (
                 <button 
                    onClick={onComplete}
                    className="mt-2 w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all border border-emerald-400/20 animate-pulse"
                 >
                    <CheckCircle2 className="w-5 h-5" /> Start Shift
                 </button>
             )}
         </div>
      </div>

    </div>
  );
};


import React, { useState } from 'react';
import { X, ArrowRight, Plane, MessageSquare, AlertOctagon, Info, LayoutDashboard, ClipboardList, Shield, RadioTower } from 'lucide-react';
import { Department } from '../types';

interface OnboardingTourProps {
  onComplete: () => void;
  userDept: Department;
}

interface Step {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  target?: string;
}

export const OnboardingTour: React.FC<OnboardingTourProps> = ({ onComplete, userDept }) => {
  const [stepIndex, setStepIndex] = useState(0);

  // Define steps based on role
  const getSteps = (): Step[] => {
    const commonIntro = {
        id: 1,
        title: "Welcome to NOFY Ops",
        description: "Your centralized command center for MCIA Operations.",
        icon: <Info className="w-8 h-8 text-indigo-400" />
    };

    const commsStep = {
        id: 99,
        title: "Real-time Chat",
        description: "Replace Viber/WhatsApp. Use secure channels for instant team coordination.",
        icon: <MessageSquare className="w-8 h-8 text-emerald-400" />,
        target: "header-chat"
    };

    // AOCC / IT ROLE
    if (userDept === Department.AOCC || userDept === Department.IT_SYSTEMS) {
        return [
            commonIntro,
            {
                id: 2,
                title: "Strategic Dashboard",
                description: "Monitor KPIs, Passenger Flow, and Critical Alerts across ALL terminals.",
                icon: <LayoutDashboard className="w-8 h-8 text-amber-400" />,
                target: "nav-dash"
            },
            {
                id: 3,
                title: "Flight Control",
                description: "View live traffic for T1 & T2. Issue passenger advisories directly.",
                icon: <Plane className="w-8 h-8 text-sky-400" />,
                target: "nav-flights"
            },
            commsStep
        ];
    }

    // SECURITY ROLE
    if (userDept === Department.SECURITY) {
        return [
            commonIntro,
            {
                id: 2,
                title: "Report Incident",
                description: "Quickly log threats, UVs, or disturbances. Use AI Parser for text dumps.",
                icon: <AlertOctagon className="w-8 h-8 text-rose-400" />,
                target: "nav-report"
            },
            {
                id: 3,
                title: "Live Operations Log",
                description: "Monitor the 'Tasks' feed for real-time security alerts from all units.",
                icon: <Shield className="w-8 h-8 text-slate-200" />,
                target: "nav-tasks"
            },
            commsStep
        ];
    }

    // STANDARD OPS (Terminal, Safety, Apron, etc.)
    return [
        commonIntro,
        {
            id: 2,
            title: "Task & Log Feed",
            description: "View your shift routine and see live operational updates in one place.",
            icon: <ClipboardList className="w-8 h-8 text-indigo-400" />,
            target: "nav-tasks"
        },
        {
            id: 3,
            title: "Report Issues",
            description: "Log maintenance, medical, or facility issues instantly with photo evidence.",
            icon: <AlertOctagon className="w-8 h-8 text-rose-400" />,
            target: "nav-report"
        },
        commsStep
    ];
  };

  const steps = getSteps();
  const currentStep = steps[stepIndex];

  const handleNext = () => {
    if (stepIndex < steps.length - 1) {
      setStepIndex(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  // DESKTOP POSITIONS (Hidden on mobile)
  const getPositionClass = (target?: string) => {
    switch (target) {
      case 'header-chat': return 'top-20 right-10 origin-top-right';
      case 'nav-dash': return 'bottom-24 left-1/4 origin-bottom';
      case 'nav-flights': return 'bottom-24 right-1/4 origin-bottom';
      case 'nav-report': return 'bottom-24 left-10 origin-bottom-left';
      case 'nav-tasks': return 'bottom-24 right-10 origin-bottom-right';
      default: return 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 origin-center';
    }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm animate-in fade-in duration-300 flex items-center justify-center">
      
      {/* CARD CONTAINER: Centered on Mobile, Positioned on Desktop */}
      <div 
        className={`
            relative w-[90%] max-w-sm bg-slate-900 border border-slate-700 p-6 rounded-2xl shadow-2xl transition-all duration-500
            md:absolute md:w-full md:transform-none
            ${window.innerWidth >= 768 ? getPositionClass(currentStep.target) : ''}
        `}
      >
        <div className="flex justify-between items-start mb-4">
           <div className="p-3 bg-slate-800 rounded-xl border border-slate-700 shadow-inner">
              {currentStep.icon}
           </div>
           <button onClick={onComplete} className="text-slate-500 hover:text-white p-1 transition-colors">
              <X className="w-5 h-5" />
           </button>
        </div>
        
        <h3 className="text-xl font-bold text-white mb-2">{currentStep.title}</h3>
        <p className="text-sm text-slate-400 leading-relaxed mb-6 h-12">
           {currentStep.description}
        </p>

        <div className="flex items-center justify-between mt-auto">
           <div className="flex gap-1.5">
              {steps.map((_, idx) => (
                 <div key={idx} className={`w-2 h-2 rounded-full transition-colors ${idx === stepIndex ? 'bg-indigo-500 scale-110' : 'bg-slate-700'}`}></div>
              ))}
           </div>
           <button 
             onClick={handleNext}
             className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl flex items-center gap-2 transition-all shadow-lg active:scale-95 text-sm"
           >
             {stepIndex === steps.length - 1 ? "Start Shift" : "Next"}
             <ArrowRight className="w-4 h-4" />
           </button>
        </div>
      </div>
    </div>
  );
};


import React, { useState, useEffect } from 'react';
import { X, ArrowRight, Plane, MessageSquare, AlertOctagon, Info } from 'lucide-react';

interface OnboardingTourProps {
  onComplete: () => void;
}

const TOUR_STEPS = [
  {
    id: 1,
    title: "Welcome to NOFY Ops",
    description: "Your centralized command center for MCIA Operations. Let's take a quick tour of your essential tools.",
    target: "center", // Positioning logic handled in component
    icon: <Info className="w-8 h-8 text-indigo-400" />
  },
  {
    id: 2,
    title: "Real-time Messaging",
    description: "Replace Viber/Text with our secure Chat. Access Direct Messages and Team Channels here.",
    target: "header-chat",
    icon: <MessageSquare className="w-8 h-8 text-emerald-400" />
  },
  {
    id: 3,
    title: "Flight Control",
    description: "View live Flight Manifests, assign resources, and issue passenger advisories.",
    target: "nav-flights",
    icon: <Plane className="w-8 h-8 text-sky-400" />
  },
  {
    id: 4,
    title: "Report Incidents",
    description: "Log security, medical, or maintenance issues instantly. Use the AI Parser for email dumps.",
    target: "nav-report",
    icon: <AlertOctagon className="w-8 h-8 text-rose-400" />
  }
];

export const OnboardingTour: React.FC<OnboardingTourProps> = ({ onComplete }) => {
  const [stepIndex, setStepIndex] = useState(0);
  const currentStep = TOUR_STEPS[stepIndex];

  const handleNext = () => {
    if (stepIndex < TOUR_STEPS.length - 1) {
      setStepIndex(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  // Determine positioning based on target ID (Simplified for this implementation)
  const getPositionClass = (target: string) => {
    switch (target) {
      case 'header-chat': return 'top-16 right-4 md:right-32';
      case 'nav-flights': return 'bottom-20 right-20';
      case 'nav-report': return 'bottom-20 left-4';
      default: return 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2';
    }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-sm animate-in fade-in duration-300">
      
      {/* Highlight Spotlights (Optional enhancement) */}
      
      <div className={`absolute w-full max-w-sm bg-slate-900 border border-slate-700 p-6 rounded-2xl shadow-2xl transition-all duration-500 ${getPositionClass(currentStep.target)}`}>
        <div className="flex justify-between items-start mb-4">
           <div className="p-3 bg-slate-800 rounded-xl border border-slate-700">
              {currentStep.icon}
           </div>
           <button onClick={onComplete} className="text-slate-500 hover:text-white p-1">
              <X className="w-5 h-5" />
           </button>
        </div>
        
        <h3 className="text-xl font-bold text-white mb-2">{currentStep.title}</h3>
        <p className="text-sm text-slate-400 leading-relaxed mb-6">
           {currentStep.description}
        </p>

        <div className="flex items-center justify-between">
           <div className="flex gap-1">
              {TOUR_STEPS.map((_, idx) => (
                 <div key={idx} className={`w-2 h-2 rounded-full ${idx === stepIndex ? 'bg-indigo-500' : 'bg-slate-700'}`}></div>
              ))}
           </div>
           <button 
             onClick={handleNext}
             className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg flex items-center gap-2 transition-colors"
           >
             {stepIndex === TOUR_STEPS.length - 1 ? "Get Started" : "Next"}
             <ArrowRight className="w-4 h-4" />
           </button>
        </div>
      </div>
    </div>
  );
};

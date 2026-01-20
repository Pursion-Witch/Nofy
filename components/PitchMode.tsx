
import React, { useState } from 'react';
import { X, ChevronRight, ChevronLeft, Play, Clock, Sparkles, Shield, RadioTower, Users } from 'lucide-react';

interface PitchModeProps {
  onClose: () => void;
}

const PITCH_SLIDES = [
  {
    id: 1,
    title: "THE HOOK: The Disconnected Airport",
    duration: "0:00 - 0:30",
    icon: <Users className="w-12 h-12 text-rose-500" />,
    bullets: [
      "OPENING: 'Imagine the Ops Center during a typhoon. Radios are screaming. Viber groups are flooding. The whiteboard is outdated the second you write on it.'",
      "THE PAIN: 'The problem isn't lack of data. It's DISCONNECTED data.'",
      "CONTEXT: 'Security doesn't see what Airlines see. Maintenance doesn't know what AOCC knows. That lag creates risk.'",
      "TRANSITION: 'We needed a central nervous system. We built NOFY.'"
    ]
  },
  {
    id: 2,
    title: "THE SOLUTION: One Source of Truth",
    duration: "0:30 - 1:00",
    icon: <RadioTower className="w-12 h-12 text-indigo-500" />,
    bullets: [
      "DEMO: Point to the STRATEGIC DASHBOARD.",
      "SCRIPT: 'This is NOFY. One screen. Real-time. From passenger heatmaps to critical fire alerts.'",
      "HIGHLIGHT: 'Notice the live integration. If a Gate changes in T1, the baggage handlers in T2 know instantly.'",
      "IMPACT: 'We eliminated the phone tag. We replaced noise with signal.'"
    ]
  },
  {
    id: 3,
    title: "THE TECH: AI-Powered Reporting",
    duration: "1:00 - 1:45",
    icon: <Sparkles className="w-12 h-12 text-amber-500" />,
    bullets: [
      "DEMO: Open the 'REPORT INCIDENT' modal.",
      "SCRIPT: 'In an emergency, typing is slow. And language barriers are real.'",
      "FEATURE: 'Watch the AI Parser. A guard can type in Visayan or Tagalog: \"Naay gubot sa Gate 5.\"'",
      "PAYOFF: 'NOFY instantly translates it to English, detects High Severity, and alerts AOCC. No misinterpretation. Just action.'"
    ]
  },
  {
    id: 4,
    title: "THE SECURITY: Granular Access (RBAC)",
    duration: "1:45 - 2:30",
    icon: <Shield className="w-12 h-12 text-emerald-500" />,
    bullets: [
      "DEMO: Show the Flight Manifest or Login Screen.",
      "SCRIPT: 'Power requires control. We built military-grade Role-Based Access.'",
      "DETAIL: 'AOCC sees everything. Airline Ops sees only their flights. Security sees threats but not passenger PII unless authorized.'",
      "TRUST: 'We balance operational speed with data privacy compliance.'"
    ]
  },
  {
    id: 5,
    title: "THE CLOSE: Future Ready",
    duration: "2:30 - 3:00",
    icon: <Play className="w-12 h-12 text-sky-500" />,
    bullets: [
      "SUMMARY: 'NOFY isn't just a dashboard. It's an operating system for safety and efficiency.'",
      "CALL TO ACTION: 'We are ready to deploy. We are ready to scale.'",
      "FINAL LINE: 'Thank you. Let's land this.'"
    ]
  }
];

export const PitchMode: React.FC<PitchModeProps> = ({ onClose }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    if (currentSlide < PITCH_SLIDES.length - 1) setCurrentSlide(prev => prev + 1);
  };

  const prevSlide = () => {
    if (currentSlide > 0) setCurrentSlide(prev => prev - 1);
  };

  const slide = PITCH_SLIDES[currentSlide];

  return (
    <div className="fixed inset-0 z-[200] bg-black/95 flex flex-col animate-in fade-in duration-300">
      
      {/* Header / Progress */}
      <div className="h-16 border-b border-slate-800 flex items-center justify-between px-6 bg-slate-900">
         <div className="flex items-center gap-4">
            <span className="text-xs font-bold text-indigo-500 uppercase tracking-widest px-2 py-1 bg-indigo-900/20 rounded border border-indigo-500/30">
                Live Pitch Mode
            </span>
            <div className="flex gap-1">
               {PITCH_SLIDES.map((_, idx) => (
                  <div 
                    key={idx} 
                    className={`h-1.5 w-8 rounded-full transition-all ${idx === currentSlide ? 'bg-indigo-500' : idx < currentSlide ? 'bg-indigo-900' : 'bg-slate-800'}`}
                  />
               ))}
            </div>
         </div>
         <button onClick={onClose} className="text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-800 transition-colors">
            <X className="w-6 h-6" />
         </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-8 relative">
         
         <div className="max-w-4xl w-full">
            <div className="flex items-start gap-6 mb-8 animate-in slide-in-from-bottom-4 duration-500 key={currentSlide}">
                <div className="p-4 bg-slate-800 rounded-2xl border border-slate-700 shadow-2xl">
                    {slide.icon}
                </div>
                <div>
                    <h1 className="text-4xl md:text-5xl font-black text-white mb-2 tracking-tight">{slide.title}</h1>
                    <div className="flex items-center gap-2 text-slate-400 font-mono text-sm">
                        <Clock className="w-4 h-4" />
                        Target Time: <span className="text-indigo-400 font-bold">{slide.duration}</span>
                    </div>
                </div>
            </div>

            <div className="space-y-6 animate-in slide-in-from-bottom-8 duration-700 delay-100 key={currentSlide}">
                {slide.bullets.map((text, idx) => (
                    <div key={idx} className="flex gap-4 items-start">
                        <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-600 flex items-center justify-center text-slate-400 font-bold shrink-0">
                            {idx + 1}
                        </div>
                        <p className={`text-xl md:text-2xl font-medium leading-relaxed ${text.includes("SCRIPT:") ? "text-white" : "text-slate-400"}`}>
                            {text.split(':').map((part, i) => (
                                i === 0 && text.includes(":") ? <span key={i} className="text-indigo-400 font-bold uppercase text-sm tracking-wide block mb-1">{part}</span> : <span key={i}>{part}</span>
                            ))}
                        </p>
                    </div>
                ))}
            </div>
         </div>

         {/* Navigation Overlay Controls */}
         <button 
            onClick={prevSlide}
            disabled={currentSlide === 0}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-4 rounded-full bg-slate-800/50 hover:bg-indigo-600 text-white disabled:opacity-0 transition-all hover:scale-110"
         >
            <ChevronLeft className="w-8 h-8" />
         </button>

         <button 
            onClick={nextSlide}
            disabled={currentSlide === PITCH_SLIDES.length - 1}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-4 rounded-full bg-slate-800/50 hover:bg-indigo-600 text-white disabled:opacity-0 transition-all hover:scale-110"
         >
            <ChevronRight className="w-8 h-8" />
         </button>

      </div>

      {/* Footer Notes */}
      <div className="h-16 border-t border-slate-800 bg-slate-900 flex items-center justify-center text-slate-500 text-sm font-mono">
          PROMPTER ACTIVE • USE ARROW KEYS OR BUTTONS
      </div>

    </div>
  );
};

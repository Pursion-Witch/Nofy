
import React, { useState, useEffect } from 'react';
import { X, Sparkles, Download, Loader2, Image as ImageIcon, CheckCircle2, AlertTriangle } from 'lucide-react';
import { generateUIConcept } from '../services/geminiService';

interface UIConceptGeneratorProps {
  onClose: () => void;
}

const LOADING_MESSAGES = [
  "Initializing visual engine...",
  "Calibrating MCIA design tokens...",
  "Rendering high-fidelity dashboard assets...",
  "Optimizing data visualization shaders...",
  "Finalizing NOFY 4K concept PNG...",
  "Polishing emerald and indigo accents..."
];

export const UIConceptGenerator: React.FC<UIConceptGeneratorProps> = ({ onClose }) => {
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [msgIndex, setMsgIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (loading) {
      const interval = setInterval(() => {
        setMsgIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
      }, 2500);
      return () => clearInterval(interval);
    }
  }, [loading]);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const url = await generateUIConcept();
      setImageUrl(url);
    } catch (err) {
      setError("Visual engine failed to render. Please ensure your API key supports image generation.");
    } finally {
      setLoading(false);
    }
  };

  const downloadImage = () => {
    if (!imageUrl) return;
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = 'NOFY-Command-Center-Concept.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-[200] bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-3xl shadow-[0_0_50px_rgba(79,70,229,0.3)] overflow-hidden flex flex-col relative">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 rounded-lg shadow-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-tight">NOFY ASSET STUDIO</h2>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">AI Concept Visualization</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-grow min-h-[400px] flex flex-col items-center justify-center p-8 text-center relative">
          
          {!imageUrl && !loading && !error && (
            <div className="max-w-md space-y-6 animate-in zoom-in-95 duration-300">
               <div className="w-24 h-24 mx-auto rounded-3xl bg-slate-800 border-2 border-slate-700 flex items-center justify-center text-indigo-400 shadow-inner">
                  <ImageIcon className="w-12 h-12" />
               </div>
               <div>
                  <h3 className="text-2xl font-bold text-white mb-2">Generate Interface Asset</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    Request a high-fidelity 4K PNG rendering of the NOFY Command Center. 
                    This conceptual asset is perfect for presentations and stakeholder reviews.
                  </p>
               </div>
               <button 
                onClick={handleGenerate}
                className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-2xl shadow-xl shadow-indigo-600/20 transition-all active:scale-95 flex items-center gap-2 mx-auto"
               >
                  <Sparkles className="w-5 h-5" /> START RENDERING
               </button>
            </div>
          )}

          {loading && (
            <div className="space-y-6">
               <div className="relative">
                 <div className="w-20 h-20 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mx-auto"></div>
                 <Sparkles className="absolute inset-0 m-auto w-6 h-6 text-indigo-400 animate-pulse" />
               </div>
               <div className="space-y-2">
                 <p className="text-xl font-bold text-white animate-pulse">{LOADING_MESSAGES[msgIndex]}</p>
                 <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Processing Modality: Image</p>
               </div>
            </div>
          )}

          {error && (
            <div className="max-w-md space-y-6 animate-in shake duration-500">
               <div className="w-20 h-20 mx-auto rounded-full bg-rose-900/20 border-2 border-rose-500/30 flex items-center justify-center text-rose-500">
                  <AlertTriangle className="w-10 h-10" />
               </div>
               <p className="text-rose-200 font-bold">{error}</p>
               <button onClick={handleGenerate} className="text-indigo-400 font-bold underline hover:text-indigo-300">Try Again</button>
            </div>
          )}

          {imageUrl && !loading && (
            <div className="w-full h-full flex flex-col gap-6 animate-in zoom-in-95 duration-500">
               <div className="relative group rounded-2xl overflow-hidden border-2 border-indigo-500/30 shadow-2xl">
                  <img src={imageUrl} alt="NOFY Concept" className="w-full h-auto object-contain" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="text-white flex items-center gap-2 font-black text-sm uppercase tracking-widest bg-indigo-600/80 px-4 py-2 rounded-full">
                        <CheckCircle2 className="w-4 h-4" /> Rendering Complete
                      </div>
                  </div>
               </div>
               <div className="flex gap-4 justify-center">
                  <button 
                    onClick={downloadImage}
                    className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl shadow-lg flex items-center gap-2 transition-all active:scale-95"
                  >
                    <Download className="w-5 h-5" /> SAVE PNG
                  </button>
                  <button 
                    onClick={handleGenerate}
                    className="px-8 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-black rounded-xl transition-all"
                  >
                    RE-GENERATE
                  </button>
               </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-900/80 border-t border-slate-800 text-center">
           <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">Generated by Gemini 2.5 Visual Modality • Powered by Google GenAI</p>
        </div>
      </div>
    </div>
  );
};

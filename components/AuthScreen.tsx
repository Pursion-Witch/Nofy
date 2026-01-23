
import React, { useState } from 'react';
import { Mail, Lock, ArrowRight, Loader2, Plane, RadioTower, Github } from 'lucide-react';

interface AuthScreenProps {
  onAuthenticated: (email: string, name?: string, isNewUser?: boolean) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onAuthenticated }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    if (!isLogin && !name) return;

    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      // Pass !isLogin as the isNewUser flag (if not login, it's registration)
      onAuthenticated(email, isLogin ? undefined : name, !isLogin);
    }, 1500);
  };

  const handleGoogleLogin = () => {
    setGoogleLoading(true);
    // Simulate Google OAuth
    setTimeout(() => {
      setGoogleLoading(false);
      // Trigger onboarding for new users via Google sign up as well
      onAuthenticated('staff@mcia.gov.ph', 'Staff Member', !isLogin);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
         <div className="absolute -top-[20%] -right-[10%] w-[600px] h-[600px] rounded-full bg-indigo-900/10 blur-[100px]"></div>
         <div className="absolute bottom-[10%] left-[10%] w-[400px] h-[400px] rounded-full bg-rose-900/10 blur-[80px]"></div>
      </div>

      <div className="w-full max-w-md z-10">
        
        {/* Logo Section - Restored to original design */}
        <div className="flex flex-col items-center mb-8">
            <div className="flex items-center select-none mb-6 pt-6">
                <div className="relative flex items-end">
                    <span className="text-6xl font-black text-white tracking-tight relative">
                        NOF
                        <RadioTower className="absolute -top-7 right-1 w-10 h-10 text-sky-400 drop-shadow-lg" />
                    </span>
                    <span className="text-8xl font-black text-indigo-500 relative ml-1 leading-[0.8]">
                        Y
                        <Plane className="absolute -top-4 -right-8 w-10 h-10 text-rose-500 transform rotate-12 drop-shadow-lg" />
                    </span>
                </div>
            </div>
            <p className="text-slate-400 text-sm font-medium tracking-wide uppercase bg-slate-900/80 px-4 py-1.5 rounded-full border border-slate-800">
                Operations Command System
            </p>
        </div>

        {/* Auth Card */}
        <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-800 shadow-2xl p-8">
            
            {/* Tabs */}
            <div className="flex mb-8 bg-slate-800/50 rounded-lg p-1 border border-slate-700/50">
               <button 
                 onClick={() => setIsLogin(true)}
                 className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${isLogin ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
               >
                 Sign In
               </button>
               <button 
                 onClick={() => setIsLogin(false)}
                 className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${!isLogin ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
               >
                 Create Account
               </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
               {!isLogin && (
                  <div className="space-y-1 animate-in slide-in-from-top-2 fade-in">
                     <label className="text-xs font-bold text-slate-400 uppercase ml-1">Full Name</label>
                     <div className="relative">
                        <input 
                           type="text"
                           value={name}
                           onChange={(e) => setName(e.target.value)}
                           className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 pl-10 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                           placeholder="Officer Name"
                        />
                        <div className="absolute left-3 top-3.5 text-slate-500">
                           <div className="w-4 h-4 rounded-full border-2 border-slate-500/50"></div>
                        </div>
                     </div>
                  </div>
               )}

               <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase ml-1">Work Email</label>
                  <div className="relative">
                     <input 
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 pl-10 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                        placeholder="officer@mcia.gov.ph"
                     />
                     <Mail className="absolute left-3 top-3.5 w-4 h-4 text-slate-500" />
                  </div>
               </div>

               <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase ml-1">Password</label>
                  <div className="relative">
                     <input 
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 pl-10 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                        placeholder="••••••••"
                     />
                     <Lock className="absolute left-3 top-3.5 w-4 h-4 text-slate-500" />
                  </div>
               </div>

               <button 
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-900/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 mt-2"
               >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                     <>
                        {isLogin ? 'Access System' : 'Register Account'}
                        <ArrowRight className="w-4 h-4" />
                     </>
                  )}
               </button>
            </form>

            <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-700"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-slate-900 px-2 text-slate-500 font-bold">Or continue with</span>
                </div>
            </div>

            <button 
               onClick={handleGoogleLogin}
               disabled={googleLoading}
               className="w-full bg-white text-slate-900 font-bold py-3 rounded-xl hover:bg-slate-100 transition-colors flex items-center justify-center gap-3"
            >
               {googleLoading ? <Loader2 className="w-5 h-5 animate-spin text-slate-900" /> : (
                  <>
                     <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                     </svg>
                     {isLogin ? 'Sign in with Google' : 'Sign Up with Google'}
                  </>
               )}
            </button>
        </div>

        <div className="mt-8 text-center flex flex-col items-center gap-1.5">
            <p className="text-xs text-slate-500 font-medium">Authorized Personnel Only • MCIA Operations</p>
            <div className="flex items-center gap-2 opacity-40">
                <div className="h-px w-4 bg-slate-700"></div>
                <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Build v0.65 (Prototype)</p>
                <div className="h-px w-4 bg-slate-700"></div>
            </div>
        </div>
      </div>
    </div>
  );
};

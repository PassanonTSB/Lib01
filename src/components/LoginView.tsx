import React, { useState } from 'react';
import { motion } from 'motion/react';
import { auth, googleProvider, signInWithPopup } from '../firebase';
import { LogIn, Sparkles, BookOpen, GraduationCap, AlertCircle, ShieldAlert } from 'lucide-react';

interface LoginViewProps {
  onMockLogin?: (mockEmail: string, mockName: string) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onMockLogin }) => {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showSandbox, setShowSandbox] = useState(false);
  const [sandboxEmail, setSandboxEmail] = useState('');
  const [sandboxName, setSandboxName] = useState('');

  const handleGoogleLogin = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.error("Google Log In error: ", err);
      // Popup blocked or not configured because are inside iframe preview
      if (err.code === 'auth/popup-blocked' || err.code === 'auth/unauthorized-domain' || err.message?.includes('cancelled')) {
        setErrorMsg("The sign-in popup was blocked or this domain is unauthorized in Firebase. Please use the developer sandbox fallback below to log in safely inside the preview iframe!");
        setShowSandbox(true);
      } else {
        setErrorMsg(err.message || "Failed to authenticate with Google. Feel free to use the sandbox login.");
        setShowSandbox(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSandboxSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sandboxEmail.trim() || !sandboxName.trim()) {
      setErrorMsg("Please fill out both sandbox fields.");
      return;
    }
    if (onMockLogin) {
      onMockLogin(sandboxEmail.trim(), sandboxName.trim());
    }
  };

  return (
    <div className="min-h-screen bg-blue-50/50 flex flex-col items-center justify-center p-4 sm:p-6" id="login-view-container">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="max-w-md w-full bg-white border-4 border-blue-105 rounded-3xl p-6 sm:p-8 shadow-vibrant relative overflow-hidden"
      >
        {/* Background shapes */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-105 rounded-full blur-2xl pointer-events-none -mr-10 -mt-10" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-50 rounded-full blur-2xl pointer-events-none -ml-10 -mb-10" />

        <div className="relative z-10 text-center space-y-6">
          {/* Badge & Title */}
          <div className="flex flex-col items-center space-y-2">
            <div className="w-16 h-16 bg-yellow-405 rounded-2xl flex items-center justify-center transform rotate-6 shadow-md border-2 border-white">
              <BookOpen className="w-8 h-8 text-blue-950 stroke-[2.5px]" />
            </div>
            
            <div className="inline-flex items-center gap-1 bg-blue-50 px-3 py-1 rounded-full text-xs font-black text-blue-900 border border-blue-100 mt-4 leading-none">
              <GraduationCap className="w-3.5 h-3.5 fill-blue-900" />
              <span>Maplewood challenge</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-blue-950 tracking-tight mt-1">
              Student Quest portal
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm font-semibold max-w-xs leading-normal">
              Join your classmates, complete book quizzes, and test your comprehension to climb the weekly scoreboard!
            </p>
          </div>

          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 text-xs font-bold text-red-800 text-left flex gap-2.5 items-start"
            >
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="leading-normal">{errorMsg}</p>
            </motion.div>
          )}

          {/* Primary Action Button */}
          <div className="space-y-4 pt-2">
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className={`w-full py-4 px-6 rounded-2xl font-black text-sm text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 transition-all shadow-vibrant transform active:scale-[0.98] flex items-center justify-center gap-3 cursor-pointer border-none ${
                loading ? 'opacity-85 pointer-events-none' : ''
              }`}
              id="google-login-btn"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="w-5 h-5 stroke-[2.5px]" />
                  <span>Log in with Google Account</span>
                </>
              )}
            </button>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              Enabling secure sync with Google Auth
            </p>
          </div>

          {/* Fallback Section */}
          <div className="border-t-2 border-dashed border-slate-150 pt-5">
            {!showSandbox ? (
              <button
                onClick={() => setShowSandbox(true)}
                className="text-xs text-blue-650 hover:text-blue-800 font-bold flex items-center justify-center gap-1.5 mx-auto hover:underline cursor-pointer bg-transparent border-none"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Having trouble? Try Developer Sandbox</span>
              </button>
            ) : (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="text-left space-y-4"
              >
                <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-4 flex gap-2.5 items-start">
                  <ShieldAlert className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <p className="text-[11px] text-yellow-905 font-bold leading-normal">
                    This sandbox bypasses external Google popup blocks by creating a robust authenticated session with the name and email you provide, persisting cleanly database records!
                  </p>
                </div>

                <form onSubmit={handleSandboxSubmit} className="space-y-3.5" id="sandbox-login-form">
                  <div>
                    <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1">
                      Sandbox Email
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g., student@maplewood.edu"
                      value={sandboxEmail}
                      onChange={(e) => setSandboxEmail(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 font-bold focus:outline-none focus:border-blue-500 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., Alex Cooper"
                      value={sandboxName}
                      onChange={(e) => setSandboxName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 font-bold focus:outline-none focus:border-blue-500 text-sm"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl font-black text-xs text-blue-950 bg-yellow-400 hover:bg-yellow-500 active:bg-yellow-600 transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer border-none"
                    id="sandbox-login-submit"
                  >
                    <span>Activate Sandbox Session as User</span>
                  </button>
                </form>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

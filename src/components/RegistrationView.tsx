import React, { useState } from 'react';
import { motion } from 'motion/react';
import { GraduationCap, ArrowRight, User, Hash, School, AlertCircle } from 'lucide-react';

interface RegistrationViewProps {
  initialName: string;
  onRegister: (data: { name: string; className: string; department: string }) => Promise<void>;
  onLogOut: () => void;
}

export const RegistrationView: React.FC<RegistrationViewProps> = ({ initialName, onRegister, onLogOut }) => {
  const [fullName, setFullName] = useState(initialName || '');
  const [className, setClassName] = useState('');
  const [department, setDepartment] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Validation: All fields required
    if (!fullName.trim() || !className.trim() || !department.trim()) {
      setErrorMsg("All fields are strictly required.");
      return;
    }

    setLoading(true);
    try {
      await onRegister({
        name: fullName.trim(),
        className: className.trim(),
        department: department.trim()
      });
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "An unexpected error occurred while creating your profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-blue-50/50 flex flex-col items-center justify-center p-4 sm:p-6" id="registration-view-container">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-md w-full bg-white border-4 border-blue-105 rounded-3xl p-6 sm:p-8 shadow-vibrant relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-105 rounded-full blur-2xl pointer-events-none -mr-10 -mt-10" />

        <div className="relative z-10 text-center space-y-5">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center mb-3 text-blue-900 border border-blue-200">
              <GraduationCap className="w-6 h-6 fill-blue-900" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-blue-950 tracking-tight">
              Classroom Profile Setup 📝
            </h1>
            <p className="text-slate-500 text-xs font-semibold max-w-xs mt-1 leading-normal">
              First-time login detected! Complete your Maplewood student record to enter the challenge.
            </p>
          </div>

          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border-2 border-red-200 rounded-2xl p-3 text-xs font-bold text-red-800 text-left flex gap-2 items-start"
            >
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="leading-snug">{errorMsg}</p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-left" id="registration-form">
            {/* Full Name */}
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1.5 leading-none">
                <User className="w-3 h-3 text-blue-600" /> Full Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Alex Cooper"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 font-bold focus:outline-none focus:border-blue-500 text-sm"
              />
            </div>

            {/* Class */}
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1.5 leading-none">
                <Hash className="w-3 h-3 text-blue-600" /> School Class / Grade
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 5th Grade (Class 5-A)"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 font-bold focus:outline-none focus:border-blue-500 text-sm"
              />
            </div>

            {/* Department */}
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1.5 leading-none">
                <School className="w-3 h-3 text-blue-600" /> School Department
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Elementary / English Literature"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-200 font-bold focus:outline-none focus:border-blue-500 text-sm"
              />
            </div>

            <div className="pt-3 space-y-3">
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 px-5 rounded-2xl font-black text-xs text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-vibrant flex items-center justify-center gap-1.5 cursor-pointer border-none ${
                  loading ? 'opacity-80 pointer-events-none' : ''
                }`}
                id="submit-profile-btn"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Enroll & Enter Challengers League</span>
                    <ArrowRight className="w-4 h-4 stroke-[3px]" />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={onLogOut}
                className="w-full py-2.5 rounded-xl font-bold text-xs text-slate-500 hover:bg-slate-50 transition-all border-2 border-slate-150 cursor-pointer text-center"
              >
                Sign Out
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

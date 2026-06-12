import React, { useState } from 'react';
import { StudentProfile, ActivityHistory } from '../types';
import { motion } from 'motion/react';
import { Award, Zap, BookOpen, Calendar, Milestone, ShieldCheck, Heart, Sparkles, Smile } from 'lucide-react';

interface ProfileViewProps {
  profile: StudentProfile;
  history: ActivityHistory[];
  onUpdateAvatar: (newAvatar: string) => void;
  onUpdateName: (newName: string) => void;
}

const AVATAR_OPTIONS = ['🎒', '🦁', '🦊', '🐼', '🦅', '🦄', '🦉', '🦖', '🚀', '🎨', '🐱', '🐸', '🐨', '🐝'];

export const ProfileView: React.FC<ProfileViewProps> = ({
  profile,
  history,
  onUpdateAvatar,
  onUpdateName,
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(profile.name);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  const handleSaveName = () => {
    if (editedName.trim()) {
      onUpdateName(editedName.trim());
      setIsEditingName(false);
    }
  };

  // Counting achievements
  const unlockedCount = profile.achievements.filter((a) => a.unlocked).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
      id="profile-view"
    >
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-black text-blue-900 tracking-tight">
          My Student Profile 🎒
        </h1>
        <p className="text-slate-500 text-sm mt-0.5">
          Customize your character avatar, check your active achievements, and view historic performance log.
        </p>
      </div>

      {/* 1. Profile Core Card */}
      <div className="bg-white border-4 border-blue-100 rounded-3xl p-6 sm:p-8 shadow-vibrant relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-blue-50 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 relative z-10 text-center md:text-left">
          {/* Avatar container */}
          <div className="relative flex-shrink-0 group">
            <div 
              onClick={() => setShowAvatarPicker(!showAvatarPicker)}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-slate-50 border-4 border-blue-600 flex items-center justify-center text-5xl sm:text-6xl cursor-pointer hover:border-yellow-400 transition-all shadow-vibrant select-none transform hover:scale-105"
              title="Click to change avatar"
              id="avatar-display"
            >
              {profile.avatar}
            </div>
            
            <button
              onClick={() => setShowAvatarPicker(!showAvatarPicker)}
              className="absolute -bottom-1 -right-1 bg-yellow-400 border-2 border-white p-1.5 rounded-full shadow text-blue-900 hover:scale-115 transition-transform font-bold cursor-pointer"
              title="Change avatar symbol"
            >
              <Smile className="w-4 h-4 fill-blue-900" />
            </button>
          </div>

          {/* Core metadata info */}
          <div className="flex-grow space-y-3.5 w-full">
            <div className="space-y-1">
              <div className="flex flex-col sm:flex-row sm:items-center justify-center md:justify-start gap-2">
                {isEditingName ? (
                  <div className="flex items-center gap-2 max-w-sm mx-auto md:mx-0">
                    <input
                      type="text"
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      className="px-3 py-1.5 bg-slate-50 border-2 border-slate-300 rounded-xl text-slate-800 text-base font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={handleSaveName}
                      className="px-4 py-1.5 bg-blue-600 text-white rounded-xl text-xs font-black cursor-pointer hover:bg-blue-700"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setEditedName(profile.name);
                        setIsEditingName(false);
                      }}
                      className="text-xs text-slate-500 font-bold hover:underline"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <h2 className="text-2xl font-black tracking-tight text-blue-950 flex items-center justify-center md:justify-start gap-2">
                    {profile.name}
                    <button
                      onClick={() => setIsEditingName(true)}
                      className="text-xs text-blue-600 hover:text-blue-800 font-sans font-black hover:underline cursor-pointer"
                    >
                      (Edit Name)
                    </button>
                  </h2>
                )}
              </div>
              <p className="text-sm font-bold text-slate-500 font-sans">
                Class: <span className="text-blue-600 font-black">{profile.class || profile.grade}</span>
                {profile.department && (
                  <> • Department: <span className="text-blue-900 font-black">{profile.department}</span></>
                )}
                <span> • {profile.school}</span>
              </p>
            </div>

            {/* Quick dashboard stats totals inside profile */}
            <div className="grid grid-cols-3 gap-4 max-w-md mx-auto md:mx-0">
              <div className="p-3 bg-blue-50 border-2 border-blue-400 rounded-2xl text-center shadow-sm">
                <span className="text-[10px] text-blue-900 uppercase tracking-wider font-black block">Score Balance</span>
                <span className="text-lg font-black font-mono text-blue-950">{profile.totalScore}</span>
              </div>
              <div className="p-3 bg-green-50 border-2 border-green-400 rounded-2xl text-center shadow-sm font-sans">
                <span className="text-[10px] text-green-900 uppercase tracking-wider font-black block">Books Read</span>
                <span className="text-lg font-black font-mono text-green-950">{profile.booksRead}</span>
              </div>
              <div className="p-3 bg-yellow-50 border-2 border-yellow-400 rounded-2xl text-center shadow-sm">
                <span className="text-[10px] text-yellow-900 uppercase tracking-wider font-black block">Badges Won</span>
                <span className="text-lg font-black font-mono text-yellow-950">{unlockedCount} / {profile.achievements.length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic character Avatar picker slider */}
        {showAvatarPicker && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-6 pt-5 border-t-2 border-dashed border-slate-150 relative z-10"
            id="avatar-picker-dialog"
          >
            <h4 className="text-xs font-black text-blue-900 uppercase tracking-wider mb-2.5 flex items-center gap-1 leading-none">
              <Sparkles className="w-4 h-4 text-yellow-500 fill-yellow-500" /> Click to Select Your Team Icon:
            </h4>
            <div className="flex flex-wrap gap-2.5">
              {AVATAR_OPTIONS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => {
                    onUpdateAvatar(emoji);
                    setShowAvatarPicker(false);
                  }}
                  className={`w-11 h-11 text-2xl flex items-center justify-center rounded-xl transition-all border-2 cursor-pointer ${
                    profile.avatar === emoji
                      ? 'bg-yellow-400 border-yellow-500 text-blue-900 scale-110 shadow-md font-black'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* 2. Grid split: Badges Achievement list & Activity logs history */}
      <div className="grid lg:grid-cols-5 gap-8">
        
        {/* Left Grid: Badges (2 section columns) */}
        <div className="lg:col-span-2 space-y-5">
          <h3 className="text-xl font-black text-blue-900 tracking-tight flex items-center gap-2">
            <span className="w-2.5 h-6 bg-yellow-400 rounded-full"></span> Earned Badges
          </h3>

          <div className="space-y-4">
            {profile.achievements.map((badge) => (
              <div
                key={badge.id}
                className={`flex gap-4 p-4 border-4 rounded-3xl transition-shadow ${
                  badge.unlocked
                    ? 'bg-yellow-50/50 border-yellow-300 shadow-vibrant'
                    : 'bg-white border-blue-50 opacity-60 shadow-sm'
                }`}
                id={`badge-card-${badge.id}`}
              >
                {/* Badge icon circle */}
                <div className={`w-12 h-12 flex-shrink-0 rounded-2xl flex items-center justify-center font-bold shadow-sm ${
                  badge.unlocked
                    ? 'bg-yellow-400 text-blue-950 border-2 border-white'
                    : 'bg-slate-100 text-slate-400 border border-slate-200'
                }`}>
                  <Award className="w-6 h-6 text-blue-900" />
                </div>

                {/* Badge context */}
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-black ${badge.unlocked ? 'text-blue-950' : 'text-slate-500'}`}>
                      {badge.title}
                    </span>
                    {badge.unlocked && (
                      <span className="text-[9px] font-black text-yellow-905 bg-yellow-400 border border-white px-1.5 py-0.5 rounded uppercase font-mono tracking-wider">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 leading-snug font-medium">
                    {badge.description}
                  </p>
                  {badge.unlocked && badge.unlockedAt && (
                    <span className="text-[9px] text-slate-400 font-mono font-bold flex items-center gap-0.5 pt-1.5">
                      <Calendar className="w-3 h-3 text-blue-600" /> Unlocked: {badge.unlockedAt}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Grid: Activities Log history (3 section columns) */}
        <div className="lg:col-span-3 space-y-5">
          <h3 className="text-xl font-black text-blue-900 tracking-tight flex items-center gap-2">
            <span className="w-2.5 h-6 bg-yellow-400 rounded-full"></span> Challenge Quest History
          </h3>

          {history.length > 0 ? (
            <div className="bg-white border-4 border-blue-105 rounded-3xl shadow-vibrant overflow-hidden" id="quest-history-table">
              <div className="divide-y-2 divide-slate-100">
                {history.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm hover:bg-slate-50 transition-colors"
                  >
                    <div className="space-y-1">
                      <h4 className="font-black text-blue-950 leading-snug">
                        {item.bookTitle}
                      </h4>
                      <p className="text-xs text-slate-400 font-mono font-bold flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" /> Played on {item.dateCompleted}
                      </p>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4">
                      {/* Percent badge */}
                      <div className="text-right">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-black leading-none ${
                          item.percentage === 100
                            ? 'bg-green-100 text-green-800 border-2 border-green-400'
                            : item.percentage >= 60
                              ? 'bg-blue-100 text-blue-800 border-2 border-blue-300'
                              : 'bg-slate-150 text-slate-600'
                        }`}>
                          {item.percentage}% Score
                        </span>
                      </div>

                      {/* Score point balance increase feedback */}
                      <div className="text-right min-w-[70px]">
                        <span className="text-sm font-black text-blue-900 font-mono tracking-tight block">
                          +{item.scoreEarned} pts
                        </span>
                        <span className="text-[9px] uppercase font-black tracking-wider text-slate-400 block leading-none">
                          CLAIMED
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white border-4 border-blue-100 p-10 rounded-3xl text-center text-slate-500 font-bold text-xs shadow-vibrant" id="history-empty-placeholder">
              <Milestone className="w-10 h-10 text-slate-350 mx-auto stroke-1 mb-2 animate-pulse" />
              <p className="text-base font-black text-blue-900">No History Logged Yet</p>
              <p className="text-slate-400 text-xs mt-1 max-w-xs mx-auto">
                No book challenges completed. Head over to the Book Activities tab to start your reading adventure!
              </p>
            </div>
          )}
        </div>

      </div>
    </motion.div>
  );
};

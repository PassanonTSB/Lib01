import React from 'react';
import { Activity, StudentProfile, Page, ActivityHistory } from '../types';
import { BookCover } from './BookCover';
import { motion } from 'motion/react';
import { Trophy, Star, BookOpen, Clock, Heart, ArrowRight, Sparkles } from 'lucide-react';

interface HomeViewProps {
  profile: StudentProfile;
  activities: Activity[];
  onStartQuiz: (activity: Activity) => void;
  setCurrentPage: (page: Page) => void;
  history?: ActivityHistory[];
}

export const HomeView: React.FC<HomeViewProps> = ({
  profile,
  activities,
  onStartQuiz,
  setCurrentPage,
  history = [],
}) => {
  // Find an active activity to recommend
  const activeBook = activities.find((b) => b.status === 'Active') || activities[0];
  const isCompleted = history.some((h) => h.bookId === activeBook.id);

  // Calculate stats
  const nextMilestoneScore = Math.ceil((profile.totalScore + 10) / 100) * 100;
  const scoreProgress = (profile.totalScore % 100);
  const nextBadge = profile.achievements.find(ach => !ach.unlocked) || { title: 'Master Sage' };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
      id="home-view"
    >
      {/* 1. Welcoming Hero Banner */}
      <div className="relative bg-white rounded-3xl p-6 sm:p-8 shadow-vibrant border-4 border-blue-100 flex flex-col lg:flex-row items-center justify-between gap-6 overflow-hidden">
        {/* Background art */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-50 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="relative z-10 flex-1 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-blue-700" />
            <span>Maplewood Champions</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-blue-900 mb-2 leading-tight">
            Welcome back, Explorer {profile.name}! 👋
          </h1>
          <p className="text-base text-slate-600 max-w-xl leading-relaxed">
            You've completed <span className="font-bold text-blue-600">{profile.booksRead} quests</span> so far! Keep up the amazing work to claim new badges and rise to the top ranks.
          </p>
          <div className="flex flex-wrap gap-4 pt-1">
            <div className="bg-yellow-105 border-2 border-yellow-400 p-4 rounded-2xl flex items-center gap-3">
              <div className="text-2xl">🏆</div>
              <div>
                <p className="text-[10px] uppercase font-black text-yellow-800">Total Score</p>
                <p className="text-2xl font-black text-yellow-950 leading-none">{profile.totalScore}</p>
              </div>
            </div>
            <div className="bg-green-105 border-2 border-green-400 p-4 rounded-2xl flex items-center gap-3">
              <div className="text-2xl">🚀</div>
              <div>
                <p className="text-[10px] uppercase font-black text-green-800">Grade Class</p>
                <p className="text-2xl font-black text-green-950 leading-none">{profile.grade}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Large decorative book character circle */}
        <div className="hidden lg:flex w-40 h-40 bg-yellow-400 rounded-full border-8 border-white overflow-hidden items-center justify-center text-6xl shadow-inner flex-shrink-0 animate-bounce duration-5000">
          📚
        </div>
      </div>

      {/* 2. Stats Dashboard & Quest Recommender */}
      <div className="grid md:grid-cols-5 gap-6">
        
        {/* Left Column: Quick Stats Bento Box */}
        <div className="md:col-span-2 space-y-6">
          <h2 className="text-xl font-bold text-blue-900 tracking-tight flex items-center gap-2">
            <span className="w-2.5 h-6 bg-yellow-400 rounded-full"></span> My Challenge Hub
          </h2>

          <div className="grid grid-cols-2 gap-4">
            {/* Stat Item 1 */}
            <div className="p-4 bg-white border-4 border-blue-50 rounded-2xl shadow-vibrant hover:shadow-vibrant transition-shadow">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Books Checked</span>
              <div className="flex items-baseline mt-2 gap-1.5">
                <span className="text-3xl font-black text-blue-600">{profile.booksRead}</span>
                <span className="text-xs text-slate-400 font-bold">read</span>
              </div>
              <p className="text-slate-400 text-[11px] mt-1">Excellent speed!</p>
            </div>

            {/* Stat Item 2 */}
            <div className="p-4 bg-white border-4 border-blue-50 rounded-2xl shadow-vibrant hover:shadow-vibrant transition-shadow">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Active Quests</span>
              <div className="flex items-baseline mt-2 gap-1.5">
                <span className="text-3xl font-black text-emerald-600">
                  {activities.filter(a => a.status === 'Active').length}
                </span>
                <span className="text-xs text-slate-400 font-bold">live</span>
              </div>
              <p className="text-slate-400 text-[11px] mt-1">New releases up</p>
            </div>
          </div>

          {/* Milestone Target Widget */}
          <div className="p-5 bg-white border-4 border-blue-100 rounded-3xl shadow-vibrant space-y-3.5">
            <div className="flex justify-between items-center text-xs">
              <div>
                <span className="font-extrabold text-slate-500 uppercase tracking-widest text-[9px] block">Upcoming Goal</span>
                <span className="font-black text-blue-900 text-sm mt-0.5 block">{nextBadge.title}</span>
              </div>
              <span className="px-2.5 py-1 bg-yellow-100 border border-yellow-400 text-yellow-800 font-black rounded-md text-[9px]">
                {100 - scoreProgress} PTS LEFT
              </span>
            </div>
            
            <div className="relative h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
              <div 
                className="absolute top-0 left-0 h-full bg-yellow-400 rounded-full"
                style={{ width: `${scoreProgress}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-500 leading-normal">
              Keep finishing book quests to unlock this limited edition badge and move ahead on the leaderboards.
            </p>
          </div>
        </div>

        {/* Right Column: Highlighted / Active Reading Activity card */}
        <div className="md:col-span-3 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-blue-900 tracking-tight flex items-center gap-2">
              <span className="w-2.5 h-6 bg-yellow-400 rounded-full"></span> Highlighted Quest
            </h2>
            <button 
              onClick={() => setCurrentPage('activities')}
              className="text-xs text-blue-600 font-black hover:text-blue-800 flex items-center gap-0.5 group uppercase tracking-wider"
            >
              Browse All <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          <div className="relative overflow-hidden bg-white border-4 border-blue-105 rounded-3xl p-5 sm:p-6 shadow-vibrant">
            {/* Top decorative bookmark shape representing active */}
            <div className="absolute top-0 right-6 px-3 py-1.5 bg-yellow-400 text-blue-900 font-black text-[9px] uppercase tracking-wider rounded-b-md border-x border-b border-yellow-500">
              Active Quest
            </div>

            <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start text-center sm:text-left">
              {/* Custom Book Cover Component */}
              <div className="flex-shrink-0 transform hover:-translate-y-1 hover:rotate-1 hover:shadow-xl transition-all duration-300">
                <BookCover
                  title={activeBook.title}
                  author={activeBook.author}
                  coverBg={activeBook.coverBg}
                  coverPattern={activeBook.coverPattern}
                  coverEmoji={activeBook.coverEmoji}
                  size="md"
                />
              </div>

              {/* Quest Details and Button */}
              <div className="flex-grow space-y-3 flex flex-col justify-between h-full min-h-[200px]">
                <div className="space-y-1 text-slate-800">
                  <span className="text-xs uppercase font-black text-blue-600 tracking-wider">
                    {activeBook.genre}
                  </span>
                  <h3 className="text-2xl font-black text-blue-900 leading-tight">
                    {activeBook.title}
                  </h3>
                  <p className="text-xs text-slate-500 font-bold font-mono">
                    by {activeBook.author} • {activeBook.pages} Pages
                  </p>
                  <p className="text-xs text-slate-600 mt-2 line-clamp-3 leading-relaxed">
                    {activeBook.summary}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-2 border-t border-slate-100 gap-3">
                  <div className="flex items-center justify-center sm:justify-start gap-1">
                    <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                    <span className="text-xs text-slate-500 font-semibold">Reward potential:</span>
                    <span className="text-xs text-blue-900 font-black bg-yellow-105 border border-yellow-300 px-2 py-0.5 rounded-full ml-1 font-mono">
                      +{activeBook.points} pts
                    </span>
                  </div>

                  <button
                    onClick={() => onStartQuiz(activeBook)}
                    className={`flex justify-center items-center gap-1.5 px-6 py-3 rounded-2xl text-xs font-black transition-colors shadow-md cursor-pointer ${
                      isCompleted 
                        ? 'bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-805' 
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                    id={`start-active-quest-${activeBook.id}`}
                  >
                    {isCompleted ? 'Quiz Done ✓' : 'Start Game'}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </motion.div>
  );
};

import React, { useState, useMemo } from 'react';
import { Activity, ActivityHistory } from '../types';
import { BookCover } from './BookCover';
import { motion } from 'motion/react';
import { Search, Filter, Lock, CheckCircle2, ChevronRight, Heart, BookOpen, Clock } from 'lucide-react';

interface ActivitiesViewProps {
  activities: Activity[];
  onStartQuiz: (activity: Activity) => void;
  history?: ActivityHistory[];
}

type FilterType = 'all' | 'Active' | 'Closed';

export const ActivitiesView: React.FC<ActivitiesViewProps> = ({ activities, onStartQuiz, history = [] }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<FilterType>('all');
  const [selectedGenre, setSelectedGenre] = useState<string>('All');

  // Extract unique genres for filtering
  const genres = useMemo(() => {
    const allGenres = activities.map((a) => a.genre.split(' / ')[0]);
    return ['All', ...Array.from(new Set(allGenres))];
  }, [activities]);

  // Filter activities based on search query, status, and genre
  const filteredActivities = useMemo(() => {
    return activities.filter((activity) => {
      const matchesSearch =
        activity.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        activity.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        activity.genre.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'all' || activity.status === statusFilter;

      const activityPrimaryGenre = activity.genre.split(' / ')[0];
      const matchesGenre = selectedGenre === 'All' || activityPrimaryGenre === selectedGenre;

      return matchesSearch && matchesStatus && matchesGenre;
    });
  }, [activities, searchQuery, statusFilter, selectedGenre]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
      id="activities-view"
    >
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-blue-900 tracking-tight">
            Reading Quests 🧭
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Choose a book from the library, test your comprehension, and earn student points.
          </p>
        </div>
      </div>

      {/* Search and Filters Controls */}
      <div className="bg-white border-4 border-blue-100 p-5 rounded-3xl shadow-vibrant space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search bar */}
          <div className="relative flex-grow">
            <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by book title, author, or genre..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border-2 border-slate-250 placeholder:text-slate-400 text-slate-700 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-sans"
            />
          </div>

          {/* Quick status tabs inside filters */}
          <div className="flex items-center gap-1 bg-slate-100 border-2 border-slate-200 p-1 rounded-xl self-start md:self-stretch">
            {(['all', 'Active', 'Closed'] as FilterType[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`px-4 py-1.5 rounded-lg text-xs font-extrabold capitalize transition-all cursor-pointer ${
                  statusFilter === tab
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-850 hover:bg-slate-200/50'
                }`}
              >
                {tab === 'all' ? 'show all' : tab}
              </button>
            ))}
          </div>
        </div>

        {/* Genre filtering chips */}
        <div className="flex items-center gap-2 flex-wrap pt-2 border-t-2 border-dashed border-slate-150">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5" /> Genre:
          </span>
          {genres.map((genre) => (
            <button
              key={genre}
              onClick={() => setSelectedGenre(genre)}
              className={`px-3 py-1 rounded-full text-xs font-black transition-all cursor-pointer ${
                selectedGenre === genre
                  ? 'bg-blue-105 border-2 border-blue-500 text-blue-900'
                  : 'bg-white border-2 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {genre}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of book cards */}
      {filteredActivities.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredActivities.map((activity, index) => {
            const isActive = activity.status === 'Active';
            const isCompleted = history.some((h) => h.bookId === activity.id);

            return (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: index * 0.04 }}
                className={`relative flex flex-col justify-between p-5 bg-white border-4 border-blue-100 rounded-3xl shadow-vibrant transition-all duration-300 group ${
                  !isActive ? 'opacity-75' : ''
                }`}
              >
                <div className="flex gap-4 items-start">
                  {/* Book cover component */}
                  <div className="flex-shrink-0 transform group-hover:-translate-y-1 group-hover:rotate-1 transition-all duration-300">
                    <BookCover
                      title={activity.title}
                      author={activity.author}
                      coverBg={activity.coverBg}
                      coverPattern={activity.coverPattern}
                      coverEmoji={activity.coverEmoji}
                      size="sm"
                    />
                  </div>

                  {/* Info block */}
                  <div className="flex-grow space-y-1.5 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-black text-blue-700 uppercase tracking-wider truncate bg-blue-50 px-2 py-0.5 rounded-md">
                        {activity.genre.split(' / ')[0]}
                      </span>
                      
                      {/* Status Tag */}
                      {isCompleted ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-tight bg-emerald-100 border border-emerald-200 text-emerald-800">
                          <CheckCircle2 className="w-2.5 h-2.5 text-emerald-500" />
                          Submitted
                        </span>
                      ) : (
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-tight ${
                          isActive
                            ? 'bg-green-100 text-green-800 border bg-green-50'
                            : 'bg-amber-100 text-amber-805 border bg-amber-50'
                        }`}>
                          {isActive ? (
                            <>
                              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                              Active
                            </>
                          ) : (
                            <>
                              <Lock className="w-2.5 h-2.5" />
                              Closed
                            </>
                          )}
                        </span>
                      )}
                    </div>

                    <h3 className="font-sans font-black text-blue-950 text-sm sm:text-base leading-snug truncate group-hover:text-blue-600 transition-colors">
                      {activity.title}
                    </h3>
                    
                    <p className="text-xs text-slate-500 font-bold font-sans truncate">
                      by {activity.author}
                    </p>

                    <div className="flex items-center gap-2 pt-1 font-mono text-[10px] text-slate-400">
                      <span className="flex items-center gap-0.5 font-bold">
                        <BookOpen className="w-3 h-3 text-slate-350" /> {activity.pages}p
                      </span>
                      <span>•</span>
                      <span className="text-blue-950 font-black bg-yellow-105 border border-yellow-300 px-1.5 py-0.5 rounded">
                        +{activity.points} pts
                      </span>
                    </div>

                    {/* Short excerpt description */}
                    <p className="text-xs text-slate-505 line-clamp-2 leading-relaxed pt-1 select-none">
                      {activity.summary}
                    </p>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="mt-4 pt-3.5 border-t-2 border-dashed border-slate-100 flex items-center justify-between">
                  {isCompleted ? (
                    <div className="text-[11px] text-emerald-700 font-extrabold flex items-center gap-1 select-none">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Quest Completed!
                    </div>
                  ) : isActive ? (
                    <div className="text-[11px] text-emerald-600 font-black flex items-center gap-1 select-none">
                      <Clock className="w-3.5 h-3.5 text-emerald-500" /> High Reward Ready
                    </div>
                  ) : (
                    <div className="text-[11px] text-slate-550 font-bold flex items-center gap-1 select-none">
                      <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" /> Practice Quest
                    </div>
                  )}

                  <button
                    onClick={() => onStartQuiz(activity)}
                    className={`flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-black tracking-tight shadow-sm cursor-pointer transition-all ${
                      isCompleted
                        ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-805 border border-emerald-200'
                        : isActive
                        ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                    }`}
                    id={`start-quest-${activity.id}`}
                  >
                    {isCompleted ? 'Quiz Done ✓' : isActive ? 'Start Challenge' : 'Play and Review'}
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white border-4 border-blue-100 rounded-3xl p-12 text-center shadow-vibrant" id="empty-activities-fallback">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto stroke-1 mb-2" />
          <h3 className="text-lg font-black text-blue-900">No Quests Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
            We couldn't find matching activities for your search. Try resetting filters or search inputs.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setStatusFilter('all');
              setSelectedGenre('All');
            }}
            className="text-xs text-blue-650 font-black hover:text-blue-800 underline mt-4 cursor-pointer"
          >
            Reset All Filters
          </button>
        </div>
      )}
    </motion.div>
  );
};

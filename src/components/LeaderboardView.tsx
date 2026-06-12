import React, { useMemo, useState, useEffect } from 'react';
import { LeaderboardEntry } from '../types';
import { motion } from 'motion/react';
import { Trophy, Star, Sparkles, Medal, Eye } from 'lucide-react';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { INITIAL_LEADERBOARD } from '../data';

interface LeaderboardViewProps {
  leaderboard: LeaderboardEntry[];
  currentUserName: string;
  currentUserId?: string;
  currentUserAvatar?: string;
}

const EMOJIS = ['🦁', '🦊', '🐼', '🦅', '🦄', '🐝', '🦉', '🐨', '🐸', '🐙', '🦖', '🐹', '🐻', '🐒'];

function getStableAvatar(userId: string, name: string, currentUserId: string, currentUserAvatar?: string): string {
  if (userId === currentUserId && currentUserAvatar) {
    return currentUserAvatar;
  }
  // Check if name is in initial template and keep its custom avatar
  if (name.includes('Sophia')) return '🦁';
  if (name.includes('Liam')) return '🦊';
  if (name.includes('Olivia')) return '🐼';
  if (name.includes('Alex')) return '🎒';
  if (name.includes('Ethan')) return '🦅';
  if (name.includes('Emma')) return '🦄';

  // Fallback hash
  let sum = 0;
  for (let i = 0; i < userId.length; i++) {
    sum += userId.charCodeAt(i);
  }
  return EMOJIS[sum % EMOJIS.length];
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({
  leaderboard,
  currentUserName,
  currentUserId = 'user-default',
  currentUserAvatar = '🎒'
}) => {
  const [liveEntries, setLiveEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Live real-time Firestore synchronization for Leaderboard
  useEffect(() => {
    const path = 'users';
    const usersCol = collection(db, path);
    const q = query(usersCol, orderBy('totalScore', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const entries: LeaderboardEntry[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        entries.push({
          id: doc.id,
          name: data.name || 'Anonymous Reader',
          score: data.totalScore ?? 0,
          avatar: getStableAvatar(doc.id, data.name || '', currentUserId, currentUserAvatar)
        });
      });
      setLiveEntries(entries);
      setLoading(false);
    }, (error) => {
      console.warn("Could not retrieve live classroom standings, fallback enabled: ", error);
      // Fallback silently to display offline entries
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUserId, currentUserAvatar]);

  // Combine live users with other Maplewood mock classmates for a full scoreboard
  const sortedEntries = useMemo(() => {
    if (liveEntries.length > 0) {
      // Filter out INITIAL_LEADERBOARD user-default or anything overlapping with actual live accounts
      const remainingMock = INITIAL_LEADERBOARD.filter((mock) => {
        if (mock.id === 'user-default') return false;
        // If current user is logged in as a mock account, remove it
        if (mock.id === currentUserId) return false;
        // Check matching name to avoid duplicate classmates
        const isDuplicateName = liveEntries.some(live => live.name.toLowerCase() === mock.name.toLowerCase());
        return !isDuplicateName;
      });

      const combined = [...liveEntries, ...remainingMock];
      return combined.sort((a, b) => b.score - a.score);
    }

    // Fallback if index/offline
    return [...leaderboard].sort((a, b) => b.score - a.score);
  }, [liveEntries, leaderboard, currentUserId]);

  // Extract Top 3 for the podium
  const topThree = useMemo(() => {
    const list = sortedEntries.slice(0, 3);
    const podiumList = [];
    if (list[1]) podiumList.push({ ...list[1], rank: 2 });
    if (list[0]) podiumList.push({ ...list[0], rank: 1 });
    if (list[2]) podiumList.push({ ...list[2], rank: 3 });
    return podiumList;
  }, [sortedEntries]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
      id="leaderboard-view"
    >
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-black text-blue-900 tracking-tight">
          Classroom Leaderboard 🏆
        </h1>
        <p className="text-slate-500 text-sm mt-0.5">
          Join classmates in the Maplewood challenge! Score points by completing book quizzes to rise.
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12" id="leaderboard-loading">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">
            Synchronizing Scores...
          </p>
        </div>
      ) : (
        <>
          {/* Visual Podium for top 3 */}
          <div className="grid grid-cols-3 gap-3 sm:gap-6 pt-4 items-end max-w-2xl mx-auto" id="leaderboard-podium">
            {topThree.map((player) => {
              const isFirst = player.rank === 1;
              const isSecond = player.rank === 2;
              const isThird = player.rank === 3;
              const isCurrentUser = player.id === currentUserId || player.name === currentUserName;

              return (
                <motion.div
                  key={player.id}
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: player.rank * 0.1 }}
                  className={`flex flex-col items-center ${isFirst ? 'z-10' : 'z-0'}`}
                >
                  {/* Avatar and Medal indicator */}
                  <div className="relative mb-3 flex flex-col items-center">
                    <div className={`relative flex items-center justify-center rounded-full bg-white select-none shadow-vibrant ${
                      isFirst ? 'w-16 h-16 sm:w-20 sm:h-20 border-4 border-yellow-400' : 'w-12 h-12 sm:w-16 sm:h-16 border-4 border-blue-400'
                    }`}>
                      <span className={isFirst ? 'text-3xl sm:text-4xl' : 'text-xl sm:text-2xl'}>
                        {player.id === currentUserId ? currentUserAvatar : player.avatar}
                      </span>

                      {/* Medal Bubble */}
                      <div className={`absolute -bottom-2 right-1/2 translate-x-1/2 flex items-center justify-center rounded-full text-[10px] w-5 h-5 font-black shadow border border-white ${
                        isFirst ? 'bg-yellow-450 text-blue-950' : isSecond ? 'bg-blue-600 text-white' : 'bg-green-600 text-white'
                      }`}>
                        {player.rank}
                      </div>
                    </div>
                  </div>

                  {/* Name Label */}
                  <div className="text-center w-full px-1 max-w-[120px]">
                    <span className={`block truncate text-xs sm:text-sm font-black ${isCurrentUser ? 'text-blue-600 underline decoration-yellow-450' : 'text-slate-900'}`}>
                      {player.name} {isCurrentUser && '🎖️'}
                    </span>
                    <span className="text-[10px] sm:text-xs font-black text-blue-900 bg-yellow-105 border border-yellow-300 px-1.5 py-0.5 rounded-full inline-block mt-0.5 font-mono font-bold">
                      {player.score} pts
                    </span>
                  </div>

                  {/* Graphical Podium Stand */}
                  <div className={`w-full mt-3 rounded-t-2xl flex flex-col justify-end items-center text-center p-2 sm:p-4 border-t-2 border-white shadow-md ${
                    isFirst 
                      ? 'h-32 sm:h-40 bg-yellow-400 text-blue-950 border-4 border-yellow-500' 
                      : isSecond 
                        ? 'h-24 sm:h-30 bg-blue-100 text-blue-900 border-4 border-blue-300'
                        : 'h-20 sm:h-24 bg-green-100 text-green-955 border-4 border-green-300'
                  }`}>
                    <Medal className={`w-5 h-5 sm:w-6 sm:h-6 mb-1 opacity-90 ${isFirst && 'animate-bounce text-yellow-800'}`} />
                    <span className="text-[10px] uppercase font-black tracking-wider leading-none">
                      Rank {player.rank}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Leaderboard Remaining List Table */}
          <div className="bg-white border-4 border-blue-100 rounded-3xl shadow-vibrant overflow-hidden" id="leaderboard-table-container">
            <div className="px-5 py-4 bg-blue-50/50 border-b-4 border-blue-100 flex justify-between items-center">
              <h3 className="text-sm font-black text-blue-950 flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-yellow-500 fill-yellow-500" /> Standings Table
              </h3>
              <span className="text-[10px] font-black text-blue-600 bg-blue-100 px-2 py-0.5 rounded-md uppercase tracking-wider font-mono">
                {sortedEntries.length} contestants active
              </span>
            </div>

            <div className="divide-y-2 divide-slate-100 max-h-[500px] overflow-y-auto">
              {sortedEntries.map((player, index) => {
                const isCurrentUser = player.id === currentUserId || player.name === currentUserName;
                const rank = index + 1;

                return (
                  <div
                    key={player.id}
                    className={`flex items-center justify-between px-5 py-4 transition-colors ${
                      isCurrentUser ? 'bg-yellow-105/70 font-bold' : 'hover:bg-slate-50'
                    }`}
                    id={`leaderboard-row-${rank}`}
                  >
                    {/* Left controls: rank + avatar + name */}
                    <div className="flex items-center gap-4 min-w-0">
                      {/* Rank badge */}
                      <div className="w-6 text-center">
                        {rank <= 3 ? (
                          <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full font-black text-xs ${
                            rank === 1 ? 'bg-yellow-400 text-blue-950' : rank === 2 ? 'bg-blue-100 text-blue-900' : 'bg-green-100 text-green-955'
                          }`}>
                            {rank}
                          </span>
                        ) : (
                          <span className="text-slate-400 font-mono text-xs font-black">
                            {rank}
                          </span>
                        )}
                      </div>

                      {/* Character Avatar Emoji */}
                      <span className="text-2xl w-10 h-10 rounded-full bg-slate-50 border-2 border-slate-205 flex items-center justify-center select-none shadow-sm">
                        {player.id === currentUserId ? currentUserAvatar : player.avatar}
                      </span>

                      {/* Name */}
                      <div className="min-w-0">
                        <p className={`text-sm font-black truncate leading-snug flex items-center gap-1.5 ${
                          isCurrentUser ? 'text-blue-900' : 'text-slate-800'
                        }`}>
                          {player.name}
                          {isCurrentUser && (
                            <span className="px-2 py-0.5 bg-yellow-400 text-blue-900 text-[9px] font-black uppercase tracking-wider rounded-md border border-white">
                              Me
                            </span>
                          )}
                        </p>
                        <p className="text-[10px] text-slate-400 font-bold font-sans">
                          Student • Maplewood {player.id === currentUserId ? 'Classroom' : 'Elementary'}
                        </p>
                      </div>
                    </div>

                    {/* Right controls: score points & status */}
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="font-mono text-sm font-black text-slate-805 leading-none">
                          {player.score}
                        </p>
                        <p className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">
                          POINTS
                        </p>
                      </div>
                      
                      {isCurrentUser && (
                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-400 animate-ping border border-white" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
};

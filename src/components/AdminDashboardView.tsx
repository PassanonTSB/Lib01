import React, { useMemo, useState, useEffect } from 'react';
import { Activity, StudentProfile, LeaderboardEntry } from '../types';
import { db, auth } from '../firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { motion } from 'motion/react';
import { 
  Users, 
  BookOpen, 
  Award, 
  Download, 
  Search, 
  RefreshCw, 
  ChevronRight, 
  TrendingUp, 
  Trophy, 
  Clock, 
  CheckCircle2, 
  ShieldCheck 
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';
import { INITIAL_LEADERBOARD } from '../data';

interface AdminDashboardViewProps {
  activities: Activity[];
}

export interface MergedSubmission {
  id: string;
  userId: string;
  studentName: string;
  studentAvatar: string;
  activityId: string;
  activityTitle: string;
  score: number;
  totalPoints: number;
  percentage: number;
  answers: string[];
  submittedAtFormatted: string;
  submittedAtDate: Date;
  isMock: boolean;
}

// Definition of premium mock submissions to represent accurate initial school ledger
const MOCK_SUBMISSIONS: Omit<MergedSubmission, 'activityTitle' | 'totalPoints' | 'percentage'>[] = [
  {
    id: 'mock-sub-1',
    userId: '1', // Sophia
    studentName: 'Sophia Gardner',
    studentAvatar: '🦁',
    activityId: 'around-world-80',
    score: 120,
    answers: ['80 days', 'Reform Club', 'Passepartout', 'Suez', 'Detective Fix'],
    submittedAtFormatted: '2026-06-11 14:32',
    submittedAtDate: new Date('2026-06-11T14:32:00Z'),
    isMock: true
  },
  {
    id: 'mock-sub-2',
    userId: '1', // Sophia
    studentName: 'Sophia Gardner',
    studentAvatar: '🦁',
    activityId: 'alice-wonderland',
    score: 80,
    answers: ['White Rabbit', 'Drink Me potion', 'Cheshire Cat', 'The Queen of Hearts', 'Tweedledee'],
    submittedAtFormatted: '2026-06-10 11:15',
    submittedAtDate: new Date('2026-06-10T11:15:00Z'),
    isMock: true
  },
  {
    id: 'mock-sub-3',
    userId: '2', // Liam
    studentName: 'Liam Sterling',
    studentAvatar: '🦊',
    activityId: 'treasure-island',
    score: 100,
    answers: ['Jim Hawkins', 'Billy Bones', 'Squire Trelawney', 'Long John Silver', 'Captain Smollett'],
    submittedAtFormatted: '2026-06-11 09:40',
    submittedAtDate: new Date('2026-06-11T09:40:00Z'),
    isMock: true
  },
  {
    id: 'mock-sub-4',
    userId: '3', // Olivia
    studentName: 'Olivia Bennett',
    studentAvatar: '🐼',
    activityId: 'secret-garden',
    score: 90,
    answers: ['Mary Lennox', 'Colin Craven', 'Dickon Sowerby', 'Archibald Craven', 'Ben Weatherstaff'],
    submittedAtFormatted: '2026-06-09 16:20',
    submittedAtDate: new Date('2026-06-09T16:20:00Z'),
    isMock: true
  },
  {
    id: 'mock-sub-5',
    userId: '4', // Ethan
    studentName: 'Ethan Hunt',
    studentAvatar: '🦅',
    activityId: 'peter-pan',
    score: 60,
    answers: ['Neverland', 'Tinker Bell', 'Captain Hook', 'Smee', 'John Darling'],
    submittedAtFormatted: '2026-06-08 10:05',
    submittedAtDate: new Date('2026-06-08T10:05:00Z'),
    isMock: true
  },
  {
    id: 'mock-sub-6',
    userId: '5', // Emma
    studentName: 'Emma Watson',
    studentAvatar: '🦄',
    activityId: 'alice-wonderland',
    score: 80,
    answers: ['White Rabbit', 'Drink Me potion', 'Cheshire Cat', 'The Queen of Hearts', 'Tweedledee'],
    submittedAtFormatted: '2026-06-07 13:50',
    submittedAtDate: new Date('2026-06-07T13:50:00Z'),
    isMock: true
  },
  {
    id: 'mock-sub-7',
    userId: '2', // Liam
    studentName: 'Liam Sterling',
    studentAvatar: '🦊',
    activityId: 'around-world-80',
    score: 120,
    answers: ['80 days', 'Reform Club', 'Passepartout', 'Suez', 'Detective Fix'],
    submittedAtFormatted: '2026-06-10 15:10',
    submittedAtDate: new Date('2026-06-10T15:10:00Z'),
    isMock: true
  },
  {
    id: 'mock-sub-8',
    userId: '3', // Olivia
    studentName: 'Olivia Bennett',
    studentAvatar: '🐼',
    activityId: 'around-world-80',
    score: 120,
    answers: ['80 days', 'Reform Club', 'Passepartout', 'Suez', 'Detective Fix'],
    submittedAtFormatted: '2026-06-09 18:45',
    submittedAtDate: new Date('2026-06-09T18:45:00Z'),
    isMock: true
  }
];

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({ activities }) => {
  const [liveUsers, setLiveUsers] = useState<StudentProfile[]>([]);
  const [liveSubmissions, setLiveSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedActivityFilter, setSelectedActivityFilter] = useState('All');

  // Sync real-time Firestore DB users & submissions
  useEffect(() => {
    let unsubscribeUsers = () => {};
    let unsubscribeSubmissions = () => {};

    try {
      const usersQuery = collection(db, 'users');
      unsubscribeUsers = onSnapshot(usersQuery, (snapshot) => {
        const usersList: StudentProfile[] = [];
        snapshot.forEach((doc) => {
          const d = doc.data();
          usersList.push({
            userId: doc.id,
            name: d.name || 'Anonymous Reader',
            avatar: d.avatar || '🎒',
            grade: d.class || 'Unknown Grade',
            school: d.department || 'Maplewood Elementary',
            totalScore: d.totalScore ?? 0,
            booksRead: d.booksRead ?? 0,
            achievements: d.achievements || []
          });
        });
        setLiveUsers(usersList);
      }, (e) => {
        console.warn("Could not sync live users for Admin Analytics: ", e);
      });

      const submissionsQuery = query(collection(db, 'submissions'), orderBy('submittedAt', 'desc'));
      unsubscribeSubmissions = onSnapshot(submissionsQuery, (snapshot) => {
        const subsList: any[] = [];
        snapshot.forEach((doc) => {
          subsList.push({
            id: doc.id,
            ...doc.data()
          });
        });
        setLiveSubmissions(subsList);
        setLoading(false);
      }, (e) => {
        console.warn("Could not sync live submissions for Admin Analytics: ", e);
        setLoading(false);
      });
    } catch (err) {
      console.warn("Firestore listener initialization failed: ", err);
      setLoading(false);
    }

    return () => {
      unsubscribeUsers();
      unsubscribeSubmissions();
    };
  }, []);

  // Compute a list of unique student IDs/profiles across both live and template profiles
  const mergedStudents = useMemo(() => {
    const studentMap = new Map<string, { name: string; avatar: string; score: number }>();
    
    // 1. Core template students
    INITIAL_LEADERBOARD.forEach(mock => {
      if (mock.id !== 'user-default') {
        studentMap.set(mock.id, {
          name: mock.name,
          avatar: mock.avatar,
          score: mock.score
        });
      }
    });

    // 2. Overlay live Firestore registered users
    liveUsers.forEach(user => {
      if (user.userId) {
        studentMap.set(user.userId, {
          name: user.name,
          avatar: user.avatar,
          score: user.totalScore
        });
      }
    });

    return Array.from(studentMap.entries()).map(([id, s]) => ({ id, ...s }));
  }, [liveUsers]);

  // Master merged activities mapping
  const activitiesMap = useMemo(() => {
    return new Map<string, Activity>(activities.map(a => [a.id, a]));
  }, [activities]);

  // Merge Submissions (incorporates live Firestore submissions and mock list cleanly)
  const masterSubmissionsList = useMemo(() => {
    // 1. Process live submissions from Firestore
    const liveSubsMerged: MergedSubmission[] = liveSubmissions.map(sub => {
      const matchedAct = activitiesMap.get(sub.activityId);
      const studentProfile = mergedStudents.find(s => s.id === sub.userId);
      const studentName = studentProfile?.name || 'Anonymous Reader';
      const studentAvatar = studentProfile?.avatar || '🎒';
      
      const actTitle = matchedAct?.title || sub.activityId || 'Reading Activity';
      const totalPoints = matchedAct?.points || 100;
      const percentage = totalPoints > 0 ? Math.round((sub.score / totalPoints) * 100) : 0;
      
      // Handle Firebase Timestamp
      let submittedDate = new Date();
      if (sub.submittedAt) {
        if (typeof sub.submittedAt.toDate === 'function') {
          submittedDate = sub.submittedAt.toDate();
        } else if (sub.submittedAt.seconds) {
          submittedDate = new Date(sub.submittedAt.seconds * 1000);
        } else {
          submittedDate = new Date(sub.submittedAt);
        }
      }

      // Format date beautifully
      const pad = (n: number) => n.toString().padStart(2, '0');
      const formattedDate = `${submittedDate.getFullYear()}-${pad(submittedDate.getMonth() + 1)}-${pad(submittedDate.getDate())} ${pad(submittedDate.getHours())}:${pad(submittedDate.getMinutes())}`;

      return {
        id: sub.id,
        userId: sub.userId,
        studentName,
        studentAvatar,
        activityId: sub.activityId,
        activityTitle: actTitle,
        score: sub.score,
        totalPoints,
        percentage,
        answers: sub.answers || [],
        submittedAtFormatted: formattedDate,
        submittedAtDate: submittedDate,
        isMock: false
      };
    });

    // 2. Identify and filter mock entries that have been replaced by actual real submissions (using composite key userId + activityId)
    const liveCompositeKeys = new Set(liveSubsMerged.map(s => `${s.userId}_${s.activityId}`));

    const mockSubsMerged: MergedSubmission[] = MOCK_SUBMISSIONS
      .filter(mock => {
        const compositeKey = `${mock.userId}_${mock.activityId}`;
        return !liveCompositeKeys.has(compositeKey);
      })
      .map(mock => {
        const matchedAct = activitiesMap.get(mock.activityId);
        const totalPoints = matchedAct?.points || 100;
        const percentage = Math.round((mock.score / totalPoints) * 100);
        return {
          ...mock,
          activityTitle: matchedAct?.title || mock.activityId,
          totalPoints,
          percentage
        };
      });

    // 3. Combine both lists, sort by date descending
    const combined = [...liveSubsMerged, ...mockSubsMerged];
    return combined.sort((a, b) => b.submittedAtDate.getTime() - a.submittedAtDate.getTime());
  }, [liveSubmissions, activitiesMap, mergedStudents]);

  // Filtered submissions for display in table
  const filteredSubmissions = useMemo(() => {
    return masterSubmissionsList.filter(sub => {
      const matchSearch = 
        sub.studentName.toLowerCase().includes(searchTerm.toLowerCase()) || 
        sub.activityTitle.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchActivity = selectedActivityFilter === 'All' || sub.activityId === selectedActivityFilter;

      return matchSearch && matchActivity;
    });
  }, [masterSubmissionsList, searchTerm, selectedActivityFilter]);

  // Calculations for Activity metrics and avg scores
  const activityStats = useMemo(() => {
    return activities.map(act => {
      // Find all submissions matching this specific activity
      const submissions = masterSubmissionsList.filter(s => s.activityId === act.id);
      const totalScore = submissions.reduce((sum, s) => sum + s.score, 0);
      const avgScore = submissions.length > 0 ? Math.round((totalScore / submissions.length) * 10) / 10 : 0;
      
      let color = '#3b82f6'; // fallback blue
      if (act.id === 'alice-wonderland') color = '#6366f1'; // Indigo
      else if (act.id === 'treasure-island') color = '#f59e0b'; // Amber
      else if (act.id === 'secret-garden') color = '#10b981'; // Emerald
      else if (act.id === 'peter-pan') color = '#22c55e'; // Green
      else if (act.id === 'around-world-80') color = '#2563eb'; // Deep Blue

      return {
        id: act.id,
        title: act.title,
        avgScore: avgScore,
        submissionsCount: submissions.length,
        points: act.points,
        color
      };
    });
  }, [activities, masterSubmissionsList]);

  // Overall statistics counters
  const totalStudentsCount = mergedStudents.length;
  const totalActivitiesCount = activities.length;
  const averageQuizScorePercentage = useMemo(() => {
    if (masterSubmissionsList.length === 0) return 0;
    const totalPct = masterSubmissionsList.reduce((sum, s) => sum + s.percentage, 0);
    return Math.round(totalPct / masterSubmissionsList.length);
  }, [masterSubmissionsList]);

  // Handler for Exporting CSV
  const handleExportCSV = () => {
    // Define columns
    const headers = ['Submission ID', 'Student ID', 'Student Name', 'Activity Book ID', 'Book Title', 'Score Recieved', 'Total Points Available', 'Percentage Grade', 'Answers Chosen', 'Submission Date Time', 'Log Source'];
    
    const rows = masterSubmissionsList.map(sub => [
      sub.id,
      sub.userId,
      `"${sub.studentName.replace(/"/g, '""')}"`,
      sub.activityId,
      `"${sub.activityTitle.replace(/"/g, '""')}"`,
      sub.score,
      sub.totalPoints,
      `${sub.percentage}%`,
      `"${sub.answers?.join('; ') || ''}"`,
      sub.submittedAtFormatted,
      sub.isMock ? 'Mock Initial Data' : 'Real-Time Firestore Log'
    ]);

    const csvContent = "\uFEFF" + [  // BOM for Excel UTF-8 support
      headers.join(','),
      ...rows.map(e => e.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `maplewood_reading_submissions_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
      id="admin-dashboard-container"
    >
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-black text-blue-900 tracking-tight">
              School Admin Panel 📊
            </h1>
            <span className="inline-flex items-center gap-1.5 bg-blue-100 text-blue-800 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full">
              <ShieldCheck className="w-3.5 h-3.5" /> Registered Teacher
            </span>
          </div>
          <p className="text-slate-500 text-sm mt-0.5">
            Monitor real-time student engagement, quiz stats, and export grades CSV for Maplewood Elementary.
          </p>
        </div>

        {/* Action button CSV */}
        <button
          onClick={handleExportCSV}
          className="flex items-center justify-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-black text-xs rounded-2xl shadow-vibrant hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer border-none"
          id="export-csv-btn"
        >
          <Download className="w-4 h-4" />
          Export submissions CSV
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5" id="admin-kpi-grid">
        {/* Metric 1 */}
        <div className="bg-white border-4 border-blue-100 rounded-3xl p-5 shadow-vibrant flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border-2 border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Total Students</p>
            <h3 className="text-2xl font-black text-slate-800 leading-none mt-1">{totalStudentsCount}</h3>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white border-4 border-blue-100 rounded-3xl p-5 shadow-vibrant flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border-2 border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Total Activities</p>
            <h3 className="text-2xl font-black text-slate-800 leading-none mt-1">{totalActivitiesCount}</h3>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white border-4 border-blue-100 rounded-3xl p-5 shadow-vibrant flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border-2 border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Average Score %</p>
            <h3 className="text-2xl font-black text-slate-800 leading-none mt-1">{averageQuizScorePercentage}%</h3>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white border-4 border-blue-100 rounded-3xl p-5 shadow-vibrant flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border-2 border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Submissions Logged</p>
            <h3 className="text-2xl font-black text-slate-800 leading-none mt-1">{masterSubmissionsList.length}</h3>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20" id="admin-loading-indicator">
          <RefreshCw className="w-10 h-10 text-blue-600 animate-spin mb-3" />
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
            Synchronizing analytics registry...
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="admin-main-grid">
          {/* Chart Section */}
          <div className="lg:col-span-7 bg-white border-4 border-blue-100 rounded-3xl p-6 shadow-vibrant flex flex-col justify-between" id="admin-chart-card">
            <div>
              <h3 className="text-sm font-black text-blue-950 flex items-center gap-1.5 mb-1">
                <TrendingUp className="w-4 h-4 text-indigo-500" /> Book Activity Breakdown
              </h3>
              <p className="text-xs text-slate-400 font-bold mb-6">
                Comparative analysis of average score (pts) earned per available trivia challenge.
              </p>
            </div>

            <div className="h-72 w-full" id="admin-barchart-container">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={activityStats}
                  margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="title" 
                    tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }}
                    axisLine={{ stroke: '#cbd5e1', strokeWidth: 2 }}
                    tickLine={false}
                    tickFormatter={(value) => value.length > 20 ? `${value.slice(0, 18)}...` : value}
                  />
                  <YAxis 
                    tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }}
                    axisLine={{ stroke: '#cbd5e1', strokeWidth: 2 }}
                    tickLine={false}
                  />
                  <Tooltip
                    cursor={{ fill: '#f8fafc', opacity: 0.6 }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-slate-900 text-white rounded-xl p-3 shadow-xl border border-slate-800 text-xs font-sans">
                            <p className="font-black leading-snug mb-1">{data.title}</p>
                            <p className="font-bold text-slate-300">
                              Average: <span className="font-mono text-yellow-400 font-black">{data.avgScore}</span> / {data.points} pts
                            </p>
                            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                              {data.submissionsCount} submissions compiled
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="avgScore" radius={[8, 8, 0, 0]}>
                    {activityStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3" id="admin-chart-legends">
              {activityStats.map((stat, i) => (
                <div key={stat.id} className="text-[10px] flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: stat.color }} />
                  <div className="min-w-0">
                    <p className="font-bold text-slate-800 truncate leading-none">{stat.title}</p>
                    <p className="text-[9px] text-slate-400 font-mono mt-0.5">{stat.avgScore} pts avg</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Metrics of Activity engagements */}
          <div className="lg:col-span-5 bg-white border-4 border-blue-100 rounded-3xl p-6 shadow-vibrant flex flex-col justify-between" id="admin-activities-checklist">
            <div>
              <h3 className="text-sm font-black text-blue-950 flex items-center gap-1.5 mb-1">
                <BookOpen className="w-4 h-4 text-emerald-500" /> Curricular Health
              </h3>
              <p className="text-xs text-slate-400 font-bold mb-4">
                Verify active level participation for each scholastic book.
              </p>
            </div>

            <div className="space-y-3">
              {activityStats.map((stat) => {
                const enrollmentMax = totalStudentsCount;
                const ratioPct = enrollmentMax > 0 ? Math.round((stat.submissionsCount / enrollmentMax) * 100) : 0;
                return (
                  <div key={stat.id} className="p-3.5 bg-slate-50/50 rounded-2xl border-2 border-slate-100/50 flex flex-col gap-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-black text-slate-700 truncate max-w-[200px]">{stat.title}</span>
                      <span className="font-mono font-bold text-slate-500">{stat.submissionsCount}/{enrollmentMax} students</span>
                    </div>
                    {/* Progress tracking bar */}
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${ratioPct}%`, backgroundColor: stat.color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <p className="text-[10px] text-slate-400 font-bold mt-4 leading-normal text-center bg-blue-50/50 rounded-xl p-2.5 border border-blue-100/50">
              💡 Class-wide completion rates above 60% earn the entire Maplewood class a bonus "Library Champion" ribbon dynamic badge!
            </p>
          </div>

          {/* Recent Submissions Ledger Table */}
          <div className="lg:col-span-12 bg-white border-4 border-blue-100 rounded-3xl shadow-vibrant overflow-hidden" id="admin-submissions-ledger">
            <div className="px-5 py-4 bg-blue-50/50 border-b-4 border-blue-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="text-sm font-black text-blue-950 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-yellow-500 fill-yellow-500" /> Student Submissions Registry
                </h3>
                <p className="text-[11px] text-slate-400 font-bold mt-0.5">
                  Audited list of trivia quiz responses. Includes real-time Firestore synchronization.
                </p>
              </div>

              {/* Filters Panel */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search student or activity..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 pr-3 py-1.5 text-xs bg-white border-2 border-slate-205 rounded-xl text-slate-705 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-0 w-44 font-medium transition-colors"
                  />
                </div>

                {/* Dropdown status */}
                <select
                  value={selectedActivityFilter}
                  onChange={(e) => setSelectedActivityFilter(e.target.value)}
                  className="px-3 py-1.5 text-xs bg-white border-2 border-slate-205 rounded-xl text-slate-705 focus:outline-none focus:border-blue-500 focus:ring-0 font-bold transition-all cursor-pointer outline-none"
                >
                  <option value="All">All Books</option>
                  {activities.map(a => (
                    <option key={a.id} value={a.id}>{a.title}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Table wrapper */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/70 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                    <th className="px-6 py-3.5">Student</th>
                    <th className="px-6 py-3.5">Activity Book</th>
                    <th className="px-6 py-3.5 text-center">Score Recieved</th>
                    <th className="px-6 py-3.5 text-center">Grade Rate</th>
                    <th className="px-6 py-3.5">Date Time</th>
                    <th className="px-6 py-3.5 text-right">Data Source</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-slate-100">
                  {filteredSubmissions.length > 0 ? (
                    filteredSubmissions.map((sub, idx) => (
                      <tr 
                        key={sub.id} 
                        className="hover:bg-slate-50/50 transition-colors text-xs"
                        id={`submission-row-${sub.id}`}
                      >
                        {/* Student Column */}
                        <td className="px-6 py-4.5">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl w-9 h-9 rounded-full bg-slate-50 border border-slate-150 flex items-center justify-center select-none shadow-sm shrink-0">
                              {sub.studentAvatar}
                            </span>
                            <div>
                              <p className="font-black text-slate-800 leading-snug">{sub.studentName}</p>
                              <p className="text-[10px] text-slate-400 font-bold">ID: {sub.userId}</p>
                            </div>
                          </div>
                        </td>

                        {/* Activity Book Title */}
                        <td className="px-6 py-4.5">
                          <div>
                            <p className="font-extrabold text-blue-900 leading-snug">{sub.activityTitle}</p>
                            <p className="text-[9px] bg-slate-100 border border-slate-200 text-slate-500 rounded px-1.5 py-0.5 inline-block mt-1 uppercase font-bold font-mono">
                              {sub.activityId}
                            </p>
                          </div>
                        </td>

                        {/* Score */}
                        <td className="px-6 py-4.5 text-center">
                          <span className="font-mono font-black text-slate-805 bg-yellow-105 border border-yellow-300 px-2 py-1 rounded-lg">
                            {sub.score} / {sub.totalPoints} pts
                          </span>
                        </td>

                        {/* Percentage */}
                        <td className="px-6 py-4.5 text-center">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black tracking-tight ${
                            sub.percentage >= 90
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : sub.percentage >= 60
                                ? 'bg-blue-105 text-blue-808 border border-blue-200'
                                : 'bg-red-100 text-red-800 border border-red-200'
                          }`}>
                            <CheckCircle2 className={`w-3.5 h-3.5 ${
                              sub.percentage >= 90 ? 'text-emerald-500' : 'text-blue-500'
                            }`} />
                            {sub.percentage}%
                          </span>
                        </td>

                        {/* Date Time */}
                        <td className="px-6 py-4.5">
                          <div className="text-slate-500 font-medium">
                            {sub.submittedAtFormatted}
                          </div>
                        </td>

                        {/* Submissions source */}
                        <td className="px-6 py-4.5 text-right font-semibold">
                          {sub.isMock ? (
                            <span className="text-[10px] uppercase tracking-wide bg-slate-100 text-slate-400 rounded-md px-2 py-0.5 inline-block border border-slate-200 font-bold font-mono">
                              Offline Template
                            </span>
                          ) : (
                            <span className="text-[10px] uppercase tracking-wide bg-emerald-100 text-emerald-800 rounded-md px-2 py-0.5 inline-block border border-emerald-200 font-bold font-mono animate-pulse">
                              Cloud Sync
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-slate-400 font-bold">
                        No submissions matching the filter criteria were found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination / Table footer stats */}
            <div className="px-5 py-3.5 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 font-bold uppercase tracking-wider">
              <span>Showing {filteredSubmissions.length} of {masterSubmissionsList.length} submissions</span>
              <span>Sorted by Recency (Latest First)</span>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

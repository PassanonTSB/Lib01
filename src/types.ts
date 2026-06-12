export type Page = 'home' | 'activities' | 'leaderboard' | 'profile' | 'admin';

export type BookStatus = 'Active' | 'Closed';

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number; // index of correct option
  points: number;
}

export interface Activity {
  id: string;
  title: string;
  author: string;
  status: BookStatus;
  genre: string;
  pages: number;
  points: number;
  summary: string;
  coverBg: string; // Tailwind class like "from-amber-500 to-amber-700"
  coverPattern: 'stars' | 'waves' | 'grid' | 'circles';
  coverEmoji: string;
  quizQuestions: QuizQuestion[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string; // Lucide icon name
  unlocked: boolean;
  unlockedAt?: string;
}

export interface StudentProfile {
  userId?: string;
  name: string;
  avatar: string; // Emoji avatar or URL
  grade: string;
  school: string;
  class?: string;
  department?: string;
  totalScore: number;
  booksRead: number;
  achievements: Achievement[];
  lastCompletedQuizId?: string;
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  avatar: string;
  score: number;
  isCurrentUser?: boolean;
}

export interface ActivityHistory {
  id: string;
  bookId: string;
  bookTitle: string;
  dateCompleted: string;
  scoreEarned: number;
  percentage: number;
}

export interface Submission {
  submissionId: string;
  userId: string;
  activityId: string;
  score: number;
  answers: string[];
  submittedAt: any;
}


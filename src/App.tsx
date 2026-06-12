import { useState, useEffect } from 'react';
import { Page, Activity, StudentProfile, LeaderboardEntry, ActivityHistory } from './types';
import {
  INITIAL_ACTIVITIES,
  INITIAL_LEADERBOARD,
  INITIAL_PROFILE
} from './data';
import { Navbar } from './components/Navbar';
import { HomeView } from './components/HomeView';
import { ActivitiesView } from './components/ActivitiesView';
import { LeaderboardView } from './components/LeaderboardView';
import { ProfileView } from './components/ProfileView';
import { QuizView } from './components/QuizView';
import { LoginView } from './components/LoginView';
import { RegistrationView } from './components/RegistrationView';
import { AdminDashboardView } from './components/AdminDashboardView';

// Firebase imports
import { auth, db, signOut, handleFirestoreError, OperationType } from './firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp, writeBatch } from 'firebase/firestore';

export default function App() {
  // Navigation & Game State
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [activeQuiz, setActiveQuiz] = useState<Activity | null>(null);

  // Authentication states
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [showSetupForm, setShowSetupForm] = useState(false);

  // Core Data States (load from localStorage if available)
  const [activities, setActivities] = useState<Activity[]>(() => {
    const saved = localStorage.getItem('library_activities');
    return saved ? JSON.parse(saved) : INITIAL_ACTIVITIES;
  });

  const [profile, setProfile] = useState<StudentProfile>(() => {
    const saved = localStorage.getItem('library_profile');
    return saved ? JSON.parse(saved) : INITIAL_PROFILE;
  });

  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(() => {
    const saved = localStorage.getItem('library_leaderboard');
    return saved ? JSON.parse(saved) : INITIAL_LEADERBOARD;
  });

  const [history, setHistory] = useState<ActivityHistory[]>(() => {
    const saved = localStorage.getItem('library_history');
    const defaultHistory: ActivityHistory[] = [
      {
        id: 'hist-init',
        bookId: 'around-world-80',
        bookTitle: 'Around the World in 80 Days',
        dateCompleted: '2026-06-08',
        scoreEarned: 130,
        percentage: 80,
      }
    ];
    return saved ? JSON.parse(saved) : defaultHistory;
  });

  // Calculate current user's ID for Leaderboard & Profile syncing
  const userLeaderboardId = currentUser?.uid || 'user-default';

  // Session persistence & Firebase Auth detection
  useEffect(() => {
    // 1. Initial quick load of active session from localStorage if available (prevents flickering)
    const cachedUid = localStorage.getItem('library_active_user_uid');
    if (cachedUid) {
      const cachedProfile = localStorage.getItem(`profile_${cachedUid}`);
      if (cachedProfile) {
        setProfile(JSON.parse(cachedProfile));
      }
    }

    // 2. Attach real Firebase Auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        localStorage.setItem('library_active_user_uid', user.uid);

        try {
          const userRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(userRef);

          if (docSnap.exists()) {
            // Returning user skips form
            const data = docSnap.data();
            const updatedProfile: StudentProfile = {
              userId: user.uid,
              name: data.name,
              class: data.class,
              department: data.department,
              grade: data.class || '5th Grade',
              school: 'Maplewood Elementary School',
              avatar: localStorage.getItem(`avatar_${user.uid}`) || '🎒',
              totalScore: data.totalScore || 0,
              booksRead: data.booksRead || 0,
              achievements: profile.achievements
            };
            setProfile(updatedProfile);

            // Sync with leaderboard too
            setLeaderboard((prev) =>
              prev.map(item => (item.id === 'user-default' || item.id === user.uid) ? { ...item, id: user.uid, name: data.name, score: data.totalScore || 0 } : item)
            );

            localStorage.setItem(`profile_${user.uid}`, JSON.stringify(updatedProfile));
            setShowSetupForm(false);
          } else {
            // First time login! Render Form
            setShowSetupForm(true);
          }
        } catch (err) {
          console.warn("Could not retrieve remote Firestore profile, using localStorage cache: ", err);
          const cached = localStorage.getItem(`profile_${user.uid}`);
          if (cached) {
            setProfile(JSON.parse(cached));
            setShowSetupForm(false);
          } else {
            setShowSetupForm(true);
          }
        }
      } else {
        // No Firebase Auth user. Check if there's a Sandbox Mock user session
        const savedSandbox = localStorage.getItem('sandbox_user_session');
        if (savedSandbox) {
          const parsed = JSON.parse(savedSandbox);
          setCurrentUser(parsed);
          const cached = localStorage.getItem(`profile_${parsed.uid}`);
          if (cached) {
            setProfile(JSON.parse(cached));
          }
        } else {
          setCurrentUser(null);
        }
        setShowSetupForm(false);
      }
      setCheckingAuth(false);
    });

    return () => unsubscribe();
  }, []);

  // Keep localStorage synchronised with state changes
  useEffect(() => {
    localStorage.setItem('library_activities', JSON.stringify(activities));
  }, [activities]);

  useEffect(() => {
    localStorage.setItem('library_profile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem('library_leaderboard', JSON.stringify(leaderboard));
  }, [leaderboard]);

  useEffect(() => {
    localStorage.setItem('library_history', JSON.stringify(history));
  }, [history]);

  // Initiate Quiz Game
  const handleStartQuiz = (activity: Activity) => {
    setActiveQuiz(activity);
  };

  // Close active Quiz
  const handleCloseQuiz = () => {
    setActiveQuiz(null);
  };

  // Registration handler for first-time login
  const handleRegisterProfile = async (data: { name: string; className: string; department: string }) => {
    if (!currentUser) return;

    const uid = currentUser.uid;
    const userRef = doc(db, 'users', uid);

    // Prevent duplicate profiles check
    let alreadyExists = false;
    try {
      const docSnap = await getDoc(userRef);
      if (docSnap.exists()) {
        alreadyExists = true;
      }
    } catch (e) {
      // Ignore if offline
    }

    if (alreadyExists) {
      throw new Error("A profile already exists for this student account.");
    }

    const newProfileDoc = {
      userId: uid,
      name: data.name,
      class: data.className,
      department: data.department,
      totalScore: 0,
      lastCompletedQuizId: "",
      createdAt: serverTimestamp() // Safe Server timestamp validation
    };

    // Attempt remote save in Firestore
    try {
      await setDoc(userRef, newProfileDoc);
    } catch (err: any) {
      console.warn("Saving to Firestore remote registry failed (will persist locally): ", err);
      // Failsafe sandbox fallback logic matching the rules
      if (err.message?.includes('permission')) {
        handleFirestoreError(err, OperationType.CREATE, `users/${uid}`);
      }
    }

    // Set local state
    const createdProfile: StudentProfile = {
      userId: uid,
      name: data.name,
      class: data.className,
      department: data.department,
      grade: data.className,
      school: 'Maplewood Elementary School',
      avatar: '🎒',
      totalScore: 0,
      booksRead: 0,
      lastCompletedQuizId: "",
      achievements: INITIAL_PROFILE.achievements
    };

    setProfile(createdProfile);
    localStorage.setItem(`profile_${uid}`, JSON.stringify(createdProfile));

    // Sync leaderboard
    setLeaderboard((prev) => {
      const exists = prev.some(item => item.id === uid || item.id === 'user-default');
      if (exists) {
        return prev.map(item => (item.id === 'user-default' || item.id === uid) ? { ...item, id: uid, name: data.name, score: 0 } : item);
      } else {
        return [...prev, { id: uid, name: data.name, avatar: '🎒', score: 0 }];
      }
    });

    setShowSetupForm(false);
  };

  // Handler for completing a trivia challenge
  const handleQuizComplete = async (scoreEarned: number, percentage: number, answers: string[]) => {
    if (!activeQuiz) return;

    // 1. Generate History Row
    const newEntry: ActivityHistory = {
      id: `hist-${Date.now()}`,
      bookId: activeQuiz.id,
      bookTitle: activeQuiz.title,
      dateCompleted: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }),
      scoreEarned,
      percentage,
    };

    const updatedHistory = [newEntry, ...history];
    setHistory(updatedHistory);

    // 2. Update Student Profile Stats
    const newScore = profile.totalScore + scoreEarned;
    const uniqueBookIds = new Set(updatedHistory.map((h) => h.bookId));

    // 3. Evaluate Badges Achievements criteria
    const updatedAchievements = profile.achievements.map((ach) => {
      let unlocked = ach.unlocked;

      if (!unlocked) {
        if (ach.id === 'first-chapters') {
          unlocked = true;
        }
        if (ach.id === 'perfect-score' && percentage === 100) {
          unlocked = true;
        }
        if (ach.id === 'triple-threat' && uniqueBookIds.size >= 3) {
          unlocked = true;
        }
      }

      return {
        ...ach,
        unlocked,
        unlockedAt: unlocked && !ach.unlocked ? new Date().toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }) : ach.unlockedAt
      };
    });

    // 4. Update Leaderboard
    const updatedLeaderboard = leaderboard.map((entry) => {
      if (entry.id === 'user-default' || entry.id === userLeaderboardId) {
        return { ...entry, id: userLeaderboardId, score: newScore, name: profile.name, avatar: profile.avatar };
      }
      return entry;
    });

    // Determine rank
    const sortedLeaderboard = [...updatedLeaderboard].sort((a, b) => b.score - a.score);
    const userRankIndex = sortedLeaderboard.findIndex((entry) => entry.id === userLeaderboardId);

    const finalAchievements = updatedAchievements.map((ach) => {
      if (ach.id === 'top-ranker' && userRankIndex <= 2) {
        return {
          ...ach,
          unlocked: true,
          unlockedAt: ach.unlockedAt || new Date().toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' })
        };
      }
      return ach;
    });

    const refreshedProfile = {
      ...profile,
      totalScore: newScore,
      booksRead: uniqueBookIds.size,
      lastCompletedQuizId: activeQuiz.id,
      achievements: finalAchievements,
    };

    // Update state
    setLeaderboard(updatedLeaderboard);
    setProfile(refreshedProfile);

    if (currentUser) {
      localStorage.setItem(`profile_${currentUser.uid}`, JSON.stringify(refreshedProfile));
      // Save updated score and submission atomically to Firestore via batch to enforce anti-cheat rules
      try {
        const batch = writeBatch(db);
        const subDocRef = doc(db, 'submissions', `${currentUser.uid}_${activeQuiz.id}`);
        batch.set(subDocRef, {
          submissionId: `${currentUser.uid}_${activeQuiz.id}`,
          userId: currentUser.uid,
          activityId: activeQuiz.id,
          score: scoreEarned,
          answers,
          submittedAt: serverTimestamp()
        });

        const userRef = doc(db, 'users', currentUser.uid);
        batch.update(userRef, {
          totalScore: newScore,
          lastCompletedQuizId: activeQuiz.id
        });

        await batch.commit();
      } catch (err: any) {
        console.warn("Could not save score update atomically to Firestore (saved locally): ", err);
        if (err.message?.includes('permission')) {
          handleFirestoreError(err, OperationType.WRITE, `submissions/${currentUser.uid}_${activeQuiz.id}`);
        }
        throw err;
      }
    }
  };

  // Profile Avatar modify callback
  const handleUpdateAvatar = (newAvatar: string) => {
    setProfile((prev) => {
      const updated = { ...prev, avatar: newAvatar };
      if (currentUser) {
        localStorage.setItem(`avatar_${currentUser.uid}`, newAvatar);
        localStorage.setItem(`profile_${currentUser.uid}`, JSON.stringify(updated));
      }
      setLeaderboard((lPrev) =>
        lPrev.map((item) => (item.id === 'user-default' || item.id === userLeaderboardId) ? { ...item, id: userLeaderboardId, avatar: newAvatar } : item)
      );
      return updated;
    });
  };

  // Profile Name modify callback
  const handleUpdateName = async (newName: string) => {
    setProfile((prev) => {
      const updated = { ...prev, name: newName };
      if (currentUser) {
        localStorage.setItem(`profile_${currentUser.uid}`, JSON.stringify(updated));
      }
      setLeaderboard((lPrev) =>
        lPrev.map((item) => (item.id === 'user-default' || item.id === userLeaderboardId) ? { ...item, id: userLeaderboardId, name: newName } : item)
      );
      return updated;
    });

    if (currentUser) {
      try {
        const userRef = doc(db, 'users', currentUser.uid);
        await updateDoc(userRef, { name: newName });
      } catch (err: any) {
        console.warn("Could not update name in remote Firestore: ", err);
        if (err.message?.includes('permission')) {
          handleFirestoreError(err, OperationType.UPDATE, `users/${currentUser.uid}`);
        }
      }
    }
  };

  // Log Out secure action
  const handleLogOutAction = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      // Ignore
    }
    localStorage.removeItem('library_active_user_uid');
    localStorage.removeItem('sandbox_user_session');
    
    // Clear state
    setCurrentUser(null);
    setProfile(INITIAL_PROFILE);
    setLeaderboard(INITIAL_LEADERBOARD);
    setCurrentPage('home');
  };

  // Sandbox fallback simulation setup
  const handleMockLogin = (mockEmail: string, mockName: string) => {
    const mockUid = `mock-${mockEmail.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
    const simulatedUser = {
      uid: mockUid,
      email: mockEmail,
      displayName: mockName,
      isAnonymous: false
    };

    localStorage.setItem('sandbox_user_session', JSON.stringify(simulatedUser));
    localStorage.setItem('library_active_user_uid', mockUid);
    setCurrentUser(simulatedUser);

    // Check if profile is already configured locally
    const cachedProfile = localStorage.getItem(`profile_${mockUid}`);
    if (cachedProfile) {
      setProfile(JSON.parse(cachedProfile));
      setShowSetupForm(false);
    } else {
      setShowSetupForm(true);
    }
    setCheckingAuth(false);
  };

  // Display initial loading state
  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-blue-50/50 flex flex-col items-center justify-center p-6">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="mt-4 text-xs font-bold text-blue-900 uppercase tracking-widest leading-none">
          Loading Maplewood classroom...
        </p>
      </div>
    );
  }

  // If not logged in, show primary Login Screen
  if (!currentUser) {
    return <LoginView onMockLogin={handleMockLogin} />;
  }

  // If logged in first time, show Setup profile form
  if (showSetupForm) {
    return (
      <RegistrationView
        initialName={currentUser.displayName || ''}
        onRegister={handleRegisterProfile}
        onLogOut={handleLogOutAction}
      />
    );
  }

  return (
    <div className="min-h-screen bg-blue-50/50 flex flex-col text-slate-800 font-sans" id="app-root-container">
      {/* Top sticky Navigation Header */}
      <Navbar
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        totalScore={profile.totalScore}
        onLogOut={handleLogOutAction}
      />

      {/* Main Page Layout Core */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
        {activeQuiz ? (
          /* Gaming View Portal */
          <QuizView
            activity={activeQuiz}
            onQuizComplete={handleQuizComplete}
            onClose={handleCloseQuiz}
          />
        ) : (
          /* Normal Page Routing Section */
          <div className="w-full">
            {currentPage === 'home' && (
              <HomeView
                profile={profile}
                activities={activities}
                onStartQuiz={handleStartQuiz}
                setCurrentPage={setCurrentPage}
                history={history}
              />
            )}
            {currentPage === 'activities' && (
              <ActivitiesView
                activities={activities}
                onStartQuiz={handleStartQuiz}
                history={history}
              />
            )}
            {currentPage === 'leaderboard' && (
              <LeaderboardView
                leaderboard={leaderboard}
                currentUserName={profile.name}
                currentUserId={profile.userId || currentUser?.uid || 'user-default'}
                currentUserAvatar={profile.avatar}
              />
            )}
            {currentPage === 'profile' && (
              <ProfileView
                profile={profile}
                history={history}
                onUpdateAvatar={handleUpdateAvatar}
                onUpdateName={handleUpdateName}
              />
            )}
            {currentPage === 'admin' && (
              <AdminDashboardView
                activities={activities}
              />
            )}
          </div>
        )}
      </main>

      {/* Sincere humbling footer matching the School Theme */}
      <footer className="bg-white border-t border-slate-100 py-6" id="app-footer">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-xs text-slate-400 font-medium">
            © 2026 Maplewood Elementary Library Reading Challenge • Powered by Adventure Gaming State
          </p>
        </div>
      </footer>
    </div>
  );
}

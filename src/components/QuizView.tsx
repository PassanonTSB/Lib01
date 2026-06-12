import React, { useState, useEffect } from 'react';
import { Activity, QuizQuestion } from '../types';
import { motion } from 'motion/react';
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Trophy,
  Award,
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

interface QuizViewProps {
  activity: Activity;
  onQuizComplete: (scoreEarned: number, percentage: number, answers: string[]) => Promise<void> | void;
  onClose: () => void;
}

interface PreparedQuestion {
  question: string;
  options: string[];
  correctAnswerIdx: number;
  correctAnswerText: string;
  points: number;
}

interface QuestionResult {
  question: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  pointsEarned: number;
}

// Fisher-Yates shuffle helper
function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export const QuizView: React.FC<QuizViewProps> = ({ activity, onQuizComplete, onClose }) => {
  // Setup loading, pre-existing submission check, and states
  const [loading, setLoading] = useState(true);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [preparedQuestions, setPreparedQuestions] = useState<PreparedQuestion[]>([]);
  
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [numCorrect, setNumCorrect] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [resultsTracker, setResultsTracker] = useState<QuestionResult[]>([]);

  // Firebase submission save states
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [hasClickedSubmit, setHasClickedSubmit] = useState(false);

  useEffect(() => {
    async function checkPermissionAndPrepare() {
      setLoading(true);
      const userId = auth.currentUser?.uid || 'user-default';

      // 1. Enforce: "1 submission per user per activity. Prevent retake"
      if (userId && userId !== 'user-default') {
        try {
          const subDocRef = doc(db, 'submissions', `${userId}_${activity.id}`);
          const subDocSnap = await getDoc(subDocRef);
          if (subDocSnap.exists()) {
            setAlreadySubmitted(true);
            setLoading(false);
            return;
          }
        } catch (err: any) {
          console.warn("Could not verify duplicate submission on remote Firestore: ", err);
          // Check localStorage as offline fallback
          const localCheck = localStorage.getItem(`submitted_${userId}_${activity.id}`);
          if (localCheck) {
            setAlreadySubmitted(true);
            setLoading(false);
            return;
          }
        }
      } else {
        // Fallback for sandboxed offline testing users
        const localCheck = localStorage.getItem(`submitted_${userId}_${activity.id}`);
        if (localCheck) {
          setAlreadySubmitted(true);
          setLoading(false);
          return;
        }
      }

      // 2. Prepare, pad with distractors, and shuffle questions
      const FALLBACK_OPTIONS = [
        "None of the characters fit this description",
        "A mystical flying teapot",
        "The superintendent of Maplewood School",
        "A mystery yet to be solved",
        "An enchanted grandfather clock",
        "The mysterious library wizard",
        "A talking library owl",
        "The local town sheriff"
      ];

      const originalQuestions: QuizQuestion[] = activity.quizQuestions || [];
      // Feature: Shuffle questions list
      const shuffledQuests = shuffleArray<QuizQuestion>(originalQuestions);

      const prepared: PreparedQuestion[] = shuffledQuests.map((q: QuizQuestion) => {
        const correctText = q.options[q.correctAnswer];
        let currentOptions = [...q.options];
        const shuffledFallback = shuffleArray(FALLBACK_OPTIONS);

        // Feature: Multiple choice (exactly 5 options)
        while (currentOptions.length < 5) {
          const nextOpt = shuffledFallback.pop();
          if (nextOpt && !currentOptions.includes(nextOpt)) {
            currentOptions.push(nextOpt);
          }
        }

        // Feature: Shuffle choices (options list)
        const shuffledOptions = shuffleArray(currentOptions);
        const correctIdx = shuffledOptions.indexOf(correctText);

        return {
          question: q.question,
          options: shuffledOptions,
          correctAnswerIdx: correctIdx,
          correctAnswerText: correctText,
          points: q.points
        };
      });

      setPreparedQuestions(prepared);
      setLoading(false);
    }

    checkPermissionAndPrepare();
  }, [activity]);

  const handleOptionSelect = (optionIdx: number) => {
    if (answered) return;
    setSelectedOption(optionIdx);
  };

  const handleAnswerSubmit = () => {
    if (selectedOption === null || answered) return;
    setAnswered(true);

    const questionObj = preparedQuestions[currentIdx];
    const isCorrect = selectedOption === questionObj.correctAnswerIdx;
    
    if (isCorrect) {
      setNumCorrect((prev) => prev + 1);
    }

    const answerText = questionObj.options[selectedOption];
    const pointsEarned = isCorrect ? questionObj.points : 0;

    setResultsTracker((prev) => [
      ...prev,
      {
        question: questionObj.question,
        userAnswer: answerText,
        correctAnswer: questionObj.correctAnswerText,
        isCorrect,
        pointsEarned
      }
    ]);
  };

  const handleNext = async () => {
    if (currentIdx + 1 < preparedQuestions.length) {
      setCurrentIdx((prev) => prev + 1);
      setSelectedOption(null);
      setAnswered(false);
    } else {
      if (hasClickedSubmit) return;
      setHasClickedSubmit(true);
      // Quiz complete! Submit immediately to Firestore and update profile
      await saveSubmissionAndComplete();
    }
  };

  const saveSubmissionAndComplete = async () => {
    setIsSaving(true);
    setSaveError(null);

    const userId = auth.currentUser?.uid || 'user-default';

    // Calculate immediate final score
    const totalScoreEarned = resultsTracker.reduce((acc, curr) => acc + curr.pointsEarned, 0);
    const finalPercentage = Math.round((numCorrect / preparedQuestions.length) * 100);

    const userAnswersList = resultsTracker.map((r) => r.userAnswer);

    try {
      // route atomic update via secure write batch
      await onQuizComplete(totalScoreEarned, finalPercentage, userAnswersList);
      localStorage.setItem(`submitted_${userId}_${activity.id}`, 'true');
    } catch (err: any) {
      console.warn("Could not save submission to Firestore remote server: ", err);
      setSaveError(err.message || "Failed to record your answers in online leaderboard. Saved locally instead.");
      localStorage.setItem(`submitted_${userId}_${activity.id}`, 'true');
    }

    setQuizFinished(true);
    setIsSaving(false);
  };

  // 1. Simple loading visualizer
  if (loading) {
    return (
      <div className="max-w-xl mx-auto bg-white border-4 border-blue-600 rounded-3xl p-12 text-center shadow-vibrant">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm font-black text-blue-900 uppercase tracking-widest leading-relaxed">
          Preparing Questions...
        </p>
      </div>
    );
  }

  // 2. Already completed blocking gate (1 submission per user per activity, Prevent retake)
  if (alreadySubmitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-xl mx-auto bg-white border-4 border-rose-500 rounded-3xl p-6 sm:p-8 text-center shadow-vibrant space-y-6"
        id="already-submitted-gate"
      >
        <div className="relative inline-flex items-center justify-center p-5 bg-rose-50 rounded-full border-4 border-rose-300">
          <AlertCircle className="w-12 h-12 text-rose-500" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-xl font-black text-rose-950">
            Reading Challenge Completed!
          </h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed font-bold">
            You have already completed the reading challenge for <span className="text-blue-900">"{activity.title}"</span>. Only one trivia submission is permitted per user to keep the school league fair!
          </p>
        </div>

        <button
          onClick={onClose}
          className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 border-2 border-slate-350 rounded-2xl text-xs font-black transition-all cursor-pointer"
          id="exit-blocked-quiz-btn"
        >
          Return to Library
        </button>
      </motion.div>
    );
  }

  const currentQuestion = preparedQuestions[currentIdx];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-xl mx-auto bg-white border-4 border-blue-650 rounded-3xl p-6 sm:p-8 shadow-vibrant"
      id="quiz-container-panel"
    >
      {!quizFinished ? (
        currentQuestion ? (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b-2 border-slate-100 gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-3xl">{activity.coverEmoji}</span>
                <div className="min-w-0">
                  <span className="text-[10px] font-black text-blue-700 uppercase tracking-widest block leading-none mb-1">
                    Book Trivia Quest
                  </span>
                  <h2 className="font-black text-blue-950 text-sm sm:text-base leading-snug truncate">
                    {activity.title}
                  </h2>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-xs text-slate-500 font-bold hover:text-blue-900 bg-slate-50 hover:bg-slate-100 border-2 border-slate-200 px-3 py-1.5 rounded-xl transition-all cursor-pointer"
              >
                Exit Game
              </button>
            </div>

            {/* Progress bar */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-black text-slate-500 font-mono">
                <span>QUESTION {currentIdx + 1} OF {preparedQuestions.length}</span>
                <span className="text-blue-600 font-black">{Math.round(((currentIdx) / preparedQuestions.length) * 100)}% COMPLETE</span>
              </div>
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200 p-0.5">
                <div
                  className="h-full bg-yellow-400 rounded-full transition-all duration-300"
                  style={{ width: `${((currentIdx) / preparedQuestions.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Question Card */}
            <div className="p-4 sm:p-5 bg-blue-50 border-2 border-blue-200 rounded-2xl flex gap-3 items-start">
              <HelpCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <h3 className="text-sm sm:text-base font-black text-blue-950 leading-snug">
                {currentQuestion.question}
              </h3>
            </div>

            {/* Multiple Choice (exactly 5 options) */}
            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => {
                const isSelected = selectedOption === index;
                const isCorrectIdx = index === currentQuestion.correctAnswerIdx;

                let choiceStyle = 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800';
                if (isSelected && !answered) {
                  choiceStyle = 'bg-yellow-50 border-4 border-yellow-405 text-blue-950 font-black shadow-vibrant';
                } else if (answered) {
                  if (isCorrectIdx) {
                    choiceStyle = 'bg-green-50 border-4 border-green-500 text-green-950 font-black shadow-sm';
                  } else if (isSelected) {
                    choiceStyle = 'bg-rose-50 border-4 border-rose-400 text-rose-950 font-bold';
                  } else {
                    choiceStyle = 'bg-slate-40/50 border-2 border-slate-150 text-slate-400 opacity-60';
                  }
                }

                return (
                  <button
                    key={index}
                    onClick={() => handleOptionSelect(index)}
                    disabled={answered}
                    className={`w-full text-left px-5 py-3.5 border-2 rounded-2xl text-xs sm:text-xs font-semibold transition-all flex justify-between items-center cursor-pointer ${choiceStyle}`}
                    id={`quiz-option-${index}`}
                  >
                    <span className="pr-4 leading-normal">{option}</span>
                    <div className="flex-shrink-0">
                      {answered && isCorrectIdx && <CheckCircle2 className="w-5 h-5 text-green-600" />}
                      {answered && isSelected && !isCorrectIdx && <XCircle className="w-5 h-5 text-rose-500" />}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Confirm action strip */}
            <div className="pt-2 flex justify-end gap-3 items-center">
              {isSaving && (
                <span className="text-xs text-blue-800 font-bold animate-pulse">
                  Uploading score sheet...
                </span>
              )}
              {!answered ? (
                <button
                  onClick={handleAnswerSubmit}
                  disabled={selectedOption === null}
                  className={`px-6 py-3 rounded-2xl font-black text-xs shadow-md transition-all border-none ${
                    selectedOption !== null
                      ? 'bg-blue-600 text-white cursor-pointer hover:bg-blue-700 shadow-vibrant transform hover:-translate-y-0.5'
                      : 'bg-slate-105 text-slate-400 cursor-not-allowed border border-slate-200/50 shadow-none'
                  }`}
                  id="submit-answer-btn"
                >
                  Submit Answer
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  disabled={isSaving || (currentIdx + 1 === preparedQuestions.length && hasClickedSubmit)}
                  className="flex items-center gap-1.5 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-2xl text-xs font-black shadow-vibrant transition-all hover:-translate-y-0.5 cursor-pointer border-none"
                  id="next-question-btn"
                >
                  {currentIdx + 1 === preparedQuestions.length ? 'Submit Quest' : 'Next Question'}
                  <ArrowRight className="w-4 h-4 stroke-[3px]" />
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center p-6 text-slate-500">No questions prepared.</div>
        )
      ) : (
        /* Final scoring review screen (Calculate score immediately, list Correct / Incorrect) */
        <motion.div
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          className="space-y-6 pt-4"
          id="quiz-finished-panel"
        >
          <div className="text-center space-y-4">
            <div className="relative inline-flex items-center justify-center p-6 bg-yellow-50 rounded-full border-4 border-yellow-300 shadow-vibrant">
              <Trophy className="w-16 h-16 text-yellow-500 fill-yellow-400 animate-pulse" />
              <Sparkles className="w-6 h-6 text-blue-600 absolute -top-1 -right-1 animate-bounce" />
            </div>

            <div className="space-y-1.5">
              <span className="text-[10px] uppercase font-black text-blue-600 tracking-wider bg-blue-100 px-2.5 py-1 rounded-md">
                Quest Complete! ⭐
              </span>
              <h2 className="text-xl font-black text-blue-900 mt-2">
                Challenge Submitted!
              </h2>
              <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                Your comprehension records for <span className="font-bold text-slate-700">"{activity.title}"</span> are successfully logged.
              </p>
            </div>
          </div>

          {/* Core Score breakdown metrics */}
          <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto pb-2">
            <div className="p-4 bg-blue-50 border-4 border-blue-100 rounded-3xl text-center">
              <span className="text-[9px] uppercase font-black text-slate-500 tracking-wider block">SCORE EARNED</span>
              <span className="text-xl font-black font-mono text-blue-900">
                +{resultsTracker.reduce((acc, curr) => acc + curr.pointsEarned, 0)} pts
              </span>
            </div>

            <div className="p-4 bg-green-50 border-4 border-green-100 rounded-3xl text-center">
              <span className="text-[9px] uppercase font-black text-slate-500 tracking-wider block">ACCURACY</span>
              <span className="text-xl font-black font-mono text-green-900">
                {Math.round((numCorrect / preparedQuestions.length) * 100)}%
              </span>
            </div>
          </div>

          {/* Submission status or firestore sync error */}
          {saveError && (
            <div className="p-3 bg-amber-50 border-2 border-amber-300 text-[11px] text-amber-800 rounded-xl font-medium max-w-sm mx-auto">
              ⚠️ {saveError}
            </div>
          )}

          {/* FEATURE: Result review list displaying Correct and Incorrect answers */}
          <div className="space-y-3 pt-2 max-w-md mx-auto">
            <h4 className="text-xs font-black text-gray-500 uppercase tracking-widest pl-1">
              Question Summary Review:
            </h4>
            
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {resultsTracker.map((res, i) => (
                <div
                  key={i}
                  className={`p-3.5 border-2 rounded-2xl text-left text-xs ${
                    res.isCorrect 
                      ? 'bg-green-50/50 border-green-200' 
                      : 'bg-rose-50/50 border-rose-200'
                  }`}
                >
                  <div className="flex gap-2 items-start justify-between">
                    <p className="font-bold text-slate-800 leading-snug">
                      Q{i + 1}: {res.question}
                    </p>
                    {res.isCorrect ? (
                      <span className="flex items-center gap-1 text-[10px] font-black text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-600" /> Correct
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[10px] font-black text-rose-700 bg-rose-105 px-2 py-0.5 rounded-full">
                        <XCircle className="w-3.5 h-3.5 text-rose-500" /> Incorrect
                      </span>
                    )}
                  </div>

                  <div className="mt-2.5 space-y-1 text-[11px] text-slate-600">
                    <p>
                      Your Answer: <span className={`font-semibold ${res.isCorrect ? 'text-green-800' : 'text-rose-800'}`}>{res.userAnswer}</span>
                    </p>
                    {!res.isCorrect && (
                      <p>
                        Correct Answer: <span className="font-semibold text-green-800">{res.correctAnswer}</span>
                      </p>
                    )}
                    <p className="text-[10px] text-slate-400 font-bold font-mono">
                      POINTS: {res.pointsEarned} pts
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Controls Footer - NO REPLAY BUTTON to prevent duplicate quiz retake */}
          <div className="pt-4 max-w-sm mx-auto">
            <button
              onClick={onClose}
              className="w-full px-5 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-black shadow-vibrant hover:-translate-y-0.5 border-none cursor-pointer transition-all text-center"
              id="back-to-quests-btn"
            >
              Back to Reading Quests
            </button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

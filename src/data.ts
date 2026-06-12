import { Activity, StudentProfile, LeaderboardEntry } from './types';

export const INITIAL_ACTIVITIES: Activity[] = [
  {
    id: 'alice-wonderland',
    title: 'Alice in Wonderland',
    author: 'Lewis Carroll',
    status: 'Active',
    genre: 'Fantasy / Adventure',
    pages: 192,
    points: 150,
    summary: 'Follow Alice down the rabbit hole into a whimsical, nonsensical world filled with unforgettable characters like the Cheshire Cat and the Mad Hatter.',
    coverBg: 'from-purple-600 to-indigo-800',
    coverPattern: 'stars',
    coverEmoji: '🐇',
    quizQuestions: [
      {
        question: 'Which animal does Alice follow down the rabbit hole at the beginning of the book?',
        options: ['The White Rabbit', 'The Cheshire Cat', 'The March Hare', 'The Dormouse'],
        correctAnswer: 0,
        points: 50
      },
      {
        question: 'What does the label on the bottle Alice drinks to shrink read?',
        options: ['Eat Me', 'Drink Me', 'Sip Slowly', 'Magic Poison'],
        correctAnswer: 1,
        points: 50
      },
      {
        question: 'Who is hosting the famous, never-ending tea party Alice attends?',
        options: ['The Queen of Hearts', 'The Caterpillar', 'The Mad Hatter', 'Humpty Dumpty'],
        correctAnswer: 2,
        points: 50
      }
    ]
  },
  {
    id: 'treasure-island',
    title: 'Treasure Island',
    author: 'Robert L. Stevenson',
    status: 'Active',
    genre: 'Adventure / Sandbox',
    pages: 280,
    points: 200,
    summary: 'An action-packed tale of pirates, buried gold, and high seas. Join Jim Hawkins as he boards the Hispaniola to search for Captain Flint\'s treasure.',
    coverBg: 'from-amber-600 to-amber-900',
    coverPattern: 'waves',
    coverEmoji: '⚓',
    quizQuestions: [
      {
        question: 'What is the name of the central peg-legged pirate who builds a close friendship with Jim Hawkins?',
        options: ['Billy Bones', 'Black Dog', 'Long John Silver', 'Captain Smollett'],
        correctAnswer: 2,
        points: 60
      },
      {
        question: 'What is the name of Captain Flint\'s parrot?',
        options: ['Cap\'n Crunch', 'Salty Dog', 'Pieces of Eight', 'Captain Flint'],
        correctAnswer: 3,
        points: 70
      },
      {
        question: 'What do the mutinous pirates give to Billy Bones and later to Silver as a warning/sentence?',
        options: ['A black spot', 'A golden coin', 'A wooden peg', 'A skull and crossbones'],
        correctAnswer: 0,
        points: 70
      }
    ]
  },
  {
    id: 'secret-garden',
    title: 'The Secret Garden',
    author: 'Frances H. Burnett',
    status: 'Active',
    genre: 'Classic Fiction',
    pages: 312,
    points: 180,
    summary: 'A heartwarming story of Mary Lennox, a spoiled young girl sent to live in Yorkshire, who discovers a hidden, neglected garden and transforms it and herself.',
    coverBg: 'from-emerald-600 to-teal-800',
    coverPattern: 'grid',
    coverEmoji: '🔑',
    quizQuestions: [
      {
        question: 'Who helps Mary Lennox find the key to the locked secret garden?',
        options: ['Colin Craven', 'A friendly Robin Redbreast', 'Dickon Sowerby', 'Ben Weatherstaff'],
        correctAnswer: 1,
        points: 60
      },
      {
        question: 'Mary\'s cousin Colin Craven is bedridden, but what helps heal him?',
        options: ['Fresh medicine', 'Discovering the garden and playing outdoors', 'Moving back to London', 'Reading science books'],
        correctAnswer: 1,
        points: 60
      },
      {
        question: 'What is the name of the vast manor estate where Mary comes to live?',
        options: ['Misselthwaite Manor', 'Wuthering Heights', 'Pemberley Estate', 'Thornfield Hall'],
        correctAnswer: 0,
        points: 60
      }
    ]
  },
  {
    id: 'peter-pan',
    title: 'Peter Pan',
    author: 'J. M. Barrie',
    status: 'Active',
    genre: 'Fantasy / Children\'s',
    pages: 160,
    points: 150,
    summary: 'Fly away to Neverland with Peter Pan, the boy who wouldn\'t grow up, Wendy, John, Michael, and the Lost Boys as they clash with Captain Hook.',
    coverBg: 'from-cyan-500 to-blue-700',
    coverPattern: 'stars',
    coverEmoji: '✨',
    quizQuestions: [
      {
        question: 'What is the name of the sassy, glowing fairy who travels with Peter Pan?',
        options: ['Tinker Bell', 'Silvermist', 'Glimmer', 'Bluebell'],
        correctAnswer: 0,
        points: 50
      },
      {
        question: 'What sound warns Captain Hook that the crocodile is approaching?',
        options: ['A loud roar', 'A ticking clock', 'A ringing bell', 'A splashing splash'],
        correctAnswer: 1,
        points: 50
      },
      {
        question: 'How do Wendy, John, and Michael fly to Neverland?',
        options: ['By boarding a magic airship', 'Using a magical rope', 'Wearing wings made of leaves', 'Thinking happy thoughts and using pixie dust'],
        correctAnswer: 3,
        points: 50
      }
    ]
  },
  {
    id: 'around-world-80',
    title: 'Around the World in 80 Days',
    author: 'Jules Verne',
    status: 'Closed',
    genre: 'Adventure / Historical',
    pages: 250,
    points: 220,
    summary: 'Phileas Fogg bets half his fortune that he can circumnavigate the globe in just eighty days, embark on an incredible journey utilizing steamers, trains, and elephants.',
    coverBg: 'from-orange-500 to-rose-700',
    coverPattern: 'circles',
    coverEmoji: '🎈',
    quizQuestions: [
      {
        question: 'What is the name of Phileas Fogg\'s loyal, agile French butler who accompanies him?',
        options: ['Jean Passepartout', 'Pierre Lefleur', 'Jacques Cousteau', 'Louis Dupont'],
        correctAnswer: 0,
        points: 70
      },
      {
        question: 'What detective pursues Phileas Fogg, believing he is a clever bank robber on the run?',
        options: ['Detective Fix', 'Inspector Lestrade', 'Sherlock Holmes', 'Monsieur Ganimard'],
        correctAnswer: 0,
        points: 75
      },
      {
        question: 'Why does Phileas Fogg actually win his bet in London with minutes to spare?',
        options: ['He chartered a faster private jet', 'He traveled eastward, gaining one full day due to time zones', 'He calculated the days wrong in his favor', 'The Reform Club clocks were running slow'],
        correctAnswer: 1,
        points: 75
      }
    ]
  }
];

export const INITIAL_LEADERBOARD: LeaderboardEntry[] = [
  { id: '1', name: 'Sophia Gardner', avatar: '🦁', score: 620 },
  { id: '2', name: 'Liam Sterling', avatar: '🦊', score: 580 },
  { id: '3', name: 'Olivia Bennett', avatar: '🐼', score: 510 },
  { id: 'user-default', name: 'Alex Cooper', avatar: '🎒', score: 280, isCurrentUser: true },
  { id: '4', name: 'Ethan Hunt', avatar: '🦅', score: 250 },
  { id: '5', name: 'Emma Watson', avatar: '🦄', score: 180 }
];

export const INITIAL_ACHIEVEMENT_TEMPLATES = [
  {
    id: 'first-chapters',
    title: 'First Page Turned',
    description: 'Complete your first book reading trivia challenge.',
    icon: 'BookOpen',
    unlocked: false
  },
  {
    id: 'perfect-score',
    title: 'Perfect Bookworm',
    description: 'Score 100% on any book reading challenge.',
    icon: 'Award',
    unlocked: false
  },
  {
    id: 'triple-threat',
    title: 'Knowledge Devourer',
    description: 'Successfully complete 3 reading challenges.',
    icon: 'Library',
    unlocked: false
  },
  {
    id: 'top-ranker',
    title: 'Top Tier Reader',
    description: 'Step into the Top 3 positions of the school leaderboard.',
    icon: 'Trophy',
    unlocked: false
  }
];

export const INITIAL_PROFILE: StudentProfile = {
  name: 'Alex Cooper',
  avatar: '🎒',
  grade: '5th Grade',
  school: 'Maplewood Elementary School',
  totalScore: 280,
  booksRead: 1,
  lastCompletedQuizId: "",
  achievements: [
    {
      id: 'first-chapters',
      title: 'First Page Turned',
      description: 'Complete your first book reading trivia challenge.',
      icon: 'BookOpen',
      unlocked: true,
      unlockedAt: '2026-06-08'
    },
    {
      id: 'perfect-score',
      title: 'Perfect Bookworm',
      description: 'Score 100% on any book reading challenge.',
      icon: 'Award',
      unlocked: false
    },
    {
      id: 'triple-threat',
      title: 'Knowledge Devourer',
      description: 'Successfully complete 3 reading challenges.',
      icon: 'Library',
      unlocked: false
    },
    {
      id: 'top-ranker',
      title: 'Top Tier Reader',
      description: 'Step into the Top 3 positions of the school leaderboard.',
      icon: 'Trophy',
      unlocked: false
    }
  ]
};

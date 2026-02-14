
export interface UserProfile {
  name: string;
  dailyHours: number;
  difficulties: string[];
  learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'reading';
  academicHistory: string;
  hasOnboarded: boolean;
  streak: number;
  lastStudyDate?: string;
}

export type DifficultyLevel = 'Iniciante' | 'Intermediário' | 'Avançado';

export interface Message {
  role: 'user' | 'bot';
  text: string;
  timestamp: number;
  sources?: any[];
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  lastActive: number;
}

export interface QuizHistory {
  id: string;
  topic: string;
  score: number;
  total: number;
  date: number;
  questions: QuizItem[];
}

export interface StudyTask {
  id: string;
  subject: string;
  topic: string;
  duration: string;
  objective: string;
  type: 'review' | 'exercises' | 'theory' | 'simulated';
  completed: boolean;
  prerequisites?: string[];
}

export interface DaySchedule {
  day: string;
  tasks: StudyTask[];
}

export interface WeeklyPlan {
  weekId: number;
  schedule: DaySchedule[];
}

export interface QuizItem {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty?: DifficultyLevel;
}

export interface ContentResource {
  title: string;
  subject: string;
  content: string;
  prerequisites: string[];
  examples: string[];
  externalLinks: { title: string; url: string }[];
}

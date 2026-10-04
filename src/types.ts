export type Difficulty = 'Easy' | 'Medium' | 'Hard';
export type Topic = 'TypeScript' | 'DOM Manipulation' | 'Events';

export interface Question {
  id: number;
  topic: Topic;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  difficulty: Difficulty;
  codeSnippet?: string;
  isCustom?: boolean;
}

export interface QuizState {
  currentQuestionIndex: number;
  score: number;
  userAnswers: (number | null)[];
  isFinished: boolean;
}

export interface LeaderboardEntry {
  name: string;
  score: number;
  total: number;
  difficulty: Difficulty;
  date: string;
}

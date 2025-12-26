export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  thumbnail?: string;
  questions: QuizQuestion[];
  difficulty?: string;
  numQuestions?: number;
  sourceType?: 'pdf' | 'text';
  sourceFileName?: string;
}

export interface UserAnswer {
  questionId: number;
  selectedAnswer: number;
}

export interface QuizScore {
  correct: number;
  total: number;
  percentage: number;
  answers: {
    [questionId: number]: {
      isCorrect: boolean;
      selectedAnswer: number;
      correctAnswer: number;
    };
  };
} 
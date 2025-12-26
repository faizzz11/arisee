export interface Slide {
  slide: number;
  heading: string;
  points: string[];
  image: string;
  imageUrl?: string;
} 

export interface Question {
  id: number;
  text: string;
  marks: number;
  difficulty: 'easy' | 'medium' | 'hard';
  type: 'mcq' | 'short' | 'long' | 'descriptive';
  options?: string[];
  answer?: string;
}

export interface QuestionPaper {
  title: string;
  subject: string;
  totalMarks: number;
  duration: number; // in minutes
  instructions: string[];
  sections: {
    title: string;
    description?: string;
    questions: Question[];
  }[];
} 
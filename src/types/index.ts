export type QuestionType = 'text' | 'multiple';

export interface Question {
  question: string;
  type: QuestionType;
  options: string[];
}

export interface FormData {
  title: string;
  questions: Question[];
  createdBy?: string; // Will be set on the server
  createdAt?: Date;   // Will be set on the server
}

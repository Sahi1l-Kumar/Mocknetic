import { Schema, models, model, Document } from "mongoose";

export interface IAssessment {
  userId: string;
  jobRole: string;
  experienceLevel: string;
  difficulty: string;
  questions: {
    questionId: string;
    skill: string;
    question: string;
    options: string[];
    correctAnswer: number;
    userAnswer: number;
    isCorrect: boolean;
  }[];
  score: number;
  totalQuestions: number;
  completedAt: Date;
}

export interface IAssessmentDoc extends IAssessment, Document {}

const AssessmentSchema = new Schema<IAssessment>(
  {
    userId: { type: String, required: true },
    jobRole: { type: String, required: true },
    experienceLevel: { type: String, required: true },
    difficulty: { type: String, required: true },
    questions: [
      {
        questionId: String,
        skill: String,
        question: String,
        options: [String],
        correctAnswer: Number,
        userAnswer: Number,
        isCorrect: Boolean,
      },
    ],
    score: { type: Number, default: 0 },
    totalQuestions: { type: Number, default: 0 },
    completedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Assessment =
  models?.Assessment || model<IAssessment>("Assessment", AssessmentSchema);

export default Assessment;

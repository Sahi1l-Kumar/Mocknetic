import { Schema, models, model, Document, Types } from "mongoose";

export interface ISkillGap {
  skill: string;
  correctAnswers: number;
  questionsAnswered: number;
  accuracy: number;
  gap: number;
}

export interface IRecommendation {
  skill: string;
  title: string;
  description: string;
  link: string;
}

export interface IAnsweredQuestion {
  questionId: string;
  skill: string;
  questionType: string;
  question: string;

  options?: string[];
  correctAnswer?: number;
  expectedAnswer?: string;
  evaluationCriteria?: string;

  userAnswer?: string | number;
  isCorrect?: boolean;
}

export interface ISkillResult {
  userId: Types.ObjectId;
  assessmentId: Types.ObjectId;

  jobRole: string;
  difficulty: string;

  overallScore: number;
  correctAnswers: number;
  totalQuestions: number;

  skillGaps: ISkillGap[];
  recommendations: IRecommendation[];
  questions: IAnsweredQuestion[];

  completedAt: Date;
}

export interface ISkillResultDoc extends ISkillResult, Document {}

const SkillResultSchema = new Schema<ISkillResult>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    assessmentId: {
      type: Schema.Types.ObjectId,
      ref: "SkillEvaluation",
      required: true,
      unique: true,
    },

    jobRole: { type: String, required: true },
    difficulty: { type: String, required: true },

    overallScore: { type: Number, required: true },
    correctAnswers: { type: Number, required: true },
    totalQuestions: { type: Number, required: true },

    skillGaps: [
      {
        skill: { type: String, required: true },
        correctAnswers: { type: Number, required: true },
        questionsAnswered: { type: Number, required: true },
        accuracy: { type: Number, required: true },
        gap: { type: Number, required: true },
      },
    ],

    recommendations: [
      {
        skill: { type: String, required: true },
        title: { type: String, required: true },
        description: { type: String, required: true },
        link: { type: String, required: true },
      },
    ],

    questions: [
      {
        questionId: { type: String, required: true },
        skill: { type: String, required: true },
        questionType: { type: String, required: true },
        question: { type: String, required: true },

        options: [String],
        correctAnswer: Number,
        expectedAnswer: String,
        evaluationCriteria: String,

        userAnswer: Schema.Types.Mixed,
        isCorrect: Boolean,
      },
    ],

    completedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

SkillResultSchema.index({ userId: 1, completedAt: -1 });
SkillResultSchema.index({ jobRole: 1 });

const SkillResult =
  models?.SkillResult || model<ISkillResult>("SkillResult", SkillResultSchema);

export default SkillResult;

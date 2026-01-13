import { Schema, models, model, Document, Types } from "mongoose";

export interface IAssessment {
  userId: string;
  jobRole?: string;
  experienceLevel?: string;
  difficulty: string;
  classroomId?: Types.ObjectId;
  assessmentType: "interview" | "classroom";
  questions: {
    questionId: string;
    skill: string;
    questionType: string;
    question: string;
    options?: string[];
    correctAnswer?: number;
    expectedAnswer?: string;
    evaluationCriteria?: string;
    expectedKeywords?: string[];
    userAnswer?: number | string;
    isCorrect?: boolean;
  }[];
  score: number;
  totalQuestions: number;
  completedAt?: Date;
}

export interface IAssessmentDoc extends IAssessment, Document {}

const AssessmentSchema = new Schema<IAssessment>(
  {
    userId: { type: String, required: true },
    jobRole: { type: String },
    experienceLevel: { type: String },
    difficulty: { type: String, required: true },
    classroomId: { type: Schema.Types.ObjectId, ref: "Classroom" },
    assessmentType: {
      type: String,
      enum: ["interview", "classroom"],
      default: "interview",
    },
    questions: [
      {
        questionId: { type: String, required: true },
        skill: { type: String, required: true },
        questionType: { type: String, required: true },
        question: { type: String, required: true },
        options: { type: [String], default: [] },
        correctAnswer: { type: Number, default: null },
        expectedAnswer: { type: String, default: null },
        evaluationCriteria: { type: String, default: null },
        expectedKeywords: { type: [String], default: [] },
        userAnswer: { type: Schema.Types.Mixed, default: null },
        isCorrect: { type: Boolean, default: null },
      },
    ],
    score: { type: Number, default: 0 },
    totalQuestions: { type: Number, default: 0 },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

AssessmentSchema.index({ userId: 1, assessmentType: 1 });
AssessmentSchema.index({ classroomId: 1 });

const Assessment =
  models?.Assessment || model<IAssessment>("Assessment", AssessmentSchema);

export default Assessment;

import { Schema, models, model, Document, Types } from "mongoose";

export interface IQuestion {
  questionNumber: number;
  questionText: string;
  questionType: "mcq" | "descriptive" | "numerical";
  options?: string[];
  correctAnswer?: string | number | string[];
  points: number;
  difficulty: string;
  topic?: string;
  explanation?: string;
}

export interface IAnswer {
  questionNumber: number;
  answer: string | number;
  isCorrect?: boolean;
  pointsEarned?: number;
}

export interface IClassroomSubmission {
  assessmentId: Types.ObjectId;
  studentId: Types.ObjectId;
  classroomId: Types.ObjectId;
  questions: IQuestion[];
  answers: IAnswer[];
  score: number;
  totalPoints: number;
  percentage: number;
  status: "in_progress" | "submitted" | "graded";
  startedAt?: Date;
  submittedAt?: Date;
  gradedAt?: Date;
  timeSpent?: number;
  feedback?: string;
}

export interface IClassroomSubmissionDoc
  extends IClassroomSubmission,
    Document {}

const ClassroomSubmissionSchema = new Schema<IClassroomSubmission>(
  {
    assessmentId: {
      type: Schema.Types.ObjectId,
      ref: "ClassroomAssessment",
      required: true,
    },
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    classroomId: {
      type: Schema.Types.ObjectId,
      ref: "Classroom",
      required: true,
    },
    questions: [
      {
        questionNumber: { type: Number, required: true },
        questionText: { type: String, required: true },
        questionType: {
          type: String,
          enum: ["mcq", "descriptive", "numerical"],
          required: true,
        },
        options: [{ type: String }],
        correctAnswer: { type: Schema.Types.Mixed },
        points: { type: Number, required: true, default: 1 },
        difficulty: { type: String, required: true },
        topic: { type: String },
        explanation: { type: String },
      },
    ],
    answers: [
      {
        questionNumber: { type: Number, required: true },
        answer: { type: Schema.Types.Mixed, required: true },
        isCorrect: { type: Boolean },
        pointsEarned: { type: Number, default: 0 },
      },
    ],
    score: { type: Number, default: 0 },
    totalPoints: { type: Number, required: true, default: 0 },
    percentage: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["in_progress", "submitted", "graded"],
      default: "in_progress",
    },
    startedAt: { type: Date },
    submittedAt: { type: Date },
    gradedAt: { type: Date },
    timeSpent: { type: Number },
    feedback: { type: String },
  },
  { timestamps: true }
);

ClassroomSubmissionSchema.index(
  { assessmentId: 1, studentId: 1 },
  { unique: true }
);

const ClassroomSubmission =
  models?.ClassroomSubmission ||
  model<IClassroomSubmission>("ClassroomSubmission", ClassroomSubmissionSchema);

export default ClassroomSubmission;

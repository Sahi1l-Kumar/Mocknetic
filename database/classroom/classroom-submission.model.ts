import { Schema, models, model, Document, Types } from "mongoose";

export interface IGeneratedQuestion {
  questionNumber: number;
  questionType: "mcq" | "numerical";
  questionText: string;
  options?: string[];
  correctAnswer?: string | number | string[];
  points: number;
  topic?: string;
  explanation?: string;
  variantId?: string;
  equationContent?: {
    latex: string;
    description: string;
    position: "inline" | "display";
  };
  cognitiveLevel?: string;
  bloomsLevel?: number;
}

export interface IClassroomSubmission {
  assessmentId: Types.ObjectId;
  studentId: Types.ObjectId;
  classroomId: Types.ObjectId;
  questions: IGeneratedQuestion[];
  answers: Array<{
    questionNumber: number;
    answer: string | number;
    isCorrect?: boolean;
  }>;
  score: number;
  totalPoints: number;
  percentage: number;
  status: "in_progress" | "submitted" | "evaluated";
  startedAt: Date;
  submittedAt?: Date;
  variantIndices?: number[];
}

export interface IClassroomSubmissionDoc
  extends IClassroomSubmission,
    Document {}

const EquationSchema = new Schema(
  {
    latex: { type: String, required: true },
    description: { type: String, required: true },
    position: {
      type: String,
      enum: ["inline", "display"],
      default: "display",
    },
  },
  { _id: false },
);

const QuestionSchema = new Schema<IGeneratedQuestion>(
  {
    questionNumber: { type: Number, required: true },
    questionType: {
      type: String,
      enum: ["mcq", "numerical"],
      required: true,
    },
    questionText: { type: String, required: true },
    options: [{ type: String }],
    correctAnswer: { type: Schema.Types.Mixed },
    points: { type: Number, default: 1 },
    topic: { type: String },
    explanation: { type: String },
    variantId: { type: String },
    equationContent: { type: EquationSchema },
    cognitiveLevel: { type: String },
    bloomsLevel: { type: Number, min: 1, max: 6 },
  },
  { _id: false },
);

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
    questions: [QuestionSchema],
    answers: [
      {
        questionNumber: { type: Number },
        answer: { type: Schema.Types.Mixed },
        isCorrect: { type: Boolean },
      },
    ],
    score: { type: Number, default: 0 },
    totalPoints: { type: Number, required: true },
    percentage: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["in_progress", "submitted", "evaluated"],
      default: "in_progress",
    },
    startedAt: { type: Date, required: true },
    submittedAt: { type: Date },
    variantIndices: [{ type: Number }],
  },
  { timestamps: true },
);

ClassroomSubmissionSchema.index(
  { assessmentId: 1, studentId: 1 },
  { unique: true },
);
ClassroomSubmissionSchema.index({ classroomId: 1 });
ClassroomSubmissionSchema.index({ status: 1 });

const ClassroomSubmission =
  models?.ClassroomSubmission ||
  model<IClassroomSubmission>("ClassroomSubmission", ClassroomSubmissionSchema);

export default ClassroomSubmission;

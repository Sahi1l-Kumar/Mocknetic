import { Schema, models, model, Document, Types } from "mongoose";

export interface IClassroomAnswer {
  questionId: Types.ObjectId;
  studentAnswer: string | string[] | number;
  isCorrect: boolean | null;
  pointsAwarded: number;
  pointsPossible: number;
  feedback?: string;
  gradedBy?: "ai" | "manual";
  gradedAt?: Date;
}

export interface IClassroomSubmission {
  assessmentId: Types.ObjectId;
  studentId: Types.ObjectId;
  classroomId: Types.ObjectId;
  answers: IClassroomAnswer[];
  score: number;
  totalPoints: number;
  percentage: number;
  status: "in_progress" | "submitted" | "graded" | "pending_review";
  startedAt: Date;
  submittedAt?: Date;
  gradedAt?: Date;
  timeSpent: number;
  ipAddress?: string;
  userAgent?: string;
}

export interface IClassroomSubmissionDoc
  extends IClassroomSubmission,
    Document {}

const AnswerSchema = new Schema<IClassroomAnswer>({
  questionId: {
    type: Schema.Types.ObjectId,
    ref: "ClassroomQuestion",
    required: true,
  },
  studentAnswer: { type: Schema.Types.Mixed, required: true },
  isCorrect: { type: Boolean, default: null },
  pointsAwarded: { type: Number, default: 0, min: 0 },
  pointsPossible: { type: Number, required: true, min: 0 },
  feedback: { type: String },
  gradedBy: { type: String, enum: ["ai", "manual"] },
  gradedAt: { type: Date },
});

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
    answers: [AnswerSchema],
    score: { type: Number, default: 0, min: 0 },
    totalPoints: { type: Number, required: true, min: 0 },
    percentage: { type: Number, default: 0, min: 0, max: 100 },
    status: {
      type: String,
      enum: ["in_progress", "submitted", "graded", "pending_review"],
      default: "in_progress",
    },
    startedAt: { type: Date, default: Date.now },
    submittedAt: { type: Date },
    gradedAt: { type: Date },
    timeSpent: { type: Number, default: 0, min: 0 },
    ipAddress: { type: String },
    userAgent: { type: String },
  },
  { timestamps: true }
);

ClassroomSubmissionSchema.index(
  { assessmentId: 1, studentId: 1 },
  { unique: true }
);
ClassroomSubmissionSchema.index({ studentId: 1 });
ClassroomSubmissionSchema.index({ classroomId: 1 });
ClassroomSubmissionSchema.index({ status: 1 });

const ClassroomSubmission =
  models?.ClassroomSubmission ||
  model<IClassroomSubmission>("ClassroomSubmission", ClassroomSubmissionSchema);

export default ClassroomSubmission;

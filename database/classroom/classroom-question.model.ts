import { Schema, models, model, Document, Types } from "mongoose";

export interface IClassroomQuestion {
  assessmentId: Types.ObjectId;
  studentId: Types.ObjectId;
  questionNumber: number;
  questionText: string;
  questionType: "mcq" | "descriptive" | "numerical";
  options?: string[];
  correctAnswer?: string | number;
  points: number;
  difficulty: "easy" | "medium" | "hard";
  topic?: string;
  explanation?: string;
}

export interface IClassroomQuestionDoc extends IClassroomQuestion, Document {}

const ClassroomQuestionSchema = new Schema<IClassroomQuestion>(
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
    questionNumber: { type: Number, required: true },
    questionText: { type: String, required: true },
    questionType: {
      type: String,
      enum: ["mcq", "descriptive", "numerical"],
      required: true,
    },
    options: [{ type: String }],
    correctAnswer: { type: Schema.Types.Mixed },
    points: { type: Number, required: true, min: 0, default: 1 },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium",
    },
    topic: { type: String },
    explanation: { type: String },
  },
  { timestamps: true }
);

ClassroomQuestionSchema.index(
  { assessmentId: 1, studentId: 1, questionNumber: 1 },
  { unique: true }
);

const ClassroomQuestion =
  models?.ClassroomQuestion ||
  model<IClassroomQuestion>("ClassroomQuestion", ClassroomQuestionSchema);

export default ClassroomQuestion;

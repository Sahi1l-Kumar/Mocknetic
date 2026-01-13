import { Schema, models, model, Document, Types } from "mongoose";

export interface IQuestionConfig {
  mcq: number;
  descriptive: number;
  numerical: number;
}

export interface IClassroomAssessment {
  classroomId: Types.ObjectId;
  teacherId: Types.ObjectId;
  title: string;
  description?: string;
  curriculum: string;
  curriculumFile?: string;
  dueDate?: Date;
  difficulty: "easy" | "medium" | "hard";
  totalQuestions: number;
  questionConfig: IQuestionConfig;
  skills: string[];
  isPublished: boolean;
}

export interface IClassroomAssessmentDoc
  extends IClassroomAssessment,
    Document {}

const ClassroomAssessmentSchema = new Schema<IClassroomAssessment>(
  {
    classroomId: {
      type: Schema.Types.ObjectId,
      ref: "Classroom",
      required: true,
    },
    teacherId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: { type: String, required: true },
    description: { type: String },
    curriculum: { type: String, required: true },
    curriculumFile: { type: String },
    dueDate: { type: Date },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium",
    },
    totalQuestions: { type: Number, required: true },
    questionConfig: {
      mcq: { type: Number, required: true, min: 0 },
      descriptive: { type: Number, required: true, min: 0 },
      numerical: { type: Number, required: true, min: 0 },
    },
    skills: [{ type: String }],
    isPublished: { type: Boolean, default: false },
  },
  { timestamps: true }
);

ClassroomAssessmentSchema.index({ classroomId: 1 });
ClassroomAssessmentSchema.index({ teacherId: 1 });
ClassroomAssessmentSchema.index({ isPublished: 1 });

const ClassroomAssessment =
  models?.ClassroomAssessment ||
  model<IClassroomAssessment>("ClassroomAssessment", ClassroomAssessmentSchema);

export default ClassroomAssessment;

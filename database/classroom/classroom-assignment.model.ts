import { Schema, models, model, Document, Types } from "mongoose";

export interface IEquationContent {
  latex: string;
  description: string;
  complexity: "simple" | "moderate" | "complex";
}

export interface IQuestionConfig {
  mcq: number;
  numerical: number;
}

export interface IQuestionVariant {
  variantId: string;
  conceptId: string;
  topicArea: string;
  parameters: Record<string, number | string>;
  estimatedDifficulty: number;
  semanticSimilarityScore: number;
}

export interface IFairnessConfig {
  enableQuestionVariants: boolean;
  minVariantsPerConcept: number;
  maxDifficultyDeviation: number;
  requirementPerStudent: "unique_variants" | "same_difficulty" | "both";
}

export interface IClassroomAssessment {
  classroomId: Types.ObjectId;
  teacherId: Types.ObjectId;
  title: string;
  description?: string;
  curriculum: string;
  curriculumFile?: string;
  enrichedCurriculumContent?: string;
  dueDate?: Date;
  difficulty: "easy" | "medium" | "hard";
  totalQuestions: number;
  questionConfig: IQuestionConfig;
  skills: string[];
  isPublished: boolean;
  questionVariants?: IQuestionVariant[];
  fairnessConfig: IFairnessConfig;
  cognitiveLevel:
    | "knowledge"
    | "comprehension"
    | "application"
    | "analysis"
    | "synthesis"
    | "evaluation";
  includesEquations: boolean;
}

export interface IClassroomAssessmentDoc
  extends IClassroomAssessment,
    Document {}

const QuestionVariantSchema = new Schema<IQuestionVariant>(
  {
    variantId: { type: String, required: true },
    conceptId: { type: String, required: true },
    topicArea: { type: String, required: true },
    parameters: { type: Schema.Types.Mixed },
    estimatedDifficulty: { type: Number, min: 0, max: 1 },
    semanticSimilarityScore: { type: Number, min: 0, max: 1 },
  },
  { _id: false },
);

const FairnessConfigSchema = new Schema<IFairnessConfig>(
  {
    enableQuestionVariants: { type: Boolean, default: true },
    minVariantsPerConcept: { type: Number, default: 3 },
    maxDifficultyDeviation: { type: Number, default: 0.1 },
    requirementPerStudent: {
      type: String,
      enum: ["unique_variants", "same_difficulty", "both"],
      default: "both",
    },
  },
  { _id: false },
);

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
    enrichedCurriculumContent: { type: String },
    dueDate: { type: Date },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium",
    },
    totalQuestions: { type: Number, required: true },
    questionConfig: {
      mcq: { type: Number, required: true, min: 0 },
      numerical: { type: Number, required: true, min: 0 },
    },
    skills: [{ type: String }],
    isPublished: { type: Boolean, default: false },
    questionVariants: [QuestionVariantSchema],
    fairnessConfig: { type: FairnessConfigSchema, default: {} },
    cognitiveLevel: {
      type: String,
      enum: [
        "knowledge",
        "comprehension",
        "application",
        "analysis",
        "synthesis",
        "evaluation",
      ],
      default: "analysis",
    },
    includesEquations: { type: Boolean, default: false },
  },
  { timestamps: true },
);

ClassroomAssessmentSchema.index({ classroomId: 1 });
ClassroomAssessmentSchema.index({ teacherId: 1 });
ClassroomAssessmentSchema.index({ isPublished: 1 });

const ClassroomAssessment =
  models?.ClassroomAssessment ||
  model<IClassroomAssessment>("ClassroomAssessment", ClassroomAssessmentSchema);

export default ClassroomAssessment;

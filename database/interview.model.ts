import { Schema, model, models, Types, Document } from "mongoose";

export interface IInterview {
  userId: Types.ObjectId;
  type: "technical" | "behavioral" | "mixed";
  status: "in_progress" | "completed" | "abandoned";
  duration?: number; // in seconds
  transcript: Array<{
    speaker: "ai" | "user";
    message: string;
    timestamp: Date;
    type?: "question" | "answer" | "feedback" | "code_challenge";
  }>;
  codeChallenges?: Array<{
    problemTitle: string;
    problemDescription: string;
    userCode?: string;
    language?: string;
    passed: boolean;
    feedback?: string;
  }>;
  scores?: {
    communication: number;
    technical: number;
    problemSolving: number;
    overall: number;
  };
  feedback?: {
    strengths: string[];
    improvements: string[];
    detailedFeedback: string;
  };
  feedbackDetails?: Array<{
    questionNumber: number;
    question: string;
    answer: string;
    scores: {
      overall: number;
      relevance: number;
      completeness: number;
      clarity: number;
      confidence: number;
      communication: number;
    };
    strengths: string[];
    improvements: string[];
    feedback: string;
  }>;
}

export interface IInterviewDoc extends IInterview, Document {}

const InterviewSchema = new Schema<IInterview>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: ["technical", "behavioral", "mixed"],
      required: true,
    },
    status: {
      type: String,
      enum: ["in_progress", "completed", "abandoned"],
      default: "in_progress",
    },
    duration: Number,
    transcript: [
      {
        speaker: {
          type: String,
          enum: ["ai", "user"],
          required: true,
        },
        message: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        type: {
          type: String,
          enum: ["question", "answer", "feedback", "code_challenge"],
        },
      },
    ],
    codeChallenges: [
      {
        problemTitle: String,
        problemDescription: String,
        userCode: String,
        language: String,
        passed: Boolean,
        feedback: String,
      },
    ],
    scores: {
      communication: Number,
      technical: Number,
      problemSolving: Number,
      overall: Number,
    },
    feedback: {
      strengths: [String],
      improvements: [String],
      detailedFeedback: String,
    },
    feedbackDetails: [
      {
        questionNumber: Number,
        question: String,
        answer: String,
        scores: {
          overall: Number,
          relevance: Number,
          completeness: Number,
          clarity: Number,
          confidence: Number,
          communication: Number,
        },
        strengths: [String],
        improvements: [String],
        feedback: String,
      },
    ],
  },
  { timestamps: true }
);

// Indexes
InterviewSchema.index({ userId: 1, createdAt: -1 });
InterviewSchema.index({ status: 1 });

const Interview =
  models?.Interview || model<IInterview>("Interview", InterviewSchema);

export default Interview;

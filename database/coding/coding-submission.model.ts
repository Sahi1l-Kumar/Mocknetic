import { Schema, model, models, Types, Document } from "mongoose";

export interface ITestCaseResult {
  testCaseIndex: number;
  passed: boolean;
  actualOutput?: string;
  expectedOutput?: string;
  runtime?: number;
  memory?: number;
  error?: string;
}

export interface ISubmission {
  userId: Types.ObjectId;
  problemNumber: number;
  problemTitle: string;
  code: string;
  language: string;
  status:
    | "pending"
    | "running"
    | "accepted"
    | "wrong_answer"
    | "runtime_error"
    | "compile_error"
    | "time_limit_exceeded";
  testCasesPassed: number;
  totalTestCases: number;
  results: ITestCaseResult[];
  runtime?: number;
  memory?: number;
  judge0Tokens: string[];
  submittedAt: Date;
  completedAt?: Date;
}

export interface ISubmissionDoc extends ISubmission, Document {}

const SubmissionSchema = new Schema<ISubmission>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    problemNumber: { type: Number, required: true },
    problemTitle: { type: String, required: true },
    code: { type: String, required: true },
    language: { type: String, required: true },
    status: {
      type: String,
      enum: [
        "pending",
        "running",
        "accepted",
        "wrong_answer",
        "runtime_error",
        "compile_error",
        "time_limit_exceeded",
      ],
      default: "pending",
    },
    testCasesPassed: { type: Number, default: 0 },
    totalTestCases: { type: Number, required: true },
    results: [
      {
        testCaseIndex: Number,
        passed: Boolean,
        actualOutput: String,
        expectedOutput: String,
        runtime: Number,
        memory: Number,
        error: String,
      },
    ],
    runtime: Number,
    memory: Number,
    judge0Tokens: [String],
    submittedAt: { type: Date, default: Date.now },
    completedAt: Date,
  },
  { timestamps: true }
);

SubmissionSchema.index({ userId: 1, createdAt: -1 });
SubmissionSchema.index({ problemNumber: 1 });
SubmissionSchema.index({ userId: 1, problemNumber: 1 });

const Submission =
  models?.CodingSubmission ||
  model<ISubmission>("CodingSubmission", SubmissionSchema);

export default Submission;

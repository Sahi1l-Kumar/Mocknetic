import { Schema, model, models, Types, Document } from "mongoose";

export interface ISubmission {
  userId: Types.ObjectId;
  problemId: Types.ObjectId;
  code: string;
  language: string;
  status: "pending" | "accepted" | "wrong_answer" | "runtime_error" | "time_limit_exceeded";
  runtime?: number;
  memory?: number;
  testCasesPassed?: number;
  totalTestCases?: number;
  output?: string;
  error?: string;
}

export interface ISubmissionDoc extends ISubmission, Document {}

const SubmissionSchema = new Schema<ISubmission>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    problemId: { type: Schema.Types.ObjectId, ref: "Problem", required: true },
    code: { type: String, required: true },
    language: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "accepted", "wrong_answer", "runtime_error", "time_limit_exceeded"],
      required: true,
    },
    runtime: Number,
    memory: Number,
    testCasesPassed: Number,
    totalTestCases: Number,
    output: String,
    error: String,
  },
  { timestamps: true }
);

// Indexes
SubmissionSchema.index({ userId: 1, createdAt: -1 });
SubmissionSchema.index({ problemId: 1, userId: 1 });

const Submission = models?.Submission || model<ISubmission>("Submission", SubmissionSchema);

export default Submission;

// For future use when we have 1000+ coding problems

import { Schema, model, models, Document } from "mongoose";

export interface IProblem {
  title: string;
  slug: string;
  difficulty: "easy" | "medium" | "hard";
  description: string;
  examples: Array<{
    input: string;
    output: string;
    explanation?: string;
  }>;
  constraints: string[];
  testCases: Array<{
    input: string;
    expectedOutput: string;
    isHidden: boolean;
  }>;
  tags: string[];
  starterCode: {
    javascript: string;
    python: string;
    java: string;
    cpp: string;
  };
  hints?: string[];
}

export interface IProblemDoc extends IProblem, Document {}

const ProblemSchema = new Schema<IProblem>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      required: true,
    },
    description: { type: String, required: true },
    examples: [
      {
        input: { type: String, required: true },
        output: { type: String, required: true },
        explanation: String,
      },
    ],
    constraints: [{ type: String }],
    testCases: [
      {
        input: { type: String, required: true },
        expectedOutput: { type: String, required: true },
        isHidden: { type: Boolean, default: false },
      },
    ],
    tags: [{ type: String }],
    starterCode: {
      javascript: String,
      python: String,
      java: String,
      cpp: String,
    },
    hints: [String],
  },
  { timestamps: true }
);

const Problem = models?.Problem || model<IProblem>("Problem", ProblemSchema);

export default Problem;

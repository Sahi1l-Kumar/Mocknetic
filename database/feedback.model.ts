import { Schema, model, models, Document } from "mongoose";

export interface IFeedback extends Document {
  userId: Schema.Types.ObjectId;
  userEmail: string;
  page: string;
  feedbackType: "bug" | "feature" | "improvement" | "other";
  message: string;
  rating?: number;
  metadata?: {
    userAgent: string;
    screenResolution: string;
    timestamp: Date;
  };
  status: "pending" | "reviewed" | "resolved";
  createdAt: Date;
}

const FeedbackSchema = new Schema<IFeedback>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    userEmail: {
      type: String,
      required: true,
    },
    page: {
      type: String,
      required: true,
    },
    feedbackType: {
      type: String,
      enum: ["bug", "feature", "improvement", "other"],
      required: true,
    },
    message: {
      type: String,
      required: true,
      minlength: 10,
      maxlength: 1000,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    metadata: {
      userAgent: String,
      screenResolution: String,
      timestamp: Date,
    },
    status: {
      type: String,
      enum: ["pending", "reviewed", "resolved"],
      default: "pending",
    },
  },
  { timestamps: true },
);

const Feedback =
  models?.Feedback || model<IFeedback>("Feedback", FeedbackSchema);

export default Feedback;

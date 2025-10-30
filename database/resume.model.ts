import { Schema, model, models, Types, Document } from "mongoose";

export interface IResume {
  userId: Types.ObjectId;
  filename: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  parsedData?: {
    name?: string;
    email?: string;
    phone?: string;
    summary?: string;
    skills?: string[];
    experience?: Array<{
      title: string;
      company: string;
      location?: string;
      startDate: string;
      endDate: string;
      description?: string;
      current: boolean;
    }>;
    education?: Array<{
      degree: string;
      institution: string;
      location?: string;
      startDate: string;
      endDate: string;
      gpa?: string;
    }>;
    projects?: Array<{
      name: string;
      description: string;
      technologies: string[];
      link?: string;
    }>;
    certifications?: Array<{
      name: string;
      issuer: string;
      date: string;
    }>;
  };
  status: "pending" | "processing" | "completed" | "failed";
  errorMessage?: string;
}

export interface IResumeDoc extends IResume, Document {}

const ResumeSchema = new Schema<IResume>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    filename: { type: String, required: true },
    fileUrl: { type: String, required: true },
    fileSize: { type: Number, required: true },
    mimeType: { type: String, required: true },
    parsedData: {
      name: String,
      email: String,
      phone: String,
      summary: String,
      skills: [String],
      experience: [
        {
          title: String,
          company: String,
          location: String,
          startDate: String,
          endDate: String,
          description: String,
          current: Boolean,
        },
      ],
      education: [
        {
          degree: String,
          institution: String,
          location: String,
          startDate: String,
          endDate: String,
          gpa: String,
        },
      ],
      projects: [
        {
          name: String,
          description: String,
          technologies: [String],
          link: String,
        },
      ],
      certifications: [
        {
          name: String,
          issuer: String,
          date: String,
        },
      ],
    },
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "failed"],
      default: "pending",
    },
    errorMessage: String,
  },
  { timestamps: true }
);

// Index for faster queries
ResumeSchema.index({ userId: 1, createdAt: -1 });

const Resume = models?.Resume || model<IResume>("Resume", ResumeSchema);

export default Resume;

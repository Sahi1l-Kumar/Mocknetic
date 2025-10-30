import { Schema, model, models, Types, Document } from "mongoose";

export interface IProfile {
  userId: Types.ObjectId;
  experience: Array<{
    title: string;
    company: string;
    location?: string;
    startDate: string;
    endDate: string;
    description?: string;
    current: boolean;
  }>;
  education: Array<{
    degree: string;
    institution: string;
    location?: string;
    startDate: string;
    endDate: string;
    gpa?: string;
  }>;
  projects: Array<{
    name: string;
    description: string;
    technologies: string[];
    link?: string;
  }>;
  certifications: Array<{
    name: string;
    issuer: string;
    date: string;
  }>;
}

export interface IProfileDoc extends IProfile, Document {}

const ProfileSchema = new Schema<IProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    experience: [
      {
        title: { type: String, required: true },
        company: { type: String, required: true },
        location: String,
        startDate: { type: String, required: true },
        endDate: { type: String, required: true },
        description: String,
        current: { type: Boolean, default: false },
      },
    ],
    education: [
      {
        degree: { type: String, required: true },
        institution: { type: String, required: true },
        location: String,
        startDate: { type: String, required: true },
        endDate: { type: String, required: true },
        gpa: String,
      },
    ],
    projects: [
      {
        name: { type: String, required: true },
        description: { type: String, required: true },
        technologies: [{ type: String }],
        link: String,
      },
    ],
    certifications: [
      {
        name: { type: String, required: true },
        issuer: { type: String, required: true },
        date: { type: String, required: true },
      },
    ],
  },
  { timestamps: true }
);

const Profile = models?.Profile || model<IProfile>("Profile", ProfileSchema);

export default Profile;

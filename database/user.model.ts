import { Schema, models, model, Document } from "mongoose";

export interface IUser {
  name: string;
  username: string;
  email: string;
  bio?: string;
  image?: string;
  location?: string;
  currentRole?: string;
  company?: string;
  website?: string;
  github?: string;
  linkedin?: string;
  skills?: string[];
}

export interface IUserDoc extends IUser, Document {}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    bio: { type: String },
    image: { type: String },
    location: { type: String },
    currentRole: { type: String },
    company: { type: String },
    website: { type: String },
    github: { type: String },
    linkedin: { type: String },
    skills: [{ type: String }],
  },
  { timestamps: true }
);

const User = models?.User || model<IUser>("User", UserSchema);

export default User;

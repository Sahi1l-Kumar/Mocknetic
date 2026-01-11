import { Schema, models, model, Document, Types } from "mongoose";

export interface IClassroom {
  name: string;
  description?: string;
  code: string;
  teacherId: Types.ObjectId;
  subject?: string;
  isActive: boolean;
  studentCount: number;
}

export interface IClassroomDoc extends IClassroom, Document {}

const ClassroomSchema = new Schema<IClassroom>(
  {
    name: { type: String, required: true },
    description: { type: String },
    code: { type: String, required: true, unique: true, uppercase: true },
    teacherId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    subject: { type: String },
    isActive: { type: Boolean, default: true },
    studentCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Classroom =
  models?.Classroom || model<IClassroom>("Classroom", ClassroomSchema);

export default Classroom;

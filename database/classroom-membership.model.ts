import { Schema, models, model, Document, Types } from "mongoose";

export interface IClassroomMembership {
  classroomId: Types.ObjectId;
  studentId: Types.ObjectId;
  enrolledAt: Date;
  status: "active" | "dropped" | "completed";
}

export interface IClassroomMembershipDoc
  extends IClassroomMembership,
    Document {}

const ClassroomMembershipSchema = new Schema<IClassroomMembership>(
  {
    classroomId: {
      type: Schema.Types.ObjectId,
      ref: "Classroom",
      required: true,
    },
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    enrolledAt: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ["active", "dropped", "completed"],
      default: "active",
    },
  },
  { timestamps: true }
);

ClassroomMembershipSchema.index(
  { classroomId: 1, studentId: 1 },
  { unique: true }
);
ClassroomMembershipSchema.index({ studentId: 1 });

const ClassroomMembership =
  models?.ClassroomMembership ||
  model<IClassroomMembership>("ClassroomMembership", ClassroomMembershipSchema);

export default ClassroomMembership;

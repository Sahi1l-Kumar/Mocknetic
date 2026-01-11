import { NextRequest, NextResponse } from "next/server";
import { requireStudent } from "@/lib/auth-helpers";
import dbConnect from "@/lib/mongoose";
import ClassroomMembership from "@/database/classroom/classroom-membership.model";
import Classroom from "@/database/classroom/classroom.model";

export async function POST(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { error, user } = await requireStudent();
    if (error) return error;

    const params = await props.params;
    await dbConnect();

    const membership = await ClassroomMembership.findOne({
      classroomId: params.id,
      studentId: user.id,
      status: "active",
    });

    if (!membership) {
      return NextResponse.json(
        {
          success: false,
          error: { message: "You are not enrolled in this classroom" },
        },
        { status: 404 }
      );
    }

    membership.status = "dropped";
    await membership.save();

    await Classroom.findByIdAndUpdate(params.id, {
      $inc: { studentCount: -1 },
    });

    return NextResponse.json({
      success: true,
      message: "Successfully unenrolled from classroom",
    });
  } catch (error) {
    console.error("Error unenrolling from classroom:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to unenroll" } },
      { status: 500 }
    );
  }
}

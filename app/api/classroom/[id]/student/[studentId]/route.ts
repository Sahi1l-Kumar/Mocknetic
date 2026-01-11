import { NextRequest, NextResponse } from "next/server";
import { requireTeacher } from "@/lib/auth-helpers";
import dbConnect from "@/lib/mongoose";
import Classroom from "@/database/classroom/classroom.model";
import ClassroomMembership from "@/database/classroom/classroom-membership.model";

// DELETE /api/classroom/:id/student/:studentId - Remove student from classroom
export async function DELETE(
  request: NextRequest,
  props: {
    params: Promise<{ id: string; studentId: string }>;
  }
) {
  try {
    const { error, user } = await requireTeacher();
    if (error) return error;

    const params = await props.params;

    await dbConnect();

    // Verify teacher owns this classroom
    const classroom = await Classroom.findById(params.id);
    if (!classroom || classroom.teacherId.toString() !== user.id) {
      return NextResponse.json(
        { success: false, error: { message: "Forbidden" } },
        { status: 403 }
      );
    }

    const membership = await ClassroomMembership.findOneAndUpdate(
      {
        classroomId: params.id,
        studentId: params.studentId,
        status: "active",
      },
      { status: "dropped" },
      { new: true }
    );

    if (!membership) {
      return NextResponse.json(
        {
          success: false,
          error: { message: "Student membership not found" },
        },
        { status: 404 }
      );
    }

    // Update student count
    await Classroom.findByIdAndUpdate(params.id, {
      $inc: { studentCount: -1 },
    });

    return NextResponse.json({
      success: true,
      message: "Student removed successfully",
    });
  } catch (error) {
    console.error("Error removing student:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to remove student" } },
      { status: 500 }
    );
  }
}

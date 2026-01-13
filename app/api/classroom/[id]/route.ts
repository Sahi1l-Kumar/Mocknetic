import { NextRequest, NextResponse } from "next/server";
import { requireTeacher } from "@/lib/auth-helpers";
import dbConnect from "@/lib/mongoose";
import Classroom, {
  type IClassroom,
} from "@/database/classroom/classroom.model";
import ClassroomMembership from "@/database/classroom/classroom-membership.model";
import ClassroomAssessment from "@/database/classroom/classroom-assignment.model";

// GET /api/classroom/:id - Get classroom details
export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { error, user } = await requireTeacher();
    if (error) return error;

    const params = await props.params;
    await dbConnect();

    const classroom = await Classroom.findById(params.id).lean<
      IClassroom & { _id: any; createdAt: Date; updatedAt: Date }
    >();

    if (!classroom) {
      return NextResponse.json(
        { success: false, error: { message: "Classroom not found" } },
        { status: 404 }
      );
    }

    if (classroom.teacherId.toString() !== user.id) {
      return NextResponse.json(
        {
          success: false,
          error: { message: "Forbidden - Not your classroom" },
        },
        { status: 403 }
      );
    }

    const studentCount = await ClassroomMembership.countDocuments({
      classroomId: params.id,
      status: "active",
    });

    const assessmentCount = await ClassroomAssessment.countDocuments({
      classroomId: params.id,
    });

    return NextResponse.json({
      success: true,
      data: {
        _id: classroom._id.toString(),
        name: classroom.name,
        description: classroom.description,
        code: classroom.code,
        teacherId: classroom.teacherId.toString(),
        subject: classroom.subject,
        isActive: classroom.isActive,
        createdAt: classroom.createdAt,
        updatedAt: classroom.updatedAt,
        studentCount,
        assessmentCount,
      },
    });
  } catch (error) {
    console.error("Error fetching classroom:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to fetch classroom" } },
      { status: 500 }
    );
  }
}

// PUT /api/classroom/:id - Update classroom
export async function PUT(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { error, user } = await requireTeacher();
    if (error) return error;

    const params = await props.params;
    const body = await request.json();
    const { name, description, subject, isActive } = body;

    await dbConnect();

    const classroom = await Classroom.findById(params.id);

    if (!classroom) {
      return NextResponse.json(
        { success: false, error: { message: "Classroom not found" } },
        { status: 404 }
      );
    }

    if (classroom.teacherId.toString() !== user.id) {
      return NextResponse.json(
        {
          success: false,
          error: { message: "Forbidden - Not your classroom" },
        },
        { status: 403 }
      );
    }

    const updateData: Partial<IClassroom> = {};
    if (name) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description?.trim();
    if (subject !== undefined) updateData.subject = subject?.trim();
    if (isActive !== undefined) updateData.isActive = isActive;

    const updated = await Classroom.findByIdAndUpdate(
      params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).lean<IClassroom & { _id: any; createdAt: Date; updatedAt: Date }>();

    if (!updated) {
      return NextResponse.json(
        { success: false, error: { message: "Update failed" } },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        _id: updated._id.toString(),
        name: updated.name,
        description: updated.description,
        subject: updated.subject,
        code: updated.code,
        teacherId: updated.teacherId.toString(),
        isActive: updated.isActive,
        createdAt: updated.createdAt,
        updatedAt: updated.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error updating classroom:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to update classroom" } },
      { status: 500 }
    );
  }
}

// DELETE /api/classroom/:id - Soft delete classroom
export async function DELETE(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { error, user } = await requireTeacher();
    if (error) return error;

    const params = await props.params;
    await dbConnect();

    const classroom = await Classroom.findById(params.id);

    if (!classroom) {
      return NextResponse.json(
        { success: false, error: { message: "Classroom not found" } },
        { status: 404 }
      );
    }

    if (classroom.teacherId.toString() !== user.id) {
      return NextResponse.json(
        {
          success: false,
          error: { message: "Forbidden - Not your classroom" },
        },
        { status: 403 }
      );
    }

    await Classroom.findByIdAndUpdate(params.id, {
      isActive: false,
      updatedAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: "Classroom deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting classroom:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to delete classroom" } },
      { status: 500 }
    );
  }
}

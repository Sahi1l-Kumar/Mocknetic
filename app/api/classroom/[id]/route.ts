import { NextRequest, NextResponse } from "next/server";
import { requireTeacher } from "@/lib/auth-helpers";
import dbConnect from "@/lib/mongoose";
import Classroom from "@/database/classroom/classroom.model";
import ClassroomMembership from "@/database/classroom/classroom-membership.model";
import ClassroomAssessment from "@/database/classroom/classroom-assessment.model";

// GET /api/classroom/:id - Get classroom details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { error, user } = await requireTeacher();
    if (error) return error;

    await dbConnect();

    const classroom = await Classroom.findById(params.id);

    if (!classroom) {
      return NextResponse.json(
        { success: false, error: "Classroom not found" },
        { status: 404 }
      );
    }

    if (classroom.teacherId.toString() !== user.id) {
      return NextResponse.json(
        { success: false, error: "Forbidden - Not your classroom" },
        { status: 403 }
      );
    }

    // Get actual student count
    const studentCount = await ClassroomMembership.countDocuments({
      classroomId: params.id,
      status: "active",
    });

    // Get assessment count
    const assessmentCount = await ClassroomAssessment.countDocuments({
      classroomId: params.id,
    });

    return NextResponse.json({
      success: true,
      data: {
        _id: classroom._id,
        name: classroom.name,
        description: classroom.description,
        code: classroom.code,
        teacherId: classroom.teacherId,
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
      { success: false, error: "Failed to fetch classroom" },
      { status: 500 }
    );
  }
}

// PUT /api/classroom/:id - Update classroom
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { error, user } = await requireTeacher();
    if (error) return error;

    const body = await request.json();
    const { name, description, subject, isActive } = body;

    await dbConnect();

    const classroom = await Classroom.findById(params.id);

    if (!classroom) {
      return NextResponse.json(
        { success: false, error: "Classroom not found" },
        { status: 404 }
      );
    }

    if (classroom.teacherId.toString() !== user.id) {
      return NextResponse.json(
        { success: false, error: "Forbidden - Not your classroom" },
        { status: 403 }
      );
    }

    const updateData: Record<string, any> = {};
    if (name) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description?.trim();
    if (subject !== undefined) updateData.subject = subject?.trim();
    if (isActive !== undefined) updateData.isActive = isActive;

    const updated = await Classroom.findByIdAndUpdate(
      params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    console.error("Error updating classroom:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update classroom" },
      { status: 500 }
    );
  }
}

// DELETE /api/classroom/:id - Soft delete classroom
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { error, user } = await requireTeacher();
    if (error) return error;

    await dbConnect();

    const classroom = await Classroom.findById(params.id);

    if (!classroom) {
      return NextResponse.json(
        { success: false, error: "Classroom not found" },
        { status: 404 }
      );
    }

    if (classroom.teacherId.toString() !== user.id) {
      return NextResponse.json(
        { success: false, error: "Forbidden - Not your classroom" },
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
      { success: false, error: "Failed to delete classroom" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { requireStudent } from "@/lib/auth-helpers";
import dbConnect from "@/lib/mongoose";
import Classroom from "@/database/classroom/classroom.model";
import ClassroomMembership from "@/database/classroom/classroom-membership.model";

// POST /api/student/classrooms/join - Join classroom with code
export async function POST(request: NextRequest) {
  try {
    const { error, user } = await requireStudent();
    if (error) return error;

    const body = await request.json();
    const { code } = body;

    if (!code || !code.trim()) {
      return NextResponse.json(
        { success: false, error: "Classroom code is required" },
        { status: 400 }
      );
    }

    await dbConnect();

    const classroom = await Classroom.findOne({
      code: code.toUpperCase().trim(),
      isActive: true,
    });

    if (!classroom) {
      return NextResponse.json(
        { success: false, error: "Invalid classroom code" },
        { status: 404 }
      );
    }

    // Check if already enrolled
    const existing = await ClassroomMembership.findOne({
      classroomId: classroom._id,
      studentId: user.id,
    });

    if (existing) {
      if (existing.status === "active") {
        return NextResponse.json(
          { success: false, error: "Already enrolled in this classroom" },
          { status: 400 }
        );
      } else {
        // Reactivate membership
        existing.status = "active";
        existing.enrolledAt = new Date();
        await existing.save();

        await Classroom.findByIdAndUpdate(classroom._id, {
          $inc: { studentCount: 1 },
        });

        return NextResponse.json({
          success: true,
          data: {
            classroom: {
              id: classroom._id,
              name: classroom.name,
              subject: classroom.subject,
            },
            membership: existing,
          },
          message: "Re-enrolled successfully",
        });
      }
    }

    const membership = await ClassroomMembership.create({
      classroomId: classroom._id,
      studentId: user.id,
      status: "active",
      enrolledAt: new Date(),
    });

    // Update student count
    await Classroom.findByIdAndUpdate(classroom._id, {
      $inc: { studentCount: 1 },
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          classroom: {
            id: classroom._id,
            name: classroom.name,
            subject: classroom.subject,
          },
          membership,
        },
        message: "Successfully joined classroom",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error joining classroom:", error);
    return NextResponse.json(
      { success: false, error: "Failed to join classroom" },
      { status: 500 }
    );
  }
}

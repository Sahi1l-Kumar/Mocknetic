import { NextRequest, NextResponse } from "next/server";
import { requireStudent } from "@/lib/auth-helpers";
import dbConnect from "@/lib/mongoose";
import Classroom from "@/database/classroom/classroom.model";
import ClassroomMembership from "@/database/classroom/classroom-membership.model";
import ClassroomAssessment from "@/database/classroom/classroom-assignment.model";
import ClassroomSubmission from "@/database/classroom/classroom-submission.model";

// GET /api/student/classrooms/:id - Get classroom details for student
export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { error, user } = await requireStudent();
    if (error) return error;

    const params = await props.params;
    await dbConnect();

    // Check if student is enrolled
    const enrollment = await ClassroomMembership.findOne({
      classroomId: params.id,
      studentId: user.id,
      status: "active",
    });

    if (!enrollment) {
      return NextResponse.json(
        {
          success: false,
          error: { message: "Not enrolled in this classroom" },
        },
        { status: 403 }
      );
    }

    const classroom = await Classroom.findById(params.id).populate(
      "teacherId",
      "name email image"
    );

    if (!classroom) {
      return NextResponse.json(
        { success: false, error: { message: "Classroom not found" } },
        { status: 404 }
      );
    }

    if (!classroom.isActive) {
      return NextResponse.json(
        {
          success: false,
          error: { message: "Classroom is no longer active" },
        },
        { status: 404 }
      );
    }

    // Get total assessments (only published ones for students)
    const totalAssessments = await ClassroomAssessment.countDocuments({
      classroomId: params.id,
      isPublished: true,
    });

    // Get student's submissions
    const submissions = await ClassroomSubmission.find({
      classroomId: params.id,
      studentId: user.id,
      status: { $in: ["graded", "submitted"] },
    });

    const completedCount = submissions.length;
    const averageScore =
      completedCount > 0
        ? submissions.reduce((sum, s) => sum + s.percentage, 0) / completedCount
        : 0;

    // Get student count
    const studentCount = await ClassroomMembership.countDocuments({
      classroomId: params.id,
      status: "active",
    });

    const classroomObj = classroom.toObject();

    return NextResponse.json({
      success: true,
      data: {
        _id: classroomObj._id.toString(),
        name: classroomObj.name,
        description: classroomObj.description,
        code: classroomObj.code,
        subject: classroomObj.subject,
        teacher:
          typeof classroomObj.teacherId === "object"
            ? {
                _id: (classroomObj.teacherId as any)._id.toString(),
                name: (classroomObj.teacherId as any).name,
                email: (classroomObj.teacherId as any).email,
                image: (classroomObj.teacherId as any).image,
              }
            : {
                _id: classroomObj.teacherId.toString(),
                name: "Unknown Teacher",
                email: "",
              },
        enrolledAt: enrollment.enrolledAt,
        isActive: classroomObj.isActive,
        createdAt: classroomObj.createdAt,
        totalAssessments,
        completedAssessments: completedCount,
        pendingAssessments: Math.max(0, totalAssessments - completedCount),
        averageScore: Math.round(averageScore * 10) / 10,
        studentCount,
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

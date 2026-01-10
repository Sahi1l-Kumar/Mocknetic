import { NextResponse } from "next/server";
import { requireStudent } from "@/lib/auth-helpers";
import dbConnect from "@/lib/mongoose";
import ClassroomMembership from "@/database/classroom/classroom-membership.model";
import ClassroomAssessment from "@/database/classroom/classroom-assessment.model";
import ClassroomSubmission from "@/database/classroom/classroom-submission.model";

// GET /api/student/classrooms - Get all classrooms student is enrolled in
export async function GET() {
  try {
    const { error, user } = await requireStudent();
    if (error) return error;

    await dbConnect();

    const memberships = await ClassroomMembership.find({
      studentId: user.id,
      status: "active",
    })
      .populate({
        path: "classroomId",
        populate: {
          path: "teacherId",
          select: "name email image",
        },
      })
      .sort({ enrolledAt: -1 })
      .lean();

    const classroomsWithStats = await Promise.all(
      memberships.map(async (membership: any) => {
        const classroom = membership.classroomId;

        // Get total assessments
        const totalAssessments = await ClassroomAssessment.countDocuments({
          classroomId: classroom._id,
          isPublished: true,
        });

        // Get student's submissions
        const submissions = await ClassroomSubmission.find({
          classroomId: classroom._id,
          studentId: user.id,
          status: { $in: ["graded", "submitted"] },
        }).lean();

        const completedCount = submissions.length;
        const averageScore =
          completedCount > 0
            ? submissions.reduce((sum, s) => sum + s.percentage, 0) /
              completedCount
            : 0;

        return {
          id: classroom._id,
          name: classroom.name,
          description: classroom.description,
          subject: classroom.subject,
          code: classroom.code,
          teacher: classroom.teacherId,
          enrolledAt: membership.enrolledAt,
          totalAssessments,
          completedAssessments: completedCount,
          averageScore: Math.round(averageScore * 10) / 10,
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: classroomsWithStats,
    });
  } catch (error) {
    console.error("Error fetching student classrooms:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch classrooms" },
      { status: 500 }
    );
  }
}

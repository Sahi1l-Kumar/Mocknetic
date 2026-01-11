import { NextResponse } from "next/server";
import { requireStudent } from "@/lib/auth-helpers";
import dbConnect from "@/lib/mongoose";
import Classroom from "@/database/classroom/classroom.model";
import ClassroomMembership from "@/database/classroom/classroom-membership.model";
import ClassroomAssessment from "@/database/classroom/classroom-assessment.model";
import ClassroomSubmission from "@/database/classroom/classroom-submission.model";
import User from "@/database/user.model";

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
      .select("classroomId enrolledAt")
      .sort({ enrolledAt: -1 })
      .limit(100)
      .lean();

    if (memberships.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
      });
    }

    const classroomIds = memberships.map((m: any) => m.classroomId);

    const classrooms = await Classroom.find({
      _id: { $in: classroomIds },
      isActive: true,
    })
      .select("name description subject code teacherId studentCount")
      .lean();

    const teacherIds = [...new Set(classrooms.map((c: any) => c.teacherId))];

    const teachers = await User.find({
      _id: { $in: teacherIds },
    })
      .select("name email image")
      .lean();

    const teacherMap = new Map(teachers.map((t: any) => [t._id.toString(), t]));

    const classroomMap = new Map(
      classrooms.map((c: any) => [c._id.toString(), c])
    );

    const [assessmentCounts, submissionStats] = await Promise.all([
      ClassroomAssessment.aggregate([
        {
          $match: {
            classroomId: { $in: classroomIds },
            isPublished: true,
          },
        },
        {
          $group: {
            _id: "$classroomId",
            count: { $sum: 1 },
          },
        },
      ]),
      ClassroomSubmission.aggregate([
        {
          $match: {
            classroomId: { $in: classroomIds },
            studentId: user.id,
            status: { $in: ["graded", "submitted"] },
          },
        },
        {
          $group: {
            _id: "$classroomId",
            count: { $sum: 1 },
            avgScore: { $avg: "$percentage" },
          },
        },
      ]),
    ]);

    const assessmentMap = new Map(
      assessmentCounts.map((a) => [a._id.toString(), a.count])
    );

    const submissionMap = new Map(
      submissionStats.map((s) => [
        s._id.toString(),
        { count: s.count, avgScore: s.avgScore },
      ])
    );

    const classroomsWithStats = memberships
      .map((membership: any) => {
        const classroomIdStr = membership.classroomId.toString();
        const classroom = classroomMap.get(classroomIdStr);

        if (!classroom) return null;

        const teacher = teacherMap.get(classroom.teacherId.toString());
        const totalAssessments = assessmentMap.get(classroomIdStr) || 0;
        const stats = submissionMap.get(classroomIdStr) || {
          count: 0,
          avgScore: 0,
        };

        return {
          _id: classroomIdStr,
          name: classroom.name,
          description: classroom.description,
          subject: classroom.subject,
          code: classroom.code,
          teacher: teacher
            ? {
                name: teacher.name,
                email: teacher.email,
                image: teacher.image,
              }
            : { name: "Unknown", email: "", image: null },
          enrolledAt: membership.enrolledAt,
          studentCount: classroom.studentCount || 0,
          totalAssessments,
          completedAssessments: stats.count,
          pendingAssessments: Math.max(0, totalAssessments - stats.count),
          averageScore: Math.round(stats.avgScore * 10) / 10,
        };
      })
      .filter(Boolean);

    return NextResponse.json({
      success: true,
      data: classroomsWithStats,
    });
  } catch (error) {
    console.error("Error fetching student classrooms:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to fetch classrooms" } },
      { status: 500 }
    );
  }
}

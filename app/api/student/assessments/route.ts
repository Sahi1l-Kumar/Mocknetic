import { NextRequest, NextResponse } from "next/server";
import { requireStudent } from "@/lib/auth-helpers";
import dbConnect from "@/lib/mongoose";
import ClassroomMembership from "@/database/classroom/classroom-membership.model";
import ClassroomAssessment from "@/database/classroom/classroom-assignment.model";
import ClassroomSubmission from "@/database/classroom/classroom-submission.model";

// GET /api/student/assessments - Get all assessments for student
export async function GET(request: NextRequest) {
  try {
    const { error, user } = await requireStudent();
    if (error) return error;

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const classroomId = searchParams.get("classroomId");

    const query: any = {};

    if (classroomId) {
      // Get assessments for specific classroom
      query.classroomId = classroomId;
    } else {
      // Get assessments for all enrolled classrooms
      const memberships = await ClassroomMembership.find({
        studentId: user.id,
        status: "active",
      }).select("classroomId");

      const classroomIds = memberships.map((m) => m.classroomId);
      query.classroomId = { $in: classroomIds };
    }

    // Only get published assessments
    query.isPublished = true;

    const assessments = await ClassroomAssessment.find(query)
      .populate("classroomId", "name code")
      .sort({ createdAt: -1 })
      .lean();

    // Get student's submissions
    const submissions = await ClassroomSubmission.find({
      studentId: user.id,
    }).select("assessmentId score percentage status submittedAt");

    const submissionMap = new Map(
      submissions.map((s) => [s.assessmentId.toString(), s]),
    );

    // Format assessments with submission status
    const formattedAssessments = assessments.map((assessment: any) => {
      const submission = submissionMap.get(assessment._id.toString());
      const now = new Date();
      const dueDate = assessment.dueDate ? new Date(assessment.dueDate) : null;
      const isPastDue = dueDate ? now > dueDate : false;

      return {
        _id: assessment._id,
        title: assessment.title,
        description: assessment.description,
        classroom: {
          _id: assessment.classroomId._id,
          name: assessment.classroomId.name,
          code: assessment.classroomId.code,
        },
        totalQuestions: assessment.totalQuestions,
        difficulty: assessment.difficulty,
        curriculum: assessment.curriculum,
        cognitiveLevel: assessment.cognitiveLevel,
        dueDate: assessment.dueDate,
        isPastDue,
        status: submission
          ? submission.status
          : isPastDue
            ? "missed"
            : "not_started",
        score: submission?.percentage,
        submittedAt: submission?.submittedAt,
        publishedAt: assessment.createdAt,
      };
    });

    return NextResponse.json({
      success: true,
      data: formattedAssessments,
    });
  } catch (error) {
    console.error("Error fetching assessments:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch assessments" },
      { status: 500 },
    );
  }
}

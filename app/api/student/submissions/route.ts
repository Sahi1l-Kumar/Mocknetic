import { NextResponse } from "next/server";
import { requireStudent } from "@/lib/auth-helpers";
import dbConnect from "@/lib/mongoose";
import ClassroomSubmission from "@/database/classroom/classroom-submission.model";

// GET /api/student/submissions - Get all student's submissions
export async function GET() {
  try {
    const { error, user } = await requireStudent();
    if (error) return error;

    await dbConnect();

    const submissions = await ClassroomSubmission.find({
      studentId: user.id,
    })
      .populate("assessmentId", "title totalQuestions")
      .populate("classroomId", "name code")
      .sort({ submittedAt: -1 })
      .lean();

    const formattedSubmissions = submissions.map((s: any) => ({
      id: s._id,
      assessment: s.assessmentId,
      classroom: s.classroomId,
      score: s.score,
      totalPoints: s.totalPoints,
      percentage: s.percentage,
      status: s.status,
      submittedAt: s.submittedAt,
      timeSpent: s.timeSpent,
    }));

    return NextResponse.json({
      success: true,
      data: formattedSubmissions,
    });
  } catch (error) {
    console.error("Error fetching submissions:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch submissions" },
      { status: 500 }
    );
  }
}

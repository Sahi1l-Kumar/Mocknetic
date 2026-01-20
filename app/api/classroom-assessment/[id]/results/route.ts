import { NextRequest, NextResponse } from "next/server";
import { requireTeacher } from "@/lib/auth-helpers";
import dbConnect from "@/lib/mongoose";
import ClassroomAssessment from "@/database/classroom/classroom-assignment.model";
import ClassroomSubmission from "@/database/classroom/classroom-submission.model";

// GET /api/classroom-assessment/:id/results - Get all submission results
export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string }> },
) {
  try {
    const { error, user } = await requireTeacher();
    if (error) return error;

    const params = await props.params;
    await dbConnect();

    const assessment = await ClassroomAssessment.findById(params.id);

    if (!assessment) {
      return NextResponse.json(
        { success: false, error: { message: "Assessment not found" } },
        { status: 404 },
      );
    }

    if (assessment.teacherId.toString() !== user.id) {
      return NextResponse.json(
        { success: false, error: { message: "Forbidden" } },
        { status: 403 },
      );
    }

    const submissions = await ClassroomSubmission.find({
      assessmentId: params.id,
    })
      .populate("studentId", "name email image username")
      .sort({ submittedAt: -1 });

    const completedSubmissions = submissions.filter(
      (s) => s.status === "evaluated" || s.status === "submitted",
    );

    const stats = {
      totalSubmissions: submissions.length,
      completedCount: completedSubmissions.length,
      inProgress: submissions.filter((s) => s.status === "in_progress").length,
      averageScore: 0,
      highestScore: 0,
      lowestScore: 0,
    };

    if (completedSubmissions.length > 0) {
      const scores = completedSubmissions.map((s) => s.percentage);
      stats.averageScore =
        scores.reduce((sum, s) => sum + s, 0) / scores.length;
      stats.highestScore = Math.max(...scores);
      stats.lowestScore = Math.min(...scores);
    }

    return NextResponse.json({
      success: true,
      data: {
        assessment: {
          _id: assessment._id.toString(),
          title: assessment.title,
          totalQuestions: assessment.totalQuestions,
          totalPoints: assessment.totalQuestions,
        },
        stats,
        submissions: submissions.map((s) => {
          const submissionObj = s.toObject();
          return {
            _id: submissionObj._id.toString(),
            student:
              typeof s.studentId === "object"
                ? {
                    _id: (s.studentId as any)._id.toString(),
                    name: (s.studentId as any).name,
                    email: (s.studentId as any).email,
                    image: (s.studentId as any).image,
                    username: (s.studentId as any).username,
                  }
                : null,
            score: submissionObj.score,
            totalPoints: submissionObj.totalPoints,
            percentage: submissionObj.percentage,
            status: submissionObj.status,
            submittedAt: submissionObj.submittedAt,
            startedAt: submissionObj.startedAt,
          };
        }),
      },
    });
  } catch (error) {
    console.error("Error fetching results:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to fetch results" } },
      { status: 500 },
    );
  }
}

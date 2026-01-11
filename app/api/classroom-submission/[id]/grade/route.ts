import { NextRequest, NextResponse } from "next/server";
import { requireTeacher } from "@/lib/auth-helpers";
import dbConnect from "@/lib/mongoose";
import ClassroomSubmission from "@/database/classroom/classroom-submission.model";
import ClassroomAssessment from "@/database/classroom/classroom-assessment.model";

// POST /api/classroom-submission/:id/grade - Grade specific answers
export async function POST(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { error, user } = await requireTeacher();
    if (error) return error;

    const params = await props.params;
    const body = await request.json();
    const { grades } = body;

    if (!grades || !Array.isArray(grades)) {
      return NextResponse.json(
        {
          success: false,
          error: { message: "Grades array is required" },
        },
        { status: 400 }
      );
    }

    await dbConnect();

    const submission = await ClassroomSubmission.findById(params.id);

    if (!submission) {
      return NextResponse.json(
        { success: false, error: { message: "Submission not found" } },
        { status: 404 }
      );
    }

    const assessment = await ClassroomAssessment.findById(
      submission.assessmentId
    );

    if (!assessment) {
      return NextResponse.json(
        { success: false, error: { message: "Assessment not found" } },
        { status: 404 }
      );
    }

    if (assessment.teacherId.toString() !== user.id) {
      return NextResponse.json(
        { success: false, error: { message: "Forbidden" } },
        { status: 403 }
      );
    }

    // Update grades
    let totalScore = 0;
    let allGraded = true;

    for (const grade of grades) {
      const answerIndex = submission.answers.findIndex(
        (a: any) => a.questionId.toString() === grade.questionId
      );

      if (answerIndex !== -1) {
        submission.answers[answerIndex].pointsAwarded = grade.pointsAwarded;
        submission.answers[answerIndex].feedback = grade.feedback;
        submission.answers[answerIndex].isCorrect =
          grade.pointsAwarded > 0 ? true : false;
        submission.answers[answerIndex].gradedBy = "manual";
        submission.answers[answerIndex].gradedAt = new Date();

        totalScore += grade.pointsAwarded;
      }
    }

    // Calculate total score including auto-graded answers
    submission.answers.forEach((answer: any) => {
      if (answer.gradedBy === "ai") {
        totalScore += answer.pointsAwarded;
      }
      if (answer.isCorrect === null) {
        allGraded = false;
      }
    });

    submission.score = totalScore;
    submission.percentage =
      submission.totalPoints > 0
        ? (totalScore / submission.totalPoints) * 100
        : 0;
    submission.status = allGraded ? "graded" : "pending_review";
    submission.gradedAt = allGraded ? new Date() : undefined;

    await submission.save();

    return NextResponse.json({
      success: true,
      data: {
        submissionId: submission._id.toString(),
        score: submission.score,
        totalPoints: submission.totalPoints,
        percentage: submission.percentage,
        status: submission.status,
      },
      message: "Grading updated successfully",
    });
  } catch (error) {
    console.error("Error grading submission:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to grade submission" } },
      { status: 500 }
    );
  }
}

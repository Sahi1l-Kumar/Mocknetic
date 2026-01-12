import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import dbConnect from "@/lib/mongoose";
import ClassroomSubmission from "@/database/classroom/classroom-submission.model";
import ClassroomAssessment from "@/database/classroom/classroom-assessment.model";

// GET /api/classroom-submission/:id - Get submission details
export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { error, user } = await requireAuth();
    if (error) return error;

    const params = await props.params;
    await dbConnect();

    const submission = (await ClassroomSubmission.findById(params.id)
      .populate("studentId", "name email image username")
      .populate("assessmentId", "title totalQuestions")
      .lean()
      .exec()) as any;

    if (!submission) {
      return NextResponse.json(
        { success: false, error: { message: "Submission not found" } },
        { status: 404 }
      );
    }

    const assessment = await ClassroomAssessment.findById(
      submission.assessmentId._id || submission.assessmentId
    );

    if (!assessment) {
      return NextResponse.json(
        { success: false, error: { message: "Assessment not found" } },
        { status: 404 }
      );
    }

    // Check access
    if (user.role === "teacher") {
      if (assessment.teacherId.toString() !== user.id) {
        return NextResponse.json(
          { success: false, error: { message: "Forbidden" } },
          { status: 403 }
        );
      }
    } else if (user.role === "student") {
      const studentId =
        submission.studentId._id?.toString() || submission.studentId.toString();

      if (studentId !== user.id) {
        return NextResponse.json(
          {
            success: false,
            error: { message: "Forbidden - Not your submission" },
          },
          { status: 403 }
        );
      }
    }

    // Questions are embedded in submission
    const questionsWithAnswers = (submission.questions || []).map(
      (question: any) => {
        const answer = (submission.answers || []).find(
          (a: any) => a.questionNumber === question.questionNumber
        );

        return {
          _id: question._id?.toString() || `q${question.questionNumber}`,
          questionNumber: question.questionNumber,
          questionText: question.questionText,
          questionType: question.questionType,
          options: question.options,
          correctAnswer: question.correctAnswer,
          points: question.points,
          difficulty: question.difficulty,
          topic: question.topic,
          explanation: question.explanation,
          studentAnswer: answer?.answer,
          isCorrect: answer?.isCorrect,
          pointsAwarded: answer?.pointsEarned || 0,
          feedback: answer?.feedback,
        };
      }
    );

    const submissionData = {
      _id: submission._id.toString(),
      assessmentId:
        typeof submission.assessmentId === "object"
          ? {
              _id: submission.assessmentId._id.toString(),
              title: submission.assessmentId.title,
              totalQuestions: submission.assessmentId.totalQuestions,
            }
          : submission.assessmentId.toString(),
      studentId:
        typeof submission.studentId === "object"
          ? {
              _id: submission.studentId._id.toString(),
              name: submission.studentId.name,
              email: submission.studentId.email,
              image: submission.studentId.image,
              username: submission.studentId.username,
            }
          : submission.studentId.toString(),
      classroomId: submission.classroomId.toString(),
      score: submission.score,
      totalPoints: submission.totalPoints,
      percentage: submission.percentage,
      status: submission.status,
      startedAt: submission.startedAt,
      submittedAt: submission.submittedAt,
      gradedAt: submission.gradedAt,
      timeSpent: submission.timeSpent,
      createdAt: submission.createdAt,
      updatedAt: submission.updatedAt,
      questions: questionsWithAnswers,
    };

    return NextResponse.json({
      success: true,
      data: submissionData,
    });
  } catch (error) {
    console.error("Error fetching submission:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to fetch submission" } },
      { status: 500 }
    );
  }
}

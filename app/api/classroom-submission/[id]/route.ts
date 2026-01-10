import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import dbConnect from "@/lib/mongoose";
import ClassroomSubmission from "@/database/classroom/classroom-submission.model";
import ClassroomQuestion from "@/database/classroom/classroom-question.model";
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

    const submission = await ClassroomSubmission.findById(params.id)
      .populate("studentId", "name email image username")
      .populate("assessmentId", "title totalQuestions");

    if (!submission) {
      return NextResponse.json(
        { success: false, error: "Submission not found" },
        { status: 404 }
      );
    }

    const assessment = await ClassroomAssessment.findById(
      submission.assessmentId
    );

    if (!assessment) {
      return NextResponse.json(
        { success: false, error: "Assessment not found" },
        { status: 404 }
      );
    }

    // Check access
    if (user.role === "teacher") {
      if (assessment.teacherId.toString() !== user.id) {
        return NextResponse.json(
          { success: false, error: "Forbidden" },
          { status: 403 }
        );
      }
    } else if (user.role === "student") {
      // Access studentId properly from populated field
      const studentId =
        typeof submission.studentId === "object" &&
        submission.studentId !== null
          ? (submission.studentId as any)._id.toString()
          : submission.studentId.toString();

      if (studentId !== user.id) {
        return NextResponse.json(
          { success: false, error: "Forbidden - Not your submission" },
          { status: 403 }
        );
      }
    }

    // Get questions with answers
    const questions = await ClassroomQuestion.find({
      assessmentId: submission.assessmentId,
    }).sort({ questionNumber: 1 });

    const questionsWithAnswers = questions.map((question) => {
      const answer = submission.answers.find(
        (a: any) => a.questionId.toString() === question._id.toString()
      );

      return {
        _id: question._id,
        assessmentId: question.assessmentId,
        questionNumber: question.questionNumber,
        questionText: question.questionText,
        questionType: question.questionType,
        options: question.options,
        correctAnswer: question.correctAnswer,
        points: question.points,
        difficulty: question.difficulty,
        topic: question.topic,
        explanation: question.explanation,
        studentAnswer: answer?.studentAnswer,
        isCorrect: answer?.isCorrect,
        pointsAwarded: answer?.pointsAwarded,
        feedback: answer?.feedback,
        gradedBy: answer?.gradedBy,
      };
    });

    // Format the response data
    const submissionData = {
      _id: submission._id,
      assessmentId: submission.assessmentId,
      studentId: submission.studentId,
      classroomId: submission.classroomId,
      score: submission.score,
      totalPoints: submission.totalPoints,
      percentage: submission.percentage,
      status: submission.status,
      startedAt: submission.startedAt,
      submittedAt: submission.submittedAt,
      gradedAt: submission.gradedAt,
      timeSpent: submission.timeSpent,
      ipAddress: submission.ipAddress,
      userAgent: submission.userAgent,
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
      { success: false, error: "Failed to fetch submission" },
      { status: 500 }
    );
  }
}

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

    // Check access
    if (user.role === "teacher") {
      if (assessment.teacherId.toString() !== user.id) {
        return NextResponse.json(
          { success: false, error: { message: "Forbidden" } },
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
          {
            success: false,
            error: { message: "Forbidden - Not your submission" },
          },
          { status: 403 }
        );
      }
    }

    // Get questions with answers
    const questions = await ClassroomQuestion.find({
      assessmentId: submission.assessmentId,
    }).sort({ questionNumber: 1 });

    const questionsWithAnswers = questions.map((question) => {
      const questionObj = question.toObject();
      const answer = submission.answers.find(
        (a: any) => a.questionId.toString() === question._id.toString()
      );

      return {
        _id: questionObj._id.toString(),
        assessmentId: questionObj.assessmentId.toString(),
        questionNumber: questionObj.questionNumber,
        questionText: questionObj.questionText,
        questionType: questionObj.questionType,
        options: questionObj.options,
        correctAnswer: questionObj.correctAnswer,
        points: questionObj.points,
        difficulty: questionObj.difficulty,
        topic: questionObj.topic,
        explanation: questionObj.explanation,
        studentAnswer: answer?.studentAnswer,
        isCorrect: answer?.isCorrect,
        pointsAwarded: answer?.pointsAwarded,
        feedback: answer?.feedback,
        gradedBy: answer?.gradedBy,
      };
    });

    const submissionObj = submission.toObject();

    // Format the response data
    const submissionData = {
      _id: submissionObj._id.toString(),
      assessmentId:
        typeof submissionObj.assessmentId === "object"
          ? {
              _id: (submissionObj.assessmentId as any)._id.toString(),
              title: (submissionObj.assessmentId as any).title,
              totalQuestions: (submissionObj.assessmentId as any)
                .totalQuestions,
            }
          : submissionObj.assessmentId.toString(),
      studentId:
        typeof submissionObj.studentId === "object"
          ? {
              _id: (submissionObj.studentId as any)._id.toString(),
              name: (submissionObj.studentId as any).name,
              email: (submissionObj.studentId as any).email,
              image: (submissionObj.studentId as any).image,
              username: (submissionObj.studentId as any).username,
            }
          : submissionObj.studentId.toString(),
      classroomId: submissionObj.classroomId.toString(),
      score: submissionObj.score,
      totalPoints: submissionObj.totalPoints,
      percentage: submissionObj.percentage,
      status: submissionObj.status,
      startedAt: submissionObj.startedAt,
      submittedAt: submissionObj.submittedAt,
      gradedAt: submissionObj.gradedAt,
      timeSpent: submissionObj.timeSpent,
      ipAddress: submissionObj.ipAddress,
      userAgent: submissionObj.userAgent,
      createdAt: submissionObj.createdAt,
      updatedAt: submissionObj.updatedAt,
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

import { NextRequest, NextResponse } from "next/server";
import { requireStudent } from "@/lib/auth-helpers";
import dbConnect from "@/lib/mongoose";
import ClassroomSubmission from "@/database/classroom/classroom-submission.model";
import ClassroomQuestion from "@/database/classroom/classroom-question.model";
import ClassroomAssessment from "@/database/classroom/classroom-assessment.model";
import ClassroomMembership from "@/database/classroom/classroom-membership.model";

// POST /api/classroom-assessment/:id/submit - Submit student answers
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { error, user } = await requireStudent();
    if (error) return error;

    const body = await request.json();
    const { answers, timeSpent } = body;

    if (!answers || typeof answers !== "object") {
      return NextResponse.json(
        { success: false, error: "Answers are required" },
        { status: 400 }
      );
    }

    await dbConnect();

    const assessment = await ClassroomAssessment.findById(params.id);

    if (!assessment) {
      return NextResponse.json(
        { success: false, error: "Assessment not found" },
        { status: 404 }
      );
    }

    if (!assessment.isPublished) {
      return NextResponse.json(
        { success: false, error: "Assessment not published yet" },
        { status: 400 }
      );
    }

    // Check if due date has passed
    if (assessment.dueDate && new Date() > new Date(assessment.dueDate)) {
      return NextResponse.json(
        { success: false, error: "Assessment deadline has passed" },
        { status: 400 }
      );
    }

    // Check enrollment
    const enrollment = await ClassroomMembership.findOne({
      classroomId: assessment.classroomId,
      studentId: user.id,
      status: "active",
    });

    if (!enrollment) {
      return NextResponse.json(
        { success: false, error: "Not enrolled in this classroom" },
        { status: 403 }
      );
    }

    // Check if already submitted
    const existing = await ClassroomSubmission.findOne({
      assessmentId: params.id,
      studentId: user.id,
    });

    if (existing && existing.status !== "in_progress") {
      return NextResponse.json(
        { success: false, error: "Assessment already submitted" },
        { status: 400 }
      );
    }

    const questions = await ClassroomQuestion.find({
      assessmentId: params.id,
    }).sort({ questionNumber: 1 });

    if (questions.length === 0) {
      return NextResponse.json(
        { success: false, error: "No questions found for this assessment" },
        { status: 400 }
      );
    }

    // Grade answers
    let score = 0;
    let totalPoints = 0;
    const gradedAnswers = [];

    for (const question of questions) {
      totalPoints += question.points;
      const questionId = question._id.toString();
      const studentAnswer = answers[questionId];

      let isCorrect: boolean | null = null;
      let pointsAwarded = 0;
      let gradedBy: "ai" | "manual" | undefined = undefined;

      if (!studentAnswer || studentAnswer === "") {
        // No answer provided
        gradedAnswers.push({
          questionId: question._id,
          studentAnswer: "",
          isCorrect: false,
          pointsAwarded: 0,
          pointsPossible: question.points,
          gradedBy: "ai",
        });
        continue;
      }

      // Auto-grade MCQ and Numerical
      if (question.questionType === "mcq") {
        isCorrect = studentAnswer === question.correctAnswer;
        pointsAwarded = isCorrect ? question.points : 0;
        score += pointsAwarded;
        gradedBy = "ai";
      } else if (question.questionType === "numerical") {
        const studentNum = parseFloat(studentAnswer);
        const correctNum = parseFloat(question.correctAnswer as string);
        isCorrect =
          !isNaN(studentNum) &&
          !isNaN(correctNum) &&
          Math.abs(studentNum - correctNum) < 0.01;
        pointsAwarded = isCorrect ? question.points : 0;
        score += pointsAwarded;
        gradedBy = "ai";
      }
      // Descriptive and Coding need manual grading (isCorrect stays null)

      gradedAnswers.push({
        questionId: question._id,
        studentAnswer,
        isCorrect,
        pointsAwarded,
        pointsPossible: question.points,
        gradedBy,
      });
    }

    const percentage = totalPoints > 0 ? (score / totalPoints) * 100 : 0;
    const needsReview = gradedAnswers.some((a) => a.isCorrect === null);

    // Get client info
    const ipAddress =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "unknown";
    const userAgent = request.headers.get("user-agent") || "unknown";

    const submissionData = {
      assessmentId: params.id,
      studentId: user.id,
      classroomId: assessment.classroomId,
      answers: gradedAnswers,
      score,
      totalPoints,
      percentage: Math.round(percentage * 100) / 100,
      status: needsReview ? "pending_review" : "graded",
      startedAt: existing?.startedAt || new Date(),
      submittedAt: new Date(),
      gradedAt: needsReview ? undefined : new Date(),
      timeSpent: timeSpent || 0,
      ipAddress,
      userAgent,
    };

    let submission;
    if (existing) {
      submission = await ClassroomSubmission.findByIdAndUpdate(
        existing._id,
        submissionData,
        { new: true }
      );
    } else {
      submission = await ClassroomSubmission.create(submissionData);
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          submissionId: submission._id,
          score,
          totalPoints,
          percentage: submission.percentage,
          status: submission.status,
          needsReview,
        },
        message: "Assessment submitted successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error submitting assessment:", error);
    return NextResponse.json(
      { success: false, error: "Failed to submit assessment" },
      { status: 500 }
    );
  }
}

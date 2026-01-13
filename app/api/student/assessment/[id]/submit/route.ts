import { NextRequest, NextResponse } from "next/server";
import { requireStudent } from "@/lib/auth-helpers";
import dbConnect from "@/lib/mongoose";
import ClassroomAssessment from "@/database/classroom/classroom-assignment.model";
import ClassroomSubmission from "@/database/classroom/classroom-submission.model";
import ClassroomMembership from "@/database/classroom/classroom-membership.model";

interface SubmitAnswerInput {
  questionNumber: number;
  answer: string | number;
}

export async function POST(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { error, user } = await requireStudent();
    if (error) return error;

    const params = await props.params;
    const body = await request.json();
    const { answers, timeSpent } = body as {
      answers: SubmitAnswerInput[];
      timeSpent: number;
    };

    if (!answers || !Array.isArray(answers)) {
      return NextResponse.json(
        { success: false, error: { message: "Answers are required" } },
        { status: 400 }
      );
    }

    await dbConnect();

    const assessment = await ClassroomAssessment.findById(params.id);

    if (!assessment) {
      return NextResponse.json(
        { success: false, error: { message: "Assessment not found" } },
        { status: 404 }
      );
    }

    if (!assessment.isPublished) {
      return NextResponse.json(
        { success: false, error: { message: "Assessment not published yet" } },
        { status: 400 }
      );
    }

    // Check if due date has passed
    if (assessment.dueDate && new Date() > new Date(assessment.dueDate)) {
      return NextResponse.json(
        {
          success: false,
          error: { message: "Assessment deadline has passed" },
        },
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
        {
          success: false,
          error: { message: "Not enrolled in this classroom" },
        },
        { status: 403 }
      );
    }

    const submission = (await ClassroomSubmission.findOne({
      assessmentId: params.id,
      studentId: user.id,
    }).lean()) as any;

    if (!submission) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "No questions found. Please start the assessment first.",
          },
        },
        { status: 400 }
      );
    }

    if (submission.status === "submitted" || submission.status === "graded") {
      return NextResponse.json(
        { success: false, error: { message: "Assessment already submitted" } },
        { status: 400 }
      );
    }

    if (!submission.questions || submission.questions.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "No questions found. Please regenerate questions.",
          },
        },
        { status: 400 }
      );
    }

    const questions = submission.questions;
    let score = 0;
    let totalPoints = 0;
    const gradedAnswers = [];

    for (const question of questions) {
      totalPoints += question.points || 1;

      // Find student's answer for this question number
      const studentAnswerObj = answers.find(
        (a) => a.questionNumber === question.questionNumber
      );

      const studentAnswer = studentAnswerObj?.answer;

      let isCorrect: boolean | null = null;
      let pointsEarned = 0;

      if (!studentAnswer || studentAnswer === "") {
        // No answer provided
        gradedAnswers.push({
          questionNumber: question.questionNumber,
          answer: "",
          isCorrect: false,
          pointsEarned: 0,
        });
        continue;
      }

      // Auto-grade MCQ
      if (question.questionType === "mcq") {
        const correctOption = question.options[question.correctAnswer - 1];
        isCorrect = studentAnswer === correctOption;
        pointsEarned = isCorrect ? question.points : 0;
        score += pointsEarned;
      }
      // Auto-grade Numerical
      else if (question.questionType === "numerical") {
        const studentNum = parseFloat(studentAnswer as string);
        const correctNum = parseFloat(question.correctAnswer as string);
        isCorrect =
          !isNaN(studentNum) &&
          !isNaN(correctNum) &&
          Math.abs(studentNum - correctNum) < 0.01;
        pointsEarned = isCorrect ? question.points : 0;
        score += pointsEarned;
      }
      // Descriptive needs manual grading
      else if (question.questionType === "descriptive") {
        isCorrect = null;
        pointsEarned = 0;
      }

      gradedAnswers.push({
        questionNumber: question.questionNumber,
        answer: studentAnswer,
        isCorrect,
        pointsEarned,
      });
    }

    const percentage = totalPoints > 0 ? (score / totalPoints) * 100 : 0;
    const needsReview = gradedAnswers.some((a) => a.isCorrect === null);

    const updated = await ClassroomSubmission.findByIdAndUpdate(
      submission._id,
      {
        $set: {
          answers: gradedAnswers,
          score,
          totalPoints,
          percentage: Math.round(percentage * 100) / 100,
          status: needsReview ? "pending_review" : "graded",
          submittedAt: new Date(),
          gradedAt: needsReview ? undefined : new Date(),
          timeSpent: timeSpent || 0,
        },
      },
      { new: true }
    );

    return NextResponse.json(
      {
        success: true,
        data: {
          submissionId: updated!._id.toString(),
          score,
          totalPoints,
          percentage: updated!.percentage,
          status: updated!.status,
          needsReview,
        },
        message: "Assessment submitted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error submitting assessment:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to submit assessment" } },
      { status: 500 }
    );
  }
}

import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import Assessment from "@/database/assessment.model";
import dbConnect from "@/lib/mongoose";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const { assessmentId, answers } = await req.json();

    if (!assessmentId || !answers) {
      return NextResponse.json(
        { error: "Missing assessmentId or answers" },
        { status: 400 }
      );
    }

    // Fetch assessment
    const assessment = await Assessment.findById(assessmentId);
    if (!assessment) {
      return NextResponse.json(
        { error: "Assessment not found" },
        { status: 404 }
      );
    }

    // Verify ownership
    if (assessment.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Calculate score and update answers
    let correctCount = 0;

    assessment.questions.forEach((question) => {
      const userAnswer = answers[question.questionId];
      question.userAnswer = userAnswer;
      question.isCorrect = userAnswer === question.correctAnswer;
      if (question.isCorrect) correctCount++;
    });

    assessment.score = Math.round(
      (correctCount / assessment.totalQuestions) * 100
    );

    await assessment.save();

    return NextResponse.json({
      success: true,
      data: {
        score: assessment.score,
        totalQuestions: assessment.totalQuestions,
        correctAnswers: correctCount,
        questions: assessment.questions,
      },
    });
  } catch (error) {
    console.error("Submit answers error:", error);
    return NextResponse.json(
      { error: "Failed to submit answers" },
      { status: 500 }
    );
  }
}

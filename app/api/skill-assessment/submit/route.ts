import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import { SkillEvaluation } from "@/database";
import dbConnect from "@/lib/mongoose";
import { SubmitAnswersResponse, AssessmentQuestion } from "@/types/global";

// Helper to safely parse numbers with possible units (e.g. "12.5 V")
function toNumberSafe(value: any): number | null {
  if (value === null || value === undefined) return null;
  const asString = String(value)
    .replace(/,/g, "")
    .replace(/[^\d.+-eE]/g, "");
  if (!asString) return null;
  const num = Number(asString);
  return Number.isNaN(num) ? null : num;
}

export async function POST(
  req: NextRequest
): Promise<NextResponse<SubmitAnswersResponse>> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized - Please login" },
        { status: 401 }
      );
    }

    await dbConnect();

    let body: any;
    try {
      body = await req.json();
    } catch (parseError) {
      console.error("[SUBMIT] Failed to parse JSON:", parseError);
      return NextResponse.json(
        { success: false, error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    const { assessmentId, answers } = body;

    if (!assessmentId) {
      return NextResponse.json(
        { success: false, error: "Missing assessmentId" },
        { status: 400 }
      );
    }

    if (!answers || Object.keys(answers).length === 0) {
      return NextResponse.json(
        { success: false, error: "Missing or empty answers object" },
        { status: 400 }
      );
    }

    const assessment = await SkillEvaluation.findById(assessmentId);

    if (!assessment) {
      return NextResponse.json(
        { success: false, error: "Assessment not found" },
        { status: 404 }
      );
    }

    if (assessment.userId.toString() !== session.user.id) {
      console.error(
        `[SUBMIT] Unauthorized - Different user. DB: ${assessment.userId}, Session: ${session.user.id}`
      );
      return NextResponse.json(
        { success: false, error: "Unauthorized - Not your assessment" },
        { status: 403 }
      );
    }

    let correctCount = 0;
    const processedQuestions: AssessmentQuestion[] = [];

    assessment.questions.forEach((question: any, index: number) => {
      try {
        const questionIdStr = question.questionId.toString();
        const userAnswerRaw = answers[questionIdStr];

        let userAnswerStored: any = null;
        let isCorrect = false;

        if (
          question.questionType === "mcq" ||
          question.questionType === "pseudo_mcq" ||
          question.questionType === "aptitude" ||
          question.questionType === "reasoning"
        ) {
          const userAnswerNum =
            userAnswerRaw !== null && userAnswerRaw !== undefined
              ? Number(userAnswerRaw)
              : null;
          const correctAnswerNum =
            question.correctAnswer !== null &&
            question.correctAnswer !== undefined
              ? Number(question.correctAnswer)
              : null;

          if (userAnswerNum === null || Number.isNaN(userAnswerNum)) {
            console.warn(`     [MCQ] Invalid answer: ${userAnswerRaw}`);
          }

          isCorrect =
            userAnswerNum !== null &&
            !Number.isNaN(userAnswerNum) &&
            correctAnswerNum !== null &&
            !Number.isNaN(correctAnswerNum) &&
            userAnswerNum === correctAnswerNum;

          userAnswerStored = userAnswerNum;
        } else if (
          question.questionType === "descriptive" ||
          question.questionType === "circuit_math"
        ) {
          userAnswerStored = userAnswerRaw;

          if (question.questionType === "circuit_math") {
            const userNum = toNumberSafe(userAnswerRaw);
            const expectedNum = toNumberSafe(question.expectedAnswer);

            if (userNum !== null && expectedNum !== null) {
              const tolerance = 1e-2;
              isCorrect = Math.abs(userNum - expectedNum) <= tolerance;
            } else if (
              typeof userAnswerRaw === "string" &&
              typeof question.expectedAnswer === "string"
            ) {
              const normUser = userAnswerRaw.trim().toLowerCase();
              const normExpected = question.expectedAnswer.trim().toLowerCase();
              isCorrect = normUser === normExpected;
            }
          } else if (question.questionType === "descriptive") {
            if (
              typeof userAnswerRaw === "string" &&
              Array.isArray(question.expectedKeywords) &&
              question.expectedKeywords.length > 0
            ) {
              const userText = userAnswerRaw.toLowerCase();
              const matches = question.expectedKeywords.filter((kw: string) =>
                userText.includes(kw.toLowerCase())
              );
              const ratio = matches.length / question.expectedKeywords.length;
              isCorrect = ratio >= 0.3;
            }
          }
        } else {
          console.warn(`     Unknown questionType "${question.questionType}"`);
          userAnswerStored = userAnswerRaw;
        }

        question.userAnswer = userAnswerStored;
        question.isCorrect = isCorrect;

        if (isCorrect) {
          correctCount++;
        }

        processedQuestions.push({
          questionId: questionIdStr,
          question: question.question,
          skill: question.skill,
          questionType: question.questionType,
          options: question.options,
          userAnswer: userAnswerStored,
          correctAnswer: question.correctAnswer,
          expectedAnswer: question.expectedAnswer,
          evaluationCriteria: question.evaluationCriteria,
          expectedKeywords: question.expectedKeywords,
          isCorrect: isCorrect,
        });
      } catch (qError) {
        console.error(`Error processing Q${index + 1}:`, qError);
        question.isCorrect = false;
        processedQuestions.push({
          questionId: question.questionId.toString(),
          question: question.question,
          skill: question.skill,
          questionType: question.questionType,
          options: question.options,
          userAnswer: null,
          correctAnswer: question.correctAnswer,
          isCorrect: false,
        });
      }
    });

    const score = Math.round((correctCount / assessment.totalQuestions) * 100);
    assessment.score = score;
    assessment.completedAt = new Date();

    await assessment.save();

    const response: SubmitAnswersResponse = {
      success: true,
      data: {
        score,
        totalQuestions: assessment.totalQuestions,
        correctAnswers: correctCount,
        questions: processedQuestions,
      },
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";

    return NextResponse.json(
      {
        success: false,
        error: "Failed to submit assessment",
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}

import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import Assessment from "@/database/assessment.model";
import dbConnect from "@/lib/mongoose";

export async function POST(req: NextRequest) {
  try {
    console.log("📨 [SUBMIT] Starting submission handler...");

    // ✅ STEP 1: Check authentication
    console.log("🔐 [SUBMIT] Verifying session...");
    const session = await auth();
    
    if (!session?.user?.id) {
      console.error("❌ [SUBMIT] Unauthorized - No session");
      return NextResponse.json(
        { success: false, error: "Unauthorized - Please login" },
        { status: 401 }
      );
    }

    console.log(`✅ [SUBMIT] User authenticated: ${session.user.id}`);

    // ✅ STEP 2: Connect to database
    console.log("📡 [SUBMIT] Connecting to database...");
    await dbConnect();
    console.log("✅ [SUBMIT] Database connected");

    // ✅ STEP 3: Parse request body
    console.log("📦 [SUBMIT] Parsing request body...");
    let body;
    try {
      body = await req.json();
    } catch (parseError) {
      console.error("❌ [SUBMIT] Failed to parse JSON:", parseError);
      return NextResponse.json(
        { success: false, error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    const { assessmentId, answers } = body;

    console.log("📋 [SUBMIT] Request payload:");
    console.log(`   assessmentId: ${assessmentId}`);
    console.log(`   answers keys: ${answers ? Object.keys(answers).join(", ") : "null"}`);
    console.log(`   answers values: ${answers ? Object.values(answers).join(", ") : "null"}`);
    console.log(`   answers count: ${answers ? Object.keys(answers).length : 0}`);

    // ✅ STEP 4: Validate inputs
    console.log("✔️ [SUBMIT] Validating inputs...");
    if (!assessmentId) {
      console.error("❌ [SUBMIT] Missing assessmentId");
      return NextResponse.json(
        { success: false, error: "Missing assessmentId" },
        { status: 400 }
      );
    }

    if (!answers || Object.keys(answers).length === 0) {
      console.error("❌ [SUBMIT] Missing or empty answers");
      return NextResponse.json(
        { success: false, error: "Missing or empty answers object" },
        { status: 400 }
      );
    }

    // ✅ STEP 5: Fetch assessment from database
    console.log(`🔍 [SUBMIT] Fetching assessment with ID: ${assessmentId}`);
    const assessment = await Assessment.findById(assessmentId);

    if (!assessment) {
      console.error(`❌ [SUBMIT] Assessment not found: ${assessmentId}`);
      return NextResponse.json(
        { success: false, error: "Assessment not found" },
        { status: 404 }
      );
    }

    console.log(`✅ [SUBMIT] Assessment found`);
    console.log(`   Total questions: ${assessment.totalQuestions}`);
    console.log(
      `   Questions: ${assessment.questions.map((q: any) => `id=${q.questionId}, correct=${q.correctAnswer}`).join(" | ")}`
    );

    // ✅ STEP 6: Verify ownership
    console.log(`🔒 [SUBMIT] Verifying ownership...`);
    if (assessment.userId.toString() !== session.user.id) {
      console.error(
        `❌ [SUBMIT] Unauthorized - Different user. DB: ${assessment.userId}, Session: ${session.user.id}`
      );
      return NextResponse.json(
        { success: false, error: "Unauthorized - Not your assessment" },
        { status: 403 }
      );
    }

    console.log("✅ [SUBMIT] Ownership verified");

    // ✅ STEP 7: Process answers and calculate score
    console.log("\n🔄 [SUBMIT] Processing answers...");

    let correctCount = 0;
    const processedQuestions = [];

    assessment.questions.forEach((question: any, index: number) => {
      try {
        // Convert questionId to string for matching with answers keys
        const questionIdStr = question.questionId.toString();
        const userAnswer = answers[questionIdStr];

        console.log(`\n   Q${index + 1} Debug:`);
        console.log(`     questionId (DB): ${question.questionId}`);
        console.log(`     questionId (string): ${questionIdStr}`);
        console.log(`     userAnswer from answers[${questionIdStr}]: ${userAnswer}`);

        // Convert to numbers for proper comparison
        const userAnswerNum =
          userAnswer !== null && userAnswer !== undefined
            ? Number(userAnswer)
            : null;
        const correctAnswerNum = Number(question.correctAnswer);

        console.log(`     userAnswerNum: ${userAnswerNum} (type: ${typeof userAnswerNum})`);
        console.log(`     correctAnswerNum: ${correctAnswerNum} (type: ${typeof correctAnswerNum})`);

        // Check for NaN
        if (isNaN(userAnswerNum)) {
          console.warn(
            `     ⚠️ WARNING: userAnswer is NaN. Original value: ${userAnswer}`
          );
        }

        const isCorrect = userAnswerNum === correctAnswerNum;

        console.log(
          `     Result: ${isCorrect ? "✅ CORRECT" : "❌ WRONG"}`
        );

        // Update question object
        question.userAnswer = userAnswerNum;
        question.isCorrect = isCorrect;

        if (isCorrect) {
          correctCount++;
        }

        processedQuestions.push({
          questionId: questionIdStr,
          question: question.question,
          skill: question.skill,
          options: question.options,
          userAnswer: userAnswerNum,
          correctAnswer: correctAnswerNum,
          isCorrect: isCorrect,
        });
      } catch (qError) {
        console.error(`❌ [SUBMIT] Error processing Q${index + 1}:`, qError);
        question.isCorrect = false;
        processedQuestions.push({
          questionId: question.questionId.toString(),
          question: question.question,
          skill: question.skill,
          options: question.options,
          userAnswer: null,
          correctAnswer: question.correctAnswer,
          isCorrect: false,
        });
      }
    });

    // ✅ STEP 8: Calculate final score
    const score = Math.round(
      (correctCount / assessment.totalQuestions) * 100
    );
    assessment.completedAt = new Date();

    console.log(`\n📊 [SUBMIT] Score Calculation:`);
    console.log(`   Correct: ${correctCount}/${assessment.totalQuestions}`);
    console.log(`   Score: ${score}%`);

    // ✅ STEP 9: Save assessment to database
    console.log("\n💾 [SUBMIT] Saving assessment to database...");
    await assessment.save();
    console.log("✅ [SUBMIT] Assessment saved successfully");

    // ✅ STEP 10: Return response
    const response = {
      success: true,
      data: {
        score,
        totalQuestions: assessment.totalQuestions,
        correctAnswers: correctCount,
        questions: processedQuestions,
      },
    };

    console.log("\n✅ [SUBMIT] Returning success response");
    console.log(`   Response: ${JSON.stringify(response, null, 2)}`);

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("❌ [SUBMIT] FATAL ERROR:", error);
    console.error(
      "   Stack:",
      error instanceof Error ? error.stack : "No stack trace"
    );

    // ✅ ENSURE we always return JSON, never HTML
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

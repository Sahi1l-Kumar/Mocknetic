import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import Assessment from "@/database/assessment.model";
import dbConnect from "@/lib/mongoose";

// Helper to safely parse numbers with possible units (e.g. "12.5 V")
function toNumberSafe(value: any): number | null {
  if (value === null || value === undefined) return null;
  const asString = String(value)
    .replace(/,/g, "") // remove thousands separator
    .replace(/[^\d.+-eE]/g, ""); // keep digits, sign, decimal, exponent
  if (!asString) return null;
  const num = Number(asString);
  return Number.isNaN(num) ? null : num;
}

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
    let body: any;
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
    console.log(
      `   answers keys: ${answers ? Object.keys(answers).join(", ") : "null"}`
    );
    console.log(
      `   answers values: ${
        answers ? Object.values(answers).join(", ") : "null"
      }`
    );
    console.log(
      `   answers count: ${answers ? Object.keys(answers).length : 0}`
    );

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
      `   Questions: ${assessment.questions
        .map(
          (q: any) =>
            `id=${q.questionId}, type=${q.questionType}, correct=${q.correctAnswer}`
        )
        .join(" | ")}`
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
    const processedQuestions: any[] = [];

    assessment.questions.forEach((question: any, index: number) => {
      try {
        const questionIdStr = question.questionId.toString();
        const userAnswerRaw = answers[questionIdStr];

        console.log(`\n   Q${index + 1} Debug:`);
        console.log(`     questionId (DB): ${question.questionId}`);
        console.log(`     questionId (string): ${questionIdStr}`);
        console.log(
          `     questionType: ${question.questionType}, raw answer: ${userAnswerRaw}`
        );

        let userAnswerStored: any = null;
        let isCorrect = false;

        // MCQ-like questions: expect numeric option (1–4)
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

          console.log(
            `     [MCQ] userAnswerNum: ${userAnswerNum} (type: ${typeof userAnswerNum})`
          );
          console.log(
            `     [MCQ] correctAnswerNum: ${correctAnswerNum} (type: ${typeof correctAnswerNum})`
          );

          if (userAnswerNum === null || Number.isNaN(userAnswerNum)) {
            console.warn(
              `     ⚠️ [MCQ] userAnswer is invalid/NaN. Original value: ${userAnswerRaw}`
            );
          }

          isCorrect =
            userAnswerNum !== null &&
            !Number.isNaN(userAnswerNum) &&
            correctAnswerNum !== null &&
            !Number.isNaN(correctAnswerNum) &&
            userAnswerNum === correctAnswerNum;

          userAnswerStored = userAnswerNum;
        }
        // Descriptive or circuit_math: store raw answer and do custom grading
        else if (
          question.questionType === "descriptive" ||
          question.questionType === "circuit_math"
        ) {
          console.log(
            `     [NON-MCQ] Treating as free-text/numeric. Raw answer: ${userAnswerRaw}`
          );
          userAnswerStored = userAnswerRaw;

          if (question.questionType === "circuit_math") {
            // Improved numeric comparison against expectedAnswer
            const userNum = toNumberSafe(userAnswerRaw);
            const expectedNum = toNumberSafe(question.expectedAnswer);

            if (userNum !== null && expectedNum !== null) {
              const tolerance = 1e-2; // more relaxed tolerance
              isCorrect = Math.abs(userNum - expectedNum) <= tolerance;
              console.log(
                `     [CIRCUIT] userNum=${userNum}, expectedNum=${expectedNum}, tol=${tolerance}, isCorrect=${isCorrect}`
              );
            } else if (
              typeof userAnswerRaw === "string" &&
              typeof question.expectedAnswer === "string"
            ) {
              // Fallback string comparison
              const normUser = userAnswerRaw.trim().toLowerCase();
              const normExpected = question.expectedAnswer.trim().toLowerCase();
              isCorrect = normUser === normExpected;
              console.log(
                `     [CIRCUIT] fallback string compare: "${normUser}" vs "${normExpected}", isCorrect=${isCorrect}`
              );
            } else {
              console.log(
                `     [CIRCUIT] Cannot grade (both numeric and string comparison failed)`
              );
            }
          } else if (question.questionType === "descriptive") {
            // Keyword overlap grading using expectedKeywords
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
              isCorrect = ratio >= 0.3; // example rule
              console.log(
                `     [DESC] matched ${matches.length}/${question.expectedKeywords.length} keywords, ratio=${ratio}, isCorrect=${isCorrect}`
              );
            } else {
              console.log(
                `     [DESC] No expectedKeywords or non-string answer; skipping auto-grading`
              );
            }
          }
        } else {
          // Fallback for unknown questionType
          console.warn(
            `     ⚠️ Unknown questionType "${question.questionType}", storing raw answer only`
          );
          userAnswerStored = userAnswerRaw;
        }

        console.log(
          `     Result: ${isCorrect ? "✅ CORRECT" : "❌ WRONG / NOT GRADED"}`
        );

        // Update question object
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
          isCorrect: isCorrect,
        });
      } catch (qError) {
        console.error(`❌ [SUBMIT] Error processing Q${index + 1}:`, qError);
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

    // ✅ STEP 8: Calculate final score
    const score = Math.round((correctCount / assessment.totalQuestions) * 100);
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

import { NextRequest, NextResponse } from "next/server";
import { requireStudent } from "@/lib/auth-helpers";
import dbConnect from "@/lib/mongoose";
import ClassroomAssessment from "@/database/classroom/classroom-assessment.model";
import ClassroomSubmission from "@/database/classroom/classroom-submission.model";
import { groq } from "@ai-sdk/groq";
import { generateText } from "ai";

interface GeneratedQuestion {
  questionNumber: number;
  questionType: "mcq" | "descriptive" | "numerical";
  questionText: string;
  options?: string[];
  correctAnswer?: string | number | string[];
  points: number;
  topic?: string;
  explanation?: string;
  expectedAnswer?: string;
  evaluationCriteria?: string;
  expectedKeywords?: string[];
}

export async function POST(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { error, user } = await requireStudent();
    if (error) return error;

    const params = await props.params;
    const assessmentId = params.id;
    const studentId = user.id;

    await dbConnect();

    const assessment = await ClassroomAssessment.findById(assessmentId);

    if (!assessment) {
      return NextResponse.json(
        { success: false, error: { message: "Assessment not found" } },
        { status: 404 }
      );
    }

    if (!assessment.isPublished) {
      return NextResponse.json(
        { success: false, error: { message: "Assessment not published yet" } },
        { status: 403 }
      );
    }

    // ✅ Try to find existing submission again to handle race condition
    const existingSubmission = (await ClassroomSubmission.findOne({
      assessmentId: assessmentId,
      studentId: studentId,
    }).lean()) as any;

    if (existingSubmission) {
      // ✅ If questions already generated, return them
      if (
        existingSubmission.questions &&
        existingSubmission.questions.length > 0
      ) {
        const formattedQuestions = existingSubmission.questions.map(
          (q: any) => ({
            _id: `${existingSubmission._id}_q${q.questionNumber}`,
            questionNumber: q.questionNumber,
            questionText: q.questionText,
            questionType: q.questionType,
            options: q.options || [],
            points: q.points,
            difficulty: q.difficulty,
            topic: q.topic,
          })
        );

        return NextResponse.json({
          success: true,
          data: formattedQuestions,
          message: "Questions already generated",
        });
      }

      await ClassroomSubmission.findByIdAndDelete(existingSubmission._id);
    }

    // Generate questions using Groq AI
    const questions = await generateClassroomQuestions(assessment);

    // Calculate total points
    const totalPoints = questions.reduce(
      (sum: number, q: any) => sum + (q.points || 1),
      0
    );

    // ✅ Use findOneAndUpdate with upsert to prevent race condition
    try {
      const submission = await ClassroomSubmission.findOneAndUpdate(
        {
          assessmentId: assessmentId,
          studentId: studentId,
        },
        {
          $setOnInsert: {
            assessmentId: assessmentId,
            studentId: studentId,
            classroomId: assessment.classroomId,
            questions: questions,
            answers: [],
            score: 0,
            totalPoints,
            percentage: 0,
            status: "in_progress",
            startedAt: new Date(),
          },
        },
        {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true,
        }
      );

      // Format for frontend (hide correct answers)
      const formattedQuestions = questions.map((q: any) => ({
        _id: `${submission._id}_q${q.questionNumber}`,
        questionNumber: q.questionNumber,
        questionText: q.questionText,
        questionType: q.questionType,
        options: q.options || [],
        points: q.points,
        difficulty: q.difficulty,
        topic: q.topic,
      }));

      return NextResponse.json({
        success: true,
        data: formattedQuestions,
        message: "Questions generated successfully",
      });
    } catch (duplicateError: any) {
      if (duplicateError.code === 11000) {
        const existing = (await ClassroomSubmission.findOne({
          assessmentId: assessmentId,
          studentId: studentId,
        }).lean()) as any;

        if (existing && existing.questions && existing.questions.length > 0) {
          const formattedQuestions = existing.questions.map((q: any) => ({
            _id: `${existing._id}_q${q.questionNumber}`,
            questionNumber: q.questionNumber,
            questionText: q.questionText,
            questionType: q.questionType,
            options: q.options || [],
            points: q.points,
            difficulty: q.difficulty,
            topic: q.topic,
          }));

          return NextResponse.json({
            success: true,
            data: formattedQuestions,
            message: "Questions already generated",
          });
        }
      }

      throw duplicateError;
    }
  } catch (error: any) {
    console.error("Error generating questions:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Failed to generate questions";

    return NextResponse.json(
      { success: false, error: { message: errorMessage } },
      { status: 500 }
    );
  }
}

// Generate questions using Groq AI
async function generateClassroomQuestions(assessment: any): Promise<any[]> {
  const { questionConfig, curriculum, difficulty, totalQuestions, title } =
    assessment;

  const prompt = `You are a strict JSON generator and expert educator creating an assessment titled "${title}".

Generate EXACTLY ${totalQuestions} unique, high-quality questions based on this curriculum:

${curriculum}

QUESTION DISTRIBUTION (MUST follow exactly):
- ${questionConfig.mcq} Multiple Choice Questions (MCQ)
- ${questionConfig.descriptive} Descriptive/Short Answer Questions
- ${questionConfig.numerical} Numerical Answer Questions

Difficulty Level: ${difficulty}

STRICT RULES:
1. MCQ questions MUST have exactly 4 options
2. For MCQ: correctAnswer must be 1, 2, 3, or 4 (option number)
3. For descriptive: provide expectedAnswer, evaluationCriteria, and expectedKeywords (12-20 keywords)
4. For numerical: provide the numeric correctAnswer and explanation
5. Questions must be clear, unambiguous, and test understanding
6. Vary difficulty within the "${difficulty}" level
7. Cover different topics from the curriculum
8. Use real-world scenarios where applicable
9. Each question worth 1 point by default
10. IMPORTANT: Use simple text only. Avoid special characters like quotes, apostrophes, or backslashes in questions and options. Use simple punctuation.

Return ONLY valid JSON (no markdown, no code blocks, no extra text):

{
  "questions": [
    {
      "questionNumber": 1,
      "questionType": "mcq",
      "questionText": "Question text here",
      "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
      "correctAnswer": 2,
      "points": 1,
      "topic": "Topic name",
      "explanation": "Why this answer is correct"
    }
  ]
}`;

  try {
    const { text: response } = await generateText({
      model: groq("llama-3.3-70b-versatile"),
      prompt,
      temperature: 0.7,
    });

    let cleanedResponse = response.trim();

    cleanedResponse = cleanedResponse.replace(/```json\s*/g, "");
    cleanedResponse = cleanedResponse.replace(/```\s*/g, "");

    let jsonText = cleanedResponse;
    const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonText = jsonMatch[0];
    }

    try {
      // Replace smart quotes with regular quotes
      jsonText = jsonText.replace(/[""]/g, '"');
      jsonText = jsonText.replace(/['']/g, "'");

      // Fix escaped newlines
      jsonText = jsonText.replace(/\n/g, " ");
      jsonText = jsonText.replace(/\r/g, " ");

      // Remove any trailing commas before closing brackets
      jsonText = jsonText.replace(/,(\s*[}\]])/g, "$1");
    } catch (cleanError) {
      console.error("Error cleaning JSON:", cleanError);
    }

    let parsed: { questions: GeneratedQuestion[] } | null = null;

    try {
      parsed = JSON.parse(jsonText);
    } catch (parseError) {
      console.error("❌ JSON Parse Error:", parseError);
      console.error(
        "📄 Failed JSON (first 500 chars):",
        jsonText.substring(0, 500)
      );

      try {
        // Remove any control characters
        jsonText = jsonText.replace(/[\x00-\x1F\x7F]/g, " ");
        parsed = JSON.parse(jsonText);
      } catch (secondError) {
        throw new Error(
          `Failed to parse AI response as JSON. Original error: ${parseError}. Response preview: ${response.substring(0, 200)}`
        );
      }
    }

    if (!parsed?.questions || !Array.isArray(parsed.questions)) {
      throw new Error("Invalid questions structure in AI response");
    }

    if (parsed.questions.length === 0) {
      throw new Error("No questions generated by AI");
    }

    return parsed.questions.map((q, idx) => {
      const questionNumber = q.questionNumber || idx + 1;

      // Validate question type
      if (!["mcq", "descriptive", "numerical"].includes(q.questionType)) {
        console.warn(
          `⚠️ Invalid question type "${q.questionType}" at question ${questionNumber}, defaulting to "descriptive"`
        );
        q.questionType = "descriptive";
      }

      const base = {
        questionNumber,
        questionText: q.questionText || `Question ${questionNumber}`,
        questionType: q.questionType,
        points: q.points || 1,
        difficulty: difficulty,
        topic: q.topic || "General",
      };

      if (q.questionType === "mcq") {
        // Validate MCQ has 4 options
        if (!Array.isArray(q.options) || q.options.length !== 4) {
          console.warn(
            `⚠️ MCQ question ${questionNumber} has ${q.options?.length || 0} options, expected 4`
          );
          // Pad with generic options if needed
          const options = q.options || [];
          while (options.length < 4) {
            options.push(`Option ${options.length + 1}`);
          }
          q.options = options.slice(0, 4);
        }

        // Validate correctAnswer is 1-4
        const correctAnswer =
          typeof q.correctAnswer === "number" ? q.correctAnswer : 1;
        if (correctAnswer < 1 || correctAnswer > 4) {
          console.warn(
            `⚠️ MCQ question ${questionNumber} has invalid correctAnswer ${correctAnswer}, defaulting to 1`
          );
          q.correctAnswer = 1;
        }

        return {
          ...base,
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation || "",
        };
      }

      if (q.questionType === "descriptive") {
        return {
          ...base,
          correctAnswer: Array.isArray(q.expectedKeywords)
            ? q.expectedKeywords
            : [],
          explanation: q.evaluationCriteria || q.explanation || "",
        };
      }

      // numerical
      return {
        ...base,
        correctAnswer: q.correctAnswer || 0,
        explanation: q.explanation || "",
      };
    });
  } catch (error) {
    console.error("❌ Question generation error:", error);
    throw new Error(
      `Failed to generate questions: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { requireStudent } from "@/lib/auth-helpers";
import dbConnect from "@/lib/mongoose";
import ClassroomAssessment from "@/database/classroom/classroom-assessment.model";
import ClassroomQuestion from "@/database/classroom/classroom-question.model";
import ClassroomSubmission from "@/database/classroom/classroom-submission.model";
import { groq } from "@ai-sdk/groq";
import { generateText } from "ai";

interface GeneratedQuestion {
  questionNumber: number;
  questionType: "mcq" | "descriptive" | "numerical";
  questionText: string;
  options?: string[];
  correctAnswer?: string | number;
  points: number;
  topic?: string;
  explanation?: string;
  expectedAnswer?: string;
  evaluationCriteria?: string;
  expectedKeywords?: string[];
}

// POST /api/student/assessment/:id/generate - Generate unique questions for student
export async function POST(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { error, user } = await requireStudent();
    if (error) return error;

    const params = await props.params;
    const assessmentId = params.id; // ✅ Store assessmentId
    const studentId = user.id; // ✅ Store studentId

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

    // Check if questions already generated
    const existingQuestions = await ClassroomQuestion.countDocuments({
      assessmentId: assessmentId,
      studentId: studentId,
    });

    if (existingQuestions > 0) {
      // Questions exist, just fetch and return them
      const questions = await ClassroomQuestion.find({
        assessmentId: assessmentId,
        studentId: studentId,
      })
        .sort({ questionNumber: 1 })
        .lean();

      const formattedQuestions = questions.map((q: any) => ({
        _id: q._id.toString(),
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

    // Check if student already has a submission
    const existingSubmission = await ClassroomSubmission.findOne({
      assessmentId: assessmentId,
      studentId: studentId,
    });

    if (existingSubmission) {
      return NextResponse.json(
        {
          success: false,
          error: { message: "You have already attempted this assessment" },
        },
        { status: 400 }
      );
    }

    // Generate questions using Groq AI
    const questions = await generateClassroomQuestions(
      assessment,
      studentId.toString()
    );

    // Save questions to database
    const savedQuestions = await ClassroomQuestion.insertMany(questions);

    // Calculate total points
    const totalPoints = savedQuestions.reduce(
      (sum: number, q: any) => sum + (q.points || 1),
      0
    );

    // Create submission record
    await ClassroomSubmission.create({
      assessmentId: assessmentId,
      studentId: studentId,
      classroomId: assessment.classroomId,
      status: "in_progress",
      answers: [],
      score: 0,
      totalPoints,
      percentage: 0,
      startedAt: new Date(),
    });

    // Format for frontend (hide correct answers)
    const formattedQuestions = savedQuestions.map((q: any) => ({
      _id: q._id.toString(),
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
  } catch (error: any) {
    console.error("Error generating questions:", error);

    // ✅ Handle duplicate key error gracefully - use stored variables
    if (error.code === 11000) {
      try {
        // Get params again in catch block
        const params = await props.params;
        const { error: authError, user } = await requireStudent();

        if (authError || !user) {
          return NextResponse.json(
            { success: false, error: { message: "Unauthorized" } },
            { status: 401 }
          );
        }

        const questions = await ClassroomQuestion.find({
          assessmentId: params.id,
          studentId: user.id,
        })
          .sort({ questionNumber: 1 })
          .lean();

        const formattedQuestions = questions.map((q: any) => ({
          _id: q._id.toString(),
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
      } catch (fetchError) {
        console.error("Error fetching existing questions:", fetchError);
      }
    }

    const errorMessage =
      error instanceof Error ? error.message : "Failed to generate questions";

    return NextResponse.json(
      { success: false, error: { message: errorMessage } },
      { status: 500 }
    );
  }
}

// Generate questions using Groq AI
async function generateClassroomQuestions(
  assessment: any,
  studentId: string
): Promise<any[]> {
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
2. For MCQ: correctAnswer must be 1, 2, 3, or 4 (option number, NOT the text)
3. For descriptive: provide expectedAnswer, evaluationCriteria, and expectedKeywords (12-20 keywords)
4. For numerical: provide the numeric correctAnswer and explanation
5. Questions must be clear, unambiguous, and test understanding
6. Vary difficulty within the "${difficulty}" level
7. Cover different topics from the curriculum
8. Use real-world scenarios where applicable
9. Each question worth 1 point by default (you can adjust for harder questions)

Return ONLY valid JSON (no markdown, no extra text):

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
    },
    {
      "questionNumber": 2,
      "questionType": "descriptive",
      "questionText": "Explain...",
      "points": 2,
      "topic": "Topic name",
      "expectedAnswer": "2-3 line ideal answer",
      "evaluationCriteria": "How to grade: point 1, point 2, etc.",
      "expectedKeywords": ["keyword1", "keyword2", "keyword15"]
    },
    {
      "questionNumber": 3,
      "questionType": "numerical",
      "questionText": "Calculate...",
      "correctAnswer": 42,
      "points": 1,
      "topic": "Topic name",
      "explanation": "How to arrive at this answer"
    }
  ]
}`;

  try {
    const { text: response } = await generateText({
      model: groq("llama-3.3-70b-versatile"),
      prompt,
      temperature: 0.8,
    });

    let parsed: { questions: GeneratedQuestion[] } | null = null;

    try {
      parsed = JSON.parse(response);
    } catch {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No valid JSON found in response");
      }
    }

    if (!parsed || !parsed.questions || !Array.isArray(parsed.questions)) {
      throw new Error("Invalid questions structure");
    }

    if (parsed.questions.length === 0) {
      throw new Error("No questions generated");
    }

    const formattedQuestions = parsed.questions.map((q, idx) => {
      const questionNumber = q.questionNumber || idx + 1;

      if (!["mcq", "descriptive", "numerical"].includes(q.questionType)) {
        throw new Error(
          `Invalid questionType "${q.questionType}" at question ${questionNumber}`
        );
      }

      const baseQuestion = {
        assessmentId: assessment._id,
        studentId: studentId,
        questionNumber,
        questionText: q.questionText,
        questionType: q.questionType,
        points: q.points || 1,
        difficulty: difficulty,
        topic: q.topic,
      };

      if (q.questionType === "mcq") {
        if (!Array.isArray(q.options) || q.options.length !== 4) {
          throw new Error(`MCQ question ${questionNumber} must have 4 options`);
        }

        if (
          typeof q.correctAnswer !== "number" ||
          q.correctAnswer < 1 ||
          q.correctAnswer > 4
        ) {
          throw new Error(
            `MCQ question ${questionNumber} correctAnswer must be 1-4`
          );
        }

        return {
          ...baseQuestion,
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
        };
      }

      if (q.questionType === "descriptive") {
        return {
          ...baseQuestion,
          expectedAnswer: q.expectedAnswer,
          explanation: q.evaluationCriteria,
          correctAnswer: q.expectedKeywords || [],
        };
      }

      if (q.questionType === "numerical") {
        return {
          ...baseQuestion,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
        };
      }

      return baseQuestion;
    });

    if (formattedQuestions.length !== totalQuestions) {
      console.warn(
        `Expected ${totalQuestions} questions but got ${formattedQuestions.length}`
      );
    }

    return formattedQuestions;
  } catch (error) {
    console.error("Question generation error:", error);
    throw error;
  }
}

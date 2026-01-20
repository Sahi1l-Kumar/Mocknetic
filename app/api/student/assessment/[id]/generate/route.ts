import { NextRequest, NextResponse } from "next/server";
import { requireStudent } from "@/lib/auth-helpers";
import dbConnect from "@/lib/mongoose";
import ClassroomAssessment from "@/database/classroom/classroom-assignment.model";
import ClassroomSubmission from "@/database/classroom/classroom-submission.model";
import { groq } from "@ai-sdk/groq";
import { generateText } from "ai";
import { assignFairQuestions } from "@/lib/questionFairness";

interface GeneratedQuestion {
  questionNumber: number;
  questionType: "mcq" | "numerical";
  questionText: string;
  options?: string[];
  correctAnswer?: string | number | string[];
  points: number;
  topic?: string;
  explanation?: string;
  bloomsLevel?: number;
  equationContent?: {
    latex: string;
    description: string;
    position: "inline" | "display";
  };
}

export async function POST(
  request: NextRequest,
  props: { params: Promise<{ id: string }> },
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
        { status: 404 },
      );
    }

    if (!assessment.isPublished) {
      return NextResponse.json(
        { success: false, error: { message: "Assessment not published yet" } },
        { status: 403 },
      );
    }

    // Check for existing submission
    const existingSubmission = (await ClassroomSubmission.findOne({
      assessmentId: assessmentId,
      studentId: studentId,
    }).lean()) as any;

    if (existingSubmission?.questions?.length > 0) {
      const formattedQuestions = existingSubmission.questions.map((q: any) => ({
        _id: `${existingSubmission._id}_q${q.questionNumber}`,
        questionNumber: q.questionNumber,
        questionText: q.questionText,
        questionType: q.questionType,
        options: q.options || [],
        points: q.points,
        topic: q.topic,
        equationContent: q.equationContent,
        bloomsLevel: q.bloomsLevel,
      }));

      return NextResponse.json({
        success: true,
        data: formattedQuestions,
        message: "Questions already generated",
      });
    }

    if (existingSubmission) {
      await ClassroomSubmission.findByIdAndDelete(existingSubmission._id);
    }

    let enrichedContext = assessment.enrichedCurriculumContent;

    if (!enrichedContext) {
      console.warn(
        "No pre-enriched content found. This shouldn't happen if published correctly.",
      );

      // Fallback: Use raw curriculum if enrichment failed during publish
      enrichedContext = `# Curriculum\n${assessment.curriculum}\n\nNote: This assessment uses AI-generated context only.`;
    } else {
    }

    // Generate questions using pre-enriched content (FAST!)
    const questions = await generateUniversityLevelQuestions(
      assessment,
      enrichedContext,
    );

    const totalPoints = questions.reduce(
      (sum: number, q: any) => sum + (q.points || 1),
      0,
    );

    // Use fair question assignment if variants exist
    let assignedQuestions = questions;
    if (assessment.questionVariants?.length > 0) {
      assignedQuestions = await assignFairQuestions(
        assessment,
        studentId,
        questions,
      );
    }

    const submission = await ClassroomSubmission.create({
      assessmentId: assessmentId,
      studentId: studentId,
      classroomId: assessment.classroomId,
      questions: assignedQuestions,
      answers: [],
      score: 0,
      totalPoints,
      percentage: 0,
      status: "in_progress",
      startedAt: new Date(),
    });

    const formattedQuestions = assignedQuestions.map((q: any) => ({
      _id: `${submission._id}_q${q.questionNumber}`,
      questionNumber: q.questionNumber,
      questionText: q.questionText,
      questionType: q.questionType,
      options: q.options || [],
      points: q.points,
      bloomsLevel: q.bloomsLevel,
      topic: q.topic,
      equationContent: q.equationContent,
    }));

    return NextResponse.json({
      success: true,
      data: formattedQuestions,
      message: "Questions generated successfully",
    });
  } catch (error: any) {
    console.error("Error generating questions:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to generate questions";

    return NextResponse.json(
      { success: false, error: { message: errorMessage } },
      { status: 500 },
    );
  }
}

async function generateUniversityLevelQuestions(
  assessment: any,
  enrichedContext: string,
): Promise<GeneratedQuestion[]> {
  const { questionConfig, curriculum, difficulty, title, cognitiveLevel } =
    assessment;

  const totalQuestions = questionConfig.mcq + questionConfig.numerical;
  const questionsPerBatch = 5;
  const numBatches = Math.ceil(totalQuestions / questionsPerBatch);

  let allQuestions: GeneratedQuestion[] = [];
  const seenQuestionTexts = new Set<string>();

  for (let batch = 0; batch < numBatches; batch++) {
    const questionsInBatch = Math.min(
      questionsPerBatch,
      totalQuestions - batch * questionsPerBatch,
    );

    const batchQuestions = await generateQuestionBatchWithRetry(
      {
        title,
        curriculum,
        difficulty,
        cognitiveLevel,
        questionsInBatch,
        enrichedContext,
        questionConfig,
        previousQuestions: allQuestions,
      },
      batch + 1,
      numBatches,
      3,
    );

    const uniqueQuestions = batchQuestions.filter((q) => {
      const normalizedText = q.questionText.toLowerCase().trim();
      if (seenQuestionTexts.has(normalizedText)) {
        console.warn(
          `⚠️ Duplicate detected: "${q.questionText.substring(0, 50)}..."`,
        );
        return false;
      }
      seenQuestionTexts.add(normalizedText);
      return true;
    });

    allQuestions = [...allQuestions, ...uniqueQuestions];
  }

  const validatedQuestions = validateGeneratedQuestions(allQuestions);

  return validatedQuestions.map((q, idx) => ({
    ...q,
    questionNumber: idx + 1,
  }));
}

// Retry wrapper for question generation
async function generateQuestionBatchWithRetry(
  config: any,
  batchNumber: number,
  totalBatches: number,
  maxRetries: number = 3,
): Promise<GeneratedQuestion[]> {
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await generateQuestionBatch(config, batchNumber, totalBatches);
    } catch (error) {
      console.error(`Attempt ${attempt} failed:`, error);
      lastError = error;

      if (attempt < maxRetries) {
        // Exponential backoff
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
      }
    }
  }

  throw new Error(`Failed after ${maxRetries} attempts: ${lastError}`);
}

// Validation function
function validateGeneratedQuestions(
  questions: GeneratedQuestion[],
): GeneratedQuestion[] {
  return questions
    .map((q) => {
      // Validate numerical questions have numeric answers
      if (q.questionType === "numerical") {
        const numAnswer = parseFloat(q.correctAnswer as any);

        if (isNaN(numAnswer)) {
          console.warn(
            `Invalid numerical answer for question ${q.questionNumber}: ${q.correctAnswer}`,
          );
          console.warn("Converting to MCQ");

          // Convert to MCQ with answer as an option
          return {
            ...q,
            questionType: "mcq" as const,
            options: [
              String(q.correctAnswer),
              "Cannot be determined",
              "Insufficient information",
              "None of the above",
            ],
            correctAnswer: String(q.correctAnswer),
          };
        }

        // Ensure correctAnswer is a number
        q.correctAnswer = numAnswer;
      }

      // Validate MCQ has sufficient options
      if (q.questionType === "mcq") {
        if (!q.options || q.options.length < 2) {
          console.error(
            `MCQ question ${q.questionNumber} has insufficient options`,
          );
          return null;
        }

        // Ensure correct answer is in options
        const correctAnswerStr = String(q.correctAnswer);
        if (!q.options.includes(correctAnswerStr)) {
          console.warn(
            `Correct answer not in options for question ${q.questionNumber}, adding it`,
          );
          q.options.push(correctAnswerStr);
        }
      }

      return q;
    })
    .filter((q) => q !== null) as GeneratedQuestion[];
}

/**
 * AI-POWERED: Generate subject-specific examples dynamically
 */
async function generateSubjectSpecificExamples(
  curriculum: string,
  title: string,
): Promise<string> {
  try {
    const prompt = `You are a university professor creating example questions for an assessment.

ASSESSMENT TITLE: "${title}"
CURRICULUM: "${curriculum}"

Generate 2 HIGH-QUALITY example questions (1 MCQ, 1 NUMERICAL) that are SPECIFIC to this exact curriculum.

CRITICAL RULES FOR NUMERICAL QUESTIONS:
- The answer MUST be a PURE NUMBER (integer or decimal)
- DO NOT use expressions, formulas, or text as answers
- If the question naturally requires a formula/expression answer, make it MCQ instead

REQUIREMENTS:
- Questions should demonstrate the style and depth expected for this subject
- Use proper technical terminology from the curriculum
- MCQ should have 4 realistic options with clear correct answer
- NUMERICAL should test calculation/quantitative skills with numeric answer
- Include detailed explanations showing solution steps
- Bloom's Level should be 3-4 (Apply/Analyze)

Return ONLY valid JSON (no markdown, no code blocks):
{
  "mcqExample": {
    "questionType": "mcq",
    "questionText": "...",
    "options": ["...", "...", "...", "..."],
    "correctAnswer": "...",
    "points": 2,
    "topic": "...",
    "explanation": "...",
    "bloomsLevel": 3
  },
  "numericalExample": {
    "questionType": "numerical",
    "questionText": "...",
    "correctAnswer": 42,
    "points": 2,
    "topic": "...",
    "explanation": "...",
    "bloomsLevel": 3
  }
}`;

    const result = await generateText({
      model: groq("llama-3.3-70b-versatile"),
      prompt,
      temperature: 0.6,
    });

    let content = result.text.trim();

    // Extract JSON
    if (content.includes("```")) {
      const match = content.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (match) content = match[1].trim();
    }

    const examples = JSON.parse(content);

    // Format examples for the prompt
    const formattedExamples = `
MCQ EXAMPLE (specific to this curriculum):
${JSON.stringify(examples.mcqExample, null, 2)}

NUMERICAL EXAMPLE (specific to this curriculum):
${JSON.stringify(examples.numericalExample, null, 2)}`;

    return formattedExamples;
  } catch (error) {
    console.warn("⚠️ Failed to generate AI examples, using generic template");

    // Fallback: generic but functional examples
    return `
MCQ EXAMPLE:
{
  "questionType": "mcq",
  "questionText": "Based on the curriculum, analyze the relationship between key concepts and select the most accurate statement.",
  "options": [
    "Statement A describing concept relationship",
    "Statement B describing concept relationship",
    "Statement C describing concept relationship",
    "Statement D describing concept relationship"
  ],
  "correctAnswer": "Statement B describing concept relationship",
  "points": 2,
  "topic": "Conceptual Analysis",
  "explanation": "Provide detailed reasoning showing why this answer is correct based on curriculum principles.",
  "bloomsLevel": 4
}

NUMERICAL EXAMPLE:
{
  "questionType": "numerical",
  "questionText": "Calculate the quantitative result for the given scenario. Express your answer as a decimal number rounded to 2 decimal places.",
  "correctAnswer": 15.75,
  "points": 2,
  "topic": "Quantitative Analysis",
  "explanation": "Step 1: Identify given values. Step 2: Apply relevant formula. Step 3: Calculate result = 15.75",
  "bloomsLevel": 3
}`;
  }
}

async function generateQuestionBatch(
  config: {
    title: string;
    curriculum: string;
    difficulty: string;
    cognitiveLevel: string;
    questionsInBatch: number;
    enrichedContext: string;
    questionConfig: any;
    previousQuestions?: GeneratedQuestion[];
  },
  batchNumber: number,
  totalBatches: number,
): Promise<GeneratedQuestion[]> {
  const {
    title,
    curriculum,
    difficulty,
    cognitiveLevel,
    questionsInBatch,
    enrichedContext,
    questionConfig,
    previousQuestions = [],
  } = config;

  const bloomsMap: Record<string, number> = {
    knowledge: 1,
    comprehension: 2,
    application: 3,
    analysis: 4,
    synthesis: 5,
    evaluation: 6,
  };

  const bloomsLevel = bloomsMap[cognitiveLevel] || 4;
  const targetBlooms = bloomsLevel >= 3 ? bloomsLevel : 3;

  const mcqRatio =
    questionConfig.mcq / (questionConfig.mcq + questionConfig.numerical);
  const numMCQ = Math.round(questionsInBatch * mcqRatio);
  const numNumerical = questionsInBatch - numMCQ;

  const examples = await generateSubjectSpecificExamples(curriculum, title);

  // ← ADD THIS: Build context of previously asked questions
  let previousQuestionsContext = "";
  if (previousQuestions.length > 0) {
    previousQuestionsContext = `\n\nIMPORTANT - DO NOT DUPLICATE THESE ALREADY ASKED QUESTIONS:
${previousQuestions.map((q, i) => `${i + 1}. ${q.questionText}`).join("\n")}

You MUST create DIFFERENT questions that cover OTHER aspects of the curriculum.`;
  }

  const prompt = `You are a university professor creating assessment questions at Bloom's Taxonomy Level ${targetBlooms} (${cognitiveLevel.toUpperCase()}).

ASSESSMENT TITLE: "${title}"

CURRICULUM:
${curriculum}

ENRICHED EDUCATIONAL CONTEXT:
${enrichedContext}

STRICT REQUIREMENTS:
- Generate EXACTLY ${questionsInBatch} questions (Batch ${batchNumber}/${totalBatches})
- Difficulty Level: ${difficulty}
- Distribution: ${numMCQ} MCQ questions + ${numNumerical} NUMERICAL questions
- ALL questions MUST be SPECIFIC to this curriculum (not generic)
- Use technical terminology from the enriched context
- Each question MUST test a DIFFERENT concept or aspect${previousQuestionsContext}

CRITICAL RULES FOR NUMERICAL QUESTIONS:
✓ CORRECT: Answer must be a PURE NUMBER: 42, 3.14, 0.5, 100, -25
✗ WRONG: Expressions like "2x + 3", "Cannot be determined", "A*B + C"
✗ WRONG: Text or formulas as answers
- If a question naturally requires a formula/expression answer, make it MCQ instead
- Round to appropriate precision and specify in question text

MCQ REQUIREMENTS:
- 4 options with realistic distractors based on common mistakes
- Correct answer must be in the options
- Test understanding, not just memorization
- Each MCQ must focus on a UNIQUE concept

EXAMPLES FROM THIS SUBJECT:
${examples}

OUTPUT FORMAT:
Return ONLY a valid JSON array with ${questionsInBatch} questions.
NO markdown, NO code blocks, NO explanatory text.
Start directly with [ and end with ].

Each question MUST have:
{
  "questionType": "mcq" or "numerical",
  "questionText": "Clear, specific question based on curriculum",
  "options": ["...", "...", "...", "..."],
  "correctAnswer": "exact string from options" (MCQ) or pure_number (NUMERICAL),
  "points": 1-3,
  "topic": "Specific topic from curriculum",
  "explanation": "Step-by-step solution showing work",
  "bloomsLevel": ${targetBlooms}
}

Generate ${questionsInBatch} UNIQUE, curriculum-specific questions now:`;

  try {
    const result = await generateText({
      model: groq("llama-3.3-70b-versatile"),
      prompt,
      temperature: 0.7,
    });

    let content = result.text.trim();

    // Remove markdown code blocks
    if (content.includes("```")) {
      const codeBlockMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (codeBlockMatch) {
        content = codeBlockMatch[1].trim();
      }
    }

    // Find JSON array
    const arrayMatch = content.match(/\[[\s\S]*\]/);

    if (!arrayMatch) {
      console.error("No valid JSON array found in response");
      console.error("Response snippet:", content.substring(0, 500));
      throw new Error("No valid JSON array found in LLM response");
    }

    let questions;
    try {
      questions = JSON.parse(arrayMatch[0]);
    } catch (parseError) {
      console.warn("JSON parse failed, attempting fixes...");

      const fixedJson = arrayMatch[0]
        .replace(/\\\\\\/g, "\\")
        .replace(/\\"/g, '"')
        .replace(/\n/g, " ")
        .replace(/\t/g, " ")
        .replace(/,(\s*[}\]])/g, "$1");

      questions = JSON.parse(fixedJson);
    }

    if (!Array.isArray(questions)) {
      throw new Error("Parsed result is not an array");
    }

    return questions.slice(0, questionsInBatch).map((q: any, idx: number) => ({
      questionNumber: idx + 1,
      questionType: q.questionType,
      questionText: q.questionText || "",
      options: q.options || [],
      correctAnswer: q.correctAnswer,
      points: q.points || 2,
      topic: q.topic || "General",
      explanation: q.explanation || "",
      bloomsLevel: q.bloomsLevel || targetBlooms,
      equationContent: q.equationContent || undefined,
    }));
  } catch (error) {
    console.error("Error in generateQuestionBatch:", error);
    throw error;
  }
}

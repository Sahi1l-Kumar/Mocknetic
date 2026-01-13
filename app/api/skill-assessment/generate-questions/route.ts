import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import { groq } from "@ai-sdk/groq";
import { generateText } from "ai";
import User from "@/database/user.model";
import Assessment from "@/database/skill-evaluation/skill-evaluation.model";
import dbConnect from "@/lib/mongoose";
import { QuestionPlan, GeneratedQuestion, QuestionType } from "@/types/global";

function cleanJsonString(jsonString: string): string {
  let cleaned = jsonString.replace(/```json\n?/g, "").replace(/```\n?/g, "");

  const firstBrace = cleaned.indexOf("{");
  if (firstBrace > 0) {
    cleaned = cleaned.substring(firstBrace);
  }

  const lastBrace = cleaned.lastIndexOf("}");
  if (lastBrace !== -1 && lastBrace < cleaned.length - 1) {
    cleaned = cleaned.substring(0, lastBrace + 1);
  }

  cleaned = cleaned.replace(/"([^"]*)":\s*"([^"]*)"/g, (match, key, value) => {
    const escapedValue = value
      .replace(/\\"/g, "___ESCAPED___")
      .replace(/"/g, '\\"')
      .replace(/___ESCAPED___/g, '\\"');
    return `"${key}": "${escapedValue}"`;
  });

  return cleaned.trim();
}

function getJobRolePattern(jobRole: string): {
  degree: string;
  pattern: {
    mcqTechnical?: number;
    mcqPseudoCode?: number;
    mcqAptitude?: number;
    softwareMcq?: number;
    coreMcq?: number;
    circuitMath?: number;
    mathPhysics?: number;
    descriptiveQuestions?: number;
  };
} {
  const role = jobRole.toLowerCase().trim();

  if (
    [
      "software developer",
      "software engineer",
      "developer",
      "ai/ml engineer",
      "ai engineer",
      "ml engineer",
      "cloud engineer",
      "devops engineer",
      "cloud/devops engineer",
      "cybersecurity analyst",
      "data scientist",
      "web developer",
      "network engineer",
      "it consultant",
      "backend developer",
    ].some((r) => role.includes(r))
  ) {
    return {
      degree: "CSE / IT / AI-ML / CSCE",
      pattern: {
        mcqTechnical: 10,
        mcqPseudoCode: 5,
        mcqAptitude: 10,
      },
    };
  }

  if (
    [
      "tester",
      "electronics",
      "hardware engineer",
      "electronics/hardware engineer",
      "embedded systems engineer",
      "embedded engineer",
      "vlsi",
      "chip design engineer",
      "rtl",
      "pcb designer",
      "rf",
      "wireless engineer",
      "firmware engineer",
      "telecommunications engineer",
    ].some((r) => role.includes(r))
  ) {
    return {
      degree: "ECS / ECE-like",
      pattern: {
        mcqAptitude: 10,
        softwareMcq: 5,
        coreMcq: 5,
        mcqPseudoCode: 5,
      },
    };
  }

  if (
    [
      "electrical",
      "etc",
      "eee",
      "instrumentation",
      "e&i",
      "rtl/design",
      "pcb",
      "field/service engineer",
      "maintenance",
      "hvac",
      "power electronics",
      "sales engineer",
      "manufacturing",
      "automation",
    ].some((r) => role.includes(r))
  ) {
    return {
      degree: "ETC / EEE / Electrical / E&I",
      pattern: {
        mcqAptitude: 8,
        coreMcq: 10,
        circuitMath: 5,
        descriptiveQuestions: 4,
      },
    };
  }

  if (
    [
      "design engineer",
      "cad",
      "cae",
      "hvac",
      "thermal engineer",
      "mechatronics",
      "automation engineer",
      "biomedical",
      "opto-mechanical",
      "automotive",
      "powertrain",
      "renewable energy",
      "sustainability consultant",
      "aerospace",
      "defense",
      "mechanical engineer",
    ].some((r) => role.includes(r))
  ) {
    return {
      degree: "Mechanical Engineering",
      pattern: {
        mcqAptitude: 8,
        coreMcq: 10,
        mathPhysics: 5,
        descriptiveQuestions: 4,
      },
    };
  }

  if (
    [
      "site engineer",
      "construction engineer",
      "project engineer",
      "project manager",
      "structural engineer",
      "quantity surveyor",
      "billing engineer",
      "cad technician",
      "surveyor",
      "environmental engineer",
      "sanitary engineer",
      "urban planner",
      "transport planner",
      "civil engineer",
    ].some((r) => role.includes(r))
  ) {
    return {
      degree: "Civil Engineering",
      pattern: {
        mcqAptitude: 8,
        coreMcq: 10,
        mathPhysics: 5,
        descriptiveQuestions: 4,
      },
    };
  }

  if (
    [
      "process engineer",
      "chemical process engineer",
      "production",
      "plant operator",
      "piping engineer",
      "development chemist",
      "corrosion engineer",
      "water technology",
      "energy transition",
      "chemical engineer",
    ].some((r) => role.includes(r))
  ) {
    return {
      degree: "Chemical Engineering",
      pattern: {
        mcqAptitude: 8,
        coreMcq: 10,
        mathPhysics: 5,
        descriptiveQuestions: 4,
      },
    };
  }

  return {
    degree: "Generic",
    pattern: {
      mcqTechnical: 10,
      mcqPseudoCode: 5,
      mcqAptitude: 10,
    },
  };
}

function getQuestionPlan(jobRole: string): QuestionPlan[] {
  const { pattern } = getJobRolePattern(jobRole);
  const plans: QuestionPlan[] = [];

  if (pattern.mcqTechnical && pattern.mcqTechnical > 0) {
    plans.push({ type: "mcq", count: pattern.mcqTechnical });
  }
  if (pattern.softwareMcq && pattern.softwareMcq > 0) {
    plans.push({ type: "mcq", count: pattern.softwareMcq });
  }
  if (pattern.coreMcq && pattern.coreMcq > 0) {
    plans.push({ type: "mcq", count: pattern.coreMcq });
  }
  if (pattern.mcqPseudoCode && pattern.mcqPseudoCode > 0) {
    plans.push({ type: "pseudo_mcq", count: pattern.mcqPseudoCode });
  }
  if (pattern.mcqAptitude && pattern.mcqAptitude > 0) {
    const half = Math.floor(pattern.mcqAptitude / 2);
    const rest = pattern.mcqAptitude - half;
    plans.push({ type: "aptitude", count: half });
    plans.push({ type: "reasoning", count: rest });
  }
  if (pattern.circuitMath && pattern.circuitMath > 0) {
    plans.push({ type: "circuit_math", count: pattern.circuitMath });
  }
  if (pattern.mathPhysics && pattern.mathPhysics > 0) {
    plans.push({ type: "circuit_math", count: pattern.mathPhysics });
  }
  if (pattern.descriptiveQuestions && pattern.descriptiveQuestions > 0) {
    plans.push({ type: "descriptive", count: pattern.descriptiveQuestions });
  }

  return plans;
}

async function generateAssessmentQuestions(
  jobRole: string,
  difficulty: string,
  experienceLevel: string,
  userSkills: string[]
): Promise<{ questions: GeneratedQuestion[] }> {
  try {
    const { text: skillsResponse } = await generateText({
      model: groq("llama-3.1-8b-instant"),
      prompt: `You are a career advisor. Return ONLY valid JSON. No explanations, no markdown.

For a "${jobRole}" position at "${experienceLevel}" level, identify exactly 5 CRITICAL technical skills needed.

Return ONLY valid JSON (no markdown):
{
  "skills": ["Skill1", "Skill2", "Skill3", "Skill4", "Skill5"]
}`,
      temperature: 0.6,
    });

    let targetSkills = [
      "Fundamentals",
      "Problem Solving",
      "Technical Knowledge",
      "Best Practices",
      "Industry Standards",
    ];

    try {
      const cleanedSkills = cleanJsonString(skillsResponse);
      const parsed = JSON.parse(cleanedSkills);
      if (parsed.skills && Array.isArray(parsed.skills)) {
        targetSkills = parsed.skills.slice(0, 5);
      }
    } catch {
      console.warn("Could not parse skills, using defaults");
    }

    const plan = getQuestionPlan(jobRole);
    const totalQuestions = plan.reduce((sum, p) => sum + p.count, 0);

    const { text: response } = await generateText({
      model: groq("llama-3.1-8b-instant"),
      prompt: `You are a strict JSON generator and technical interviewer for ${jobRole}.
Generate questions for the TARGET role only.
Return ONLY valid JSON. No markdown. No extra text before or after JSON.
Never output "coding" as questionType.

CRITICAL JSON RULES:
- All string values MUST be wrapped in double quotes
- Use "O(n)" notation should be written as "O(n)" (keep the quotes)
- Escape all special characters properly
- No trailing commas
- Numbers should NOT be in quotes unless they are IDs

You are a technical interviewer designing an online assessment for the job role "${jobRole}" at "${experienceLevel}" level.

Generate EXACTLY ${totalQuestions} questions according to the following QUESTION PLAN:

${JSON.stringify(plan, null, 2)}

QuestionType meanings:
- "mcq": Technical or core subject multiple-choice with 4 options (only ONE correct).
- "pseudo_mcq": MCQ where options are pseudocode / code snippets, testing algorithm understanding (no full program needed).
- "aptitude": Multiple-choice general aptitude (numerical, verbal, word problems) with 4 options.
- "reasoning": Multiple-choice logical / analytical reasoning with 4 options.
- "descriptive": Candidate must write a text explanation, design, or reasoning (no options).
- "circuit_math": Numerical or circuit / physics / math based question (no options); answer is a value or formula.

Important:
- DO NOT generate any pure coding questions where the candidate must write full code.
- Questions must test skills REQUIRED for the "${jobRole}" role.
- Distribute skills across: ${targetSkills.join(", ")}.
- Use real-world scenarios where possible.
- Do NOT consider user's current skills (${userSkills.join(", ") || "unknown"}).

For MCQ-like types ("mcq", "pseudo_mcq", "aptitude", "reasoning"):
  - Provide exactly 4 options.
  - Provide "correctAnswer" as 1, 2, 3 or 4 (number, not string).
  - Provide a brief "explanation".
  - For algorithm complexity questions, write answers as strings: "O(n)", "O(1)", etc.

For non-MCQ types ("descriptive", "circuit_math"):
  - Do NOT provide options.
  - Do NOT provide correctAnswer.
  - Provide:
    - "expectedAnswer": short ideal answer (2–4 lines) as a STRING.
    - "evaluationCriteria": bullet-style text explaining how to grade the answer as a STRING.
    - "expectedKeywords": an array of 12–20 important words/phrases that MUST appear in a good answer.

Return ONLY valid JSON (no markdown, no comments, no extra text) in this exact structure:
{
  "questions": [
    {
      "id": "1",
      "skill": "One of: ${targetSkills.join(", ")}",
      "questionType": "mcq | pseudo_mcq | descriptive | aptitude | reasoning | circuit_math",
      "question": "Question text here",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 1,
      "difficulty": "${difficulty}",
      "explanation": "Short explanation of why the answer is correct or what is being tested",
      "expectedAnswer": "Short description of ideal answer (for non-MCQ types)",
      "evaluationCriteria": "Key points used to evaluate answer (for non-MCQ types)",
      "expectedKeywords": ["keyword1", "keyword2"]
    }
  ]
}`,
      temperature: 0.7,
    });

    let parsed: { questions: GeneratedQuestion[] } | null = null;

    try {
      // Clean the response before parsing
      const cleanedResponse = cleanJsonString(response);
      console.log(
        "[DEBUG] Cleaned response (first 500 chars):",
        cleanedResponse.substring(0, 500)
      );
      parsed = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error(parseError);
      try {
        const cleanedResponse = cleanJsonString(response);
        const bracketMatch = cleanedResponse.match(/\[[\s\S]*\]/);
        if (bracketMatch) {
          parsed = { questions: JSON.parse(bracketMatch[0]) };
        } else {
          console.error("[DEBUG] Raw response:", response.substring(0, 1000));
          throw new Error("No valid JSON found in response");
        }
      } catch (innerError) {
        console.error("[DEBUG] Failed to extract JSON:", innerError);
        throw new Error("Failed to parse AI response as valid JSON");
      }
    }

    if (!parsed || !parsed.questions || !Array.isArray(parsed.questions)) {
      throw new Error("Invalid questions structure");
    }

    if (parsed.questions.length === 0) {
      throw new Error("No questions generated");
    }

    parsed.questions.forEach((q: any, idx: number) => {
      if (!q.id) q.id = String(idx + 1);
      if (!q.skill) q.skill = targetSkills[idx % targetSkills.length];
      if (!q.questionType) throw new Error(`Q${idx + 1}: missing questionType`);
      if (!q.question) throw new Error(`Q${idx + 1}: missing question`);

      if (q.questionType === "coding") {
        throw new Error(`Q${idx + 1}: coding type found but is not allowed`);
      }

      const qt = q.questionType as QuestionType;

      if (
        qt === "mcq" ||
        qt === "pseudo_mcq" ||
        qt === "aptitude" ||
        qt === "reasoning"
      ) {
        if (!Array.isArray(q.options)) {
          console.warn(`Q${idx + 1}: options not array, creating empty array`);
          q.options = [];
        }

        if (q.options.length > 4) {
          console.warn(
            `Q${idx + 1}: Had ${q.options.length} options, trimming to 4`
          );
          q.options = q.options.slice(0, 4);
        } else if (q.options.length < 4) {
          console.warn(
            `Q${idx + 1}: Had ${q.options.length} options, padding to 4`
          );
          while (q.options.length < 4) {
            q.options.push(
              `Option ${String.fromCharCode(65 + q.options.length)}`
            );
          }
        }

        if (typeof q.correctAnswer !== "number") {
          console.warn(`Q${idx + 1}: correctAnswer not number, setting to 1`);
          q.correctAnswer = 1;
        }

        if (q.correctAnswer < 1 || q.correctAnswer > 4) {
          console.warn(
            `Q${idx + 1}: Invalid correctAnswer ${q.correctAnswer}, setting to 1`
          );
          q.correctAnswer = 1;
        }
      } else {
        delete q.options;
        delete q.correctAnswer;
      }

      if (qt === "descriptive" || qt === "circuit_math") {
        if (!Array.isArray(q.expectedKeywords)) {
          q.expectedKeywords = [];
        }
      }
    });

    return parsed;
  } catch (error) {
    console.error("Question generation error:", error);
    throw error;
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { message: "Unauthorized - Please login" } },
        { status: 401 }
      );
    }

    await dbConnect();

    const body = await req.json();
    const { jobRole, difficulty, experienceLevel } = body;

    if (!jobRole || typeof jobRole !== "string" || jobRole.trim() === "") {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "Invalid job role. Please enter a valid job title.",
          },
        },
        { status: 400 }
      );
    }

    if (
      !difficulty ||
      typeof difficulty !== "string" ||
      !["beginner", "intermediate", "advanced"].includes(difficulty)
    ) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message:
              "Invalid difficulty. Must be: beginner, intermediate, or advanced",
          },
        },
        { status: 400 }
      );
    }

    if (
      !experienceLevel ||
      typeof experienceLevel !== "string" ||
      experienceLevel.trim() === ""
    ) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "Invalid experience level. Please select a valid level.",
          },
        },
        { status: 400 }
      );
    }

    const user = (await User.findById(session.user.id).lean()) as any;
    if (!user) {
      return NextResponse.json(
        { success: false, error: { message: "User not found" } },
        { status: 404 }
      );
    }

    const userSkills = user?.skills || [];

    const parsedData = await generateAssessmentQuestions(
      jobRole,
      difficulty,
      experienceLevel,
      userSkills
    );

    const assessment = await Assessment.create({
      userId: session.user.id,
      jobRole,
      experienceLevel,
      difficulty,
      questions: parsedData.questions.map((q: GeneratedQuestion) => ({
        questionId: q.id,
        skill: q.skill,
        questionType: q.questionType,
        question: q.question,
        options: q.options || [],
        correctAnswer:
          typeof q.correctAnswer === "number" ? Number(q.correctAnswer) : null,
        expectedAnswer: q.expectedAnswer || null,
        evaluationCriteria: Array.isArray(q.evaluationCriteria)
          ? q.evaluationCriteria.join("\n")
          : q.evaluationCriteria || null,
        expectedKeywords: q.expectedKeywords || [],
        userAnswer: null,
        isCorrect: null,
      })),
      score: 0,
      totalQuestions: parsedData.questions.length,
      completedAt: null,
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          assessmentId: assessment._id.toString(),
          questions: parsedData.questions.map((q: GeneratedQuestion) => ({
            id: q.id,
            skill: q.skill,
            questionType: q.questionType,
            question: q.question,
            options: q.options || [],
            difficulty: q.difficulty,
            explanation: q.explanation,
            expectedAnswer: q.expectedAnswer,
            evaluationCriteria: q.evaluationCriteria,
            expectedKeywords: q.expectedKeywords || [],
            correctAnswer:
              typeof q.correctAnswer === "number" ? q.correctAnswer : null,
          })),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in generate-questions:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Failed to generate questions";

    return NextResponse.json(
      {
        success: false,
        error: {
          message: errorMessage,
        },
      },
      { status: 500 }
    );
  }
}

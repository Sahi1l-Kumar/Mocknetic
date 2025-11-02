import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import User from "@/database/user.model";
import Profile from "@/database/profile.model";
import Assessment from "@/database/assessment.model";
import dbConnect from "@/lib/mongoose";

async function generateAssessmentQuestions(
  jobRole: string,
  difficulty: string,
  experienceLevel: string,
  userSkills: string[],
  userExperience: string,
  userProjects: string
): Promise<any> {
  try {
    const { text: response } = await generateText({
      model: google("gemini-2.0-flash-exp"),
      prompt: `Generate exactly 5 multiple choice questions as JSON ONLY. No markdown, no explanations.

Job Role: ${jobRole}
Experience Level: ${experienceLevel}
Difficulty: ${difficulty}

Skills: ${userSkills.join(", ") || "Not specified"}

Return ONLY valid JSON:
{
  "questions": [
    {
      "id": "1",
      "skill": "Skill",
      "question": "Question text?",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": 0,
      "difficulty": "beginner"
    },
    {
      "id": "2",
      "skill": "Skill",
      "question": "Question text?",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": 1,
      "difficulty": "beginner"
    },
    {
      "id": "3",
      "skill": "Skill",
      "question": "Question text?",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": 2,
      "difficulty": "intermediate"
    },
    {
      "id": "4",
      "skill": "Skill",
      "question": "Question text?",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": 3,
      "difficulty": "intermediate"
    },
    {
      "id": "5",
      "skill": "Skill",
      "question": "Question text?",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": 0,
      "difficulty": "${difficulty}"
    }
  ]
}`,
      system:
        "Return ONLY JSON. No markdown code blocks. No explanations. Just raw JSON.",
      temperature: 0.3,
    });

    console.log("Gemini response:", response.substring(0, 1000));

    // Try different extraction methods
    let parsed = null;

    // Method 1: Direct JSON parse
    try {
      parsed = JSON.parse(response);
      console.log("Parsed directly");
    } catch (e) {
      // Method 2: Extract JSON from markdown
      const jsonMatch = response.match(/``````/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[1]);
        console.log("Parsed from markdown");
      } else {
        // Method 3: Extract first { to last }
        const bracketMatch = response.match(/\{[\s\S]*\}/);
        if (bracketMatch) {
          parsed = JSON.parse(bracketMatch[0]);
          console.log("Parsed from brackets");
        } else {
          throw new Error("No JSON found in response");
        }
      }
    }

    if (!parsed.questions || !Array.isArray(parsed.questions)) {
      throw new Error("Questions is not an array");
    }

    if (parsed.questions.length !== 5) {
      console.warn(
        `Expected 5 questions, got ${parsed.questions.length}, continuing...`
      );
    }

    parsed.questions.forEach((q, idx) => {
      if (!q.id || !q.skill || !q.question || !Array.isArray(q.options)) {
        throw new Error(`Question ${idx} missing required fields`);
      }
      if (q.options.length !== 4) {
        throw new Error(
          `Question ${idx} has ${q.options.length} options, must be 4`
        );
      }
      if (
        typeof q.correctAnswer !== "number" ||
        q.correctAnswer < 0 ||
        q.correctAnswer > 3
      ) {
        throw new Error(
          `Question ${idx} has invalid correctAnswer: ${q.correctAnswer}`
        );
      }
    });

    return parsed;
  } catch (error) {
    console.error("Gemini assessment generation error:", error);
    throw error;
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const { jobRole, difficulty, experienceLevel } = await req.json();

    if (!jobRole || !difficulty || !experienceLevel) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const user = (await User.findById(session.user.id).lean()) as any;
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const profile = (await Profile.findOne({
      userId: session.user.id,
    }).lean()) as any;

    const userSkills = user?.skills || [];
    const userExperience =
      profile?.experience
        ?.map((exp) => `${exp.title} at ${exp.company}`)
        .join(", ") || "No specific experience";
    const userProjects =
      profile?.projects?.map((proj) => proj.name).join(", ") || "No projects";

    const parsedData = await generateAssessmentQuestions(
      jobRole,
      difficulty,
      experienceLevel,
      userSkills,
      userExperience,
      userProjects
    );

    // Create assessment record with questions
    const assessment = await Assessment.create({
      userId: session.user.id,
      jobRole,
      experienceLevel,
      difficulty,
      questions: parsedData.questions.map((q) => ({
        questionId: q.id,
        skill: q.skill,
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        userAnswer: null,
        isCorrect: null,
      })),
      score: 0,
      totalQuestions: parsedData.questions.length,
    });

    return NextResponse.json({
      success: true,
      data: {
        assessmentId: assessment._id.toString(),
        questions: parsedData.questions,
      },
    });
  } catch (error) {
    console.error("Generate questions error:", error);
    return NextResponse.json(
      {
        error: "Failed to generate questions",
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}

import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import { groq } from "@ai-sdk/groq";
import { generateText } from "ai";
import User from "@/database/user.model";
import Assessment from "@/database/assessment.model";
import dbConnect from "@/lib/mongoose";

async function generateAssessmentQuestions(
  jobRole: string,
  difficulty: string,
  experienceLevel: string,
  userSkills: string[]
): Promise<any> {
  try {
    console.log(`🎯 Generating questions for: ${jobRole}`);
    console.log(`📊 Difficulty: ${difficulty}, Level: ${experienceLevel}`);
    console.log(`👤 User current skills: ${userSkills.join(", ") || "None"}`);

    // Step 1: Use Llama to identify key skills for the TARGET job role
    console.log("📤 Step 1: Identifying key skills for target role...");

    const { text: skillsResponse } = await generateText({
      model: groq("llama-3.1-8b-instant"),
      prompt: `You are a career advisor.

For a "${jobRole}" position at "${experienceLevel}" level, identify exactly 5 CRITICAL technical skills needed.

Return ONLY valid JSON (no markdown):
{
  "skills": ["Skill1", "Skill2", "Skill3", "Skill4", "Skill5"]
}`,
      system:
        "You are a career advisor. Return ONLY valid JSON. No explanations, no markdown.",
      temperature: 0.6,
      maxTokens: 300,
    });

    console.log("✅ Skills response received");

    let targetSkills = [
      "Fundamentals",
      "Problem Solving",
      "Technical Knowledge",
      "Best Practices",
      "Industry Standards",
    ];

    try {
      const parsed = JSON.parse(skillsResponse);
      if (parsed.skills && Array.isArray(parsed.skills)) {
        targetSkills = parsed.skills.slice(0, 5);
        console.log(`✅ Target skills identified: ${targetSkills.join(", ")}`);
      }
    } catch (e) {
      console.warn("⚠️ Could not parse skills, using defaults");
    }

    // Step 2: Generate questions based on TARGET job role (not user skills)
    console.log("📤 Step 2: Generating questions for target role...");

    const { text: response } = await generateText({
      model: groq("llama-3.1-8b-instant"),
      prompt: `You are a technical interviewer for a ${jobRole} position.

Create EXACTLY 5 ${difficulty} level multiple-choice questions to assess a ${experienceLevel} candidate.

Job Role: ${jobRole}
Experience Level: ${experienceLevel}
Difficulty Level: ${difficulty}
Key Skills to Test: ${targetSkills.join(", ")}

IMPORTANT:
- Questions should test skills REQUIRED for the ${jobRole} role
- Each question tests a DIFFERENT skill from: ${targetSkills.join(", ")}
- Use real-world scenarios specific to ${jobRole} daily work
- Make questions practical and industry-standard
- Do NOT focus on user's current skills (${userSkills.join(", ") || "unknown"}) - focus on TARGET role requirements
- For correctAnswer, use values 1, 2, 3, or 4 (representing which option is correct)

Return ONLY valid JSON (no markdown, no explanations):
{
  "questions": [
    {
      "id": "1",
      "skill": "${targetSkills[0] || "Core Skill 1"}",
      "question": "What is the best practice for [Skill1 practical scenario in ${jobRole}]?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 1,
      "difficulty": "${difficulty}",
      "explanation": "Explanation of why this is correct"
    },
    {
      "id": "2",
      "skill": "${targetSkills[1] || "Core Skill 2"}",
      "question": "In [Skill2 context for ${jobRole}], what approach would you use?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 2,
      "difficulty": "${difficulty}",
      "explanation": "Explanation of why this is correct"
    },
    {
      "id": "3",
      "skill": "${targetSkills[2] || "Core Skill 3"}",
      "question": "How would you handle [Skill3 scenario in ${jobRole}]?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 3,
      "difficulty": "${difficulty}",
      "explanation": "Explanation of why this is correct"
    },
    {
      "id": "4",
      "skill": "${targetSkills[3] || "Core Skill 4"}",
      "question": "What is the correct way to [Skill4 task in ${jobRole}]?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 4,
      "difficulty": "${difficulty}",
      "explanation": "Explanation of why this is correct"
    },
    {
      "id": "5",
      "skill": "${targetSkills[4] || "Core Skill 5"}",
      "question": "When dealing with [Skill5 challenge in ${jobRole}], what is best practice?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 1,
      "difficulty": "${difficulty}",
      "explanation": "Explanation of why this is correct"
    }
  ]
}`,
      system: `You are a technical interviewer for ${jobRole}. 
Generate questions for the TARGET job role requirements, not for user's current skill level.
Return ONLY valid JSON. No markdown. No explanations.
For correctAnswer, use 1, 2, 3, or 4 to indicate which option is correct.`,
      temperature: 0.7,
      maxTokens: 2500,
    });

    console.log("✅ Questions response received");
    console.log("📝 Preview:", response.substring(0, 300));

    // Parse JSON with fallback methods
    let parsed = null;

    try {
      parsed = JSON.parse(response);
      console.log("✅ Direct JSON parse successful");
    } catch (e) {
      console.log("⚠️ Direct parse failed, trying extraction...");

      // Extract from markdown
      const markdownMatch = response.match(/``````/);
      if (markdownMatch) {
        parsed = JSON.parse(markdownMatch[1]);
        console.log("✅ Markdown extraction successful");
      } else {
        // Extract first { to last }
        const bracketMatch = response.match(/\{[\s\S]*\}/);
        if (bracketMatch) {
          parsed = JSON.parse(bracketMatch[0]);
          console.log("✅ Bracket extraction successful");
        } else {
          throw new Error("No valid JSON found");
        }
      }
    }

    // Validate structure
    if (!parsed || !parsed.questions || !Array.isArray(parsed.questions)) {
      throw new Error("Invalid questions structure");
    }

    if (parsed.questions.length === 0) {
      throw new Error("No questions generated");
    }

    console.log(`✅ Generated ${parsed.questions.length} questions`);

    // Validate and convert each question
    parsed.questions.forEach((q: any, idx: number) => {
      if (!q.id) throw new Error(`Q${idx + 1}: missing id`);
      if (!q.skill) throw new Error(`Q${idx + 1}: missing skill`);
      if (!q.question) throw new Error(`Q${idx + 1}: missing question`);
      if (!Array.isArray(q.options))
        throw new Error(`Q${idx + 1}: options not array`);
      if (q.options.length !== 4)
        throw new Error(
          `Q${idx + 1}: need 4 options, got ${q.options.length}`
        );
      if (typeof q.correctAnswer !== "number")
        throw new Error(`Q${idx + 1}: correctAnswer not number`);

      // ✅ FIX: Convert 1-indexed (1,2,3,4) to 0-indexed (0,1,2,3)
      if (q.correctAnswer < 1 || q.correctAnswer > 4) {
        console.warn(
          `⚠️ Q${idx + 1}: Invalid correctAnswer ${q.correctAnswer}, setting to 1`
        );
        q.correctAnswer = 1;
      }

      console.log(
        `   Q${idx + 1}: Converting correctAnswer from ${q.correctAnswer} → ${q.correctAnswer - 1}`
      );
      q.correctAnswer = q.correctAnswer - 1; // Convert to 0-indexed
    });

    console.log("✅ All validations passed and answers converted to 0-indexed");
    return parsed;
  } catch (error) {
    console.error("❌ Question generation error:", error);
    throw error;
  }
}

export async function POST(req: NextRequest) {
  try {
    console.log("📨 Received assessment generation request");

    const session = await auth();
    if (!session?.user?.id) {
      console.error("❌ Unauthorized");
      return NextResponse.json(
        { success: false, error: { message: "Unauthorized - Please login" } },
        { status: 401 }
      );
    }

    await dbConnect();
    console.log("✅ Database connected");

    const body = await req.json();
    const { jobRole, difficulty, experienceLevel } = body;

    console.log("📋 Request body:", { jobRole, difficulty, experienceLevel });

    // Validate inputs
    if (!jobRole || typeof jobRole !== "string" || jobRole.trim() === "") {
      console.error("❌ Invalid jobRole:", jobRole);
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
      console.error("❌ Invalid difficulty:", difficulty);
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
      console.error("❌ Invalid experienceLevel:", experienceLevel);
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

    console.log(`✅ Input validation passed`);

    // Fetch user to get current skills (for context only, not for question generation)
    const user = (await User.findById(session.user.id).lean()) as any;
    if (!user) {
      console.error("❌ User not found");
      return NextResponse.json(
        { success: false, error: { message: "User not found" } },
        { status: 404 }
      );
    }

    const userSkills = user?.skills || [];
    console.log(`👤 User current skills: ${userSkills.join(", ") || "None"}`);

    // Generate questions based on TARGET job role
    console.log(`🚀 Generating questions for "${jobRole}"...`);
    const parsedData = await generateAssessmentQuestions(
      jobRole,
      difficulty,
      experienceLevel,
      userSkills
    );

    // Save assessment with proper structure for scoring
    console.log("💾 Saving assessment to database...");
    const assessment = await Assessment.create({
      userId: session.user.id,
      jobRole,
      experienceLevel,
      difficulty,
      questions: parsedData.questions.map((q: any) => ({
        questionId: q.id, // Store as string for easy lookup
        skill: q.skill,
        question: q.question,
        options: q.options,
        correctAnswer: Number(q.correctAnswer), // Now 0-indexed (0,1,2,3)
        userAnswer: null, // Will be set during submission
        isCorrect: null, // Will be calculated during submission
      })),
      score: 0,
      totalQuestions: parsedData.questions.length,
      completedAt: null, // Set when submitted
    });

    console.log(`✅ Assessment saved: ${assessment._id}`);
    console.log(`📊 Questions stored in DB:`, assessment.questions.length);
    assessment.questions.forEach((q: any, idx: number) => {
      console.log(
        `   Q${idx + 1}: id=${q.questionId}, correctAnswer=${q.correctAnswer} (0-indexed) (type: ${typeof q.correctAnswer})`
      );
    });

    // Return assessment ID and questions for frontend
    const responseData = {
      success: true,
      data: {
        assessmentId: assessment._id.toString(),
        questions: parsedData.questions.map((q: any) => ({
          id: q.id,
          skill: q.skill,
          question: q.question,
          options: q.options,
          difficulty: q.difficulty,
          explanation: q.explanation,
          correctAnswer: q.correctAnswer, // 0-indexed for frontend
        })),
      },
    };

    console.log("✅ Returning response:", JSON.stringify(responseData, null, 2));

    return NextResponse.json(responseData, { status: 200 });
  } catch (error) {
    console.error("❌ FATAL ERROR in generate-questions:", error);
    console.error("Error stack:", error instanceof Error ? error.stack : "");

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

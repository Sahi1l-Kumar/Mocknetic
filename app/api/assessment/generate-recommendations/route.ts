import { NextRequest, NextResponse } from "next/server";
import { groq } from "@ai-sdk/groq";
import { generateText } from "ai";

export async function POST(request: NextRequest) {
  try {
    const { jobRole, experienceLevel, skillGaps, overallScore } =
      await request.json();

    // Validate inputs
    if (!jobRole || !experienceLevel) {
      return NextResponse.json(
        {
          success: false,
          error: { message: "Missing jobRole or experienceLevel" },
        },
        { status: 400 }
      );
    }

    console.log(
      `🎓 Generating recommendations for ${jobRole} (${experienceLevel}) - Score: ${overallScore}%`
    );

    const prompt =
      skillGaps && skillGaps.length > 0
        ? `You are a career advisor. A ${experienceLevel} ${jobRole} candidate scored ${overallScore}% on a technical assessment.

They need to improve in these areas: ${skillGaps.join(", ")}

Generate EXACTLY 3 personalized learning recommendations. For each, provide:
1. title: Specific course/resource title
2. description: Brief description (max 100 chars)
3. link: Real working URL (MDN, official docs, freeCodeCamp, Coursera, GitHub)
4. skill: Which skill gap it addresses

Return ONLY valid JSON (no markdown):
{
  "recommendations": [
    {
      "title": "Exact Course/Resource Title",
      "description": "Clear benefit in 100 chars or less",
      "link": "https://real-working-url.com",
      "skill": "${skillGaps[0] || "Skill"}"
    },
    {
      "title": "Exact Course/Resource Title",
      "description": "Clear benefit in 100 chars or less",
      "link": "https://real-working-url.com",
      "skill": "${skillGaps[1] || "Skill"}"
    },
    {
      "title": "Exact Course/Resource Title",
      "description": "Clear benefit in 100 chars or less",
      "link": "https://real-working-url.com",
      "skill": "${skillGaps[2] || "Skill"}"
    }
  ]
}`
        : `You are a career advisor. A ${experienceLevel} ${jobRole} achieved a perfect score (${overallScore}%) on their technical assessment.

They have mastered the assessed skills. Generate EXACTLY 3 advanced learning recommendations to help them grow further.

For each, provide:
1. title: Advanced topic/course title
2. description: Brief description (max 100 chars)
3. link: Real working URL
4. skill: Advanced topic name

Return ONLY valid JSON (no markdown):
{
  "recommendations": [
    {
      "title": "Advanced Topic Title",
      "description": "Why this helps their growth in 100 chars",
      "link": "https://real-working-url.com",
      "skill": "Advanced Skill"
    },
    {
      "title": "Advanced Topic Title",
      "description": "Why this helps their growth in 100 chars",
      "link": "https://real-working-url.com",
      "skill": "Advanced Skill"
    },
    {
      "title": "Advanced Topic Title",
      "description": "Why this helps their growth in 100 chars",
      "link": "https://real-working-url.com",
      "skill": "Advanced Skill"
    }
  ]
}`;

    console.log("📤 Calling Groq/Llama API...");

    // Use generateText from ai SDK - same as resume parsing
    const { text: response } = await generateText({
      model: groq("llama-3.1-8b-instant"),
      prompt: prompt,
      system:
        "You are a career advisor. Return ONLY valid JSON with no explanations, no markdown blocks, no extra text.",
      temperature: 0.7,
      maxTokens: 1500,
    });

    console.log("✅ Response received from Llama");
    console.log("📝 Preview:", response.substring(0, 200));

    // Extract and parse JSON
    let recommendations = [];

    try {
      // Method 1: Direct parse
      const parsed = JSON.parse(response);
      if (parsed.recommendations && Array.isArray(parsed.recommendations)) {
        recommendations = parsed.recommendations;
        console.log("✅ Direct JSON parse successful");
      } else {
        throw new Error("Invalid structure");
      }
    } catch (e) {
      console.log("⚠️ Direct parse failed, trying extraction...");

      // Method 2: Extract from markdown
      const markdownMatch = response.match(/``````/);
      if (markdownMatch) {
        const parsed = JSON.parse(markdownMatch[1]);
        if (parsed.recommendations && Array.isArray(parsed.recommendations)) {
          recommendations = parsed.recommendations;
          console.log("✅ Markdown extraction successful");
        } else {
          throw new Error("Invalid structure in markdown");
        }
      } else {
        // Method 3: Extract first { to last }
        const bracketMatch = response.match(/\{[\s\S]*\}/);
        if (bracketMatch) {
          const parsed = JSON.parse(bracketMatch[0]);
          if (
            parsed.recommendations &&
            Array.isArray(parsed.recommendations)
          ) {
            recommendations = parsed.recommendations;
            console.log("✅ Bracket extraction successful");
          } else {
            throw new Error("Invalid structure in brackets");
          }
        } else {
          throw new Error("No JSON found in response");
        }
      }
    }

    // Validate recommendations
    if (
      !recommendations ||
      !Array.isArray(recommendations) ||
      recommendations.length === 0
    ) {
      console.warn("⚠️ No valid recommendations, using fallback");
      recommendations = [
        {
          title: `Master ${jobRole} Skills`,
          description: "Comprehensive guide to improve your abilities",
          link: "https://www.coursera.org/",
          skill: jobRole,
        },
        {
          title: "System Design Interview Guide",
          description: "Learn to design scalable systems",
          link: "https://github.com/donnemartin/system-design-primer",
          skill: "System Design",
        },
        {
          title: "LeetCode",
          description: "Practice coding problems to sharpen skills",
          link: "https://leetcode.com/",
          skill: "Problem Solving",
        },
      ];
    }

    console.log(`✅ Generated ${recommendations.length} recommendations`);

    return NextResponse.json(
      {
        success: true,
        data: { recommendations },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Error generating recommendations:", error);

    return NextResponse.json(
      {
        success: false,
        error: {
          message:
            error instanceof Error
              ? error.message
              : "Failed to generate recommendations",
        },
      },
      { status: 500 }
    );
  }
}

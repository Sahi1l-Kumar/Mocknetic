import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import { generateText } from "ai";
import { groq } from "@ai-sdk/groq";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { jobRole, experienceLevel, skillGaps, overallScore } =
      await req.json();

    console.log(`📚 Generating recommendations for: ${jobRole}`);
    console.log(`📊 Skill gaps:`, skillGaps);

    if (!jobRole || !Array.isArray(skillGaps)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request: jobRole and skillGaps required",
        },
        { status: 400 }
      );
    }

    let recommendations;

    // Check if Groq API key is available
    const apiKey = process.env.GROQ_API_KEY;

    if (apiKey) {
      try {
        // Build recommendation prompt
        const prompt = `You are a career development expert specializing in skill development and learning resources.

Job Role: ${jobRole}
Experience Level: ${experienceLevel || "Entry Level"}
Overall Score: ${overallScore}%
Skills needing improvement: ${skillGaps.length > 0 ? skillGaps.join(", ") : "None - all skills mastered"}

Task: Generate ${skillGaps.length > 0 ? "3-5" : "3"} high-quality learning resource recommendations as a JSON array.

${
  skillGaps.length > 0
    ? `For each weak skill, recommend ONE specific, actionable learning resource (course, tutorial series, or documentation).`
    : `Since all skills are mastered, recommend advanced/specialized resources for ${jobRole} professionals.`
}

Requirements:
1. Each recommendation must have these fields:
   - title: Clear, specific course/resource name (e.g., "Complete React Developer Course 2024" not just "React Course")
   - description: 1-2 sentences explaining what they'll learn and why it's valuable
   - link: A REAL, working URL to a course on Coursera, Udemy, FreeCodeCamp, YouTube playlist, or official documentation
   - skill: The skill this addresses (from the gap list, or advanced skill for ${jobRole})

2. Use these trusted platforms:
   - Coursera: https://www.coursera.org/learn/[course-name]
   - Udemy: https://www.udemy.com/course/[course-name]
   - FreeCodeCamp: https://www.freecodecamp.org/
   - YouTube: Specific playlist URLs
   - Official Docs: Like reactjs.org, python.org, nodejs.org

3. Match the experience level (${experienceLevel || "Entry Level"})

Return ONLY a JSON array with no markdown formatting or code blocks. Example format:
[
  {
    "title": "JavaScript: Understanding the Weird Parts",
    "description": "Deep dive into JavaScript's core concepts including closures, prototypes, and async patterns essential for senior developers.",
    "link": "https://www.udemy.com/course/understand-javascript/",
    "skill": "JavaScript"
  }
]`;

        const { text } = await generateText({
          model: groq("llama-3.1-8b-instant"),
          prompt: prompt,
          system:
            "You are a career advisor. Return ONLY valid JSON array. No markdown, no code blocks, no explanations.",
          temperature: 0.7,
          maxTokens: 1500,
        });

        console.log("🤖 AI Response:", text);

        // Parse recommendations
        let cleanedText = text.trim();

        // Remove markdown code blocks if present
        if (cleanedText.startsWith("```")) {
          cleanedText = cleanedText
            .replace(/```json?\n?/g, "")
            .replace(/```/g, "")
            .trim();
        }

        // Try to extract JSON array
        const arrayMatch = cleanedText.match(/\[[\s\S]*\]/);
        if (arrayMatch) {
          cleanedText = arrayMatch;
        }

        recommendations = JSON.parse(cleanedText);

        // Validate structure
        if (!Array.isArray(recommendations)) {
          throw new Error("Response is not an array");
        }

        // Ensure each recommendation has required fields
        recommendations = recommendations.map((rec: any) => ({
          title: rec.title || "Learning Resource",
          description: rec.description || "Enhance your skills",
          link: rec.link || "https://www.coursera.org/",
          skill: rec.skill || jobRole,
        }));

        console.log(`✅ Generated ${recommendations.length} recommendations`);
      } catch (parseError) {
        console.error("❌ Failed to parse AI response:", parseError);
        // Fall through to fallback
        recommendations = null;
      }
    } else {
      console.warn("⚠️ Groq API key not found, using fallback recommendations");
    }

    // Use fallback if AI failed or API key missing
    if (!recommendations || !Array.isArray(recommendations)) {
      recommendations = generateFallbackRecommendations(
        skillGaps,
        jobRole,
        experienceLevel
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: { recommendations },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Error generating recommendations:", error);

    // Return basic fallback
    const fallback = [
      {
        title: "Explore Coursera Courses",
        description: "Browse thousands of courses to enhance your skills",
        link: "https://www.coursera.org/",
        skill: "General",
      },
      {
        title: "FreeCodeCamp Learning Paths",
        description: "Free, comprehensive programming tutorials and projects",
        link: "https://www.freecodecamp.org/",
        skill: "Programming",
      },
      {
        title: "Udemy Skill Development",
        description: "Affordable courses across various technical domains",
        link: "https://www.udemy.com/",
        skill: "General",
      },
    ];

    return NextResponse.json(
      {
        success: true,
        data: { recommendations: fallback },
      },
      { status: 200 }
    );
  }
}

function generateFallbackRecommendations(
  skillGaps: string[],
  jobRole: string,
  experienceLevel: string
): any[] {
  const recommendations = [];

  // Map common skills to real course links
  const skillLinks: Record<
    string,
    { title: string; link: string; description: string }
  > = {
    JavaScript: {
      title: "The Complete JavaScript Course 2024",
      link: "https://www.udemy.com/course/the-complete-javascript-course/",
      description:
        "Master JavaScript with projects, challenges and theory. Learn modern JavaScript from scratch!",
    },
    Python: {
      title: "Python for Everybody Specialization",
      link: "https://www.coursera.org/specializations/python",
      description:
        "Learn to program and analyze data with Python from University of Michigan.",
    },
    React: {
      title: "React - The Complete Guide 2024",
      link: "https://www.udemy.com/course/react-the-complete-guide-incl-redux/",
      description:
        "Dive in and learn React from scratch! Learn React, Hooks, Redux, React Router, Next.js.",
    },
    "Node.js": {
      title: "The Complete Node.js Developer Course",
      link: "https://www.udemy.com/course/the-complete-nodejs-developer-course-2/",
      description:
        "Learn Node.js by building real-world applications with Node, Express, MongoDB, and more.",
    },
    Java: {
      title: "Java Programming Masterclass",
      link: "https://www.udemy.com/course/java-the-complete-java-developer-course/",
      description:
        "Learn Java programming from basics to advanced concepts with hands-on projects.",
    },
    SQL: {
      title: "The Complete SQL Bootcamp",
      link: "https://www.udemy.com/course/the-complete-sql-bootcamp/",
      description:
        "Master SQL with PostgreSQL, MySQL. Learn database design and queries.",
    },
    AWS: {
      title: "AWS Certified Solutions Architect",
      link: "https://www.coursera.org/learn/aws-certified-solutions-architect-associate",
      description:
        "Prepare for AWS certification and learn cloud architecture best practices.",
    },
    "Data Structures": {
      title: "Master the Coding Interview: Data Structures + Algorithms",
      link: "https://www.udemy.com/course/master-the-coding-interview-data-structures-algorithms/",
      description:
        "Learn data structures and algorithms to ace coding interviews at top tech companies.",
    },
    "Machine Learning": {
      title: "Machine Learning Specialization",
      link: "https://www.coursera.org/specializations/machine-learning-introduction",
      description:
        "Learn the fundamentals of Machine Learning from Andrew Ng at Stanford.",
    },
    // Firmware/Embedded specific
    "Embedded C Programming": {
      title: "Embedded Systems - Shape The World",
      link: "https://www.coursera.org/specializations/embedded-systems",
      description:
        "Learn embedded systems programming with ARM Cortex-M processors and C.",
    },
    "Microcontroller Architecture": {
      title: "Introduction to Embedded Systems Software and Development",
      link: "https://www.coursera.org/learn/introduction-embedded-systems",
      description:
        "Understand microcontroller architecture, peripherals, and embedded software development.",
    },
    "Firmware Development Frameworks": {
      title: "Real-Time Operating Systems (RTOS)",
      link: "https://www.udemy.com/course/mastering-rtos-hands-on-with-freertos-arduino-and-stm32fx/",
      description:
        "Master FreeRTOS and embedded firmware frameworks for real-time applications.",
    },
    RTOS: {
      title: "Mastering RTOS: Hands on FreeRTOS and STM32Fx",
      link: "https://www.udemy.com/course/mastering-rtos-hands-on-with-freertos-arduino-and-stm32fx/",
      description:
        "Complete guide to Real-Time Operating Systems with practical projects.",
    },
    "ARM Architecture": {
      title: "ARM Cortex-M Bare-Metal Embedded-C Programming",
      link: "https://www.udemy.com/course/cortex-m-internals-master-pointers-structures-memory-etc/",
      description:
        "Deep dive into ARM Cortex-M architecture and bare-metal programming.",
    },
    TypeScript: {
      title: "Understanding TypeScript",
      link: "https://www.udemy.com/course/understanding-typescript/",
      description:
        "Master TypeScript and build enterprise-level JavaScript applications.",
    },
    Docker: {
      title: "Docker and Kubernetes: The Complete Guide",
      link: "https://www.udemy.com/course/docker-and-kubernetes-the-complete-guide/",
      description:
        "Build, test, and deploy Docker applications with Kubernetes.",
    },
    Git: {
      title: "Git Complete: The definitive guide",
      link: "https://www.udemy.com/course/git-complete/",
      description:
        "Master Git and GitHub for version control and collaboration.",
    },
  };

  // Add recommendations for skill gaps
  for (const skill of skillGaps.slice(0, 3)) {
    const courseInfo = skillLinks[skill];
    if (courseInfo) {
      recommendations.push({
        title: courseInfo.title,
        description: courseInfo.description,
        link: courseInfo.link,
        skill: skill,
      });
    } else {
      // Generic recommendation for unknown skills
      recommendations.push({
        title: `Learn ${skill}`,
        description: `Comprehensive ${skill} course tailored for ${experienceLevel} ${jobRole} professionals.`,
        link: `https://www.coursera.org/search?query=${encodeURIComponent(
          skill
        )}`,
        skill: skill,
      });
    }
  }

  // If no gaps, add advanced recommendations based on job role
  if (recommendations.length === 0) {
    if (
      jobRole.toLowerCase().includes("firmware") ||
      jobRole.toLowerCase().includes("embedded")
    ) {
      recommendations.push(
        {
          title: "Advanced Embedded Systems Design",
          link: "https://www.coursera.org/learn/embedded-systems-design",
          description:
            "Master advanced embedded systems design patterns and optimization techniques.",
          skill: jobRole,
        },
        {
          title: "Embedded Linux Development",
          link: "https://www.udemy.com/course/embedded-linux-step-by-step-using-beaglebone/",
          description:
            "Learn embedded Linux development for advanced firmware engineering.",
          skill: jobRole,
        }
      );
    } else {
      recommendations.push(
        {
          title: "Advanced System Design",
          link: "https://www.coursera.org/specializations/software-design-architecture",
          description:
            "Master scalable system design patterns for senior engineers.",
          skill: jobRole,
        },
        {
          title: "Software Architecture & Design",
          link: "https://www.udemy.com/course/software-architecture-design-patterns/",
          description:
            "Learn architectural patterns and best practices for enterprise applications.",
          skill: jobRole,
        }
      );
    }
  }

  return recommendations;
}

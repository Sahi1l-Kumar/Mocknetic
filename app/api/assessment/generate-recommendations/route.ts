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
        // Build recommendation prompt with REAL course links
        const prompt = `You are a career development expert with access to real online course databases.

Job Role: ${jobRole}
Experience Level: ${experienceLevel || "Entry Level"}
Overall Score: ${overallScore}%
Skills needing improvement: ${skillGaps.length > 0 ? skillGaps.join(", ") : "None - all skills mastered"}

Task: Generate ${skillGaps.length > 0 ? "3-5" : "3"} SPECIFIC learning resource recommendations.

${
  skillGaps.length > 0
    ? `For each weak skill, recommend ONE real, existing course or resource.`
    : `Since all skills are mastered, recommend advanced resources for ${jobRole}.`
}

CRITICAL INSTRUCTIONS FOR LINKS:
- Use ONLY these verified course patterns:
  * Coursera: https://www.coursera.org/learn/[exact-course-slug]
  * Udemy: https://www.udemy.com/course/[exact-course-slug]
  * FreeCodeCamp: https://www.freecodecamp.org/learn/
  * YouTube: Real playlist URLs only
  * Official Docs: reactjs.org, python.org, nodejs.org, etc.

- For popular skills, use these VERIFIED REAL links:
  * JavaScript: https://www.udemy.com/course/the-complete-javascript-course/
  * Python: https://www.coursera.org/specializations/python
  * React: https://www.udemy.com/course/react-the-complete-guide-incl-redux/
  * Node.js: https://www.udemy.com/course/the-complete-nodejs-developer-course-2/
  * Java: https://www.udemy.com/course/java-the-complete-java-developer-course/
  * Data Structures: https://www.udemy.com/course/master-the-coding-interview-data-structures-algorithms/
  * Machine Learning: https://www.coursera.org/specializations/machine-learning-introduction
  * AWS: https://www.coursera.org/learn/aws-cloud-technical-essentials
  * Docker: https://www.udemy.com/course/docker-and-kubernetes-the-complete-guide/
  * SQL: https://www.udemy.com/course/the-complete-sql-bootcamp/

- If unsure about a link, use: https://www.coursera.org/search?query=[skill-name]

Requirements per recommendation:
1. title: Exact course name (e.g., "The Complete JavaScript Course 2024")
2. description: 1-2 sentences on what they'll learn
3. link: A REAL, working URL (verify against list above)
4. skill: The skill this addresses

Return ONLY a JSON array, no markdown:
[
  {
    "title": "The Complete JavaScript Course 2024",
    "description": "Master JavaScript with projects, challenges and theory from beginner to advanced.",
    "link": "https://www.udemy.com/course/the-complete-javascript-course/",
    "skill": "JavaScript"
  }
]`;

        const { text } = await generateText({
          model: groq("llama-3.1-8b-instant"),
          prompt: `You are a career advisor. Return ONLY valid JSON array. No markdown, no code blocks.

${prompt}`,
          temperature: 0.7,
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
          cleanedText = arrayMatch[0];
        }

        recommendations = JSON.parse(cleanedText);

        // Validate structure
        if (!Array.isArray(recommendations)) {
          throw new Error("Response is not an array");
        }

        // Validate and fix links
        recommendations = recommendations.map((rec: any) => {
          let link = rec.link || "https://www.coursera.org/";

          // Validate link format
          if (!link.startsWith("http")) {
            link = `https://www.coursera.org/search?query=${encodeURIComponent(rec.skill || jobRole)}`;
          }

          return {
            title: rec.title || "Learning Resource",
            description: rec.description || "Enhance your skills",
            link: link,
            skill: rec.skill || jobRole,
          };
        });

        console.log(`✅ Generated ${recommendations.length} recommendations`);
      } catch (parseError) {
        console.error("❌ Failed to parse AI response:", parseError);
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

  // Map common skills to VERIFIED REAL course links (all tested and working)
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
      title: "AWS Cloud Technical Essentials",
      link: "https://www.coursera.org/learn/aws-cloud-technical-essentials",
      description:
        "Learn AWS fundamentals and prepare for cloud architecture certification.",
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
    "Embedded C Programming": {
      title: "Embedded Systems - Shape The World",
      link: "https://www.coursera.org/specializations/embedded-systems",
      description:
        "Learn embedded systems programming with ARM Cortex-M processors and C.",
    },
    "Microcontroller Architecture": {
      title: "Introduction to Embedded Systems Software",
      link: "https://www.coursera.org/learn/introduction-embedded-systems",
      description:
        "Understand microcontroller architecture, peripherals, and embedded software development.",
    },
    "Firmware Development Frameworks": {
      title: "Mastering RTOS: Hands on FreeRTOS",
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
    MongoDB: {
      title: "MongoDB - The Complete Developer's Guide",
      link: "https://www.udemy.com/course/mongodb-the-complete-developers-guide/",
      description:
        "Master MongoDB development from scratch with Node.js integration.",
    },
    Angular: {
      title: "Angular - The Complete Guide",
      link: "https://www.udemy.com/course/the-complete-guide-to-angular-2/",
      description:
        "Master Angular and build awesome, reactive web apps with this comprehensive guide.",
    },
    "System Design": {
      title: "Grokking the System Design Interview",
      link: "https://www.educative.io/courses/grokking-the-system-design-interview",
      description:
        "Learn to design large-scale systems and ace system design interviews.",
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
          link: "https://www.coursera.org/specializations/embedded-systems",
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
          title: "Software Design and Architecture Specialization",
          link: "https://www.coursera.org/specializations/software-design-architecture",
          description:
            "Master scalable system design patterns for senior engineers.",
          skill: jobRole,
        },
        {
          title: "System Design Interview Preparation",
          link: "https://www.educative.io/courses/grokking-the-system-design-interview",
          description:
            "Learn architectural patterns and best practices for enterprise applications.",
          skill: jobRole,
        }
      );
    }
  }

  return recommendations;
}

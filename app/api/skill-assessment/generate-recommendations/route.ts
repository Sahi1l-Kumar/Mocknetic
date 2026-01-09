import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import { generateText } from "ai";
import { groq } from "@ai-sdk/groq";
import { Recommendation, RecommendationsResponse } from "@/types/global";

interface CourseInfo {
  title: string;
  link: string;
  description: string;
}

export async function POST(
  req: NextRequest
): Promise<NextResponse<RecommendationsResponse>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const jobRole = body.jobRole || "";
    const experienceLevel = body.experienceLevel || "Entry Level";
    const skillGaps = Array.isArray(body.skillGaps) ? body.skillGaps : [];
    const overallScore = body.overallScore || 0;

    if (!jobRole) {
      console.error("Validation failed: jobRole is empty");
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request: jobRole is required",
        },
        { status: 400 }
      );
    }

    let recommendations: any;
    const apiKey = process.env.GROQ_API_KEY;

    if (apiKey) {
      try {
        const allowedLinksDescription = `
You MUST choose the "link" field from either:
A) These fixed course URLs (do NOT modify them), OR
B) The search URL patterns shown below where you insert the skill name.

FIXED COURSE URLS (use exactly as written):
- JavaScript:
  - "The Complete JavaScript Course 2024" -> https://www.udemy.com/course/the-complete-javascript-course/
- Python:
  - "Python for Everybody Specialization" -> https://www.coursera.org/specializations/python
- React:
  - "React - The Complete Guide 2024" -> https://www.udemy.com/course/react-the-complete-guide-incl-redux/
- Node.js:
  - "The Complete Node.js Developer Course" -> https://www.udemy.com/course/the-complete-nodejs-developer-course-2/
- Java:
  - "Java Programming Masterclass" -> https://www.udemy.com/course/java-the-complete-java-developer-course/
- SQL:
  - "The Complete SQL Bootcamp" -> https://www.udemy.com/course/the-complete-sql-bootcamp/
- AWS:
  - "AWS Certified Solutions Architect" -> https://www.coursera.org/learn/aws-certified-solutions-architect-associate
- Data Structures:
  - "Master the Coding Interview: Data Structures + Algorithms" -> https://www.udemy.com/course/master-the-coding-interview-data-structures-algorithms/
- Machine Learning:
  - "Machine Learning Specialization" -> https://www.coursera.org/specializations/machine-learning-introduction
- Embedded C Programming:
  - "Embedded Systems - Shape The World" -> https://www.coursera.org/specializations/embedded-systems
- Microcontroller Architecture:
  - "Introduction to Embedded Systems Software and Development" -> https://www.coursera.org/learn/introduction-embedded-systems
- Firmware Development Frameworks / RTOS:
  - "Mastering RTOS: Hands on FreeRTOS and STM32Fx" -> https://www.udemy.com/course/mastering-rtos-hands-on-with-freertos-arduino-and-stm32fx/
- ARM Architecture:
  - "ARM Cortex-M Bare-Metal Embedded-C Programming" -> https://www.udemy.com/course/cortex-m-internals-master-pointers-structures-memory-etc/
- TypeScript:
  - "Understanding TypeScript" -> https://www.udemy.com/course/understanding-typescript/
- Docker:
  - "Docker and Kubernetes: The Complete Guide" -> https://www.udemy.com/course/docker-and-kubernetes-the-complete-guide/
- Git:
  - "Git Complete: The definitive guide" -> https://www.udemy.com/course/git-complete/

SEARCH URL PATTERNS (preferred when there is no exact fixed course for the skill):
- Coursera: https://www.coursera.org/search?query=SKILL_NAME
- Udemy: https://www.udemy.com/courses/search/?q=SKILL_NAME
- YouTube: https://www.youtube.com/results?search_query=SKILL_NAME
- GeeksforGeeks: https://www.geeksforgeeks.org/search/?q=SKILL_NAME
- freeCodeCamp: https://www.freecodecamp.org/news/search/?query=SKILL_NAME

Where SKILL_NAME is the skill string URL-encoded (spaces replaced with %20).

You are NOT allowed to output just bare homepages like "https://www.youtube.com/" or "https://www.udemy.com/".
If none of the fixed course URLs match the skill, you MUST use an appropriate search URL pattern above with SKILL_NAME filled in.
`;

        const prompt = `You are a career development expert specializing in skill development and learning resources.

Job Role: ${jobRole}
Experience Level: ${experienceLevel}
Overall Score: ${overallScore}%
Skills needing improvement: ${
          skillGaps.length > 0
            ? skillGaps.join(", ")
            : "None - all skills mastered"
        }

Task: Generate ${skillGaps.length > 0 ? "3-5" : "3"} high-quality learning resource recommendations as a JSON array.

${
  skillGaps.length > 0
    ? `For each weak skill, recommend ONE specific, actionable learning resource (course, tutorial series, or documentation).`
    : `Since all skills are mastered, recommend advanced/specialized resources for ${jobRole} professionals using the allowed links list.`
}

${allowedLinksDescription}

STRICT REQUIREMENTS:
1. Do not invent or guess random URLs. Use ONLY either a fixed course URL given above or a search URL built from the patterns above with the SKILL_NAME inserted.
2. Never return a plain homepage like "https://www.youtube.com/". Always target a course or a search results page.
3. Each recommendation object must contain:
   - "title": Clear, specific course/resource name.
   - "description": 1-2 sentences explaining what they'll learn and why it's valuable.
   - "link": EXACTLY one valid URL as defined above.
   - "skill": The skill this addresses (from the gaps list, or advanced skill related to ${jobRole}).

Return ONLY a JSON array with no markdown formatting or code blocks. Example structure:
[
  {
    "title": "JavaScript: Understanding the Weird Parts",
    "description": "Deep dive into JavaScript's core concepts including closures, prototypes, and async patterns essential for senior developers.",
    "link": "https://www.udemy.com/course/the-complete-javascript-course/",
    "skill": "JavaScript"
  }
]`;

        const { text } = await generateText({
          model: groq("llama-3.1-8b-instant"),
          prompt,
          system:
            "You are a career advisor. Return ONLY a valid JSON array. No markdown, no code blocks, no explanations.",
          temperature: 0.4,
        });

        console.log("AI Response:", text);

        let cleanedText = text.trim();

        if (cleanedText.startsWith("```")) {
          cleanedText = cleanedText
            .replace(/```json?\n?/g, "")
            .replace(/```/g, "")
            .trim();
        }

        const arrayMatch = cleanedText.match(/\[[\s\S]*\]/);
        if (arrayMatch) {
          cleanedText = arrayMatch[0];
        }

        const parsedRecommendations = JSON.parse(cleanedText);

        if (!Array.isArray(recommendations)) {
          throw new Error("Response is not an array");
        }

        // Post-process: convert any plain homepage into a search URL for that skill
        recommendations = recommendations.map((rec: any) => {
          const skill = rec.skill || jobRole;
          const encodedSkill = encodeURIComponent(skill);

          let link: string = rec.link || "";
          const lower = link.toLowerCase();

          if (lower === "https://www.coursera.org/") {
            link = `https://www.coursera.org/search?query=${encodedSkill}`;
          } else if (lower === "https://www.udemy.com/") {
            link = `https://www.udemy.com/courses/search/?q=${encodedSkill}`;
          } else if (
            lower === "https://www.youtube.com/" ||
            lower === "https://youtube.com/"
          ) {
            link = `https://www.youtube.com/results?search_query=${encodedSkill}`;
          } else if (lower === "https://www.geeksforgeeks.org/") {
            link = `https://www.geeksforgeeks.org/search/?q=${encodedSkill}`;
          } else if (lower === "https://www.freecodecamp.org/") {
            link = `https://www.freecodecamp.org/news/search/?query=${encodedSkill}`;
          }

          return {
            title: rec.title || "Learning Resource",
            description: rec.description || "Enhance your skills.",
            link:
              link || `https://www.coursera.org/search?query=${encodedSkill}`,
            skill,
          };
        });

        console.log(`Generated ${recommendations.length} recommendations`);
      } catch (parseError) {
        console.error("Failed to parse AI response:", parseError);
        recommendations = null;
      }
    } else {
      console.warn("Groq API key not found, using fallback recommendations");
    }

    if (!recommendations || !Array.isArray(recommendations)) {
      recommendations = generateFallbackRecommendations(
        skillGaps,
        jobRole,
        experienceLevel
      );
    }

    return NextResponse.json<RecommendationsResponse>(
      {
        success: true,
        data: { recommendations },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error generating recommendations:", error);

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

    return NextResponse.json<RecommendationsResponse>(
      {
        success: true,
        data: { recommendations: fallback },
      },
      { status: 200 }
    );
  }
}

// unchanged fallback, but now already uses Coursera search for unknown skills
function generateFallbackRecommendations(
  skillGaps: string[],
  jobRole: string,
  experienceLevel: string
): any[] {
  const recommendations: any[] = [];

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

  for (const skill of skillGaps.slice(0, 3)) {
    const courseInfo = skillLinks[skill];
    if (courseInfo) {
      recommendations.push({
        title: courseInfo.title,
        description: courseInfo.description,
        link: courseInfo.link,
        skill,
      });
    } else {
      const encodedSkill = encodeURIComponent(skill);
      recommendations.push({
        title: `Learn ${skill}`,
        description: `Comprehensive ${skill} course tailored for ${experienceLevel} ${jobRole} professionals.`,
        link: `https://www.coursera.org/search?query=${encodedSkill}`,
        skill,
      });
    }
  }

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

import * as cheerio from "cheerio";
import { groq } from "@ai-sdk/groq";
import { generateText } from "ai";

export interface EnrichedCurriculum {
  originalCurriculum: string;
  keyTopics: string[];
  conceptExplanations: Record<string, string>;
  equationExamples: Array<{ latex: string; description: string }>;
  realWorldApplications: string[];
  commonlyTestedAreas: string[];
  universityLevelExamples: string[];
  suggestedBloomsLevel: number;
}

interface SearchResult {
  url: string;
  title: string;
  snippet: string;
}

export async function enrichCurriculumWithWebContent(
  topic: string,
  curriculum: string,
): Promise<EnrichedCurriculum> {
  try {
    console.log("📚 Starting curriculum enrichment...");
    console.log("Topic:", topic);
    console.log("Curriculum:", curriculum.substring(0, 200));

    const keyTopics = await extractKeyTopics(curriculum);
    console.log("🔑 Extracted key topics:", keyTopics);

    const conceptExplanations: Record<string, string> = {};
    const equationExamples: Array<{ latex: string; description: string }> = [];
    const realWorldApplications: string[] = [];

    let totalSuccessfulScrapes = 0;
    for (const keyTopic of keyTopics.slice(0, 3)) {
      try {
        console.log(`🔍 Searching web for: "${keyTopic}"`);

        const searchResults = await searchWeb(keyTopic);
        console.log(`📊 Found ${searchResults.length} search results`);

        for (const result of searchResults.slice(0, 3)) {
          try {
            console.log(`🌐 Scraping: ${result.url}`);
            const content = await scrapeWebPage(result.url);

            if (content) {
              totalSuccessfulScrapes++;

              if (!conceptExplanations[keyTopic]) {
                conceptExplanations[keyTopic] = content.summary;
              } else {
                conceptExplanations[keyTopic] += " " + content.summary;
              }

              equationExamples.push(...content.equations);
              realWorldApplications.push(...content.applications);

              console.log(`✅ Successfully scraped: ${result.title}`);
            }
          } catch {
            console.warn(`⚠️ Failed to scrape ${result.url}`);
          }
        }
      } catch {
        console.error(`❌ Error processing topic "${keyTopic}"`);
      }
    }

    console.log(`📈 Total successful scrapes: ${totalSuccessfulScrapes}`);

    if (
      Object.keys(conceptExplanations).length === 0 ||
      totalSuccessfulScrapes === 0
    ) {
      console.log(
        "🤖 Web scraping insufficient, using AI to generate educational context...",
      );
      const aiGenerated = await generateEducationalContextWithAI(
        curriculum,
        keyTopics,
      );

      Object.assign(conceptExplanations, aiGenerated.conceptExplanations);
      realWorldApplications.push(...aiGenerated.realWorldApplications);
      equationExamples.push(...aiGenerated.equationExamples);
    }

    const commonlyTested = await identifyCommonlyTestedAreasWithAI(
      keyTopics,
      curriculum,
    );
    const universityExamples = await generateUniversityExamplesWithAI(
      keyTopics,
      curriculum,
    );
    const bloomsLevel = suggestBloomsLevel(curriculum);

    const result = {
      originalCurriculum: curriculum,
      keyTopics,
      conceptExplanations,
      equationExamples,
      realWorldApplications: [...new Set(realWorldApplications)].slice(0, 10),
      commonlyTestedAreas: commonlyTested,
      universityLevelExamples: universityExamples,
      suggestedBloomsLevel: bloomsLevel,
    };

    console.log("✅ Enrichment complete:", {
      topics: keyTopics.length,
      explanations: Object.keys(conceptExplanations).length,
      equations: equationExamples.length,
      applications: realWorldApplications.length,
    });

    return result;
  } catch {
    console.error("❌ Error enriching curriculum");
    return await generateFullAIEnrichment(curriculum);
  }
}

/**
 * AI-POWERED: Extract key topics from ANY curriculum format
 */
async function extractKeyTopics(curriculum: string): Promise<string[]> {
  console.log("🔍 Extracting topics from curriculum with AI...");

  if (!curriculum || curriculum.trim().length < 10) {
    return ["General Computer Science"];
  }

  try {
    const prompt = `You are an expert educator analyzing a curriculum to extract key topics.

CURRICULUM TEXT:
"${curriculum}"

Extract 5-8 KEY TOPICS that are central to this curriculum. 

RULES:
- Focus on CONCRETE topics (e.g., "Binary Search Trees", "Hash Tables", "Arrays")
- Avoid generic words like "manipulation", "operations", "concepts" alone
- If a topic has subtopics, keep them together (e.g., "Stacks and Queues")
- Keep topics concise (2-5 words each)
- Make topics searchable for educational content
- For data structures, be specific (e.g., "Linked Lists" not just "Lists")

Return ONLY a JSON array of topics (no markdown, no explanations):
["Topic 1", "Topic 2", "Topic 3", "Topic 4", "Topic 5"]`;

    const result = await generateText({
      model: groq("llama-3.3-70b-versatile"),
      prompt,
      temperature: 0.3,
    });

    let content = result.text.trim();

    if (content.includes("```")) {
      const match = content.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (match && match[1]) {
        content = match[1].trim();
      }
    }

    const arrayMatch = content.match(/\[[\s\S]*?\]/);
    if (!arrayMatch) {
      throw new Error("No array found in AI response");
    }

    const cleanedArray = arrayMatch[0]
      .replace(/[\x00-\x1F\x7F]/g, "")
      .replace(/,(\s*\])/g, "$1")
      .replace(/\s+/g, " ");

    const topics = JSON.parse(cleanedArray) as string[];

    if (Array.isArray(topics) && topics.length > 0) {
      const validTopics = topics
        .filter((t) => typeof t === "string" && t.trim().length > 3)
        .map((t) => t.trim())
        .slice(0, 8);

      console.log(`📋 AI extracted ${validTopics.length} topics:`, validTopics);
      return validTopics;
    }

    throw new Error("Invalid topics array");
  } catch {
    console.warn("⚠️ AI topic extraction failed, using fallback");
    return fallbackTopicExtraction(curriculum);
  }
}

/**
 * Fallback: Rule-based extraction when AI fails
 */
function fallbackTopicExtraction(curriculum: string): string[] {
  console.log("📋 Using fallback topic extraction...");

  const topics: string[] = [];
  const cleaned = curriculum
    .replace(/(?:CO|Unit|Module|Chapter|Topic)\s*\d+\s*[:-]?\s*/gi, "")
    .replace(/https?:\/\/[^\s]+/g, "")
    .trim();

  const segments = cleaned.split(/[.\n;]/);

  for (const segment of segments) {
    const trimmed = segment.trim();

    if (trimmed.includes(":")) {
      const beforeColon = trimmed.split(":")[0].trim();
      if (beforeColon.length >= 5 && beforeColon.length <= 50) {
        topics.push(beforeColon);
      }

      const afterColon = trimmed.split(":")[1]?.trim() || "";
      const subtopics = afterColon
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length >= 5 && s.length <= 50);

      topics.push(...subtopics.slice(0, 2));
    } else if (trimmed.length >= 10 && trimmed.length <= 80) {
      topics.push(trimmed);
    }
  }

  const genericTerms = [
    "operations",
    "manipulation",
    "concepts",
    "basics",
    "introduction",
    "overview",
  ];

  const filtered = [...new Set(topics)]
    .filter((topic) => {
      const lower = topic.toLowerCase();
      return !genericTerms.some((term) => lower === term);
    })
    .slice(0, 8);

  if (filtered.length === 0) {
    return detectDomainTopics(curriculum);
  }

  console.log(`📋 Fallback extracted ${filtered.length} topics:`, filtered);
  return filtered;
}

/**
 * Domain detection for common CS subjects
 */
function detectDomainTopics(curriculum: string): string[] {
  const curriculumLower = curriculum.toLowerCase();
  const topics: string[] = [];

  const domainKeywords: Record<string, string[]> = {
    "data structures": [
      "array",
      "linked list",
      "stack",
      "queue",
      "tree",
      "graph",
      "hash",
      "heap",
    ],
    algorithms: [
      "sorting",
      "searching",
      "dynamic programming",
      "greedy",
      "divide and conquer",
      "backtracking",
    ],
    "digital logic": [
      "logic gate",
      "boolean",
      "combinational",
      "sequential",
      "flip flop",
      "multiplexer",
    ],
    "signal processing": [
      "fourier",
      "z-transform",
      "filter",
      "convolution",
      "dsp",
      "signal",
    ],
    networking: ["tcp", "ip", "protocol", "routing", "osi model", "network"],
    database: ["sql", "relational", "normalization", "query", "database"],
  };

  for (const [domain, keywords] of Object.entries(domainKeywords)) {
    const matchCount = keywords.filter((kw) =>
      curriculumLower.includes(kw),
    ).length;

    if (matchCount >= 2) {
      keywords.forEach((kw) => {
        if (curriculumLower.includes(kw)) {
          topics.push(kw.charAt(0).toUpperCase() + kw.slice(1));
        }
      });

      if (topics.length > 0) {
        console.log(
          `📋 Domain detected: ${domain}, extracted ${topics.length} topics`,
        );
        return topics.slice(0, 6);
      }
    }
  }

  return ["Computer Science Fundamentals"];
}

async function generateEducationalContextWithAI(
  curriculum: string,
  keyTopics: string[],
): Promise<{
  conceptExplanations: Record<string, string>;
  realWorldApplications: string[];
  equationExamples: Array<{ latex: string; description: string }>;
}> {
  try {
    const prompt = `You are an expert university professor creating educational context for the following curriculum:

CURRICULUM: "${curriculum}"
KEY TOPICS: ${keyTopics.join(", ")}

Provide comprehensive educational context in JSON format.

IMPORTANT JSON RULES:
- Use ONLY double quotes for strings
- Escape special characters properly
- Do NOT use single quotes
- Keep explanations concise and free of special characters

Example format:
{
  "conceptExplanations": {
    "topic1": "Explanation without special chars. Keep it simple.",
    "topic2": "Another explanation."
  },
  "realWorldApplications": [
    "Application 1",
    "Application 2",
    "Application 3",
    "Application 4",
    "Application 5"
  ],
  "equationExamples": []
}

CONTENT REQUIREMENTS:
- Provide accurate, university-level explanations
- Be specific to the curriculum topic
- Include technical details
- Real applications should be concrete and relevant
- Only include equations if they are actually relevant to this subject
- If no equations are relevant, return empty array
- Keep explanations concise (2-3 sentences each)

Return ONLY valid JSON with no markdown, no code blocks, no extra text:`;

    const result = await generateText({
      model: groq("llama-3.3-70b-versatile"),
      prompt,
      temperature: 0.5,
    });

    const content = result.text.trim();
    let jsonText = content;

    if (content.includes("```")) {
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch && jsonMatch[1]) {
        jsonText = jsonMatch[1].trim();
      }
    }

    const objectMatch = jsonText.match(/\{[\s\S]*\}/);
    if (!objectMatch) {
      throw new Error("No JSON object found in response");
    }

    jsonText = objectMatch[0];

    jsonText = jsonText
      .replace(/[\x00-\x1F\x7F]/g, "")
      .replace(/,(\s*[}\]])/g, "$1")
      .replace(/\s+/g, " ");

    let parsed;
    try {
      parsed = JSON.parse(jsonText);
    } catch {
      console.warn("First parse failed, trying aggressive cleanup...");

      jsonText = jsonText
        .replace(/([^\\])\\([^"\\nrtbf/u])/g, "$1$2")
        .replace(/\\\\/g, "\\");

      parsed = JSON.parse(jsonText);
    }

    console.log("🤖 AI-generated educational context successfully");
    return {
      conceptExplanations: parsed.conceptExplanations || {},
      realWorldApplications: parsed.realWorldApplications || [],
      equationExamples: parsed.equationExamples || [],
    };
  } catch {
    console.error("❌ AI context generation failed");

    return {
      conceptExplanations: {
        [keyTopics[0] || "main topic"]:
          `This curriculum covers ${curriculum}. It encompasses fundamental concepts, practical applications, and analytical techniques essential for understanding this domain in engineering and technology contexts.`,
      },
      realWorldApplications: [
        "Industry applications in engineering projects",
        "Research and development in academia",
        "Problem-solving in professional settings",
        "Innovation and design in technology sectors",
        "Analysis and optimization in practical scenarios",
      ],
      equationExamples: [],
    };
  }
}

async function identifyCommonlyTestedAreasWithAI(
  keyTopics: string[],
  curriculum: string,
): Promise<string[]> {
  try {
    const prompt = `You are a university professor identifying commonly tested areas for an exam.

CURRICULUM: "${curriculum}"
KEY TOPICS: ${keyTopics.join(", ")}

List 6 specific areas that are commonly tested in university exams for this subject.
Be SPECIFIC, TECHNICAL, and RELEVANT to the exact curriculum provided.

Requirements:
- Each area should be testable and concrete
- Use proper technical terminology
- Focus on concepts that require understanding, not just memorization
- Be specific to this curriculum (avoid generic statements)
- Keep each item under 100 characters

Return ONLY a JSON array of strings (no markdown, no code blocks):
["Area 1", "Area 2", "Area 3", "Area 4", "Area 5", "Area 6"]`;

    const result = await generateText({
      model: groq("llama-3.3-70b-versatile"),
      prompt,
      temperature: 0.4,
    });

    let content = result.text.trim();
    if (content.includes("```")) {
      const match = content.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (match && match[1]) {
        content = match[1].trim();
      }
    }

    const arrayMatch = content.match(/\[[\s\S]*?\]/);
    if (!arrayMatch) {
      throw new Error("No array found");
    }

    const cleanedArray = arrayMatch[0]
      .replace(/[\x00-\x1F\x7F]/g, "")
      .replace(/,(\s*\])/g, "$1")
      .replace(/\s+/g, " ");

    const areas = JSON.parse(cleanedArray);

    if (Array.isArray(areas) && areas.length > 0) {
      console.log("🤖 AI-generated commonly tested areas");
      return areas.slice(0, 6);
    }

    throw new Error("Invalid array format");
  } catch {
    console.warn("⚠️ AI commonly tested areas failed, using generic");
    return [
      "Fundamental concepts and theoretical foundations",
      "Problem-solving and analytical techniques",
      "Practical applications and case studies",
      "Design and implementation methodologies",
      "Comparative analysis and evaluation",
      "Real-world scenario applications",
    ];
  }
}

async function generateUniversityExamplesWithAI(
  keyTopics: string[],
  curriculum: string,
): Promise<string[]> {
  try {
    const prompt = `You are a university professor creating example questions.

CURRICULUM: "${curriculum}"
KEY TOPICS: ${keyTopics.join(", ")}

Generate 5 university-level question examples that test higher-order thinking (Bloom's Level 4-6: Analyze, Evaluate, Create).

Requirements:
- SPECIFIC to this exact curriculum
- Require multi-step reasoning and deep understanding
- Test application, analysis, or design skills (NOT memorization)
- Use proper technical terminology
- Be challenging but fair for B.Tech students
- Each question should be complete and standalone
- Keep each question under 150 characters

Return ONLY a JSON array (no markdown, no code blocks):
["Question 1", "Question 2", "Question 3", "Question 4", "Question 5"]`;

    const result = await generateText({
      model: groq("llama-3.3-70b-versatile"),
      prompt,
      temperature: 0.6,
    });

    let content = result.text.trim();
    if (content.includes("```")) {
      const match = content.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (match && match[1]) {
        content = match[1].trim();
      }
    }

    const arrayMatch = content.match(/\[[\s\S]*?\]/);
    if (!arrayMatch) {
      throw new Error("No array found");
    }

    const cleanedArray = arrayMatch[0]
      .replace(/[\x00-\x1F\x7F]/g, "")
      .replace(/,(\s*\])/g, "$1")
      .replace(/\s+/g, " ");

    const examples = JSON.parse(cleanedArray);

    if (Array.isArray(examples) && examples.length > 0) {
      console.log("🤖 AI-generated university examples");
      return examples.slice(0, 5);
    }

    throw new Error("Invalid array format");
  } catch {
    console.warn("⚠️ AI examples generation failed, using generic");
    return [
      `Analyze the fundamental principles of ${keyTopics[0] || "this topic"} and explain their practical implications`,
      `Design a solution to a complex problem using concepts from ${keyTopics[1] || "the curriculum"}`,
      `Evaluate different approaches to implementing ${keyTopics[0] || "these concepts"} and justify your recommendation`,
      `Apply theoretical frameworks to solve a real-world engineering challenge in this domain`,
      `Compare and contrast different methodologies and assess their effectiveness in various scenarios`,
    ];
  }
}

async function generateFullAIEnrichment(
  curriculum: string,
): Promise<EnrichedCurriculum> {
  console.log("🆘 Using full AI enrichment as last resort...");

  const keyTopics = await extractKeyTopics(curriculum);
  const aiContext = await generateEducationalContextWithAI(
    curriculum,
    keyTopics,
  );
  const commonlyTested = await identifyCommonlyTestedAreasWithAI(
    keyTopics,
    curriculum,
  );
  const universityExamples = await generateUniversityExamplesWithAI(
    keyTopics,
    curriculum,
  );

  return {
    originalCurriculum: curriculum,
    keyTopics,
    conceptExplanations: aiContext.conceptExplanations,
    equationExamples: aiContext.equationExamples,
    realWorldApplications: aiContext.realWorldApplications,
    commonlyTestedAreas: commonlyTested,
    universityLevelExamples: universityExamples,
    suggestedBloomsLevel: suggestBloomsLevel(curriculum),
  };
}

async function searchWeb(query: string): Promise<SearchResult[]> {
  try {
    const educationalQuery = `${query} tutorial university`;
    const encodedQuery = encodeURIComponent(educationalQuery);
    const url = `https://html.duckduckgo.com/html/?q=${encodedQuery}`;

    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      console.warn(`⚠️ Search returned ${response.status}`);
      return await searchWikipediaFallback(query);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    const results: SearchResult[] = [];

    $(".result").each((i, elem) => {
      if (i >= 10) return;

      const $result = $(elem);
      const titleElem = $result.find(".result__a");
      const snippetElem = $result.find(".result__snippet");
      const url = titleElem.attr("href");
      const title = titleElem.text().trim();
      const snippet = snippetElem.text().trim();

      if (url && title && isRelevantSource(url)) {
        results.push({
          url: cleanUrl(url),
          title,
          snippet,
        });
      }
    });

    console.log(
      `🔍 Search found ${results.length} relevant HTML results (PDFs filtered out)`,
    );

    if (results.length === 0) {
      return await searchWikipediaFallback(query);
    }

    return results.slice(0, 5);
  } catch {
    console.error("❌ Search error");
    return await searchWikipediaFallback(query);
  }
}

async function searchWikipediaFallback(query: string): Promise<SearchResult[]> {
  try {
    console.log("🔄 Falling back to Wikipedia search...");

    const encodedQuery = encodeURIComponent(query);
    const url = `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodedQuery}&limit=3&format=json`;

    const response = await fetch(url, {
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) return [];

    const data = (await response.json()) as any;
    const results: SearchResult[] = [];

    if (Array.isArray(data) && data.length === 4) {
      const titles = data[1] as string[];
      const descriptions = data[2] as string[];
      const urls = data[3] as string[];

      for (let i = 0; i < Math.min(titles.length, 3); i++) {
        results.push({
          url: urls[i],
          title: titles[i],
          snippet: descriptions[i] || "",
        });
      }
    }

    console.log(`📚 Wikipedia search found ${results.length} results`);
    return results;
  } catch {
    console.error("❌ Wikipedia search error");
    return [];
  }
}

function isRelevantSource(url: string): boolean {
  const excludedExtensions = [".pdf", ".doc", ".docx", ".ppt", ".pptx", ".zip"];
  const urlLower = url.toLowerCase();

  if (excludedExtensions.some((ext) => urlLower.includes(ext))) {
    return false;
  }

  const relevantDomains = [
    "wikipedia.org",
    "edu",
    "geeksforgeeks.org",
    "tutorialspoint.com",
    "javatpoint.com",
    "w3schools.com",
    "stackoverflow.com",
    "electronics-tutorials.ws",
    "allaboutcircuits.com",
    "circuitdigest.com",
    "electrical4u.com",
    "mit.edu",
    "stanford.edu",
    "coursera.org",
    "khanacademy.org",
    "electronicshub.org",
    "electronics-notes.com",
  ];

  return relevantDomains.some((domain) => url.includes(domain));
}

function cleanUrl(url: string): string {
  if (url.startsWith("//duckduckgo.com/l/?uddg=")) {
    const match = url.match(/uddg=([^&]+)/);
    if (match && match[1]) {
      return decodeURIComponent(match[1]);
    }
  }

  if (url.startsWith("//")) {
    return "https:" + url;
  }

  return url;
}

async function scrapeWebPage(url: string): Promise<{
  summary: string;
  equations: Array<{ latex: string; description: string }>;
  applications: string[];
} | null> {
  try {
    if (url.toLowerCase().match(/\.(pdf|doc|docx|ppt|pptx)$/)) {
      console.warn(`⚠️ Skipping document file: ${url}`);
      return null;
    }

    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      console.warn(`⚠️ Page returned ${response.status}: ${url}`);
      return null;
    }

    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("html") && !contentType.includes("xml")) {
      console.warn(`⚠️ Non-HTML content type: ${contentType} for ${url}`);
      return null;
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    let summary = "";

    const contentSelectors = [
      "article p",
      ".content p",
      ".main-content p",
      "#content p",
      ".post-content p",
      ".entry-content p",
      "main p",
      "p",
    ];

    for (const selector of contentSelectors) {
      const paragraphs = $(selector)
        .slice(0, 5)
        .map((i, el) => $(el).text().trim())
        .get()
        .filter((text) => text.length > 50)
        .join(" ");

      if (paragraphs.length > 200) {
        summary = paragraphs.substring(0, 800);
        break;
      }
    }

    if (summary.length < 100) {
      console.warn(`⚠️ Insufficient content from: ${url}`);
      return null;
    }

    const equations: Array<{ latex: string; description: string }> = [];
    $(".mwe-math-element, .math, .equation, .katex").each((i, elem) => {
      if (i < 5) {
        const latex =
          $(elem).attr("data-latex") ||
          $(elem).find("annotation").text() ||
          $(elem).text();
        if (latex && latex.length > 5 && latex.length < 200) {
          equations.push({
            latex,
            description: "Mathematical formula",
          });
        }
      }
    });

    const applications: string[] = [];

    $("h2, h3, h4").each((i, elem) => {
      const heading = $(elem).text().toLowerCase();
      if (
        heading.includes("application") ||
        heading.includes("example") ||
        heading.includes("use case") ||
        heading.includes("uses") ||
        heading.includes("implementation")
      ) {
        $(elem)
          .nextUntil("h2, h3, h4")
          .find("li, p")
          .each((j, listItem) => {
            if (j < 5) {
              const text = $(listItem).text().trim();
              if (text.length > 30 && text.length < 200) {
                applications.push(text);
              }
            }
          });
      }
    });

    console.log(
      `✅ Scraped ${summary.length} chars, ${equations.length} equations, ${applications.length} applications`,
    );

    return {
      summary,
      equations,
      applications,
    };
  } catch (error: any) {
    if (error?.name === "AbortError") {
      console.error(`❌ Timeout after 8s: ${url}`);
    } else {
      console.error(`❌ Scrape error for ${url}`);
    }
    return null;
  }
}

function suggestBloomsLevel(curriculum: string): number {
  const curriculumLower = curriculum.toLowerCase();

  if (curriculumLower.match(/design|create|develop|implement|build/i)) {
    return 6;
  }
  if (curriculumLower.match(/evaluate|assess|critique|justify|recommend/i)) {
    return 5;
  }
  if (curriculumLower.match(/analyze|compare|contrast|examine|investigate/i)) {
    return 4;
  }
  if (curriculumLower.match(/apply|solve|demonstrate|use|execute/i)) {
    return 3;
  }

  return 4;
}

export function formatEnrichedContent(enriched: EnrichedCurriculum): string {
  return `# Enriched Educational Context

## Key Topics:
${enriched.keyTopics.map((t) => `- ${t}`).join("\n")}

## Concept Explanations:
${Object.entries(enriched.conceptExplanations)
  .map(([topic, explanation]) => `### ${topic}\n${explanation}`)
  .join("\n\n")}

## Commonly Tested Areas:
${enriched.commonlyTestedAreas.map((area) => `- ${area}`).join("\n")}

## Real-World Applications:
${enriched.realWorldApplications.map((app) => `- ${app}`).join("\n")}

## University-Level Question Examples:
${enriched.universityLevelExamples.map((ex) => `- ${ex}`).join("\n")}

## Suggested Bloom's Taxonomy Level: ${enriched.suggestedBloomsLevel} (${["", "Remember", "Understand", "Apply", "Analyze", "Evaluate", "Create"][enriched.suggestedBloomsLevel]})
`;
}

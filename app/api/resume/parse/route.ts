import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import { v4 as uuidv4 } from "uuid";
import PDFParser from "pdf2json";
import Resume from "@/database/resume.model";
import Profile from "@/database/profile.model";
import User from "@/database/user.model";
import dbConnect from "@/lib/mongoose";
import { groq } from "@ai-sdk/groq";
import { generateText } from "ai";

async function parseResumeWithGroq(text: string): Promise<any> {
  try {
    // ✅ Limit text length to prevent issues
    const maxLength = 10000;
    const limitedText = text.substring(0, maxLength);

    console.log(`📄 Processing resume text (${limitedText.length} chars)`);

    const { text: response } = await generateText({
      model: groq("llama-3.1-8b-instant"),
      prompt: `Parse this resume and return ONLY valid JSON with no markdown or extra text.

Resume Text:
${limitedText}

Return exactly this JSON structure (use empty arrays if not found, null for missing optional fields):
{
  "name": "string",
  "email": "string",
  "phone": "string",
  "location": "string",
  "website": "string",
  "skills": ["string"],
  "experience": [
    {
      "title": "string",
      "company": "string",
      "location": "string",
      "startDate": "string (MM/YYYY)",
      "endDate": "string (MM/YYYY or Present)",
      "description": "string",
      "current": boolean
    }
  ],
  "education": [
    {
      "degree": "string",
      "institution": "string",
      "location": "string",
      "startDate": "string (YYYY)",
      "endDate": "string (YYYY or Present)",
      "gpa": "string or null"
    }
  ],
  "projects": [
    {
      "name": "string",
      "description": "string",
      "technologies": ["string"],
      "link": "string or null"
    }
  ],
  "certifications": [
    {
      "name": "string",
      "issuer": "string",
      "date": "string (YYYY)"
    }
  ]
}

IMPORTANT: Return ONLY JSON, nothing else. No markdown, no explanations.`,
      system:
        "You are a resume parsing expert. Extract all resume information accurately and return only valid JSON with no explanations.",
    });

    console.log("✅ Groq response received");

    // ✅ Safely extract JSON
    let parsedJson;
    try {
      // Try direct parse first
      parsedJson = JSON.parse(response);
    } catch (e) {
      // Try extracting JSON from markdown or text
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error(
          "❌ Could not extract JSON from Groq response:",
          response.substring(0, 200)
        );
        throw new Error("Could not extract JSON from Groq response");
      }
      parsedJson = JSON.parse(jsonMatch[0]);
    }

    console.log("✅ JSON parsed successfully");
    return parsedJson;
  } catch (error) {
    console.error("❌ Groq parsing error:", error);
    throw error;
  }
}

export async function POST(req: NextRequest) {
  let tempFilePath: string | null = null;

  try {
    const session = await auth();
    if (!session?.user?.id) {
      console.error("❌ Unauthorized - no session");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("✅ User authenticated:", session.user.id);

    await dbConnect();
    console.log("✅ Database connected");

    const formData: FormData = await req.formData();
    const uploadedFiles = formData.getAll("FILE");

    if (!uploadedFiles || uploadedFiles.length === 0) {
      return NextResponse.json({ error: "No files found" }, { status: 404 });
    }

    const uploadedFile = uploadedFiles[0];

    if (!(uploadedFile instanceof File)) {
      return NextResponse.json(
        { error: "Uploaded file is not in the expected format" },
        { status: 400 }
      );
    }

    console.log(`📁 File received: ${uploadedFile.name} (${uploadedFile.size} bytes)`);

    // ✅ Check file size
    const maxFileSize = 8 * 1024 * 1024; // 8MB
    if (uploadedFile.size > maxFileSize) {
      return NextResponse.json(
        { error: "File size exceeds 8MB limit" },
        { status: 400 }
      );
    }

    const fileName = uuidv4();
    tempFilePath = `/tmp/${fileName}.pdf`;
    const fileBuffer = Buffer.from(await uploadedFile.arrayBuffer());

    console.log(`💾 Writing file to: ${tempFilePath}`);
    await fs.writeFile(tempFilePath, fileBuffer);

    console.log("📖 Starting PDF parsing...");
    const pdfParser = new (PDFParser as any)(null, 1);

    let parsedText = "";

    // ✅ Better error handling
    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error("PDF parsing timeout"));
      }, 30000); // 30 second timeout

      pdfParser.on("pdfParser_dataReady", () => {
        clearTimeout(timeout);
        try {
          const rawText = (pdfParser as any).getRawTextContent();
          
          // ✅ Validate text
          if (!rawText || typeof rawText !== "string") {
            throw new Error("Invalid text extracted from PDF");
          }
          
          // ✅ Limit to reasonable size
          parsedText = rawText.substring(0, 20000);
          console.log(`✅ PDF parsed: ${parsedText.length} chars extracted`);
          resolve();
        } catch (err) {
          reject(err);
        }
      });

      pdfParser.on("pdfParser_dataError", (errData: any) => {
        clearTimeout(timeout);
        console.error("PDF Parser error:", errData);
        reject(new Error(`PDF parsing failed: ${errData.parserError}`));
      });

      pdfParser.loadPDF(tempFilePath);
    });

    if (!parsedText || parsedText.trim().length === 0) {
      return NextResponse.json(
        { error: "Could not extract text from PDF" },
        { status: 400 }
      );
    }

    // ✅ Parse with Groq
    console.log("🤖 Parsing with Groq...");
    const parsedData = await parseResumeWithGroq(parsedText);

    console.log("💾 Saving to database...");

    // Save to Resume collection
    const resume = await Resume.create({
      userId: session.user.id,
      filename: uploadedFile.name,
      fileUrl: tempFilePath,
      fileSize: uploadedFile.size,
      mimeType: uploadedFile.type,
      parsedData: parsedData,
      status: "completed",
    });

    // ✅ Update User with defaults
    await User.findByIdAndUpdate(session.user.id, {
      $set: {
        name: parsedData.name || "",
        skills: Array.isArray(parsedData.skills) ? parsedData.skills : [],
        location: parsedData.location || "",
        website: parsedData.website || "",
      },
    });

    // ✅ Update or create Profile with defaults
    await Profile.findOneAndUpdate(
      { userId: session.user.id },
      {
        $set: {
          experience: Array.isArray(parsedData.experience)
            ? parsedData.experience
            : [],
          education: Array.isArray(parsedData.education)
            ? parsedData.education
            : [],
          projects: Array.isArray(parsedData.projects)
            ? parsedData.projects
            : [],
          certifications: Array.isArray(parsedData.certifications)
            ? parsedData.certifications
            : [],
        },
      },
      { upsert: true, new: true }
    );

    // ✅ Clean up temp file
    if (tempFilePath) {
      try {
        await fs.unlink(tempFilePath);
        console.log("✅ Temp file deleted");
      } catch (e) {
        console.warn("Could not delete temp file:", e);
      }
    }

    console.log("✅ Resume parsing completed successfully");

    const response = new NextResponse(JSON.stringify(parsedData));
    response.headers.set("FileName", fileName);
    response.headers.set("ResumeId", resume._id.toString());
    response.headers.set("Content-Type", "application/json");
    return response;
  } catch (error) {
    console.error("❌ Resume parsing error:", error);

    // ✅ Clean up on error
    if (tempFilePath) {
      try {
        await fs.unlink(tempFilePath);
      } catch (e) {
        console.warn("Could not delete temp file on error:", e);
      }
    }

    return NextResponse.json(
      { error: "Failed to parse resume: " + (error instanceof Error ? error.message : "Unknown error") },
      { status: 500 }
    );
  }
}

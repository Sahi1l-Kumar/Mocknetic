import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import { v4 as uuidv4 } from "uuid";
import PDFParser from "pdf2json";
import Resume from "@/database/resume.model";
import Profile from "@/database/profile.model";
import User from "@/database/user.model";
import dbConnect from "@/lib/mongoose";
import { google } from "@ai-sdk/google";
import { generateText } from "ai";

async function parseResumeWithGemini(text: string): Promise<any> {
  try {
    const { text: response } = await generateText({
      model: google("gemini-2.0-flash-exp"),
      prompt: `Parse this resume text and extract structured data. Return ONLY valid JSON with no markdown formatting or explanations.

Resume Text:
${text}

Return this exact JSON structure (use empty arrays if not found, use null for missing optional fields):
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
      "startDate": "string (MM/YYYY format)",
      "endDate": "string (MM/YYYY or 'Present')",
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
      "endDate": "string (YYYY or 'Present')",
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

Important: Return ONLY the JSON object, nothing else.`,
      system:
        "You are a resume parsing expert. Extract all information from resumes accurately and return only valid JSON. Be precise with dates and information.",
    });

    // Extract JSON from response (in case it has extra text)
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("Could not extract JSON from Gemini response:", response);
      throw new Error("Could not extract JSON from Gemini response");
    }

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error("Gemini parsing error:", error);
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

    const formData: FormData = await req.formData();
    const uploadedFiles = formData.getAll("FILE");
    let fileName = "";
    let parsedText = "";

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

    fileName = uuidv4();
    const tempFilePath = `/tmp/${fileName}.pdf`;
    const fileBuffer = Buffer.from(await uploadedFile.arrayBuffer());

    await fs.writeFile(tempFilePath, fileBuffer);

    const pdfParser = new (PDFParser as any)(null, 1);

    pdfParser.on("pdfParser_dataError", (errData: any) => {
      console.log(errData.parserError);
    });

    await new Promise<void>((resolve, reject) => {
      pdfParser.on("pdfParser_dataReady", () => {
        parsedText = (pdfParser as any).getRawTextContent();
        resolve();
      });
      pdfParser.on("pdfParser_dataError", reject);
      pdfParser.loadPDF(tempFilePath);
    });

    // Parse with Gemini AI
    const parsedData = await parseResumeWithGemini(parsedText);

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

    // Update User
    await User.findByIdAndUpdate(session.user.id, {
      $set: {
        name: parsedData.name || "",
        skills: parsedData.skills || [],
        location: parsedData.location || "",
        website: parsedData.website || "",
      },
    });

    // Update or create Profile
    await Profile.findOneAndUpdate(
      { userId: session.user.id },
      {
        $set: {
          experience: parsedData.experience || [],
          education: parsedData.education || [],
          projects: parsedData.projects || [],
          certifications: parsedData.certifications || [],
        },
      },
      { upsert: true, new: true }
    );

    await fs.unlink(tempFilePath);

    const response = new NextResponse(parsedText);
    response.headers.set("FileName", fileName);
    response.headers.set("ResumeId", resume._id.toString());
    return response;
  } catch (error) {
    console.error("Resume parsing error:", error);
    return NextResponse.json(
      { error: "Failed to parse resume: " + (error as Error).message },
      { status: 500 }
    );
  }
}

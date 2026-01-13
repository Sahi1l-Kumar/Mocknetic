import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/mongoose";
import { LANGUAGE_IDS } from "@/constants";
import {
  APIResponse,
  SubmitCodeResponse,
  SubmitCodeRequest,
} from "@/types/global";
import { CodingSubmission } from "@/database";

const JUDGE0_API_URL = "https://judge0-ce.p.rapidapi.com";
const JUDGE0_API_KEY = process.env.JUDGE0_API_KEY;
const JUDGE0_HOST = process.env.JUDGE0_HOST || "judge0-ce.p.rapidapi.com";

export async function POST(
  request: NextRequest
): Promise<APIResponse<SubmitCodeResponse>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: { message: "Unauthorized" },
        },
        { status: 401 }
      );
    }

    const {
      codes,
      language,
      testCases,
      problemId,
      problemTitle,
    }: SubmitCodeRequest & { problemId: number; problemTitle: string } =
      await request.json();

    if (!codes || !Array.isArray(codes) || codes.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: { message: "At least one wrapped code is required" },
        },
        { status: 400 }
      );
    }

    if (!language || !testCases || !problemId || !problemTitle) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message:
              "Language, testCases, problemId, and problemTitle are required",
          },
        },
        { status: 400 }
      );
    }

    const languageId = LANGUAGE_IDS[language as keyof typeof LANGUAGE_IDS];
    if (!languageId) {
      return NextResponse.json(
        {
          success: false,
          error: { message: "Unsupported language" },
        },
        { status: 400 }
      );
    }

    const headers = {
      "X-RapidAPI-Key": JUDGE0_API_KEY!,
      "X-RapidAPI-Host": JUDGE0_HOST,
      "Content-Type": "application/json",
    };

    const submissionIds: string[] = [];

    for (let i = 0; i < codes.length; i++) {
      const wrappedCode = codes[i];

      const body = {
        source_code: wrappedCode,
        language_id: languageId,
      };

      const response = await fetch(
        `${JUDGE0_API_URL}/submissions?base64_encoded=false&wait=false`,
        {
          method: "POST",
          headers,
          body: JSON.stringify(body),
        }
      );

      if (!response.ok) {
        throw new Error(`Judge0 API error: ${response.statusText}`);
      }

      const data = await response.json();
      submissionIds.push(data.token);
    }

    await dbConnect();

    const submission = await CodingSubmission.create({
      userId: session.user.id,
      problemNumber: problemId,
      problemTitle,
      code: codes[0],
      language,
      status: "pending",
      testCasesPassed: 0,
      totalTestCases: codes.length,
      judge0Tokens: submissionIds,
      results: [],
      submittedAt: new Date(),
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          submissionIds,
          totalTestCases: codes.length,
          submissionDbId: submission._id.toString(),
        },
      },
      { status: 202 }
    );
  } catch (error) {
    console.error("Submit error:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          message: error instanceof Error ? error.message : "Submission failed",
        },
      },
      { status: 500 }
    );
  }
}

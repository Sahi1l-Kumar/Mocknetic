import { NextRequest, NextResponse } from "next/server";
import { LANGUAGE_IDS } from "@/constants";
import { APIResponse, TestCase } from "@/types/global";

const JUDGE0_API_URL = "https://judge0-ce.p.rapidapi.com";
const JUDGE0_API_KEY = process.env.JUDGE0_API_KEY;
const JUDGE0_HOST = process.env.JUDGE0_HOST || "judge0-ce.p.rapidapi.com";

interface SubmitRequest {
  codes: string[]; // Changed to array of wrapped codes
  language: string;
  testCases: TestCase[];
}

export async function POST(
  request: NextRequest
): Promise<
  APIResponse<{ submissionIds: string[]; totalTestCases: number }>
> {
  try {
    const { codes, language, testCases }: SubmitRequest =
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

    if (!language || !testCases) {
      return NextResponse.json(
        {
          success: false,
          error: { message: "Language and testCases are required" },
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

    // Submit each wrapped code (each has different test values)
    for (let i = 0; i < codes.length; i++) {
      const wrappedCode = codes[i];
      const testCase = testCases[i];

      const body = {
        source_code: wrappedCode, // Already includes Main class and test values
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
      console.log(
        `✅ Submitted test case ${i + 1}/${codes.length} - Token: ${data.token}`
      );
    }

    console.log(`✅ All ${submissionIds.length} test cases submitted`);

    return NextResponse.json(
      {
        success: true,
        data: {
          submissionIds,
          totalTestCases: codes.length,
        },
      },
      { status: 202 }
    );
  } catch (error) {
    console.error("❌ Submit error:", error);
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

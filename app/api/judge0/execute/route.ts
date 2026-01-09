import { NextRequest, NextResponse } from "next/server";
import { LANGUAGE_IDS } from "@/constants";
import {
  APIResponse,
  ExecuteCodeRequest,
  ExecutionResult,
} from "@/types/global";

const JUDGE0_API_URL = "https://judge0-ce.p.rapidapi.com";
const JUDGE0_API_KEY = process.env.JUDGE0_API_KEY;
const JUDGE0_HOST = process.env.JUDGE0_HOST || "judge0-ce.p.rapidapi.com";

export async function POST(
  request: NextRequest
): Promise<APIResponse<ExecutionResult>> {
  try {
    const { code, language, input }: ExecuteCodeRequest = await request.json();

    if (!code || !language) {
      return NextResponse.json(
        {
          success: false,
          error: { message: "Code and language are required" },
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

    const body = {
      source_code: code,
      language_id: languageId,
      stdin: input || "",
    };

    const response = await fetch(
      `${JUDGE0_API_URL}/submissions?base64_encoded=false&wait=true`,
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

    const result: ExecutionResult = {
      status: data.status.description,
      statusId: data.status.id,
      stdout: data.stdout || null,
      stderr: data.stderr || null,
      compile_output: data.compile_output || null,
      time: data.time || null,
      memory: data.memory || null,
      exit_code: data.exit_code || null,
      exit_signal: data.exit_signal || null,
      message: data.message || null,
      created_at: new Date().toISOString(),
      finished_at: new Date().toISOString(),
    };

    return NextResponse.json(
      {
        success: true,
        data: result,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Execute error:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          message: error instanceof Error ? error.message : "Execution failed",
        },
      },
      { status: 500 }
    );
  }
}

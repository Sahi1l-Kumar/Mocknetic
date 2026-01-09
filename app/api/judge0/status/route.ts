import {
  APIResponse,
  CheckStatusResponse,
  CheckStatusRequest,
  StatusResult,
} from "@/types/global";
import { NextRequest, NextResponse } from "next/server";

const JUDGE0_API_URL = "https://judge0-ce.p.rapidapi.com";
const JUDGE0_API_KEY = process.env.JUDGE0_API_KEY;
const JUDGE0_HOST = process.env.JUDGE0_HOST || "judge0-ce.p.rapidapi.com";

export async function POST(
  request: NextRequest
): Promise<APIResponse<CheckStatusResponse>> {
  try {
    const { tokens, expectedOutputs }: CheckStatusRequest =
      await request.json();

    if (!tokens || !Array.isArray(tokens)) {
      return NextResponse.json(
        {
          success: false,
          error: { message: "Tokens array is required" },
        },
        { status: 400 }
      );
    }

    const headers = {
      "X-RapidAPI-Key": JUDGE0_API_KEY!,
      "X-RapidAPI-Host": JUDGE0_HOST,
    };

    const results: StatusResult[] = [];

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      const expectedOutput = expectedOutputs?.[i] || "";

      const response = await fetch(
        `${JUDGE0_API_URL}/submissions/${token}?base64_encoded=false`,
        {
          method: "GET",
          headers,
        }
      );

      if (!response.ok) {
        results.push({
          token,
          status: "Error",
          statusId: -1,
          isPending: false,
          input: "",
          expectedOutput: expectedOutput,
          actualOutput: null,
          passed: false,
          time: null,
          memory: null,
          error: "Failed to fetch status",
        });
        continue;
      }

      const data = await response.json();
      const statusId = data.status.id;
      const isPending = statusId === 1 || statusId === 2;
      const actualOutput = data.stdout || "";

      const actualTrimmed = actualOutput.trim();
      const expectedTrimmed = expectedOutput.trim();

      const passed = statusId === 3 && actualTrimmed === expectedTrimmed;

      results.push({
        token,
        status: data.status.description,
        statusId,
        isPending,
        input: "",
        expectedOutput: expectedOutput,
        actualOutput: actualOutput,
        passed: passed,
        time: data.time || null,
        memory: data.memory || null,
        error: data.stderr || null,
      });
    }

    return NextResponse.json(
      {
        success: true,
        data: { results },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Status check error:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          message:
            error instanceof Error ? error.message : "Status check failed",
        },
      },
      { status: 500 }
    );
  }
}

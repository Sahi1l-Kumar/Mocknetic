import {
  APIResponse,
  CheckStatusResponse,
  CheckStatusRequest,
  StatusResult,
} from "@/types/global";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/mongoose";
import { CodingSubmission } from "@/database";

const JUDGE0_API_URL = "https://judge0-ce.p.rapidapi.com";
const JUDGE0_API_KEY = process.env.JUDGE0_API_KEY;
const JUDGE0_HOST = process.env.JUDGE0_HOST || "judge0-ce.p.rapidapi.com";

const STATUS_MAP: Record<
  number,
  | "pending"
  | "running"
  | "accepted"
  | "wrong_answer"
  | "runtime_error"
  | "compile_error"
  | "time_limit_exceeded"
> = {
  1: "pending",
  2: "running",
  3: "accepted",
  4: "wrong_answer",
  5: "time_limit_exceeded",
  6: "compile_error",
  7: "runtime_error",
  8: "runtime_error",
  9: "runtime_error",
  10: "runtime_error",
  11: "runtime_error",
  12: "runtime_error",
  13: "runtime_error",
  14: "runtime_error",
};

export async function POST(
  request: NextRequest
): Promise<APIResponse<CheckStatusResponse>> {
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
      tokens,
      expectedOutputs,
      submissionDbId,
    }: CheckStatusRequest & { submissionDbId?: string } = await request.json();

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
    let passedCount = 0;
    let allCompleted = true;
    let finalStatus:
      | "pending"
      | "running"
      | "accepted"
      | "wrong_answer"
      | "runtime_error"
      | "compile_error"
      | "time_limit_exceeded" = "pending";
    let maxRuntime = 0;
    let maxMemory = 0;

    const dbResults = [];

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
        allCompleted = false;
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

        dbResults.push({
          testCaseIndex: i,
          passed: false,
          expectedOutput: expectedOutput,
          actualOutput: null,
          error: "Failed to fetch status",
        });
        continue;
      }

      const data = await response.json();
      const statusId = data.status.id;
      const isPending = statusId === 1 || statusId === 2;
      const actualOutput = data.stdout || "";

      if (isPending) {
        allCompleted = false;
      }

      if (data.time) maxRuntime = Math.max(maxRuntime, parseFloat(data.time));
      if (data.memory) maxMemory = Math.max(maxMemory, data.memory);

      const actualTrimmed = actualOutput.trim();
      const expectedTrimmed = expectedOutput.trim();

      const passed = statusId === 3 && actualTrimmed === expectedTrimmed;

      if (passed) {
        passedCount++;
      }

      const currentStatus = STATUS_MAP[statusId] || "runtime_error";
      if (
        currentStatus === "compile_error" ||
        currentStatus === "runtime_error" ||
        currentStatus === "time_limit_exceeded"
      ) {
        finalStatus = currentStatus;
      } else if (
        currentStatus === "wrong_answer" &&
        finalStatus !== "compile_error" &&
        finalStatus !== "runtime_error" &&
        finalStatus !== "time_limit_exceeded"
      ) {
        finalStatus = "wrong_answer";
      } else if (!isPending && finalStatus === "pending") {
        finalStatus = currentStatus;
      }

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
        error: data.stderr || data.compile_output || null,
      });

      dbResults.push({
        testCaseIndex: i,
        passed,
        actualOutput: actualOutput || undefined,
        expectedOutput: expectedOutput || undefined,
        runtime: data.time ? parseFloat(data.time) : undefined,
        memory: data.memory || undefined,
        error: data.stderr || data.compile_output || undefined,
      });
    }

    if (submissionDbId && allCompleted) {
      await dbConnect();

      const updateData: any = {
        testCasesPassed: passedCount,
        results: dbResults,
        completedAt: new Date(),
      };

      if (passedCount === tokens.length) {
        updateData.status = "accepted";
      } else {
        updateData.status = finalStatus;
      }

      if (maxRuntime > 0) updateData.runtime = maxRuntime;
      if (maxMemory > 0) updateData.memory = maxMemory;

      await CodingSubmission.findByIdAndUpdate(submissionDbId, updateData, {
        new: true,
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

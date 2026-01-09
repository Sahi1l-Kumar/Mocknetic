import { NextRequest, NextResponse } from "next/server";
import { judge0Service } from "@/lib/judge0";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    console.log("Result API called for token:", token);

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    const result = await judge0Service.getSubmissionResult(token);

    console.log("Result retrieved:", result);

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (error: any) {
    console.error("Result API error:", error);

    return NextResponse.json(
      {
        error: error.message || "Internal server error",
      },
      { status: 500 }
    );
  }
}

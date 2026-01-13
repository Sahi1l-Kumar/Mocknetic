import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/mongoose";
import { CodingSubmission } from "@/database";

export async function GET(request: NextRequest): Promise<NextResponse> {
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

    const { searchParams } = new URL(request.url);
    const problemNumber = searchParams.get("problemNumber");
    const limit = parseInt(searchParams.get("limit") || "50");
    const skip = parseInt(searchParams.get("skip") || "0");
    const status = searchParams.get("status");

    await dbConnect();

    const query: any = { userId: session.user.id };

    if (problemNumber) {
      query.problemNumber = parseInt(problemNumber);
    }

    if (status) {
      query.status = status;
    }

    const submissions = await CodingSubmission.find(query)
      .sort({ submittedAt: -1 })
      .limit(limit)
      .skip(skip)
      .lean(); // Removed .populate() since we don't have problemId reference

    const total = await CodingSubmission.countDocuments(query);

    return NextResponse.json(
      {
        success: true,
        data: {
          submissions,
          total,
          limit,
          skip,
          hasMore: skip + limit < total,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get submissions error:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          message:
            error instanceof Error
              ? error.message
              : "Failed to fetch submissions",
        },
      },
      { status: 500 }
    );
  }
}

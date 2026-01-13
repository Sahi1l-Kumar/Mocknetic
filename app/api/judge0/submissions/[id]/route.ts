import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/mongoose";
import { CodingSubmission } from "@/database";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: { message: "Submission ID is required" },
        },
        { status: 400 }
      );
    }

    await dbConnect();

    const submission = await CodingSubmission.findOne({
      _id: id,
      userId: session.user.id,
    }).lean();

    if (!submission) {
      return NextResponse.json(
        {
          success: false,
          error: { message: "Submission not found" },
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: submission,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get submission error:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          message:
            error instanceof Error
              ? error.message
              : "Failed to fetch submission",
        },
      },
      { status: 500 }
    );
  }
}

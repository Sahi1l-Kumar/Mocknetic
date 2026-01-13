import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/mongoose";
import { SkillResult } from "@/database";

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
          error: { message: "Result ID is required" },
        },
        { status: 400 }
      );
    }

    await dbConnect();

    const result = await SkillResult.findOne({
      _id: id,
      userId: session.user.id,
    }).lean();

    if (!result) {
      return NextResponse.json(
        {
          success: false,
          error: { message: "Result not found" },
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: result,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get skill result error:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          message:
            error instanceof Error
              ? error.message
              : "Failed to fetch skill result",
        },
      },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/mongoose";
import { SkillResult } from "@/database";

export async function POST(request: NextRequest): Promise<NextResponse> {
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
      assessmentId,
      jobRole,
      difficulty,
      overallScore,
      correctAnswers,
      totalQuestions,
      skillGaps,
      recommendations,
      questions,
    } = await request.json();

    if (!assessmentId || !jobRole || !difficulty) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "Assessment ID, job role, and difficulty are required",
          },
        },
        { status: 400 }
      );
    }

    await dbConnect();

    const existingResult = await SkillResult.findOne({ assessmentId });
    if (existingResult) {
      return NextResponse.json(
        {
          success: false,
          error: { message: "Result already exists for this assessment" },
        },
        { status: 409 }
      );
    }

    const skillResult = await SkillResult.create({
      userId: session.user.id,
      assessmentId,
      jobRole,
      difficulty,
      overallScore,
      correctAnswers,
      totalQuestions,
      skillGaps,
      recommendations,
      questions,
      completedAt: new Date(),
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          resultId: skillResult._id.toString(),
          message: "Skill assessment result saved successfully",
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Save skill result error:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          message:
            error instanceof Error
              ? error.message
              : "Failed to save skill result",
        },
      },
      { status: 500 }
    );
  }
}

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
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = parseInt(searchParams.get("skip") || "0");
    const jobRole = searchParams.get("jobRole");

    await dbConnect();

    const query: any = { userId: session.user.id };
    if (jobRole) {
      query.jobRole = jobRole;
    }

    const results = await SkillResult.find(query)
      .sort({ completedAt: -1 })
      .limit(limit)
      .skip(skip)
      .lean();

    const total = await SkillResult.countDocuments(query);

    return NextResponse.json(
      {
        success: true,
        data: {
          results,
          total,
          limit,
          skip,
          hasMore: skip + limit < total,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get skill results error:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          message:
            error instanceof Error
              ? error.message
              : "Failed to fetch skill results",
        },
      },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/mongoose";
import Feedback from "@/database/feedback.model";
import handleError from "@/lib/handlers/error";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const body = await request.json();
    const { page, feedbackType, message, rating } = body;

    // Get metadata
    const userAgent = request.headers.get("user-agent") || "";

    const feedback = await Feedback.create({
      userId: session.user.id,
      userEmail: session.user.email,
      page,
      feedbackType,
      message,
      rating,
      metadata: {
        userAgent,
        timestamp: new Date(),
      },
    });

    return NextResponse.json({ success: true, feedback }, { status: 201 });
  } catch (error) {
    return handleError(error, "api") as NextResponse;
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const page = searchParams.get("page");

    const filter: any = {};
    if (status) filter.status = status;
    if (page) filter.page = page;

    const feedbacks = await Feedback.find(filter)
      .sort({ createdAt: -1 })
      .limit(50);

    return NextResponse.json({ feedbacks }, { status: 200 });
  } catch (error) {
    return handleError(error, "api") as NextResponse;
  }
}

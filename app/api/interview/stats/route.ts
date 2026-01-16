import { auth } from "@/auth";
import dbConnect from "@/lib/mongoose";
import Interview from "@/database/interview.model";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const interviews = await Interview.find({
      userId: session.user.id,
      status: "completed",
    })
      .sort({ createdAt: -1 })
      .lean();

    const totalInterviews = interviews.length;
    const avgScore =
      totalInterviews > 0
        ? Math.round(
            interviews.reduce(
              (sum: number, i: any) => sum + (i.scores?.overall || 0),
              0
            ) / totalInterviews
          )
        : 0;

    const avgCommunication =
      totalInterviews > 0
        ? Math.round(
            interviews.reduce(
              (sum: number, i: any) => sum + (i.scores?.communication || 0),
              0
            ) / totalInterviews
          )
        : 0;

    const avgTechnical =
      totalInterviews > 0
        ? Math.round(
            interviews.reduce(
              (sum: number, i: any) => sum + (i.scores?.technical || 0),
              0
            ) / totalInterviews
          )
        : 0;

    return NextResponse.json({
      success: true,
      data: {
        totalInterviews,
        avgScore,
        avgCommunication,
        avgTechnical,
        recentInterviews: interviews.slice(0, 5),
      },
    });
  } catch (error) {
    console.error("Get interview stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch interview stats" },
      { status: 500 }
    );
  }
}

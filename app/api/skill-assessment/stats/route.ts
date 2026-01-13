import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/mongoose";
import { SkillResult } from "@/database";

interface SkillGap {
  skill: string;
  questionsAnswered: number;
  correctAnswers: number;
  accuracy: number;
  gap: number;
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

    await dbConnect();

    const results = await SkillResult.find({ userId: session.user.id })
      .sort({ completedAt: -1 })
      .lean();

    const totalAssessments = results.length;
    const avgScore =
      totalAssessments > 0
        ? results.reduce((sum, r) => sum + r.overallScore, 0) / totalAssessments
        : 0;

    const latestAssessment = results[0] || null;

    const skillBreakdown: Record<
      string,
      { total: number; correct: number; accuracy: number }
    > = {};

    results.forEach((result) => {
      result.skillGaps.forEach((gap: SkillGap) => {
        if (!skillBreakdown[gap.skill]) {
          skillBreakdown[gap.skill] = {
            total: 0,
            correct: 0,
            accuracy: 0,
          };
        }
        skillBreakdown[gap.skill].total += gap.questionsAnswered;
        skillBreakdown[gap.skill].correct += gap.correctAnswers;
      });
    });

    Object.keys(skillBreakdown).forEach((skill) => {
      const data = skillBreakdown[skill];
      data.accuracy = data.total > 0 ? (data.correct / data.total) * 100 : 0;
    });

    const weakSkills = Object.entries(skillBreakdown)
      .sort(([, a], [, b]) => a.accuracy - b.accuracy)
      .slice(0, 5)
      .map(([skill, data]) => ({
        skill,
        accuracy: data.accuracy,
        totalQuestions: data.total,
      }));

    const strongSkills = Object.entries(skillBreakdown)
      .sort(([, a], [, b]) => b.accuracy - a.accuracy)
      .slice(0, 5)
      .map(([skill, data]) => ({
        skill,
        accuracy: data.accuracy,
        totalQuestions: data.total,
      }));

    const recentResults = results.slice(0, 5).map((r) => ({
      _id: r._id,
      jobRole: r.jobRole,
      difficulty: r.difficulty,
      overallScore: r.overallScore,
      completedAt: r.completedAt,
    }));

    return NextResponse.json(
      {
        success: true,
        data: {
          totalAssessments,
          avgScore: Math.round(avgScore * 10) / 10,
          latestAssessment: latestAssessment
            ? {
                _id: latestAssessment._id,
                jobRole: latestAssessment.jobRole,
                difficulty: latestAssessment.difficulty,
                overallScore: latestAssessment.overallScore,
                completedAt: latestAssessment.completedAt,
              }
            : null,
          weakSkills,
          strongSkills,
          recentResults,
          skillBreakdown,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get skill stats error:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          message:
            error instanceof Error
              ? error.message
              : "Failed to fetch skill stats",
        },
      },
      { status: 500 }
    );
  }
}

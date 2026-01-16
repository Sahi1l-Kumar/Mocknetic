import { NextRequest, NextResponse } from "next/server";
import Interview from "@/database/interview.model";
import dbConnect from "@/lib/mongoose";
import { auth } from "@/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized - Please sign in" },
        { status: 401 }
      );
    }

    const { id } = await params;

    await dbConnect();

    const interview = await Interview.findOne({
      _id: id,
      userId: session.user.id,
    }).lean();

    if (!interview) {
      return NextResponse.json(
        { error: "Interview not found" },
        { status: 404 }
      );
    }

    const interviewData = interview as any;

    const transformedData = {
      session_id: interviewData._id.toString(),
      average_score: interviewData.scores?.overall || 0,
      total_questions: interviewData.feedbackDetails?.length || 0,
      total_answers: interviewData.feedbackDetails?.length || 0,
      feedback_list: (interviewData.feedbackDetails || []).map(
        (detail: any) => ({
          question_number: detail.questionNumber,
          question: detail.question,
          answer: detail.answer,
          overall_score: detail.scores?.overall || 0,
          relevance: detail.scores?.relevance || 0,
          completeness: detail.scores?.completeness || 0,
          clarity: detail.scores?.clarity || 0,
          confidence: detail.scores?.confidence || 0,
          communication: detail.scores?.communication || 0,
          strengths: detail.strengths || [],
          improvements: detail.improvements || [],
          feedback: detail.feedback || "",
        })
      ),
      source: "database",
    };

    return NextResponse.json({
      success: true,
      data: transformedData,
    });
  } catch (error) {
    console.error("Get interview error:", error);
    return NextResponse.json(
      { error: "Failed to fetch interview" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import Interview from "@/database/interview.model";
import dbConnect from "@/lib/mongoose";
import { auth } from "@/auth";

interface PythonFeedbackItem {
  question_number: number;
  question: string;
  answer: string;
  overall_score: number;
  relevance: number;
  completeness: number;
  clarity: number;
  confidence: number;
  communication: number;
  strengths: string[];
  improvements: string[];
  feedback: string;
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized - Please sign in" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { sessionId, type, duration, feedbackData } = body;

    if (!sessionId || !type || !feedbackData) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (
      !feedbackData.feedback_list ||
      feedbackData.feedback_list.length === 0
    ) {
      return NextResponse.json(
        { error: "No feedback data available" },
        { status: 400 }
      );
    }

    await dbConnect();

    const transcript = [];
    for (const fb of feedbackData.feedback_list as PythonFeedbackItem[]) {
      transcript.push({
        speaker: "ai" as const,
        message: fb.question,
        timestamp: new Date(),
        type: "question" as const,
      });

      transcript.push({
        speaker: "user" as const,
        message: fb.answer,
        timestamp: new Date(),
        type: "answer" as const,
      });

      transcript.push({
        speaker: "ai" as const,
        message: fb.feedback,
        timestamp: new Date(),
        type: "feedback" as const,
      });
    }

    const allStrengths: string[] = [];
    const allImprovements: string[] = [];

    (feedbackData.feedback_list as PythonFeedbackItem[]).forEach((fb) => {
      if (fb.strengths) allStrengths.push(...fb.strengths);
      if (fb.improvements) allImprovements.push(...fb.improvements);
    });

    const feedbackList = feedbackData.feedback_list as PythonFeedbackItem[];

    const avgCommunication =
      feedbackList.reduce((sum, f) => sum + (f.communication || 0), 0) /
      feedbackList.length;

    const avgRelevance =
      feedbackList.reduce((sum, f) => sum + (f.relevance || 0), 0) /
      feedbackList.length;

    const avgCompleteness =
      feedbackList.reduce((sum, f) => sum + (f.completeness || 0), 0) /
      feedbackList.length;

    const detailedFeedback = `Interview Performance Summary:
    
Overall Score: ${feedbackData.average_score.toFixed(1)}/100
Questions Answered: ${feedbackData.total_answers}/${feedbackData.total_questions}

Average Metrics:
- Communication: ${avgCommunication.toFixed(1)}/20
- Relevance: ${avgRelevance.toFixed(1)}/20  
- Completeness: ${avgCompleteness.toFixed(1)}/20

This interview assessed your technical knowledge, communication skills, and problem-solving abilities across ${feedbackData.total_questions} questions.`;

    const feedbackDetails = feedbackList.map((fb) => ({
      questionNumber: fb.question_number,
      question: fb.question,
      answer: fb.answer,
      scores: {
        overall: fb.overall_score,
        relevance: fb.relevance,
        completeness: fb.completeness,
        clarity: fb.clarity,
        confidence: fb.confidence,
        communication: fb.communication,
      },
      strengths: fb.strengths || [],
      improvements: fb.improvements || [],
      feedback: fb.feedback || "",
    }));

    const interview = await Interview.create({
      userId: session.user.id,
      type: type || "technical",
      status: "completed",
      duration,
      transcript,
      scores: {
        communication: avgCommunication * 5,
        technical: avgRelevance * 5,
        problemSolving: avgCompleteness * 5,
        overall: feedbackData.average_score,
      },
      feedback: {
        strengths: allStrengths,
        improvements: allImprovements,
        detailedFeedback,
      },
      feedbackDetails,
    });

    return NextResponse.json(
      {
        success: true,
        interviewId: interview._id.toString(),
        message: "Interview saved successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Save interview error:", error);
    return NextResponse.json(
      {
        error: "Failed to save interview",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

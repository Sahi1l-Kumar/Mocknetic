import { NextRequest, NextResponse } from "next/server";
import { requireStudent } from "@/lib/auth-helpers";
import dbConnect from "@/lib/mongoose";
import ClassroomSubmission from "@/database/classroom/classroom-submission.model";

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { error, user } = await requireStudent();
    if (error) return error;

    const params = await props.params;
    await dbConnect();

    const submission = (await ClassroomSubmission.findOne({
      assessmentId: params.id,
      studentId: user.id,
    })
      .lean()
      .exec()) as any;

    if (!submission) {
      return NextResponse.json(
        {
          success: false,
          error: { message: "No submission found. Start assessment first." },
        },
        { status: 404 }
      );
    }

    if (!submission.questions || submission.questions.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "No questions generated yet. Please generate questions.",
          },
        },
        { status: 404 }
      );
    }

    const questions = submission.questions.map((q: any) => ({
      _id: q._id?.toString() || `${submission._id}_q${q.questionNumber}`,
      questionNumber: q.questionNumber,
      questionText: q.questionText,
      questionType: q.questionType,
      options: q.options || [],
      points: q.points,
      difficulty: q.difficulty,
      topic: q.topic,
    }));

    return NextResponse.json({
      success: true,
      data: questions,
    });
  } catch (error) {
    console.error("Error fetching questions:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to fetch questions" } },
      { status: 500 }
    );
  }
}

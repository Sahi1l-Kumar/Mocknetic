import { NextRequest, NextResponse } from "next/server";
import { requireStudent } from "@/lib/auth-helpers";
import dbConnect from "@/lib/mongoose";
import ClassroomQuestion from "@/database/classroom/classroom-question.model";
import ClassroomAssessment from "@/database/classroom/classroom-assessment.model";

// GET /api/student/assessment/:id/questions - Get generated questions for student
export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { error, user } = await requireStudent();
    if (error) return error;

    const params = await props.params;
    await dbConnect();

    // Verify assessment exists
    const assessment = await ClassroomAssessment.findById(params.id);

    if (!assessment) {
      return NextResponse.json(
        { success: false, error: { message: "Assessment not found" } },
        { status: 404 }
      );
    }

    // Get questions for this student
    const questions = await ClassroomQuestion.find({
      assessmentId: params.id,
      studentId: user.id,
    })
      .sort({ questionNumber: 1 })
      .lean();

    if (questions.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "No questions found. Please generate questions first.",
          },
        },
        { status: 404 }
      );
    }

    // Format questions for frontend (hide correct answers)
    const formattedQuestions = questions.map((q: any) => ({
      _id: q._id.toString(),
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
      data: formattedQuestions,
    });
  } catch (error) {
    console.error("Error fetching questions:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to fetch questions" } },
      { status: 500 }
    );
  }
}

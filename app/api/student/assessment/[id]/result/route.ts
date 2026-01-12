import { NextRequest, NextResponse } from "next/server";
import { requireStudent } from "@/lib/auth-helpers";
import dbConnect from "@/lib/mongoose";
import ClassroomSubmission from "@/database/classroom/classroom-submission.model";
import ClassroomAssessment from "@/database/classroom/classroom-assessment.model";

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
        { success: false, error: { message: "Submission not found" } },
        { status: 404 }
      );
    }

    const assessment = (await ClassroomAssessment.findById(params.id)
      .populate("classroomId", "name")
      .lean()
      .exec()) as any;

    if (!assessment) {
      return NextResponse.json(
        { success: false, error: { message: "Assessment not found" } },
        { status: 404 }
      );
    }

    // Format response with questions and answers
    const formattedAnswers = (submission.answers || []).map((ans: any) => {
      const question = (submission.questions || []).find(
        (q: any) => q.questionNumber === ans.questionNumber
      );

      return {
        questionId: question?._id || `q${ans.questionNumber}`,
        questionNumber: ans.questionNumber,
        studentAnswer: ans.answer,
        isCorrect: ans.isCorrect !== undefined ? ans.isCorrect : null,
        pointsAwarded: ans.pointsEarned || 0,
        pointsPossible: question?.points || 0,
        feedback: ans.feedback,
      };
    });

    const result = {
      submission: {
        _id: submission._id.toString(),
        score: submission.score || 0,
        totalPoints: submission.totalPoints || 0,
        percentage: submission.percentage || 0,
        status: submission.status || "submitted",
        submittedAt: submission.submittedAt,
        gradedAt: submission.gradedAt,
        timeSpent: submission.timeSpent || 0,
        answers: formattedAnswers,
      },
      assessment: {
        _id: assessment._id.toString(),
        title: assessment.title,
        description: assessment.description,
        classroomId: assessment.classroomId._id.toString(),
        classroom: {
          _id: assessment.classroomId._id.toString(),
          name: assessment.classroomId.name,
        },
        totalQuestions: assessment.totalQuestions,
        difficulty: assessment.difficulty,
      },
      questions: (submission.questions || []).map((q: any) => {
        let correctAnswerText = q.correctAnswer;

        if (q.questionType === "mcq" && typeof q.correctAnswer === "number") {
          correctAnswerText =
            q.options?.[q.correctAnswer - 1] || q.correctAnswer;
        }

        return {
          _id: q._id?.toString() || `q${q.questionNumber}`,
          questionNumber: q.questionNumber,
          questionText: q.questionText,
          questionType: q.questionType,
          options: q.options || [],
          correctAnswer: correctAnswerText,
          points: q.points,
          difficulty: q.difficulty,
          topic: q.topic,
          explanation: q.explanation,
        };
      }),
    };

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error fetching results:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to fetch results" } },
      { status: 500 }
    );
  }
}

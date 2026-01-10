import { NextRequest, NextResponse } from "next/server";
import { requireTeacher } from "@/lib/auth-helpers";
import dbConnect from "@/lib/mongoose";
import Classroom from "@/database/classroom/classroom.model";
import ClassroomAssessment from "@/database/classroom/classroom-assessment.model";
import ClassroomQuestion from "@/database/classroom/classroom-question.model";
import ClassroomSubmission from "@/database/classroom/classroom-submission.model";

// GET /api/classroom/:id/assessment - List all assessments for classroom
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { error, user } = await requireTeacher();
    if (error) return error;

    await dbConnect();

    // Verify teacher owns this classroom
    const classroom = await Classroom.findById(params.id);
    if (!classroom || classroom.teacherId.toString() !== user.id) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    const assessments = await ClassroomAssessment.find({
      classroomId: params.id,
    })
      .sort({ createdAt: -1 })
      .lean();

    // Get submission stats for each assessment
    const assessmentsWithStats = await Promise.all(
      assessments.map(async (assessment) => {
        const submissions = await ClassroomSubmission.find({
          assessmentId: assessment._id,
          status: { $in: ["graded", "submitted"] },
        }).lean();

        const completedCount = submissions.length;
        const averageScore =
          completedCount > 0
            ? submissions.reduce((sum, s) => sum + s.percentage, 0) /
              completedCount
            : 0;

        return {
          ...assessment,
          completedCount,
          averageScore: Math.round(averageScore * 10) / 10,
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: assessmentsWithStats,
    });
  } catch (error) {
    console.error("Error fetching assessments:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch assessments" },
      { status: 500 }
    );
  }
}

// POST /api/classroom/:id/assessment - Create new assessment
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { error, user } = await requireTeacher();
    if (error) return error;

    const body = await request.json();
    const {
      title,
      description,
      curriculum,
      curriculumFile,
      dueDate,
      difficulty,
      totalQuestions,
      skills,
      questions,
    } = body;

    if (!title || !curriculum || !totalQuestions) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: title, curriculum, totalQuestions",
        },
        { status: 400 }
      );
    }

    await dbConnect();

    // Verify teacher owns this classroom
    const classroom = await Classroom.findById(params.id);
    if (!classroom || classroom.teacherId.toString() !== user.id) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    const assessment = await ClassroomAssessment.create({
      classroomId: params.id,
      teacherId: user.id,
      title: title.trim(),
      description: description?.trim(),
      curriculum,
      curriculumFile,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      difficulty: difficulty || "medium",
      totalQuestions,
      skills: skills || [],
      isPublished: false,
    });

    // Create questions if provided
    if (questions && Array.isArray(questions) && questions.length > 0) {
      const questionDocs = questions.map((q: any, index: number) => ({
        assessmentId: assessment._id,
        questionNumber: index + 1,
        questionText: q.questionText,
        questionType: q.questionType,
        options: q.options,
        correctAnswer: q.correctAnswer,
        points: q.points || 1,
        difficulty: q.difficulty || difficulty || "medium",
        topic: q.topic,
        explanation: q.explanation,
      }));

      await ClassroomQuestion.insertMany(questionDocs);
    }

    return NextResponse.json(
      { success: true, data: assessment },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating assessment:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create assessment" },
      { status: 500 }
    );
  }
}

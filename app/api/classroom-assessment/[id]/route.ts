import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requireTeacher } from "@/lib/auth-helpers";
import dbConnect from "@/lib/mongoose";
import ClassroomAssessment from "@/database/classroom/classroom-assessment.model";
import ClassroomQuestion from "@/database/classroom/classroom-question.model";
import ClassroomMembership from "@/database/classroom/classroom-membership.model";

// GET /api/classroom-assessment/:id - Get assessment details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { error, user } = await requireAuth();
    if (error) return error;

    await dbConnect();

    const assessment = await ClassroomAssessment.findById(params.id);

    if (!assessment) {
      return NextResponse.json(
        { success: false, error: "Assessment not found" },
        { status: 404 }
      );
    }

    // Check access based on role
    if (user.role === "teacher") {
      if (assessment.teacherId.toString() !== user.id) {
        return NextResponse.json(
          { success: false, error: "Forbidden - Not your assessment" },
          { status: 403 }
        );
      }
    } else if (user.role === "student") {
      // Student - check enrollment and published status
      if (!assessment.isPublished) {
        return NextResponse.json(
          { success: false, error: "Assessment not published" },
          { status: 404 }
        );
      }

      const enrollment = await ClassroomMembership.findOne({
        classroomId: assessment.classroomId,
        studentId: user.id,
        status: "active",
      });

      if (!enrollment) {
        return NextResponse.json(
          { success: false, error: "Not enrolled in this classroom" },
          { status: 403 }
        );
      }
    }

    const questions = await ClassroomQuestion.find({
      assessmentId: params.id,
    }).sort({ questionNumber: 1 });

    // Hide correct answers and explanations for students
    const sanitizedQuestions =
      user.role === "student"
        ? questions.map((q) => ({
            _id: q._id,
            assessmentId: q.assessmentId,
            questionNumber: q.questionNumber,
            questionText: q.questionText,
            questionType: q.questionType,
            options: q.options,
            points: q.points,
            difficulty: q.difficulty,
            topic: q.topic,
          }))
        : questions.map((q) => q.toObject());

    return NextResponse.json({
      success: true,
      data: {
        _id: assessment._id,
        classroomId: assessment.classroomId,
        teacherId: assessment.teacherId,
        title: assessment.title,
        description: assessment.description,
        curriculum: assessment.curriculum,
        curriculumFile: assessment.curriculumFile,
        dueDate: assessment.dueDate,
        difficulty: assessment.difficulty,
        totalQuestions: assessment.totalQuestions,
        skills: assessment.skills,
        isPublished: assessment.isPublished,
        createdAt: assessment.createdAt,
        updatedAt: assessment.updatedAt,
        questions: sanitizedQuestions,
        questionCount: questions.length,
      },
    });
  } catch (error) {
    console.error("Error fetching assessment:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch assessment" },
      { status: 500 }
    );
  }
}

// PUT /api/classroom-assessment/:id - Update assessment (Teacher only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { error, user } = await requireTeacher();
    if (error) return error;

    const body = await request.json();

    await dbConnect();

    const assessment = await ClassroomAssessment.findById(params.id);

    if (!assessment) {
      return NextResponse.json(
        { success: false, error: "Assessment not found" },
        { status: 404 }
      );
    }

    if (assessment.teacherId.toString() !== user.id) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    // Don't allow updates if already published (except isPublished field)
    if (assessment.isPublished && body.isPublished !== false) {
      return NextResponse.json(
        {
          success: false,
          error: "Cannot update published assessment. Unpublish first.",
        },
        { status: 400 }
      );
    }

    const updated = await ClassroomAssessment.findByIdAndUpdate(
      params.id,
      { $set: body },
      { new: true, runValidators: true }
    );

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    console.error("Error updating assessment:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update assessment" },
      { status: 500 }
    );
  }
}

// DELETE /api/classroom-assessment/:id - Delete assessment (Teacher only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { error, user } = await requireTeacher();
    if (error) return error;

    await dbConnect();

    const assessment = await ClassroomAssessment.findById(params.id);

    if (!assessment) {
      return NextResponse.json(
        { success: false, error: "Assessment not found" },
        { status: 404 }
      );
    }

    if (assessment.teacherId.toString() !== user.id) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    // Delete assessment and all related questions
    await ClassroomAssessment.findByIdAndDelete(params.id);
    await ClassroomQuestion.deleteMany({ assessmentId: params.id });

    return NextResponse.json({
      success: true,
      message: "Assessment deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting assessment:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete assessment" },
      { status: 500 }
    );
  }
}

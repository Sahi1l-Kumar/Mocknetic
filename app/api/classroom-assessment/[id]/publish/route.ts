import { NextRequest, NextResponse } from "next/server";
import { requireTeacher } from "@/lib/auth-helpers";
import dbConnect from "@/lib/mongoose";
import ClassroomAssessment from "@/database/classroom/classroom-assessment.model";
import ClassroomQuestion from "@/database/classroom/classroom-question.model";

// POST /api/classroom-assessment/:id/publish - Publish/Unpublish assessment
export async function POST(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { error, user } = await requireTeacher();
    if (error) return error;

    const params = await props.params;
    const body = await request.json();
    const { isPublished } = body;

    if (typeof isPublished !== "boolean") {
      return NextResponse.json(
        { success: false, error: { message: "isPublished must be a boolean" } },
        { status: 400 }
      );
    }

    await dbConnect();

    const assessment = await ClassroomAssessment.findById(params.id);

    if (!assessment) {
      return NextResponse.json(
        { success: false, error: { message: "Assessment not found" } },
        { status: 404 }
      );
    }

    if (assessment.teacherId.toString() !== user.id) {
      return NextResponse.json(
        { success: false, error: { message: "Forbidden" } },
        { status: 403 }
      );
    }

    // Validate assessment has questions before publishing
    if (isPublished) {
      const questionCount = await ClassroomQuestion.countDocuments({
        assessmentId: params.id,
      });

      if (questionCount === 0) {
        return NextResponse.json(
          {
            success: false,
            error: { message: "Cannot publish assessment without questions" },
          },
          { status: 400 }
        );
      }

      if (questionCount !== assessment.totalQuestions) {
        return NextResponse.json(
          {
            success: false,
            error: {
              message: `Assessment requires ${assessment.totalQuestions} questions but has ${questionCount}`,
            },
          },
          { status: 400 }
        );
      }
    }

    assessment.isPublished = isPublished;
    await assessment.save();

    const assessmentObj = assessment.toObject();

    return NextResponse.json({
      success: true,
      data: {
        ...assessmentObj,
        _id: assessmentObj._id.toString(),
        classroomId: assessmentObj.classroomId.toString(),
        teacherId: assessmentObj.teacherId.toString(),
      },
      message: isPublished
        ? "Assessment published successfully"
        : "Assessment unpublished successfully",
    });
  } catch (error) {
    console.error("Error publishing assessment:", error);
    return NextResponse.json(
      {
        success: false,
        error: { message: "Failed to update assessment status" },
      },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requireTeacher } from "@/lib/auth-helpers";
import dbConnect from "@/lib/mongoose";
import ClassroomAssessment from "@/database/classroom/classroom-assessment.model";
import ClassroomSubmission from "@/database/classroom/classroom-submission.model";
import ClassroomMembership from "@/database/classroom/classroom-membership.model";

// GET /api/classroom-assessment/:id - Get assessment details
export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { error, user } = await requireAuth();
    if (error) return error;

    const params = await props.params;
    await dbConnect();

    const assessment = await ClassroomAssessment.findById(params.id).populate(
      "classroomId",
      "name"
    );

    if (!assessment) {
      return NextResponse.json(
        { success: false, error: { message: "Assessment not found" } },
        { status: 404 }
      );
    }

    // Check access based on role
    if (user.role === "teacher") {
      if (assessment.teacherId.toString() !== user.id) {
        return NextResponse.json(
          {
            success: false,
            error: { message: "Forbidden - Not your assessment" },
          },
          { status: 403 }
        );
      }
    } else if (user.role === "student") {
      // Student - check enrollment and published status
      if (!assessment.isPublished) {
        return NextResponse.json(
          { success: false, error: { message: "Assessment not published" } },
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
          {
            success: false,
            error: { message: "Not enrolled in this classroom" },
          },
          { status: 403 }
        );
      }
    }

    const assessmentObj = assessment.toObject();

    return NextResponse.json({
      success: true,
      data: {
        _id: assessmentObj._id.toString(),
        classroomId: assessmentObj.classroomId._id
          ? assessmentObj.classroomId._id.toString()
          : assessmentObj.classroomId.toString(),
        classroom: assessmentObj.classroomId.name
          ? {
              _id: assessmentObj.classroomId._id.toString(),
              name: assessmentObj.classroomId.name,
            }
          : undefined,
        teacherId: assessmentObj.teacherId.toString(),
        title: assessmentObj.title,
        description: assessmentObj.description,
        curriculum: assessmentObj.curriculum,
        curriculumFile: assessmentObj.curriculumFile,
        dueDate: assessmentObj.dueDate,
        difficulty: assessmentObj.difficulty,
        totalQuestions: assessmentObj.totalQuestions,
        questionConfig: assessmentObj.questionConfig,
        skills: assessmentObj.skills,
        isPublished: assessmentObj.isPublished,
        createdAt: assessmentObj.createdAt,
        updatedAt: assessmentObj.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error fetching assessment:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to fetch assessment" } },
      { status: 500 }
    );
  }
}

// PUT /api/classroom-assessment/:id - Update assessment (Teacher only)
export async function PUT(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { error, user } = await requireTeacher();
    if (error) return error;

    const params = await props.params;
    const body = await request.json();

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

    // Don't allow updates if already published (except isPublished field)
    if (assessment.isPublished && body.isPublished !== false) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "Cannot update published assessment. Unpublish first.",
          },
        },
        { status: 400 }
      );
    }

    const updated = await ClassroomAssessment.findByIdAndUpdate(
      params.id,
      { $set: body },
      { new: true, runValidators: true }
    );

    const updatedObj = updated!.toObject();

    return NextResponse.json({
      success: true,
      data: {
        ...updatedObj,
        _id: updatedObj._id.toString(),
        classroomId: updatedObj.classroomId.toString(),
        teacherId: updatedObj.teacherId.toString(),
      },
    });
  } catch (error) {
    console.error("Error updating assessment:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to update assessment" } },
      { status: 500 }
    );
  }
}

// DELETE /api/classroom-assessment/:id - Delete assessment (Teacher only)
export async function DELETE(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { error, user } = await requireTeacher();
    if (error) return error;

    const params = await props.params;
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

    // Delete assessment and all related submissions
    await ClassroomAssessment.findByIdAndDelete(params.id);
    await ClassroomSubmission.deleteMany({ assessmentId: params.id });

    return NextResponse.json({
      success: true,
      message: "Assessment deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting assessment:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to delete assessment" } },
      { status: 500 }
    );
  }
}

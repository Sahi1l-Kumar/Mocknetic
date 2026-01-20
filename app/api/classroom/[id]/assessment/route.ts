import { NextRequest, NextResponse } from "next/server";
import { requireTeacher } from "@/lib/auth-helpers";
import dbConnect from "@/lib/mongoose";
import Classroom from "@/database/classroom/classroom.model";
import ClassroomAssessment from "@/database/classroom/classroom-assignment.model";
import ClassroomSubmission from "@/database/classroom/classroom-submission.model";

// GET /api/classroom/:id/assessment - List all assessments for classroom
export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string }> },
) {
  try {
    const { error, user } = await requireTeacher();
    if (error) return error;

    const params = await props.params;
    await dbConnect();

    // Verify teacher owns this classroom
    const classroom = await Classroom.findById(params.id);
    if (!classroom || classroom.teacherId.toString() !== user.id) {
      return NextResponse.json(
        { success: false, error: { message: "Forbidden" } },
        { status: 403 },
      );
    }

    const assessments = await ClassroomAssessment.find({
      classroomId: params.id,
    })
      .sort({ createdAt: -1 })
      .lean();

    // Get submission stats for each assessment
    const assessmentsWithStats = await Promise.all(
      assessments.map(async (assessment: any) => {
        const submissions = await ClassroomSubmission.find({
          assessmentId: assessment._id,
          status: { $in: ["graded", "submitted"] },
        });

        const completedCount = submissions.length;
        const averageScore =
          completedCount > 0
            ? submissions.reduce((sum, s) => sum + s.percentage, 0) /
              completedCount
            : 0;

        return {
          ...assessment,
          _id: assessment._id.toString(),
          classroomId: assessment.classroomId.toString(),
          teacherId: assessment.teacherId.toString(),
          completedCount,
          averageScore: Math.round(averageScore * 10) / 10,
        };
      }),
    );

    return NextResponse.json({
      success: true,
      data: assessmentsWithStats,
    });
  } catch (error) {
    console.error("Error fetching assessments:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to fetch assessments" } },
      { status: 500 },
    );
  }
}

// POST /api/classroom/:id/assessment - Create assessment
export async function POST(
  request: NextRequest,
  props: { params: Promise<{ id: string }> },
) {
  try {
    const { error, user } = await requireTeacher();
    if (error) return error;

    const params = await props.params;
    const body = await request.json();
    const {
      title,
      description,
      curriculum,
      curriculumFile,
      dueDate,
      difficulty,
      cognitiveLevel,
      totalQuestions,
      questionConfig,
      skills,
      includesEquations,
      fairnessConfig,
    } = body;

    if (!title?.trim()) {
      return NextResponse.json(
        { success: false, error: { message: "Title is required" } },
        { status: 400 },
      );
    }

    if (!curriculum?.trim()) {
      return NextResponse.json(
        { success: false, error: { message: "Curriculum is required" } },
        { status: 400 },
      );
    }

    if (!totalQuestions || totalQuestions <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: { message: "Total questions must be greater than 0" },
        },
        { status: 400 },
      );
    }

    if (!questionConfig || typeof questionConfig !== "object") {
      return NextResponse.json(
        {
          success: false,
          error: { message: "Question configuration is required" },
        },
        { status: 400 },
      );
    }

    const { mcq, numerical } = questionConfig;

    if (
      typeof mcq !== "number" ||
      typeof numerical !== "number" ||
      mcq < 0 ||
      numerical < 0
    ) {
      return NextResponse.json(
        {
          success: false,
          error: { message: "Invalid question configuration" },
        },
        { status: 400 },
      );
    }

    if (mcq + numerical !== totalQuestions) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "Question configuration doesn't match total questions",
          },
        },
        { status: 400 },
      );
    }

    await dbConnect();

    const classroom = await Classroom.findById(params.id);

    if (!classroom) {
      return NextResponse.json(
        { success: false, error: { message: "Classroom not found" } },
        { status: 404 },
      );
    }

    if (classroom.teacherId.toString() !== user.id) {
      return NextResponse.json(
        {
          success: false,
          error: { message: "Forbidden - Not your classroom" },
        },
        { status: 403 },
      );
    }

    const assessment = await ClassroomAssessment.create({
      classroomId: params.id,
      teacherId: user.id,
      title: title.trim(),
      description: description?.trim(),
      curriculum: curriculum.trim(),
      curriculumFile: curriculumFile,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      difficulty: difficulty || "medium",
      cognitiveLevel: cognitiveLevel || "analysis",
      totalQuestions,
      questionConfig: {
        mcq,
        numerical,
      },
      skills: skills || [],
      isPublished: false,
      includesEquations: includesEquations || false,
      fairnessConfig: fairnessConfig || {
        enableQuestionVariants: true,
        minVariantsPerConcept: 3,
        maxDifficultyDeviation: 0.1,
        requirementPerStudent: "both",
      },
    });

    const assessmentObj = assessment.toObject();

    return NextResponse.json({
      success: true,
      data: {
        ...assessmentObj,
        _id: assessmentObj._id.toString(),
        classroomId: assessmentObj.classroomId.toString(),
        teacherId: assessmentObj.teacherId.toString(),
      },
      message: "Assessment created successfully",
    });
  } catch (error) {
    console.error("Error creating assessment:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to create assessment" } },
      { status: 500 },
    );
  }
}

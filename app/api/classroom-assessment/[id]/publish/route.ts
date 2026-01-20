import { NextRequest, NextResponse } from "next/server";
import { requireTeacher } from "@/lib/auth-helpers";
import dbConnect from "@/lib/mongoose";
import ClassroomAssessment from "@/database/classroom/classroom-assignment.model";
import {
  enrichCurriculumWithWebContent,
  formatEnrichedContent,
} from "@/lib/scraping/topicEnricher";

// POST /api/classroom-assessment/:id/publish - Publish/Unpublish assessment
export async function POST(
  request: NextRequest,
  props: { params: Promise<{ id: string }> },
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
        { status: 400 },
      );
    }

    await dbConnect();

    const assessment = await ClassroomAssessment.findById(params.id);

    if (!assessment) {
      return NextResponse.json(
        { success: false, error: { message: "Assessment not found" } },
        { status: 404 },
      );
    }

    if (assessment.teacherId.toString() !== user.id) {
      return NextResponse.json(
        { success: false, error: { message: "Forbidden" } },
        { status: 403 },
      );
    }

    if (isPublished) {
      if (!assessment.curriculum || assessment.curriculum.trim() === "") {
        return NextResponse.json(
          {
            success: false,
            error: { message: "Cannot publish assessment without curriculum" },
          },
          { status: 400 },
        );
      }

      if (assessment.totalQuestions <= 0) {
        return NextResponse.json(
          {
            success: false,
            error: {
              message:
                "Cannot publish assessment without question configuration",
            },
          },
          { status: 400 },
        );
      }

      if (!assessment.questionConfig) {
        return NextResponse.json(
          {
            success: false,
            error: {
              message:
                "Cannot publish assessment without question configuration",
            },
          },
          { status: 400 },
        );
      }

      const { mcq, numerical } = assessment.questionConfig;

      if (mcq + numerical !== assessment.totalQuestions) {
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

      if (!assessment.enrichedCurriculumContent) {
        try {
          const enriched = await enrichCurriculumWithWebContent(
            assessment.title,
            assessment.curriculum,
          );

          const enrichedContext = formatEnrichedContent(enriched);

          assessment.enrichedCurriculumContent = enrichedContext;
        } catch (enrichError) {
          console.error("Failed to enrich curriculum:", enrichError);
          console.warn(
            "Publishing without web-enriched content. Questions will use AI-only context.",
          );
        }
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
        ? "Assessment published successfully! Students can now join."
        : "Assessment unpublished successfully",
    });
  } catch (error) {
    console.error("Error publishing assessment:", error);
    return NextResponse.json(
      {
        success: false,
        error: { message: "Failed to update assessment status" },
      },
      { status: 500 },
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { requireTeacher } from "@/lib/auth-helpers";
import dbConnect from "@/lib/mongoose";
import Classroom from "@/database/classroom/classroom.model";
import ClassroomMembership from "@/database/classroom/classroom-membership.model";
import ClassroomSubmission from "@/database/classroom/classroom-submission.model";
import User from "@/database/user.model";

// GET /api/classroom/:id/student - Get all students in classroom
export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
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
        { status: 403 }
      );
    }

    const memberships = await ClassroomMembership.find({
      classroomId: params.id,
      status: "active",
    })
      .populate("studentId", "name email image username")
      .sort({ enrolledAt: -1 });
    // Get performance data for each student
    const studentsWithPerformance = await Promise.all(
      memberships.map(async (membership: any) => {
        const submissions = await ClassroomSubmission.find({
          classroomId: params.id,
          studentId: membership.studentId._id,
          status: { $in: ["graded", "submitted"] },
        }).lean();

        const completedCount = submissions.length;
        const averageScore =
          completedCount > 0
            ? submissions.reduce((sum, s) => sum + s.percentage, 0) /
              completedCount
            : 0;

        return {
          _id: membership._id.toString(),
          student: {
            _id: membership.studentId._id.toString(),
            name: membership.studentId.name,
            email: membership.studentId.email,
            image: membership.studentId.image,
            username: membership.studentId.username,
          },
          enrolledAt: membership.enrolledAt,
          averageScore: Math.round(averageScore * 10) / 10,
          completedAssessments: completedCount,
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: studentsWithPerformance,
    });
  } catch (error) {
    console.error("Error fetching students:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to fetch students" } },
      { status: 500 }
    );
  }
}

// POST /api/classroom/:id/student - Add student to classroom
export async function POST(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { error, user } = await requireTeacher();
    if (error) return error;

    const params = await props.params;
    const body = await request.json();
    const { studentEmail } = body;

    if (!studentEmail) {
      return NextResponse.json(
        { success: false, error: { message: "Student email is required" } },
        { status: 400 }
      );
    }

    await dbConnect();

    // Verify teacher owns this classroom
    const classroom = await Classroom.findById(params.id);
    if (!classroom || classroom.teacherId.toString() !== user.id) {
      return NextResponse.json(
        { success: false, error: { message: "Forbidden" } },
        { status: 403 }
      );
    }

    const student = await User.findOne({
      email: studentEmail.toLowerCase().trim(),
      role: "student",
    });

    if (!student) {
      return NextResponse.json(
        {
          success: false,
          error: { message: "Student not found or invalid role" },
        },
        { status: 404 }
      );
    }

    // Check if already enrolled
    const existing = await ClassroomMembership.findOne({
      classroomId: params.id,
      studentId: student._id,
    });

    if (existing) {
      if (existing.status === "active") {
        return NextResponse.json(
          {
            success: false,
            error: { message: "Student already enrolled" },
          },
          { status: 400 }
        );
      } else {
        // Reactivate membership
        existing.status = "active";
        existing.enrolledAt = new Date();
        await existing.save();

        await Classroom.findByIdAndUpdate(params.id, {
          $inc: { studentCount: 1 },
        });

        const existingObj = existing.toObject();

        return NextResponse.json({
          success: true,
          data: {
            ...existingObj,
            _id: existingObj._id.toString(),
            classroomId: existingObj.classroomId.toString(),
            studentId: existingObj.studentId.toString(),
          },
          message: "Student re-enrolled successfully",
        });
      }
    }

    const membership = await ClassroomMembership.create({
      classroomId: params.id,
      studentId: student._id,
      status: "active",
      enrolledAt: new Date(),
    });

    // Update student count
    await Classroom.findByIdAndUpdate(params.id, {
      $inc: { studentCount: 1 },
    });

    const membershipObj = membership.toObject();

    return NextResponse.json(
      {
        success: true,
        data: {
          ...membershipObj,
          _id: membershipObj._id.toString(),
          classroomId: membershipObj.classroomId.toString(),
          studentId: membershipObj.studentId.toString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error adding student:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to add student" } },
      { status: 500 }
    );
  }
}

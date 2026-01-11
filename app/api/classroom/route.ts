import { NextRequest, NextResponse } from "next/server";
import { requireTeacher } from "@/lib/auth-helpers";
import dbConnect from "@/lib/mongoose";
import Classroom from "@/database/classroom/classroom.model";
import ClassroomMembership from "@/database/classroom/classroom-membership.model";
import { generateClassCode } from "@/lib/utils";

// GET /api/classroom - List all classrooms for teacher
export async function GET() {
  try {
    const { error, user } = await requireTeacher();
    if (error) return error;

    await dbConnect();

    const classrooms = await Classroom.find({
      teacherId: user.id,
      isActive: true,
    }).sort({ createdAt: -1 });

    // Get student count for each classroom
    const classroomsWithCounts = await Promise.all(
      classrooms.map(async (classroom) => {
        const studentCount = await ClassroomMembership.countDocuments({
          classroomId: classroom._id,
          status: "active",
        });

        return {
          ...classroom,
          _id: classroom._id.toString(),
          teacherId: classroom.teacherId.toString(),
          studentCount,
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: classroomsWithCounts,
    });
  } catch (error) {
    console.error("Error fetching classrooms:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to fetch classrooms" } },
      { status: 500 }
    );
  }
}

// POST /api/classroom - Create new classroom
export async function POST(request: NextRequest) {
  try {
    const { error, user } = await requireTeacher();
    if (error) return error;

    const body = await request.json();
    const { name, description, subject } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, error: { message: "Classroom name is required" } },
        { status: 400 }
      );
    }

    await dbConnect();

    // Generate unique classroom code (like Google Classroom)
    let code = generateClassCode();
    let exists = await Classroom.findOne({ code });

    // Keep generating until we get a unique code
    while (exists) {
      code = generateClassCode();
      exists = await Classroom.findOne({ code });
    }

    const classroom = await Classroom.create({
      name: name.trim(),
      description: description?.trim(),
      subject: subject?.trim(),
      code,
      teacherId: user.id,
      isActive: true,
      studentCount: 0,
    });

    const classroomObj = classroom.toObject();

    return NextResponse.json(
      {
        success: true,
        data: {
          ...classroomObj,
          _id: classroomObj._id.toString(),
          teacherId: classroomObj.teacherId.toString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating classroom:", error);
    return NextResponse.json(
      { success: false, error: { message: "Failed to create classroom" } },
      { status: 500 }
    );
  }
}

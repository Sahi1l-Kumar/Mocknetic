import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import User from "@/database/user.model";
import Profile from "@/database/profile.model";
import dbConnect from "@/lib/mongoose";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const body = await req.json();
    const userId = session.user.id;

    await User.findByIdAndUpdate(userId, {
      name: body.name,
      email: body.email,
      bio: body.bio,
      location: body.location,
      currentRole: body.currentRole,
      company: body.company,
      website: body.website,
      github: body.github,
      linkedin: body.linkedin,
      skills: body.skills,
    });

    // ✅ Update Profile collection (experience, education, projects, certifications)
    await Profile.findOneAndUpdate(
      { userId },
      {
        experience: body.experience.map((exp: any) => ({
          title: exp.title,
          company: exp.company,
          location: exp.location,
          startDate: exp.startDate,
          endDate: exp.endDate,
          description: exp.description,
          current: exp.current,
        })),
        education: body.education.map((edu: any) => ({
          degree: edu.degree,
          institution: edu.institution,
          location: edu.location,
          startDate: edu.startDate,
          endDate: edu.endDate,
          gpa: edu.gpa,
        })),
        projects: body.projects.map((proj: any) => ({
          name: proj.name,
          description: proj.description,
          technologies: proj.technologies,
          link: proj.link,
        })),
        certifications: body.certifications.map((cert: any) => ({
          name: cert.name,
          issuer: cert.issuer,
          date: cert.date,
        })),
      },
      { upsert: true, new: true }
    );

    return NextResponse.json(
      { success: true, message: "Profile updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}

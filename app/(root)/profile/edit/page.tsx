import { auth } from "@/auth";
import { redirect } from "next/navigation";
import ROUTES from "@/constants/routes";
import Link from "next/link";
import { Upload } from "lucide-react";

import ProfileEditForm from "@/components/forms/ProfileEditForm";
import User from "@/database/user.model";
import Profile from "@/database/profile.model";
import dbConnect from "@/lib/mongoose";

async function getUserProfile(userId: string) {
  try {
    await dbConnect();

    const user = (await User.findById(userId).lean()) as any;
    if (!user) return null;

    const profile = (await Profile.findOne({ userId }).lean()) as any;

    const profileData = {
      id: user._id.toString(),
      name: user.name || "",
      email: user.email || "",
      bio: user.bio || "",
      location: user.location || "",
      currentRole: user.currentRole || "",
      company: user.company || "",
      website: user.website || "",
      github: user.github || "",
      linkedin: user.linkedin || "",
      skills: user.skills || [],
      experience: (profile?.experience || []).map((exp: any) => ({
        title: exp.title || "",
        company: exp.company || "",
        location: exp.location || "",
        startDate: exp.startDate || "",
        endDate: exp.endDate || "",
        description: exp.description || "",
        current: exp.current || false,
      })),
      education: (profile?.education || []).map((edu: any) => ({
        degree: edu.degree || "",
        institution: edu.institution || "",
        location: edu.location || "",
        startDate: edu.startDate || "",
        endDate: edu.endDate || "",
        gpa: edu.gpa || "",
      })),
      projects: (profile?.projects || []).map((proj: any) => ({
        name: proj.name || "",
        description: proj.description || "",
        technologies: proj.technologies || [],
        link: proj.link || "",
      })),
      certifications: (profile?.certifications || []).map((cert: any) => ({
        name: cert.name || "",
        issuer: cert.issuer || "",
        date: cert.date || "",
      })),
    };

    return profileData;
  } catch (error) {
    console.error("Error fetching profile:", error);
    return null;
  }
}

export default async function EditProfilePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect(ROUTES.SIGN_IN);
  }

  const profile = await getUserProfile(session.user.id);

  if (!profile) {
    redirect(ROUTES.HOME);
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Header with Resume Upload Button */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">
              Edit Profile
            </h1>
            <p className="text-lg text-slate-600">
              Update your information to improve your profile
            </p>
          </div>
          {/* Resume Parser Button */}
          <Link
            href={ROUTES.RESUME}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-all font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <Upload className="w-5 h-5" />
            Upload Resume
          </Link>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8">
          <p className="text-sm text-blue-900">
            💡 <strong>Tip:</strong> Click &quot;Upload Resume&quot; to
            automatically extract and populate your profile information using
            AI.
          </p>
        </div>

        <ProfileEditForm profile={profile} userId={session.user.id} />
      </div>
    </div>
  );
}

import { auth } from "@/auth";
import { redirect } from "next/navigation";
import {
  Mail,
  MapPin,
  Briefcase,
  GraduationCap,
  Code,
  Award,
  Calendar,
  ExternalLink,
  Github,
  Linkedin,
  Globe,
  Edit,
} from "lucide-react";

import UserAvatar from "@/components/UserAvatar";
import { Button } from "@/components/ui/button";
import ROUTES from "@/constants/routes";
import Link from "next/link";
import User from "@/database/user.model";
import Profile from "@/database/profile.model";
import dbConnect from "@/lib/mongoose";

interface ProfilePageProps {
  params: {
    id: string;
  };
}

async function getUserProfile(id: string) {
  try {
    await dbConnect();

    const user = (await User.findById(id).lean()) as any;

    if (!user) {
      return null;
    }

    const profile = (await Profile.findOne({ userId: id }).lean()) as any;

    return {
      id: user._id.toString(),
      name: user.name || "User",
      email: user.email || "",
      image: user.image || null,
      bio: user.bio || "",
      location: user.location || "",
      currentRole: user.currentRole || "Developer",
      company: user.company || "",
      website: user.website || "",
      github: user.github || "",
      linkedin: user.linkedin || "",
      skills: user.skills || [],
      experience: profile?.experience || [],
      education: profile?.education || [],
      projects: profile?.projects || [],
      certifications: profile?.certifications || [],
    };
  } catch (error) {
    console.error("Error fetching profile:", error);
    return null;
  }
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const session = await auth();

  if (!session?.user) {
    redirect(ROUTES.SIGN_IN);
  }

  const { id } = await params;

  const profile = await getUserProfile(id);

  if (!profile) {
    redirect(ROUTES.HOME);
  }

  const isOwnProfile = session?.user?.id === id;

  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-8">
          <div className="h-32 bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 relative">
            <div className="absolute -bottom-16 left-8">
              <UserAvatar
                id={profile.id}
                name={profile.name}
                imageUrl={profile.image}
                className="h-32 w-32 border-4 border-white shadow-lg"
                fallbackClassName="text-3xl"
              />
            </div>
          </div>

          <div className="pt-20 px-8 pb-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 mb-2">
                  {profile.name}
                </h1>
                {profile.currentRole && profile.company && (
                  <p className="text-xl text-slate-600 mb-3">
                    {profile.currentRole} at {profile.company}
                  </p>
                )}
                <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                  {profile.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{profile.location}</span>
                    </div>
                  )}
                  {profile.email && (
                    <div className="flex items-center gap-1">
                      <Mail className="w-4 h-4" />
                      <span>{profile.email}</span>
                    </div>
                  )}
                </div>
              </div>

              {isOwnProfile && (
                <Button variant="outline" className="flex items-center gap-2">
                  <Edit className="w-4 h-4" />
                  <Link href={ROUTES.PROFILE_EDIT}>Edit Profile</Link>
                </Button>
              )}
            </div>

            {profile.bio && (
              <p className="text-slate-700 leading-relaxed mb-6">
                {profile.bio}
              </p>
            )}

            <div className="flex gap-3">
              {profile.website && (
                <a
                  href={
                    profile.website.startsWith("http")
                      ? profile.website
                      : `https://${profile.website}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors text-sm font-medium"
                >
                  <Globe className="w-4 h-4" />
                  <span>Website</span>
                </a>
              )}
              {profile.github && (
                <a
                  href={`https://github.com/${profile.github}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors text-sm font-medium"
                >
                  <Github className="w-4 h-4" />
                  <span>GitHub</span>
                </a>
              )}
              {profile.linkedin && (
                <a
                  href={`https://linkedin.com/in/${profile.linkedin}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors text-sm font-medium"
                >
                  <Linkedin className="w-4 h-4" />
                  <span>LinkedIn</span>
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-8">
          <div className="col-span-2 space-y-8">
            {profile.experience.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-blue-100 p-3 rounded-xl">
                    <Briefcase className="w-6 h-6 text-blue-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900">
                    Experience
                  </h2>
                </div>

                <div className="space-y-6">
                  {profile.experience.map((exp: any, idx: number) => (
                    <div
                      key={idx}
                      className="border-l-2 border-blue-200 pl-6 pb-6 last:pb-0 relative"
                    >
                      <div className="absolute -left-2 top-0 w-4 h-4 bg-blue-600 rounded-full"></div>
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-lg font-bold text-slate-900">
                            {exp.title}
                          </h3>
                          <p className="text-blue-600 font-semibold">
                            {exp.company}
                          </p>
                        </div>
                        {exp.current && (
                          <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">
                            Current
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-slate-600 mb-3">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {exp.startDate} - {exp.endDate}
                          </span>
                        </div>
                        {exp.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            <span>{exp.location}</span>
                          </div>
                        )}
                      </div>
                      {exp.description && (
                        <p className="text-slate-700 leading-relaxed">
                          {exp.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {profile.education.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-emerald-100 p-3 rounded-xl">
                    <GraduationCap className="w-6 h-6 text-emerald-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900">
                    Education
                  </h2>
                </div>

                <div className="space-y-6">
                  {profile.education.map((edu: any, idx: number) => (
                    <div
                      key={idx}
                      className="border-l-2 border-emerald-200 pl-6 relative"
                    >
                      <div className="absolute -left-2 top-0 w-4 h-4 bg-emerald-600 rounded-full"></div>
                      <h3 className="text-lg font-bold text-slate-900 mb-1">
                        {edu.degree}
                      </h3>
                      <p className="text-emerald-600 font-semibold mb-2">
                        {edu.institution}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-slate-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {edu.startDate} - {edu.endDate}
                          </span>
                        </div>
                        {edu.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            <span>{edu.location}</span>
                          </div>
                        )}
                        {edu.gpa && (
                          <span className="bg-slate-100 px-3 py-1 rounded-full text-xs font-semibold">
                            GPA: {edu.gpa}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {profile.projects.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-purple-100 p-3 rounded-xl">
                    <Code className="w-6 h-6 text-purple-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900">
                    Projects
                  </h2>
                </div>

                <div className="space-y-6">
                  {profile.projects.map((project: any, idx: number) => (
                    <div
                      key={idx}
                      className="border border-slate-200 rounded-xl p-6 hover:border-purple-300 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-lg font-bold text-slate-900">
                          {project.name}
                        </h3>
                        {project.link && (
                          <a
                            href={project.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-purple-600 hover:text-purple-700"
                          >
                            <ExternalLink className="w-5 h-5" />
                          </a>
                        )}
                      </div>
                      <p className="text-slate-700 mb-4 leading-relaxed">
                        {project.description}
                      </p>
                      {project.technologies &&
                        project.technologies.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {project.technologies.map((tech: string) => (
                              <span
                                key={tech}
                                className="bg-purple-50 text-purple-700 px-3 py-1 rounded-lg text-sm font-medium"
                              >
                                {tech}
                              </span>
                            ))}
                          </div>
                        )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-8">
            {profile.skills.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-indigo-100 p-3 rounded-xl">
                    <Code className="w-5 h-5 text-indigo-600" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">Skills</h2>
                </div>

                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill: string) => (
                    <span
                      key={skill}
                      className="bg-slate-100 text-slate-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {profile.certifications.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-amber-100 p-3 rounded-xl">
                    <Award className="w-5 h-5 text-amber-600" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">
                    Certifications
                  </h2>
                </div>

                <div className="space-y-4">
                  {profile.certifications.map((cert: any, idx: number) => (
                    <div key={idx} className="border-l-2 border-amber-200 pl-4">
                      <h3 className="font-bold text-slate-900 text-sm mb-1">
                        {cert.name}
                      </h3>
                      <p className="text-amber-600 text-sm font-semibold mb-1">
                        {cert.issuer}
                      </p>
                      <p className="text-slate-600 text-xs">{cert.date}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

import { auth } from "@/auth";
import { redirect } from "next/navigation";
import ROUTES from "@/constants/routes";

import ProfileEditForm from "@/components/forms/ProfileEditForm";

async function getUserProfile(id: string) {
  // TODO: Replace with actual database call
  return {
    id: id,
    name: "Alex Johnson",
    email: "alex.johnson@example.com",
    bio: "Passionate Full Stack Developer with 5+ years of experience building scalable web applications.",
    location: "San Francisco, CA",
    currentRole: "Senior Frontend Engineer",
    company: "TechCorp Inc.",
    website: "https://alexjohnson.dev",
    github: "alexjohnson",
    linkedin: "alexjohnson",
    skills: [
      "React",
      "Next.js",
      "TypeScript",
      "Node.js",
      "Express",
      "MongoDB",
      "PostgreSQL",
      "AWS",
      "Docker",
      "GraphQL",
    ],
    experience: [
      {
        id: "1",
        title: "Senior Frontend Engineer",
        company: "TechCorp Inc.",
        location: "San Francisco, CA",
        startDate: "Jan 2022",
        endDate: "Present",
        description: "Lead development of customer-facing web applications.",
        current: true,
      },
    ],
    education: [
      {
        id: "1",
        degree: "Bachelor of Science in Computer Science",
        institution: "Stanford University",
        location: "Stanford, CA",
        startDate: "2014",
        endDate: "2018",
        gpa: "3.8/4.0",
      },
    ],
    projects: [
      {
        id: "1",
        name: "E-Commerce Platform",
        description: "Built a full-stack e-commerce platform.",
        technologies: ["React", "Node.js", "MongoDB"],
        link: "https://github.com/alexjohnson/ecommerce",
      },
    ],
    certifications: [
      {
        id: "1",
        name: "AWS Certified Solutions Architect",
        issuer: "Amazon Web Services",
        date: "2023",
      },
    ],
  };
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
    <div className="min-h-screen">
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            Edit Profile
          </h1>
          <p className="text-lg text-slate-600">
            Update your information or upload a new resume to auto-fill
          </p>
        </div>

        <ProfileEditForm profile={profile} userId={session.user.id} />
      </div>
    </div>
  );
}

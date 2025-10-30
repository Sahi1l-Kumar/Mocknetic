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

interface ProfilePageProps {
  params: {
    id: string;
  };
}

async function getUserProfile(id: string) {
  // TODO: Replace with actual database call
  // const user = await db.user.findUnique({ where: { id } });

  // Mock data for now
  return {
    id: id,
    name: "Alex Johnson",
    email: "alex.johnson@example.com",
    image: null,
    bio: "Passionate Full Stack Developer with 5+ years of experience building scalable web applications. Specialized in React, Node.js, and cloud technologies.",
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
      "Tailwind CSS",
      "Git",
      "CI/CD",
      "Jest",
      "React Native",
    ],

    experience: [
      {
        id: "1",
        title: "Senior Frontend Engineer",
        company: "TechCorp Inc.",
        location: "San Francisco, CA",
        startDate: "Jan 2022",
        endDate: "Present",
        description:
          "Lead development of customer-facing web applications using React and Next.js. Improved performance by 40% and reduced bundle size by 30%.",
        current: true,
      },
      {
        id: "2",
        title: "Full Stack Developer",
        company: "StartupXYZ",
        location: "Remote",
        startDate: "Jun 2020",
        endDate: "Dec 2021",
        description:
          "Built and maintained multiple microservices using Node.js and Express. Implemented CI/CD pipelines and improved deployment efficiency.",
        current: false,
      },
      {
        id: "3",
        title: "Junior Developer",
        company: "DevStudio",
        location: "New York, NY",
        startDate: "Aug 2018",
        endDate: "May 2020",
        description:
          "Developed responsive web applications and collaborated with cross-functional teams to deliver high-quality products.",
        current: false,
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
        description:
          "Built a full-stack e-commerce platform with React, Node.js, and MongoDB. Implemented payment integration, inventory management, and real-time notifications.",
        technologies: ["React", "Node.js", "MongoDB", "Stripe", "Socket.io"],
        link: "https://github.com/alexjohnson/ecommerce",
      },
      {
        id: "2",
        name: "Task Management App",
        description:
          "Developed a collaborative task management application with real-time updates and team collaboration features.",
        technologies: [
          "Next.js",
          "TypeScript",
          "Prisma",
          "PostgreSQL",
          "TailwindCSS",
        ],
        link: "https://github.com/alexjohnson/taskmanager",
      },
      {
        id: "3",
        name: "Weather Dashboard",
        description:
          "Created a responsive weather dashboard with location-based forecasts and interactive charts.",
        technologies: ["React", "Chart.js", "OpenWeather API", "Geolocation"],
        link: "https://github.com/alexjohnson/weather-app",
      },
    ],

    certifications: [
      {
        id: "1",
        name: "AWS Certified Solutions Architect",
        issuer: "Amazon Web Services",
        date: "2023",
      },
      {
        id: "2",
        name: "Google Cloud Professional Developer",
        issuer: "Google Cloud",
        date: "2022",
      },
    ],
  };
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const session = await auth();

  if (!session?.user) {
    redirect(ROUTES.SIGN_IN);
  }

  const profile = await getUserProfile(params.id);

  if (!profile) {
    redirect(ROUTES.HOME);
  }

  const isOwnProfile = session?.user?.id === params.id;

  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-8">
          <div className="h-32 bg-linear-to-r from-blue-600 via-blue-700 to-blue-800 relative">
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
                <p className="text-xl text-slate-600 mb-3">
                  {profile.currentRole} at {profile.company}
                </p>
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
                  href={profile.website}
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
                {profile.experience.map((exp) => (
                  <div
                    key={exp.id}
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
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>{exp.location}</span>
                      </div>
                    </div>
                    <p className="text-slate-700 leading-relaxed">
                      {exp.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-emerald-100 p-3 rounded-xl">
                  <GraduationCap className="w-6 h-6 text-emerald-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">Education</h2>
              </div>

              <div className="space-y-6">
                {profile.education.map((edu) => (
                  <div
                    key={edu.id}
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
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>{edu.location}</span>
                      </div>
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

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-purple-100 p-3 rounded-xl">
                  <Code className="w-6 h-6 text-purple-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">Projects</h2>
              </div>

              <div className="space-y-6">
                {profile.projects.map((project) => (
                  <div
                    key={project.id}
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
                    <div className="flex flex-wrap gap-2">
                      {project.technologies.map((tech) => (
                        <span
                          key={tech}
                          className="bg-purple-50 text-purple-700 px-3 py-1 rounded-lg text-sm font-medium"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-indigo-100 p-3 rounded-xl">
                  <Code className="w-5 h-5 text-indigo-600" />
                </div>
                <h2 className="text-xl font-bold text-slate-900">Skills</h2>
              </div>

              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill) => (
                  <span
                    key={skill}
                    className="bg-slate-100 text-slate-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

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
                {profile.certifications.map((cert) => (
                  <div
                    key={cert.id}
                    className="border-l-2 border-amber-200 pl-4"
                  >
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
          </div>
        </div>
      </div>
    </div>
  );
}

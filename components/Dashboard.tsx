import {
  Target,
  TrendingUp,
  Trophy,
  ArrowRight,
  GraduationCap,
  BookOpen,
  Clock,
} from "lucide-react";
import ROUTES from "@/constants/routes";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import User from "@/database/user.model";
import Profile from "@/database/profile.model";
import Assessment from "@/database/skill-evaluation/skill-evaluation.model";
import ClassroomMembership from "@/database/classroom/classroom-membership.model";
import Classroom from "@/database/classroom/classroom.model";
import ClassroomAssessment from "@/database/classroom/classroom-assignment.model";
import ClassroomSubmission from "@/database/classroom/classroom-submission.model";
import dbConnect from "@/lib/mongoose";
import Link from "next/link";

interface DashboardData {
  name: string;
  currentRole?: string;
  company?: string;
  skillsMastered: number;
  totalSkills: number;
  problemsSolved: number;
  mockInterviewsCompleted: number;
  averageScore: number;
  overallProgress: number;
  experience: any[];
  projects: any[];
  recentAssessments: any[];
  recentActivity: any[];
  joinedClasses: any[];
  pendingClassAssessments: number;
}

async function getDashboardData(userId: string): Promise<DashboardData | null> {
  try {
    await dbConnect();

    // Fetch user data
    const user = (await User.findById(userId).lean()) as any;
    if (!user) return null;

    // Fetch profile data
    const profile = (await Profile.findOne({ userId }).lean()) as any;

    // Fetch skill assessments
    const assessments = (await Assessment.find({ userId })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean()) as any[];

    // Fetch joined classrooms via memberships [web:7]
    const memberships = await ClassroomMembership.find({
      studentId: userId,
    }).lean();

    const classroomIds = memberships.map((m: any) => m.classroomId);

    // Fetch classroom details [web:4]
    const classrooms = await Classroom.find({
      _id: { $in: classroomIds },
    })
      .populate("teacherId", "name")
      .lean();

    // Build joined classes data with real assessment counts
    const joinedClasses = await Promise.all(
      classrooms.map(async (classroom: any) => {
        // Get all assessments for this classroom [web:7]
        const classroomAssessments = await ClassroomAssessment.find({
          classroomId: classroom._id,
          isPublished: true,
        }).lean();

        // Get student submissions for these assessments
        const submissions = await ClassroomSubmission.find({
          studentId: userId,
          assessmentId: { $in: classroomAssessments.map((a: any) => a._id) },
        }).lean();

        const submittedAssessmentIds = new Set(
          submissions.map((s: any) => s.assessmentId.toString())
        );

        const pendingCount = classroomAssessments.filter(
          (a: any) => !submittedAssessmentIds.has(a._id.toString())
        ).length;

        const completedCount = submissions.length;

        // Get most recent activity
        const latestSubmission = submissions.sort(
          (a: any, b: any) =>
            new Date(b.submittedAt).getTime() -
            new Date(a.submittedAt).getTime()
        )[0];

        const lastActivity = latestSubmission
          ? new Date(latestSubmission.submittedAt)
          : classroom.createdAt;

        return {
          _id: classroom._id.toString(),
          name: classroom.name || "Untitled Classroom",
          teacherName: classroom.teacherId?.name || "Unknown Teacher",
          code: classroom.code || "N/A",
          pendingAssessments: pendingCount,
          completedAssessments: completedCount,
          lastActivity,
        };
      })
    );

    const pendingClassAssessments = joinedClasses.reduce(
      (sum, c) => sum + c.pendingAssessments,
      0
    );

    // Calculate skill mastery from skill assessments
    const uniqueSkills = new Set<string>();
    const masteredSkills = new Set<string>();

    assessments.forEach((assessment: any) => {
      assessment.questions?.forEach((q: any) => {
        if (q.skill) {
          uniqueSkills.add(q.skill);
          if (q.isCorrect) {
            masteredSkills.add(q.skill);
          }
        }
      });
    });

    // Calculate problems solved (from skill assessments)
    const problemsSolved = assessments.reduce(
      (sum: number, a: any) => sum + (a.totalQuestions || 0),
      0
    );

    // Calculate completed assessments and average score
    const completedAssessments = assessments.filter(
      (a: any) => a.completedAt || a.score !== undefined
    );

    const averageScore =
      completedAssessments.length > 0
        ? Math.round(
            completedAssessments.reduce(
              (sum: number, a: any) => sum + (a.score || 0),
              0
            ) / completedAssessments.length
          )
        : 0;

    // Calculate overall progress
    const totalAssessments =
      assessments.length +
      joinedClasses.reduce((sum, c) => sum + c.completedAssessments, 0);
    const completedTotal =
      completedAssessments.length +
      joinedClasses.reduce((sum, c) => sum + c.completedAssessments, 0);

    const overallProgress =
      totalAssessments > 0
        ? Math.round((completedTotal / totalAssessments) * 100)
        : 0;

    // Build recent activity
    const recentActivity = [
      ...assessments.slice(0, 3).map((assessment: any) => ({
        type: "assessment",
        title: `Completed ${assessment.jobRole || "Skill"} assessment`,
        description: `Score: ${assessment.score || 0}/100 • ${new Date(assessment.createdAt).toLocaleDateString()}`,
        icon: Target,
        color: "emerald",
      })),
    ];

    return {
      name: user.name || "User",
      currentRole: profile?.currentRole || user.currentRole || "Student",
      company: profile?.company || user.company || "Your Institution",
      skillsMastered: masteredSkills.size,
      totalSkills: Math.max(uniqueSkills.size, 1), // Avoid division by zero
      problemsSolved,
      mockInterviewsCompleted: completedAssessments.length,
      averageScore,
      overallProgress: Math.min(overallProgress, 100),
      experience: profile?.experience || [],
      projects: profile?.projects || [],
      recentAssessments: assessments.slice(0, 5),
      recentActivity,
      joinedClasses: joinedClasses.sort(
        (a, b) => b.lastActivity.getTime() - a.lastActivity.getTime()
      ),
      pendingClassAssessments,
    };
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return null;
  }
}

async function Dashboard() {
  const session = await auth();

  if (!session?.user) {
    redirect(ROUTES.SIGN_IN);
  }

  const data = await getDashboardData(session.user.id);

  if (!data) {
    redirect(ROUTES.HOME);
  }

  return (
    <div className="min-h-screen">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 mb-2">
            Welcome back, {data.name}
          </h1>
          <p className="text-base sm:text-lg text-slate-600">
            Ready to level up your interview skills?
          </p>
        </div>

        {/* Progress Card - Mobile Optimized */}
        <div className="mb-8 sm:mb-12">
          <div className="bg-linear-to-br from-blue-600 via-blue-700 to-blue-800 rounded-xl sm:rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl">
            <div className="absolute top-0 right-0 w-48 h-48 sm:w-64 sm:h-64 bg-white/5 rounded-full -mr-24 sm:-mr-32 -mt-24 sm:-mt-32"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 sm:w-48 sm:h-48 bg-white/5 rounded-full -ml-16 sm:-ml-24 -mb-16 sm:-mb-24"></div>
            <div className="relative">
              <div className="flex items-start justify-between mb-4 sm:mb-6">
                <div>
                  <div className="inline-block bg-white/20 backdrop-blur-sm px-2 sm:px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide mb-2 sm:mb-3">
                    In Progress
                  </div>
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-1 sm:mb-2">
                    {data.currentRole} Path
                  </h2>
                  <p className="text-sm sm:text-base text-blue-100">
                    Continue leveling up at {data.company}
                  </p>
                </div>
                <Trophy className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-yellow-300" />
              </div>

              {/* Stats Grid - Responsive */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 border border-white/20">
                  <div className="text-xl sm:text-2xl md:text-3xl font-bold mb-1">
                    {data.skillsMastered}/{data.totalSkills}
                  </div>
                  <div className="text-blue-100 text-xs sm:text-sm">
                    Skills Mastered
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 border border-white/20">
                  <div className="text-xl sm:text-2xl md:text-3xl font-bold mb-1">
                    {data.problemsSolved}
                  </div>
                  <div className="text-blue-100 text-xs sm:text-sm">
                    Problems Solved
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 border border-white/20">
                  <div className="text-xl sm:text-2xl md:text-3xl font-bold mb-1">
                    {data.mockInterviewsCompleted}
                  </div>
                  <div className="text-blue-100 text-xs sm:text-sm">
                    Assessments Done
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 border border-white/20">
                  <div className="text-xl sm:text-2xl md:text-3xl font-bold mb-1">
                    {data.averageScore}%
                  </div>
                  <div className="text-blue-100 text-xs sm:text-sm">
                    Avg Score
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl p-4 sm:p-5 border border-white/20">
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <span className="text-sm sm:text-base font-semibold">
                    Overall Progress
                  </span>
                  <span className="text-xl sm:text-2xl font-bold">
                    {data.overallProgress}%
                  </span>
                </div>
                <div className="bg-white/20 rounded-full h-2 sm:h-3 mb-3 sm:mb-4">
                  <div
                    className="bg-linear-to-r from-green-400 to-emerald-400 rounded-full h-2 sm:h-3 shadow-lg transition-all"
                    style={{ width: `${data.overallProgress}%` }}
                  ></div>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0 text-xs sm:text-sm text-blue-100">
                  <span>
                    {data.mockInterviewsCompleted} assessments completed
                  </span>
                  <span className="font-semibold text-white">
                    {100 - data.overallProgress}% to go
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Joined Classes Section - Mobile Optimized */}
        {data.joinedClasses.length > 0 && (
          <div className="mb-8 sm:mb-12">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                Your Classes
              </h2>
              <Link
                href={ROUTES.CLASSROOM}
                className="text-indigo-600 hover:text-indigo-700 font-semibold text-xs sm:text-sm flex items-center space-x-1"
              >
                <span>Join New</span>
                <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {data.joinedClasses.map((classroom: any) => (
                <div
                  key={classroom._id}
                  className="bg-white rounded-xl p-5 sm:p-6 shadow-lg border-2 border-slate-200 hover:border-indigo-400 transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="bg-indigo-100 rounded-lg p-2 sm:p-3">
                      <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600" />
                    </div>
                    <div className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded text-xs font-bold">
                      {classroom.code}
                    </div>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-1 line-clamp-1">
                    {classroom.name}
                  </h3>
                  <p className="text-sm text-slate-600 mb-4">
                    {classroom.teacherName}
                  </p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">Pending</span>
                      <span className="font-semibold text-orange-600">
                        {classroom.pendingAssessments} assessment
                        {classroom.pendingAssessments !== 1 ? "s" : ""}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">Completed</span>
                      <span className="font-semibold text-emerald-600">
                        {classroom.completedAssessments} assessment
                        {classroom.completedAssessments !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                    <div className="flex items-center space-x-1 text-xs text-slate-500">
                      <Clock className="w-3 h-3" />
                      <span>
                        {new Date(classroom.lastActivity).toLocaleDateString()}
                      </span>
                    </div>
                    <Link
                      href={`/classroom/${classroom._id}`}
                      className="text-indigo-600 hover:text-indigo-700 font-semibold text-sm"
                    >
                      View →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pending Class Assessments Alert - Mobile Optimized */}
        {data.pendingClassAssessments > 0 && (
          <div className="mb-8 sm:mb-12">
            <div className="bg-linear-to-r from-orange-500 to-orange-600 rounded-xl p-5 sm:p-6 text-white shadow-lg">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center space-x-3 sm:space-x-4">
                  <div className="bg-white/20 rounded-lg p-2 sm:p-3 flex-shrink-0">
                    <BookOpen className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold mb-1">
                      {data.pendingClassAssessments} Pending Assessment
                      {data.pendingClassAssessments !== 1 ? "s" : ""}
                    </h3>
                    <p className="text-sm sm:text-base text-orange-100">
                      Complete your assignments from your teachers
                    </p>
                  </div>
                </div>
                <Link
                  href={ROUTES.CLASSROOM}
                  className="bg-white text-orange-600 px-5 sm:px-6 py-2.5 sm:py-3 rounded-lg hover:bg-orange-50 transition-all font-semibold text-sm sm:text-base text-center"
                >
                  View All
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Learning Path - Mobile Optimized */}
        <div className="mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4 sm:mb-6">
            Your Learning Path
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <Link
              href={ROUTES.SKILL}
              className="group bg-white rounded-xl sm:rounded-2xl p-6 sm:p-8 border-2 border-slate-200 hover:border-emerald-400 shadow-sm hover:shadow-xl transition-all duration-300 text-left relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-emerald-50 rounded-full -mr-12 sm:-mr-16 -mt-12 sm:-mt-16 group-hover:scale-150 transition-transform duration-500"></div>
              <div className="relative">
                <div className="bg-emerald-100 w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center mb-3 sm:mb-4 group-hover:bg-emerald-500 transition-colors">
                  <Target className="w-6 h-6 sm:w-7 sm:h-7 text-emerald-600 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">
                  Skill Assessment
                </h3>
                <p className="text-sm sm:text-base text-slate-600 mb-3 sm:mb-4">
                  Analyze gaps between your current skills and job requirements
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm font-semibold text-emerald-600">
                    {data.recentAssessments.length} assessments taken
                  </span>
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-2 transition-all" />
                </div>
              </div>
            </Link>

            <Link
              href={ROUTES.PROFILE(session.user.id)}
              className="group bg-white rounded-xl sm:rounded-2xl p-6 sm:p-8 border-2 border-slate-200 hover:border-blue-400 shadow-sm hover:shadow-xl transition-all duration-300 text-left relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-blue-50 rounded-full -mr-12 sm:-mr-16 -mt-12 sm:-mt-16 group-hover:scale-150 transition-transform duration-500"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className="bg-blue-100 w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center group-hover:bg-blue-500 transition-colors">
                    <TrendingUp className="w-6 h-6 sm:w-7 sm:h-7 text-blue-600 group-hover:text-white transition-colors" />
                  </div>
                  <div className="bg-blue-100 text-blue-700 px-2 sm:px-3 py-1 rounded-full text-xs font-bold">
                    {data.experience.length} exp
                  </div>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">
                  Your Profile
                </h3>
                <p className="text-sm sm:text-base text-slate-600 mb-3 sm:mb-4">
                  View and manage your professional profile
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm font-semibold text-blue-600">
                    {data.projects.length} projects
                  </span>
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-2 transition-all" />
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Recent Assessments - Mobile Optimized */}
        {data.recentAssessments.length > 0 && (
          <div className="bg-linear-to-r from-slate-800 via-slate-900 to-slate-800 rounded-xl sm:rounded-2xl p-6 sm:p-10 relative overflow-hidden">
            <div className="absolute inset-0 bg-linear-to-r from-blue-500/10 via-purple-500/10 to-rose-500/10"></div>
            <div className="relative">
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">
                Recent Assessments
              </h3>
              <div className="space-y-2 sm:space-y-3">
                {data.recentAssessments.slice(0, 3).map((assessment: any) => (
                  <div
                    key={assessment._id}
                    className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10"
                  >
                    <div className="flex items-center space-x-3 sm:space-x-4 flex-1">
                      <div className="bg-blue-500/20 rounded-lg p-2 flex-shrink-0">
                        <Target className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-semibold text-sm sm:text-base truncate">
                          Completed {assessment.jobRole || "Skill"} assessment
                        </p>
                        <p className="text-slate-400 text-xs sm:text-sm">
                          {assessment.totalQuestions || 0} questions •{" "}
                          {new Date(assessment.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div
                      className={`px-3 sm:px-4 py-2 rounded-lg font-semibold text-sm self-start sm:self-auto ${
                        (assessment.score || 0) >= 80
                          ? "bg-green-500/20 text-green-400"
                          : (assessment.score || 0) >= 60
                            ? "bg-yellow-500/20 text-yellow-400"
                            : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {assessment.score || 0}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default Dashboard;

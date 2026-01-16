import {
  Target,
  TrendingUp,
  Trophy,
  ArrowRight,
  GraduationCap,
  BookOpen,
  Clock,
  AlertTriangle,
  TrendingDown,
} from "lucide-react";
import ROUTES from "@/constants/routes";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import User from "@/database/user.model";
import Profile from "@/database/profile.model";
import { SkillResult } from "@/database";
import Interview from "@/database/interview.model";
import ClassroomMembership from "@/database/classroom/classroom-membership.model";
import Classroom from "@/database/classroom/classroom.model";
import ClassroomAssessment from "@/database/classroom/classroom-assignment.model";
import ClassroomSubmission from "@/database/classroom/classroom-submission.model";
import dbConnect from "@/lib/mongoose";
import Link from "next/link";

interface SkillGap {
  skill: string;
  accuracy: number;
  gap: number;
  questionsAnswered: number;
  correctAnswers: number;
}

interface Recommendation {
  title: string;
  description: string;
  link: string;
  skill: string;
}

interface SkillAssessmentResult {
  _id: string;
  jobRole: string;
  difficulty: string;
  overallScore: number;
  correctAnswers: number;
  totalQuestions: number;
  skillGaps: SkillGap[];
  recommendations: Recommendation[];
  completedAt: Date;
}

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
  recentSkillAssessments: SkillAssessmentResult[];
  topSkillGaps: SkillGap[];
  topRecommendations: Recommendation[];
  recentActivity: any[];
  joinedClasses: any[];
  pendingClassAssessments: number;
  assessmentTrend: "up" | "down" | "stable";
  recentInterviews: any[];
  totalInterviews: number;
  avgInterviewScore: number;
}

async function getDashboardData(userId: string): Promise<DashboardData | null> {
  try {
    await dbConnect();

    const user = (await User.findById(userId).lean()) as any;
    if (!user) return null;

    const profile = (await Profile.findOne({ userId }).lean()) as any;

    const skillResults = (await SkillResult.find({ userId })
      .sort({ completedAt: -1 })
      .limit(10)
      .lean()) as any[];

    const interviews = await Interview.find({
      userId,
      status: "completed",
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    const totalInterviews = interviews.length;
    const avgInterviewScore =
      totalInterviews > 0
        ? Math.round(
            interviews.reduce(
              (sum: number, i: any) => sum + (i.scores?.overall || 0),
              0
            ) / totalInterviews
          )
        : 0;

    const memberships = await ClassroomMembership.find({
      studentId: userId,
    }).lean();

    const classroomIds = memberships.map((m: any) => m.classroomId);

    const classrooms = await Classroom.find({
      _id: { $in: classroomIds },
    })
      .populate("teacherId", "name")
      .lean();

    const joinedClasses = await Promise.all(
      classrooms.map(async (classroom: any) => {
        const classroomAssessments = await ClassroomAssessment.find({
          classroomId: classroom._id,
          isPublished: true,
        }).lean();

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

    const allSkillGaps: SkillGap[] = [];
    const masteredSkills = new Set<string>();
    const allSkills = new Set<string>();

    skillResults.forEach((result: any) => {
      result.skillGaps?.forEach((gap: SkillGap) => {
        allSkills.add(gap.skill);
        if (gap.accuracy >= 80) {
          masteredSkills.add(gap.skill);
        }
        allSkillGaps.push(gap);
      });
    });

    const skillGapMap = new Map<string, SkillGap>();
    allSkillGaps.forEach((gap) => {
      if (!skillGapMap.has(gap.skill)) {
        skillGapMap.set(gap.skill, gap);
      } else {
        skillGapMap.set(gap.skill, gap);
      }
    });

    const topSkillGaps = Array.from(skillGapMap.values())
      .sort((a, b) => b.gap - a.gap)
      .slice(0, 5);

    const allRecommendations: Recommendation[] = [];
    skillResults.forEach((result: any) => {
      if (result.recommendations) {
        allRecommendations.push(...result.recommendations);
      }
    });

    const uniqueRecommendations = Array.from(
      new Map(allRecommendations.map((r) => [r.title, r])).values()
    ).slice(0, 3);

    const problemsSolved = skillResults.reduce(
      (sum: number, r: any) => sum + (r.totalQuestions || 0),
      0
    );

    const averageScore =
      skillResults.length > 0
        ? Math.round(
            skillResults.reduce(
              (sum: number, r: any) => sum + (r.overallScore || 0),
              0
            ) / skillResults.length
          )
        : 0;

    let assessmentTrend: "up" | "down" | "stable" = "stable";
    if (skillResults.length >= 2) {
      const recentScore = skillResults[0].overallScore || 0;
      const previousScore = skillResults[1].overallScore || 0;
      if (recentScore > previousScore + 5) assessmentTrend = "up";
      else if (recentScore < previousScore - 5) assessmentTrend = "down";
    }

    const totalAssessments =
      skillResults.length +
      joinedClasses.reduce((sum, c) => sum + c.completedAssessments, 0) +
      totalInterviews;

    const completedTotal =
      skillResults.length +
      joinedClasses.reduce((sum, c) => sum + c.completedAssessments, 0) +
      totalInterviews;

    const overallProgress =
      totalAssessments > 0
        ? Math.round((completedTotal / totalAssessments) * 100)
        : 0;

    const recentActivity = [
      ...skillResults.slice(0, 2).map((result: any) => ({
        type: "skill_assessment",
        title: `Completed ${result.jobRole || "Skill"} assessment`,
        description: `Score: ${result.overallScore || 0}% • ${new Date(result.completedAt).toLocaleDateString()}`,
        icon: Target,
        color: "emerald",
      })),
      ...interviews.slice(0, 2).map((interview: any) => ({
        type: "ai_interview",
        title: `Completed ${interview.type} interview`,
        description: `Score: ${interview.scores?.overall || 0}% • ${new Date(interview.createdAt).toLocaleDateString()}`,
        icon: GraduationCap,
        color: "purple",
      })),
    ];

    return {
      name: user.name || "User",
      currentRole: profile?.currentRole || user.currentRole || "Student",
      company: profile?.company || user.company || "Your Institution",
      skillsMastered: masteredSkills.size,
      totalSkills: Math.max(allSkills.size, 1),
      problemsSolved,
      mockInterviewsCompleted: skillResults.length,
      averageScore,
      overallProgress: Math.min(overallProgress, 100),
      experience: profile?.experience || [],
      projects: profile?.projects || [],
      recentSkillAssessments: skillResults.slice(
        0,
        5
      ) as SkillAssessmentResult[],
      topSkillGaps,
      topRecommendations: uniqueRecommendations,
      recentActivity,
      joinedClasses: joinedClasses.sort(
        (a, b) => b.lastActivity.getTime() - a.lastActivity.getTime()
      ),
      pendingClassAssessments,
      assessmentTrend,
      recentInterviews: interviews.slice(0, 5),
      totalInterviews,
      avgInterviewScore,
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

        {/* Progress Card */}
        <div className="mb-8 sm:mb-12">
          <div className="bg-linear-to-br from-blue-600 via-blue-700 to-blue-800 rounded-xl sm:rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl">
            <div className="absolute top-0 right-0 w-48 h-48 sm:w-64 sm:h-64 bg-white/5 rounded-full -mr-24 sm:-mr-32 -mt-24 sm:-mt-32"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 sm:w-48 sm:h-48 bg-white/5 rounded-full -ml-16 sm:-ml-24 -mb-16 sm:-mb-24"></div>
            <div className="relative">
              <div className="flex items-start justify-between mb-4 sm:mb-6">
                <div>
                  <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-2 sm:px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide mb-2 sm:mb-3">
                    <span>In Progress</span>
                    {data.assessmentTrend === "up" && (
                      <TrendingUp className="w-3 h-3" />
                    )}
                    {data.assessmentTrend === "down" && (
                      <TrendingDown className="w-3 h-3" />
                    )}
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

              {/* Stats Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 mb-4 sm:mb-6">
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
                    Skill Tests
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 border border-white/20">
                  <div className="text-xl sm:text-2xl md:text-3xl font-bold mb-1">
                    {data.totalInterviews}
                  </div>
                  <div className="text-blue-100 text-xs sm:text-sm">
                    AI Interviews
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
                    {data.mockInterviewsCompleted + data.totalInterviews}{" "}
                    assessments completed
                  </span>
                  <span className="font-semibold text-white">
                    {100 - data.overallProgress}% to go
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {data.recentInterviews && data.recentInterviews.length > 0 && (
          <div className="mb-8 sm:mb-12">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                Recent AI Interviews
              </h2>
              <Link
                href="/mock-interview"
                className="text-purple-600 hover:text-purple-700 font-semibold text-xs sm:text-sm flex items-center space-x-1"
              >
                <span>Start New</span>
                <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {data.recentInterviews.slice(0, 4).map((interview: any) => (
                <div
                  key={interview._id.toString()}
                  className="bg-white rounded-xl p-5 sm:p-6 shadow-lg border-2 border-slate-200 hover:border-purple-400 transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="bg-purple-100 rounded-lg p-2 sm:p-3">
                        <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-base sm:text-lg capitalize">
                          {interview.type} Interview
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-500">
                          {new Date(interview.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div
                      className={`px-3 py-1 rounded-full font-bold text-sm ${
                        interview.scores?.overall >= 70
                          ? "bg-green-100 text-green-700"
                          : interview.scores?.overall >= 50
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                      }`}
                    >
                      {interview.scores?.overall || 0}%
                    </div>
                  </div>

                  {/* Score Breakdown */}
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="text-center">
                      <div className="text-lg sm:text-xl font-bold text-slate-900">
                        {Math.round(interview.scores?.communication || 0)}
                      </div>
                      <div className="text-xs text-slate-600">
                        Communication
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg sm:text-xl font-bold text-slate-900">
                        {Math.round(interview.scores?.technical || 0)}
                      </div>
                      <div className="text-xs text-slate-600">Technical</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg sm:text-xl font-bold text-slate-900">
                        {Math.round(interview.scores?.problemSolving || 0)}
                      </div>
                      <div className="text-xs text-slate-600">
                        Problem Solving
                      </div>
                    </div>
                  </div>

                  {/* Strengths & Improvements */}
                  {interview.feedback && (
                    <div className="space-y-2 mb-4">
                      {interview.feedback.strengths?.length > 0 && (
                        <div className="flex items-start space-x-2">
                          <div className="bg-green-100 rounded p-1 shrink-0 mt-0.5">
                            <svg
                              className="w-3 h-3 text-green-600"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                          <p className="text-sm text-slate-700 line-clamp-1">
                            {interview.feedback.strengths[0]}
                          </p>
                        </div>
                      )}
                      {interview.feedback.improvements?.length > 0 && (
                        <div className="flex items-start space-x-2">
                          <div className="bg-orange-100 rounded p-1 shrink-0 mt-0.5">
                            <AlertTriangle className="w-3 h-3 text-orange-600" />
                          </div>
                          <p className="text-sm text-slate-700 line-clamp-1">
                            {interview.feedback.improvements[0]}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Questions Count */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                    <span className="text-sm text-slate-600">
                      {interview.feedbackDetails?.length || 0} questions
                      answered
                    </span>
                    <Link
                      href={`/mock-interview/feedback?id=${interview._id}`}
                      className="text-purple-600 hover:text-purple-700 font-semibold text-sm flex items-center space-x-1"
                    >
                      <span>View Details</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Top Skill Gaps Section */}
        {data.topSkillGaps.length > 0 && (
          <div className="mb-8 sm:mb-12">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                Skills to Improve
              </h2>
              <Link
                href={ROUTES.SKILL}
                className="text-orange-600 hover:text-orange-700 font-semibold text-xs sm:text-sm flex items-center space-x-1"
              >
                <span>Take Assessment</span>
                <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.topSkillGaps.slice(0, 6).map((gap: SkillGap) => (
                <div
                  key={gap.skill}
                  className="bg-white rounded-xl p-5 shadow-lg border-2 border-slate-200 hover:border-orange-400 transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-bold text-slate-900 text-base line-clamp-1">
                      {gap.skill}
                    </h3>
                    <AlertTriangle className="w-5 h-5 text-orange-500 shrink-0" />
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">Accuracy</span>
                      <span
                        className={`font-semibold ${
                          gap.accuracy >= 80
                            ? "text-green-600"
                            : gap.accuracy >= 60
                              ? "text-yellow-600"
                              : "text-red-600"
                        }`}
                      >
                        {gap.accuracy}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">Gap</span>
                      <span className="font-semibold text-orange-600">
                        {gap.gap}%
                      </span>
                    </div>
                  </div>

                  <div className="bg-slate-100 rounded-full h-2">
                    <div
                      className={`rounded-full h-2 ${
                        gap.accuracy >= 80
                          ? "bg-green-500"
                          : gap.accuracy >= 60
                            ? "bg-yellow-500"
                            : "bg-red-500"
                      }`}
                      style={{ width: `${gap.accuracy}%` }}
                    ></div>
                  </div>

                  <p className="text-xs text-slate-500 mt-3">
                    {gap.correctAnswers}/{gap.questionsAnswered} correct
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommendations Section */}
        {data.topRecommendations.length > 0 && (
          <div className="mb-8 sm:mb-12">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4 sm:mb-6">
              Recommended for You
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {data.topRecommendations.map(
                (rec: Recommendation, idx: number) => (
                  <a
                    key={idx}
                    href={rec.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group bg-white rounded-xl p-5 shadow-lg border-2 border-slate-200 hover:border-blue-400 transition-all"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="bg-blue-100 rounded-lg p-2">
                        <BookOpen className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold">
                        {rec.skill}
                      </div>
                    </div>

                    <h3 className="font-bold text-slate-900 text-base mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {rec.title}
                    </h3>

                    <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                      {rec.description}
                    </p>

                    <div className="flex items-center text-blue-600 text-sm font-semibold">
                      <span>Learn More</span>
                      <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </a>
                )
              )}
            </div>
          </div>
        )}

        {/* Joined Classes Section */}
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

        {/* Pending Class Assessments Alert */}
        {data.pendingClassAssessments > 0 && (
          <div className="mb-8 sm:mb-12">
            <div className="bg-linear-to-r from-orange-500 to-orange-600 rounded-xl p-5 sm:p-6 text-white shadow-lg">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center space-x-3 sm:space-x-4">
                  <div className="bg-white/20 rounded-lg p-2 sm:p-3 shrink-0">
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

        {/* Learning Path */}
        <div className="mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4 sm:mb-6">
            Your Learning Path
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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
                    {data.recentSkillAssessments.length} assessments taken
                  </span>
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-2 transition-all" />
                </div>
              </div>
            </Link>

            <Link
              href="/mock-interview"
              className="group bg-white rounded-xl sm:rounded-2xl p-6 sm:p-8 border-2 border-slate-200 hover:border-purple-400 shadow-sm hover:shadow-xl transition-all duration-300 text-left relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-purple-50 rounded-full -mr-12 sm:-mr-16 -mt-12 sm:-mt-16 group-hover:scale-150 transition-transform duration-500"></div>
              <div className="relative">
                <div className="bg-purple-100 w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center mb-3 sm:mb-4 group-hover:bg-purple-500 transition-colors">
                  <GraduationCap className="w-6 h-6 sm:w-7 sm:h-7 text-purple-600 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">
                  AI Interview
                </h3>
                <p className="text-sm sm:text-base text-slate-600 mb-3 sm:mb-4">
                  Practice with AI-powered mock interviews
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm font-semibold text-purple-600">
                    {data.totalInterviews} interviews completed
                  </span>
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 group-hover:text-purple-600 group-hover:translate-x-2 transition-all" />
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

        {/* Recent Skill Assessments */}
        {data.recentSkillAssessments.length > 0 && (
          <div className="bg-linear-to-r from-slate-800 via-slate-900 to-slate-800 rounded-xl sm:rounded-2xl p-6 sm:p-10 relative overflow-hidden">
            <div className="absolute inset-0 bg-linear-to-r from-blue-500/10 via-purple-500/10 to-rose-500/10"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h3 className="text-xl sm:text-2xl font-bold text-white">
                  Recent Skill Assessments
                </h3>
                <Link
                  href="/skill-assessment/history"
                  className="text-blue-400 hover:text-blue-300 font-semibold text-sm flex items-center space-x-1"
                >
                  <span>View All</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="space-y-2 sm:space-y-3">
                {data.recentSkillAssessments
                  .slice(0, 3)
                  .map((assessment: any) => (
                    <Link
                      key={assessment._id}
                      href={`/skill-assessment/result?id=${assessment._id}`}
                      className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all"
                    >
                      <div className="flex items-center space-x-3 sm:space-x-4 flex-1">
                        <div className="bg-blue-500/20 rounded-lg p-2 shrink-0">
                          <Target className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-semibold text-sm sm:text-base truncate">
                            {assessment.jobRole || "Skill Assessment"}
                          </p>
                          <p className="text-slate-400 text-xs sm:text-sm">
                            {assessment.difficulty} •{" "}
                            {assessment.totalQuestions} questions •{" "}
                            {new Date(
                              assessment.completedAt
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div
                          className={`px-3 sm:px-4 py-2 rounded-lg font-semibold text-sm ${
                            assessment.overallScore >= 80
                              ? "bg-green-500/20 text-green-400"
                              : assessment.overallScore >= 60
                                ? "bg-yellow-500/20 text-yellow-400"
                                : "bg-red-500/20 text-red-400"
                          }`}
                        >
                          {assessment.overallScore}%
                        </div>
                        <ArrowRight className="w-5 h-5 text-slate-400" />
                      </div>
                    </Link>
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

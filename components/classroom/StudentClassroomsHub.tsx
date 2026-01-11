"use client";

import { useEffect, useState } from "react";
import {
  GraduationCap,
  Plus,
  BookOpen,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Award,
  Calendar,
  ArrowRight,
  Users,
  FileText,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { api } from "@/lib/api";
import JoinClassroomModal from "@/components/classroom/JoinClassroomModal";

interface Classroom {
  _id: string;
  name: string;
  description?: string;
  subject?: string;
  code: string;
  teacher: {
    name: string;
    email: string;
    image?: string;
  };
  enrolledAt: string;
  totalAssessments: number;
  completedAssessments: number;
  pendingAssessments: number;
  averageScore: number;
  studentCount: number;
}

interface Assessment {
  _id: string;
  title: string;
  description?: string;
  classroom: {
    _id: string;
    name: string;
    code: string;
  };
  totalQuestions: number;
  difficulty: string;
  dueDate?: string;
  isPastDue: boolean;
  status: string;
  score?: number;
  submittedAt?: string;
}

const StudentClassroomsHub = () => {
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showJoinModal, setShowJoinModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      const [classroomsRes, assessmentsRes] = await Promise.all([
        api.student.getClassrooms(),
        api.student.getAssessments(),
      ]);

      if (classroomsRes.success) {
        setClassrooms((classroomsRes.data as Classroom[]) || []);
      }

      if (assessmentsRes.success) {
        setAssessments((assessmentsRes.data as Assessment[]) || []);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load classrooms");
    } finally {
      setLoading(false);
    }
  };

  const pendingAssessments = assessments.filter(
    (a) => a.status === "not_started" && !a.isPastDue
  );

  const completedAssessments = assessments.filter(
    (a) => a.status === "graded" || a.status === "submitted"
  );

  const overallAverage =
    completedAssessments.length > 0
      ? completedAssessments.reduce((sum, a) => sum + (a.score || 0), 0) /
        completedAssessments.length
      : 0;

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-700 border-green-300";
      case "medium":
        return "bg-yellow-100 text-yellow-700 border-yellow-300";
      case "hard":
        return "bg-red-100 text-red-700 border-red-300";
      default:
        return "bg-gray-100 text-gray-700 border-gray-300";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50 pt-20">
        <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <div className="flex items-center justify-center min-h-[60vh]">
            <Loader2 className="w-12 h-12 animate-spin text-indigo-600" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50 pt-20">
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-12 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-1 sm:mb-2">
              My Classrooms
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              Manage your classes and complete assignments
            </p>
          </div>
          <Button
            onClick={() => setShowJoinModal(true)}
            size="lg"
            className="bg-indigo-600 hover:bg-indigo-700 w-full sm:w-auto shadow-lg"
          >
            <Plus className="mr-2 h-5 w-5" />
            Join Classroom
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <Card className="bg-linear-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-2">
                <GraduationCap className="h-5 w-5 sm:h-6 sm:w-6 opacity-80" />
              </div>
              <p className="text-2xl sm:text-3xl font-bold mb-1">
                {classrooms.length}
              </p>
              <p className="text-xs sm:text-sm opacity-90">Active Classes</p>
            </CardContent>
          </Card>

          <Card className="bg-linear-to-br from-yellow-500 to-yellow-600 text-white border-0 shadow-lg">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-2">
                <Clock className="h-5 w-5 sm:h-6 sm:w-6 opacity-80" />
              </div>
              <p className="text-2xl sm:text-3xl font-bold mb-1">
                {pendingAssessments.length}
              </p>
              <p className="text-xs sm:text-sm opacity-90">Pending</p>
            </CardContent>
          </Card>

          <Card className="bg-linear-to-br from-green-500 to-green-600 text-white border-0 shadow-lg">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-2">
                <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 opacity-80" />
              </div>
              <p className="text-2xl sm:text-3xl font-bold mb-1">
                {completedAssessments.length}
              </p>
              <p className="text-xs sm:text-sm opacity-90">Completed</p>
            </CardContent>
          </Card>

          <Card className="bg-linear-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 opacity-80" />
              </div>
              <p className="text-2xl sm:text-3xl font-bold mb-1">
                {overallAverage.toFixed(0)}%
              </p>
              <p className="text-xs sm:text-sm opacity-90">Avg Score</p>
            </CardContent>
          </Card>
        </div>

        {/* Empty State */}
        {classrooms.length === 0 ? (
          <Card className="border-dashed border-2">
            <CardContent className="flex flex-col items-center justify-center py-12 sm:py-16 px-4">
              <div className="bg-indigo-100 rounded-full p-6 mb-6">
                <GraduationCap className="h-12 w-12 sm:h-16 sm:w-16 text-indigo-600" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 text-center">
                No Classrooms Yet
              </h3>
              <p className="text-sm sm:text-base text-gray-600 mb-6 text-center max-w-md">
                Join your first classroom using the code provided by your
                teacher
              </p>
              <Button
                onClick={() => setShowJoinModal(true)}
                size="lg"
                className="bg-indigo-600 hover:bg-indigo-700 w-full sm:w-auto"
              >
                <Plus className="mr-2 h-5 w-5" />
                Join Your First Classroom
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Left Column - Classrooms */}
            <div className="lg:col-span-2 space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    Your Classrooms
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    {classrooms.length} active{" "}
                    {classrooms.length === 1 ? "class" : "classes"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-3 sm:p-6">
                  <div className="space-y-3 sm:space-y-4">
                    {classrooms.map((classroom) => (
                      <Link
                        key={classroom._id}
                        href={`/classroom/${classroom._id}`}
                        className="block group"
                      >
                        <Card className="hover:shadow-lg transition-all cursor-pointer border-l-4 border-l-indigo-500 hover:border-l-indigo-600">
                          <CardContent className="p-4 sm:p-6">
                            {/* Header Section */}
                            <div className="flex items-start gap-3 mb-4">
                              <div className="bg-indigo-100 rounded-lg p-2 sm:p-3 shrink-0">
                                <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2 mb-1">
                                  <h3 className="font-bold text-base sm:text-lg text-gray-900">
                                    {classroom.name}
                                  </h3>
                                  <Badge
                                    variant="outline"
                                    className="bg-indigo-50 text-indigo-700 border-indigo-200 font-mono text-xs shrink-0"
                                  >
                                    {classroom.code}
                                  </Badge>
                                </div>
                                <p className="text-xs sm:text-sm text-gray-600 mb-2">
                                  {classroom.teacher.name}
                                </p>
                                {classroom.subject && (
                                  <Badge
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    {classroom.subject}
                                  </Badge>
                                )}
                              </div>
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-4">
                              <div className="bg-orange-50 rounded-lg p-2 sm:p-3 border border-orange-100">
                                <div className="flex items-center gap-2 mb-1">
                                  <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-orange-600" />
                                  <p className="text-xs text-gray-600">
                                    Pending
                                  </p>
                                </div>
                                <p className="text-lg sm:text-xl font-bold text-orange-600">
                                  {classroom.pendingAssessments}
                                </p>
                              </div>
                              <div className="bg-green-50 rounded-lg p-2 sm:p-3 border border-green-100">
                                <div className="flex items-center gap-2 mb-1">
                                  <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                                  <p className="text-xs text-gray-600">Done</p>
                                </div>
                                <p className="text-lg sm:text-xl font-bold text-green-600">
                                  {classroom.completedAssessments}
                                </p>
                              </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="space-y-2 mb-4">
                              <div className="flex justify-between items-center text-xs sm:text-sm text-gray-600">
                                <span className="font-medium">Progress</span>
                                <span className="font-semibold">
                                  {classroom.completedAssessments}/
                                  {classroom.totalAssessments} completed
                                </span>
                              </div>
                              <Progress
                                value={
                                  classroom.totalAssessments > 0
                                    ? (classroom.completedAssessments /
                                        classroom.totalAssessments) *
                                      100
                                    : 0
                                }
                                className="h-2"
                              />
                            </div>

                            {/* Footer */}
                            <div className="flex items-center justify-between pt-3 border-t">
                              <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs text-gray-500">
                                <div className="flex items-center gap-1">
                                  <Users className="w-3 h-3" />
                                  <span className="hidden sm:inline">
                                    {classroom.studentCount} students
                                  </span>
                                  <span className="sm:hidden">
                                    {classroom.studentCount}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  <span className="hidden sm:inline">
                                    {new Date(
                                      classroom.enrolledAt
                                    ).toLocaleDateString("en-US", {
                                      month: "short",
                                      day: "numeric",
                                    })}
                                  </span>
                                  <span className="sm:hidden">
                                    {new Date(
                                      classroom.enrolledAt
                                    ).toLocaleDateString("en-US", {
                                      month: "numeric",
                                      day: "numeric",
                                    })}
                                  </span>
                                </div>
                                {classroom.averageScore > 0 && (
                                  <div className="flex items-center gap-1">
                                    <Award className="w-3 h-3" />
                                    <span>
                                      {classroom.averageScore.toFixed(0)}%
                                    </span>
                                  </div>
                                )}
                              </div>
                              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Pending & Recent */}
            <div className="space-y-4">
              {/* Pending Assessments */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600" />
                    Pending
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    {pendingAssessments.length} due
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-3 sm:p-6">
                  {pendingAssessments.length === 0 ? (
                    <div className="text-center py-6 sm:py-8">
                      <CheckCircle className="h-10 w-10 sm:h-12 sm:w-12 text-green-500 mx-auto mb-2 sm:mb-3" />
                      <p className="text-sm text-gray-600 font-medium">
                        All caught up!
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        No pending assessments
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2 sm:space-y-3">
                      {pendingAssessments.slice(0, 5).map((assessment) => (
                        <Link
                          key={assessment._id}
                          href={`/classroom/assessment/${assessment._id}`}
                          className="block group"
                        >
                          <Card className="hover:shadow-md transition-shadow cursor-pointer border border-gray-200 hover:border-indigo-300">
                            <CardContent className="p-3">
                              <div className="flex items-start gap-2 mb-2">
                                <FileText className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-semibold text-sm text-gray-900 mb-1 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                                    {assessment.title}
                                  </h4>
                                  <p className="text-xs text-gray-600 truncate">
                                    {assessment.classroom.name}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center justify-between gap-2">
                                <Badge
                                  variant="outline"
                                  className={`text-xs ${getDifficultyColor(assessment.difficulty)}`}
                                >
                                  {assessment.difficulty}
                                </Badge>
                                {assessment.dueDate && (
                                  <div className="flex items-center gap-1 text-xs text-yellow-700">
                                    <Calendar className="h-3 w-3" />
                                    <span className="hidden sm:inline">
                                      {new Date(
                                        assessment.dueDate
                                      ).toLocaleDateString("en-US", {
                                        month: "short",
                                        day: "numeric",
                                      })}
                                    </span>
                                    <span className="sm:hidden">
                                      {new Date(
                                        assessment.dueDate
                                      ).toLocaleDateString("en-US", {
                                        month: "numeric",
                                        day: "numeric",
                                      })}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        </Link>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recent Submissions */}
              {completedAssessments.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                      <Award className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
                      Recent Results
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 sm:p-6">
                    <div className="space-y-2 sm:space-y-3">
                      {completedAssessments.slice(0, 3).map((assessment) => (
                        <Link
                          key={assessment._id}
                          href={`/classroom/assessment/${assessment._id}/result`}
                          className="block group"
                        >
                          <Card className="hover:shadow-md transition-shadow cursor-pointer border border-gray-200 hover:border-purple-300">
                            <CardContent className="p-3">
                              <div className="flex items-center justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-medium text-sm line-clamp-1 group-hover:text-purple-600 transition-colors">
                                    {assessment.title}
                                  </h4>
                                  <p className="text-xs text-gray-600 truncate mt-0.5">
                                    {assessment.classroom.name}
                                  </p>
                                </div>
                                <div className="text-right shrink-0">
                                  <p
                                    className={`text-xl sm:text-2xl font-bold ${
                                      (assessment.score || 0) >= 80
                                        ? "text-green-600"
                                        : (assessment.score || 0) >= 60
                                          ? "text-yellow-600"
                                          : "text-red-600"
                                    }`}
                                  >
                                    {assessment.score?.toFixed(0) || "--"}
                                    <span className="text-sm">%</span>
                                  </p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </Link>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Join Classroom Modal */}
      <JoinClassroomModal
        isOpen={showJoinModal}
        onClose={() => setShowJoinModal(false)}
        onSuccess={fetchData}
      />
    </div>
  );
};

export default StudentClassroomsHub;

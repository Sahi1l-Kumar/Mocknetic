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
        return "bg-green-100 text-green-700";
      case "medium":
        return "bg-yellow-100 text-yellow-700";
      case "hard":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50 pt-20">
        <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <div className="animate-pulse space-y-6">
            <div className="h-12 bg-slate-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 bg-slate-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50 pt-20">
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
              My Classrooms
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              Manage your classes and complete assignments
            </p>
          </div>
          <Button
            onClick={() => setShowJoinModal(true)}
            size="lg"
            className="bg-indigo-600 hover:bg-indigo-700 w-full sm:w-auto"
          >
            <Plus className="mr-2 h-5 w-5" />
            Join Classroom
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
          <Card className="bg-linear-to-br from-blue-500 to-blue-600 text-white border-0">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-2">
                <GraduationCap className="h-5 w-5 sm:h-6 sm:w-6 opacity-80" />
              </div>
              <p className="text-2xl sm:text-3xl font-bold">
                {classrooms.length}
              </p>
              <p className="text-xs sm:text-sm opacity-90">Active Classes</p>
            </CardContent>
          </Card>

          <Card className="bg-linear-to-br from-yellow-500 to-yellow-600 text-white border-0">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-2">
                <Clock className="h-5 w-5 sm:h-6 sm:w-6 opacity-80" />
              </div>
              <p className="text-2xl sm:text-3xl font-bold">
                {pendingAssessments.length}
              </p>
              <p className="text-xs sm:text-sm opacity-90">Pending</p>
            </CardContent>
          </Card>

          <Card className="bg-linear-to-br from-green-500 to-green-600 text-white border-0">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-2">
                <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 opacity-80" />
              </div>
              <p className="text-2xl sm:text-3xl font-bold">
                {completedAssessments.length}
              </p>
              <p className="text-xs sm:text-sm opacity-90">Completed</p>
            </CardContent>
          </Card>

          <Card className="bg-linear-to-br from-purple-500 to-purple-600 text-white border-0">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 opacity-80" />
              </div>
              <p className="text-2xl sm:text-3xl font-bold">
                {overallAverage.toFixed(0)}%
              </p>
              <p className="text-xs sm:text-sm opacity-90">Avg Score</p>
            </CardContent>
          </Card>
        </div>

        {/* Empty State */}
        {classrooms.length === 0 ? (
          <Card className="border-dashed border-2">
            <CardContent className="flex flex-col items-center justify-center py-12 sm:py-16">
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
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                <Plus className="mr-2 h-5 w-5" />
                Join Your First Classroom
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Classrooms */}
            <div className="lg:col-span-2 space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg sm:text-xl">
                    Your Classrooms
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    {classrooms.length} active{" "}
                    {classrooms.length === 1 ? "class" : "classes"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {classrooms.map((classroom) => (
                      <Link
                        key={classroom._id}
                        href={`/student/classroom/${classroom._id}`}
                        className="block"
                      >
                        <Card className="hover:shadow-lg transition-all cursor-pointer border-l-4 border-l-indigo-500 hover:border-l-indigo-600">
                          <CardContent className="p-4 sm:p-6">
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start gap-3 mb-3">
                                  <div className="bg-indigo-100 rounded-lg p-2 sm:p-3 shrink-0">
                                    <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2 mb-1">
                                      <h3 className="font-bold text-base sm:text-lg text-gray-900 truncate">
                                        {classroom.name}
                                      </h3>
                                      <Badge
                                        variant="outline"
                                        className="bg-indigo-100 text-indigo-700 font-mono text-xs shrink-0"
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

                                <div className="grid grid-cols-2 gap-3 mt-4">
                                  <div className="bg-orange-50 rounded-lg p-3">
                                    <p className="text-xs text-gray-600 mb-1">
                                      Pending
                                    </p>
                                    <p className="text-xl font-bold text-orange-600">
                                      {classroom.pendingAssessments}
                                    </p>
                                  </div>
                                  <div className="bg-green-50 rounded-lg p-3">
                                    <p className="text-xs text-gray-600 mb-1">
                                      Completed
                                    </p>
                                    <p className="text-xl font-bold text-green-600">
                                      {classroom.completedAssessments}
                                    </p>
                                  </div>
                                </div>

                                <div className="mt-4 space-y-2">
                                  <div className="flex justify-between text-xs text-gray-600">
                                    <span>Progress</span>
                                    <span>
                                      {classroom.completedAssessments}/
                                      {classroom.totalAssessments}
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

                                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                                  <div className="flex items-center gap-4 text-xs text-gray-500">
                                    <div className="flex items-center gap-1">
                                      <Users className="w-3 h-3" />
                                      <span>
                                        {classroom.studentCount} students
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Clock className="w-3 h-3" />
                                      <span>
                                        {new Date(
                                          classroom.enrolledAt
                                        ).toLocaleDateString()}
                                      </span>
                                    </div>
                                  </div>
                                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Pending Assessments */}
            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-yellow-600" />
                    Pending Assessments
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    {pendingAssessments.length} assessment
                    {pendingAssessments.length !== 1 ? "s" : ""} due
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {pendingAssessments.length === 0 ? (
                    <div className="text-center py-8">
                      <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                      <p className="text-sm text-gray-600">All caught up!</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {pendingAssessments.slice(0, 5).map((assessment) => (
                        <Link
                          key={assessment._id}
                          href={`/student/assessment/${assessment._id}`}
                          className="block"
                        >
                          <Card className="hover:shadow-md transition-shadow cursor-pointer">
                            <CardContent className="p-3">
                              <h4 className="font-semibold text-sm text-gray-900 mb-1 truncate">
                                {assessment.title}
                              </h4>
                              <p className="text-xs text-gray-600 mb-2 truncate">
                                {assessment.classroom.name}
                              </p>
                              <div className="flex items-center justify-between">
                                <Badge
                                  variant="outline"
                                  className={`text-xs ${getDifficultyColor(assessment.difficulty)}`}
                                >
                                  {assessment.difficulty}
                                </Badge>
                                {assessment.dueDate && (
                                  <div className="flex items-center gap-1 text-xs text-yellow-700">
                                    <Calendar className="h-3 w-3" />
                                    {new Date(
                                      assessment.dueDate
                                    ).toLocaleDateString()}
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
                    <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                      <Award className="h-5 w-5 text-purple-600" />
                      Recent Results
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {completedAssessments.slice(0, 3).map((assessment) => (
                        <Link
                          key={assessment._id}
                          href={`/student/assessment/${assessment._id}/result`}
                          className="block"
                        >
                          <Card className="hover:shadow-md transition-shadow cursor-pointer">
                            <CardContent className="p-3">
                              <div className="flex items-center justify-between">
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-medium text-sm truncate">
                                    {assessment.title}
                                  </h4>
                                  <p className="text-xs text-gray-600 truncate">
                                    {assessment.classroom.name}
                                  </p>
                                </div>
                                <div className="text-right shrink-0 ml-2">
                                  <p
                                    className={`text-lg font-bold ${
                                      (assessment.score || 0) >= 80
                                        ? "text-green-600"
                                        : (assessment.score || 0) >= 60
                                          ? "text-yellow-600"
                                          : "text-red-600"
                                    }`}
                                  >
                                    {assessment.score?.toFixed(0) || "--"}%
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

"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  Award,
  Users,
  PlayCircle,
  FileText,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/lib/api";

interface ClassroomDetailProps {
  classroomId: string;
}

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
  studentCount: number;
  totalAssessments: number;
  completedAssessments: number;
  pendingAssessments: number;
  averageScore: number;
}

interface Assessment {
  _id: string;
  title: string;
  description?: string;
  totalQuestions: number;
  difficulty: string;
  curriculum?: string;
  dueDate?: string;
  isPastDue: boolean;
  status: string;
  score?: number;
  submittedAt?: string;
  publishedAt?: string;
  skills?: string[];
}

const ClassroomDetail = ({ classroomId }: ClassroomDetailProps) => {
  const router = useRouter();
  const [classroom, setClassroom] = useState<Classroom | null>(null);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!classroomId || classroomId === "undefined") {
      toast.error("Invalid classroom ID");
      router.push("/classroom");
    }
  }, [classroomId, router]);

  const fetchClassroomData = useCallback(async () => {
    if (!classroomId || classroomId === "undefined") {
      return;
    }

    try {
      setLoading(true);

      const [classroomRes, assessmentsRes] = await Promise.all([
        api.student.getClassroom(classroomId),
        api.student.getAssessments(classroomId),
      ]);

      if (classroomRes.success) {
        setClassroom(classroomRes.data as Classroom);
      } else {
        toast.error("Classroom not found");
        router.push("/classroom");
        return;
      }

      if (assessmentsRes.success) {
        setAssessments((assessmentsRes.data as Assessment[]) || []);
      }
    } catch (error) {
      console.error("Error fetching classroom:", error);
      toast.error("Failed to load classroom");
    } finally {
      setLoading(false);
    }
  }, [classroomId, router]);

  useEffect(() => {
    fetchClassroomData();
  }, [fetchClassroomData]);

  const pendingAssessments = assessments.filter(
    (a) => a.status === "not_started" && !a.isPastDue
  );
  const completedAssessments = assessments.filter(
    (a) => a.status === "graded" || a.status === "submitted"
  );
  const missedAssessments = assessments.filter(
    (a) => a.status === "not_started" && a.isPastDue
  );

  const averageScore =
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

  const getStatusBadge = (assessment: Assessment) => {
    if (assessment.status === "graded") {
      return (
        <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
          <CheckCircle className="w-3 h-3 mr-1" />
          Graded
        </Badge>
      );
    }
    if (assessment.status === "submitted") {
      return (
        <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
          <Clock className="w-3 h-3 mr-1" />
          Pending Review
        </Badge>
      );
    }
    if (assessment.isPastDue) {
      return (
        <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
          <AlertCircle className="w-3 h-3 mr-1" />
          Missed
        </Badge>
      );
    }
    return (
      <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">
        <PlayCircle className="w-3 h-3 mr-1" />
        Available
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50 pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-slate-200 rounded w-1/4"></div>
            <div className="h-48 bg-slate-200 rounded-2xl"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-64 bg-slate-200 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!classroom) {
    return null;
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50 pt-20">
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Back Button */}
        <Link href="/classroom">
          <Button variant="ghost" size="sm" className="mb-4 sm:mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Classrooms
          </Button>
        </Link>

        {/* Classroom Header */}
        <Card className="mb-6 sm:mb-8 bg-linear-to-br from-indigo-500 to-indigo-600 text-white border-0 overflow-hidden">
          <CardContent className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
              <div className="flex items-start gap-4 flex-1 min-w-0">
                <div className="bg-white/20 rounded-xl p-3 sm:p-4 backdrop-blur-sm shrink-0">
                  <BookOpen className="w-6 h-6 sm:w-8 sm:h-8" />
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl sm:text-3xl font-bold mb-2 wrap-break-word">
                    {classroom.name}
                  </h1>
                  <p className="text-indigo-100 text-sm sm:text-base mb-3">
                    {classroom.teacher.name}
                  </p>
                  {classroom.subject && (
                    <Badge className="bg-white/20 text-white border-white/30 mb-3 hover:bg-white/30">
                      {classroom.subject}
                    </Badge>
                  )}
                  {classroom.description && (
                    <p className="text-indigo-100 text-sm max-w-2xl mt-3">
                      {classroom.description}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-2 shrink-0">
                <Badge className="bg-white/20 text-white border-white/30 text-center text-sm font-mono hover:bg-white/30">
                  Code: {classroom.code}
                </Badge>
                <div className="flex items-center gap-2 text-indigo-100 text-sm">
                  <Users className="w-4 h-4" />
                  <span>{classroom.studentCount} students</span>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/20">
                <div className="text-2xl sm:text-3xl font-bold mb-1">
                  {assessments.length}
                </div>
                <div className="text-indigo-100 text-xs sm:text-sm">
                  Total Tests
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/20">
                <div className="text-2xl sm:text-3xl font-bold mb-1">
                  {pendingAssessments.length}
                </div>
                <div className="text-indigo-100 text-xs sm:text-sm">
                  Pending
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/20">
                <div className="text-2xl sm:text-3xl font-bold mb-1">
                  {completedAssessments.length}
                </div>
                <div className="text-indigo-100 text-xs sm:text-sm">
                  Completed
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/20">
                <div className="text-2xl sm:text-3xl font-bold mb-1">
                  {averageScore.toFixed(0)}%
                </div>
                <div className="text-indigo-100 text-xs sm:text-sm">
                  Avg Score
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Assessments Tabs */}
        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto">
            <TabsTrigger value="pending" className="text-xs sm:text-sm">
              Pending ({pendingAssessments.length})
            </TabsTrigger>
            <TabsTrigger value="completed" className="text-xs sm:text-sm">
              Completed ({completedAssessments.length})
            </TabsTrigger>
            <TabsTrigger value="all" className="text-xs sm:text-sm">
              All ({assessments.length})
            </TabsTrigger>
          </TabsList>

          {/* Pending Assessments */}
          <TabsContent value="pending" className="space-y-4">
            {pendingAssessments.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12 sm:py-16">
                  <CheckCircle className="w-12 h-12 sm:w-16 sm:h-16 text-green-500 mb-4" />
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                    All Caught Up!
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 text-center">
                    No pending assessments. Great job!
                  </p>
                </CardContent>
              </Card>
            ) : (
              pendingAssessments.map((assessment) => (
                <AssessmentCard
                  key={assessment._id}
                  assessment={assessment}
                  getDifficultyColor={getDifficultyColor}
                  getStatusBadge={getStatusBadge}
                />
              ))
            )}
          </TabsContent>

          {/* Completed Assessments */}
          <TabsContent value="completed" className="space-y-4">
            {completedAssessments.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12 sm:py-16">
                  <Award className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mb-4" />
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                    No Submissions Yet
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 text-center">
                    Complete your first assessment to see results here
                  </p>
                </CardContent>
              </Card>
            ) : (
              completedAssessments.map((assessment) => (
                <AssessmentCard
                  key={assessment._id}
                  assessment={assessment}
                  getDifficultyColor={getDifficultyColor}
                  getStatusBadge={getStatusBadge}
                  isCompleted
                />
              ))
            )}
          </TabsContent>

          {/* All Assessments */}
          <TabsContent value="all" className="space-y-4">
            {assessments.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12 sm:py-16">
                  <FileText className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mb-4" />
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                    No Assessments Yet
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 text-center">
                    Your teacher hasn't published any assessments yet
                  </p>
                </CardContent>
              </Card>
            ) : (
              assessments.map((assessment) => (
                <AssessmentCard
                  key={assessment._id}
                  assessment={assessment}
                  getDifficultyColor={getDifficultyColor}
                  getStatusBadge={getStatusBadge}
                  isCompleted={
                    assessment.status === "graded" ||
                    assessment.status === "submitted"
                  }
                />
              ))
            )}
          </TabsContent>
        </Tabs>

        {/* Missed Assessments Warning */}
        {missedAssessments.length > 0 && (
          <Card className="mt-6 border-red-300 bg-red-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2 text-red-900">
                <AlertCircle className="w-5 h-5" />
                Missed Assessments
              </CardTitle>
              <CardDescription className="text-red-700">
                You missed {missedAssessments.length} assessment
                {missedAssessments.length !== 1 ? "s" : ""}. Contact your
                teacher if you need an extension.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {missedAssessments.map((assessment) => (
                  <div
                    key={assessment._id}
                    className="flex items-center justify-between p-3 bg-white rounded-lg border border-red-200"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm truncate">
                        {assessment.title}
                      </p>
                      <p className="text-xs text-gray-600">
                        Due:{" "}
                        {assessment.dueDate &&
                          new Date(assessment.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge className="bg-red-100 text-red-700 hover:bg-red-100 shrink-0 ml-2">
                      Missed
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

// Assessment Card Component
interface AssessmentCardProps {
  assessment: Assessment;
  getDifficultyColor: (difficulty: string) => string;
  getStatusBadge: (assessment: Assessment) => React.ReactElement;
  isCompleted?: boolean;
}

const AssessmentCard = ({
  assessment,
  getDifficultyColor,
  getStatusBadge,
  isCompleted = false,
}: AssessmentCardProps) => {
  const href = isCompleted
    ? `/classroom/assessment/${assessment._id}/result`
    : `/classroom/assessment/${assessment._id}`;

  return (
    <Link href={href}>
      <Card className="hover:shadow-lg transition-all cursor-pointer border-l-4 border-l-indigo-500 hover:border-l-indigo-600">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                {getStatusBadge(assessment)}
                <Badge
                  variant="outline"
                  className={getDifficultyColor(assessment.difficulty)}
                >
                  {assessment.difficulty}
                </Badge>
              </div>

              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                {assessment.title}
              </h3>

              {assessment.description && (
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {assessment.description}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <FileText className="w-4 h-4" />
                  <span>{assessment.totalQuestions} questions</span>
                </div>
                {assessment.curriculum && (
                  <div className="flex items-center gap-1">
                    <BookOpen className="w-4 h-4" />
                    <span className="truncate max-w-[150px]">
                      {assessment.curriculum}
                    </span>
                  </div>
                )}
                {assessment.dueDate && (
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>
                      Due: {new Date(assessment.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>

              {assessment.skills && assessment.skills.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {assessment.skills.slice(0, 3).map((skill, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                  {assessment.skills.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{assessment.skills.length - 3} more
                    </Badge>
                  )}
                </div>
              )}
            </div>

            <div className="flex sm:flex-col items-center sm:items-end gap-3">
              {isCompleted && assessment.score !== undefined ? (
                <div className="text-center sm:text-right">
                  <div
                    className={`text-3xl sm:text-4xl font-bold ${
                      assessment.score >= 80
                        ? "text-green-600"
                        : assessment.score >= 60
                          ? "text-yellow-600"
                          : "text-red-600"
                    }`}
                  >
                    {assessment.score.toFixed(0)}%
                  </div>
                  <p className="text-xs text-gray-500">
                    {assessment.submittedAt &&
                      new Date(assessment.submittedAt).toLocaleDateString()}
                  </p>
                </div>
              ) : (
                <Button className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700">
                  {assessment.isPastDue ? "View" : "Start Test"}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default ClassroomDetail;

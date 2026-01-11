"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
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
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/lib/api";
import ROUTES from "@/constants/routes";

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

const CARD_COLORS = [
  { header: "from-blue-600 to-blue-700" },
  { header: "from-emerald-600 to-emerald-700" },
  { header: "from-purple-600 to-purple-700" },
  { header: "from-rose-600 to-rose-700" },
  { header: "from-amber-600 to-amber-700" },
  { header: "from-indigo-600 to-indigo-700" },
];

const ClassroomDetail = ({ classroomId }: ClassroomDetailProps) => {
  const router = useRouter();
  const [classroom, setClassroom] = useState<Classroom | null>(null);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [colorScheme, setColorScheme] = useState(CARD_COLORS[0]);

  useEffect(() => {
    if (!classroomId || classroomId === "undefined") {
      toast.error("Invalid classroom ID");
      router.push(ROUTES.CLASSROOM);
    }
  }, [classroomId, router]);

  const fetchClassroomData = useCallback(async () => {
    if (!classroomId || classroomId === "undefined") {
      return;
    }

    try {
      setLoading(true);

      const [classroomRes, assessmentsRes, allClassroomsRes] =
        await Promise.all([
          api.student.getClassroom(classroomId),
          api.student.getAssessments(classroomId),
          api.student.getClassrooms(),
        ]);

      if (classroomRes.success) {
        setClassroom(classroomRes.data as Classroom);

        if (allClassroomsRes.success) {
          const allClassrooms = allClassroomsRes.data as Classroom[];
          const index = allClassrooms.findIndex((c) => c._id === classroomId);
          if (index !== -1) {
            setColorScheme(CARD_COLORS[index % CARD_COLORS.length]);
          }
        }
      } else {
        toast.error("Classroom not found");
        router.push(ROUTES.CLASSROOM);
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
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "medium":
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "hard":
        return "bg-rose-100 text-rose-700 border-rose-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const getStatusBadge = (assessment: Assessment) => {
    if (assessment.status === "graded") {
      return (
        <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-0">
          <CheckCircle className="w-3 h-3 mr-1" />
          Graded
        </Badge>
      );
    }
    if (assessment.status === "submitted") {
      return (
        <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-0">
          <Clock className="w-3 h-3 mr-1" />
          Pending Review
        </Badge>
      );
    }
    if (assessment.isPastDue) {
      return (
        <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-100 border-0">
          <AlertCircle className="w-3 h-3 mr-1" />
          Missed
        </Badge>
      );
    }
    return (
      <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-0">
        <PlayCircle className="w-3 h-3 mr-1" />
        Available
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-slate-200 rounded w-1/4"></div>
            <div className="h-48 bg-slate-200 rounded-lg"></div>
            <div className="grid grid-cols-1 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-slate-200 rounded-lg"></div>
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
    <div className="min-h-screen bg-white pt-5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Link href={ROUTES.CLASSROOM}>
          <Button variant="ghost" size="sm" className="mb-4 hover:bg-gray-100">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Classrooms
          </Button>
        </Link>

        <Card
          className={`mb-6 bg-linear-to-br ${colorScheme.header} text-white border-0 overflow-hidden`}
        >
          <CardContent className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
              <div className="flex-1">
                <h1 className="text-3xl sm:text-4xl font-bold mb-2">
                  {classroom.name}
                </h1>
                <p className="text-white/90 text-base mb-2">
                  {classroom.teacher.name}
                </p>
                {classroom.subject && (
                  <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30">
                    {classroom.subject}
                  </Badge>
                )}
                {classroom.description && (
                  <p className="text-white/80 text-sm mt-3 max-w-2xl">
                    {classroom.description}
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <Badge className="bg-white/20 text-white border-white/30 text-center font-mono hover:bg-white/30">
                  {classroom.code}
                </Badge>
                <div className="flex items-center gap-2 text-white/90 text-sm">
                  <Users className="w-4 h-4" />
                  <span>{classroom.studentCount} students</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <div className="text-3xl font-bold mb-1">
                  {assessments.length}
                </div>
                <div className="text-white/90 text-sm">Total</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <div className="text-3xl font-bold mb-1">
                  {pendingAssessments.length}
                </div>
                <div className="text-white/90 text-sm">Pending</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <div className="text-3xl font-bold mb-1">
                  {completedAssessments.length}
                </div>
                <div className="text-white/90 text-sm">Done</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <div className="text-3xl font-bold mb-1">
                  {averageScore.toFixed(0)}%
                </div>
                <div className="text-white/90 text-sm">Score</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto bg-gray-100">
            <TabsTrigger value="pending">
              Pending ({pendingAssessments.length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed ({completedAssessments.length})
            </TabsTrigger>
            <TabsTrigger value="all">All ({assessments.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            {pendingAssessments.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <CheckCircle className="w-16 h-16 text-emerald-500 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    All Caught Up!
                  </h3>
                  <p className="text-gray-600">
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

          <TabsContent value="completed" className="space-y-4">
            {completedAssessments.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <Award className="w-16 h-16 text-gray-400 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No Submissions Yet
                  </h3>
                  <p className="text-gray-600">
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

          <TabsContent value="all" className="space-y-4">
            {assessments.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <FileText className="w-16 h-16 text-gray-400 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No Assessments Yet
                  </h3>
                  <p className="text-gray-600">
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

        {missedAssessments.length > 0 && (
          <Card className="mt-6 border-rose-200 bg-rose-50">
            <CardContent className="p-6">
              <div className="flex items-start gap-3 mb-4">
                <AlertCircle className="w-5 h-5 text-rose-600 mt-0.5" />
                <div>
                  <h3 className="text-lg font-semibold text-rose-900 mb-1">
                    Missed Assessments
                  </h3>
                  <p className="text-sm text-rose-700">
                    You missed {missedAssessments.length} assessment
                    {missedAssessments.length !== 1 ? "s" : ""}. Contact your
                    teacher if you need an extension.
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                {missedAssessments.map((assessment) => (
                  <div
                    key={assessment._id}
                    className="flex items-center justify-between p-3 bg-white rounded-lg border border-rose-200"
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
                    <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-100 border-0 ml-2">
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
      <Card className="hover:shadow-md transition-shadow border border-gray-200">
        <CardContent className="p-6">
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

              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {assessment.title}
              </h3>

              {assessment.description && (
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {assessment.description}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <FileText className="w-4 h-4" />
                  <span>{assessment.totalQuestions} questions</span>
                </div>
                {assessment.dueDate && (
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {new Date(assessment.dueDate).toLocaleDateString(
                        "en-US",
                        {
                          month: "short",
                          day: "numeric",
                        }
                      )}
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
                      +{assessment.skills.length - 3}
                    </Badge>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between sm:flex-col sm:items-end gap-3">
              {isCompleted && assessment.score !== undefined ? (
                <div className="text-right">
                  <div
                    className={`text-4xl font-bold ${
                      assessment.score >= 80
                        ? "text-emerald-600"
                        : assessment.score >= 60
                          ? "text-amber-600"
                          : "text-rose-600"
                    }`}
                  >
                    {assessment.score.toFixed(0)}%
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {assessment.submittedAt &&
                      new Date(assessment.submittedAt).toLocaleDateString(
                        "en-US",
                        { month: "short", day: "numeric" }
                      )}
                  </p>
                </div>
              ) : (
                <Button className="bg-blue-600 hover:bg-blue-700">
                  {assessment.isPastDue ? "View" : "Start"}
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

"use client";

import { useEffect, useState } from "react";
import {
  GraduationCap,
  Plus,
  BookOpen,
  MoreVertical,
  Loader2,
  LogOut,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { api } from "@/lib/api";
import JoinClassroomModal from "@/components/classroom/JoinClassroomModal";
import ROUTES from "@/constants/routes";

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

const CARD_COLORS = [
  { header: "from-blue-600 to-blue-700", pattern: "bg-blue-800/10" },
  { header: "from-emerald-600 to-emerald-700", pattern: "bg-emerald-800/10" },
  { header: "from-purple-600 to-purple-700", pattern: "bg-purple-800/10" },
  { header: "from-rose-600 to-rose-700", pattern: "bg-rose-800/10" },
  { header: "from-amber-600 to-amber-700", pattern: "bg-amber-800/10" },
  { header: "from-indigo-600 to-indigo-700", pattern: "bg-indigo-800/10" },
];

const StudentClassroomsHub = () => {
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [selectedTab, setSelectedTab] = useState("all");

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

  const handleUnenroll = async (
    classroomId: string,
    classroomName: string,
    e: React.MouseEvent
  ) => {
    e.preventDefault();
    e.stopPropagation();

    if (
      !confirm(
        `Are you sure you want to unenroll from "${classroomName}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      const response = await api.student.leaveClassroom(classroomId);

      if (response.success) {
        toast.success("Successfully unenrolled from classroom");
        fetchData();
      } else {
        toast.error(response.error?.message || "Failed to unenroll");
      }
    } catch (error) {
      console.error("Error unenrolling:", error);
      toast.error("Failed to unenroll from classroom");
    }
  };

  const pendingAssessments = assessments.filter(
    (a) => a.status === "not_started" && !a.isPastDue
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-white pt-20">
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Classrooms</h1>
          <Button
            onClick={() => setShowJoinModal(true)}
            className="bg-blue-600 hover:bg-blue-700"
            size="sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Join class
          </Button>
        </div>

        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedTab("all")}
            className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
              selectedTab === "all"
                ? "bg-blue-600 text-white shadow-md"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            All Classes
          </button>
          <button
            onClick={() => setSelectedTab("pending")}
            className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
              selectedTab === "pending"
                ? "bg-blue-600 text-white shadow-md"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            To Do ({pendingAssessments.length})
          </button>
        </div>

        {selectedTab === "all" && (
          <>
            {classrooms.length === 0 ? (
              <div className="text-center py-16">
                <div className="bg-gray-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-4">
                  <GraduationCap className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  No classes yet
                </h3>
                <p className="text-gray-600 mb-6">
                  Join your first class to get started
                </p>
                <Button
                  onClick={() => setShowJoinModal(true)}
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Join a Class
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {classrooms.map((classroom, index) => {
                  const colorScheme = CARD_COLORS[index % CARD_COLORS.length];
                  return (
                    <ClassroomCard
                      key={classroom._id}
                      classroom={classroom}
                      colorScheme={colorScheme}
                      onUnenroll={handleUnenroll}
                    />
                  );
                })}
              </div>
            )}
          </>
        )}

        {selectedTab === "pending" && (
          <div className="max-w-4xl mx-auto">
            {pendingAssessments.length === 0 ? (
              <div className="text-center py-16">
                <div className="bg-gray-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  All caught up!
                </h3>
                <p className="text-gray-600">No pending assignments</p>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-200">
                {pendingAssessments.map((assessment) => (
                  <Link
                    key={assessment._id}
                    href={`/classroom/assessment/${assessment._id}`}
                    className="block p-6 hover:bg-gray-50 transition-colors group"
                  >
                    <div className="flex items-start gap-4">
                      <div className="bg-blue-100 rounded-lg p-3 group-hover:bg-blue-200 transition-colors">
                        <BookOpen className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                          {assessment.title}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">
                          {assessment.classroom.name}
                        </p>
                        <div className="flex items-center gap-3 text-sm text-gray-500">
                          {assessment.dueDate && (
                            <span>
                              Due{" "}
                              {new Date(assessment.dueDate).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                }
                              )}
                            </span>
                          )}
                          <span>•</span>
                          <span>{assessment.totalQuestions} questions</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <JoinClassroomModal
        isOpen={showJoinModal}
        onClose={() => setShowJoinModal(false)}
        onSuccess={fetchData}
      />
    </div>
  );
};

const ClassroomCard = ({
  classroom,
  colorScheme,
  onUnenroll,
}: {
  classroom: Classroom;
  colorScheme: { header: string; pattern: string };
  onUnenroll: (
    classroomId: string,
    classroomName: string,
    e: React.MouseEvent
  ) => void;
}) => {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="relative bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
      <Link href={ROUTES.CLASSROOMID(classroom._id)}>
        <div
          className={`relative h-28 bg-linear-to-br ${colorScheme.header} p-4 overflow-hidden cursor-pointer`}
        >
          <div className={`absolute inset-0 ${colorScheme.pattern} opacity-20`}>
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full -translate-y-1/2 translate-x-1/2 border-8 border-white/20" />
            <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full translate-y-1/2 -translate-x-1/2 border-8 border-white/20" />
          </div>

          <div className="relative">
            <h3 className="text-white font-medium text-lg line-clamp-2 hover:underline">
              {classroom.name}
            </h3>
          </div>

          <div className="absolute -bottom-8 right-4">
            <div className="w-16 h-16 rounded-full bg-white border-4 border-white shadow-md flex items-center justify-center overflow-hidden">
              {classroom.teacher.image ? (
                <img
                  src={classroom.teacher.image}
                  alt={classroom.teacher.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-xl font-bold text-gray-700">
                  {getInitials(classroom.teacher.name)}
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="absolute top-2 right-2 p-2 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full transition-colors z-10"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <MoreVertical className="w-5 h-5 text-gray-700" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem
            onClick={(e) => onUnenroll(classroom._id, classroom.name, e)}
            className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Unenroll
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="p-4 pt-10">
        <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-2">
          {classroom.name}
        </h3>
        <p className="text-sm text-gray-600 mb-3">{classroom.subject}</p>
        <p className="text-xs text-gray-500 mb-4">{classroom.teacher.name}</p>

        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between text-xs text-gray-600">
            <span className="font-medium">Progress</span>
            <span className="font-semibold">
              {classroom.completedAssessments}/{classroom.totalAssessments}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`bg-linear-to-r ${colorScheme.header} h-2 rounded-full transition-all duration-500`}
              style={{
                width: `${
                  classroom.totalAssessments > 0
                    ? (classroom.completedAssessments /
                        classroom.totalAssessments) *
                      100
                    : 0
                }%`,
              }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="text-xs text-gray-500 font-mono">
            {classroom.code}
          </div>
          {classroom.pendingAssessments > 0 && (
            <div className="flex items-center gap-1 text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full font-medium">
              <span>{classroom.pendingAssessments} due</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentClassroomsHub;

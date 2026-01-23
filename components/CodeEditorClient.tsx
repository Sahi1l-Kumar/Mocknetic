"use client";
import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Search,
  Filter,
  Trophy,
  Brain,
  BarChart2,
  ClipboardCheck,
  Star,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PROBLEM_TAGS, SAMPLE_PROBLEMS } from "@/constants";
import ROUTES from "@/constants/routes";
import { api } from "@/lib/api";

const DIFFICULTY_COLORS: Record<string, string> = {
  Easy: "text-emerald-600 dark:text-emerald-400 border-emerald-600",
  Medium: "text-amber-600 dark:text-amber-400 border-amber-600",
  Hard: "text-rose-600 dark:text-rose-400 border-rose-600",
};

interface UserSubmission {
  problemNumber: number;
  problemTitle: string;
  status: string;
  _id: string;
}

interface SubmissionsResponse {
  submissions: UserSubmission[];
  total: number;
  limit: number;
  skip: number;
  hasMore: boolean;
}

export default function CodeEditorClient(): React.ReactNode {
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedTag, setSelectedTag] = useState<string>("All Topics");
  const [sortBy, setSortBy] = useState<string>("Default");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("All");
  const [userSubmissions, setUserSubmissions] = useState<UserSubmission[]>([]);
  const [isLoadingSubmissions, setIsLoadingSubmissions] =
    useState<boolean>(false);
  const [solvedProblemsCount, setSolvedProblemsCount] = useState<number>(0);

  // Fetch user submissions on mount
  useEffect(() => {
    const fetchUserSubmissions = async () => {
      if (sessionStatus === "loading") return;
      if (!session?.user) return;

      setIsLoadingSubmissions(true);
      try {
        const response = await api.judge0.getSubmissions({
          limit: 1000,
        });

        if (response.success && response.data) {
          const submissionsData = response.data as SubmissionsResponse;
          const submissions = submissionsData.submissions || [];
          setUserSubmissions(submissions);

          // Count unique solved problems by problemNumber
          const uniqueSolvedProblems = new Set(
            submissions
              .filter((sub) => sub.status === "accepted")
              .map((sub) => sub.problemNumber),
          );
          setSolvedProblemsCount(uniqueSolvedProblems.size);
        }
      } catch (error) {
        console.error("Failed to fetch submissions:", error);
      } finally {
        setIsLoadingSubmissions(false);
      }
    };

    fetchUserSubmissions();
  }, [session, sessionStatus]);

  // Get submission status for a problem
  const getProblemStatus = (
    problemId: number,
  ): "solved" | "attempted" | "unsolved" => {
    const problemSubs = userSubmissions.filter(
      (sub) => sub.problemNumber === problemId,
    );

    if (problemSubs.length === 0) return "unsolved";

    const hasAccepted = problemSubs.some((sub) => sub.status === "accepted");
    return hasAccepted ? "solved" : "attempted";
  };

  const filteredProblems = useMemo(() => {
    let problems = SAMPLE_PROBLEMS.filter((problem) => {
      const matchesSearch =
        problem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        problem.id.toString().includes(searchTerm);
      const matchesTag =
        selectedTag === "All Topics" || problem.tags.includes(selectedTag);
      const matchesDifficulty =
        difficultyFilter === "All" || problem.difficulty === difficultyFilter;

      return matchesSearch && matchesTag && matchesDifficulty;
    });

    // Apply sorting
    if (sortBy === "Acceptance") {
      problems = [...problems].sort((a, b) => {
        const aVal = parseFloat(a.acceptance);
        const bVal = parseFloat(b.acceptance);
        return bVal - aVal;
      });
    } else if (sortBy === "Difficulty") {
      const difficultyOrder = { Easy: 1, Medium: 2, Hard: 3 };
      problems = [...problems].sort(
        (a, b) =>
          difficultyOrder[a.difficulty as keyof typeof difficultyOrder] -
          difficultyOrder[b.difficulty as keyof typeof difficultyOrder],
      );
    } else if (sortBy === "Frequency") {
      const frequencyOrder = { Low: 1, Medium: 2, High: 3, "Very High": 4 };
      problems = [...problems].sort(
        (a, b) =>
          frequencyOrder[b.frequency as keyof typeof frequencyOrder] -
          frequencyOrder[a.frequency as keyof typeof frequencyOrder],
      );
    }

    return problems;
  }, [searchTerm, selectedTag, difficultyFilter, sortBy]);

  // Calculate stats
  const totalProblems = SAMPLE_PROBLEMS.length;
  const solvedProblems = session?.user ? solvedProblemsCount : 850;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="border-b border-slate-200 bg-linear-to-r from-blue-600/10 via-blue-500/5 to-slate-50">
        <div className="max-w-7xl mx-auto px-6 py-7 flex flex-wrap md:flex-nowrap items-center gap-8">
          {/* Left Content */}
          <div className="flex-1 max-w-2xl">
            <h1 className="text-4xl font-black tracking-tight leading-tight text-slate-900 mb-2">
              Start Your Coding Journey
            </h1>
            <p className="text-slate-600 mb-6 leading-relaxed">
              Practice coding problems, improve your skills,
              <br />
              and prepare for technical interviews with our comprehensive
              platform.
            </p>

            {/* 2x2 Button Grid */}
            <div className="grid grid-cols-2 gap-3 max-w-md min-w-[250px]">
              <Link href={ROUTES.CODE}>
                <Button
                  size="lg"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Trophy className="mr-2 h-4 w-4" />
                  Start Learning
                </Button>
              </Link>

              <Link href={ROUTES.INTERVIEW}>
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full border-slate-300 hover:bg-slate-50"
                >
                  <Brain className="mr-2 h-4 w-4" />
                  Mock Interview
                </Button>
              </Link>

              <Link href={ROUTES.SKILL}>
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full border-slate-300 hover:bg-slate-50"
                >
                  <BarChart2 className="mr-2 h-4 w-4" />
                  Skill Assessment
                </Button>
              </Link>

              <Link href={ROUTES.RESUME}>
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full border-slate-300 hover:bg-slate-50"
                >
                  <ClipboardCheck className="mr-2 h-4 w-4" />
                  Resume Parser
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="flex gap-4 md:gap-6">
            <Card className="shadow-lg w-32 h-20 sm:w-36 sm:h-24 md:w-40 md:h-28 lg:w-44 lg:h-32 xl:w-48 xl:h-36 border-slate-200">
              <CardContent className="flex flex-col items-center justify-center h-full p-2">
                <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-extrabold text-blue-600">
                  {totalProblems}+
                </div>
                <div className="text-xs sm:text-sm md:text-base font-medium text-slate-600 mt-1 text-center">
                  Problems Available
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg w-32 h-20 sm:w-36 sm:h-24 md:w-40 md:h-28 lg:w-44 lg:h-32 xl:w-48 xl:h-36 border-slate-200">
              <CardContent className="flex flex-col items-center justify-center h-full p-2 relative">
                {isLoadingSubmissions && session?.user && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/80">
                    <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                  </div>
                )}
                <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-extrabold text-emerald-500">
                  {solvedProblems}
                </div>
                <div className="text-xs sm:text-sm md:text-base font-medium text-slate-600 mt-1 text-center">
                  {session?.user ? "Problems Solved" : "Active Users"}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Tags Sidebar */}
          <aside className="lg:col-span-1 space-y-6">
            <Card className="border-slate-200 shadow-sm">
              <CardContent className="p-6">
                <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Filter size={18} />
                  Topics
                </h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {PROBLEM_TAGS.map((tag) => (
                    <button
                      key={tag.name}
                      onClick={() => setSelectedTag(tag.name)}
                      className={`w-full text-left p-2 rounded-lg transition-all duration-200 ${
                        selectedTag === tag.name
                          ? "bg-blue-50 text-blue-600 border border-blue-200"
                          : "hover:bg-slate-50 text-slate-600"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{tag.name}</span>
                        <Badge
                          variant="secondary"
                          className={`text-xs ${
                            selectedTag === tag.name
                              ? "bg-blue-100 text-blue-700"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {tag.count}
                        </Badge>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* User Progress Card */}
            {session?.user && (
              <Card className="border-slate-200 shadow-sm">
                <CardContent className="p-6">
                  <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Trophy size={18} />
                    Your Progress
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-600">Problems Solved</span>
                        <span className="font-semibold text-slate-900">
                          {solvedProblemsCount}/{totalProblems}
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{
                            width: `${(solvedProblemsCount / totalProblems) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                    <div className="pt-2 border-t border-slate-200">
                      <div className="text-xs text-slate-600 space-y-1">
                        <div className="flex justify-between">
                          <span>Total Submissions:</span>
                          <span className="font-medium text-slate-900">
                            {userSubmissions.length}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Success Rate:</span>
                          <span className="font-medium text-emerald-600">
                            {userSubmissions.length > 0
                              ? Math.round(
                                  (userSubmissions.filter(
                                    (s) => s.status === "accepted",
                                  ).length /
                                    userSubmissions.length) *
                                    100,
                                )
                              : 0}
                            %
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-3 space-y-6">
            {/* Search and Filters */}
            <Card className="border-slate-200 shadow-sm">
              <CardContent className="p-4">
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                    <Input
                      placeholder="Search questions..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  <Select
                    value={difficultyFilter}
                    onValueChange={setDifficultyFilter}
                  >
                    <SelectTrigger className="w-[180px] border-slate-200">
                      <SelectValue placeholder="Difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All Difficulty</SelectItem>
                      <SelectItem value="Easy">Easy</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-[180px] border-slate-200">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Default">Default</SelectItem>
                      <SelectItem value="Acceptance">Acceptance</SelectItem>
                      <SelectItem value="Frequency">Frequency</SelectItem>
                      <SelectItem value="Difficulty">Difficulty</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Problems List */}
            <Card className="border-slate-200 shadow-sm">
              <CardContent className="p-0">
                {/* Header */}
                <div className="sticky top-0 z-10 p-4 border-b border-slate-200 bg-slate-50">
                  <div className="grid grid-cols-12 gap-4 items-center">
                    <div className="col-span-1 text-center">
                      <span className="text-xs font-medium text-slate-500">
                        Status
                      </span>
                    </div>
                    <div className="col-span-5">
                      <span className="text-xs font-medium text-slate-500">
                        Title
                      </span>
                    </div>
                    <div className="col-span-2 text-center">
                      <span className="text-xs font-medium text-slate-500">
                        Acceptance
                      </span>
                    </div>
                    <div className="col-span-2 text-center">
                      <span className="text-xs font-medium text-slate-500">
                        Difficulty
                      </span>
                    </div>
                    <div className="col-span-2 text-center">
                      <span className="text-xs font-medium text-slate-500">
                        Frequency
                      </span>
                    </div>
                  </div>
                </div>

                {/* Problems */}
                <div className="divide-y divide-slate-200 max-h-[600px] overflow-y-auto">
                  {filteredProblems.map((problem) => {
                    const status = session?.user
                      ? getProblemStatus(problem.id)
                      : problem.solved
                        ? "solved"
                        : "unsolved";

                    return (
                      <div
                        key={problem.id}
                        className="grid grid-cols-12 gap-4 items-center p-4 hover:bg-blue-50/50 transition-colors cursor-pointer"
                        onClick={() => router.push(`/problem/${problem.id}`)}
                      >
                        {/* Status */}
                        <div className="col-span-1 text-center">
                          {status === "solved" ? (
                            <CheckCircle className="h-5 w-5 text-emerald-500 mx-auto" />
                          ) : status === "attempted" ? (
                            <div className="h-5 w-5 border-2 border-amber-500 bg-amber-500/20 rounded-full mx-auto" />
                          ) : (
                            <div className="h-5 w-5 border-2 border-slate-300 rounded-full mx-auto" />
                          )}
                        </div>

                        {/* Title */}
                        <div className="col-span-5">
                          <div className="flex items-center gap-2">
                            {problem.premium && (
                              <Star className="h-4 w-4 text-amber-500" />
                            )}
                            <span className="text-sm text-slate-900 hover:text-blue-600">
                              {problem.id}. {problem.title}
                            </span>
                          </div>
                          <div className="flex gap-2 mt-1">
                            {problem.tags.slice(0, 2).map((tag) => (
                              <Badge
                                key={tag}
                                variant="secondary"
                                className="text-xs bg-slate-100 text-slate-700"
                              >
                                {tag}
                              </Badge>
                            ))}
                            {problem.tags.length > 2 && (
                              <Badge
                                variant="secondary"
                                className="text-xs bg-slate-100 text-slate-700"
                              >
                                +{problem.tags.length - 2}
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Acceptance */}
                        <div className="col-span-2 text-center">
                          <span className="text-xs font-medium text-slate-600">
                            {problem.acceptance}
                          </span>
                        </div>

                        {/* Difficulty */}
                        <div className="col-span-2 text-center">
                          <Badge
                            variant="outline"
                            className={
                              DIFFICULTY_COLORS[
                                problem.difficulty as keyof typeof DIFFICULTY_COLORS
                              ]
                            }
                          >
                            {problem.difficulty}
                          </Badge>
                        </div>

                        {/* Frequency */}
                        <div className="col-span-2 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <div className="flex gap-1">
                              {[1, 2, 3, 4, 5].map((bar) => (
                                <div
                                  key={bar}
                                  className={`w-1 h-3 rounded-full ${
                                    (problem.frequency === "Very High" &&
                                      bar <= 5) ||
                                    (problem.frequency === "High" &&
                                      bar <= 4) ||
                                    (problem.frequency === "Medium" &&
                                      bar <= 3) ||
                                    (problem.frequency === "Low" && bar <= 2)
                                      ? "bg-blue-600"
                                      : "bg-slate-300"
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </div>
  );
}

"use client";
import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Filter,
  Trophy,
  Star,
  CheckCircle,
  Brain,
  BarChart2,
  ClipboardCheck,
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

const DIFFICULTY_COLORS = {
  Easy: "text-green-600 dark:text-green-400 border-green-600",
  Medium: "text-yellow-600 dark:text-yellow-400 border-yellow-600",
  Hard: "text-red-600 dark:text-red-400 border-red-600",
};

export default function HomePage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState("All Topics");
  const [sortBy, setSortBy] = useState("Default");
  const [difficultyFilter, setDifficultyFilter] = useState("All");

  const filteredProblems = useMemo(() => {
    return SAMPLE_PROBLEMS.filter((problem) => {
      const matchesSearch =
        problem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        problem.id.toString().includes(searchTerm);
      const matchesTag =
        selectedTag === "All Topics" || problem.tags.includes(selectedTag);
      const matchesDifficulty =
        difficultyFilter === "All" || problem.difficulty === difficultyFilter;

      return matchesSearch && matchesTag && matchesDifficulty;
    });
  }, [searchTerm, selectedTag, difficultyFilter]);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section - Compact & Responsive */}
      <section className="border-b bg-gradient-to-r from-primary/10 to-primary/5">
        <div className="max-w-7xl mx-auto px-6 py-7 flex flex-wrap md:flex-nowrap items-center gap-8">
          {/* Left Content */}
          <div className="flex-1 max-w-2xl">
            <h1 className="text-4xl font-black tracking-tight leading-tight text-foreground mb-2">
              Start Your Coding Journey
            </h1>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Practice coding problems, improve your skills,
              <br />
              and prepare for technical interviews with our comprehensive
              platform.
            </p>

            {/* 2x2 Button Grid */}
            <div className="grid grid-cols-2 gap-3 max-w-md min-w-[250px]">
              <Button
                size="lg"
                className="w-full bg-primary hover:bg-primary/90"
              >
                <Trophy className="mr-2 h-4 w-4" />
                Start Learning
              </Button>
              <Button size="lg" variant="outline" className="w-full">
                <Brain className="mr-2 h-4 w-4" />
                Mock Interview
              </Button>
              <Link href="/editor">
                <Button size="lg" variant="outline" className="w-full">
                  <BarChart2 className="mr-2 h-4 w-4" />
                  Skill Gap Analyzer
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="w-full">
                <ClipboardCheck className="mr-2 h-4 w-4" />
                Assessments
              </Button>
            </div>
          </div>

          {/* Responsive Stats Cards */}
          <div className="flex gap-4 md:gap-6">
            <Card className="shadow-lg w-32 h-20 sm:w-36 sm:h-24 md:w-40 md:h-28 lg:w-44 lg:h-32 xl:w-48 xl:h-36">
              <CardContent className="flex flex-col items-center justify-center h-full p-2">
                <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-extrabold text-primary">
                  1,600+
                </div>
                <div className="text-xs sm:text-sm md:text-base font-medium text-muted-foreground mt-1 text-center">
                  Problems Available
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg w-32 h-20 sm:w-36 sm:h-24 md:w-40 md:h-28 lg:w-44 lg:h-32 xl:w-48 xl:h-36">
              <CardContent className="flex flex-col items-center justify-center h-full p-2">
                <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-extrabold text-green-500">
                  850
                </div>
                <div className="text-xs sm:text-sm md:text-base font-medium text-muted-foreground mt-1 text-center">
                  Problems Solved
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
            <Card>
              <CardContent className="p-6">
                <h3 className="h3-bold text-foreground mb-4 flex items-center gap-2">
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
                          ? "bg-primary/10 text-primary"
                          : "hover:bg-muted text-foreground"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="body-medium">{tag.name}</span>
                        <Badge variant="secondary" className="text-xs">
                          {tag.count}
                        </Badge>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-3 space-y-6">
            {/* Search and Filters */}
            <Card>
              <CardContent>
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Search questions..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  <Select
                    value={difficultyFilter}
                    onValueChange={setDifficultyFilter}
                  >
                    <SelectTrigger className="w-[180px]">
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
                    <SelectTrigger className="w-[180px]">
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

            {/* Problems List with Fixed Header Background */}
            <Card>
              <CardContent className="p-0">
                {/* Header with Full Background */}
                <div className="sticky top-0 z-10 p-4 border-b">
                  <div className="grid grid-cols-12 gap-4 items-center">
                    <div className="col-span-1 text-center">
                      <span className="small-medium text-muted-foreground">
                        Status
                      </span>
                    </div>
                    <div className="col-span-5">
                      <span className="small-medium text-muted-foreground">
                        Title
                      </span>
                    </div>
                    <div className="col-span-2 text-center">
                      <span className="small-medium text-muted-foreground">
                        Acceptance
                      </span>
                    </div>
                    <div className="col-span-2 text-center">
                      <span className="small-medium text-muted-foreground">
                        Difficulty
                      </span>
                    </div>
                    <div className="col-span-2 text-center">
                      <span className="small-medium text-muted-foreground">
                        Frequency
                      </span>
                    </div>
                  </div>
                </div>

                {/* Problems - Scrollable Container */}
                <div className="divide-y max-h-[600px] overflow-y-auto">
                  {filteredProblems.map((problem) => (
                    <div
                      key={problem.id}
                      className="grid grid-cols-12 gap-4 items-center p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => router.push(`/problem/${problem.id}`)}
                    >
                      {/* Status */}
                      <div className="col-span-1 text-center">
                        {problem.solved ? (
                          <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                        ) : (
                          <div className="h-5 w-5 border-2 border-muted-foreground rounded-full mx-auto" />
                        )}
                      </div>

                      {/* Title */}
                      <div className="col-span-5">
                        <div className="flex items-center gap-2">
                          {problem.premium && (
                            <Star className="h-4 w-4 text-yellow-500" />
                          )}
                          <span className="paragraph-regular text-foreground hover:text-primary">
                            {problem.id}. {problem.title}
                          </span>
                        </div>
                        <div className="flex gap-2 mt-1">
                          {problem.tags.slice(0, 2).map((tag) => (
                            <Badge
                              key={tag}
                              variant="secondary"
                              className="text-xs"
                            >
                              {tag}
                            </Badge>
                          ))}
                          {problem.tags.length > 2 && (
                            <Badge variant="secondary" className="text-xs">
                              +{problem.tags.length - 2}
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Acceptance */}
                      <div className="col-span-2 text-center">
                        <span className="small-medium text-muted-foreground">
                          {problem.acceptance}
                        </span>
                      </div>

                      {/* Difficulty */}
                      <div className="col-span-2 text-center">
                        <Badge
                          variant="outline"
                          className={`${DIFFICULTY_COLORS[problem.difficulty as keyof typeof DIFFICULTY_COLORS]}`}
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
                                  (problem.frequency === "High" && bar <= 4) ||
                                  (problem.frequency === "Medium" &&
                                    bar <= 3) ||
                                  (problem.frequency === "Low" && bar <= 2)
                                    ? "bg-primary"
                                    : "bg-muted"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </div>
  );
}

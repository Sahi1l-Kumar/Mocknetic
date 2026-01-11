"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock,
  Award,
  TrendingUp,
  FileText,
  AlertCircle,
  Download,
  Share2,
  Loader2,
  BookOpen,
  Target,
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
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { api } from "@/lib/api";

interface AssessmentResultProps {
  assessmentId: string;
}

interface Question {
  _id: string;
  questionNumber: number;
  questionText: string;
  questionType: "mcq" | "descriptive" | "numerical" | "coding";
  options?: string[];
  correctAnswer?: string | string[] | number;
  points: number;
  difficulty: string;
  topic?: string;
  explanation?: string;
}

interface Answer {
  questionId: string;
  studentAnswer: string | string[] | number;
  isCorrect: boolean | null;
  pointsAwarded: number;
  pointsPossible: number;
  feedback?: string;
}

interface Submission {
  _id: string;
  score: number;
  totalPoints: number;
  percentage: number;
  status: string;
  submittedAt: string;
  gradedAt?: string;
  timeSpent: number;
  answers: Answer[];
}

interface Assessment {
  _id: string;
  title: string;
  description?: string;
  classroomId: string;
  classroom?: {
    _id: string;
    name: string;
  };
  totalQuestions: number;
  difficulty: string;
  curriculum?: string;
  questions?: Question[];
}

const AssessmentResult = ({ assessmentId }: AssessmentResultProps) => {
  const router = useRouter();
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchResults = useCallback(async () => {
    try {
      setLoading(true);

      // Fetch assessment and results
      const [assessmentRes, resultsRes] = await Promise.all([
        api.assessment.getById(assessmentId),
        api.assessment.getResults(assessmentId),
      ]);

      if (assessmentRes.success) {
        const assessmentData = assessmentRes.data as Assessment;
        setAssessment(assessmentData);

        // Questions should be included in assessment
        if (assessmentData.questions && assessmentData.questions.length > 0) {
          setQuestions(assessmentData.questions);
        }
      }

      if (resultsRes.success) {
        setSubmission(resultsRes.data as Submission);
      } else {
        toast.error("No submission found");
        router.push("/classroom");
        return;
      }
    } catch (error) {
      console.error("Error fetching results:", error);
      toast.error("Failed to load results");
    } finally {
      setLoading(false);
    }
  }, [assessmentId, router]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hrs > 0) {
      return `${hrs}h ${mins}m ${secs}s`;
    }
    if (mins > 0) {
      return `${mins}m ${secs}s`;
    }
    return `${secs}s`;
  };

  const getScoreBgColor = (percentage: number) => {
    if (percentage >= 80) return "from-green-500 to-green-600";
    if (percentage >= 60) return "from-yellow-500 to-yellow-600";
    return "from-red-500 to-red-600";
  };

  const getScoreMessage = (percentage: number) => {
    if (percentage >= 90) return "Outstanding! 🎉";
    if (percentage >= 80) return "Great job! 👏";
    if (percentage >= 70) return "Good work! 👍";
    if (percentage >= 60) return "Keep practicing! 💪";
    return "Need more practice 📚";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50 pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <Loader2 className="w-12 h-12 animate-spin text-indigo-600" />
          </div>
        </div>
      </div>
    );
  }

  if (!assessment || !submission) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50 pt-20">
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <AlertCircle className="w-16 h-16 text-yellow-500 mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Results Not Available
              </h3>
              <p className="text-gray-600 mb-6">
                Unable to load your assessment results.
              </p>
              <Link href="/classroom">
                <Button>Back to Classrooms</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const classroomId = assessment.classroom?._id || assessment.classroomId;
  const correctAnswers = submission.answers.filter(
    (a) => a.isCorrect === true
  ).length;
  const incorrectAnswers = submission.answers.filter(
    (a) => a.isCorrect === false
  ).length;
  const pendingReview = submission.answers.filter(
    (a) => a.isCorrect === null
  ).length;

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50 pt-20">
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-5xl">
        {/* Back Button */}
        <Link href={`/classroom/${classroomId}`}>
          <Button variant="ghost" size="sm" className="mb-4 sm:mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Classroom
          </Button>
        </Link>

        {/* Score Card */}
        <Card
          className={`mb-6 sm:mb-8 bg-linear-to-br ${getScoreBgColor(submission.percentage)} text-white border-0 overflow-hidden`}
        >
          <CardContent className="p-6 sm:p-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-4">
                  <Award className="w-6 h-6 sm:w-8 sm:h-8" />
                  <h1 className="text-2xl sm:text-3xl font-bold">
                    Assessment Results
                  </h1>
                </div>
                <h2 className="text-xl sm:text-2xl font-semibold mb-2">
                  {assessment.title}
                </h2>
                <p className="text-white/90 text-sm sm:text-base mb-4">
                  {assessment.classroom?.name || "Classroom"}
                </p>
                <div className="flex flex-wrap items-center gap-3 text-sm">
                  <div className="flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full">
                    <Clock className="w-4 h-4" />
                    <span>Time: {formatTime(submission.timeSpent)}</span>
                  </div>
                  <div className="flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full">
                    <FileText className="w-4 h-4" />
                    <span>{assessment.totalQuestions} questions</span>
                  </div>
                  <div className="bg-white/20 px-3 py-1 rounded-full">
                    {new Date(submission.submittedAt).toLocaleDateString()}
                  </div>
                </div>
              </div>

              <div className="text-center">
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 border border-white/30">
                  <div className="text-5xl sm:text-6xl font-bold mb-2">
                    {submission.percentage.toFixed(0)}%
                  </div>
                  <div className="text-lg sm:text-xl mb-2">
                    {submission.score}/{submission.totalPoints} points
                  </div>
                  <div className="text-sm sm:text-base font-semibold">
                    {getScoreMessage(submission.percentage)}
                  </div>
                </div>
              </div>
            </div>

            {/* Status Badge */}
            <div className="mt-6">
              {submission.status === "graded" ? (
                <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30">
                  <CheckCircle2 className="w-4 h-4 mr-1" />
                  Graded
                </Badge>
              ) : (
                <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30">
                  <Clock className="w-4 h-4 mr-1" />
                  Pending Review
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <Card>
            <CardContent className="p-4 sm:p-6 text-center">
              <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10 text-green-600 mx-auto mb-3" />
              <div className="text-2xl sm:text-3xl font-bold text-green-600 mb-1">
                {correctAnswers}
              </div>
              <div className="text-xs sm:text-sm text-gray-600">Correct</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 sm:p-6 text-center">
              <XCircle className="w-8 h-8 sm:w-10 sm:h-10 text-red-600 mx-auto mb-3" />
              <div className="text-2xl sm:text-3xl font-bold text-red-600 mb-1">
                {incorrectAnswers}
              </div>
              <div className="text-xs sm:text-sm text-gray-600">Incorrect</div>
            </CardContent>
          </Card>

          {pendingReview > 0 && (
            <Card>
              <CardContent className="p-4 sm:p-6 text-center">
                <Clock className="w-8 h-8 sm:w-10 sm:h-10 text-yellow-600 mx-auto mb-3" />
                <div className="text-2xl sm:text-3xl font-bold text-yellow-600 mb-1">
                  {pendingReview}
                </div>
                <div className="text-xs sm:text-sm text-gray-600">
                  Under Review
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardContent className="p-4 sm:p-6 text-center">
              <TrendingUp className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600 mx-auto mb-3" />
              <div className="text-2xl sm:text-3xl font-bold text-blue-600 mb-1">
                {submission.answers.length > 0
                  ? (
                      (correctAnswers / submission.answers.length) *
                      100
                    ).toFixed(0)
                  : 0}
                %
              </div>
              <div className="text-xs sm:text-sm text-gray-600">Accuracy</div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Breakdown */}
        <Card className="mb-6 sm:mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Performance Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Correct Answers</span>
                <span className="font-semibold text-green-600">
                  {correctAnswers} / {submission.answers.length}
                </span>
              </div>
              <Progress
                value={
                  submission.answers.length > 0
                    ? (correctAnswers / submission.answers.length) * 100
                    : 0
                }
                className="h-2 bg-green-100"
              />
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Points Earned</span>
                <span className="font-semibold text-indigo-600">
                  {submission.score} / {submission.totalPoints}
                </span>
              </div>
              <Progress
                value={(submission.score / submission.totalPoints) * 100}
                className="h-2 bg-indigo-100"
              />
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6 sm:mb-8">
          <Button variant="outline" className="flex-1" disabled>
            <Download className="mr-2 h-4 w-4" />
            Download Report
          </Button>
          <Button variant="outline" className="flex-1" disabled>
            <Share2 className="mr-2 h-4 w-4" />
            Share Results
          </Button>
        </div>

        {/* Detailed Answers */}
        {questions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Detailed Review
              </CardTitle>
              <CardDescription>
                Review your answers and see correct solutions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {questions.map((question, idx) => {
                  const answer = submission.answers.find(
                    (a) => a.questionId.toString() === question._id.toString()
                  );

                  return (
                    <AccordionItem key={question._id} value={`question-${idx}`}>
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center gap-3 flex-1 text-left">
                          <div className="shrink-0">
                            {answer?.isCorrect === true ? (
                              <CheckCircle2 className="w-5 h-5 text-green-600" />
                            ) : answer?.isCorrect === false ? (
                              <XCircle className="w-5 h-5 text-red-600" />
                            ) : (
                              <Clock className="w-5 h-5 text-yellow-600" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-sm sm:text-base truncate">
                              Question {question.questionNumber}
                            </div>
                            <div className="flex flex-wrap items-center gap-2 mt-1">
                              <Badge
                                variant="outline"
                                className="text-xs capitalize"
                              >
                                {question.questionType}
                              </Badge>
                              {question.topic && (
                                <Badge variant="secondary" className="text-xs">
                                  {question.topic}
                                </Badge>
                              )}
                              <span className="text-xs text-gray-500">
                                {answer?.pointsAwarded || 0} / {question.points}{" "}
                                pts
                              </span>
                            </div>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="pl-8 pr-4 pb-4 space-y-4">
                          {/* Question Text */}
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-2">
                              Question:
                            </h4>
                            <p className="text-gray-700 whitespace-pre-wrap">
                              {question.questionText}
                            </p>
                          </div>

                          <Separator />

                          {/* Your Answer */}
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-2">
                              Your Answer:
                            </h4>
                            <div
                              className={`p-3 rounded-lg ${
                                answer?.isCorrect === true
                                  ? "bg-green-50 border border-green-200"
                                  : answer?.isCorrect === false
                                    ? "bg-red-50 border border-red-200"
                                    : "bg-yellow-50 border border-yellow-200"
                              }`}
                            >
                              <p className="text-gray-900 whitespace-pre-wrap">
                                {answer?.studentAnswer?.toString() ||
                                  "Not answered"}
                              </p>
                            </div>
                          </div>

                          {/* Correct Answer */}
                          {question.correctAnswer &&
                            question.questionType !== "descriptive" &&
                            question.questionType !== "coding" && (
                              <>
                                <Separator />
                                <div>
                                  <h4 className="font-semibold text-gray-900 mb-2">
                                    Correct Answer:
                                  </h4>
                                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                                    <p className="text-gray-900">
                                      {question.correctAnswer.toString()}
                                    </p>
                                  </div>
                                </div>
                              </>
                            )}

                          {/* Explanation */}
                          {question.explanation && (
                            <>
                              <Separator />
                              <div>
                                <h4 className="font-semibold text-gray-900 mb-2">
                                  Explanation:
                                </h4>
                                <p className="text-gray-700 whitespace-pre-wrap">
                                  {question.explanation}
                                </p>
                              </div>
                            </>
                          )}

                          {/* Feedback */}
                          {answer?.feedback && (
                            <>
                              <Separator />
                              <div>
                                <h4 className="font-semibold text-gray-900 mb-2">
                                  Teacher's Feedback:
                                </h4>
                                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                  <p className="text-gray-900 whitespace-pre-wrap">
                                    {answer.feedback}
                                  </p>
                                </div>
                              </div>
                            </>
                          )}

                          {/* Points */}
                          <div className="flex items-center justify-between pt-2">
                            <span className="text-sm text-gray-600">
                              Points:
                            </span>
                            <span className="font-semibold">
                              {answer?.pointsAwarded || 0} / {question.points}
                            </span>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            </CardContent>
          </Card>
        )}

        {/* Next Steps */}
        <Card className="mt-6 sm:mt-8">
          <CardHeader>
            <CardTitle>What's Next?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href={`/classroom/${classroomId}`}>
              <Button variant="outline" className="w-full justify-start">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to {assessment.classroom?.name || "Classroom"}
              </Button>
            </Link>
            <Link href="/classroom">
              <Button variant="outline" className="w-full justify-start">
                <BookOpen className="mr-2 h-4 w-4" />
                View All Classrooms
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AssessmentResult;

"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Send,
  BookOpen,
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
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { api } from "@/lib/api";

interface TakeAssessmentProps {
  assessmentId: string;
}

interface Question {
  _id: string;
  questionNumber: number;
  questionText: string;
  questionType: "mcq" | "descriptive" | "numerical" | "coding";
  options?: string[];
  points: number;
  difficulty: string;
  topic?: string;
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
  dueDate?: string;
  questions?: Question[]; // Questions might be included in assessment
}

const TakeAssessment = ({ assessmentId }: TakeAssessmentProps) => {
  const router = useRouter();
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string | number>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [startTime] = useState(Date.now());
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);

  const fetchAssessment = useCallback(async () => {
    try {
      setLoading(true);

      // Fetch assessment details (questions should be included)
      const assessmentRes = await api.assessment.getById(assessmentId);

      if (assessmentRes.success) {
        const assessmentData = assessmentRes.data as Assessment;
        setAssessment(assessmentData);

        // Check if questions are included in assessment response
        if (assessmentData.questions && assessmentData.questions.length > 0) {
          setQuestions(assessmentData.questions);
        } else {
          toast.error("No questions found for this assessment");
        }
      } else {
        toast.error("Assessment not found");
        router.push("/classroom");
      }
    } catch (error) {
      console.error("Error fetching assessment:", error);
      toast.error("Failed to load assessment");
    } finally {
      setLoading(false);
    }
  }, [assessmentId, router]);

  useEffect(() => {
    fetchAssessment();
  }, [fetchAssessment]);

  // Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(timer);
  }, [startTime]);

  const handleAnswerChange = (questionId: string, answer: string | number) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);

      const timeSpent = Math.floor((Date.now() - startTime) / 1000);

      const result = await api.assessment.submit(
        assessmentId,
        answers,
        timeSpent
      );

      if (result.success) {
        toast.success("Assessment submitted successfully!");
        router.push(`/classroom/assessment/${assessmentId}/result`);
      } else {
        toast.error(result.error?.message || "Failed to submit assessment");
      }
    } catch (error) {
      console.error("Error submitting assessment:", error);
      toast.error("Failed to submit assessment");
    } finally {
      setSubmitting(false);
      setShowSubmitDialog(false);
    }
  };

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const answeredCount = Object.keys(answers).length;
  const progress =
    questions.length > 0 ? (answeredCount / questions.length) * 100 : 0;

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

  if (!assessment || questions.length === 0) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50 pt-20">
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <AlertTriangle className="w-16 h-16 text-yellow-500 mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Assessment Not Available
              </h3>
              <p className="text-gray-600 mb-6">
                This assessment is not available or has no questions.
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

  const currentQuestion = questions[currentQuestionIndex];
  const classroomId = assessment.classroom?._id || assessment.classroomId;

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50 pt-20">
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <Link href={`/classroom/${classroomId}`}>
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Classroom
            </Button>
          </Link>

          <Card className="bg-linear-to-br from-indigo-500 to-indigo-600 text-white border-0">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h1 className="text-xl sm:text-2xl font-bold mb-2">
                    {assessment.title}
                  </h1>
                  <p className="text-indigo-100 text-sm">
                    {assessment.classroom?.name || "Classroom"}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="text-2xl sm:text-3xl font-bold">
                      {formatTime(timeElapsed)}
                    </div>
                    <div className="text-xs text-indigo-100">Time Elapsed</div>
                  </div>
                </div>
              </div>

              {/* Progress */}
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>
                    Question {currentQuestionIndex + 1} of {questions.length}
                  </span>
                  <span>
                    {answeredCount} / {questions.length} answered
                  </span>
                </div>
                <Progress value={progress} className="h-2 bg-white/20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Question Card */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start justify-between gap-4 mb-2">
              <CardTitle className="text-lg sm:text-xl">
                Question {currentQuestion.questionNumber}
              </CardTitle>
              <div className="flex gap-2 shrink-0">
                <Badge variant="outline" className="capitalize">
                  {currentQuestion.questionType}
                </Badge>
                <Badge variant="secondary">{currentQuestion.points} pts</Badge>
              </div>
            </div>
            {currentQuestion.topic && (
              <CardDescription className="flex items-center gap-1">
                <BookOpen className="w-4 h-4" />
                {currentQuestion.topic}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="prose prose-sm sm:prose max-w-none">
              <p className="text-base sm:text-lg text-gray-900 whitespace-pre-wrap">
                {currentQuestion.questionText}
              </p>
            </div>

            {/* Answer Input */}
            <div className="space-y-4">
              {currentQuestion.questionType === "mcq" &&
                currentQuestion.options && (
                  <RadioGroup
                    value={answers[currentQuestion._id]?.toString() || ""}
                    onValueChange={(value) =>
                      handleAnswerChange(currentQuestion._id, value)
                    }
                  >
                    <div className="space-y-3">
                      {currentQuestion.options.map((option, idx) => (
                        <div
                          key={idx}
                          className="flex items-center space-x-3 p-3 sm:p-4 border-2 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
                          onClick={() =>
                            handleAnswerChange(currentQuestion._id, option)
                          }
                        >
                          <RadioGroupItem value={option} id={`option-${idx}`} />
                          <Label
                            htmlFor={`option-${idx}`}
                            className="flex-1 cursor-pointer text-sm sm:text-base"
                          >
                            {option}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                )}

              {currentQuestion.questionType === "descriptive" && (
                <Textarea
                  placeholder="Type your answer here..."
                  value={answers[currentQuestion._id]?.toString() || ""}
                  onChange={(e) =>
                    handleAnswerChange(currentQuestion._id, e.target.value)
                  }
                  rows={8}
                  className="text-sm sm:text-base"
                />
              )}

              {currentQuestion.questionType === "numerical" && (
                <input
                  type="number"
                  placeholder="Enter your answer"
                  value={answers[currentQuestion._id]?.toString() || ""}
                  onChange={(e) =>
                    handleAnswerChange(
                      currentQuestion._id,
                      parseFloat(e.target.value) || 0
                    )
                  }
                  className="w-full px-4 py-3 border-2 rounded-lg text-base sm:text-lg font-semibold focus:outline-none focus:border-indigo-500"
                />
              )}

              {currentQuestion.questionType === "coding" && (
                <Textarea
                  placeholder="Write your code here..."
                  value={answers[currentQuestion._id]?.toString() || ""}
                  onChange={(e) =>
                    handleAnswerChange(currentQuestion._id, e.target.value)
                  }
                  rows={12}
                  className="font-mono text-xs sm:text-sm"
                />
              )}
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <Button
            variant="outline"
            onClick={() =>
              setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))
            }
            disabled={currentQuestionIndex === 0}
            className="flex-1"
          >
            Previous
          </Button>

          {currentQuestionIndex < questions.length - 1 ? (
            <Button
              onClick={() =>
                setCurrentQuestionIndex((prev) =>
                  Math.min(questions.length - 1, prev + 1)
                )
              }
              className="flex-1 bg-indigo-600 hover:bg-indigo-700"
            >
              Next
            </Button>
          ) : (
            <Button
              onClick={() => setShowSubmitDialog(true)}
              disabled={submitting}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Submit Assessment
                </>
              )}
            </Button>
          )}
        </div>

        {/* Question Navigator */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">
              Question Navigator
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2">
              {questions.map((q, idx) => (
                <button
                  key={q._id}
                  onClick={() => setCurrentQuestionIndex(idx)}
                  className={`aspect-square rounded-lg font-semibold text-sm transition-all ${
                    idx === currentQuestionIndex
                      ? "bg-indigo-600 text-white ring-2 ring-indigo-600 ring-offset-2"
                      : answers[q._id]
                        ? "bg-green-100 text-green-700 hover:bg-green-200"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {q.questionNumber}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-4 mt-4 text-xs sm:text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-indigo-600 rounded"></div>
                <span>Current</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
                <span>Answered</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-slate-100 border border-slate-300 rounded"></div>
                <span>Not Answered</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Submit Confirmation Dialog */}
      <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              Submit Assessment?
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>
                You have answered <strong>{answeredCount}</strong> out of{" "}
                <strong>{questions.length}</strong> questions.
              </p>
              {answeredCount < questions.length && (
                <p className="text-yellow-700 font-medium">
                  ⚠️ You have {questions.length - answeredCount} unanswered
                  question
                  {questions.length - answeredCount !== 1 ? "s" : ""}.
                </p>
              )}
              <p>
                Time spent: <strong>{formatTime(timeElapsed)}</strong>
              </p>
              <p className="font-medium">
                Once submitted, you cannot change your answers. Are you sure you
                want to submit?
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={submitting}>
              Review Answers
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSubmit}
              disabled={submitting}
              className="bg-green-600 hover:bg-green-700"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Yes, Submit
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TakeAssessment;

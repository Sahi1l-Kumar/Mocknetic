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
  Clock,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
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
import ROUTES from "@/constants/routes";

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
  questions?: Question[];
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

      const assessmentRes = await api.assessment.getById(assessmentId);

      if (assessmentRes.success) {
        const assessmentData = assessmentRes.data as Assessment;
        setAssessment(assessmentData);

        if (assessmentData.questions && assessmentData.questions.length > 0) {
          setQuestions(assessmentData.questions);
        } else {
          toast.error("No questions found for this assessment");
        }
      } else {
        toast.error("Assessment not found");
        router.push(ROUTES.CLASSROOM);
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
      <div className="min-h-screen bg-white pt-20">
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  if (!assessment || questions.length === 0) {
    return (
      <div className="min-h-screen bg-white pt-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <AlertTriangle className="w-16 h-16 text-amber-500 mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Assessment Not Available
              </h3>
              <p className="text-gray-600 mb-6">
                This assessment is not available or has no questions.
              </p>
              <Link href={ROUTES.CLASSROOM}>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Back to Classrooms
                </Button>
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
    <div className="min-h-screen bg-white pt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        <Link href={ROUTES.CLASSROOMID(classroomId)}>
          <Button variant="ghost" size="sm" className="mb-4 hover:bg-gray-100">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Classroom
          </Button>
        </Link>

        <Card className="mb-6 bg-linear-to-br from-blue-600 to-blue-700 text-white border-0">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
              <div className="flex-1">
                <h1 className="text-2xl font-bold mb-1">{assessment.title}</h1>
                <p className="text-blue-100 text-sm">
                  {assessment.classroom?.name || "Classroom"}
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <div className="flex items-center gap-2 text-white/90 mb-1">
                  <Clock className="w-4 h-4" />
                  <span className="text-xs">Time Elapsed</span>
                </div>
                <div className="text-3xl font-bold tabular-nums">
                  {formatTime(timeElapsed)}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm text-white/90">
                <span>
                  Question {currentQuestionIndex + 1} of {questions.length}
                </span>
                <span>
                  {answeredCount} / {questions.length} answered
                </span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2">
                <div
                  className="bg-white h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                Question {currentQuestion.questionNumber}
              </h2>
              <div className="flex gap-2 shrink-0">
                <Badge
                  variant="outline"
                  className="capitalize bg-blue-50 text-blue-700 border-blue-200"
                >
                  {currentQuestion.questionType}
                </Badge>
                <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-0">
                  {currentQuestion.points} pts
                </Badge>
              </div>
            </div>

            {currentQuestion.topic && (
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                <BookOpen className="w-4 h-4" />
                <span>{currentQuestion.topic}</span>
              </div>
            )}

            <div className="mb-6">
              <p className="text-lg text-gray-900 whitespace-pre-wrap leading-relaxed">
                {currentQuestion.questionText}
              </p>
            </div>

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
                          className={`flex items-center space-x-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                            answers[currentQuestion._id] === option
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                          }`}
                          onClick={() =>
                            handleAnswerChange(currentQuestion._id, option)
                          }
                        >
                          <RadioGroupItem value={option} id={`option-${idx}`} />
                          <Label
                            htmlFor={`option-${idx}`}
                            className="flex-1 cursor-pointer"
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
                  className="resize-none"
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
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-lg font-semibold focus:outline-none focus:border-blue-500"
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
                  className="font-mono text-sm resize-none"
                />
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
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
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              Next
            </Button>
          ) : (
            <Button
              onClick={() => setShowSubmitDialog(true)}
              disabled={submitting}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700"
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

        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Question Navigator
            </h3>
            <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2 mb-4">
              {questions.map((q, idx) => (
                <button
                  key={q._id}
                  onClick={() => setCurrentQuestionIndex(idx)}
                  className={`aspect-square rounded-lg font-semibold text-sm transition-all ${
                    idx === currentQuestionIndex
                      ? "bg-blue-600 text-white ring-2 ring-blue-600 ring-offset-2"
                      : answers[q._id]
                        ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border border-emerald-300"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-300"
                  }`}
                >
                  {q.questionNumber}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-600 rounded"></div>
                <span>Current</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-emerald-100 border border-emerald-300 rounded"></div>
                <span>Answered</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-100 border border-gray-300 rounded"></div>
                <span>Not Answered</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-emerald-100 p-2 rounded-full">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              </div>
              <AlertDialogTitle className="text-xl">
                Submit Assessment?
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription asChild>
              <div className="space-y-3 text-base">
                <p className="text-gray-600">
                  You have answered{" "}
                  <span className="font-semibold text-gray-900">
                    {answeredCount}
                  </span>{" "}
                  out of{" "}
                  <span className="font-semibold text-gray-900">
                    {questions.length}
                  </span>{" "}
                  questions.
                </p>
                {answeredCount < questions.length && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <p className="text-amber-800 text-sm font-medium flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                      <span>
                        You have {questions.length - answeredCount} unanswered
                        question
                        {questions.length - answeredCount !== 1 ? "s" : ""}.
                      </span>
                    </p>
                  </div>
                )}
                <p className="text-gray-600">
                  Time spent:{" "}
                  <span className="font-semibold text-gray-900">
                    {formatTime(timeElapsed)}
                  </span>
                </p>
                <p className="text-gray-900 font-medium">
                  Once submitted, you cannot change your answers.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={submitting}>
              Review Answers
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSubmit}
              disabled={submitting}
              className="bg-emerald-600 hover:bg-emerald-700"
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

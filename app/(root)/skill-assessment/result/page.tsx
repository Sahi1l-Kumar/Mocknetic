"use client";

import ROUTES from "@/constants/routes";
import {
  TrendingUp,
  RotateCcw,
  Home,
  ExternalLink,
  CheckCircle,
  XCircle,
  FileText,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Target,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AssessmentResult() {
  const router = useRouter();
  const [results, setResults] = useState<any>(null);
  const [jobRole, setJobRole] = useState("");
  const [loading, setLoading] = useState(true);
  const [expandedQuestions, setExpandedQuestions] = useState<Set<number>>(
    new Set()
  );
  const [showAllQuestions, setShowAllQuestions] = useState(false);

  useEffect(() => {
    const storedResults = localStorage.getItem("assessmentResults");
    const storedJobRole = localStorage.getItem("assessmentJobRole");

    if (storedResults && storedJobRole) {
      setResults(JSON.parse(storedResults));
      setJobRole(storedJobRole);
      setLoading(false);
    } else {
      router.push(ROUTES.SKILL);
    }
  }, [router]);

  const toggleQuestion = (index: number) => {
    const newExpanded = new Set(expandedQuestions);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedQuestions(newExpanded);
  };

  const toggleAllQuestions = () => {
    if (showAllQuestions) {
      setExpandedQuestions(new Set());
    } else {
      const allIndices = results.questions.map((_: any, idx: number) => idx);
      setExpandedQuestions(new Set(allIndices));
    }
    setShowAllQuestions(!showAllQuestions);
  };

  const handleRetake = () => {
    localStorage.removeItem("assessmentResults");
    localStorage.removeItem("assessmentJobRole");
    router.push(ROUTES.SKILL);
  };

  const handleReset = () => {
    localStorage.removeItem("assessmentResults");
    localStorage.removeItem("assessmentJobRole");
    localStorage.removeItem("currentAssessmentId");
    router.push(ROUTES.SKILL);
  };

  if (loading || !results) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-slate-600">Loading results...</div>
      </div>
    );
  }

  const hasGaps = results.skillGaps.some((gap: any) => gap.gap > 0);

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-3">
            Assessment Complete
          </h1>
          <p className="text-lg text-slate-600">
            You scored{" "}
            <span className="font-semibold text-slate-900">
              {results.correctAnswers}
            </span>{" "}
            out of{" "}
            <span className="font-semibold text-slate-900">
              {results.totalQuestions}
            </span>{" "}
            questions correctly
          </p>
        </div>

        {/* Score Card */}
        <div className="bg-linear-to-br from-blue-600 to-indigo-700 rounded-2xl shadow-xl p-8 mb-12 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Overall Score</h2>
              <p className="text-blue-100 text-lg">
                For <span className="font-semibold">{jobRole}</span>
              </p>
            </div>
            <div className="text-center">
              <div className="text-6xl font-bold mb-2">
                {results.overallScore}%
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-1 text-sm font-medium">
                {results.overallScore >= 80
                  ? "Excellent"
                  : results.overallScore >= 60
                    ? "Good"
                    : "Needs Improvement"}
              </div>
            </div>
          </div>
        </div>

        {/* Skill Breakdown and Recommendations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Skill Breakdown */}
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <TrendingUp className="w-6 h-6 text-emerald-600" />
              <h3 className="text-xl font-bold text-slate-900">
                Skill Breakdown
              </h3>
            </div>

            <div className="space-y-6">
              {results.skillGaps.map((gap: any, index: number) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-slate-900">
                      {gap.skill}
                    </span>
                    <div className="text-right">
                      <div className="text-sm font-bold text-slate-900">
                        {gap.correctAnswers}/{gap.questionsAnswered}
                      </div>
                      <div className="text-xs text-slate-600">
                        {gap.accuracy}% correct
                      </div>
                    </div>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        gap.gap === 0
                          ? "bg-emerald-500"
                          : gap.gap < 30
                            ? "bg-yellow-500"
                            : "bg-orange-500"
                      }`}
                      style={{ width: `${100 - gap.gap}%` }}
                    />
                  </div>
                  {gap.gap > 0 && (
                    <p className="text-xs text-slate-600 mt-1">
                      {gap.gap}% gap to master
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Recommended Resources */}
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <BookOpen className="w-6 h-6 text-blue-600" />
              <h3 className="text-xl font-bold text-slate-900">
                {hasGaps ? "Recommended Resources" : "Keep Learning"}
              </h3>
            </div>

            {hasGaps ? (
              <div className="space-y-4">
                {results.recommendations.map((rec: any, index: number) => (
                  <div
                    key={index}
                    className="border border-slate-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-sm text-slate-900 flex-1">
                        {rec.title}
                      </h4>
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded font-medium ml-2 flex-shrink-0">
                        {rec.skill}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 mb-3">
                      {rec.description}
                    </p>
                    <a
                      href={rec.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-blue-600 text-sm font-medium hover:text-blue-700 transition-colors"
                    >
                      Learn More
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Target className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
                <h4 className="font-semibold text-slate-900 mb-2">
                  Perfect Score!
                </h4>
                <p className="text-slate-600 text-sm mb-4">
                  You have mastered all assessed skills for {jobRole}. Keep
                  learning advanced topics!
                </p>
                <a
                  href="https://www.coursera.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-blue-600 text-sm font-medium hover:text-blue-700 transition-colors"
                >
                  Explore Courses
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Question Review (Collapsible) */}
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <FileText className="w-6 h-6 text-purple-600" />
              <h3 className="text-xl font-bold text-slate-900">
                Detailed Question Review
              </h3>
            </div>
            <button
              onClick={toggleAllQuestions}
              className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium text-slate-700"
            >
              {showAllQuestions ? (
                <>
                  Collapse All <ChevronUp className="w-4 h-4" />
                </>
              ) : (
                <>
                  Expand All <ChevronDown className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          <div className="space-y-4">
            {results.questions?.map((q: any, index: number) => {
              const isMCQ = [
                "mcq",
                "pseudo_mcq",
                "aptitude",
                "reasoning",
              ].includes(q.questionType || "");
              const isExpanded = expandedQuestions.has(index);

              return (
                <div
                  key={q.questionId || index}
                  className={`border rounded-lg overflow-hidden transition-all ${
                    q.isCorrect === true
                      ? "border-emerald-300 bg-emerald-50"
                      : q.isCorrect === false
                        ? "border-red-300 bg-red-50"
                        : "border-slate-300 bg-slate-50"
                  }`}
                >
                  {/* Question Header */}
                  <button
                    onClick={() => toggleQuestion(index)}
                    className="w-full p-4 flex items-center justify-between hover:bg-white/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <span className="font-semibold text-slate-900">
                        Q{index + 1}
                      </span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                        {q.skill || "General"}
                      </span>
                      <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium capitalize">
                        {q.questionType?.replace("_", " ") || "Question"}
                      </span>
                      {q.isCorrect === true && (
                        <span className="flex items-center gap-1 text-emerald-600 text-sm font-medium">
                          <CheckCircle className="w-4 h-4" />
                          Correct
                        </span>
                      )}
                      {q.isCorrect === false && (
                        <span className="flex items-center gap-1 text-red-600 text-sm font-medium">
                          <XCircle className="w-4 h-4" />
                          Incorrect
                        </span>
                      )}
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-slate-500" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-500" />
                    )}
                  </button>

                  {/* Question Details */}
                  {isExpanded && (
                    <div className="px-4 pb-4 border-t border-slate-200">
                      <p className="text-slate-900 text-sm mb-4 mt-4">
                        {q.question}
                      </p>

                      {isMCQ ? (
                        <div className="space-y-2">
                          {q.options?.map(
                            (option: string, optIndex: number) => {
                              const optionNumber = optIndex + 1;
                              const isUserAnswer =
                                q.userAnswer === optionNumber;
                              const isCorrectAnswer =
                                q.correctAnswer === optionNumber;

                              return (
                                <div
                                  key={optIndex}
                                  className={`p-3 rounded-lg border ${
                                    isCorrectAnswer
                                      ? "border-emerald-500 bg-emerald-100"
                                      : isUserAnswer
                                        ? "border-red-500 bg-red-100"
                                        : "border-slate-200 bg-white"
                                  }`}
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      {isCorrectAnswer && (
                                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                                      )}
                                      {isUserAnswer && !isCorrectAnswer && (
                                        <XCircle className="w-4 h-4 text-red-600" />
                                      )}
                                      <span className="text-slate-900 text-sm">
                                        {option}
                                      </span>
                                    </div>
                                    {isCorrectAnswer && (
                                      <span className="text-xs text-emerald-700 font-medium bg-emerald-200 px-2 py-1 rounded">
                                        Correct Answer
                                      </span>
                                    )}
                                    {isUserAnswer && !isCorrectAnswer && (
                                      <span className="text-xs text-red-700 font-medium bg-red-200 px-2 py-1 rounded">
                                        Your Answer
                                      </span>
                                    )}
                                  </div>
                                </div>
                              );
                            }
                          )}
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="bg-white rounded-lg p-3 border border-slate-300">
                            <p className="text-xs text-slate-600 font-semibold mb-1 uppercase tracking-wide">
                              Your Answer
                            </p>
                            <p className="text-slate-900 text-sm">
                              {q.userAnswer || "No answer provided"}
                            </p>
                          </div>
                          {q.expectedAnswer && (
                            <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-300">
                              <p className="text-xs text-emerald-700 font-semibold mb-1 uppercase tracking-wide">
                                Correct Answer
                              </p>
                              <p className="text-slate-900 text-sm">
                                {q.expectedAnswer}
                              </p>
                            </div>
                          )}
                          {q.evaluationCriteria && (
                            <div className="bg-slate-100 rounded-lg p-3 border border-slate-300">
                              <p className="text-xs text-slate-700 font-semibold mb-1 uppercase tracking-wide">
                                Evaluation Criteria
                              </p>
                              <p className="text-slate-800 text-sm whitespace-pre-line">
                                {q.evaluationCriteria}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={handleRetake}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-lg"
          >
            <RotateCcw className="w-5 h-5" />
            Retake Assessment
          </button>

          <button
            onClick={handleReset}
            className="flex-1 bg-slate-600 hover:bg-slate-700 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-lg"
          >
            <Home className="w-5 h-5" />
            Back to Home
          </button>
        </div>
      </main>
    </div>
  );
}

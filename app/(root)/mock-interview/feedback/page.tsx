"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Award, TrendingUp, CheckCircle, AlertCircle } from "lucide-react";

interface FeedbackData {
  question_number: number;
  question: string;
  answer: string;
  overall_score: number;
  relevance: number;
  completeness: number;
  clarity: number;
  confidence: number;
  communication: number;
  strengths: string[];
  improvements: string[];
  feedback: string;
}

interface InterviewFeedback {
  average_score: number;
  total_questions: number;
  total_answers: number;
  feedback_list: FeedbackData[];
  session_id: string;
}

export default function FeedbackPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("sessionId");

  const [feedbackData, setFeedbackData] = useState<InterviewFeedback | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedQ, setExpandedQ] = useState<number | null>(null);

  const PYTHON_API =
    process.env.NEXT_PUBLIC_PYTHON_API || "http://localhost:5000";

  useEffect(() => {
    if (!sessionId) {
      setError("No session ID provided");
      setLoading(false);
      return;
    }

    const fetchFeedback = async () => {
      try {
        console.log(`📊 Fetching feedback for session: ${sessionId}`);
        const response = await fetch(
          `${PYTHON_API}/api/interview/feedback/${sessionId}`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("✅ Feedback received:", data);
        setFeedbackData(data);
        setError(null);
      } catch (err) {
        console.error("❌ Error fetching feedback:", err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch feedback"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchFeedback();
  }, [sessionId, PYTHON_API]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin mb-4">
            <Award className="w-12 h-12 text-blue-600 mx-auto" />
          </div>
          <p className="text-slate-600">Loading feedback...</p>
        </div>
      </div>
    );
  }

  if (error || !feedbackData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <p className="text-slate-600">{error || "Failed to load feedback"}</p>
          <button
            onClick={() => (window.location.href = "/")}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "bg-green-100 text-green-800 border-green-300";
    if (score >= 60) return "bg-blue-100 text-blue-800 border-blue-300";
    if (score >= 40) return "bg-yellow-100 text-yellow-800 border-yellow-300";
    return "bg-red-100 text-red-800 border-red-300";
  };

  const getScoreBadgeColor = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-blue-500";
    if (score >= 40) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return "Excellent";
    if (score >= 80) return "Very Good";
    if (score >= 70) return "Good";
    if (score >= 60) return "Fair";
    if (score >= 50) return "Needs Improvement";
    return "Poor";
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Award className="w-10 h-10 text-blue-600" />
            <h1 className="text-4xl font-bold text-slate-900">
              Interview Feedback Report
            </h1>
          </div>
          <p className="text-slate-600">
            Detailed analysis of your performance
          </p>
        </div>

        {/* Overall Score Card */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8 border-t-4 border-blue-600">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="mb-4">
                <div
                  className={`w-32 h-32 rounded-full flex items-center justify-center mx-auto ${getScoreBadgeColor(
                    feedbackData.average_score
                  )} text-white`}
                >
                  <div className="text-center">
                    <div className="text-5xl font-bold">
                      {Math.round(feedbackData.average_score)}
                    </div>
                    <div className="text-sm">/ 100</div>
                  </div>
                </div>
              </div>
              <h3 className="text-xl font-bold text-slate-800">
                {getScoreLabel(feedbackData.average_score)}
              </h3>
              <p className="text-sm text-slate-500 mt-2">Overall Performance</p>
            </div>

            <div>
              <h4 className="font-semibold text-slate-800 mb-4">Quick Stats</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Total Questions:</span>
                  <span className="font-semibold text-slate-900">
                    {feedbackData.total_questions}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Questions Answered:</span>
                  <span className="font-semibold text-slate-900">
                    {feedbackData.total_answers}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Session ID:</span>
                  <span className="font-mono text-xs text-slate-500">
                    {sessionId?.slice(0, 8)}...
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-slate-800 mb-4">
                Average Scores
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Relevance:</span>
                  <span className="font-semibold">
                    {(
                      feedbackData.feedback_list.reduce(
                        (sum, f) => sum + f.relevance,
                        0
                      ) / feedbackData.feedback_list.length
                    ).toFixed(1)}
                    /20
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Completeness:</span>
                  <span className="font-semibold">
                    {(
                      feedbackData.feedback_list.reduce(
                        (sum, f) => sum + f.completeness,
                        0
                      ) / feedbackData.feedback_list.length
                    ).toFixed(1)}
                    /20
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Clarity:</span>
                  <span className="font-semibold">
                    {(
                      feedbackData.feedback_list.reduce(
                        (sum, f) => sum + f.clarity,
                        0
                      ) / feedbackData.feedback_list.length
                    ).toFixed(1)}
                    /20
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Confidence:</span>
                  <span className="font-semibold">
                    {(
                      feedbackData.feedback_list.reduce(
                        (sum, f) => sum + f.confidence,
                        0
                      ) / feedbackData.feedback_list.length
                    ).toFixed(1)}
                    /20
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Communication:</span>
                  <span className="font-semibold">
                    {(
                      feedbackData.feedback_list.reduce(
                        (sum, f) => sum + f.communication,
                        0
                      ) / feedbackData.feedback_list.length
                    ).toFixed(1)}
                    /20
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Q&A Feedback */}
        <div className="space-y-4 mb-8">
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-blue-600" />
            Detailed Feedback
          </h2>

          {feedbackData.feedback_list.map((fb, idx) => (
            <div
              key={idx}
              className={`bg-white rounded-lg border-2 shadow-md overflow-hidden transition-all ${getScoreColor(
                fb.overall_score
              )}`}
            >
              <button
                onClick={() => setExpandedQ(expandedQ === idx ? null : idx)}
                className="w-full p-4 flex items-center justify-between hover:opacity-80 transition-opacity"
              >
                <div className="flex items-center gap-4 flex-1 text-left">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center ${getScoreBadgeColor(
                      fb.overall_score
                    )} text-white font-bold`}
                  >
                    {Math.round(fb.overall_score)}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900">
                      Question {fb.question_number}
                    </p>
                    <p className="text-sm text-slate-600 line-clamp-1">
                      {fb.question}
                    </p>
                  </div>
                </div>
                <div className="ml-4 text-slate-900">
                  {expandedQ === idx ? "▼" : "▶"}
                </div>
              </button>

              {expandedQ === idx && (
                <div className="bg-slate-50 border-t p-6 space-y-6">
                  {/* Question & Answer */}
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-2">
                      Question:
                    </h4>
                    <p className="text-slate-700 leading-relaxed bg-white p-3 rounded">
                      &quot;{fb.question}&quot;
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-slate-900 mb-2">
                      Your Answer:
                    </h4>
                    <p className="text-slate-700 leading-relaxed bg-white p-3 rounded">
                      &quot;{fb.answer}&quot;
                    </p>
                  </div>

                  {/* Detailed Scores */}
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-3">
                      Score Breakdown:
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                      {[
                        { label: "Relevance", score: fb.relevance },
                        { label: "Completeness", score: fb.completeness },
                        { label: "Clarity", score: fb.clarity },
                        { label: "Confidence", score: fb.confidence },
                        { label: "Communication", score: fb.communication },
                      ].map((item, i) => (
                        <div
                          key={i}
                          className="bg-white rounded p-3 border-2 border-slate-200 text-center"
                        >
                          <p className="text-xs text-slate-600 font-medium">
                            {item.label}
                          </p>
                          <p className="text-xl font-bold text-slate-900 mt-1">
                            {item.score}
                            <span className="text-xs text-slate-500">/20</span>
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Strengths */}
                  {fb.strengths && fb.strengths.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        Strengths:
                      </h4>
                      <ul className="space-y-1">
                        {fb.strengths.map((strength, i) => (
                          <li
                            key={i}
                            className="text-sm text-slate-700 flex items-start gap-2"
                          >
                            <span className="text-green-600 mt-1">✓</span>
                            <span>{strength}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Areas for Improvement */}
                  {fb.improvements && fb.improvements.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-amber-600" />
                        Areas for Improvement:
                      </h4>
                      <ul className="space-y-1">
                        {fb.improvements.map((improvement, i) => (
                          <li
                            key={i}
                            className="text-sm text-slate-700 flex items-start gap-2"
                          >
                            <span className="text-amber-600 mt-1">→</span>
                            <span>{improvement}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Feedback */}
                  {fb.feedback && (
                    <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded">
                      <p className="text-sm text-slate-700 font-medium">
                        Feedback:
                      </p>
                      <p className="text-sm text-slate-600 mt-2">
                        {fb.feedback}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => (window.location.href = "/")}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors shadow-md"
          >
            Start New Interview
          </button>
          <button
            onClick={() => window.print()}
            className="bg-slate-600 hover:bg-slate-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors shadow-md"
          >
            Download Report
          </button>
        </div>
      </div>
    </div>
  );
}

"use client";

import {
  ArrowRight,
  Clock,
  BookOpen,
  Target,
  Play,
  ChevronLeft,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { LoadingOverlay } from "@/components/Loader";
import { api } from "@/lib/api";

type QuestionType =
  | "mcq"
  | "pseudo_mcq"
  | "descriptive"
  | "aptitude"
  | "reasoning"
  | "circuit_math";

interface GeneratedQuestion {
  id: string;
  skill: string;
  questionType: QuestionType;
  question: string;
  options?: string[];
  correctAnswer?: number;
  difficulty: string;
  explanation?: string;
  expectedAnswer?: string;
  evaluationCriteria?: string;
  expectedKeywords?: string[];
}

interface Skill {
  id: string;
  name: string;
}

interface SessionResponse {
  user?: {
    id: string;
  };
}

interface UserSkillsResponse {
  success: boolean;
  data?: {
    skills?: string[];
  };
}

interface GenerateQuestionsResponse {
  success: boolean;
  data?: {
    questions?: GeneratedQuestion[];
    assessmentId?: string;
  };
  error?: {
    message?: string;
  };
}

interface SubmitAnswersResponse {
  success: boolean;
  data?: {
    score: number;
    correctAnswers: number;
    totalQuestions: number;
    questions: AssessmentQuestion[];
  };
  error?: string;
}

interface AssessmentQuestion {
  questionId: string;
  question: string;
  skill: string;
  questionType: QuestionType;
  options?: string[];
  userAnswer: number | string | null;
  correctAnswer?: number;
  expectedAnswer?: string;
  evaluationCriteria?: string;
  expectedKeywords?: string[];
  isCorrect: boolean;
}

interface SkillPerformance {
  skill: string;
  total: number;
  correct: number;
}

interface SkillGap {
  skill: string;
  gap: number;
  accuracy: number;
  questionsAnswered: number;
  correctAnswers: number;
}

interface Recommendation {
  title: string;
  description: string;
  link: string;
  skill: string;
}

interface RecommendationsResponse {
  success: boolean;
  data?: {
    recommendations: Recommendation[];
  };
}

type CurrentStep = "job-role" | "config" | "assessment";

const experienceLevels: readonly string[] = [
  "Entry Level",
  "Mid Level",
  "Senior Level",
  "Lead/Principal",
] as const;

const DIFFICULTY_LEVELS = ["beginner", "intermediate", "advanced"] as const;
type DifficultyLevel = (typeof DIFFICULTY_LEVELS)[number];

export default function SkillAssessmentClient() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<CurrentStep>("job-role");
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>("");

  const [jobRole, setJobRole] = useState<string>("");
  const [experienceLevel, setExperienceLevel] = useState<string>("");
  const [skills, setSkills] = useState<Skill[]>([]);

  const [difficulty, setDifficulty] = useState<DifficultyLevel>("intermediate");
  const [started, setStarted] = useState<boolean>(false);
  const [currentQuestion, setCurrentQuestion] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, number | string>>({});
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [textAnswer, setTextAnswer] = useState<string>("");
  const [timeRemaining, setTimeRemaining] = useState<number>(1800);
  const [questions, setQuestions] = useState<GeneratedQuestion[]>([]);

  const fetchUserSkills = useCallback(async (): Promise<void> => {
    setLoading(true);
    setLoadingMessage("Loading your skills...");

    try {
      const sessionResponse = await fetch("/api/auth/session");
      const session: SessionResponse = await sessionResponse.json();

      if (!session?.user?.id) {
        throw new Error("Not authenticated");
      }

      const response = (await api.users.getById(
        session.user.id,
      )) as UserSkillsResponse;

      if (response.success && response.data?.skills) {
        const skillList: Skill[] = response.data.skills.map(
          (skill: string, idx: number) => ({
            id: String(idx),
            name: skill,
          }),
        );
        setSkills(skillList);
      } else {
        throw new Error("No skills found");
      }
    } catch (error) {
      console.error("Error fetching skills:", error);
      setSkills([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const calculateResults = useCallback(
    async (answersToUse?: Record<string, number | string>): Promise<void> => {
      setLoading(true);
      setLoadingMessage("Submitting and analyzing your assessment...");

      try {
        const assessmentId = localStorage.getItem("currentAssessmentId");

        if (!assessmentId) {
          throw new Error("Assessment ID not found");
        }

        const finalAnswers = answersToUse || answers;

        if (Object.keys(finalAnswers).length < questions.length) {
          throw new Error(
            `Not all questions answered (${Object.keys(finalAnswers).length}/${questions.length})`,
          );
        }

        // Step 1: Submit answers to assessment
        const submitData = (await api.skillassessment.submitAnswers(
          assessmentId,
          finalAnswers,
        )) as SubmitAnswersResponse;

        if (!submitData.success) {
          throw new Error(submitData.error || "Failed to submit");
        }

        const {
          score,
          correctAnswers,
          totalQuestions,
          questions: dbQuestions,
        } = submitData.data!;

        // Step 2: Calculate skill performance
        const skillPerformance: Record<string, SkillPerformance> = {};

        dbQuestions.forEach((q: AssessmentQuestion) => {
          if (!skillPerformance[q.skill]) {
            skillPerformance[q.skill] = {
              skill: q.skill,
              total: 0,
              correct: 0,
            };
          }
          skillPerformance[q.skill].total += 1;
          if (q.isCorrect) {
            skillPerformance[q.skill].correct += 1;
          }
        });

        const skillGaps: SkillGap[] = Object.values(skillPerformance).map(
          (skill) => {
            const accuracy = Math.round((skill.correct / skill.total) * 100);
            const gap = Math.max(0, 100 - accuracy);

            return {
              skill: skill.skill,
              gap,
              accuracy,
              questionsAnswered: skill.total,
              correctAnswers: skill.correct,
            };
          },
        );

        const skillGapsSorted = skillGaps.sort((a, b) => b.gap - a.gap);

        // Step 3: Generate recommendations
        let recommendations: Recommendation[] = [];
        try {
          const weakSkills = skillGapsSorted
            .filter((gap) => gap.gap > 0)
            .slice(0, 3)
            .map((gap) => gap.skill);

          if (!jobRole || !experienceLevel) {
            console.error("Missing jobRole or experienceLevel!");
            throw new Error("Job role or experience level not set");
          }

          const recData = (await api.skillassessment.generateRecommendations({
            jobRole: jobRole,
            experienceLevel: experienceLevel,
            skillGaps: weakSkills.length > 0 ? weakSkills : [],
            overallScore: score,
          })) as RecommendationsResponse;

          if (recData.success && recData.data?.recommendations) {
            recommendations = recData.data.recommendations;
          } else {
            console.warn("No recommendations returned, using fallback");
            throw new Error("No recommendations in response");
          }
        } catch (error) {
          console.error("Error generating recommendations:", error);
          recommendations = [
            {
              title: "Continue Learning",
              description:
                "Keep improving your skills for " + (jobRole || "your career"),
              link: "https://www.coursera.org/",
              skill: jobRole || "General",
            },
          ];
        }

        // Step 4: Save result to SkillResult collection
        try {
          const saveResultResponse = await api.skillassessment.saveResult({
            assessmentId,
            jobRole: jobRole || "Unknown",
            difficulty,
            overallScore: score,
            correctAnswers,
            totalQuestions,
            skillGaps: skillGapsSorted,
            recommendations,
            questions: dbQuestions,
          });

          if (saveResultResponse.success && saveResultResponse.data) {
            // Get the result ID from response
            const resultData = saveResultResponse.data as { resultId: string };
            const resultId = resultData.resultId;

            // Clean up localStorage
            localStorage.removeItem("currentAssessmentId");
            // Redirect with result ID
            router.push(`/skill-assessment/result?id=${resultId}`);
          } else {
            throw new Error("Failed to save result to database");
          }
        } catch (saveError) {
          console.error("[RESULTS] Error saving result:", saveError);
          alert(
            "Failed to save assessment results. Please try again or contact support.",
          );
        }
      } catch (error) {
        console.error("Error calculating results:", error);
        alert(
          "Failed to calculate results: " +
            (error instanceof Error ? error.message : "Unknown error"),
        );
      } finally {
        setLoading(false);
      }
    },
    [answers, questions, jobRole, experienceLevel, difficulty, router],
  );

  const handleFinish = useCallback((): void => {
    calculateResults();
  }, [calculateResults]);

  useEffect(() => {
    if (currentStep === "job-role") {
      fetchUserSkills();
    }
  }, [currentStep, fetchUserSkills]);

  useEffect(() => {
    if (started && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (timeRemaining === 0 && started) {
      handleFinish();
    }
  }, [started, timeRemaining, handleFinish]);

  useEffect(() => {
    if (questions.length > 0) {
      setSelectedAnswer(null);
      setTextAnswer("");
    }
  }, [currentQuestion, questions.length]);

  const generateQuestions = useCallback(async (): Promise<void> => {
    setLoading(true);
    setLoadingMessage(
      "Generating personalized questions for " + jobRole + "...",
    );

    try {
      const response = (await api.skillassessment.generateQuestions(
        jobRole,
        difficulty,
        experienceLevel,
      )) as GenerateQuestionsResponse;

      if (
        response.success &&
        response.data?.questions &&
        response.data?.assessmentId
      ) {
        localStorage.setItem("currentAssessmentId", response.data.assessmentId);
        setQuestions(response.data.questions);
      } else {
        throw new Error(
          response?.error?.message || "Failed to generate questions",
        );
      }
    } catch (error) {
      console.error("Error generating questions:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to generate questions";
      alert("Error: " + errorMessage);
    } finally {
      setLoading(false);
    }
  }, [jobRole, difficulty, experienceLevel]);

  const getSkillColor = (name: string): string => {
    const colors: Record<string, string> = {
      JavaScript: "bg-yellow-500",
      Python: "bg-blue-600",
      React: "bg-cyan-400",
      "Node.js": "bg-green-600",
      SQL: "bg-blue-700",
      AWS: "bg-orange-500",
      Docker: "bg-blue-500",
      Git: "bg-red-600",
      Java: "bg-orange-600",
      "C++": "bg-red-500",
      TypeScript: "bg-blue-500",
      Kotlin: "bg-purple-500",
      Swift: "bg-orange-400",
      Rust: "bg-orange-700",
      Go: "bg-cyan-500",
      PHP: "bg-indigo-600",
      Ruby: "bg-red-700",
    };
    return colors[name] || "bg-gray-500";
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleJobRoleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    if (jobRole.trim() && experienceLevel) {
      setCurrentStep("config");
    }
  };

  const handleStart = async (): Promise<void> => {
    localStorage.removeItem("currentAssessmentId");
    localStorage.removeItem("assessmentResults");
    localStorage.removeItem("assessmentJobRole");
    setCurrentQuestion(0);
    setAnswers({});
    setSelectedAnswer(null);
    setTextAnswer("");
    setTimeRemaining(1800);

    await generateQuestions();
    setStarted(true);
    setCurrentStep("assessment");
  };

  const handleAnswerSelect = (answerIndex: number): void => {
    setSelectedAnswer(answerIndex);
  };

  const isMCQType = (type: QuestionType): boolean => {
    return ["mcq", "pseudo_mcq", "aptitude", "reasoning"].includes(type);
  };

  const handleNext = (): void => {
    const currentQ = questions[currentQuestion];
    const questionId = currentQ.id.toString();

    let answerValue: number | string;

    if (isMCQType(currentQ.questionType)) {
      if (selectedAnswer === null) {
        alert("Please select an answer");
        return;
      }
      answerValue = selectedAnswer + 1;
    } else {
      if (!textAnswer.trim()) {
        alert("Please provide an answer");
        return;
      }
      answerValue = textAnswer.trim();
    }

    const newAnswers = { ...answers };
    newAnswers[questionId] = answerValue;

    const isLastQuestion = currentQuestion === questions.length - 1;

    if (isLastQuestion) {
      calculateResults(newAnswers);
    } else {
      setAnswers(newAnswers);
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setTextAnswer("");
    }
  };

  if (loading) {
    return <LoadingOverlay message={loadingMessage} />;
  }

  if (currentStep === "job-role") {
    return (
      <div className="max-w-4xl mx-auto mt-3 px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            What are you aiming for?
          </h1>
          <p className="text-gray-600 text-lg">
            Tell us about your target role
          </p>
        </div>

        <form onSubmit={handleJobRoleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Target Job Role
            </label>
            <input
              type="text"
              value={jobRole}
              onChange={(e) => setJobRole(e.target.value)}
              placeholder="e.g., Full Stack Developer, Structural Engineer, Data Scientist"
              className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:outline-none focus:border-blue-500"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter ANY job role - from any B.Tech branch or custom position
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Experience Level
            </label>
            <select
              value={experienceLevel}
              onChange={(e) => setExperienceLevel(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 bg-white"
              required
            >
              <option value="">Select experience level</option>
              {experienceLevels.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </div>

          {skills.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                Your Current Skills
              </h3>
              <div className="flex flex-wrap gap-3">
                {skills.map((skill) => {
                  const color = getSkillColor(skill.name);
                  return (
                    <div
                      key={skill.id}
                      className={`${color} text-white rounded-full px-4 py-2 text-sm font-medium`}
                    >
                      {skill.name}
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-gray-500 mt-3">
                Assessment will be based on your target role, not current skills
              </p>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition"
            disabled={!jobRole.trim() || !experienceLevel}
          >
            Continue to Assessment
            <ArrowRight className="w-5 h-5" />
          </button>
        </form>
      </div>
    );
  }

  if (currentStep === "config") {
    return (
      <div className="max-w-4xl mx-auto px-4">
        <button
          onClick={() => setCurrentStep("job-role")}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 font-medium transition"
        >
          <ChevronLeft className="w-5 h-5" />
          Back
        </button>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Skill Assessment
          </h1>
          <p className="text-gray-600 text-lg">
            Personalized for:{" "}
            <span className="text-blue-600 font-semibold">{jobRole}</span>
          </p>
          <p className="text-gray-500 text-sm mt-2">
            Questions will test skills required for your target role
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            Select Difficulty Level
          </h3>

          <div className="mb-6">
            <div className="grid grid-cols-3 gap-4">
              {DIFFICULTY_LEVELS.map((level) => {
                const isSelected = difficulty === level;
                return (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setDifficulty(level)}
                    className={`py-3 px-4 rounded-lg border-2 font-medium capitalize transition ${
                      isSelected
                        ? "border-blue-600 bg-blue-50 text-blue-700"
                        : "border-gray-300 text-gray-700 hover:border-gray-400"
                    }`}
                  >
                    {level}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="border-t pt-6">
            <h4 className="font-semibold text-gray-800 mb-4">
              Assessment Details
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-start gap-3 bg-gray-50 p-4 rounded-lg">
                <Clock className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-gray-900">Duration</p>
                  <p className="text-sm text-gray-600">30 minutes</p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-gray-50 p-4 rounded-lg">
                <BookOpen className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-gray-900">Questions</p>
                  <p className="text-sm text-gray-600">AI-generated</p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-gray-50 p-4 rounded-lg">
                <Target className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-gray-900">Role-Based</p>
                  <p className="text-sm text-gray-600">Not current skills</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={handleStart}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-lg flex items-center justify-center gap-2 transition"
        >
          <Play className="w-5 h-5" />
          Start Assessment
        </button>
      </div>
    );
  }

  if (currentStep === "assessment" && questions.length > 0) {
    const question = questions[currentQuestion];
    const progress = ((currentQuestion + 1) / questions.length) * 100;
    const isMCQ = isMCQType(question.questionType);

    return (
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-600">
                Q {currentQuestion + 1}/{questions.length}
              </span>
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                {question.skill}
              </span>
              <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium capitalize">
                {question.questionType?.replace("_", " ") || "Question"}
              </span>
            </div>

            <div className="flex items-center gap-2 bg-red-50 px-4 py-2 rounded-lg">
              <Clock className="w-5 h-5 text-red-600" />
              <span className="font-mono font-semibold text-red-600">
                {formatTime(timeRemaining)}
              </span>
            </div>
          </div>

          <div className="mb-6">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {question.question}
            </h2>

            {isMCQ ? (
              <div className="space-y-3">
                {question.options?.map((option: string, index: number) => {
                  const isSelected = selectedAnswer === index;
                  return (
                    <button
                      key={index}
                      onClick={() => handleAnswerSelect(index)}
                      className={`w-full text-left p-4 rounded-lg border-2 transition ${
                        isSelected
                          ? "border-blue-600 bg-blue-50"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition ${
                            isSelected
                              ? "border-blue-600 bg-blue-600"
                              : "border-gray-400"
                          }`}
                        >
                          {isSelected && (
                            <div className="w-2 h-2 bg-white rounded-full" />
                          )}
                        </div>
                        <span className="font-medium text-gray-900">
                          {option}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div>
                {question.questionType === "descriptive" ? (
                  <>
                    <textarea
                      value={textAnswer}
                      onChange={(e) => setTextAnswer(e.target.value)}
                      placeholder="Write your answer here..."
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 min-h-[150px] resize-y"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Provide a detailed explanation or reasoning
                    </p>
                  </>
                ) : question.questionType === "circuit_math" ? (
                  <>
                    <input
                      type="text"
                      value={textAnswer}
                      onChange={(e) => setTextAnswer(e.target.value)}
                      placeholder="Enter your numerical answer"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Enter the numerical value or formula result
                    </p>
                  </>
                ) : (
                  <>
                    <textarea
                      value={textAnswer}
                      onChange={(e) => setTextAnswer(e.target.value)}
                      placeholder="Write your answer here..."
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 min-h-[150px] resize-y"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Provide your answer
                    </p>
                  </>
                )}
              </div>
            )}
          </div>

          <button
            onClick={handleNext}
            disabled={isMCQ ? selectedAnswer === null : !textAnswer.trim()}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-semibold py-3 rounded-lg transition disabled:cursor-not-allowed"
          >
            {currentQuestion < questions.length - 1
              ? "Next Question"
              : "Finish"}
          </button>
        </div>
      </div>
    );
  }

  return null;
}

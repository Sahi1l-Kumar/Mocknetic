"use client";

import {
  ArrowRight,
  Clock,
  BookOpen,
  Target,
  Play,
  ChevronLeft,
  TrendingUp,
  RotateCcw,
  Home,
  Save,
  ExternalLink,
} from "lucide-react";
import { useState, useEffect } from "react";
import { LoadingOverlay } from "@/components/Loader";
import { api } from "@/lib/api";

const experienceLevels = [
  "Entry Level",
  "Mid Level",
  "Senior Level",
  "Lead/Principal",
];

export default function SkillGapAssessment() {
  const [currentStep, setCurrentStep] = useState("job-role");
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");

  const [jobRole, setJobRole] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("");
  const [skills, setSkills] = useState([]);

  const [difficulty, setDifficulty] = useState("intermediate");
  const [started, setStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(1800);
  const [questions, setQuestions] = useState([]);

  const [results, setResults] = useState(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (currentStep === "job-role") {
      fetchUserSkills();
    }
  }, [currentStep]);

  useEffect(() => {
    if (started && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (timeRemaining === 0 && started) {
      handleFinish();
    }
  }, [started, timeRemaining]);

  const fetchUserSkills = async () => {
    setLoading(true);
    setLoadingMessage("Loading your skills...");

    try {
      const sessionResponse = await fetch("/api/auth/session");
      const session = await sessionResponse.json();

      if (!session?.user?.id) {
        throw new Error("Not authenticated");
      }

      const response = await api.users.getById(session.user.id);

      if (response.success && response.data?.skills) {
        const skillList = response.data.skills.map((skill, idx) => ({
          id: String(idx),
          name: skill,
        }));
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
  };

  const generateQuestions = async () => {
    setLoading(true);
    setLoadingMessage(
      "Generating personalized questions for " + jobRole + "..."
    );

    try {
      console.log("📤 Calling generateQuestions with:", {
        jobRole,
        difficulty,
        experienceLevel,
      });

      const response = await api.assessment.generateQuestions(
        jobRole,
        difficulty,
        experienceLevel
      );

      console.log("✅ Questions response:", response);

      if (
        response.success &&
        response.data?.questions &&
        response.data?.assessmentId
      ) {
        console.log(`✅ Generated ${response.data.questions.length} questions`);
        console.log(`💾 Assessment ID: ${response.data.assessmentId}`);

        // ✅ VALIDATE: Verify all questions have ID field
        console.log("🔍 Validating questions structure:");
        response.data.questions.forEach((q: any, idx: number) => {
          console.log(
            `   Q${idx + 1}: id="${q.id}" (type: ${typeof q.id}), skill="${q.skill}"`
          );
        });

        const allHaveIds = response.data.questions.every((q: any) => q.id);
        if (!allHaveIds) {
          throw new Error(
            "⚠️ Some questions missing ID field from backend - check API response"
          );
        }

        const allHaveCorrectAnswers = response.data.questions.every(
          (q: any) => typeof q.correctAnswer === "number"
        );
        if (!allHaveCorrectAnswers) {
          console.warn("⚠️ Some questions missing correctAnswer field");
        }

        // Store assessment ID for later submission
        localStorage.setItem("currentAssessmentId", response.data.assessmentId);
        console.log("✅ Assessment ID stored in localStorage");

        setQuestions(response.data.questions);
      } else {
        throw new Error(
          response?.error?.message || "Failed to generate questions"
        );
      }
    } catch (error) {
      console.error("❌ Error generating questions:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to generate questions";
      alert("❌ " + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const calculateResults = async (answersToUse?: Record<string, number>) => {
    setLoading(true);
    setLoadingMessage("Submitting and analyzing your assessment...");

    try {
      // Get assessment ID from storage
      const assessmentId = localStorage.getItem("currentAssessmentId");

      if (!assessmentId) {
        throw new Error("Assessment ID not found in localStorage");
      }

      // ✅ Use passed-in answers or fall back to state
      const finalAnswers = answersToUse || answers;

      console.log("📤 Preparing submission...");
      console.log("assessmentId:", assessmentId);
      console.log("Total questions:", questions.length);
      console.log("Answered questions:", Object.keys(finalAnswers).length);
      console.log("answers object:", finalAnswers);
      console.log("answers keys:", Object.keys(finalAnswers));
      console.log("answers values:", Object.values(finalAnswers));

      // ✅ VALIDATE: All questions answered
      if (Object.keys(finalAnswers).length < questions.length) {
        throw new Error(
          `⚠️ Not all questions answered (${Object.keys(finalAnswers).length}/${questions.length})`
        );
      }

      // ✅ VALIDATE: All answer values are numbers
      const allNumbers = Object.values(finalAnswers).every(
        (v) => typeof v === "number"
      );
      if (!allNumbers) {
        throw new Error("❌ Some answers are not numbers");
      }

      // ✅ VALIDATE: All answers are in valid range (0-3)
      const allInRange = Object.values(finalAnswers).every(
        (v) => v >= 0 && v <= 3
      );
      if (!allInRange) {
        throw new Error("❌ Some answers are out of valid range (0-3)");
      }

      console.log("✅ All validation checks passed");

      // Build the exact payload that will be sent
      const payload = {
        assessmentId,
        answers: finalAnswers, // ✅ Use finalAnswers here
      };

      console.log(
        "📨 Final payload being sent:",
        JSON.stringify(payload, null, 2)
      );

      // Call backend to calculate score from DB
      const response = await fetch("/api/assessment/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const submitData = await response.json();

      console.log("📥 Backend response:", submitData);

      if (!submitData.success) {
        console.error("❌ Backend error:", submitData.error);
        throw new Error(submitData.error || "Failed to submit");
      }

      console.log("✅ Submission successful:", submitData.data);

      const {
        score,
        correctAnswers,
        totalQuestions,
        questions: dbQuestions,
      } = submitData.data;

      console.log(
        `📊 Score breakdown: ${correctAnswers}/${totalQuestions} = ${score}%`
      );

      // Calculate skill performance from DB results
      const skillPerformance: Record<
        string,
        { skill: string; total: number; correct: number }
      > = {};

      dbQuestions.forEach((q: any) => {
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

      // Convert to skill gaps
      const skillGaps = Object.values(skillPerformance).map((skill) => {
        const accuracy = Math.round((skill.correct / skill.total) * 100);
        const gap = Math.max(0, 100 - accuracy);

        return {
          skill: skill.skill,
          gap,
          accuracy,
          questionsAnswered: skill.total,
          correctAnswers: skill.correct,
        };
      });

      const skillGapsSorted = skillGaps.sort((a, b) => b.gap - a.gap);

      // Generate AI recommendations
      let recommendations = [];
      try {
        console.log("📤 Generating recommendations...");

        const weakSkills = skillGapsSorted
          .filter((gap) => gap.gap > 0)
          .slice(0, 3)
          .map((gap) => gap.skill);

        if (weakSkills.length > 0) {
          console.log("🎓 Weak skills found:", weakSkills);

          const recResponse = await fetch(
            "/api/assessment/generate-recommendations",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                jobRole,
                experienceLevel,
                skillGaps: weakSkills,
                overallScore: score,
              }),
            }
          );

          const recData = await recResponse.json();

          if (recData.success && recData.data?.recommendations) {
            recommendations = recData.data.recommendations;
            console.log(
              `✅ Generated ${recommendations.length} recommendations`
            );
          }
        } else {
          console.log("🎉 No weak skills, generating advanced recommendations");

          const recResponse = await fetch(
            "/api/assessment/generate-recommendations",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                jobRole,
                experienceLevel,
                skillGaps: [],
                overallScore: score,
              }),
            }
          );

          const recData = await recResponse.json();

          if (recData.success && recData.data?.recommendations) {
            recommendations = recData.data.recommendations;
            console.log(
              `✅ Generated ${recommendations.length} advanced recommendations`
            );
          }
        }
      } catch (error) {
        console.error("⚠️ Error generating recommendations:", error);
        // Use fallback recommendations
        recommendations = [
          {
            title: "Continue Learning",
            description: "Keep improving your skills for " + jobRole,
            link: "https://www.coursera.org/",
            skill: jobRole,
          },
        ];
      }

      const results = {
        skillGaps: skillGapsSorted,
        overallScore: score,
        totalQuestions,
        correctAnswers,
        recommendations,
        completedAt: new Date().toISOString(),
      };

      setResults(results);
      setCurrentStep("results");

      // Clear assessment ID from storage
      localStorage.removeItem("currentAssessmentId");
      console.log("✅ Assessment completed successfully");
    } catch (error) {
      console.error("Error calculating results:", error);
      alert(
        "Failed to calculate results: " +
          (error instanceof Error ? error.message : "Unknown error")
      );
    } finally {
      setLoading(false);
    }
  };

  const getSkillColor = (name: string) => {
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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleJobRoleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (jobRole.trim() && experienceLevel) {
      setCurrentStep("config");
    }
  };

  const handleStart = async () => {
    // Clear old assessment ID
    localStorage.removeItem("currentAssessmentId");

    // Reset state before generating new questions
    setCurrentQuestion(0);
    setAnswers({});
    setSelectedAnswer(null);
    setTimeRemaining(1800);
    setResults(null);

    await generateQuestions();
    setStarted(true);
    setCurrentStep("assessment");
  };

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
  };

  const handleNext = () => {
    if (selectedAnswer !== null) {
      // ✅ STEP 1: Save the current answer
      const currentQ = questions[currentQuestion];
      const questionId = currentQ.id.toString();

      console.log(
        `📝 Q${currentQuestion + 1}: Storing answer for questionId="${questionId}", answer=${selectedAnswer}`
      );

      const newAnswers = { ...answers };
      newAnswers[questionId] = selectedAnswer;

      // ✅ IMPORTANT: Don't call setAnswers here yet if it's the last question
      // We'll pass newAnswers directly to calculateResults()

      setSelectedAnswer(null);

      // ✅ STEP 2: Check if this is the last question
      const isLastQuestion = currentQuestion === questions.length - 1;

      console.log(
        `   Current: ${currentQuestion}, Total: ${questions.length}, IsLast: ${isLastQuestion}`
      );

      if (isLastQuestion) {
        // Last question - submit now with newAnswers
        console.log("✅ Last question answered. Submitting assessment...");
        console.log("📊 Final answers object:", newAnswers);

        // ✅ Pass newAnswers to calculateResults() so it gets the updated answers
        calculateResults(newAnswers);
      } else {
        // Not last question - update state and go to next
        setAnswers(newAnswers);
        setCurrentQuestion(currentQuestion + 1);
      }
    }
  };

  const handleFinish = () => {
    // ✅ This is now only called if time runs out
    console.log("⏰ Time expired, submitting...");
    calculateResults();
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleRetake = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setSelectedAnswer(null);
    setTimeRemaining(1800);
    setStarted(false);
    setCurrentStep("config");
  };

  const handleReset = () => {
    localStorage.removeItem("currentAssessmentId");
    setCurrentStep("job-role");
    setJobRole("");
    setExperienceLevel("");
    setCurrentQuestion(0);
    setAnswers({});
    setSelectedAnswer(null);
    setTimeRemaining(1800);
    setStarted(false);
    setResults(null);
    setSkills([]);
  };

  if (loading) {
    return <LoadingOverlay message={loadingMessage} />;
  }

  // Step 1: Job Role Selection
  if (currentStep === "job-role") {
    return (
      <div className="max-w-4xl mx-auto">
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
              placeholder="e.g., Full Stack Developer, Structural Engineer, Data Scientist, Founding Engineer"
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
                Assessment will be based on your target role, not your current
                skills
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

  // Step 2: Configuration
  if (currentStep === "config") {
    return (
      <div className="max-w-4xl mx-auto">
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
              {["beginner", "intermediate", "advanced"].map((level) => {
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
                <Clock className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-900">Duration</p>
                  <p className="text-sm text-gray-600">30 minutes</p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-gray-50 p-4 rounded-lg">
                <BookOpen className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-900">Questions</p>
                  <p className="text-sm text-gray-600">5 AI-generated</p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-gray-50 p-4 rounded-lg">
                <Target className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-900">Role-Based</p>
                  <p className="text-sm text-gray-600">
                    Not your current skills
                  </p>
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

  // Step 3: Assessment
  if (currentStep === "assessment" && questions.length > 0) {
    const question = questions[currentQuestion];
    const progress = ((currentQuestion + 1) / questions.length) * 100;

    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-600">
                Q {currentQuestion + 1}/{questions.length}
              </span>
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                {question.skill}
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

            <div className="space-y-3">
              {question.options.map((option: string, index: number) => {
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
          </div>

          <button
            onClick={handleNext}
            disabled={selectedAnswer === null}
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

  // Step 4: Results
  if (currentStep === "results" && results) {
    const hasGaps = results.skillGaps.some((gap: any) => gap.gap > 0);

    return (
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Assessment Complete
          </h1>
          <p className="text-gray-600 text-lg">
            You scored {results.correctAnswers} out of {results.totalQuestions}{" "}
            correct
          </p>
        </div>

        {/* Overall Score */}
        <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl shadow-lg p-8 mb-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Overall Score</h2>
              <p className="text-blue-100">
                For <span className="font-semibold">{jobRole}</span>
              </p>
            </div>
            <div className="text-center">
              <div className="text-6xl font-bold mb-2">
                {results.overallScore}%
              </div>
              <div className="bg-white bg-opacity-20 rounded-full px-4 py-1 text-sm font-medium">
                {results.overallScore >= 80
                  ? "Excellent"
                  : results.overallScore >= 60
                    ? "Good"
                    : "Needs Work"}
              </div>
            </div>
          </div>
        </div>

        {/* Skill Breakdown and Recommendations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Skill Breakdown */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-green-600" />
              Skill Breakdown
            </h3>

            <div className="space-y-4">
              {results.skillGaps.map((gap: any, index: number) => (
                <div key={index} className="border-l-4 border-blue-200 pl-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-gray-900">
                      {gap.skill}
                    </span>
                    <div className="text-right">
                      <div className="text-sm font-bold text-gray-900">
                        {gap.correctAnswers}/{gap.questionsAnswered}
                      </div>
                      <div className="text-xs text-gray-600">
                        {gap.accuracy}% correct
                      </div>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        gap.gap === 0
                          ? "bg-green-500"
                          : gap.gap < 30
                            ? "bg-yellow-500"
                            : "bg-orange-500"
                      }`}
                      style={{ width: `${100 - gap.gap}%` }}
                    />
                  </div>
                  {gap.gap > 0 && (
                    <p className="text-xs text-orange-600">
                      {gap.gap}% gap to master
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-blue-600" />
              {hasGaps ? "Recommended Resources" : "Keep Learning"}
            </h3>

            {hasGaps ? (
              <div className="space-y-4">
                {results.recommendations.map((rec: any, index: number) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-sm text-gray-900 flex-1">
                        {rec.title}
                      </h4>
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded font-medium ml-2 flex-shrink-0">
                        {rec.skill}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      {rec.description}
                    </p>
                    <a
                      href={rec.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-blue-600 text-sm font-medium hover:text-blue-700 transition"
                    >
                      Learn More
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-4" />
                <h4 className="font-semibold text-gray-900 mb-2">
                  Perfect Score!
                </h4>
                <p className="text-gray-600 text-sm mb-4">
                  You have mastered all the assessed skills for {jobRole}.
                  Continue learning and explore advanced topics.
                </p>
                <a
                  href="https://www.coursera.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-blue-600 text-sm font-medium hover:text-blue-700 transition"
                >
                  Explore Courses
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4">
          <button
            onClick={handleSave}
            className="flex-1 min-w-[200px] bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition"
          >
            <Save className="w-5 h-5" />
            {saved ? "Saved!" : "Save Results"}
          </button>

          <button
            onClick={handleRetake}
            className="flex-1 min-w-[200px] bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition"
          >
            <RotateCcw className="w-5 h-5" />
            Retake Assessment
          </button>

          <button
            onClick={handleReset}
            className="flex-1 min-w-[200px] bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition"
          >
            <Home className="w-5 h-5" />
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return null;
}

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
  const [answers, setAnswers] = useState({});
  const [selectedAnswer, setSelectedAnswer] = useState(null);
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
          level: "Intermediate",
          icon: skill.substring(0, 2).toUpperCase(),
        }));
        setSkills(skillList);
      } else {
        throw new Error("No skills found");
      }
    } catch (error) {
      console.error("Error fetching skills:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateQuestions = async () => {
    setLoading(true);
    setLoadingMessage("Generating personalized questions...");

    try {
      const response = await api.assessment.generateQuestions(
        jobRole,
        difficulty,
        experienceLevel
      );

      if (response.success && response.data?.questions) {
        setQuestions(response.data.questions);
      } else {
        throw new Error("Failed to generate questions");
      }
    } catch (error) {
      console.error("Error generating questions:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateResults = async () => {
    setLoading(true);
    setLoadingMessage("Analyzing your assessment...");

    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Calculate overall score
    const totalQuestions = questions.length;
    const correctAnswers = Object.entries(answers).reduce(
      (count, [qId, userAnswer]) => {
        const question = questions.find((q) => q.id === qId);
        return question && question.correctAnswer === userAnswer
          ? count + 1
          : count;
      },
      0
    );

    const overallScore = Math.round((correctAnswers / totalQuestions) * 100);

    // Calculate skill-based gaps
    const skillPerformance = {};

    questions.forEach((question) => {
      const userAnswer = answers[question.id];
      const isCorrect = userAnswer === question.correctAnswer;

      if (!skillPerformance[question.skill]) {
        skillPerformance[question.skill] = {
          skill: question.skill,
          total: 0,
          correct: 0,
          difficulty: question.difficulty,
        };
      }

      skillPerformance[question.skill].total += 1;
      if (isCorrect) {
        skillPerformance[question.skill].correct += 1;
      }
    });

    // Convert to skill gaps
    const skillGaps = Object.values(skillPerformance).map((skill) => {
      const accuracy = Math.round((skill.correct / skill.total) * 100);
      const gap = Math.max(0, 100 - accuracy);

      let currentLevel = "Beginner";
      let requiredLevel = "Advanced";

      if (accuracy >= 80) currentLevel = "Advanced";
      else if (accuracy >= 60) currentLevel = "Intermediate";

      if (skill.difficulty === "beginner") requiredLevel = "Beginner";
      else if (skill.difficulty === "intermediate")
        requiredLevel = "Intermediate";

      return {
        skill: skill.skill,
        currentLevel,
        requiredLevel,
        gap,
        accuracy,
        questionsAnswered: skill.total,
        correctAnswers: skill.correct,
      };
    });

    const skillGapsSorted = skillGaps.sort((a, b) => b.gap - a.gap);

    const recommendations = skillGapsSorted
      .filter((gap) => gap.gap > 0)
      .slice(0, 3)
      .map((gap) => {
        const skillName = gap.skill;
        const resources = {
          JavaScript: {
            title: "JavaScript Mastery Course",
            description:
              "Deep dive into JavaScript fundamentals and advanced concepts",
            link: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/",
          },
          React: {
            title: "React Advanced Patterns",
            description:
              "Master React hooks, performance optimization, and state management",
            link: "https://react.dev/learn",
          },
          "Node.js": {
            title: "Node.js Backend Development",
            description:
              "Learn asynchronous programming, Express.js, and API design",
            link: "https://nodejs.org/en/docs/",
          },
          Python: {
            title: "Python Programming Guide",
            description:
              "Master Python data structures, OOP, and best practices",
            link: "https://docs.python.org/3/",
          },
          SQL: {
            title: "SQL Query Optimization",
            description:
              "Advanced SQL techniques, indexing, and database design",
            link: "https://www.postgresql.org/docs/",
          },
          default: {
            title: `Master ${skillName}`,
            description: `Comprehensive guide to improve your ${skillName} skills from ${gap.currentLevel} to ${gap.requiredLevel}`,
            link: "https://www.coursera.org/",
          },
        };

        const resource = resources[skillName] || resources.default;

        return {
          title: resource.title,
          description: resource.description,
          link: resource.link,
          skill: skillName,
          gap: gap.gap,
        };
      });

    if (recommendations.length === 0) {
      recommendations.push({
        title: "Advanced System Design",
        description: `Congratulations on mastering these skills! Now explore system design and architecture for ${jobRole}`,
        link: "https://www.coursera.org/",
        skill: jobRole,
        gap: 0,
      });
    }

    const results = {
      skillGaps: skillGapsSorted,
      overallScore,
      totalQuestions,
      correctAnswers,
      recommendations,
      completedAt: new Date().toISOString(),
    };

    setResults(results);
    setLoading(false);
    setCurrentStep("results");
  };

  const getSkillColor = (name) => {
    const colors = {
      JavaScript: "bg-yellow-500",
      Python: "bg-blue-600",
      React: "bg-cyan-400",
      "Node.js": "bg-green-600",
      SQL: "bg-blue-700",
      AWS: "bg-orange-500",
      Docker: "bg-blue-500",
      Git: "bg-red-600",
    };
    return colors[name] || "bg-gray-500";
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleJobRoleSubmit = (e) => {
    e.preventDefault();
    if (jobRole && experienceLevel) {
      setCurrentStep("config");
    }
  };

  const handleStart = async () => {
    await generateQuestions();
    setStarted(true);
    setCurrentStep("assessment");
  };

  const handleAnswerSelect = (answerIndex) => {
    setSelectedAnswer(answerIndex);
  };

  const handleNext = () => {
    if (selectedAnswer !== null) {
      const questionId = questions[currentQuestion].id;
      const newAnswers = { ...answers };
      newAnswers[questionId] = selectedAnswer;
      setAnswers(newAnswers);
      setSelectedAnswer(null);

      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
      } else {
        handleFinish();
      }
    }
  };

  const handleFinish = () => {
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
    setCurrentStep("job-role");
    setJobRole("");
    setExperienceLevel("");
    setCurrentQuestion(0);
    setAnswers({});
    setSelectedAnswer(null);
    setTimeRemaining(1800);
    setStarted(false);
    setResults(null);
  };

  if (loading) {
    return <LoadingOverlay message={loadingMessage} />;
  }

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
              placeholder="e.g., Full Stack Developer"
              className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:outline-none focus:border-blue-500"
              required
            />
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

          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Your Current Skills
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {skills.map((skill) => {
                const color = getSkillColor(skill.name);
                return (
                  <div
                    key={skill.id}
                    className={`${color} rounded-lg p-4 text-white`}
                  >
                    <div className="font-bold text-lg">{skill.name}</div>
                    <div className="text-sm opacity-90">{skill.level}</div>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50"
            disabled={!jobRole || !experienceLevel}
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
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => setCurrentStep("job-role")}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 font-medium"
        >
          <ChevronLeft className="w-5 h-5" />
          Back
        </button>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Skill Assessment
          </h1>
          <p className="text-gray-600 text-lg">AI-generated for {jobRole}</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            Configuration
          </h3>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Difficulty Level
            </label>
            <div className="grid grid-cols-3 gap-4">
              {["beginner", "intermediate", "advanced"].map((level) => {
                const isSelected = difficulty === level;
                return (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setDifficulty(level)}
                    className={`py-3 px-4 rounded-lg border-2 font-medium capitalize ${
                      isSelected
                        ? "border-blue-600 bg-blue-50 text-blue-700"
                        : "border-gray-300 text-gray-700"
                    }`}
                  >
                    {level}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="border-t pt-6">
            <h4 className="font-semibold text-gray-800 mb-4">Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-start gap-3 bg-gray-50 p-4 rounded-lg">
                <Clock className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">Duration</p>
                  <p className="text-sm text-gray-600">30 min</p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-gray-50 p-4 rounded-lg">
                <BookOpen className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">Questions</p>
                  <p className="text-sm text-gray-600">5 AI</p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-gray-50 p-4 rounded-lg">
                <Target className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">Personalized</p>
                  <p className="text-sm text-gray-600">Your profile</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={handleStart}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-lg flex items-center justify-center gap-2"
        >
          <Play className="w-5 h-5" />
          Start
        </button>
      </div>
    );
  }

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
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
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
                className="bg-blue-600 h-2 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {question.question}
            </h2>

            <div className="space-y-3">
              {question.options.map((option, index) => {
                const isSelected = selectedAnswer === index;
                return (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    className={`w-full text-left p-4 rounded-lg border-2 ${
                      isSelected
                        ? "border-blue-600 bg-blue-50"
                        : "border-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          isSelected
                            ? "border-blue-600 bg-blue-600"
                            : "border-gray-400"
                        }`}
                      >
                        {isSelected && (
                          <div className="w-2 h-2 bg-white rounded-full" />
                        )}
                      </div>
                      <span className="font-medium">{option}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <button
            onClick={handleNext}
            disabled={selectedAnswer === null}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-semibold py-3 rounded-lg"
          >
            {currentQuestion < questions.length - 1 ? "Next" : "Finish"}
          </button>
        </div>
      </div>
    );
  }

  if (currentStep === "results" && results) {
    const hasGaps = results.skillGaps.some((gap) => gap.gap > 0);

    return (
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Results</h1>
          <p className="text-gray-600 text-lg">
            You scored {results.correctAnswers} out of {results.totalQuestions}{" "}
            correct
          </p>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl shadow-lg p-8 mb-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Overall Score</h2>
              <p className="text-blue-100">Assessment performance</p>
            </div>
            <div className="text-center">
              <div className="text-6xl font-bold mb-2">
                {results.overallScore}%
              </div>
              <div className="bg-white bg-opacity-20 rounded-full px-4 py-1 text-sm">
                {results.overallScore >= 80
                  ? "Excellent"
                  : results.overallScore >= 60
                    ? "Good"
                    : "Needs Work"}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-green-600" />
              Skill Breakdown
            </h3>

            <div className="space-y-4">
              {results.skillGaps.map((gap, index) => (
                <div key={index} className="border-l-4 border-gray-200 pl-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold">{gap.skill}</span>
                    <div className="text-right">
                      <div className="text-sm font-bold text-gray-900">
                        {gap.correctAnswers}/{gap.questionsAnswered}
                      </div>
                      <div className="text-xs text-gray-600">
                        {gap.accuracy}% correct
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 text-sm text-gray-600 mb-2">
                    <span>{gap.currentLevel}</span>
                    <span>→</span>
                    <span>{gap.requiredLevel}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
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
                    <p className="text-xs text-orange-600 mt-1">
                      {gap.gap}% gap to master
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-blue-600" />
              {hasGaps ? "Recommended Resources" : "Keep Learning"}
            </h3>

            {hasGaps ? (
              <div className="space-y-4">
                {results.recommendations.map((rec, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex justify-between mb-2">
                      <h4 className="font-semibold text-sm">{rec.title}</h4>
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
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
                      className="inline-flex items-center gap-1 text-blue-600 text-sm font-medium"
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
                  You mastered all the skills. Continue learning advanced
                  topics.
                </p>
                <a
                  href="https://www.coursera.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-blue-600 text-sm font-medium"
                >
                  Explore Advanced Courses
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-4">
          <button
            onClick={handleSave}
            className="flex-1 min-w-[200px] bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2"
          >
            <Save className="w-5 h-5" />
            {saved ? "Saved!" : "Save Results"}
          </button>

          <button
            onClick={handleRetake}
            className="flex-1 min-w-[200px] bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-5 h-5" />
            Retake Assessment
          </button>

          <button
            onClick={handleReset}
            className="flex-1 min-w-[200px] bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2"
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

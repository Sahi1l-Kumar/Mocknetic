"use client";

import ROUTES from "@/constants/routes";
import {
  Target,
  MessageSquare,
  CheckCircle2,
  Sparkles,
  Zap,
  UserPlus,
  Code2,
  GraduationCap,
  ArrowRight,
  BookOpen,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import { JoinClassroomResponse } from "@/types/global";

function App() {
  const { status } = useSession();
  const router = useRouter();
  const [classCode, setClassCode] = useState("");
  const [isJoining, setIsJoining] = useState(false);

  const ctaLink =
    status === "authenticated" ? ROUTES.DASHBOARD : ROUTES.SIGN_IN;

  const handleJoinClass = async () => {
    if (status !== "authenticated") {
      toast.error("Please sign in to join a classroom");
      router.push(ROUTES.SIGN_IN);
      return;
    }

    if (!classCode || classCode.trim().length !== 6) {
      toast.error("Please enter a valid 6-character classroom code");
      return;
    }

    try {
      setIsJoining(true);
      const result = await api.student.joinClassroom(
        classCode.toUpperCase().trim()
      );

      if (result.success) {
        const data = result.data as JoinClassroomResponse;
        const classroomId = data.classroom._id;
        toast.success(`Successfully joined ${data.classroom.name}!`);
        setClassCode("");
        router.push(`${ROUTES.CLASSROOM}/${classroomId}`);
      } else {
        toast.error(result.error?.message || "Failed to join classroom");
      }
    } catch (error) {
      console.error("Error joining classroom:", error);
      toast.error("Failed to join classroom");
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-slate-100">
      <main>
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left: Text Content */}
            <div>
              <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full text-xs font-medium mb-6">
                <Sparkles className="w-4 h-4" />
                <span>AI-Powered Learning Platform</span>
              </div>
              <h1 className="text-5xl font-bold text-slate-900 mb-4 leading-tight">
                Ace Your Interview.
                <br />
                <span className="text-blue-600">Excel in Class.</span>
              </h1>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                Practice coding, take AI mock interviews, and join your
                teacher&apos;s classes for personalized assessments.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href={ctaLink}
                  className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-all font-semibold shadow-lg hover:shadow-xl inline-flex items-center justify-center space-x-2"
                >
                  <span>Your Dashboard</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href={ROUTES.CLASSROOM}
                  className="bg-white text-slate-900 px-8 py-3 rounded-lg hover:bg-slate-50 transition-all font-semibold shadow-lg border-2 border-slate-200 inline-flex items-center justify-center space-x-2"
                >
                  <GraduationCap className="w-5 h-5" />
                  <span>My Classrooms</span>
                </Link>
              </div>
            </div>

            {/* Right: Interactive Join Class Card */}
            <div className="relative">
              <div className="bg-white rounded-2xl p-8 shadow-2xl border border-slate-200">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="bg-indigo-100 rounded-lg p-3">
                    <GraduationCap className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">
                      Join Your Class
                    </h3>
                    <p className="text-sm text-slate-600">
                      Enter your teacher&apos;s code
                    </p>
                  </div>
                </div>

                <input
                  type="text"
                  placeholder="ABC123"
                  value={classCode}
                  onChange={(e) =>
                    setClassCode(e.target.value.toUpperCase().slice(0, 6))
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !isJoining) {
                      handleJoinClass();
                    }
                  }}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg text-center text-xl font-bold tracking-widest uppercase focus:outline-none focus:border-indigo-500 text-slate-900 mb-4"
                  maxLength={6}
                  disabled={isJoining}
                />
                <button
                  onClick={handleJoinClass}
                  disabled={isJoining || classCode.length !== 6}
                  className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition-colors font-semibold mb-4 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isJoining ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Joining...
                    </>
                  ) : (
                    "Join Class"
                  )}
                </button>

                {status === "authenticated" ? (
                  <div className="pt-4 border-t border-slate-200">
                    <p className="text-xs text-slate-500 mb-3">Quick Access</p>
                    <Link
                      href={ROUTES.CLASSROOM}
                      className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors group"
                    >
                      <span className="text-sm text-slate-700 font-medium">
                        View All My Classes
                      </span>
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                    </Link>
                  </div>
                ) : (
                  <div className="pt-4 border-t border-slate-200">
                    <p className="text-xs text-slate-500 mb-2 text-center">
                      Sign in to join classrooms and track your progress
                    </p>
                    <Link
                      href={ROUTES.SIGN_IN}
                      className="block text-center text-sm text-indigo-600 hover:text-indigo-700 font-semibold"
                    >
                      Sign In Now
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid - Compact 3-Column */}
        <section className="max-w-7xl mx-auto px-6 py-16 bg-white/50">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">
              Everything You Need to Succeed
            </h2>
            <p className="text-slate-600">
              Three powerful tools in one platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1: Skill Assessment */}
            <Link
              href={ROUTES.SKILL}
              className="group bg-white rounded-xl p-6 shadow-lg border-2 border-transparent hover:border-emerald-500 transition-all hover:shadow-xl"
            >
              <div className="bg-emerald-100 rounded-lg w-12 h-12 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Target className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                Skill Assessment
              </h3>
              <p className="text-slate-600 text-sm mb-4">
                AI analyzes your skills and creates personalized roadmaps for
                your target role.
              </p>
              <div className="flex items-center text-emerald-600 text-sm font-semibold group-hover:gap-2 transition-all">
                <span>Start Assessment</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Feature 2: Code Editor */}
            <Link
              href={ROUTES.CODE}
              className="group bg-white rounded-xl p-6 shadow-lg border-2 border-transparent hover:border-purple-500 transition-all hover:shadow-xl"
            >
              <div className="bg-purple-100 rounded-lg w-12 h-12 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Code2 className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                Live Code Editor
              </h3>
              <p className="text-slate-600 text-sm mb-4">
                Practice coding problems with instant feedback. Multi-language
                support.
              </p>
              <div className="flex items-center text-purple-600 text-sm font-semibold group-hover:gap-2 transition-all">
                <span>Start Coding</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Feature 3: Mock Interview */}
            <Link
              href={ROUTES.INTERVIEW}
              className="group bg-white rounded-xl p-6 shadow-lg border-2 border-transparent hover:border-rose-500 transition-all hover:shadow-xl"
            >
              <div className="bg-rose-100 rounded-lg w-12 h-12 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <MessageSquare className="w-6 h-6 text-rose-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                AI Mock Interviews
              </h3>
              <p className="text-slate-600 text-sm mb-4">
                Practice with AI interviewer. Get real-time feedback and
                performance scores.
              </p>
              <div className="flex items-center text-rose-600 text-sm font-semibold group-hover:gap-2 transition-all">
                <span>Start Interview</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </div>
        </section>

        {/* Classroom Feature Highlight */}
        <section className="max-w-7xl mx-auto px-6 py-18">
          <div className="bg-linear-to-br from-indigo-600 to-indigo-700 rounded-3xl overflow-hidden shadow-2xl">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              {/* Left: Text Content */}
              <div className="p-12 flex flex-col justify-center">
                <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-bold mb-4 w-fit text-white">
                  <BookOpen className="w-4 h-4" />
                  <span>For Students</span>
                </div>
                <h2 className="text-4xl font-bold text-white mb-4">
                  Unique Assessments from Your Teachers
                </h2>
                <p className="text-indigo-100 text-lg mb-6">
                  Join your teacher&apos;s class and receive personalized
                  assessments where every student gets unique questions from the
                  same curriculum.
                </p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center space-x-3 text-white">
                    <CheckCircle2 className="w-5 h-5 text-indigo-300 shrink-0" />
                    <span>Different questions per student</span>
                  </li>
                  <li className="flex items-center space-x-3 text-white">
                    <CheckCircle2 className="w-5 h-5 text-indigo-300 shrink-0" />
                    <span>Instant AI-powered grading</span>
                  </li>
                  <li className="flex items-center space-x-3 text-white">
                    <CheckCircle2 className="w-5 h-5 text-indigo-300 shrink-0" />
                    <span>Based on your course curriculum</span>
                  </li>
                </ul>
                <Link
                  href={ROUTES.CLASSROOM}
                  className="bg-white text-indigo-600 px-8 py-3 rounded-lg hover:bg-indigo-50 transition-all font-semibold shadow-lg inline-flex items-center space-x-2 w-fit"
                >
                  <UserPlus className="w-5 h-5" />
                  <span>Join a Class Now</span>
                </Link>
              </div>

              {/* Right: Visual Representation - Side by Side Students */}
              <div className="bg-linear-to-br from-indigo-500 to-indigo-600 p-12 flex items-center justify-center">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
                  {/* Student A Card */}
                  <div className="bg-white rounded-xl p-6 shadow-xl">
                    <div className="flex items-center justify-between mb-4">
                      <div className="bg-purple-100 rounded px-3 py-1.5 text-purple-700 text-sm font-bold">
                        Student A
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="bg-slate-50 rounded-lg p-3">
                        <p className="text-slate-900 text-sm font-semibold mb-2">
                          Q1: Neural Networks
                        </p>
                        <p className="text-slate-600 text-sm">
                          Explain backpropagation in deep learning and how
                          gradients are computed.
                        </p>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-3">
                        <p className="text-slate-900 text-sm font-semibold mb-2">
                          Q2: CNNs
                        </p>
                        <p className="text-slate-600 text-sm">
                          What are convolutional layers used for in image
                          recognition?
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Student B Card */}
                  <div className="bg-white rounded-xl p-6 shadow-xl">
                    <div className="flex items-center justify-between mb-4">
                      <div className="bg-emerald-100 rounded px-3 py-1.5 text-emerald-700 text-sm font-bold">
                        Student B
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="bg-slate-50 rounded-lg p-3">
                        <p className="text-slate-900 text-sm font-semibold mb-2">
                          Q1: Activation Functions
                        </p>
                        <p className="text-slate-600 text-sm">
                          Compare ReLU and Sigmoid functions and their use cases
                          in neural networks.
                        </p>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-3">
                        <p className="text-slate-900 text-sm font-semibold mb-2">
                          Q2: Overfitting
                        </p>
                        <p className="text-slate-600 text-sm">
                          How does dropout prevent overfitting during model
                          training?
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Simple CTA */}
        <section className="max-w-7xl mx-auto px-6 py-16">
          <div className="bg-linear-to-r from-slate-900 to-slate-800 rounded-3xl p-12 text-center shadow-2xl">
            <h2 className="text-4xl font-bold text-white mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-lg text-slate-300 mb-8 max-w-2xl mx-auto">
              Join students mastering interviews and acing their coursework.
            </p>
            <Link
              href={ctaLink}
              className="bg-blue-600 text-white px-10 py-4 rounded-lg hover:bg-blue-700 transition-all font-semibold shadow-lg hover:shadow-xl inline-block text-lg"
            >
              Get Started for Free
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white mt-16">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <Zap className="w-6 h-6 text-blue-600" />
              <span className="text-lg font-bold text-slate-900">
                Mocknetic
              </span>
            </div>
            <p className="text-slate-600 text-sm">
              &copy; 2026 Mocknetic. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;

"use client";

import ROUTES from "@/constants/routes";
import {
  Target,
  TrendingUp,
  MessageSquare,
  CheckCircle2,
  Sparkles,
  Zap,
  Upload,
  FileText,
} from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";

function App() {
  const session = useSession();

  const ctaLink =
    session.status === "authenticated" ? ROUTES.DASHBOARD : ROUTES.SIGN_IN;

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-slate-100">
      <main>
        <section className="max-w-7xl mx-auto px-6 py-16 text-center">
          <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            <span>AI-Powered Interview Preparation</span>
          </div>
          <h1 className="text-5xl font-bold text-slate-900 mb-4 leading-tight">
            Master Your Next
            <br />
            <span className="text-blue-600">Technical Interview</span>
          </h1>
          <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Dynamic career path planning, personalized skill assessments, live
            coding practice, and AI-driven mock interviews to help you land your
            dream job.
          </p>
          <Link
            href={ctaLink}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-all font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 inline-block"
          >
            Start Your Journey
          </Link>
        </section>

        <section className="max-w-7xl mx-auto px-6 py-12">
          <h2 className="text-4xl font-bold text-slate-900 text-center mb-2">
            Your Complete Interview Preparation Workflow
          </h2>
          <p className="text-lg text-slate-600 text-center mb-12 max-w-2xl mx-auto">
            A streamlined journey from skill assessment to interview mastery
          </p>

          {/* 2-Column Grid for Step 1 and 2 - COMPACT */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            {/* Step 1: Upload Resume */}
            <div className="flex flex-col h-full">
              <div className="h-24 flex flex-col mb-3">
                <div className="inline-flex items-center space-x-2 bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold mb-2 uppercase tracking-wide w-fit">
                  <span>Step 1</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-1">
                  Upload Resume
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Quickly populate your profile by uploading your resume. Our AI
                  automatically extracts your skills, experience, education, and
                  projects.
                </p>
              </div>

              <Link
                href={ROUTES.RESUME}
                className="text-indigo-600 font-bold hover:text-indigo-700 transition-colors flex items-center space-x-2 group text-xs mb-3"
              >
                <span>Upload Resume</span>
                <span className="group-hover:translate-x-1 transition-transform">
                  →
                </span>
              </Link>

              <div className="bg-linear-to-br from-indigo-500 to-indigo-600 rounded-xl p-4 shadow-xl relative overflow-hidden grow flex flex-col">
                <div className="absolute top-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mt-12"></div>
                <div className="absolute bottom-0 right-0 w-20 h-20 bg-white/5 rounded-full -mr-10 -mb-10"></div>
                <div className="relative flex flex-col grow">
                  <Upload className="w-8 h-8 text-white mb-2" />
                  <div className="space-y-2 grow flex flex-col">
                    <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2 border border-dashed border-white/40 hover:border-white/60 transition-all cursor-pointer grow flex flex-col justify-center">
                      <div className="flex flex-col items-center space-y-1">
                        <div className="bg-white/30 rounded-full p-1.5">
                          <FileText className="w-3 h-3 text-white" />
                        </div>
                        <p className="text-white font-semibold text-xs">
                          Drop resume
                        </p>
                        <p className="text-indigo-100 text-xs">PDF, DOC</p>
                      </div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 border border-white/20">
                      <div className="flex items-center space-x-1 mb-1">
                        <CheckCircle2 className="w-3 h-3 text-white shrink-0" />
                        <span className="text-white font-semibold text-xs">
                          Auto
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-0.5 text-xs">
                        <div className="text-indigo-100">• Skills</div>
                        <div className="text-indigo-100">• Exp</div>
                        <div className="text-indigo-100">• Edu</div>
                        <div className="text-indigo-100">• Projects</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2: Skill Assessment */}
            <div className="flex flex-col h-full">
              <div className="h-24 flex flex-col mb-3">
                <div className="inline-flex items-center space-x-2 bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold mb-2 uppercase tracking-wide w-fit">
                  <span>Step 2</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-1">
                  Skill Assessment
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Input your current skills and target role. Our AI analyzes the
                  gap and creates a personalized roadmap for success.
                </p>
              </div>

              <Link
                href={ROUTES.SKILL}
                className="text-emerald-600 font-bold hover:text-emerald-700 transition-colors flex items-center space-x-2 group text-xs mb-3"
              >
                <span>Start Assessment</span>
                <span className="group-hover:translate-x-1 transition-transform">
                  →
                </span>
              </Link>

              <div className="bg-linear-to-br from-emerald-500 to-emerald-600 rounded-xl p-4 shadow-xl relative overflow-hidden grow flex flex-col">
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12"></div>
                <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full -ml-10 -mb-10"></div>
                <div className="relative flex flex-col grow">
                  <Target className="w-8 h-8 text-white mb-2" />
                  <div className="space-y-2 grow flex flex-col justify-between">
                    <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2 border border-white/30">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-white font-semibold text-xs">
                          Current
                        </span>
                        <span className="text-emerald-100 text-xs">8</span>
                      </div>
                      <div className="flex flex-wrap gap-0.5">
                        <span className="bg-white/30 text-white px-1.5 py-0.5 rounded text-xs">
                          React
                        </span>
                        <span className="bg-white/30 text-white px-1.5 py-0.5 rounded text-xs">
                          JS
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-center">
                      <div className="bg-white/20 backdrop-blur-sm rounded-full p-1.5">
                        <TrendingUp className="w-3 h-3 text-white" />
                      </div>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2 border border-white/30">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-white font-semibold text-xs">
                          Required
                        </span>
                        <span className="text-emerald-100 text-xs">12</span>
                      </div>
                      <div className="flex flex-wrap gap-0.5">
                        <span className="bg-white/30 text-white px-1.5 py-0.5 rounded text-xs">
                          TS
                        </span>
                        <span className="bg-white/30 text-white px-1.5 py-0.5 rounded text-xs">
                          GraphQL
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 2-Column Grid for Step 3 and 4 - ORIGINAL SIZE */}
          <div className="grid grid-cols-2 gap-8">
            {/* Step 3: Live Code Editor */}
            <div className="flex flex-col h-full">
              <div className="h-32 flex flex-col mb-4">
                <div className="inline-flex items-center space-x-2 bg-purple-100 text-purple-700 px-3 py-1.5 rounded-full text-xs font-bold mb-3 uppercase tracking-wide w-fit">
                  <span>Step 3</span>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">
                  Live Code Editor
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Practice real coding problems with instant feedback.
                  Multi-language support and code execution to build muscle
                  memory.
                </p>
              </div>

              <Link
                href={ROUTES.CODE}
                className="text-purple-600 font-bold hover:text-purple-700 transition-colors flex items-center space-x-2 group text-sm mb-4"
              >
                <span>Start Coding</span>
                <span className="group-hover:translate-x-1 transition-transform">
                  →
                </span>
              </Link>

              <div className="bg-slate-900 rounded-2xl p-4 shadow-xl border border-slate-700 grow flex flex-col">
                <div className="flex items-center space-x-2 mb-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                    <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  </div>
                  <div className="flex-1 flex justify-center">
                    <div className="bg-slate-800 rounded px-2 py-1 text-slate-400 text-xs font-mono">
                      solution.js
                    </div>
                  </div>
                </div>
                <div className="bg-slate-950 rounded-lg p-3 font-mono text-xs overflow-hidden grow flex flex-col justify-center">
                  <div className="space-y-0.5">
                    <div className="flex">
                      <span className="text-slate-600 w-6">1</span>
                      <span className="text-purple-400">function</span>
                      <span className="text-blue-400"> twoSum</span>
                      <span className="text-slate-300">
                        (nums, target) {"{"}
                      </span>
                    </div>
                    <div className="flex">
                      <span className="text-slate-600 w-6">2</span>
                      <span className="text-slate-300"> </span>
                      <span className="text-purple-400">const</span>
                      <span className="text-slate-300"> map = </span>
                      <span className="text-purple-400">new</span>
                      <span className="text-blue-400"> Map</span>
                    </div>
                    <div className="flex">
                      <span className="text-slate-600 w-6">3</span>
                      <span className="text-slate-300"> </span>
                      <span className="text-purple-400">for</span>
                      <span className="text-slate-300">
                        {" "}
                        (let i = 0; i {"<"} nums.length; i++) {"{"}
                      </span>
                    </div>
                    <div className="flex">
                      <span className="text-slate-600 w-6">4</span>
                      <span className="text-slate-300"> </span>
                      <span className="text-purple-400">const</span>
                      <span className="text-slate-300">
                        {" "}
                        complement = target - nums[i];
                      </span>
                    </div>
                    <div className="flex">
                      <span className="text-slate-600 w-6">5</span>
                      <span className="text-slate-300"> {"}"}</span>
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center space-x-1 text-green-400 text-xs">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Passed</span>
                  </div>
                  <button className="bg-purple-600 text-white px-3 py-1 rounded text-xs hover:bg-purple-700 transition-colors">
                    Run
                  </button>
                </div>
              </div>
            </div>

            {/* Step 4: AI Mock Interviews */}
            <div className="flex flex-col h-full">
              <div className="h-32 flex flex-col mb-4">
                <div className="inline-flex items-center space-x-2 bg-rose-100 text-rose-700 px-3 py-1.5 rounded-full text-xs font-bold mb-3 uppercase tracking-wide w-fit">
                  <span>Step 4</span>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">
                  AI Mock Interviews
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Experience realistic interviews with our AI interviewer.
                  Answer behavioral questions and receive detailed performance
                  insights.
                </p>
              </div>

              <Link
                href={ROUTES.INTERVIEW}
                className="text-rose-600 font-bold hover:text-rose-700 transition-colors flex items-center space-x-2 group text-sm mb-4"
              >
                <span>Start Interview</span>
                <span className="group-hover:translate-x-1 transition-transform">
                  →
                </span>
              </Link>

              <div className="bg-linear-to-br from-rose-500 to-rose-600 rounded-2xl p-6 shadow-xl relative overflow-hidden grow flex flex-col">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-12 -mb-12"></div>
                <div className="relative flex flex-col grow">
                  <MessageSquare className="w-10 h-10 text-white mb-3" />
                  <div className="space-y-2 grow flex flex-col justify-between">
                    <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 border border-white/30">
                      <div className="flex items-start space-x-2">
                        <div className="bg-white/30 rounded-full p-1 shrink-0">
                          <Sparkles className="w-3 h-3 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-medium text-xs mb-2 line-clamp-2">
                            &quot;Optimize a slow database query&quot;
                          </p>
                          <div className="flex items-center space-x-1 text-rose-100 text-xs">
                            <div className="w-1.5 h-1.5 bg-rose-200 rounded-full animate-pulse"></div>
                            <span>Listening...</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 border border-white/20 text-center">
                        <div className="text-lg font-bold text-white">8.5</div>
                        <div className="text-rose-100 text-xs">Comm</div>
                      </div>
                      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 border border-white/20 text-center">
                        <div className="text-lg font-bold text-white">7.8</div>
                        <div className="text-rose-100 text-xs">Tech</div>
                      </div>
                      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 border border-white/20 text-center">
                        <div className="text-lg font-bold text-white">9.2</div>
                        <div className="text-rose-100 text-xs">Problem</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-6 py-12">
          <div className="bg-linear-to-r from-slate-900 to-slate-800 rounded-3xl p-12 text-center shadow-2xl">
            <h2 className="text-4xl font-bold text-white mb-4">
              Ready to Ace Your Interview?
            </h2>
            <p className="text-lg text-slate-300 mb-8 max-w-2xl mx-auto">
              Join thousands of developers who have successfully prepared and
              landed their dream jobs.
            </p>
            <Link
              href={ctaLink}
              className="bg-white text-slate-900 px-10 py-3 rounded-lg hover:bg-slate-100 transition-all font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 inline-block"
            >
              Get Started for Free
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-8 text-center">
          <div className="flex flex-col items-center mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-6 h-6 text-blue-600" />
              <span className="text-lg font-bold text-slate-900">
                Mocknetic
              </span>
            </div>
            <p className="text-slate-600 text-sm max-w-sm">
              The most comprehensive platform for technical interview
              preparation, powered by AI.
            </p>
          </div>
          <div className="border-t border-slate-200 pt-6">
            <p className="text-slate-600 text-sm">
              &copy; 2025 Mocknetic. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;

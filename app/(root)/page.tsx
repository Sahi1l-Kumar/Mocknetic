"use client";

import ROUTES from "@/constants/routes";
import {
  Code2,
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
        <section className="max-w-7xl mx-auto px-6 py-20 text-center">
          <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            <span>AI-Powered Interview Preparation</span>
          </div>
          <h1 className="text-6xl font-bold text-slate-900 mb-6 leading-tight">
            Master Your Next
            <br />
            <span className="text-blue-600">Technical Interview</span>
          </h1>
          <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            Dynamic career path planning, personalized skill assessments, live
            coding practice, and AI-driven mock interviews to help you land your
            dream job.
          </p>
          <Link
            href={ctaLink}
            className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition-all font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            Start Your Journey
          </Link>
        </section>

        <section className="max-w-7xl mx-auto px-6 py-16">
          <h2 className="text-4xl font-bold text-slate-900 text-center mb-4">
            Your Complete Interview Preparation Workflow
          </h2>
          <p className="text-lg text-slate-600 text-center mb-20 max-w-2xl mx-auto">
            A streamlined journey from skill assessment to interview mastery
          </p>

          <div className="space-y-32">
            <div className="grid grid-cols-12 gap-8 items-center">
              <div className="col-span-5">
                <div className="inline-flex items-center space-x-2 bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-full text-xs font-bold mb-4 uppercase tracking-wide">
                  <span>Step 1</span>
                </div>
                <h3 className="text-4xl font-bold text-slate-900 mb-4">
                  Upload Resume
                </h3>
                <p className="text-lg text-slate-600 leading-relaxed mb-6">
                  Quickly populate your profile by uploading your resume. Our AI
                  automatically extracts your skills, experience, education, and
                  projects to create a comprehensive profile in seconds.
                </p>
                <button className="text-indigo-600 font-bold hover:text-indigo-700 transition-colors flex items-center space-x-2 group">
                  <Link href={ROUTES.RESUME}>Upload Resume</Link>
                  <span className="group-hover:translate-x-1 transition-transform">
                    →
                  </span>
                </button>
              </div>
              <div className="col-span-7">
                <div className="bg-linear-to-br from-indigo-500 to-indigo-600 rounded-3xl p-12 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -ml-32 -mt-32"></div>
                  <div className="absolute bottom-0 right-0 w-48 h-48 bg-white/5 rounded-full -mr-24 -mb-24"></div>
                  <div className="relative">
                    <Upload className="w-16 h-16 text-white mb-6" />
                    <div className="space-y-4">
                      <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-8 border-2 border-dashed border-white/40 hover:border-white/60 transition-all cursor-pointer">
                        <div className="flex flex-col items-center space-y-3">
                          <div className="bg-white/30 rounded-full p-4">
                            <FileText className="w-8 h-8 text-white" />
                          </div>
                          <p className="text-white font-semibold text-lg">
                            Drop your resume here
                          </p>
                          <p className="text-indigo-100 text-sm">
                            or click to browse
                          </p>
                          <p className="text-indigo-200 text-xs">
                            Supports PDF, DOC, DOCX
                          </p>
                        </div>
                      </div>
                      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20">
                        <div className="flex items-center space-x-3 mb-3">
                          <CheckCircle2 className="w-5 h-5 text-white" />
                          <span className="text-white font-semibold">
                            Auto-extracted Information
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="text-indigo-100">• Skills</div>
                          <div className="text-indigo-100">• Experience</div>
                          <div className="text-indigo-100">• Education</div>
                          <div className="text-indigo-100">• Projects</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-12 gap-8 items-center">
              <div className="col-span-5">
                <div className="inline-flex items-center space-x-2 bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-full text-xs font-bold mb-4 uppercase tracking-wide">
                  <span>Step 2</span>
                </div>
                <h3 className="text-4xl font-bold text-slate-900 mb-4">
                  Skill Assessment
                </h3>
                <p className="text-lg text-slate-600 leading-relaxed mb-6">
                  Input your current skills and target role. Our AI analyzes the
                  gap between where you are and where you need to be, creating a
                  personalized roadmap for success.
                </p>
                <button className="text-emerald-600 font-bold hover:text-emerald-700 transition-colors flex items-center space-x-2 group">
                  <Link href={ROUTES.SKILL}>Start Assessment</Link>
                  <span className="group-hover:translate-x-1 transition-transform">
                    →
                  </span>
                </button>
              </div>
              <div className="col-span-7">
                <div className="bg-linear-to-br from-emerald-500 to-emerald-600 rounded-3xl p-12 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
                  <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24"></div>
                  <div className="relative">
                    <Target className="w-16 h-16 text-white mb-6" />
                    <div className="space-y-4">
                      <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 border border-white/30">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-white font-semibold">
                            Current Skills
                          </span>
                          <span className="text-emerald-100 text-sm">
                            8 skills
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <span className="bg-white/30 text-white px-3 py-1 rounded-lg text-sm">
                            React
                          </span>
                          <span className="bg-white/30 text-white px-3 py-1 rounded-lg text-sm">
                            JavaScript
                          </span>
                          <span className="bg-white/30 text-white px-3 py-1 rounded-lg text-sm">
                            Node.js
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-center">
                        <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                          <TrendingUp className="w-6 h-6 text-white" />
                        </div>
                      </div>
                      <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 border border-white/30">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-white font-semibold">
                            Required Skills
                          </span>
                          <span className="text-emerald-100 text-sm">
                            12 skills
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <span className="bg-white/30 text-white px-3 py-1 rounded-lg text-sm">
                            TypeScript
                          </span>
                          <span className="bg-white/30 text-white px-3 py-1 rounded-lg text-sm">
                            GraphQL
                          </span>
                          <span className="bg-white/30 text-white px-3 py-1 rounded-lg text-sm">
                            Docker
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-12 gap-8 items-center">
              <div className="col-span-7 order-2">
                <div className="bg-linear-to-br from-blue-600 to-blue-700 rounded-3xl p-12 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -ml-32 -mt-32"></div>
                  <div className="absolute bottom-0 right-0 w-48 h-48 bg-white/5 rounded-full -mr-24 -mb-24"></div>
                  <div className="relative">
                    <TrendingUp className="w-16 h-16 text-white mb-6" />
                    <div className="space-y-3">
                      <div className="bg-white/20 backdrop-blur-sm rounded-xl p-5 border border-white/30 flex items-start space-x-4">
                        <div className="bg-white/30 rounded-lg p-2 mt-1">
                          <CheckCircle2 className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-white font-bold mb-1">
                            TypeScript Fundamentals
                          </h4>
                          <p className="text-blue-100 text-sm mb-3">
                            Master type safety and interfaces
                          </p>
                          <div className="flex items-center space-x-3">
                            <div className="flex-1 bg-white/20 rounded-full h-2">
                              <div className="bg-white rounded-full h-2 w-3/4"></div>
                            </div>
                            <span className="text-white text-sm font-semibold">
                              75%
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20 flex items-start space-x-4 opacity-60">
                        <div className="bg-white/20 rounded-lg p-2 mt-1">
                          <Target className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-white font-bold mb-1">
                            GraphQL API Design
                          </h4>
                          <p className="text-blue-100 text-sm">
                            Build scalable GraphQL schemas
                          </p>
                        </div>
                      </div>
                      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20 flex items-start space-x-4 opacity-60">
                        <div className="bg-white/20 rounded-lg p-2 mt-1">
                          <Target className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-white font-bold mb-1">
                            Docker & Containers
                          </h4>
                          <p className="text-blue-100 text-sm">
                            Containerize and deploy apps
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-span-5 order-1">
                <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full text-xs font-bold mb-4 uppercase tracking-wide">
                  <span>Step 3</span>
                </div>
                <h3 className="text-4xl font-bold text-slate-900 mb-4">
                  Dynamic Career Path
                </h3>
                <p className="text-lg text-slate-600 leading-relaxed mb-6">
                  Get curated learning resources and track your progress. Mark
                  modules complete and take AI-powered mini assessments to
                  validate your knowledge before moving forward.
                </p>
                <button className="text-blue-600 font-bold hover:text-blue-700 transition-colors flex items-center space-x-2 group">
                  <span>View Your Path</span>
                  <span className="group-hover:translate-x-1 transition-transform">
                    →
                  </span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-12 gap-8 items-center">
              <div className="col-span-5">
                <div className="inline-flex items-center space-x-2 bg-purple-100 text-purple-700 px-3 py-1.5 rounded-full text-xs font-bold mb-4 uppercase tracking-wide">
                  <span>Step 4</span>
                </div>
                <h3 className="text-4xl font-bold text-slate-900 mb-4">
                  Live Code Editor
                </h3>
                <p className="text-lg text-slate-600 leading-relaxed mb-6">
                  Practice real coding problems with instant feedback.
                  Multi-language support, syntax highlighting, and code
                  execution. Build muscle memory for technical interviews.
                </p>
                <Link
                  href={ROUTES.CODE}
                  className="text-purple-600 font-bold hover:text-purple-700 transition-colors flex items-center space-x-2 group"
                >
                  <span>Start Coding</span>
                  <span className="group-hover:translate-x-1 transition-transform">
                    →
                  </span>
                </Link>
              </div>
              <div className="col-span-7">
                <div className="bg-slate-900 rounded-3xl p-8 shadow-2xl border border-slate-700">
                  <div className="flex items-center space-x-2 mb-6">
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>
                    <div className="flex-1 flex justify-center">
                      <div className="bg-slate-800 rounded px-4 py-1.5 text-slate-400 text-sm font-mono">
                        two-sum.js
                      </div>
                    </div>
                  </div>
                  <div className="bg-slate-950 rounded-xl p-6 font-mono text-sm">
                    <div className="space-y-1">
                      <div className="flex">
                        <span className="text-slate-600 w-8">1</span>
                        <span className="text-purple-400">function</span>
                        <span className="text-blue-400"> twoSum</span>
                        <span className="text-slate-300">
                          (nums, target) {"{"}
                        </span>
                      </div>
                      <div className="flex">
                        <span className="text-slate-600 w-8">2</span>
                        <span className="text-slate-300"> </span>
                        <span className="text-purple-400">const</span>
                        <span className="text-slate-300"> map = </span>
                        <span className="text-purple-400">new</span>
                        <span className="text-blue-400"> Map</span>
                        <span className="text-slate-300">();</span>
                      </div>
                      <div className="flex">
                        <span className="text-slate-600 w-8">3</span>
                        <span className="text-slate-300"> </span>
                        <span className="text-purple-400">for</span>
                        <span className="text-slate-300"> (</span>
                        <span className="text-purple-400">let</span>
                        <span className="text-slate-300"> i = </span>
                        <span className="text-green-400">0</span>
                        <span className="text-slate-300">
                          ; i {"<"} nums.length; i++) {"{"}
                        </span>
                      </div>
                      <div className="flex">
                        <span className="text-slate-600 w-8">4</span>
                        <span className="text-slate-300"> </span>
                        <span className="text-purple-400">const</span>
                        <span className="text-slate-300">
                          {" "}
                          complement = target - nums[i];
                        </span>
                      </div>
                      <div className="flex">
                        <span className="text-slate-600 w-8">5</span>
                        <span className="text-slate-300"> </span>
                        <span className="text-purple-400">if</span>
                        <span className="text-slate-300"> (map.</span>
                        <span className="text-blue-400">has</span>
                        <span className="text-slate-300">
                          (complement)) {"{"}
                        </span>
                      </div>
                      <div className="flex">
                        <span className="text-slate-600 w-8">6</span>
                        <span className="text-slate-300"> </span>
                        <span className="text-purple-400">return</span>
                        <span className="text-slate-300"> [map.</span>
                        <span className="text-blue-400">get</span>
                        <span className="text-slate-300">
                          (complement), i];
                        </span>
                      </div>
                      <div className="flex">
                        <span className="text-slate-600 w-8">7</span>
                        <span className="text-slate-300"> {"}"}</span>
                      </div>
                      <div className="flex">
                        <span className="text-slate-600 w-8">8</span>
                        <span className="text-slate-300"> map.</span>
                        <span className="text-blue-400">set</span>
                        <span className="text-slate-300">(nums[i], i);</span>
                      </div>
                      <div className="flex">
                        <span className="text-slate-600 w-8">9</span>
                        <span className="text-slate-300"> {"}"}</span>
                      </div>
                      <div className="flex">
                        <span className="text-slate-600 w-8">10</span>
                        <span className="text-slate-300">{"}"}</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-green-400 text-sm">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>All test cases passed</span>
                    </div>
                    <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm font-semibold">
                      Run Code
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-12 gap-8 items-center">
              <div className="col-span-7 order-2">
                <div className="bg-linear-to-br from-rose-500 to-rose-600 rounded-3xl p-12 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
                  <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24"></div>
                  <div className="relative">
                    <MessageSquare className="w-16 h-16 text-white mb-6" />
                    <div className="space-y-4">
                      <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-5 border border-white/30">
                        <div className="flex items-start space-x-3">
                          <div className="bg-white/30 rounded-full p-2">
                            <Sparkles className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <p className="text-white font-medium mb-3">
                              &quot;Tell me about a time you optimized a slow
                              database query. Walk me through your
                              approach.&quot;
                            </p>
                            <div className="flex items-center space-x-2 text-rose-100 text-sm">
                              <div className="w-2 h-2 bg-rose-200 rounded-full animate-pulse"></div>
                              <span>AI listening...</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/20">
                        <div className="flex items-center justify-between text-white">
                          <span className="font-semibold">
                            Problem Challenge Incoming
                          </span>
                          <Code2 className="w-5 h-5" />
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20 text-center">
                          <div className="text-2xl font-bold text-white mb-1">
                            8.5
                          </div>
                          <div className="text-rose-100 text-xs">
                            Communication
                          </div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20 text-center">
                          <div className="text-2xl font-bold text-white mb-1">
                            7.8
                          </div>
                          <div className="text-rose-100 text-xs">Technical</div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20 text-center">
                          <div className="text-2xl font-bold text-white mb-1">
                            9.2
                          </div>
                          <div className="text-rose-100 text-xs">
                            Problem Solving
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-span-5 order-1">
                <div className="inline-flex items-center space-x-2 bg-rose-100 text-rose-700 px-3 py-1.5 rounded-full text-xs font-bold mb-4 uppercase tracking-wide">
                  <span>Step 5</span>
                </div>
                <h3 className="text-4xl font-bold text-slate-900 mb-4">
                  AI Mock Interviews
                </h3>
                <p className="text-lg text-slate-600 leading-relaxed mb-6">
                  Experience realistic interviews with our AI interviewer.
                  Answer behavioral questions, solve coding challenges
                  mid-interview, and receive detailed performance insights and
                  feedback.
                </p>
                <button className="text-rose-600 font-bold hover:text-rose-700 transition-colors flex items-center space-x-2 group">
                  <Link href={ROUTES.INTERVIEW}>Start Interview</Link>
                  <span className="group-hover:translate-x-1 transition-transform">
                    →
                  </span>
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-6 py-20">
          <div className="bg-linear-to-r from-slate-900 to-slate-800 rounded-3xl p-12 lg:p-16 text-center shadow-2xl">
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              Ready to Ace Your Interview?
            </h2>
            <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
              Join thousands of developers who have successfully prepared and
              landed their dream jobs.
            </p>
            <Link
              href={ctaLink}
              className="bg-white text-slate-900 px-10 py-4 rounded-lg hover:bg-slate-100 transition-all font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Get Started for Free
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-12 text-center">
          <div className="flex flex-col items-center mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-7 h-7 text-blue-600" />
              <span className="text-xl font-bold text-slate-900">
                Mocknetic
              </span>
            </div>
            <p className="text-slate-600 leading-relaxed max-w-sm">
              The most comprehensive platform for technical interview
              preparation, powered by AI.
            </p>
          </div>
          <div className="border-t border-slate-200 pt-8">
            <p className="text-slate-600">
              &copy; 2025 Mocknetic. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;

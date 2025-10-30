import {
  Code2,
  Target,
  TrendingUp,
  MessageSquare,
  Trophy,
  ArrowRight,
} from "lucide-react";
import ROUTES from "@/constants/routes";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

async function Dashboard() {
  const session = await auth();

  if (!session?.user) {
    redirect(ROUTES.SIGN_IN);
  }
  return (
    <div className="min-h-screen">
      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            Welcome back, Alex
          </h1>
          <p className="text-lg text-slate-600">
            Ready to level up your interview skills?
          </p>
        </div>

        <div className="mb-12">
          <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 rounded-2xl p-8 text-white relative overflow-hidden shadow-xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24"></div>
            <div className="relative">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="inline-block bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide mb-3">
                    In Progress
                  </div>
                  <h2 className="text-3xl font-bold mb-2">
                    Senior Frontend Engineer Path
                  </h2>
                  <p className="text-blue-100">Continue where you left off</p>
                </div>
                <Trophy className="w-12 h-12 text-yellow-300" />
              </div>

              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-3xl font-bold mb-1">8/12</div>
                  <div className="text-blue-100 text-sm">Skills Mastered</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-3xl font-bold mb-1">23</div>
                  <div className="text-blue-100 text-sm">Problems Solved</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-3xl font-bold mb-1">5</div>
                  <div className="text-blue-100 text-sm">Mock Interviews</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-3xl font-bold mb-1">8.4</div>
                  <div className="text-blue-100 text-sm">Avg Score</div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-semibold">Overall Progress</span>
                  <span className="text-2xl font-bold">67%</span>
                </div>
                <div className="bg-white/20 rounded-full h-3 mb-4">
                  <div className="bg-gradient-to-r from-green-400 to-emerald-400 rounded-full h-3 w-2/3 shadow-lg"></div>
                </div>
                <div className="flex items-center justify-between text-sm text-blue-100">
                  <span>
                    Next milestone: Complete TypeScript Advanced module
                  </span>
                  <span className="font-semibold text-white">33% to go</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">
            Your Learning Path
          </h2>

          <div className="grid grid-cols-2 gap-6">
            <button className="group bg-white rounded-2xl p-8 border-2 border-slate-200 hover:border-emerald-400 shadow-sm hover:shadow-xl transition-all duration-300 text-left relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
              <div className="relative">
                <div className="bg-emerald-100 w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:bg-emerald-500 transition-colors">
                  <Target className="w-7 h-7 text-emerald-600 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">
                  Skill Assessment
                </h3>
                <p className="text-slate-600 mb-4">
                  Analyze gaps between your current skills and job requirements
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-emerald-600">
                    Last updated 2 days ago
                  </span>
                  <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-2 transition-all" />
                </div>
              </div>
            </button>

            <button className="group bg-white rounded-2xl p-8 border-2 border-slate-200 hover:border-blue-400 shadow-sm hover:shadow-xl transition-all duration-300 text-left relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-blue-100 w-14 h-14 rounded-xl flex items-center justify-center group-hover:bg-blue-500 transition-colors">
                    <TrendingUp className="w-7 h-7 text-blue-600 group-hover:text-white transition-colors" />
                  </div>
                  <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">
                    67% Complete
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">
                  Career Roadmap
                </h3>
                <p className="text-slate-600 mb-4">
                  Track progress and complete personalized learning modules
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-blue-600">
                    4 modules remaining
                  </span>
                  <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-2 transition-all" />
                </div>
              </div>
            </button>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">
            Practice & Interviews
          </h2>

          <div className="grid grid-cols-2 gap-6">
            <button className="group bg-slate-900 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 text-left relative overflow-hidden border-2 border-slate-700 hover:border-purple-500">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
              <div className="relative">
                <div className="bg-purple-500/20 w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:bg-purple-500 transition-colors backdrop-blur-sm border border-purple-400/30">
                  <Code2 className="w-7 h-7 text-purple-400 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  Code Editor
                </h3>
                <p className="text-slate-400 mb-4">
                  Practice coding problems with instant feedback and execution
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-purple-400">
                    23 problems solved
                  </span>
                  <ArrowRight className="w-5 h-5 text-slate-600 group-hover:text-purple-400 group-hover:translate-x-2 transition-all" />
                </div>
              </div>
            </button>

            <button className="group bg-gradient-to-br from-rose-500 to-rose-600 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 text-left relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-white/20 w-14 h-14 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/30">
                    <MessageSquare className="w-7 h-7 text-white" />
                  </div>
                  <div className="bg-white/20 text-white px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm">
                    Avg 8.4/10
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  Mock Interviews
                </h3>
                <p className="text-rose-100 mb-4">
                  Live AI interviews with real-time coding challenges
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-white">
                    5 interviews completed
                  </span>
                  <ArrowRight className="w-5 h-5 text-rose-200 group-hover:text-white group-hover:translate-x-2 transition-all" />
                </div>
              </div>
            </button>
          </div>
        </div>

        <div className="bg-gradient-to-r from-slate-800 via-slate-900 to-slate-800 rounded-2xl p-10 relative overflow-hidden mb-12">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-rose-500/10"></div>
          <div className="relative">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-white mb-3">
                  Recent Activity
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-4 bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                    <div className="bg-emerald-500/20 rounded-lg p-2">
                      <Target className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-semibold">
                        Completed TypeScript Fundamentals assessment
                      </p>
                      <p className="text-slate-400 text-sm">
                        Score: 9.2/10 • 2 hours ago
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                    <div className="bg-purple-500/20 rounded-lg p-2">
                      <Code2 className="w-5 h-5 text-purple-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-semibold">
                        Solved &quot;Binary Tree Level Order Traversal&quot;
                      </p>
                      <p className="text-slate-400 text-sm">
                        Medium • 5 hours ago
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                    <div className="bg-rose-500/20 rounded-lg p-2">
                      <MessageSquare className="w-5 h-5 text-rose-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-semibold">
                        Completed mock interview with AI
                      </p>
                      <p className="text-slate-400 text-sm">
                        Overall: 8.7/10 • Yesterday
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;

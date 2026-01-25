export default function DashboardLoading() {
  return (
    <div className="min-h-screen">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Header Skeleton */}
        <div className="mb-8 sm:mb-12">
          <div className="h-8 sm:h-10 bg-slate-200 rounded-lg w-64 sm:w-80 mb-2 animate-pulse" />
          <div className="h-5 sm:h-6 bg-slate-200 rounded-lg w-48 sm:w-64 animate-pulse" />
        </div>

        {/* Progress Card Skeleton */}
        <div className="mb-8 sm:mb-12">
          <div className="bg-linear-to-br from-slate-300 to-slate-400 rounded-xl sm:rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-xl animate-pulse">
            <div className="space-y-4 sm:space-y-6">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="space-y-2 sm:space-y-3">
                  <div className="h-5 sm:h-6 bg-white/30 rounded w-24 sm:w-32" />
                  <div className="h-6 sm:h-8 bg-white/30 rounded w-48 sm:w-64" />
                  <div className="h-4 sm:h-5 bg-white/30 rounded w-36 sm:w-48" />
                </div>
                <div className="w-8 h-8 sm:w-12 sm:h-12 bg-white/30 rounded-lg" />
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="bg-white/20 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4"
                  >
                    <div className="h-6 sm:h-8 bg-white/30 rounded w-12 sm:w-16 mb-2" />
                    <div className="h-3 sm:h-4 bg-white/30 rounded w-16 sm:w-20" />
                  </div>
                ))}
              </div>

              {/* Progress Bar */}
              <div className="bg-white/20 backdrop-blur-sm rounded-lg sm:rounded-xl p-4 sm:p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="h-4 sm:h-5 bg-white/30 rounded w-32 sm:w-40" />
                  <div className="h-6 sm:h-8 bg-white/30 rounded w-12 sm:w-16" />
                </div>
                <div className="bg-white/30 rounded-full h-2 sm:h-3 mb-3" />
                <div className="flex justify-between">
                  <div className="h-3 sm:h-4 bg-white/30 rounded w-32 sm:w-40" />
                  <div className="h-3 sm:h-4 bg-white/30 rounded w-16 sm:w-20" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent AI Interviews Skeleton */}
        <div className="mb-8 sm:mb-12">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div className="h-6 sm:h-8 bg-slate-200 rounded-lg w-48 sm:w-64 animate-pulse" />
            <div className="h-4 sm:h-5 bg-slate-200 rounded w-20 sm:w-24 animate-pulse" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-white rounded-xl p-5 sm:p-6 shadow-lg border-2 border-slate-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-lg animate-pulse" />
                    <div className="space-y-2">
                      <div className="h-4 sm:h-5 bg-slate-200 rounded w-32 sm:w-40 animate-pulse" />
                      <div className="h-3 sm:h-4 bg-slate-200 rounded w-24 sm:w-32 animate-pulse" />
                    </div>
                  </div>
                  <div className="w-12 sm:w-16 h-6 sm:h-8 bg-slate-200 rounded-full animate-pulse" />
                </div>

                <div className="grid grid-cols-3 gap-3 mb-4">
                  {[1, 2, 3].map((j) => (
                    <div key={j} className="text-center space-y-1">
                      <div className="h-5 sm:h-6 bg-slate-200 rounded w-8 mx-auto animate-pulse" />
                      <div className="h-3 bg-slate-200 rounded w-16 mx-auto animate-pulse" />
                    </div>
                  ))}
                </div>

                <div className="space-y-2 mb-4">
                  <div className="h-4 bg-slate-100 rounded animate-pulse" />
                  <div className="h-4 bg-slate-100 rounded w-5/6 animate-pulse" />
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                  <div className="h-3 sm:h-4 bg-slate-200 rounded w-24 sm:w-32 animate-pulse" />
                  <div className="h-4 sm:h-5 bg-slate-200 rounded w-20 sm:w-24 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Skills to Improve Skeleton */}
        <div className="mb-8 sm:mb-12">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div className="h-6 sm:h-8 bg-slate-200 rounded-lg w-40 sm:w-48 animate-pulse" />
            <div className="h-4 sm:h-5 bg-slate-200 rounded w-24 sm:w-32 animate-pulse" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bg-white rounded-xl p-5 shadow-lg border-2 border-slate-200"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="h-5 bg-slate-200 rounded w-32 sm:w-40 animate-pulse" />
                  <div className="w-5 h-5 bg-orange-100 rounded animate-pulse" />
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <div className="h-4 bg-slate-200 rounded w-16 animate-pulse" />
                    <div className="h-4 bg-slate-200 rounded w-12 animate-pulse" />
                  </div>
                  <div className="flex justify-between">
                    <div className="h-4 bg-slate-200 rounded w-12 animate-pulse" />
                    <div className="h-4 bg-slate-200 rounded w-12 animate-pulse" />
                  </div>
                </div>

                <div className="bg-slate-100 rounded-full h-2 mb-3 animate-pulse" />
                <div className="h-3 bg-slate-200 rounded w-20 animate-pulse" />
              </div>
            ))}
          </div>
        </div>

        {/* Recommended Section Skeleton */}
        <div className="mb-8 sm:mb-12">
          <div className="h-6 sm:h-8 bg-slate-200 rounded-lg w-48 sm:w-56 mb-4 sm:mb-6 animate-pulse" />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white rounded-xl p-5 shadow-lg border-2 border-slate-200"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg animate-pulse" />
                  <div className="h-5 w-16 bg-blue-100 rounded animate-pulse" />
                </div>
                <div className="h-5 bg-slate-200 rounded w-full mb-2 animate-pulse" />
                <div className="h-5 bg-slate-200 rounded w-3/4 mb-4 animate-pulse" />
                <div className="h-4 bg-slate-200 rounded w-full mb-2 animate-pulse" />
                <div className="h-4 bg-slate-200 rounded w-2/3 mb-4 animate-pulse" />
                <div className="h-4 bg-slate-200 rounded w-24 animate-pulse" />
              </div>
            ))}
          </div>
        </div>

        {/* Your Classes Skeleton */}
        <div className="mb-8 sm:mb-12">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div className="h-6 sm:h-8 bg-slate-200 rounded-lg w-32 sm:w-40 animate-pulse" />
            <div className="h-4 sm:h-5 bg-slate-200 rounded w-20 sm:w-24 animate-pulse" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white rounded-xl p-5 sm:p-6 shadow-lg border-2 border-slate-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-indigo-100 rounded-lg animate-pulse" />
                  <div className="h-6 w-16 bg-indigo-100 rounded animate-pulse" />
                </div>

                <div className="h-5 sm:h-6 bg-slate-200 rounded w-full mb-1 animate-pulse" />
                <div className="h-4 bg-slate-200 rounded w-32 sm:w-40 mb-4 animate-pulse" />

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <div className="h-4 bg-slate-200 rounded w-16 animate-pulse" />
                    <div className="h-4 bg-slate-200 rounded w-24 animate-pulse" />
                  </div>
                  <div className="flex justify-between">
                    <div className="h-4 bg-slate-200 rounded w-20 animate-pulse" />
                    <div className="h-4 bg-slate-200 rounded w-24 animate-pulse" />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                  <div className="h-3 bg-slate-200 rounded w-20 animate-pulse" />
                  <div className="h-4 bg-slate-200 rounded w-12 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Learning Path Skeleton */}
        <div className="mb-8">
          <div className="h-6 sm:h-8 bg-slate-200 rounded-lg w-40 sm:w-48 mb-4 sm:mb-6 animate-pulse" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white rounded-xl sm:rounded-2xl p-6 sm:p-8 border-2 border-slate-200 shadow-sm"
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-slate-200 rounded-xl mb-3 sm:mb-4 animate-pulse" />
                <div className="h-6 sm:h-8 bg-slate-200 rounded w-3/4 mb-2 animate-pulse" />
                <div className="h-4 bg-slate-200 rounded w-full mb-2 animate-pulse" />
                <div className="h-4 bg-slate-200 rounded w-5/6 mb-4 animate-pulse" />
                <div className="flex justify-between">
                  <div className="h-4 bg-slate-200 rounded w-24 sm:w-32 animate-pulse" />
                  <div className="w-4 h-4 sm:w-5 sm:h-5 bg-slate-200 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Assessments Dark Section Skeleton */}
        <div className="bg-linear-to-r from-slate-700 to-slate-800 rounded-xl sm:rounded-2xl p-6 sm:p-10 animate-pulse">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div className="h-6 sm:h-8 bg-white/20 rounded w-48 sm:w-64" />
            <div className="h-4 sm:h-5 bg-white/20 rounded w-20 sm:w-24" />
          </div>

          <div className="space-y-2 sm:space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10"
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                  <div className="flex items-center space-x-3 sm:space-x-4 flex-1">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 sm:h-5 bg-white/20 rounded w-3/4" />
                      <div className="h-3 sm:h-4 bg-white/20 rounded w-1/2" />
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-16 sm:w-20 bg-white/20 rounded-lg" />
                    <div className="w-5 h-5 bg-white/20 rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

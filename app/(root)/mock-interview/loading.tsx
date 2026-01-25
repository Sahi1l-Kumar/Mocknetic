export default function MockInterviewLoading() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8">
          {/* Header Skeleton */}
          <div className="h-8 bg-slate-200 rounded-lg w-64 mb-8 animate-pulse" />

          {/* Form Fields Skeleton */}
          <div className="space-y-6">
            {/* Job Title */}
            <div>
              <div className="h-4 bg-slate-200 rounded w-32 mb-2 animate-pulse" />
              <div className="h-11 bg-slate-100 border border-slate-200 rounded-lg animate-pulse" />
            </div>

            {/* Job Description */}
            <div>
              <div className="h-4 bg-slate-200 rounded w-40 mb-2 animate-pulse" />
              <div className="h-40 bg-slate-100 border border-slate-200 rounded-lg animate-pulse" />
            </div>

            {/* Company Name */}
            <div>
              <div className="h-4 bg-slate-200 rounded w-44 mb-2 animate-pulse" />
              <div className="h-11 bg-slate-100 border border-slate-200 rounded-lg animate-pulse" />
            </div>

            {/* Company Description */}
            <div>
              <div className="h-4 bg-slate-200 rounded w-52 mb-2 animate-pulse" />
              <div className="h-28 bg-slate-100 border border-slate-200 rounded-lg animate-pulse" />
            </div>

            {/* Number of Questions Selector */}
            <div className="bg-linear-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-6 space-y-4">
              <div>
                <div className="h-4 bg-blue-200 rounded w-56 mb-4 animate-pulse" />

                <div className="flex items-center gap-6">
                  {/* Range Slider */}
                  <div className="flex-1 h-3 bg-slate-300 rounded-lg animate-pulse" />

                  {/* Number Display */}
                  <div className="bg-white border-2 border-blue-500 rounded-lg px-4 py-2 min-w-16">
                    <div className="h-8 bg-slate-200 rounded w-8 mx-auto mb-1 animate-pulse" />
                    <div className="h-3 bg-slate-200 rounded w-12 mx-auto animate-pulse" />
                  </div>
                </div>

                {/* Min/Max Labels */}
                <div className="mt-3 flex justify-between">
                  <div className="h-3 bg-blue-200 rounded w-20 animate-pulse" />
                  <div className="h-3 bg-blue-200 rounded w-20 animate-pulse" />
                </div>
              </div>

              {/* Tip Box */}
              <div className="bg-white rounded p-4 border border-blue-100">
                <div className="space-y-2">
                  <div className="h-3 bg-slate-200 rounded w-full animate-pulse" />
                  <div className="h-3 bg-slate-200 rounded w-5/6 animate-pulse" />
                </div>
              </div>
            </div>

            {/* Resume Upload Section */}
            <div className="pt-4 border-t border-slate-200">
              <div className="h-4 bg-slate-200 rounded w-72 mb-4 animate-pulse" />

              <div>
                <div className="h-4 bg-slate-200 rounded w-44 mb-2 animate-pulse" />

                {/* Upload Box */}
                <div className="flex items-center justify-center w-full px-4 py-6 border-2 border-dashed border-slate-300 rounded-lg bg-slate-50">
                  <div className="text-center space-y-2">
                    <div className="w-8 h-8 bg-slate-300 rounded mx-auto animate-pulse" />
                    <div className="h-4 bg-slate-200 rounded w-48 mx-auto animate-pulse" />
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <div className="w-full h-12 bg-slate-300 rounded-lg animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

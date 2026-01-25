import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function CodeEditorLoading() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section Skeleton */}
      <section className="border-b border-slate-200 bg-linear-to-r from-blue-600/10 via-blue-500/5 to-slate-50">
        <div className="max-w-7xl mx-auto px-6 py-7 flex flex-wrap md:flex-nowrap items-center gap-8">
          {/* Left Content */}
          <div className="flex-1 max-w-2xl">
            <div className="h-10 bg-slate-200 rounded-lg w-96 mb-2 animate-pulse" />
            <div className="h-5 bg-slate-200 rounded-lg w-full max-w-md mb-2 animate-pulse" />
            <div className="h-5 bg-slate-200 rounded-lg w-3/4 mb-6 animate-pulse" />

            {/* 2x2 Button Grid Skeleton */}
            <div className="grid grid-cols-2 gap-3 max-w-md">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-11 bg-slate-200 rounded-md animate-pulse"
                />
              ))}
            </div>
          </div>

          {/* Stats Cards Skeleton */}
          <div className="flex gap-4 md:gap-6">
            <Card className="shadow-lg w-32 h-20 sm:w-36 sm:h-24 md:w-40 md:h-28 lg:w-44 lg:h-32 xl:w-48 xl:h-36 border-slate-200">
              <CardContent className="flex flex-col items-center justify-center h-full p-2">
                <div className="h-8 sm:h-10 bg-slate-200 rounded w-16 sm:w-20 mb-2 animate-pulse" />
                <div className="h-3 sm:h-4 bg-slate-200 rounded w-24 sm:w-28 animate-pulse" />
              </CardContent>
            </Card>

            <Card className="shadow-lg w-32 h-20 sm:w-36 sm:h-24 md:w-40 md:h-28 lg:w-44 lg:h-32 xl:w-48 xl:h-36 border-slate-200">
              <CardContent className="flex flex-col items-center justify-center h-full p-2">
                <div className="h-8 sm:h-10 bg-slate-200 rounded w-16 sm:w-20 mb-2 animate-pulse" />
                <div className="h-3 sm:h-4 bg-slate-200 rounded w-24 sm:w-28 animate-pulse" />
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Tags Sidebar Skeleton */}
          <aside className="lg:col-span-1 space-y-6">
            <Card className="border-slate-200 shadow-sm">
              <CardContent className="p-6">
                <div className="h-5 bg-slate-200 rounded w-24 mb-4 animate-pulse" />
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <div
                      key={i}
                      className="p-2 rounded-lg border border-slate-200"
                    >
                      <div className="flex items-center justify-between">
                        <div className="h-4 bg-slate-200 rounded w-24 animate-pulse" />
                        <Badge
                          variant="secondary"
                          className="bg-slate-100 w-8 h-5 animate-pulse"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Progress Card Skeleton */}
            <Card className="border-slate-200 shadow-sm">
              <CardContent className="p-6">
                <div className="h-5 bg-slate-200 rounded w-32 mb-4 animate-pulse" />
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <div className="h-4 bg-slate-200 rounded w-24 animate-pulse" />
                      <div className="h-4 bg-slate-200 rounded w-12 animate-pulse" />
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2 animate-pulse" />
                  </div>
                  <div className="pt-2 border-t border-slate-200 space-y-2">
                    <div className="flex justify-between">
                      <div className="h-3 bg-slate-200 rounded w-28 animate-pulse" />
                      <div className="h-3 bg-slate-200 rounded w-8 animate-pulse" />
                    </div>
                    <div className="flex justify-between">
                      <div className="h-3 bg-slate-200 rounded w-20 animate-pulse" />
                      <div className="h-3 bg-slate-200 rounded w-10 animate-pulse" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-3 space-y-6">
            {/* Search and Filters Skeleton */}
            <Card className="border-slate-200 shadow-sm">
              <CardContent className="p-4">
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="flex-1 h-10 bg-slate-200 rounded-md animate-pulse" />
                  <div className="w-[180px] h-10 bg-slate-200 rounded-md animate-pulse" />
                  <div className="w-[180px] h-10 bg-slate-200 rounded-md animate-pulse" />
                </div>
              </CardContent>
            </Card>

            {/* Problems List Skeleton */}
            <Card className="border-slate-200 shadow-sm">
              <CardContent className="p-0">
                {/* Header */}
                <div className="p-4 border-b border-slate-200 bg-slate-50">
                  <div className="grid grid-cols-12 gap-4 items-center">
                    <div className="col-span-1 text-center">
                      <div className="h-3 bg-slate-200 rounded w-12 mx-auto animate-pulse" />
                    </div>
                    <div className="col-span-5">
                      <div className="h-3 bg-slate-200 rounded w-16 animate-pulse" />
                    </div>
                    <div className="col-span-2 text-center">
                      <div className="h-3 bg-slate-200 rounded w-20 mx-auto animate-pulse" />
                    </div>
                    <div className="col-span-2 text-center">
                      <div className="h-3 bg-slate-200 rounded w-16 mx-auto animate-pulse" />
                    </div>
                    <div className="col-span-2 text-center">
                      <div className="h-3 bg-slate-200 rounded w-20 mx-auto animate-pulse" />
                    </div>
                  </div>
                </div>

                {/* Problems List */}
                <div className="divide-y divide-slate-200">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                    <div
                      key={i}
                      className="grid grid-cols-12 gap-4 items-center p-4"
                    >
                      {/* Status */}
                      <div className="col-span-1 text-center">
                        <div className="h-5 w-5 border-2 border-slate-200 bg-slate-100 rounded-full mx-auto animate-pulse" />
                      </div>

                      {/* Title */}
                      <div className="col-span-5">
                        <div className="h-4 bg-slate-200 rounded w-3/4 mb-2 animate-pulse" />
                        <div className="flex gap-2">
                          <Badge
                            variant="secondary"
                            className="bg-slate-100 w-16 h-5 animate-pulse"
                          />
                          <Badge
                            variant="secondary"
                            className="bg-slate-100 w-20 h-5 animate-pulse"
                          />
                        </div>
                      </div>

                      {/* Acceptance */}
                      <div className="col-span-2 text-center">
                        <div className="h-4 bg-slate-200 rounded w-12 mx-auto animate-pulse" />
                      </div>

                      {/* Difficulty */}
                      <div className="col-span-2 text-center">
                        <Badge
                          variant="outline"
                          className="border-slate-200 bg-slate-100 w-16 h-6 animate-pulse"
                        />
                      </div>

                      {/* Frequency */}
                      <div className="col-span-2 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {[1, 2, 3, 4, 5].map((bar) => (
                            <div
                              key={bar}
                              className="w-1 h-3 rounded-full bg-slate-200 animate-pulse"
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </div>
  );
}

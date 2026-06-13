export default function ResearcherLoading() {
  return (
    <div className="space-y-6 max-w-4xl">
      {/* Page header skeleton */}
      <div className="page-header">
        <div className="skeleton h-8 w-48 rounded-xl" />
        <div className="skeleton h-4 w-64 rounded-lg mt-2" />
      </div>
      {/* Cards skeleton */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="skeleton h-40 rounded-2xl" />
        <div className="skeleton h-40 rounded-2xl" />
      </div>
      {/* Upload zone skeleton */}
      <div className="skeleton h-48 rounded-2xl" />
      {/* Table skeleton */}
      <div className="skeleton h-64 rounded-2xl" />
    </div>
  );
}

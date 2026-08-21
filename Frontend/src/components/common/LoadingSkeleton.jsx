function LoadingSkeleton({ rows = 4 }) {
  return (
    <div className="space-y-3" aria-label="Loading content">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="rounded-lg border border-[#334155]/15 bg-[#FFFFFF] p-4">
          <div className="h-4 w-1/3 rounded bg-[#334155]/10" />
          <div className="mt-3 h-3 w-2/3 rounded bg-[#334155]/10" />
          <div className="mt-3 h-3 w-1/2 rounded bg-[#334155]/10" />
        </div>
      ))}
    </div>
  );
}

export default LoadingSkeleton;

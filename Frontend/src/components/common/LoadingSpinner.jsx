function LoadingSpinner({ label = 'Loading...' }) {
  return (
    <div className="flex items-center justify-center gap-3 py-6 text-[#334155]">
      <span className="h-5 w-5 rounded-full border-2 border-[#2563EB]/30 border-t-[#2563EB]" />
      <span className="text-sm font-semibold">{label}</span>
    </div>
  );
}

export default LoadingSpinner;

function LoadingFullScreen({ label = 'Loading secure workspace...' }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#FFFFFF] px-4 text-[#334155]">
      <div className="text-center">
        <span className="mx-auto block h-12 w-12 rounded-full border-4 border-[#2563EB]/25 border-t-[#2563EB]" />
        <p className="mt-4 text-sm font-semibold">{label}</p>
      </div>
    </main>
  );
}

export default LoadingFullScreen;

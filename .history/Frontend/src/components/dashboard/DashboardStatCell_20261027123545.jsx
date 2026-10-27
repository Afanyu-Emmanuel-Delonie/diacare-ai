function LogoMarkGhost() {
  return (
    <svg
      width="110" height="110" viewBox="0 0 52 52" fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="absolute -right-3 -bottom-3 opacity-[0.12]"
      aria-hidden="true"
    >
      <rect width="52" height="52" rx="14" fill="white"/>
      <path d="M26 11C26 11 15 20 15 30C15 36.6 19.9 42 26 42C32.1 42 37 36.6 37 30C37 20 26 11 26 11Z" fill="white"/>
      <path d="M26 19C26 19 20 24.5 20 30C20 33.3 22.7 36 26 36C29.3 36 32 33.3 32 30C32 24.5 26 19 26 19Z" fill="white"/>
      <circle cx="26" cy="30" r="3" fill="white"/>
    </svg>
  );
}

function DashboardStatCell({ icon: Icon, label, value, helper, color, urgent = false, bold = false }) {
  const isPositive = urgent && Number(value) > 0;

  if (bold) {
    return (
      <div className="relative overflow-hidden rounded-2xl bg-[#2563EB] p-4 shadow-md shadow-blue-300/40">
        <LogoMarkGhost />
        <div className="flex items-start justify-between gap-3">
          <p className="text-sm font-medium text-blue-100">{label}</p>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/20">
            <Icon size={18} className="text-white" />
          </div>
        </div>
        <p className="mt-3 text-3xl font-bold text-white">{value}</p>
        {helper && (
          <p className="relative mt-2 inline-flex max-w-full items-center rounded-full bg-white/15 px-2 py-0.5 text-[11px] leading-snug text-blue-50">
            {helper}
          </p>
        )}
      </div>
    );
  }

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border p-4 shadow-sm shadow-slate-200/40 `}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-[#64748B]">{label}</p>
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full" style={{ background: `${color}16`, color }}>
          <Icon size={18} />
        </div>
      </div>
      <p className="mt-3 text-3xl font-bold" style={{ color: isPositive ? '#DC2626' : '#0F172A' }}>
        {value}
      </p>
      {helper && (
        <p
          className="mt-2 inline-flex max-w-full items-center rounded-full px-2 py-0.5 text-[11px] font-medium leading-snug"
          style={{ background: `${color}14`, color }}
        >
          {helper}
        </p>
      )}
      <span className="absolute inset-x-0 bottom-0 h-1" style={{ background: color }} aria-hidden="true" />
    </div>
  );
}

export default DashboardStatCell;

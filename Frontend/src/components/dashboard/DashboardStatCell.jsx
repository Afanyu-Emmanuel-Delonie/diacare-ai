function DashboardStatCell({ icon: Icon, label, value, helper, color, urgent = false }) {
  const isPositive = urgent && Number(value) > 0;
  return (
    <div className={`flex items-start gap-3 rounded-xl border p-4 ${isPositive ? 'border-[#DC2626]/20 bg-[#FEF2F2]' : 'border-[#E2E8F0] bg-white'}`}>
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg" style={{ background: `${color}16`, color }}>
        <Icon size={18} />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-[#64748B]">{label}</p>
        <p className="mt-0.5 text-xl font-bold" style={{ color: isPositive ? '#DC2626' : '#1E293B' }}>
          {value}
        </p>
        <p className="mt-0.5 text-[11px] leading-snug text-[#94A3B8]">{helper}</p>
      </div>
    </div>
  );
}

export default DashboardStatCell;

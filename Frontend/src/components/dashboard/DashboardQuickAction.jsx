import { Link } from 'react-router-dom';
import { MdArrowForward } from 'react-icons/md';

function DashboardQuickAction({ icon: Icon, label, description, to, color }) {
  return (
    <Link
      to={to}
      className="group flex items-center gap-3 rounded-2xl border border-[#F1F5F9] bg-white p-4 shadow-sm shadow-slate-200/40 transition-colors hover:border-[#2563EB]/35 hover:bg-[#F8FAFC]"
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl" style={{ background: `${color}16`, color }}>
        <Icon size={19} />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-[#1E293B]">{label}</p>
        <p className="truncate text-xs text-[#94A3B8]">{description}</p>
      </div>
      <MdArrowForward className="ml-auto shrink-0 text-[#CBD5E1] transition-colors group-hover:text-[#2563EB]" />
    </Link>
  );
}

export default DashboardQuickAction;

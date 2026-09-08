import { Link } from 'react-router-dom';
import { MdArrowForward } from 'react-icons/md';

function DashboardPanel({ title, description, action, to, children, className = '' }) {
  return (
    <section className={`rounded-xl border border-[#E2E8F0] bg-white p-5 ${className}`}>
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold text-[#1E293B]">{title}</h2>
          {description && <p className="mt-1 text-xs text-[#94A3B8]">{description}</p>}
        </div>
        {action && (
          <Link to={to} className="flex shrink-0 items-center gap-1 text-xs font-semibold text-[#2563EB] hover:underline">
            {action} <MdArrowForward size={13} />
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}

export default DashboardPanel;

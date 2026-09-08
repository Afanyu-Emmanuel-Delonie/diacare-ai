import { useState } from 'react';
import { MdFilterList, MdExpandMore, MdExpandLess, MdClose } from 'react-icons/md';

function FilterPanel({ children, actions, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);

  // Count active filters by inspecting child props
  const childArray = Array.isArray(children) ? children.flat().filter(Boolean) : children ? [children] : [];

  return (
    <div className="rounded-2xl border border-[#e2e8f0] bg-white overflow-hidden">
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#f1f5f9]">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-2 text-sm font-semibold text-[#334155] hover:text-[#2563EB] transition-colors"
        >
          <MdFilterList size={18} className="text-[#2563EB]" />
          Filters
          {open ? <MdExpandLess size={16} className="text-[#94a3b8]" /> : <MdExpandMore size={16} className="text-[#94a3b8]" />}
        </button>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>

      {/* Filter fields */}
      {open && (
        <div className="p-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {children}
          </div>
        </div>
      )}
    </div>
  );
}

export default FilterPanel;

import { MdSearch, MdClose } from 'react-icons/md';

function SearchInput({ value, onChange, placeholder = 'Search records…', label = 'Search', id = 'search' }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-xs font-semibold uppercase tracking-wide text-[#64748b]">
        {label}
      </label>
      <div className="relative">
        <MdSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8] pointer-events-none" />
        <input
          id={id}
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="h-10 w-full rounded-xl border border-[#e2e8f0] bg-[#f8fafc] pl-9 pr-9 text-sm text-[#0f172a] placeholder:text-[#94a3b8] outline-none transition focus:border-[#2563EB] focus:bg-white focus:ring-2 focus:ring-[#2563EB]/15"
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-0.5 text-[#94a3b8] hover:text-[#475569] transition-colors"
            aria-label="Clear search"
          >
            <MdClose size={14} />
          </button>
        )}
      </div>
    </div>
  );
}

export default SearchInput;

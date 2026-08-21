function Input({ label, id, error, className = '', required, ...props }) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={id} className="block text-sm font-semibold text-[#334155]">
          {label} {required && <span className="text-[#DC2626]">*</span>}
        </label>
      )}
      <input
        id={id}
        required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`min-h-11 w-full rounded-lg border bg-white px-3.5 text-sm text-[#0f172a] outline-none placeholder:text-[#94a3b8] transition focus:ring-2 focus:ring-[#2563EB]/25 ${
          error ? 'border-[#DC2626]' : 'border-[#cbd5e1] focus:border-[#2563EB]'
        } ${className}`}
        {...props}
      />
      {error && (
        <p id={`${id}-error`} className="flex items-center gap-1 text-xs font-medium text-[#DC2626]">
          <span>⚠</span> {error}
        </p>
      )}
    </div>
  );
}

export default Input;

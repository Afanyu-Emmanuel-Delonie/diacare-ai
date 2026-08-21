import { useState } from 'react';

const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

function PasswordField({ id, label, error, register, required = true, autoComplete = 'current-password', placeholder, validation = {} }) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-semibold text-[#334155]">
        {label} {required && <span className="text-[#DC2626]">*</span>}
      </label>
      <div className={`flex rounded-lg border bg-white transition focus-within:ring-2 focus-within:ring-[#2563EB]/25 ${
        error ? 'border-[#DC2626]' : 'border-[#cbd5e1] focus-within:border-[#2563EB]'
      }`}>
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          autoComplete={autoComplete}
          placeholder={placeholder}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          className="min-h-11 w-full rounded-l-lg bg-transparent px-3.5 text-sm text-[#0f172a] placeholder:text-[#94a3b8] outline-none"
          {...register(id, {
            required: required ? `${label} is required.` : false,
            ...validation
          })}
        />
        <button
          type="button"
          className="flex min-h-11 items-center px-3.5 text-[#64748b] hover:text-[#2563EB] transition-colors"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Hide password' : 'Show password'}
          tabIndex={-1}
        >
          {visible ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </div>
      {error && (
        <p id={`${id}-error`} className="flex items-center gap-1 text-xs font-medium text-[#DC2626]">
          <span>⚠</span> {error.message}
        </p>
      )}
    </div>
  );
}

export default PasswordField;

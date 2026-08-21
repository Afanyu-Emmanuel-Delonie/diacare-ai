import { useEffect, useState } from 'react';
import { getUsers, getUserDisplayName } from '../../services/userService.js';

/**
 * Staff selector — loads users and filters by role.
 * Props:
 *   value    — current userId
 *   onChange — called with { target: { name, value } }
 *   name     — field name
 *   label    — label text
 *   role     — 'DOCTOR' | 'NURSE' | 'CAREGIVER' etc. (optional, shows all if omitted)
 *   required — bool
 *   disabled — bool
 *   optional — if true, adds "(optional)" to label and empty option
 *   error    — error string
 */
function StaffSelect({ value, onChange, name, label, role, required = false, disabled = false, optional = true, error }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    getUsers()
      .then((res) => {
        if (!mounted) return;
        const all = Array.isArray(res.data) ? res.data : [];
        setUsers(role ? all.filter((u) => u.role === role) : all);
      })
      .catch(() => { if (mounted) setUsers([]); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [role]);

  const handleChange = (e) => onChange({ target: { name, value: e.target.value } });

  const displayLabel = label + (optional && !required ? ' (optional)' : '');

  return (
    <div className="space-y-1.5">
      <label htmlFor={name} className="block text-sm font-semibold text-[#334155]">
        {displayLabel}{required && <span className="ml-0.5 text-[#DC2626]">*</span>}
      </label>
      <select
        id={name}
        name={name}
        value={value}
        onChange={handleChange}
        required={required}
        disabled={disabled || loading}
        aria-invalid={Boolean(error)}
        className="min-h-11 w-full rounded-xl border border-[#CBD5E1] bg-white px-3 text-sm text-[#0F172A] outline-none transition focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/10 disabled:cursor-not-allowed disabled:bg-[#F8FAFC] disabled:opacity-70"
      >
        <option value="">{loading ? `Loading ${label.toLowerCase()}s…` : `Select ${label.toLowerCase()}`}</option>
        {users.map((u) => (
          <option key={u.id} value={u.id}>
            {getUserDisplayName(u)}
          </option>
        ))}
      </select>
      {error && <p className="text-xs font-medium text-[#DC2626]">{error}</p>}
    </div>
  );
}

export default StaffSelect;

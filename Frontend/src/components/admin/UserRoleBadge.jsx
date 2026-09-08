const ROLE_COLORS = {
  ADMIN: '#7C3AED',
  DOCTOR: '#16A34A',
  NURSE: '#F59E0B',
  CAREGIVER: '#0EA5E9',
  PATIENT: '#2563EB',
};

function UserRoleBadge({ role }) {
  const color = ROLE_COLORS[role] || '#64748B';
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold"
      style={{ background: `${color}18`, color }}
    >
      {role}
    </span>
  );
}

export default UserRoleBadge;

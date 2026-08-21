const styles = {
  neutral: 'border-[#334155]/25 bg-[#334155]/10 text-[#334155]',
  success: 'border-[#16A34A]/25 bg-[#16A34A]/10 text-[#16A34A]',
  warning: 'border-[#F59E0B]/25 bg-[#F59E0B]/10 text-[#F59E0B]',
  critical: 'border-[#DC2626]/25 bg-[#DC2626]/10 text-[#DC2626]',
  info: 'border-[#0EA5E9]/25 bg-[#0EA5E9]/10 text-[#0EA5E9]'
};

function Badge({ children, variant = 'neutral' }) {
  return (
    <span className={`inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-semibold ${styles[variant]}`}>
      {children}
    </span>
  );
}

export default Badge;

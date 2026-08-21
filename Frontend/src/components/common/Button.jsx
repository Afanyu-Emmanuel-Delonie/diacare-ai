const variants = {
  primary: 'bg-[#2563EB] text-[#FFFFFF] border-[#2563EB] hover:bg-[#2563EB]/90',
  secondary: 'bg-[#FFFFFF] text-[#2563EB] border-[#2563EB] hover:bg-[#2563EB]/10',
  success: 'bg-[#16A34A] text-[#FFFFFF] border-[#16A34A] hover:bg-[#16A34A]/90',
  warning: 'bg-[#F59E0B] text-[#FFFFFF] border-[#F59E0B] hover:bg-[#F59E0B]/90',
  critical: 'bg-[#DC2626] text-[#FFFFFF] border-[#DC2626] hover:bg-[#DC2626]/90'
};

function Button({ children, type = 'button', variant = 'primary', className = '', ...props }) {
  return (
    <button
      type={type}
      className={`inline-flex min-h-11 items-center justify-center rounded-md border px-4 py-2 text-center text-sm font-semibold leading-5 transition focus-visible:ring-2 focus-visible:ring-[#2563EB]/30 disabled:cursor-not-allowed disabled:opacity-60 sm:min-h-10 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;

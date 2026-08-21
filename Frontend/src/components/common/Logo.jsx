import { BRAND } from '../../constants/auth';

export default function Logo({ size = 32, showName = false, nameClass = '', color }) {
  return (
    <div className="flex items-center gap-3">
      <svg width={size} height={size} viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="52" height="52" rx="14" fill="#2563EB"/>
        <path d="M26 11C26 11 15 20 15 30C15 36.6 19.9 42 26 42C32.1 42 37 36.6 37 30C37 20 26 11 26 11Z" fill="#BFDBFE"/>
        <path d="M26 19C26 19 20 24.5 20 30C20 33.3 22.7 36 26 36C29.3 36 32 33.3 32 30C32 24.5 26 19 26 19Z" fill="#EFF6FF"/>
        <circle cx="26" cy="30" r="3" fill="#10B981"/>
      </svg>
      {showName && (
        <span className={`text-2xl font-bold tracking-tight ${nameClass}`} style={color ? { color } : undefined}>
          {BRAND.name}
        </span>
      )}
    </div>
  );
}

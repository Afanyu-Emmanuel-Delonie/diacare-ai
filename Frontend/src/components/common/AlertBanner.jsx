import Badge from './Badge.jsx';
import useDismissibleUi from '../../hooks/useDismissibleUi.js';
import { MdClose } from 'react-icons/md';

const variants = {
  success: 'border-[#16A34A]/25 bg-[#16A34A]/10 text-[#334155]',
  warning: 'border-[#F59E0B]/25 bg-[#F59E0B]/10 text-[#334155]',
  critical: 'border-[#DC2626]/25 bg-[#DC2626]/10 text-[#334155]',
  info: 'border-[#0EA5E9]/25 bg-[#0EA5E9]/10 text-[#334155]'
};

function AlertBanner({
  title,
  message,
  variant = 'info',
  badge = 'INFO',
  noticeId,
  dismissible = true
}) {
  const stableId = noticeId || title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const { dismissed, dismiss } = useDismissibleUi('notice', stableId);

  if (dismissible && dismissed) return null;

  return (
    <section className={`rounded-lg border p-4 ${variants[variant] || variants.info}`} role={variant === 'critical' ? 'alert' : 'status'}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-base font-bold text-[#334155]">{title}</h2>
          <p className="mt-2 text-sm leading-6 text-[#334155]/85">{message}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Badge variant={variant}>{badge}</Badge>
          {dismissible && (
            <button
              type="button"
              onClick={dismiss}
              className="flex h-10 w-10 items-center justify-center rounded-lg text-[#334155]/70 transition-colors hover:bg-white/70 hover:text-[#334155] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]"
              aria-label={`Dismiss ${title}`}
              title="Dismiss"
            >
              <MdClose size={20} aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

export default AlertBanner;

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { MdMoreVert } from 'react-icons/md';

function ActionsMenu({ items }) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const triggerRef = useRef(null);
  const menuRef = useRef(null);

  const visibleItems = items.filter(Boolean);

  const computePosition = () => {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const menuWidth = 190;
    const left = Math.min(rect.right - menuWidth, window.innerWidth - menuWidth - 8);
    setCoords({ top: rect.bottom + 4, left: Math.max(8, left) });
  };

  const toggle = () => {
    if (!open) computePosition();
    setOpen((v) => !v);
  };

  useEffect(() => {
    if (!open) return undefined;

    const handleOutside = (e) => {
      if (menuRef.current?.contains(e.target) || triggerRef.current?.contains(e.target)) return;
      setOpen(false);
    };
    const handleKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    const handleReposition = () => computePosition();

    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('keydown', handleKey);
    window.addEventListener('scroll', handleReposition, true);
    window.addEventListener('resize', handleReposition);

    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('keydown', handleKey);
      window.removeEventListener('scroll', handleReposition, true);
      window.removeEventListener('resize', handleReposition);
    };
  }, [open]);

  if (visibleItems.length === 0) return null;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={toggle}
        aria-label="Open actions menu"
        aria-haspopup="true"
        aria-expanded={open}
        className={`flex h-8 w-8 items-center justify-center rounded-lg text-[#64748b] transition-colors hover:bg-[#334155]/10 hover:text-[#1e293b] ${open ? 'bg-[#334155]/10 text-[#1e293b]' : ''}`}
      >
        <MdMoreVert size={18} />
      </button>
      {open && createPortal(
        <div
          ref={menuRef}
          role="menu"
          style={{ position: 'fixed', top: coords.top, left: coords.left, zIndex: 1000, width: 190 }}
          className="overflow-hidden rounded-xl border border-[#334155]/10 bg-white py-1 shadow-lg"
        >
          {visibleItems.map((item, idx) => (
            <button
              key={item.key || idx}
              type="button"
              role="menuitem"
              onClick={() => { setOpen(false); item.onClick(); }}
              className={`flex w-full items-center gap-2 px-3.5 py-2 text-left text-sm font-medium transition-colors ${
                item.danger ? 'text-[#DC2626] hover:bg-[#DC2626]/10' : 'text-[#334155] hover:bg-[#f1f5f9]'
              }`}
            >
              {item.icon ? <item.icon size={16} className="shrink-0" /> : null}
              {item.label}
            </button>
          ))}
        </div>,
        document.body
      )}
    </>
  );
}

export default ActionsMenu;

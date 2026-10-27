import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  MdMenu,
  MdSearch,
  MdPerson,
  MdLogout,
  MdSettings,
  MdKeyboardArrowDown,
  MdMessage,
} from 'react-icons/md';
import NotificationBell from './NotificationBell.jsx';
import useAuth from '../../hooks/useAuth.js';
import { roleLabels } from '../../utils/roles.js';
import { useOnClickOutside } from '../../hooks/useOnClickOutside.js';
import { getMessages } from '../../services/messageService.js';

const PAGE_TITLES = {
  '/dashboard/patients':                  'Patients',
  '/dashboard/medical-records':           'Medical Records',
  '/dashboard/medical-records/history':   'Medical History',
  '/dashboard/appointments':              'Appointments',
  '/dashboard/appointments/upcoming':     'Upcoming Appointments',
  '/dashboard/appointments/calendar':     'Appointment Calendar',
  '/dashboard/appointments/history':      'Appointment History',
  '/dashboard/medications':               'Medications',
  '/dashboard/medications/schedule':      'Medication Schedule',
  '/dashboard/medications/adherence':     'Medication Adherence',
  '/dashboard/medications/missed-alerts': 'Missed Medication Alerts',
  '/dashboard/monitoring':                'Health Monitoring',
  '/dashboard/monitoring/timeline':       'Health Timeline',
  '/dashboard/ai-risk':                   'AI Risk Prediction',
  '/dashboard/ai-risk/patient-summary':   'Patient Risk Summary',
  '/dashboard/ai-risk/history':           'Risk History',
  '/dashboard/ai-risk/abnormal-alerts':   'Abnormal Alerts',
  '/dashboard/ai-risk/emergency':         'Emergency Risk View',
  '/dashboard/notifications':             'Notifications',
  '/dashboard/messages':                  'Messages',
  '/dashboard/reports/history':           'Report History',
  '/dashboard/reports/download':          'Report Downloads',
  '/dashboard/knowledge/diabetes-types':  'Knowledge Base',
  '/dashboard/admin/users':               'User Management',
  '/dashboard/admin/audit-logs':          'Audit Logs',
  '/dashboard/admin/settings':            'System Settings',
  '/dashboard/admin':                     'Admin Dashboard',
  '/dashboard/doctor':                    'Doctor Dashboard',
  '/dashboard/nurse':                     'Nurse Dashboard',
  '/dashboard/patient':                   'Patient Dashboard',
  '/dashboard/caregiver':                 'Caregiver Dashboard',
  '/dashboard/profile':                   'My Profile',
  '/dashboard/settings':                  'Settings',
};

function getPageTitle(pathname) {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  const match = Object.keys(PAGE_TITLES)
    .sort((a, b) => b.length - a.length)
    .find((key) => pathname.startsWith(key));
  return match ? PAGE_TITLES[match] : 'Dashboard';
}

function ProfileDropdown({ user, userRole, onLogout }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useOnClickOutside(ref, () => setOpen(false));

  const initial = (user?.username?.[0] || user?.email?.[0] || '?').toUpperCase();

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 rounded-lg p-1.5 hover:bg-[#f1f5f9] transition-colors"
        aria-label="Profile menu"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1e3a5f] text-xs font-bold text-white">
          {initial}
        </div>
        <MdKeyboardArrowDown size={16} className="text-[#94a3b8]" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-[#e2e8f0] bg-white py-1.5 shadow-lg z-50">
          <div className="border-b border-[#e2e8f0] px-4 py-3">
            <p className="text-sm font-semibold text-[#0f172a]">{user?.username || user?.email}</p>
            <p className="text-xs text-[#64748b] mt-0.5">{roleLabels[userRole]}</p>
            {user?.email && <p className="text-xs text-[#94a3b8] mt-0.5">{user.email}</p>}
          </div>
          <Link
            to="/dashboard/profile"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#475569] hover:bg-[#f8fafc] hover:text-[#0f172a]"
          >
            <MdPerson size={16} />
            My Profile
          </Link>
          <Link
            to="/dashboard/settings"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#475569] hover:bg-[#f8fafc] hover:text-[#0f172a]"
          >
            <MdSettings size={16} />
            Settings
          </Link>
          <div className="my-1 border-t border-[#e2e8f0]" />
          <button
            type="button"
            onClick={onLogout}
            className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-[#DC2626] hover:bg-[#fef2f2]"
          >
            <MdLogout size={16} />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}

function Navbar({ onMobileMenuClick, onCollapseClick, collapsed }) {
  const { pathname } = useLocation();
  const { user, userRole, signOut } = useAuth();
  const navigate = useNavigate();
  const [unreadMessages, setUnreadMessages] = useState(0);

  useEffect(() => {
    let mounted = true;
    getMessages()
      .then((res) => {
        if (!mounted) return;
        const msgs = Array.isArray(res.data) ? res.data : [];
        setUnreadMessages(msgs.filter((m) => !m.read).length);
      })
      .catch(() => {})
    return () => { mounted = false; };
  }, [pathname]);

  const handleLogout = () => {
    signOut();
    navigate('/login', { replace: true });
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-[#e2e8f0] bg-white px-4 md:px-5">
      {/* Hamburger — mobile opens drawer, desktop collapses sidebar */}
      <button
        type="button"
        className="flex h-9 w-9 items-center justify-center rounded-lg text-[#64748b] hover:bg-[#f1f5f9] transition-colors lg:flex"
        onClick={() => {
          onCollapseClick();
          onMobileMenuClick();
        }}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        <MdMenu size={22} />
      </button>

      {/* Page title */}
      <h1 className="text-base font-semibold text-[#0f172a]">{getPageTitle(pathname)}</h1>

      <div className="flex flex-1 items-center justify-end gap-1">
        {/* Search */}
        <div className="relative hidden sm:block mr-1">
          <MdSearch size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]" />
          <input
            type="search"
            placeholder="Search..."
            className="h-9 w-48 rounded-lg border border-[#e2e8f0] bg-[#f8fafc] pl-9 pr-3 text-sm text-[#0f172a] placeholder:text-[#94a3b8] outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 transition lg:w-60"
          />
        </div>

        {/* Messages */}
        <Link
          to="/dashboard/messages"
          className="relative flex h-9 w-9 items-center justify-center rounded-lg text-[#64748b] hover:bg-[#f1f5f9] transition-colors"
          aria-label={`Messages${unreadMessages ? `, ${unreadMessages} unread` : ''}`}
        >
          <MdMessage size={20} />
          {unreadMessages > 0 && (
            <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#DC2626] text-[10px] font-bold text-white leading-none">
              {unreadMessages > 9 ? '9+' : unreadMessages}
            </span>
          )}
        </Link>

        <NotificationBell />

        <ProfileDropdown user={user} userRole={userRole} onLogout={handleLogout} />
      </div>
    </header>
  );
}

export default Navbar;

import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  MdDashboard,
  MdPeople,
  MdFolderOpen,
  MdCalendarMonth,
  MdMedication,
  MdMonitorHeart,
  MdPsychology,
  MdBarChart,
  MdMenuBook,
  MdManageAccounts,
  MdSecurity,
  MdSettings,
  MdChevronRight,
  MdExpandMore,
  MdLogout,
} from 'react-icons/md';
import Logo from '../common/Logo.jsx';
import useAuth from '../../hooks/useAuth.js';
import { ROLES, roleLabels, roleDashboardPaths } from '../../utils/roles.js';
import { useNavigate } from 'react-router-dom';

function buildNav(role) {
  const isAdmin = role === ROLES.ADMIN;
  const isPatient = role === ROLES.PATIENT;
  const isCaregiver = role === ROLES.CAREGIVER;

  if (isPatient) {
    return [
      { label: 'Dashboard',        icon: MdDashboard,    path: roleDashboardPaths[role], single: true },
      { label: 'Health Monitoring', icon: MdMonitorHeart, path: '/dashboard/monitoring',  single: true },
      { label: 'Medications',       icon: MdMedication,   path: '/dashboard/medications', single: true },
      { label: 'Appointments',      icon: MdCalendarMonth,path: '/dashboard/appointments',single: true },
      { label: 'AI Risk',           icon: MdPsychology,   path: '/dashboard/ai-risk',     single: true },
      { label: 'Knowledge Base',    icon: MdMenuBook,     path: '/dashboard/knowledge/diabetes-types', single: true },
    ];
  }

  if (isCaregiver) {
    return [
      { label: 'Dashboard',         icon: MdDashboard,     path: roleDashboardPaths[role], single: true },
      { label: 'My Patients',       icon: MdPeople,        path: '/dashboard/patients', single: true },
      { label: 'Health Monitoring', icon: MdMonitorHeart,  path: '/dashboard/monitoring', single: true },
      { label: 'Medications',       icon: MdMedication,    path: '/dashboard/medications', single: true },
      { label: 'Appointments',      icon: MdCalendarMonth, path: '/dashboard/appointments', single: true },
      { label: 'Risk Alerts',       icon: MdPsychology,    path: '/dashboard/ai-risk/abnormal-alerts', single: true },
    ];
  }

  return [
    {
      label: 'Dashboard',
      icon: MdDashboard,
      path: roleDashboardPaths[role],
      single: true,
    },
    {
      label: 'Patients',
      icon: MdPeople,
      path: '/dashboard/patients',
      single: true,
    },
    {
      label: 'Medical Records',
      icon: MdFolderOpen,
      children: [
        { label: 'Records', path: '/dashboard/medical-records' },
        { label: 'History', path: '/dashboard/medical-records/history' },
      ],
    },
    {
      label: 'Appointments',
      icon: MdCalendarMonth,
      path: '/dashboard/appointments',
      single: true,
    },
    {
      label: 'Medications',
      icon: MdMedication,
      children: [
        { label: 'All Medications', path: '/dashboard/medications' },
        { label: 'Schedule',        path: '/dashboard/medications/schedule' },
        { label: 'Adherence',       path: '/dashboard/medications/adherence' },
        { label: 'Missed Alerts',   path: '/dashboard/medications/missed-alerts' },
      ],
    },
    {
      label: 'Health Monitoring',
      icon: MdMonitorHeart,
      children: [
        { label: 'Dashboard',     path: '/dashboard/monitoring' },
        { label: 'Health Timeline', path: '/dashboard/monitoring/timeline' },
      ],
    },
    {
      label: 'AI Risk',
      icon: MdPsychology,
      children: [
        { label: 'Risk Prediction',   path: '/dashboard/ai-risk' },
        { label: 'Patient Summary',   path: '/dashboard/ai-risk/patient-summary' },
        { label: 'History',           path: '/dashboard/ai-risk/history' },
        { label: 'Abnormal Alerts',   path: '/dashboard/ai-risk/abnormal-alerts' },
        { label: 'Emergency View',    path: '/dashboard/ai-risk/emergency' },
      ],
    },
    {
      label: 'Reports',
      icon: MdBarChart,
      children: [
        { label: 'History',   path: '/dashboard/reports/history' },
        { label: 'Downloads', path: '/dashboard/reports/download' },
      ],
    },
    {
      label: 'Knowledge Base',
      icon: MdMenuBook,
      children: [
        { label: 'Diabetes Types',     path: '/dashboard/knowledge/diabetes-types' },
        { label: 'Blood Sugar Ranges', path: '/dashboard/knowledge/blood-sugar-ranges' },
        { label: 'Food Guidance',      path: '/dashboard/knowledge/food-guidance' },
        { label: 'Rwanda Local Foods', path: '/dashboard/knowledge/rwanda-local-foods' },
        { label: 'FAQs',               path: '/dashboard/knowledge/faqs' },
      ],
    },
    ...(isAdmin ? [
      {
        label: 'User Management',
        icon: MdManageAccounts,
        path: '/dashboard/admin/users',
        single: true,
      },
      {
        label: 'Audit & Security',
        icon: MdSecurity,
        children: [
          { label: 'Audit Logs',        path: '/dashboard/admin/audit-logs' },
          { label: 'System Reports',    path: '/dashboard/reports/admin/system' },
          { label: 'Security Reports',  path: '/dashboard/reports/admin/audit' },
        ],
      },
      {
        label: 'Settings',
        icon: MdSettings,
        path: '/dashboard/admin/settings',
        single: true,
      },
    ] : []),
  ];
}

function NavItem({ item, onNavigate, collapsed }) {
  const { pathname } = useLocation();
  const isChildActive = item.children?.some((c) => pathname.startsWith(c.path));
  const [open, setOpen] = useState(isChildActive);

  if (item.single) {
    return (
      <NavLink
        to={item.path}
        end
        onClick={onNavigate}
        title={collapsed ? item.label : undefined}
        className={({ isActive }) =>
          `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
            isActive
              ? 'bg-white/15 text-white'
              : 'text-white/70 hover:bg-white/10 hover:text-white'
          } ${collapsed ? 'justify-center px-0' : ''}`
        }
      >
        <item.icon size={18} className="shrink-0" />
        {!collapsed && item.label}
      </NavLink>
    );
  }

  if (collapsed) {
    return (
      <NavLink
        to={item.children[0].path}
        title={item.label}
        className={({ isActive }) =>
          `flex justify-center rounded-lg py-2.5 text-sm transition-colors ${
            isChildActive
              ? 'bg-white/15 text-white'
              : 'text-white/70 hover:bg-white/10 hover:text-white'
          }`
        }
      >
        <item.icon size={18} className="shrink-0" />
      </NavLink>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
          isChildActive
            ? 'bg-white/15 text-white'
            : 'text-white/70 hover:bg-white/10 hover:text-white'
        }`}
      >
        <item.icon size={18} className="shrink-0" />
        <span className="flex-1 text-left">{item.label}</span>
        {open ? <MdExpandMore size={16} /> : <MdChevronRight size={16} />}
      </button>
      {open && (
        <div className="ml-6 mt-0.5 space-y-0.5 border-l border-white/15 pl-3">
          {item.children.map((child) => (
            <NavLink
              key={child.path}
              to={child.path}
              onClick={onNavigate}
              className={({ isActive }) =>
                `block rounded-md px-3 py-2 text-sm transition-colors ${
                  isActive ? 'font-semibold text-white' : 'text-white/60 hover:text-white'
                }`
              }
            >
              {child.label}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
}

function Sidebar({ onNavigate, collapsed = false }) {
  const { userRole, signOut } = useAuth();
  const navigate = useNavigate();
  const nav = buildNav(userRole);

  const handleLogout = () => {
    signOut();
    navigate('/login', { replace: true });
  };

  return (
    <aside className={`flex h-full flex-col bg-[#1e3a5f] transition-all duration-200 ${collapsed ? 'w-16' : 'w-64'}`}>
      {/* Logo */}
      <div className={`flex h-16 shrink-0 items-center border-b border-white/10 ${collapsed ? 'justify-center px-0' : 'gap-3 px-5'}`}>
        <Logo showName={false} size={32} />
        {!collapsed && (
          <>
            <span className="text-base font-bold tracking-tight text-white">Diacare</span>
          </>
        )}
      </div>

      {/* Nav */}
      <nav className="no-scrollbar flex-1 overflow-y-auto px-2 py-4 space-y-0.5" aria-label="Sidebar navigation">
        {nav.map((item) => (
          <NavItem key={item.path || item.label} item={item} onNavigate={onNavigate} collapsed={collapsed} />
        ))}
      </nav>

      {/* Logout */}
      <div className="shrink-0 border-t border-white/10 px-2 py-3">
        <button
          type="button"
          onClick={handleLogout}
          title={collapsed ? 'Sign out' : undefined}
          className={`flex w-full items-center rounded-lg px-3 py-2.5 text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white transition-colors ${
            collapsed ? 'justify-center' : 'gap-3'
          }`}
        >
          <MdLogout size={18} className="shrink-0" />
          {!collapsed && 'Sign out'}
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;

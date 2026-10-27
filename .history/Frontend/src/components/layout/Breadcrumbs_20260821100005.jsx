import { Link, useLocation } from 'react-router-dom';
import useAuth from '../../hooks/useAuth.js';
import { getDashboardPath } from '../../utils/roles.js';

const labels = {
  admin: 'Admin Dashboard',
  users: 'Users',
  audit: 'Audit',
  'audit-logs': 'Audit Logs',
  settings: 'System Settings',
  reports: 'Reports',
  system: 'System',
  doctor: 'Doctor Dashboard',
  nurse: 'Nurse Dashboard',
  caregiver: 'Caregiver Dashboard',
  patient: 'Patient Dashboard',
  patients: 'Patients',
  new: 'Create',
  edit: 'Edit',
  'medical-records': 'Medical Records',
  history: 'History',
  monitoring: 'Health Monitoring',
  glucose: 'Blood Glucose',
  'blood-pressure': 'Blood Pressure',
  weight: 'Weight',
  hba1c: 'HbA1c',
  labs: 'Lab Results',
  medications: 'Medications',
  schedule: 'Schedule',
  adherence: 'Adherence',
  'missed-alerts': 'Missed Alerts',
  appointments: 'Appointments',
  calendar: 'Calendar',
  upcoming: 'Upcoming',
  'ai-risk': 'AI-supported Risk',
  'patient-summary': 'Patient Summary',
  'abnormal-alerts': 'Abnormal Alerts',
  emergency: 'Emergency',
  notifications: 'Notifications',
  'medication-reminders': 'Medication Reminders',
  'appointment-reminders': 'Appointment Reminders',
  'ai-risk-alerts': 'AI-supported Risk Alerts',
  'emergency-alerts': 'Emergency Alerts',
  messages: 'Messages',
  conversation: 'Conversation',
  knowledge: 'Knowledge Base',
  'diabetes-types': 'Diabetes Types',
  'blood-sugar-ranges': 'Blood Sugar Ranges',
  'hba1c-ranges': 'HbA1c Ranges',
  'medication-education': 'Medication Education',
  complications: 'Complications',
  'emergency-signs': 'Emergency Signs',
  'exercise-recommendations': 'Exercise Recommendations',
  'food-guidance': 'Food Guidance',
  'rwanda-local-foods': 'Rwanda Local Foods',
  faqs: 'FAQs',
  download: 'Download',
  downloads: 'Downloads'
};

const roleDashboardSegments = new Set(['admin', 'doctor', 'nurse', 'caregiver', 'patient']);

function Breadcrumbs() {
  const { pathname } = useLocation();
  const { userRole } = useAuth();

  if (!pathname.startsWith('/dashboard')) {
    return null;
  }

  const parts = pathname.split('/').filter(Boolean).slice(1);

  if (!parts.length) {
    return null;
  }

  // A role dashboard already has its own page title, so repeating
  // "Dashboard / [Role] Dashboard" adds noise without navigation value.
  if (parts.length === 1 && roleDashboardSegments.has(parts[0])) {
    return null;
  }

  const crumbs = parts.map((part, index) => {
    const path = `/dashboard/${parts.slice(0, index + 1).join('/')}`;
    const isId = /^\d+$/.test(part);

    return {
      label: isId ? 'Details' : labels[part] || formatLabel(part),
      path,
      current: index === parts.length - 1
    };
  });

  return (
    <nav aria-label="Breadcrumb" className="mb-4 text-sm">
      <ol className="flex flex-wrap items-center gap-2 text-[#334155]/75">
        <li>
          <Link to={getDashboardPath(userRole)} className="font-semibold text-[#2563EB] hover:underline">
            Dashboard
          </Link>
        </li>
        {crumbs.map((crumb) => (
          <li key={crumb.path} className="flex items-center gap-2">
            <span aria-hidden="true" className="text-[#334155]/45">
              /
            </span>
            {crumb.current ? (
              <span aria-current="page" className="font-semibold text-[#334155]">
                {crumb.label}
              </span>
            ) : (
              <Link to={crumb.path} className="font-semibold text-[#2563EB] hover:underline">
                {crumb.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

function formatLabel(value) {
  return value
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export default Breadcrumbs;

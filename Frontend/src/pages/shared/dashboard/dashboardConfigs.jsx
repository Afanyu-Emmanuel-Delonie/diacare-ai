import {
  MdCalendarToday,
  MdCheckCircle,
  MdChatBubbleOutline,
  MdDescription,
  MdEmergency,
  MdErrorOutline,
  MdEventAvailable,
  MdFactCheck,
  MdFavorite,
  MdLocalHospital,
  MdMedicalServices,
  MdMedication,
  MdMonitorHeart,
  MdNoteAlt,
  MdPeople,
  MdPeopleAlt,
  MdPsychology,
  MdScience,
  MdVolunteerActivism,
  MdWarning,
  MdWaterDrop,
} from 'react-icons/md';
import Badge from '../../../components/common/Badge.jsx';

const statusBadge = (row) => <Badge variant={row.variant || row.statusVariant || 'info'}>{row.status || 'Pending'}</Badge>;
const riskBadge = (row) => {
  const risk = String(row.riskLevel || row.priority || row.status || 'INFO').toUpperCase();
  const variant = ['HIGH', 'CRITICAL', 'EMERGENCY'].includes(risk) ? 'critical' : ['MODERATE', 'WARNING', 'REVIEW'].includes(risk) ? 'warning' : 'success';
  return <Badge variant={variant}>{risk}</Badge>;
};

export const adminDashboardConfig = {
  role: 'ADMIN',
  title: 'Admin Dashboard',
  description: 'System management workspace for users, reports, audit activity, and security oversight.',
  stats: [
    { key: 'totalUsers', title: 'Total Users', description: 'Registered system accounts', icon: MdPeople, color: '#2563EB' },
    { key: 'totalPatients', title: 'Total Patients', description: 'Patient profiles in care', icon: MdPeopleAlt, color: '#0EA5E9' },
    { key: 'totalDoctors', title: 'Total Doctors', description: 'Doctor accounts', icon: MdLocalHospital, color: '#16A34A' },
    { key: 'totalNurses', title: 'Total Nurses', description: 'Nurse accounts', icon: MdMedicalServices, color: '#F59E0B' },
    { key: 'totalCaregivers', title: 'Total Caregivers', description: 'Caregiver accounts', icon: MdVolunteerActivism, color: '#7C3AED' },
    { key: 'totalReports', title: 'Total Reports', description: 'Generated reports', icon: MdDescription, color: '#64748B' }
  ],
  chartKey: 'userRoleTrend',
  chartTitle: 'User and Report Activity',
  chartSubtitle: 'Daily activity from connected backend statistics.',
  tableKey: 'securityAlerts',
  tableTitle: 'Security Alerts',
  tableSubtitle: 'Recent events requiring administrator attention.',
  tableColumns: [
    { key: 'event', header: 'Activity' },
    { key: 'email', header: 'Email' },
    { key: 'time', header: 'Date and Time' },
    { key: 'status', header: 'Status', render: statusBadge }
  ],
  activityKey: 'recentSystemActivity',
  activityTitle: 'Recent System Activity',
  activitySubtitle: 'User, report, and audit events from the system.',
  alertKey: 'securityAlerts',
  alertTitle: 'Security Overview',
  alertSubtitle: 'Security alerts visible only to administrators.',
  actions: [
    { title: 'Manage Users', description: 'Create, edit, deactivate, and review system users.', actionLabel: 'Open users', to: '/dashboard/admin/users' },
    { title: 'View Reports', description: 'Open operational and audit reporting dashboards.', actionLabel: 'Open reports', to: '/dashboard/reports/admin/system' },
    { title: 'View Audit Logs', description: 'Review login, access, and report download activity.', actionLabel: 'Open audit logs', to: '/dashboard/admin/audit-logs' },
    { title: 'System Settings', description: 'Update report branding and system settings.', actionLabel: 'Open settings', to: '/dashboard/admin/settings' }
  ]
};

export const doctorDashboardConfig = {
  role: 'DOCTOR',
  title: 'Doctor Dashboard',
  description: 'Clinical workspace for assigned patients, appointments, AI alerts, reviews, and lab follow-up.',
  stats: [
    { key: 'assignedPatients', title: 'Assigned Patients', description: 'Patients assigned to you', icon: MdPeople, color: '#2563EB' },
    { key: 'todaysAppointments', title: "Today's Appointments", description: 'Appointments scheduled today', icon: MdCalendarToday, color: '#0EA5E9' },
    { key: 'recentGlucoseAlerts', title: 'Glucose Alerts', description: 'Recent abnormal glucose alerts', icon: MdWaterDrop, color: '#F59E0B' },
    { key: 'aiRiskAlerts', title: 'AI-supported Risk Alerts', description: 'AI-supported monitoring alerts to review', icon: MdPsychology, color: '#7C3AED' },
    { key: 'pendingReviews', title: 'Pending Reviews', description: 'Clinical reviews awaiting action', icon: MdFactCheck, color: '#64748B' },
    { key: 'recentLabResults', title: 'Recent Lab Results', description: 'New lab results available', icon: MdScience, color: '#16A34A' }
  ],
  chartKey: 'glucoseTrend',
  chartTitle: 'Assigned Patient Glucose Trend',
  chartSubtitle: 'Recent glucose pattern for assigned patients.',
  chartSuffix: ' mg/dL',
  tableKey: 'assignedPatientSummary',
  tableTitle: 'Assigned Patients',
  tableSubtitle: 'Patients available through doctor assignment rules.',
  tableColumns: [
    { key: 'name', header: 'Patient' },
    { key: 'diabetesType', header: 'Diabetes Type' },
    { key: 'lastReading', header: 'Latest Reading' },
    { key: 'riskLevel', header: 'Risk', render: riskBadge }
  ],
  activityKey: 'recentClinicalActivity',
  activityTitle: 'Recent Lab Results and Reviews',
  activitySubtitle: 'Clinical updates from assigned patient records.',
  alertKey: 'aiRiskAlertsList',
  alertTitle: 'AI-supported and Glucose Alerts',
  alertSubtitle: 'Monitoring alerts for assigned patients only.',
  actions: [
    { title: 'View Patients', description: 'Open assigned patient profiles and care records.', actionLabel: 'Open patients', to: '/dashboard/patients' },
    { title: 'Add Review', description: 'Create a clinical review for an assigned patient.', actionLabel: 'Write review', to: '/dashboard/medical-records/new' },
    { title: 'View Reports', description: 'Open clinical reports for assigned patients.', actionLabel: 'Open reports', to: '/dashboard/reports/doctor/patient' }
  ]
};

export const nurseDashboardConfig = {
  role: 'NURSE',
  title: 'Nurse Dashboard',
  description: 'Care support workspace for assigned patients, monitoring tasks, reminders, and abnormal readings.',
  stats: [
    { key: 'assignedPatients', title: 'Assigned Patients', description: 'Patients assigned for nursing support', icon: MdPeople, color: '#2563EB' },
    { key: 'medicationReminders', title: 'Medication Reminders', description: 'Medication reminders due today', icon: MdMedication, color: '#16A34A' },
    { key: 'missedMedicationAlerts', title: 'Missed Medication Alerts', description: 'Missed medication follow-ups', icon: MdErrorOutline, color: '#DC2626' },
    { key: 'glucoseMonitoringTasks', title: 'Glucose Tasks', description: 'Glucose monitoring tasks', icon: MdMonitorHeart, color: '#0EA5E9' },
    { key: 'todaysAppointments', title: "Today's Appointments", description: 'Appointments requiring nursing support', icon: MdCalendarToday, color: '#64748B' },
    { key: 'abnormalReadings', title: 'Abnormal Readings', description: 'Readings requiring follow-up', icon: MdWarning, color: '#F59E0B' }
  ],
  chartKey: 'glucoseMonitoringTrend',
  chartTitle: 'Glucose Monitoring Tasks',
  chartSubtitle: 'Monitoring activity for assigned patients.',
  tableKey: 'careTasks',
  tableTitle: 'Care Tasks',
  tableSubtitle: 'Tasks visible to nursing users.',
  tableColumns: [
    { key: 'patientName', header: 'Patient' },
    { key: 'task', header: 'Task' },
    { key: 'time', header: 'Time' },
    { key: 'status', header: 'Status', render: statusBadge }
  ],
  activityKey: 'recentCareActivity',
  activityTitle: 'Recent Nursing Activity',
  activitySubtitle: 'Recent care actions and patient monitoring updates.',
  alertKey: 'abnormalReadingAlerts',
  alertTitle: 'Abnormal Readings',
  alertSubtitle: 'Assigned patient alerts for nursing follow-up.',
  actions: [
    { title: 'Monitor Patients', description: 'View assigned patient monitoring records.', actionLabel: 'Open patients', to: '/dashboard/patients' },
    { title: 'View Alerts', description: 'Review medication and abnormal reading alerts.', actionLabel: 'Open alerts', to: '/dashboard/notifications' },
    { title: 'Update Care Notes', description: 'Open medical records to add allowed care updates.', actionLabel: 'Open records', to: '/dashboard/medical-records' }
  ]
};

export const caregiverDashboardConfig = {
  role: 'CAREGIVER',
  title: 'Caregiver Dashboard',
  description: 'Support workspace for assigned patient reminders, care notes, appointments, and emergency alerts.',
  stats: [
    { key: 'assignedPatients', title: 'Assigned Patients', description: 'Patients assigned to your care', icon: MdPeople, color: '#2563EB' },
    { key: 'medicationReminders', title: 'Medication Reminders', description: 'Medication reminders to support', icon: MdMedication, color: '#16A34A' },
    { key: 'appointmentReminders', title: 'Appointment Reminders', description: 'Upcoming appointment reminders', icon: MdEventAvailable, color: '#0EA5E9' },
    { key: 'careNotes', title: 'Care Notes', description: 'Care notes recorded', icon: MdNoteAlt, color: '#64748B' },
    { key: 'abnormalAlerts', title: 'Abnormal Alerts', description: 'Alerts requiring caregiver attention', icon: MdWarning, color: '#F59E0B' },
    { key: 'emergencyAlerts', title: 'Emergency Alerts', description: 'Emergency alerts from assigned patients', icon: MdEmergency, color: '#DC2626' }
  ],
  chartKey: 'reminderCompletionTrend',
  chartTitle: 'Reminder Completion',
  chartSubtitle: 'Medication and appointment reminder completion.',
  chartSuffix: '%',
  tableKey: 'assignedPatientSummary',
  tableTitle: 'Assigned Patient Summary',
  tableSubtitle: 'Limited patient summary available to caregivers.',
  tableColumns: [
    { key: 'patientName', header: 'Patient' },
    { key: 'nextReminder', header: 'Next Reminder' },
    { key: 'nextAppointment', header: 'Appointment' },
    { key: 'status', header: 'Status', render: statusBadge }
  ],
  activityKey: 'careNotesList',
  activityTitle: 'Care Notes',
  activitySubtitle: 'Recent notes and reminders for assigned patients.',
  alertKey: 'caregiverAlerts',
  alertTitle: 'Abnormal and Emergency Alerts',
  alertSubtitle: 'Alerts available through caregiver assignment rules.',
  actions: [
    { title: 'View Patient', description: 'Open assigned patient summary.', actionLabel: 'Open patient', to: '/dashboard/patients' },
    { title: 'View Reminders', description: 'Review medication and appointment reminders.', actionLabel: 'Open reminders', to: '/dashboard/notifications' },
    { title: 'Add Care Note', description: 'Open care records to add allowed notes.', actionLabel: 'Open notes', to: '/dashboard/medical-records' }
  ]
};

export const patientDashboardConfig = {
  role: 'PATIENT',
  title: 'Patient Dashboard',
  description: 'Personal health workspace for glucose trends, medication schedule, appointments, AI-supported monitoring, food guidance, and reports.',
  stats: [
    { key: 'healthSummary', title: 'Health Summary', description: 'Latest personal health status', icon: MdFavorite, color: '#DC2626', fallback: 'No data' },
    { key: 'latestGlucoseReading', title: 'Latest Glucose', description: 'Most recent glucose reading', icon: MdWaterDrop, color: '#0EA5E9', fallback: 'No data' },
    { key: 'medicationAdherence', title: 'Medication Adherence', description: 'Medication adherence summary', icon: MdCheckCircle, color: '#16A34A', fallback: 'No data' },
    { key: 'upcomingAppointments', title: 'Upcoming Appointments', description: 'Scheduled appointments', icon: MdCalendarToday, color: '#2563EB' },
    { key: 'aiRiskLevel', title: 'AI-supported Risk Level', description: 'Monitoring support only', icon: MdPsychology, color: '#7C3AED', fallback: 'No data' },
    { key: 'doctorComments', title: 'Doctor Comments', description: 'Recent doctor comments', icon: MdChatBubbleOutline, color: '#64748B', fallback: 'No data' }
  ],
  chartKey: 'glucoseTrend',
  chartTitle: 'Glucose Trend',
  chartSubtitle: 'Personal glucose readings over time.',
  chartSuffix: ' mg/dL',
  tableKey: 'medicationSchedule',
  tableTitle: 'Medication Schedule',
  tableSubtitle: 'Medication schedule from your care team.',
  tableColumns: [
    { key: 'name', header: 'Medication' },
    { key: 'time', header: 'Time' },
    { key: 'instructions', header: 'Instructions' },
    { key: 'status', header: 'Status', render: statusBadge }
  ],
  activityKey: 'upcomingAppointmentsList',
  activityTitle: 'Upcoming Appointments and Food Guidance',
  activitySubtitle: 'Appointments, doctor comments, and food guidance updates.',
  alertKey: 'patientAlerts',
  alertTitle: 'AI-supported Risk and Emergency Alerts',
  alertSubtitle: 'This information supports monitoring only and does not replace professional medical advice.',
  actions: [
    { title: 'Health Summary', description: 'Open your personal profile and health summary.', actionLabel: 'Open profile', to: '/dashboard/patients' },
    { title: 'Medication Schedule', description: 'View medication schedule from your care team.', actionLabel: 'Open medications', to: '/dashboard/medications' },
    { title: 'Food Guidance', description: 'Read educational food guidance and Rwanda local foods.', actionLabel: 'Open guidance', to: '/dashboard/knowledge/food-guidance' },
    { title: 'Download Reports', description: 'Open your report history and download available reports.', actionLabel: 'Open reports', to: '/dashboard/reports/patient/my-report' }
  ]
};

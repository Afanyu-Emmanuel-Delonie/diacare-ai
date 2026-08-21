import { Navigate, Route, Routes } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout.jsx';
import useAuth from '../hooks/useAuth.js';
import Login from '../pages/auth/Login.jsx';
import Register from '../pages/auth/Register.jsx';
import AuditLogsPage from '../pages/admin/audit/AuditLogsPage.jsx';
import AdminDashboard from '../pages/admin/AdminDashboard.jsx';
import AdminSystemReports from '../pages/admin/reports/AdminSystemReports.jsx';
import SystemSettingsPage from '../pages/admin/settings/SystemSettingsPage.jsx';
import SecurityAuditReports from '../pages/admin/reports/SecurityAuditReports.jsx';
import CreateUser from '../pages/admin/users/CreateUser.jsx';
import EditUser from '../pages/admin/users/EditUser.jsx';
import UserDetails from '../pages/admin/users/UserDetails.jsx';
import UsersList from '../pages/admin/users/UsersList.jsx';
import CaregiverDashboard from '../pages/caregiver/CaregiverDashboard.jsx';
import DoctorDashboard from '../pages/doctor/DoctorDashboard.jsx';
import NurseDashboard from '../pages/nurse/NurseDashboard.jsx';
import PatientDashboard from '../pages/patient/PatientDashboard.jsx';
import CreatePatient from '../pages/shared/patients/CreatePatient.jsx';
import EditPatient from '../pages/shared/patients/EditPatient.jsx';
import PatientDetails from '../pages/shared/patients/PatientDetails.jsx';
import PatientList from '../pages/shared/patients/PatientList.jsx';
import CreateMedicalRecord from '../pages/shared/medical-records/CreateMedicalRecord.jsx';
import EditMedicalRecord from '../pages/shared/medical-records/EditMedicalRecord.jsx';
import MedicalRecordDetails from '../pages/shared/medical-records/MedicalRecordDetails.jsx';
import MedicalRecordList from '../pages/shared/medical-records/MedicalRecordList.jsx';
import PatientMedicalHistory from '../pages/shared/medical-records/PatientMedicalHistory.jsx';
import HealthMonitoringDashboard from '../pages/shared/health-monitoring/HealthMonitoringDashboard.jsx';
import HealthMonitoringPage from '../pages/shared/health-monitoring/HealthMonitoringPage.jsx';
import HealthRecordDetails from '../pages/shared/health-monitoring/HealthRecordDetails.jsx';
import HealthRecordForm from '../pages/shared/health-monitoring/HealthRecordForm.jsx';
import PatientHealthTimeline from '../pages/shared/health-monitoring/PatientHealthTimeline.jsx';
import AppointmentDetails from '../pages/shared/appointments/AppointmentDetails.jsx';
import AppointmentCalendarPage from '../pages/shared/appointments/AppointmentCalendarPage.jsx';
import AppointmentHistory from '../pages/shared/appointments/AppointmentHistory.jsx';
import AppointmentList from '../pages/shared/appointments/AppointmentList.jsx';
import CreateAppointment from '../pages/shared/appointments/CreateAppointment.jsx';
import EditAppointment from '../pages/shared/appointments/EditAppointment.jsx';
import UpcomingAppointments from '../pages/shared/appointments/UpcomingAppointments.jsx';
import AbnormalReadingAlerts from '../pages/shared/ai-risk/AbnormalReadingAlerts.jsx';
import AiRiskPrediction from '../pages/shared/ai-risk/AiRiskPrediction.jsx';
import EmergencyRiskView from '../pages/shared/ai-risk/EmergencyRiskView.jsx';
import PatientRiskSummary from '../pages/shared/ai-risk/PatientRiskSummary.jsx';
import RiskPredictionHistory from '../pages/shared/ai-risk/RiskPredictionHistory.jsx';
import CreateMedication from '../pages/shared/medications/CreateMedication.jsx';
import EditMedication from '../pages/shared/medications/EditMedication.jsx';
import MedicationDetails from '../pages/shared/medications/MedicationDetails.jsx';
import MedicationList from '../pages/shared/medications/MedicationList.jsx';
import MedicationSchedule from '../pages/shared/medications/MedicationSchedule.jsx';
import MedicationAdherence from '../pages/shared/medications/MedicationAdherence.jsx';
import MissedMedicationAlerts from '../pages/shared/medications/MissedMedicationAlerts.jsx';
import ChatWindow from '../pages/shared/messages/ChatWindow.jsx';
import MessageDetails from '../pages/shared/messages/MessageDetails.jsx';
import MessageList from '../pages/shared/messages/MessageList.jsx';
import SendMessage from '../pages/shared/messages/SendMessage.jsx';
import KnowledgeArticlePage from '../pages/shared/knowledge-base/KnowledgeArticlePage.jsx';
import LocalFoodsPage from '../pages/shared/knowledge-base/LocalFoodsPage.jsx';
import ClinicalPatientReportPage from '../pages/shared/reports/ClinicalPatientReportPage.jsx';
import PatientHealthReport from '../pages/shared/reports/PatientHealthReport.jsx';
import ReportDownloadPage from '../pages/shared/reports/ReportDownloadPage.jsx';
import ReportHistoryPage from '../pages/shared/reports/ReportHistoryPage.jsx';
import AiRiskAlerts from '../pages/shared/notifications/AiRiskAlerts.jsx';
import AppointmentReminders from '../pages/shared/notifications/AppointmentReminders.jsx';
import EmergencyAlerts from '../pages/shared/notifications/EmergencyAlerts.jsx';
import MedicationReminders from '../pages/shared/notifications/MedicationReminders.jsx';
import NotificationCenter from '../pages/shared/notifications/NotificationCenter.jsx';
import NotificationHistory from '../pages/shared/notifications/NotificationHistory.jsx';
import ProfilePage from '../pages/shared/ProfilePage.jsx';
import SettingsPage from '../pages/shared/SettingsPage.jsx';
import NotFound from '../pages/shared/NotFound.jsx';
import EmptyDashboardState from '../pages/system/EmptyDashboardState.jsx';
import LoadingFullScreen from '../pages/system/LoadingFullScreen.jsx';
import ServerErrorPage from '../pages/system/ServerErrorPage.jsx';
import SessionExpiredPage from '../pages/system/SessionExpiredPage.jsx';
import UnauthorizedPage from '../pages/system/UnauthorizedPage.jsx';
import ProtectedRoute from './ProtectedRoute.jsx';
import PublicRoute from './PublicRoute.jsx';
import RoleBasedRoute from './RoleBasedRoute.jsx';
import { getDashboardPath, ROLES } from '../utils/roles.js';

function DashboardRedirect() {
  const { userRole } = useAuth();
  return <Navigate to={getDashboardPath(userRole)} replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/403" element={<UnauthorizedPage />} />
      <Route path="/500" element={<ServerErrorPage />} />
      <Route path="/session-expired" element={<SessionExpiredPage />} />
      <Route path="/loading" element={<LoadingFullScreen />} />
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardRedirect />} />
        <Route path="empty" element={<EmptyDashboardState />} />
        <Route
          path="admin"
          element={
            <RoleBasedRoute allowedRoles={[ROLES.ADMIN]}>
              <AdminDashboard />
            </RoleBasedRoute>
          }
        />
        <Route
          path="admin/users"
          element={
            <RoleBasedRoute allowedRoles={[ROLES.ADMIN]}>
              <UsersList />
            </RoleBasedRoute>
          }
        />
        <Route
          path="admin/users/new"
          element={
            <RoleBasedRoute allowedRoles={[ROLES.ADMIN]}>
              <CreateUser />
            </RoleBasedRoute>
          }
        />
        <Route
          path="admin/users/:id"
          element={
            <RoleBasedRoute allowedRoles={[ROLES.ADMIN]}>
              <UserDetails />
            </RoleBasedRoute>
          }
        />
        <Route
          path="admin/users/:id/edit"
          element={
            <RoleBasedRoute allowedRoles={[ROLES.ADMIN]}>
              <EditUser />
            </RoleBasedRoute>
          }
        />
        <Route
          path="admin/audit-logs"
          element={
            <RoleBasedRoute allowedRoles={[ROLES.ADMIN]}>
              <AuditLogsPage />
            </RoleBasedRoute>
          }
        />
        <Route
          path="admin/settings"
          element={
            <RoleBasedRoute allowedRoles={[ROLES.ADMIN]}>
              <SystemSettingsPage />
            </RoleBasedRoute>
          }
        />
        <Route
          path="reports/admin/system"
          element={
            <RoleBasedRoute allowedRoles={[ROLES.ADMIN]}>
              <AdminSystemReports />
            </RoleBasedRoute>
          }
        />
        <Route
          path="reports/admin/audit"
          element={
            <RoleBasedRoute allowedRoles={[ROLES.ADMIN]}>
              <SecurityAuditReports />
            </RoleBasedRoute>
          }
        />
        <Route
          path="reports/doctor/patient"
          element={
            <RoleBasedRoute allowedRoles={[ROLES.DOCTOR]}>
              <ClinicalPatientReportPage audience="doctor" />
            </RoleBasedRoute>
          }
        />
        <Route
          path="reports/nurse/patient"
          element={
            <RoleBasedRoute allowedRoles={[ROLES.NURSE]}>
              <ClinicalPatientReportPage audience="nurse" />
            </RoleBasedRoute>
          }
        />
        <Route
          path="reports/caregiver/patient"
          element={
            <RoleBasedRoute allowedRoles={[ROLES.CAREGIVER]}>
              <ClinicalPatientReportPage audience="caregiver" />
            </RoleBasedRoute>
          }
        />
        <Route
          path="reports/patient/my-report"
          element={
            <RoleBasedRoute allowedRoles={[ROLES.PATIENT]}>
              <PatientHealthReport />
            </RoleBasedRoute>
          }
        />
        <Route
          path="reports/history"
          element={
            <RoleBasedRoute allowedRoles={[ROLES.ADMIN, ROLES.DOCTOR, ROLES.NURSE, ROLES.CAREGIVER, ROLES.PATIENT]}>
              <ReportHistoryPage />
            </RoleBasedRoute>
          }
        />
        <Route
          path="reports/download"
          element={
            <RoleBasedRoute allowedRoles={[ROLES.ADMIN, ROLES.DOCTOR, ROLES.NURSE, ROLES.CAREGIVER, ROLES.PATIENT]}>
              <ReportDownloadPage />
            </RoleBasedRoute>
          }
        />
        <Route
          path="patients"
          element={
            <RoleBasedRoute allowedRoles={[ROLES.ADMIN, ROLES.DOCTOR, ROLES.NURSE, ROLES.CAREGIVER, ROLES.PATIENT]}>
              <PatientList />
            </RoleBasedRoute>
          }
        />
        <Route
          path="patients/new"
          element={
            <RoleBasedRoute allowedRoles={[ROLES.ADMIN, ROLES.DOCTOR, ROLES.NURSE]}>
              <CreatePatient />
            </RoleBasedRoute>
          }
        />
        <Route
          path="patients/:id"
          element={
            <RoleBasedRoute allowedRoles={[ROLES.ADMIN, ROLES.DOCTOR, ROLES.NURSE, ROLES.CAREGIVER, ROLES.PATIENT]}>
              <PatientDetails />
            </RoleBasedRoute>
          }
        />
        <Route
          path="patients/:id/edit"
          element={
            <RoleBasedRoute allowedRoles={[ROLES.ADMIN, ROLES.DOCTOR, ROLES.NURSE, ROLES.CAREGIVER, ROLES.PATIENT]}>
              <EditPatient />
            </RoleBasedRoute>
          }
        />
        <Route
          path="medical-records"
          element={
            <RoleBasedRoute allowedRoles={[ROLES.ADMIN, ROLES.DOCTOR, ROLES.NURSE, ROLES.CAREGIVER, ROLES.PATIENT]}>
              <MedicalRecordList />
            </RoleBasedRoute>
          }
        />
        <Route
          path="medical-records/new"
          element={
            <RoleBasedRoute allowedRoles={[ROLES.DOCTOR]}>
              <CreateMedicalRecord />
            </RoleBasedRoute>
          }
        />
        <Route
          path="medical-records/history"
          element={
            <RoleBasedRoute allowedRoles={[ROLES.ADMIN, ROLES.DOCTOR, ROLES.NURSE, ROLES.CAREGIVER, ROLES.PATIENT]}>
              <PatientMedicalHistory />
            </RoleBasedRoute>
          }
        />
        <Route
          path="medical-records/:id"
          element={
            <RoleBasedRoute allowedRoles={[ROLES.ADMIN, ROLES.DOCTOR, ROLES.NURSE, ROLES.CAREGIVER, ROLES.PATIENT]}>
              <MedicalRecordDetails />
            </RoleBasedRoute>
          }
        />
        <Route
          path="medical-records/:id/edit"
          element={
            <RoleBasedRoute allowedRoles={[ROLES.DOCTOR]}>
              <EditMedicalRecord />
            </RoleBasedRoute>
          }
        />
        <Route
          path="monitoring"
          element={
            <RoleBasedRoute allowedRoles={[ROLES.ADMIN, ROLES.DOCTOR, ROLES.NURSE, ROLES.CAREGIVER, ROLES.PATIENT]}>
              <HealthMonitoringDashboard />
            </RoleBasedRoute>
          }
        />
        <Route
          path="monitoring/timeline"
          element={
            <RoleBasedRoute allowedRoles={[ROLES.ADMIN, ROLES.DOCTOR, ROLES.NURSE, ROLES.CAREGIVER, ROLES.PATIENT]}>
              <PatientHealthTimeline />
            </RoleBasedRoute>
          }
        />
        <Route
          path="monitoring/glucose"
          element={
            <RoleBasedRoute allowedRoles={[ROLES.ADMIN, ROLES.DOCTOR, ROLES.NURSE, ROLES.PATIENT]}>
              <HealthMonitoringPage type="glucose" />
            </RoleBasedRoute>
          }
        />
        <Route
          path="monitoring/glucose/new"
          element={
            <RoleBasedRoute allowedRoles={[ROLES.DOCTOR, ROLES.NURSE, ROLES.PATIENT]}>
              <HealthRecordForm type="glucose" />
            </RoleBasedRoute>
          }
        />
        <Route
          path="monitoring/glucose/:id"
          element={
            <RoleBasedRoute allowedRoles={[ROLES.ADMIN, ROLES.DOCTOR, ROLES.NURSE, ROLES.PATIENT]}>
              <HealthRecordDetails type="glucose" />
            </RoleBasedRoute>
          }
        />
        <Route
          path="monitoring/glucose/:id/edit"
          element={
            <RoleBasedRoute allowedRoles={[ROLES.DOCTOR, ROLES.NURSE, ROLES.PATIENT]}>
              <HealthRecordForm type="glucose" mode="edit" />
            </RoleBasedRoute>
          }
        />
        <Route
          path="medications"
          element={
            <RoleBasedRoute allowedRoles={[ROLES.ADMIN, ROLES.DOCTOR, ROLES.NURSE, ROLES.CAREGIVER, ROLES.PATIENT]}>
              <MedicationList />
            </RoleBasedRoute>
          }
        />
        <Route
          path="medications/new"
          element={
            <RoleBasedRoute allowedRoles={[ROLES.DOCTOR]}>
              <CreateMedication />
            </RoleBasedRoute>
          }
        />
        <Route
          path="medications/schedule"
          element={
            <RoleBasedRoute allowedRoles={[ROLES.ADMIN, ROLES.DOCTOR, ROLES.NURSE, ROLES.CAREGIVER, ROLES.PATIENT]}>
              <MedicationSchedule />
            </RoleBasedRoute>
          }
        />
        <Route
          path="medications/adherence"
          element={
            <RoleBasedRoute allowedRoles={[ROLES.ADMIN, ROLES.DOCTOR, ROLES.NURSE, ROLES.PATIENT]}>
              <MedicationAdherence />
            </RoleBasedRoute>
          }
        />
        <Route
          path="medications/missed-alerts"
          element={
            <RoleBasedRoute allowedRoles={[ROLES.ADMIN, ROLES.DOCTOR, ROLES.NURSE, ROLES.CAREGIVER, ROLES.PATIENT]}>
              <MissedMedicationAlerts />
            </RoleBasedRoute>
          }
        />
        <Route
          path="medications/:id"
          element={
            <RoleBasedRoute allowedRoles={[ROLES.ADMIN, ROLES.DOCTOR, ROLES.NURSE, ROLES.CAREGIVER, ROLES.PATIENT]}>
              <MedicationDetails />
            </RoleBasedRoute>
          }
        />
        <Route
          path="medications/:id/edit"
          element={
            <RoleBasedRoute allowedRoles={[ROLES.DOCTOR]}>
              <EditMedication />
            </RoleBasedRoute>
          }
        />
        <Route
          path="appointments"
          element={
            <RoleBasedRoute allowedRoles={[ROLES.ADMIN, ROLES.DOCTOR, ROLES.NURSE, ROLES.PATIENT]}>
              <AppointmentList />
            </RoleBasedRoute>
          }
        />
        <Route
          path="appointments/new"
          element={
            <RoleBasedRoute allowedRoles={[ROLES.DOCTOR, ROLES.NURSE, ROLES.PATIENT]}>
              <CreateAppointment />
            </RoleBasedRoute>
          }
        />
        <Route
          path="appointments/calendar"
          element={
            <RoleBasedRoute allowedRoles={[ROLES.ADMIN, ROLES.DOCTOR, ROLES.NURSE, ROLES.PATIENT]}>
              <AppointmentCalendarPage />
            </RoleBasedRoute>
          }
        />
        <Route
          path="appointments/upcoming"
          element={
            <RoleBasedRoute allowedRoles={[ROLES.ADMIN, ROLES.DOCTOR, ROLES.NURSE, ROLES.PATIENT]}>
              <UpcomingAppointments />
            </RoleBasedRoute>
          }
        />
        <Route
          path="appointments/history"
          element={
            <RoleBasedRoute allowedRoles={[ROLES.ADMIN, ROLES.DOCTOR, ROLES.NURSE, ROLES.PATIENT]}>
              <AppointmentHistory />
            </RoleBasedRoute>
          }
        />
        <Route
          path="appointments/:id"
          element={
            <RoleBasedRoute allowedRoles={[ROLES.ADMIN, ROLES.DOCTOR, ROLES.NURSE, ROLES.PATIENT]}>
              <AppointmentDetails />
            </RoleBasedRoute>
          }
        />
        <Route
          path="appointments/:id/edit"
          element={
            <RoleBasedRoute allowedRoles={[ROLES.DOCTOR, ROLES.NURSE]}>
              <EditAppointment />
            </RoleBasedRoute>
          }
        />
        <Route
          path="ai-risk"
          element={
            <RoleBasedRoute allowedRoles={[ROLES.ADMIN, ROLES.DOCTOR, ROLES.NURSE, ROLES.CAREGIVER, ROLES.PATIENT]}>
              <AiRiskPrediction />
            </RoleBasedRoute>
          }
        />
        <Route
          path="ai-risk/patient-summary"
          element={
            <RoleBasedRoute allowedRoles={[ROLES.ADMIN, ROLES.DOCTOR, ROLES.NURSE, ROLES.CAREGIVER, ROLES.PATIENT]}>
              <PatientRiskSummary />
            </RoleBasedRoute>
          }
        />
        <Route
          path="ai-risk/history"
          element={
            <RoleBasedRoute allowedRoles={[ROLES.ADMIN, ROLES.DOCTOR, ROLES.NURSE, ROLES.CAREGIVER, ROLES.PATIENT]}>
              <RiskPredictionHistory />
            </RoleBasedRoute>
          }
        />
        <Route
          path="ai-risk/abnormal-alerts"
          element={
            <RoleBasedRoute allowedRoles={[ROLES.ADMIN, ROLES.DOCTOR, ROLES.NURSE, ROLES.CAREGIVER, ROLES.PATIENT]}>
              <AbnormalReadingAlerts />
            </RoleBasedRoute>
          }
        />
        <Route
          path="ai-risk/emergency"
          element={
            <RoleBasedRoute allowedRoles={[ROLES.ADMIN, ROLES.DOCTOR, ROLES.NURSE, ROLES.CAREGIVER, ROLES.PATIENT]}>
              <EmergencyRiskView />
            </RoleBasedRoute>
          }
        />
        <Route
          path="notifications"
          element={
            <RoleBasedRoute allowedRoles={[ROLES.ADMIN, ROLES.DOCTOR, ROLES.NURSE, ROLES.CAREGIVER, ROLES.PATIENT]}>
              <NotificationCenter />
            </RoleBasedRoute>
          }
        />
        <Route
          path="notifications/medication-reminders"
          element={
            <RoleBasedRoute allowedRoles={[ROLES.ADMIN, ROLES.DOCTOR, ROLES.NURSE, ROLES.CAREGIVER, ROLES.PATIENT]}>
              <MedicationReminders />
            </RoleBasedRoute>
          }
        />
        <Route
          path="notifications/appointment-reminders"
          element={
            <RoleBasedRoute allowedRoles={[ROLES.ADMIN, ROLES.DOCTOR, ROLES.NURSE, ROLES.CAREGIVER, ROLES.PATIENT]}>
              <AppointmentReminders />
            </RoleBasedRoute>
          }
        />
        <Route
          path="notifications/ai-risk-alerts"
          element={
            <RoleBasedRoute allowedRoles={[ROLES.ADMIN, ROLES.DOCTOR, ROLES.NURSE, ROLES.CAREGIVER, ROLES.PATIENT]}>
              <AiRiskAlerts />
            </RoleBasedRoute>
          }
        />
        <Route
          path="notifications/emergency-alerts"
          element={
            <RoleBasedRoute allowedRoles={[ROLES.ADMIN, ROLES.DOCTOR, ROLES.NURSE, ROLES.CAREGIVER, ROLES.PATIENT]}>
              <EmergencyAlerts />
            </RoleBasedRoute>
          }
        />
        <Route
          path="notifications/history"
          element={
            <RoleBasedRoute allowedRoles={[ROLES.ADMIN, ROLES.DOCTOR, ROLES.NURSE, ROLES.CAREGIVER, ROLES.PATIENT]}>
              <NotificationHistory />
            </RoleBasedRoute>
          }
        />
        <Route
          path="messages"
          element={
            <RoleBasedRoute allowedRoles={[ROLES.ADMIN, ROLES.DOCTOR, ROLES.NURSE, ROLES.CAREGIVER, ROLES.PATIENT]}>
              <MessageList />
            </RoleBasedRoute>
          }
        />
        <Route
          path="messages/new"
          element={
            <RoleBasedRoute allowedRoles={[ROLES.ADMIN, ROLES.DOCTOR, ROLES.NURSE, ROLES.CAREGIVER, ROLES.PATIENT]}>
              <SendMessage />
            </RoleBasedRoute>
          }
        />
        <Route
          path="messages/conversation/:patientId"
          element={
            <RoleBasedRoute allowedRoles={[ROLES.ADMIN, ROLES.DOCTOR, ROLES.NURSE, ROLES.CAREGIVER, ROLES.PATIENT]}>
              <ChatWindow />
            </RoleBasedRoute>
          }
        />
        <Route
          path="messages/:id"
          element={
            <RoleBasedRoute allowedRoles={[ROLES.ADMIN, ROLES.DOCTOR, ROLES.NURSE, ROLES.CAREGIVER, ROLES.PATIENT]}>
              <MessageDetails />
            </RoleBasedRoute>
          }
        />
        <Route
          path="knowledge/diabetes-types"
          element={
            <RoleBasedRoute allowedRoles={[ROLES.ADMIN, ROLES.DOCTOR, ROLES.NURSE, ROLES.CAREGIVER, ROLES.PATIENT]}>
              <KnowledgeArticlePage pageKey="diabetes-types" />
            </RoleBasedRoute>
          }
        />
        <Route
          path="knowledge/blood-sugar-ranges"
          element={
            <RoleBasedRoute allowedRoles={[ROLES.ADMIN, ROLES.DOCTOR, ROLES.NURSE, ROLES.CAREGIVER, ROLES.PATIENT]}>
              <KnowledgeArticlePage pageKey="blood-sugar-ranges" />
            </RoleBasedRoute>
          }
        />
        <Route
          path="knowledge/hba1c-ranges"
          element={
            <RoleBasedRoute allowedRoles={[ROLES.ADMIN, ROLES.DOCTOR, ROLES.NURSE, ROLES.CAREGIVER, ROLES.PATIENT]}>
              <KnowledgeArticlePage pageKey="hba1c-ranges" />
            </RoleBasedRoute>
          }
        />
        <Route
          path="knowledge/medication-education"
          element={
            <RoleBasedRoute allowedRoles={[ROLES.ADMIN, ROLES.DOCTOR, ROLES.NURSE, ROLES.CAREGIVER, ROLES.PATIENT]}>
              <KnowledgeArticlePage pageKey="medication-education" />
            </RoleBasedRoute>
          }
        />
        <Route
          path="knowledge/complications"
          element={
            <RoleBasedRoute allowedRoles={[ROLES.ADMIN, ROLES.DOCTOR, ROLES.NURSE, ROLES.CAREGIVER, ROLES.PATIENT]}>
              <KnowledgeArticlePage pageKey="complications" />
            </RoleBasedRoute>
          }
        />
        <Route
          path="knowledge/emergency-signs"
          element={
            <RoleBasedRoute allowedRoles={[ROLES.ADMIN, ROLES.DOCTOR, ROLES.NURSE, ROLES.CAREGIVER, ROLES.PATIENT]}>
              <KnowledgeArticlePage pageKey="emergency-signs" />
            </RoleBasedRoute>
          }
        />
        <Route
          path="knowledge/exercise-recommendations"
          element={
            <RoleBasedRoute allowedRoles={[ROLES.ADMIN, ROLES.DOCTOR, ROLES.NURSE, ROLES.CAREGIVER, ROLES.PATIENT]}>
              <KnowledgeArticlePage pageKey="exercise-recommendations" />
            </RoleBasedRoute>
          }
        />
        <Route
          path="knowledge/food-guidance"
          element={
            <RoleBasedRoute allowedRoles={[ROLES.ADMIN, ROLES.DOCTOR, ROLES.NURSE, ROLES.CAREGIVER, ROLES.PATIENT]}>
              <KnowledgeArticlePage pageKey="food-guidance" />
            </RoleBasedRoute>
          }
        />
        <Route
          path="knowledge/rwanda-local-foods"
          element={
            <RoleBasedRoute allowedRoles={[ROLES.ADMIN, ROLES.DOCTOR, ROLES.NURSE, ROLES.CAREGIVER, ROLES.PATIENT]}>
              <LocalFoodsPage />
            </RoleBasedRoute>
          }
        />
        <Route
          path="knowledge/faqs"
          element={
            <RoleBasedRoute allowedRoles={[ROLES.ADMIN, ROLES.DOCTOR, ROLES.NURSE, ROLES.CAREGIVER, ROLES.PATIENT]}>
              <KnowledgeArticlePage pageKey="faqs" />
            </RoleBasedRoute>
          }
        />
        <Route
          path="monitoring/blood-pressure"
          element={
            <RoleBasedRoute allowedRoles={[ROLES.ADMIN, ROLES.DOCTOR, ROLES.NURSE, ROLES.PATIENT]}>
              <HealthMonitoringPage type="bloodPressure" />
            </RoleBasedRoute>
          }
        />
        <Route
          path="monitoring/blood-pressure/new"
          element={
            <RoleBasedRoute allowedRoles={[ROLES.DOCTOR, ROLES.NURSE]}>
              <HealthRecordForm type="bloodPressure" />
            </RoleBasedRoute>
          }
        />
        <Route
          path="monitoring/blood-pressure/:id"
          element={
            <RoleBasedRoute allowedRoles={[ROLES.ADMIN, ROLES.DOCTOR, ROLES.NURSE, ROLES.PATIENT]}>
              <HealthRecordDetails type="bloodPressure" />
            </RoleBasedRoute>
          }
        />
        <Route
          path="monitoring/blood-pressure/:id/edit"
          element={
            <RoleBasedRoute allowedRoles={[ROLES.DOCTOR, ROLES.NURSE]}>
              <HealthRecordForm type="bloodPressure" mode="edit" />
            </RoleBasedRoute>
          }
        />
        <Route
          path="monitoring/weight"
          element={
            <RoleBasedRoute allowedRoles={[ROLES.ADMIN, ROLES.DOCTOR, ROLES.NURSE, ROLES.PATIENT]}>
              <HealthMonitoringPage type="weight" />
            </RoleBasedRoute>
          }
        />
        <Route
          path="monitoring/weight/new"
          element={
            <RoleBasedRoute allowedRoles={[ROLES.DOCTOR, ROLES.NURSE, ROLES.PATIENT]}>
              <HealthRecordForm type="weight" />
            </RoleBasedRoute>
          }
        />
        <Route
          path="monitoring/weight/:id"
          element={
            <RoleBasedRoute allowedRoles={[ROLES.ADMIN, ROLES.DOCTOR, ROLES.NURSE, ROLES.PATIENT]}>
              <HealthRecordDetails type="weight" />
            </RoleBasedRoute>
          }
        />
        <Route
          path="monitoring/weight/:id/edit"
          element={
            <RoleBasedRoute allowedRoles={[ROLES.DOCTOR, ROLES.NURSE, ROLES.PATIENT]}>
              <HealthRecordForm type="weight" mode="edit" />
            </RoleBasedRoute>
          }
        />
        <Route
          path="monitoring/hba1c"
          element={
            <RoleBasedRoute allowedRoles={[ROLES.ADMIN, ROLES.DOCTOR, ROLES.NURSE, ROLES.PATIENT]}>
              <HealthMonitoringPage type="hba1c" />
            </RoleBasedRoute>
          }
        />
        <Route
          path="monitoring/hba1c/new"
          element={
            <RoleBasedRoute allowedRoles={[ROLES.DOCTOR, ROLES.NURSE]}>
              <HealthRecordForm type="hba1c" />
            </RoleBasedRoute>
          }
        />
        <Route
          path="monitoring/hba1c/:id"
          element={
            <RoleBasedRoute allowedRoles={[ROLES.ADMIN, ROLES.DOCTOR, ROLES.NURSE, ROLES.PATIENT]}>
              <HealthRecordDetails type="hba1c" />
            </RoleBasedRoute>
          }
        />
        <Route
          path="monitoring/hba1c/:id/edit"
          element={
            <RoleBasedRoute allowedRoles={[ROLES.DOCTOR, ROLES.NURSE]}>
              <HealthRecordForm type="hba1c" mode="edit" />
            </RoleBasedRoute>
          }
        />
        <Route
          path="monitoring/labs"
          element={
            <RoleBasedRoute allowedRoles={[ROLES.ADMIN, ROLES.DOCTOR, ROLES.NURSE, ROLES.PATIENT]}>
              <HealthMonitoringPage type="labs" />
            </RoleBasedRoute>
          }
        />
        <Route
          path="monitoring/labs/new"
          element={
            <RoleBasedRoute allowedRoles={[ROLES.DOCTOR, ROLES.NURSE]}>
              <HealthRecordForm type="labs" />
            </RoleBasedRoute>
          }
        />
        <Route
          path="monitoring/labs/:id"
          element={
            <RoleBasedRoute allowedRoles={[ROLES.ADMIN, ROLES.DOCTOR, ROLES.NURSE, ROLES.PATIENT]}>
              <HealthRecordDetails type="labs" />
            </RoleBasedRoute>
          }
        />
        <Route
          path="monitoring/labs/:id/edit"
          element={
            <RoleBasedRoute allowedRoles={[ROLES.DOCTOR, ROLES.NURSE]}>
              <HealthRecordForm type="labs" mode="edit" />
            </RoleBasedRoute>
          }
        />
        <Route
          path="doctor"
          element={
            <RoleBasedRoute allowedRoles={[ROLES.DOCTOR]}>
              <DoctorDashboard />
            </RoleBasedRoute>
          }
        />
        <Route
          path="nurse"
          element={
            <RoleBasedRoute allowedRoles={[ROLES.NURSE]}>
              <NurseDashboard />
            </RoleBasedRoute>
          }
        />
        <Route
          path="patient"
          element={
            <RoleBasedRoute allowedRoles={[ROLES.PATIENT]}>
              <PatientDashboard />
            </RoleBasedRoute>
          }
        />
        <Route
          path="caregiver"
          element={
            <RoleBasedRoute allowedRoles={[ROLES.CAREGIVER]}>
              <CaregiverDashboard />
            </RoleBasedRoute>
          }
        />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default AppRoutes;

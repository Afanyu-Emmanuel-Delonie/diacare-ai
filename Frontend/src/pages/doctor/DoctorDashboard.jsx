import RoleDashboard from '../shared/dashboard/RoleDashboard.jsx';
import { doctorDashboardConfig } from '../shared/dashboard/dashboardConfigs.jsx';

function DoctorDashboard() {
  return <RoleDashboard config={doctorDashboardConfig} />;
}

export default DoctorDashboard;

import RoleDashboard from '../shared/dashboard/RoleDashboard.jsx';
import { adminDashboardConfig } from '../shared/dashboard/dashboardConfigs.jsx';

function AdminDashboard() {
  return <RoleDashboard config={adminDashboardConfig} />;
}

export default AdminDashboard;

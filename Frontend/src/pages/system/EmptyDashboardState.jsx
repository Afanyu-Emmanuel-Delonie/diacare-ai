import SystemPage from './SystemPage.jsx';

function EmptyDashboardState() {
  return (
    <SystemPage
      code="EMPTY DASHBOARD"
      title="No dashboard data yet"
      message="There is no information to show for this workspace yet. New records, reports, alerts, and activities will appear here after they are created."
      primaryAction={{ label: 'Go to dashboard', to: '/dashboard' }}
    />
  );
}

export default EmptyDashboardState;

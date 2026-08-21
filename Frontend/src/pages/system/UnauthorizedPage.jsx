import SystemPage from './SystemPage.jsx';

function UnauthorizedPage() {
  return (
    <SystemPage
      code="403"
      title="Unauthorized access"
      message="Your account does not have permission to open this page. Use the menus available to your role."
      primaryAction={{ label: 'Go to dashboard', to: '/dashboard' }}
    />
  );
}

export default UnauthorizedPage;

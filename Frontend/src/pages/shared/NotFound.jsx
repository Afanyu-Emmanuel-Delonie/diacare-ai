import SystemPage from '../system/SystemPage.jsx';

function NotFound() {
  return (
    <SystemPage
      code="404"
      title="Page not found"
      message="The page you requested is not available."
      primaryAction={{ label: 'Go to dashboard', to: '/dashboard' }}
    />
  );
}

export default NotFound;

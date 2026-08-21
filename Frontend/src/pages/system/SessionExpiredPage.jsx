import SystemPage from './SystemPage.jsx';

function SessionExpiredPage() {
  return (
    <SystemPage
      code="SESSION EXPIRED"
      title="Please sign in again"
      message="Your session has expired or your token is no longer valid. Sign in again to continue securely."
      primaryAction={{ label: 'Go to login', to: '/login' }}
    />
  );
}

export default SessionExpiredPage;

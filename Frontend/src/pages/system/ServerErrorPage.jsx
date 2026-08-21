import SystemPage from './SystemPage.jsx';

function ServerErrorPage() {
  return (
    <SystemPage
      code="500"
      title="Something went wrong"
      message="The system could not complete the request. Please try again, or contact the administrator if the issue continues."
      primaryAction={{ label: 'Go to dashboard', to: '/dashboard' }}
      secondaryAction={{ label: 'Login', to: '/login' }}
    />
  );
}

export default ServerErrorPage;

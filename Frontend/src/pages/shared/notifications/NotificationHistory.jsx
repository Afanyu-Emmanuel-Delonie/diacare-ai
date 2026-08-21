import NotificationModulePage from './NotificationModulePage.jsx';

function NotificationHistory() {
  return (
    <NotificationModulePage
      title="Notification History"
      eyebrow="History"
      description="Review read notifications and previous healthcare alerts."
      historyOnly
    />
  );
}

export default NotificationHistory;

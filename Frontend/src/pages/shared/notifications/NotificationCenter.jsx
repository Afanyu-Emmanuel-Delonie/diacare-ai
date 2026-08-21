import NotificationModulePage from './NotificationModulePage.jsx';

function NotificationCenter() {
  return (
    <NotificationModulePage
      title="Notification Center"
      eyebrow="Notifications"
      description="Review medication reminders, appointment reminders, blood glucose alerts, AI-supported risk alerts, emergency alerts, lab results, doctor reviews, and system notifications."
      showDelete
    />
  );
}

export default NotificationCenter;

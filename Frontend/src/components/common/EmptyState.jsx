import Button from './Button.jsx';
import Card from './Card.jsx';

function EmptyState({ title = 'No data available', message = 'There is no information to display yet.', actionLabel, onAction }) {
  return (
    <Card className="text-center">
      <h2 className="text-lg font-semibold text-[#334155]">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-[#334155]/80">{message}</p>
      {actionLabel && (
        <Button className="mt-5" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </Card>
  );
}

export default EmptyState;

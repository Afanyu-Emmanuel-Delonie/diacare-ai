import { Link } from 'react-router-dom';
import Button from './Button.jsx';
import Card from './Card.jsx';

function ActionCard({ title, description, actionLabel, to, onClick }) {
  const action = to ? (
    <Link to={to}>
      <Button variant="secondary" className="w-full">
        {actionLabel}
      </Button>
    </Link>
  ) : (
    <Button variant="secondary" className="w-full" onClick={onClick}>
      {actionLabel}
    </Button>
  );

  return (
    <Card className="flex h-full flex-col justify-between gap-4">
      <div>
        <h2 className="text-base font-semibold text-[#334155]">{title}</h2>
        <p className="mt-2 text-sm text-[#334155]/75">{description}</p>
      </div>
      {action}
    </Card>
  );
}

export default ActionCard;

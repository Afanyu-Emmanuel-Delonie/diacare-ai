import { Link } from 'react-router-dom';
import Button from '../../components/common/Button.jsx';
import Card from '../../components/common/Card.jsx';

function SystemPage({ code, title, message, primaryAction, secondaryAction, children }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#FFFFFF] px-4 text-[#334155]">
      <Card className="w-full max-w-lg text-center">
        {code && <p className="text-sm font-semibold uppercase tracking-wide text-[#2563EB]">{code}</p>}
        <h1 className="mt-2 text-2xl font-bold">{title}</h1>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#334155]/80">{message}</p>
        {children}
        {(primaryAction || secondaryAction) && (
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {primaryAction && (
              <Link to={primaryAction.to}>
                <Button>{primaryAction.label}</Button>
              </Link>
            )}
            {secondaryAction && (
              <Link to={secondaryAction.to}>
                <Button variant="secondary">{secondaryAction.label}</Button>
              </Link>
            )}
          </div>
        )}
      </Card>
    </main>
  );
}

export default SystemPage;

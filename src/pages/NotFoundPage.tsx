import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Logo } from '@/components/layout/Logo';

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-wcbt-cream px-6 text-center">
      <Logo variant="crest" alt="WCBT" className="h-14" />
      <p className="text-sm font-medium uppercase tracking-wide text-wcbt-muted">Error 404</p>
      <h1 className="text-3xl font-semibold tracking-tight text-wcbt-ink">Page not found</h1>
      <p className="max-w-md text-sm text-wcbt-muted">
        The page you are looking for may have been moved, or you may not have access to it.
      </p>
      <Link to="/dashboard">
        <Button>Back to dashboard</Button>
      </Link>
    </div>
  );
}

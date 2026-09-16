import { Construction } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';

export function PlaceholderPage({ title, description }: { title: string; description: string }) {
  return (
    <>
      <PageHeader title={title} breadcrumb={[{ label: 'Home', to: '/dashboard' }, { label: title }]} />
      <div className="wcbt-card">
        <EmptyState
          icon={<Construction className="h-6 w-6" aria-hidden="true" />}
          title={`${title} module coming next`}
          message={description}
        />
      </div>
    </>
  );
}

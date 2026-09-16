import { Badge, type BadgeTone } from '@/components/ui/Badge';

const TONE_BY_STATUS: Record<string, BadgeTone> = {
  // Shared
  Active: 'success',
  Inactive: 'neutral',
  'On Leave': 'warning',
  // Notifications
  Published: 'success',
  Draft: 'warning',
  Archived: 'neutral',
  Urgent: 'danger',
  High: 'warning',
  Normal: 'neutral',
  General: 'neutral',
  Academic: 'info',
  Admission: 'maroon',
  // Admissions pipeline
  Applied: 'neutral',
  'Document Verification': 'warning',
  'Test/Interview': 'info',
  Result: 'maroon',
  Enrolled: 'success',
  Rejected: 'danger',
  // Test status
  'Not Scheduled': 'neutral',
  Scheduled: 'info',
  Passed: 'success',
  Failed: 'danger',
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  return (
    <Badge tone={TONE_BY_STATUS[status] ?? 'neutral'} className={className}>
      {status}
    </Badge>
  );
}

export function statusTone(status: string): BadgeTone {
  return TONE_BY_STATUS[status] ?? 'neutral';
}

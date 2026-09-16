import { Check } from 'lucide-react';
import { ADMISSION_STAGES, type AdmissionStage } from '@/types/admission';
import { cn } from '@/lib/utils';

interface StatusStepperProps {
  status: AdmissionStage;
  onChange?: (stage: AdmissionStage) => void;
}

/** Applied → Document Verification → Test/Interview → Result → Enrollment. */
export function StatusStepper({ status, onChange }: StatusStepperProps) {
  const rejected = status === 'Rejected';
  const currentIndex = rejected ? -1 : ADMISSION_STAGES.indexOf(status);

  return (
    <ol className="flex flex-wrap items-center gap-y-3">
      {ADMISSION_STAGES.map((stage, index) => {
        const complete = !rejected && index < currentIndex;
        const current = !rejected && index === currentIndex;
        const label = stage === 'Enrolled' ? 'Enrollment' : stage;

        const marker = (
          <>
            <span
              className={cn(
                'flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold transition-colors',
                complete && 'border-wcbt-success bg-wcbt-success text-white',
                current && 'border-wcbt-maroon bg-wcbt-maroon text-white',
                !complete && !current && 'border-black/10 bg-wcbt-surface text-wcbt-muted',
              )}
            >
              {complete ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : index + 1}
            </span>
            <span
              className={cn(
                'text-xs font-medium',
                current ? 'text-wcbt-maroon' : complete ? 'text-wcbt-success' : 'text-wcbt-muted',
              )}
            >
              {label}
            </span>
          </>
        );

        return (
          <li key={stage} className="flex items-center gap-2">
            {onChange ? (
              <button
                type="button"
                onClick={() => onChange(stage)}
                aria-current={current ? 'step' : undefined}
                className="flex items-center gap-2 rounded-lg px-1 py-0.5 transition-colors hover:bg-wcbt-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wcbt-maroon"
              >
                {marker}
              </button>
            ) : (
              <span className="flex items-center gap-2">{marker}</span>
            )}
            {index < ADMISSION_STAGES.length - 1 && (
              <span
                className={cn('mx-2 h-px w-8 shrink-0', complete ? 'bg-wcbt-success' : 'bg-black/10')}
                aria-hidden="true"
              />
            )}
          </li>
        );
      })}
      {rejected && (
        <li className="ml-3 rounded-full bg-wcbt-danger/10 px-3 py-1 text-xs font-medium text-wcbt-danger">
          Rejected
        </li>
      )}
    </ol>
  );
}

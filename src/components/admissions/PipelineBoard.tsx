import { useState } from 'react';
import {
  DndContext,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import { Link } from 'react-router-dom';
import { GripVertical } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { Select } from '@/components/ui/Field';
import { ADMISSION_STAGES_WITH_REJECTED, type Admission, type AdmissionStage } from '@/types/admission';
import { cn, formatDate } from '@/lib/utils';

interface PipelineBoardProps {
  items: Admission[];
  onStageChange: (id: string, stage: AdmissionStage) => void;
}

function ApplicantCard({ application }: { application: Admission }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: application.id,
  });

  return (
    <article
      ref={setNodeRef}
      style={transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : undefined}
      className={cn(
        'wcbt-card flex items-start gap-2 p-3',
        isDragging && 'opacity-80 shadow-lg ring-2 ring-wcbt-maroon',
      )}
    >
      <button
        type="button"
        className="mt-0.5 cursor-grab rounded text-wcbt-muted hover:text-wcbt-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wcbt-maroon active:cursor-grabbing"
        aria-label={`Drag ${application.fullName}`}
        {...listeners}
        {...attributes}
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <Avatar name={application.fullName} src={application.photoUrl} size="sm" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-wcbt-ink">{application.fullName}</p>
        <p className="text-xs text-wcbt-muted">{application.program}</p>
        <p className="text-[11px] text-wcbt-muted">Applied {formatDate(application.appliedDate)}</p>
        <Link
          to={`/admissions/${application.id}`}
          className="mt-1 inline-block text-xs font-medium text-wcbt-maroon hover:underline"
        >
          View
        </Link>
      </div>
    </article>
  );
}

function StageColumn({
  stage,
  applications,
  onStageChange,
}: {
  stage: AdmissionStage;
  applications: Admission[];
  onStageChange: (id: string, stage: AdmissionStage) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: stage });

  return (
    <section
      ref={setNodeRef}
      className={cn(
        'flex w-72 shrink-0 flex-col gap-3 rounded-xl bg-wcbt-cream p-3 transition-colors',
        isOver && 'ring-2 ring-wcbt-maroon',
        stage === 'Rejected' && 'bg-wcbt-danger/5',
      )}
    >
      <header className="flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-wcbt-muted">{stage}</h3>
        <span className="rounded-full bg-wcbt-surface px-2 py-0.5 text-xs font-medium text-wcbt-maroon">
          {applications.length}
        </span>
      </header>

      <div className="flex flex-col gap-2">
        {applications.map((application) => (
          <div key={application.id}>
            <ApplicantCard application={application} />
            {/* Keyboard-accessible alternative to dragging. */}
            <Select
              value={stage}
              onChange={(event) => onStageChange(application.id, event.target.value as AdmissionStage)}
              aria-label={`Move ${application.fullName} to another stage`}
              className="mt-1 h-8 py-1 text-xs"
            >
              {ADMISSION_STAGES_WITH_REJECTED.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Select>
          </div>
        ))}
        {applications.length === 0 && (
          <p className="rounded-lg border border-dashed border-black/10 px-3 py-6 text-center text-xs text-wcbt-muted">
            Drop applications here
          </p>
        )}
      </div>
    </section>
  );
}

export function PipelineBoard({ items, onStageChange }: PipelineBoardProps) {
  const [announcement, setAnnouncement] = useState('');
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const onDragEnd = (event: DragEndEvent) => {
    const stage = event.over?.id as AdmissionStage | undefined;
    const id = String(event.active.id);
    if (!stage) return;
    const application = items.find((item) => item.id === id);
    if (!application || application.status === stage) return;

    onStageChange(id, stage);
    setAnnouncement(`${application.fullName} moved to ${stage}`);
  };

  return (
    <DndContext sensors={sensors} onDragEnd={onDragEnd}>
      <p className="sr-only" role="status" aria-live="polite">
        {announcement}
      </p>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {ADMISSION_STAGES_WITH_REJECTED.map((stage) => (
          <StageColumn
            key={stage}
            stage={stage}
            applications={items.filter((item) => item.status === stage)}
            onStageChange={onStageChange}
          />
        ))}
      </div>
    </DndContext>
  );
}

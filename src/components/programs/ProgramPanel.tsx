import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { SidePanel } from '@/components/shared/SidePanel';
import { Button } from '@/components/ui/Button';
import { Field, Input, Segmented, Select, Textarea } from '@/components/ui/Field';
import { useSettingsStore } from '@/store/settings';
import { programSchema, type ProgramFormValues } from '@/validation/program';
import {
  PROGRAM_LEVELS,
  type Program,
  type ProgramDraft,
  type ProgramStatus,
} from '@/types/program';
import type { LookupItem } from '@/types/common';
import { formatCurrency } from '@/lib/utils';

/** Stable reference: a fresh array each render would retrigger the reset effect. */
const NO_DEPARTMENTS: LookupItem[] = [];

interface ProgramPanelProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (draft: ProgramDraft) => Promise<void> | void;
  editing?: Program | null;
  /** Codes already in use, so two programs never share the applications join key. */
  takenCodes: string[];
}

const emptyValues = (): ProgramFormValues => ({
  code: '',
  name: '',
  level: 'Bachelor',
  department: '',
  affiliation: 'Kathmandu University',
  durationYears: 4,
  semesters: 8,
  seats: 40,
  feePerYear: 150000,
  coordinator: '',
  status: 'Active',
  description: '',
});

export function ProgramPanel({ open, onClose, onSubmit, editing, takenCodes }: ProgramPanelProps) {
  const settings = useSettingsStore((state) => state.settings);
  const loadSettings = useSettingsStore((state) => state.load);
  const departments = settings?.catalog.departments ?? NO_DEPARTMENTS;

  const form = useForm<ProgramFormValues>({
    resolver: zodResolver(programSchema),
    defaultValues: emptyValues(),
    mode: 'onChange',
  });

  // The department list lives in settings, which only the settings page loads eagerly.
  useEffect(() => {
    if (open) void loadSettings();
  }, [open, loadSettings]);

  useEffect(() => {
    if (!open) return;
    form.reset(
      editing
        ? {
            code: editing.code,
            name: editing.name,
            level: editing.level,
            department: editing.department,
            affiliation: editing.affiliation,
            durationYears: editing.durationYears,
            semesters: editing.semesters,
            seats: editing.seats,
            feePerYear: editing.feePerYear,
            coordinator: editing.coordinator,
            status: editing.status,
            description: editing.description ?? '',
          }
        : { ...emptyValues(), department: departments[0]?.name ?? '' },
    );
  }, [open, editing, departments, form]);

  const { errors } = form.formState;
  const fee = form.watch('feePerYear');

  const submit = form.handleSubmit(async (values) => {
    const code = values.code.trim();
    const clash = takenCodes.some(
      (taken) => taken.toLowerCase() === code.toLowerCase() && taken !== editing?.code,
    );
    if (clash) {
      form.setError('code', { message: `${code} is already used by another program` });
      return;
    }

    await onSubmit({
      code,
      name: values.name.trim(),
      level: values.level,
      department: values.department,
      affiliation: values.affiliation.trim(),
      durationYears: values.durationYears,
      semesters: values.semesters,
      seats: values.seats,
      feePerYear: values.feePerYear,
      coordinator: values.coordinator.trim(),
      status: values.status,
      description: values.description.trim() || undefined,
    });
    onClose();
  });

  return (
    <SidePanel
      open={open}
      onClose={onClose}
      title={editing ? 'Edit program' : 'Add program'}
      description={
        editing
          ? 'Changes apply to new applications; enrolled students keep their current program.'
          : 'Programs added here become selectable on admission applications.'
      }
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={submit} loading={form.formState.isSubmitting}>
            {editing ? 'Save changes' : 'Add program'}
          </Button>
        </>
      }
    >
      <form className="space-y-5" onSubmit={submit} noValidate>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field label="Code" htmlFor="code" required error={errors.code?.message}>
            <Input
              id="code"
              placeholder="BIT"
              maxLength={16}
              invalid={Boolean(errors.code)}
              {...form.register('code')}
            />
          </Field>
          <Field
            label="Program name"
            htmlFor="name"
            required
            error={errors.name?.message}
            className="sm:col-span-2"
          >
            <Input
              id="name"
              placeholder="Bachelor of Information Technology"
              invalid={Boolean(errors.name)}
              {...form.register('name')}
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Level" htmlFor="level" required>
            <Select id="level" {...form.register('level')}>
              {PROGRAM_LEVELS.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Department" htmlFor="department" required error={errors.department?.message}>
            <Select id="department" invalid={Boolean(errors.department)} {...form.register('department')}>
              <option value="">Select department</option>
              {departments.map((department) => (
                <option key={department.id} value={department.name}>
                  {department.name}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <Field label="Affiliation" htmlFor="affiliation" required error={errors.affiliation?.message}>
          <Input
            id="affiliation"
            placeholder="Kathmandu University"
            invalid={Boolean(errors.affiliation)}
            {...form.register('affiliation')}
          />
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field label="Duration (years)" htmlFor="durationYears" required error={errors.durationYears?.message}>
            <Input
              id="durationYears"
              type="number"
              min={1}
              max={8}
              invalid={Boolean(errors.durationYears)}
              {...form.register('durationYears', { valueAsNumber: true })}
            />
          </Field>
          <Field label="Semesters" htmlFor="semesters" required error={errors.semesters?.message}>
            <Input
              id="semesters"
              type="number"
              min={1}
              max={16}
              invalid={Boolean(errors.semesters)}
              {...form.register('semesters', { valueAsNumber: true })}
            />
          </Field>
          <Field label="Seats per intake" htmlFor="seats" required error={errors.seats?.message}>
            <Input
              id="seats"
              type="number"
              min={1}
              max={500}
              invalid={Boolean(errors.seats)}
              {...form.register('seats', { valueAsNumber: true })}
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field
            label="Annual fee (NPR)"
            htmlFor="feePerYear"
            required
            error={errors.feePerYear?.message}
            hint={
              Number.isFinite(fee) ? (
                <span className="text-xs text-wcbt-muted">{formatCurrency(fee)}</span>
              ) : null
            }
          >
            <Input
              id="feePerYear"
              type="number"
              min={0}
              step={1000}
              invalid={Boolean(errors.feePerYear)}
              {...form.register('feePerYear', { valueAsNumber: true })}
            />
          </Field>
          <Field label="Coordinator" htmlFor="coordinator" required error={errors.coordinator?.message}>
            <Input
              id="coordinator"
              placeholder="Programme head"
              invalid={Boolean(errors.coordinator)}
              {...form.register('coordinator')}
            />
          </Field>
        </div>

        <Field label="Description" htmlFor="description" error={errors.description?.message}>
          <Textarea
            id="description"
            rows={3}
            placeholder="One or two lines shown on the prospectus and admission form."
            invalid={Boolean(errors.description)}
            {...form.register('description')}
          />
        </Field>

        <Field label="Status">
          <Controller
            control={form.control}
            name="status"
            render={({ field }) => (
              <Segmented
                value={field.value as ProgramStatus}
                onChange={field.onChange}
                options={[
                  { label: 'Active', value: 'Active' },
                  { label: 'Inactive', value: 'Inactive' },
                ]}
                ariaLabel="Program status"
              />
            )}
          />
        </Field>
      </form>
    </SidePanel>
  );
}

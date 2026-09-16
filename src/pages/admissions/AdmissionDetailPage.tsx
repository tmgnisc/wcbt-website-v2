import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, Bell, Lock, UserCheck } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatusStepper } from '@/components/admissions/StatusStepper';
import { NotificationPanel } from '@/components/notifications/NotificationPanel';
import { EmptyState } from '@/components/shared/EmptyState';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Can } from '@/components/shared/Can';
import { Button } from '@/components/ui/Button';
import { Field, Input, Select, Switch, Textarea } from '@/components/ui/Field';
import { FileDrop, PhotoDrop } from '@/components/ui/FileDrop';
import { TagInput } from '@/components/ui/TagInput';
import { Tabs } from '@/components/ui/Tabs';
import { Skeleton } from '@/components/ui/Skeleton';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useAdmissionsStore } from '@/store/admissions';
import { useNotificationsStore } from '@/store/notifications';
import { ADMISSION_TAB_FIELDS, admissionSchema, type AdmissionFormValues } from '@/validation/admission';
import {
  ADMISSION_STAGES_WITH_REJECTED,
  PROGRAMS,
  TEST_STATUSES,
  type AdmissionStage,
  type ProgramCode,
  type TestStatus,
} from '@/types/admission';
import { GENDERS, type Gender } from '@/types/staff';
import type { FileRecord } from '@/types/common';
import { todayISO } from '@/lib/utils';

const TABS = [
  { value: 'personal', label: 'Personal Details' },
  { value: 'academic', label: 'Academic Background' },
  { value: 'program', label: 'Program Details' },
  { value: 'documents', label: 'Documents' },
  { value: 'test', label: 'Admission Test' },
];

export function AdmissionDetailPage() {
  const { id } = useParams();
  const isNew = id === 'new';
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, can } = useAuth();

  const [tab, setTab] = useState('personal');
  const [documents, setDocuments] = useState<FileRecord[]>([]);
  const [stage, setStage] = useState<AdmissionStage>('Applied');
  const [notifyOpen, setNotifyOpen] = useState(false);

  const items = useAdmissionsStore((state) => state.items);
  const loaded = useAdmissionsStore((state) => state.loaded);
  const load = useAdmissionsStore((state) => state.load);
  const createAdmission = useAdmissionsStore((state) => state.create);
  const updateAdmission = useAdmissionsStore((state) => state.update);
  const convertToStudent = useAdmissionsStore((state) => state.convertToStudent);
  const nextApplicationId = useAdmissionsStore((state) => state.nextApplicationId);
  const createNotification = useNotificationsStore((state) => state.create);

  useEffect(() => {
    void load();
  }, [load]);

  const existing = isNew ? undefined : items.find((item) => item.id === id);

  const form = useForm<AdmissionFormValues>({
    resolver: zodResolver(admissionSchema),
    defaultValues: {
      fullName: '',
      dateOfBirth: '',
      gender: 'Male',
      nationality: 'Nepali',
      address: '',
      phone: '',
      email: '',
      previousInstitution: '',
      board: 'NEB',
      gpa: '',
      subjects: [],
      program: 'BIT',
      intake: 'Fall 2026',
      scholarshipInterest: false,
      testDate: '',
      testScore: null,
      testStatus: 'Not Scheduled',
      interviewNotes: '',
      internalNotes: '',
    },
  });

  useEffect(() => {
    if (!existing) return;
    form.reset({
      fullName: existing.fullName,
      dateOfBirth: existing.dateOfBirth,
      gender: existing.gender,
      nationality: existing.nationality,
      address: existing.address,
      phone: existing.phone,
      email: existing.email,
      photoUrl: existing.photoUrl,
      previousInstitution: existing.previousInstitution,
      board: existing.board,
      gpa: existing.gpa,
      subjects: existing.subjects,
      program: existing.program,
      intake: existing.intake,
      scholarshipInterest: existing.scholarshipInterest,
      testDate: existing.testDate ?? '',
      testScore: existing.testScore ?? null,
      testStatus: existing.testStatus,
      interviewNotes: existing.interviewNotes ?? '',
      internalNotes: existing.internalNotes ?? '',
    });
    setDocuments(existing.documents);
    setStage(existing.status);
  }, [existing, form]);

  const errorTabs = new Set(
    Object.entries(ADMISSION_TAB_FIELDS)
      .filter(([, fields]) =>
        fields.some((fieldName) => form.formState.errors[fieldName as keyof AdmissionFormValues]),
      )
      .map(([tabValue]) => tabValue),
  );

  const onSubmit = form.handleSubmit(async (values) => {
    const payload = {
      ...values,
      gender: values.gender as Gender,
      program: values.program as ProgramCode,
      testStatus: values.testStatus as TestStatus,
      subjects: values.subjects ?? [],
      testScore: values.testScore === null || values.testScore === undefined ? null : Number(values.testScore),
      testDate: values.testDate || null,
      documents,
      status: stage,
    };

    if (existing) {
      await updateAdmission(existing.id, payload);
      toast({ title: 'Application updated' });
    } else {
      const created = await createAdmission({
        ...payload,
        applicationId: nextApplicationId(),
        appliedDate: todayISO(),
        convertedToStudent: false,
      });
      toast({ title: 'Application created', description: created.applicationId });
      navigate(`/admissions/${created.id}`, { replace: true });
    }
  });

  if (!isNew && !loaded) {
    return (
      <div className="wcbt-card space-y-4 p-6">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!isNew && !existing) {
    return (
      <div className="wcbt-card">
        <EmptyState
          title="Application not found"
          message="This application may have been deleted."
          action={
            <Link to="/admissions">
              <Button>Back to admissions</Button>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <>
      <form onSubmit={onSubmit} noValidate>
        <PageHeader
          title={isNew ? 'New application' : (existing?.fullName ?? 'Application')}
          description={
            existing
              ? `${existing.applicationId} · ${existing.program} · ${existing.intake}`
              : 'Record a walk-in or offline application.'
          }
          breadcrumb={[
            { label: 'Home', to: '/dashboard' },
            { label: 'Admissions', to: '/admissions' },
            { label: isNew ? 'New' : (existing?.applicationId ?? '') },
          ]}
          actions={
            existing && (
              <>
                <Button type="button" variant="subtle" onClick={() => setNotifyOpen(true)}>
                  <Bell className="h-4 w-4" aria-hidden="true" /> Send notification
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={existing.status !== 'Enrolled' || existing.convertedToStudent}
                  onClick={async () => {
                    await convertToStudent(existing.id);
                    toast({ title: `${existing.fullName} converted to student` });
                  }}
                >
                  <UserCheck className="h-4 w-4" aria-hidden="true" />
                  {existing.convertedToStudent ? 'Student record created' : 'Convert to student'}
                </Button>
              </>
            )
          }
        />

        <section className="wcbt-card mb-4 flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
          <StatusStepper status={stage} onChange={setStage} />
          <div className="flex items-center gap-2">
            <StatusBadge status={stage} />
            <Select
              value={stage}
              onChange={(event) => setStage(event.target.value as AdmissionStage)}
              aria-label="Application status"
              className="h-9 w-52 py-1 text-sm"
            >
              {ADMISSION_STAGES_WITH_REJECTED.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Select>
          </div>
        </section>

        <div className="wcbt-card">
          <Tabs
            items={TABS.map((item) => ({
              ...item,
              badge: errorTabs.has(item.value) ? (
                <AlertCircle className="h-3.5 w-3.5 text-wcbt-danger" aria-label="has errors" />
              ) : item.value === 'test' && !can('admissions:test') ? (
                <Lock className="h-3 w-3" aria-label="restricted" />
              ) : undefined,
            }))}
            value={tab}
            onChange={setTab}
            ariaLabel="Application sections"
            className="px-4"
          />

          <div className="p-5">
            {tab === 'personal' && (
              <div className="space-y-5">
                <Controller
                  control={form.control}
                  name="photoUrl"
                  render={({ field }) => (
                    <PhotoDrop
                      value={field.value}
                      onChange={field.onChange}
                      name={form.watch('fullName')}
                    />
                  )}
                />
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Field label="Full name" htmlFor="fullName" required error={form.formState.errors.fullName?.message}>
                    <Input id="fullName" {...form.register('fullName')} />
                  </Field>
                  <Field label="Date of birth" htmlFor="dateOfBirth" required error={form.formState.errors.dateOfBirth?.message}>
                    <Input id="dateOfBirth" type="date" {...form.register('dateOfBirth')} />
                  </Field>
                  <Field label="Gender" htmlFor="gender" required>
                    <Select id="gender" {...form.register('gender')}>
                      {GENDERS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </Select>
                  </Field>
                  <Field label="Nationality" htmlFor="nationality" required error={form.formState.errors.nationality?.message}>
                    <Input id="nationality" {...form.register('nationality')} />
                  </Field>
                  <Field label="Phone" htmlFor="phone" required error={form.formState.errors.phone?.message}>
                    <Input id="phone" type="tel" {...form.register('phone')} />
                  </Field>
                  <Field label="Email" htmlFor="email" required error={form.formState.errors.email?.message}>
                    <Input id="email" type="email" {...form.register('email')} />
                  </Field>
                  <Field
                    label="Address"
                    htmlFor="address"
                    required
                    className="md:col-span-2"
                    error={form.formState.errors.address?.message}
                  >
                    <Input id="address" {...form.register('address')} />
                  </Field>
                </div>
              </div>
            )}

            {tab === 'academic' && (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field
                  label="Previous institution"
                  htmlFor="previousInstitution"
                  required
                  error={form.formState.errors.previousInstitution?.message}
                >
                  <Input id="previousInstitution" {...form.register('previousInstitution')} />
                </Field>
                <Field label="Board" htmlFor="board" required error={form.formState.errors.board?.message}>
                  <Input id="board" {...form.register('board')} />
                </Field>
                <Field
                  label="+2 GPA or percentage"
                  htmlFor="gpa"
                  required
                  error={form.formState.errors.gpa?.message}
                >
                  <Input id="gpa" placeholder="e.g. 3.45 or 72%" {...form.register('gpa')} />
                </Field>
                <Field label="Subjects studied" className="md:col-span-2">
                  <Controller
                    control={form.control}
                    name="subjects"
                    render={({ field }) => (
                      <TagInput value={field.value ?? []} onChange={field.onChange} placeholder="Add a subject and press Enter" />
                    )}
                  />
                </Field>
              </div>
            )}

            {tab === 'program' && (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field label="Program applied" htmlFor="program" required>
                  <Select id="program" {...form.register('program')}>
                    {PROGRAMS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Preferred intake" htmlFor="intake" required error={form.formState.errors.intake?.message}>
                  <Input id="intake" placeholder="e.g. Fall 2026" {...form.register('intake')} />
                </Field>
                <div className="rounded-xl border border-black/5 p-4 md:col-span-2">
                  <Controller
                    control={form.control}
                    name="scholarshipInterest"
                    render={({ field }) => (
                      <Switch
                        id="scholarshipInterest"
                        checked={Boolean(field.value)}
                        onChange={field.onChange}
                        label="Scholarship interest"
                        description="Flag this applicant for the merit and need-based scholarship review."
                      />
                    )}
                  />
                </div>
              </div>
            )}

            {tab === 'documents' && (
              <FileDrop
                files={documents}
                onChange={setDocuments}
                label="Drop transcript, citizenship, +2 certificate and testimonials"
                hint="PDF, JPG or PNG up to 10 MB each"
              />
            )}

            {tab === 'test' && (
              <Can
                permission="admissions:test"
                fallback={
                  <EmptyState
                    icon={<Lock className="h-6 w-6" aria-hidden="true" />}
                    title="Restricted section"
                    message="Entrance test scores and interview notes are visible to admissions staff only."
                  />
                }
              >
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Field label="Test date" htmlFor="testDate">
                    <Input id="testDate" type="date" {...form.register('testDate')} />
                  </Field>
                  <Field label="Test status" htmlFor="testStatus">
                    <Select id="testStatus" {...form.register('testStatus')}>
                      {TEST_STATUSES.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </Select>
                  </Field>
                  <Field label="Test score" htmlFor="testScore" error={form.formState.errors.testScore?.message}>
                    <div className="relative">
                      <Input
                        id="testScore"
                        type="number"
                        min={0}
                        max={100}
                        className="pr-12"
                        {...form.register('testScore')}
                      />
                      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-wcbt-muted">
                        /100
                      </span>
                    </div>
                  </Field>
                  <Field label="Interview notes" htmlFor="interviewNotes" className="md:col-span-2">
                    <Textarea id="interviewNotes" {...form.register('interviewNotes')} />
                  </Field>
                </div>
              </Can>
            )}

            <div className="mt-6 border-t border-black/5 pt-5">
              <Field
                label="Internal notes"
                htmlFor="internalNotes"
                hint={<span className="text-xs text-wcbt-muted">Not visible to the applicant</span>}
              >
                <Textarea id="internalNotes" rows={3} {...form.register('internalNotes')} />
              </Field>
            </div>
          </div>

          <div className="sticky bottom-0 flex items-center justify-end gap-2 rounded-b-xl border-t border-black/5 bg-wcbt-surface px-5 py-3">
            <Button type="button" variant="ghost" onClick={() => navigate('/admissions')}>
              Cancel
            </Button>
            <Button type="submit" loading={form.formState.isSubmitting}>
              {isNew ? 'Create application' : 'Save application'}
            </Button>
          </div>
        </div>
      </form>

      <NotificationPanel
        open={notifyOpen}
        onClose={() => setNotifyOpen(false)}
        recipient={
          existing ? { type: 'applicant', id: existing.id, name: existing.fullName } : null
        }
        onSubmit={async (draft) => {
          await createNotification(draft, user?.name ?? 'Admin');
          toast({ title: 'Notification sent to applicant' });
        }}
      />
    </>
  );
}

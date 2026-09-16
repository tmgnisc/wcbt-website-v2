import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, KeyRound } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Field, Input, Segmented, Select, Switch } from '@/components/ui/Field';
import { FileDrop, PhotoDrop } from '@/components/ui/FileDrop';
import { Tabs } from '@/components/ui/Tabs';
import { Can } from '@/components/shared/Can';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useStaffStore } from '@/store/staff';
import { useSettingsStore } from '@/store/settings';
import { STAFF_TAB_FIELDS, staffSchema, type StaffFormValues } from '@/validation/staff';
import {
  EMPLOYMENT_TYPES,
  GENDERS,
  STAFF_STATUSES,
  type EmploymentType,
  type Gender,
  type StaffStatus,
} from '@/types/staff';
import { ROLE_LABELS, type Role } from '@/types/auth';
import type { FileRecord } from '@/types/common';
import { todayISO } from '@/lib/utils';

const TABS = [
  { value: 'personal', label: 'Personal Info' },
  { value: 'employment', label: 'Employment Info' },
  { value: 'account', label: 'Account & Access' },
  { value: 'documents', label: 'Documents' },
];

export function StaffFormPage({ mode }: { mode: 'create' | 'edit' }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const [tab, setTab] = useState('personal');
  const [documents, setDocuments] = useState<FileRecord[]>([]);

  const items = useStaffStore((state) => state.items);
  const loaded = useStaffStore((state) => state.loaded);
  const load = useStaffStore((state) => state.load);
  const createStaff = useStaffStore((state) => state.create);
  const updateStaff = useStaffStore((state) => state.update);
  const nextStaffId = useStaffStore((state) => state.nextStaffId);

  const settings = useSettingsStore((state) => state.settings);
  const loadSettings = useSettingsStore((state) => state.load);

  useEffect(() => {
    void load();
    void loadSettings();
  }, [load, loadSettings]);

  const existing = mode === 'edit' ? items.find((member) => member.id === id) : undefined;

  const form = useForm<StaffFormValues>({
    resolver: zodResolver(staffSchema),
    defaultValues: {
      fullName: '',
      gender: 'Male',
      dateOfBirth: '',
      citizenshipNo: '',
      address: '',
      phone: '',
      email: '',
      staffId: '',
      department: '',
      designation: '',
      joiningDate: todayISO(),
      employmentType: 'Full-time',
      reportingManagerId: '',
      salary: 0,
      username: '',
      role: 'staff',
      loginEnabled: true,
      status: 'Active',
    },
  });

  // Populate once records arrive (deep links to /staff/:id/edit load the store first).
  useEffect(() => {
    if (mode === 'edit' && existing) {
      form.reset({
        ...existing,
        reportingManagerId: existing.reportingManagerId ?? '',
        photoUrl: existing.photoUrl,
      });
      setDocuments(existing.documents);
    } else if (mode === 'create' && loaded && !form.getValues('staffId')) {
      form.setValue('staffId', nextStaffId());
    }
  }, [mode, existing, loaded, form, nextStaffId]);

  const email = form.watch('email');
  const fullName = form.watch('fullName');

  useEffect(() => {
    if (mode === 'create' && email.includes('@') && !form.getValues('username')) {
      form.setValue('username', email.split('@')[0]);
    }
  }, [email, mode, form]);

  const managers = useMemo(
    () => items.filter((member) => member.id !== id && member.status === 'Active'),
    [items, id],
  );

  const errorTabs = useMemo(() => {
    const errored = new Set<string>();
    for (const [tabValue, fields] of Object.entries(STAFF_TAB_FIELDS)) {
      if (fields.some((fieldName) => form.formState.errors[fieldName])) errored.add(tabValue);
    }
    return errored;
  }, [form.formState.errors]);

  const onSubmit = form.handleSubmit(async (values) => {
    const draft = {
      ...values,
      gender: values.gender as Gender,
      employmentType: values.employmentType as EmploymentType,
      status: values.status as StaffStatus,
      role: values.role as Role,
      salary: Number(values.salary),
      reportingManagerId: values.reportingManagerId || null,
      documents,
    };

    if (mode === 'edit' && existing) {
      await updateStaff(existing.id, draft, user?.name ?? 'Admin');
      toast({ title: 'Staff member updated' });
      navigate(`/staff/${existing.id}`);
    } else {
      const created = await createStaff(draft, user?.name ?? 'Admin');
      toast({ title: 'Staff member created', description: created.staffId });
      navigate(`/staff/${created.id}`);
    }
  });

  if (mode === 'edit' && loaded && !existing) {
    return (
      <div className="wcbt-card p-10 text-center">
        <p className="text-sm text-wcbt-muted">This staff record no longer exists.</p>
        <Button className="mt-4" onClick={() => navigate('/staff')}>
          Back to staff list
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      <PageHeader
        title={mode === 'edit' ? 'Edit staff member' : 'Add staff member'}
        description={
          mode === 'edit'
            ? 'Update employment, access and document records.'
            : 'Create a personnel record and portal account.'
        }
        breadcrumb={[
          { label: 'Home', to: '/dashboard' },
          { label: 'Staff', to: '/staff' },
          { label: mode === 'edit' ? 'Edit' : 'New' },
        ]}
      />

      <div className="wcbt-card">
        <Tabs
          items={TABS.map((item) => ({
            ...item,
            badge: errorTabs.has(item.value) ? (
              <AlertCircle className="h-3.5 w-3.5 text-wcbt-danger" aria-label="has errors" />
            ) : undefined,
          }))}
          value={tab}
          onChange={setTab}
          ariaLabel="Staff form sections"
          className="px-4"
        />

        <div className="p-5">
          {tab === 'personal' && (
            <div className="space-y-5">
              <Controller
                control={form.control}
                name="photoUrl"
                render={({ field }) => (
                  <PhotoDrop value={field.value} onChange={field.onChange} name={fullName} />
                )}
              />

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field label="Full name" htmlFor="fullName" required error={form.formState.errors.fullName?.message}>
                  <Input id="fullName" {...form.register('fullName')} invalid={Boolean(form.formState.errors.fullName)} />
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
                <Field label="Date of birth" htmlFor="dateOfBirth" required error={form.formState.errors.dateOfBirth?.message}>
                  <Input id="dateOfBirth" type="date" {...form.register('dateOfBirth')} />
                </Field>
                <Field
                  label="Citizenship / ID no."
                  htmlFor="citizenshipNo"
                  required
                  error={form.formState.errors.citizenshipNo?.message}
                >
                  <Input id="citizenshipNo" {...form.register('citizenshipNo')} />
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

          {tab === 'employment' && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field label="Staff ID" htmlFor="staffId" hint={<span className="text-xs text-wcbt-muted">auto</span>}>
                <Input id="staffId" readOnly className="font-mono" {...form.register('staffId')} />
              </Field>
              <Field label="Department" htmlFor="department" required error={form.formState.errors.department?.message}>
                <Select id="department" {...form.register('department')}>
                  <option value="">Select department</option>
                  {settings?.catalog.departments.map((department) => (
                    <option key={department.id} value={department.name}>
                      {department.name}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Designation" htmlFor="designation" required error={form.formState.errors.designation?.message}>
                <Select id="designation" {...form.register('designation')}>
                  <option value="">Select designation</option>
                  {settings?.catalog.designations.map((designation) => (
                    <option key={designation.id} value={designation.name}>
                      {designation.name}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Joining date" htmlFor="joiningDate" required error={form.formState.errors.joiningDate?.message}>
                <Input id="joiningDate" type="date" {...form.register('joiningDate')} />
              </Field>
              <Field label="Employment type" required>
                <Controller
                  control={form.control}
                  name="employmentType"
                  render={({ field }) => (
                    <Segmented
                      value={field.value as EmploymentType}
                      onChange={field.onChange}
                      options={EMPLOYMENT_TYPES.map((type) => ({ label: type, value: type }))}
                      ariaLabel="Employment type"
                    />
                  )}
                />
              </Field>
              <Field label="Reporting manager" htmlFor="reportingManagerId">
                <Select id="reportingManagerId" {...form.register('reportingManagerId')}>
                  <option value="">None</option>
                  {managers.map((manager) => (
                    <option key={manager.id} value={manager.id}>
                      {manager.fullName} — {manager.designation}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Salary (NPR)" htmlFor="salary" error={form.formState.errors.salary?.message}>
                <Can
                  permission="staff:viewSalary"
                  fallback={
                    <Input value="••••••" readOnly aria-label="Salary hidden for your role" className="font-mono" />
                  }
                >
                  <Input id="salary" type="number" min={0} step={1000} {...form.register('salary')} />
                </Can>
              </Field>
            </div>
          )}

          {tab === 'account' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field
                  label="Username"
                  htmlFor="username"
                  required
                  error={form.formState.errors.username?.message}
                  hint={<span className="text-xs text-wcbt-muted">derived from email</span>}
                >
                  <Input id="username" {...form.register('username')} />
                </Field>
                <Field label="Role" htmlFor="role" required>
                  <Select id="role" {...form.register('role')}>
                    {(Object.keys(ROLE_LABELS) as Role[]).map((role) => (
                      <option key={role} value={role}>
                        {ROLE_LABELS[role]}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Status" htmlFor="status" required>
                  <Select id="status" {...form.register('status')}>
                    {STAFF_STATUSES.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </Select>
                </Field>
              </div>

              <div className="rounded-xl border border-black/5 p-4">
                <Controller
                  control={form.control}
                  name="loginEnabled"
                  render={({ field }) => (
                    <Switch
                      id="loginEnabled"
                      checked={field.value}
                      onChange={field.onChange}
                      label="Login enabled"
                      description="Turn off to suspend portal access without deleting the record."
                    />
                  )}
                />
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={() => toast({ title: 'Password reset link sent', variant: 'info' })}
              >
                <KeyRound className="h-4 w-4" aria-hidden="true" /> Reset password
              </Button>
            </div>
          )}

          {tab === 'documents' && (
            <FileDrop
              files={documents}
              onChange={setDocuments}
              label="Drop CV, citizenship and certificates"
              hint="PDF, JPG or PNG up to 10 MB each"
            />
          )}
        </div>

        <div className="sticky bottom-0 flex items-center justify-between gap-3 rounded-b-xl border-t border-black/5 bg-wcbt-surface px-5 py-3">
          <p className="text-xs text-wcbt-muted">
            {form.formState.isDirty ? 'Unsaved changes' : 'All changes saved'}
          </p>
          <div className="flex items-center gap-2">
            <Button type="button" variant="ghost" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button type="submit" loading={form.formState.isSubmitting}>
              Save staff member
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}

import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { SidePanel } from '@/components/shared/SidePanel';
import { Button } from '@/components/ui/Button';
import { Field, Input, Segmented, Select } from '@/components/ui/Field';
import { ChipSelect } from '@/components/ui/TagInput';
import { FileDrop } from '@/components/ui/FileDrop';
import { RichText, RichTextEditor } from '@/components/ui/RichTextEditor';
import { Tabs } from '@/components/ui/Tabs';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { notificationSchema, type NotificationFormValues } from '@/validation/notification';
import {
  NOTIFICATION_AUDIENCES,
  NOTIFICATION_CATEGORIES,
  type Notification,
  type NotificationAudience,
  type NotificationCategory,
  type NotificationDraft,
  type NotificationPriority,
  type NotificationRecipient,
} from '@/types/notification';
import type { FileRecord } from '@/types/common';
import { formatDate, todayISO } from '@/lib/utils';

interface NotificationPanelProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (draft: NotificationDraft) => Promise<void> | void;
  editing?: Notification | null;
  /** Pre-fills the notice when raised from another module, e.g. an applicant. */
  recipient?: NotificationRecipient | null;
}

const PRIORITY_OPTIONS: { label: string; value: NotificationPriority; dotClassName: string }[] = [
  { label: 'Normal', value: 'Normal', dotClassName: 'bg-wcbt-muted' },
  { label: 'High', value: 'High', dotClassName: 'bg-wcbt-warning' },
  { label: 'Urgent', value: 'Urgent', dotClassName: 'bg-wcbt-danger' },
];

const emptyValues = (): NotificationFormValues => ({
  title: '',
  message: '',
  category: 'General',
  priority: 'Normal',
  audience: ['All'],
  publishDate: todayISO(),
  expiryDate: '',
  status: 'Draft',
});

export function NotificationPanel({
  open,
  onClose,
  onSubmit,
  editing,
  recipient,
}: NotificationPanelProps) {
  const [tab, setTab] = useState('edit');
  const [attachments, setAttachments] = useState<FileRecord[]>([]);

  const form = useForm<NotificationFormValues>({
    resolver: zodResolver(notificationSchema),
    defaultValues: emptyValues(),
    mode: 'onChange',
  });

  useEffect(() => {
    if (!open) return;
    setTab('edit');
    if (editing) {
      form.reset({
        title: editing.title,
        message: editing.message,
        category: editing.category,
        priority: editing.priority,
        audience: editing.audience,
        publishDate: editing.publishDate,
        expiryDate: editing.expiryDate ?? '',
        status: editing.status === 'Archived' ? 'Draft' : editing.status,
      });
      setAttachments(editing.attachments);
    } else {
      form.reset({
        ...emptyValues(),
        title: recipient ? `Update on your application — ${recipient.name}` : '',
        category: recipient ? 'Admission' : 'General',
        audience: recipient ? ['Students'] : ['All'],
      });
      setAttachments([]);
    }
  }, [open, editing, recipient, form]);

  const values = form.watch();

  const submit = form.handleSubmit(async (formValues) => {
    await onSubmit({
      title: formValues.title,
      message: formValues.message,
      category: formValues.category as NotificationCategory,
      priority: formValues.priority as NotificationPriority,
      audience: formValues.audience as NotificationAudience[],
      status: formValues.status,
      publishDate: formValues.publishDate,
      expiryDate: formValues.expiryDate || null,
      attachments,
      recipient: editing?.recipient ?? recipient ?? null,
    });
    onClose();
  });

  return (
    <SidePanel
      open={open}
      onClose={onClose}
      title={editing ? 'Edit notice' : 'New notice'}
      description={
        recipient && !editing
          ? `Addressed to ${recipient.name}`
          : 'Publish a notice to students, staff or the public site.'
      }
      toolbar={
        <Tabs
          items={[
            { value: 'edit', label: 'Edit' },
            { value: 'preview', label: 'Preview' },
          ]}
          value={tab}
          onChange={setTab}
          ariaLabel="Notice editor"
          className="border-0"
        />
      }
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={submit}
            disabled={!form.formState.isValid}
            loading={form.formState.isSubmitting}
          >
            {editing ? 'Save changes' : 'Create notice'}
          </Button>
        </>
      }
    >
      {tab === 'preview' ? (
        <article className="rounded-xl border border-black/5 border-l-4 border-l-wcbt-maroon bg-wcbt-surface p-5">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={values.category} />
            <StatusBadge status={values.priority} />
            <span className="text-xs text-wcbt-muted">{formatDate(values.publishDate)}</span>
          </div>
          <h3 className="mt-3 text-lg font-semibold tracking-tight text-wcbt-ink">
            {values.title || 'Untitled notice'}
          </h3>
          <RichText html={values.message} className="mt-2" />
          <p className="mt-4 text-xs text-wcbt-muted">
            Audience: {values.audience.join(', ') || '—'}
            {values.expiryDate ? ` · Expires ${formatDate(values.expiryDate)}` : ''}
          </p>
          {attachments.length > 0 && (
            <ul className="mt-3 space-y-1 text-xs text-wcbt-maroon">
              {attachments.map((file) => (
                <li key={file.id}>{file.name}</li>
              ))}
            </ul>
          )}
        </article>
      ) : (
        <form className="space-y-5" onSubmit={submit} noValidate>
          <Field
            label="Title"
            htmlFor="title"
            required
            error={form.formState.errors.title?.message}
            hint={<span className="text-xs text-wcbt-muted">{values.title?.length ?? 0}/100</span>}
          >
            <Input
              id="title"
              maxLength={100}
              placeholder="e.g. Admission deadline extended"
              invalid={Boolean(form.formState.errors.title)}
              {...form.register('title')}
            />
          </Field>

          <Field label="Message" required error={form.formState.errors.message?.message}>
            <Controller
              control={form.control}
              name="message"
              render={({ field }) => (
                <RichTextEditor
                  value={field.value}
                  onChange={field.onChange}
                  invalid={Boolean(form.formState.errors.message)}
                />
              )}
            />
          </Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Category" htmlFor="category" required>
              <Select id="category" {...form.register('category')}>
                {NOTIFICATION_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="Priority" required>
              <Controller
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <Segmented
                    value={field.value as NotificationPriority}
                    onChange={field.onChange}
                    options={PRIORITY_OPTIONS}
                    ariaLabel="Priority"
                  />
                )}
              />
            </Field>
          </div>

          <Field label="Target audience" required error={form.formState.errors.audience?.message}>
            <Controller
              control={form.control}
              name="audience"
              render={({ field }) => (
                <ChipSelect
                  options={NOTIFICATION_AUDIENCES}
                  value={field.value as NotificationAudience[]}
                  onChange={field.onChange}
                  ariaLabel="Target audience"
                />
              )}
            />
          </Field>

          <Field label="Attachment">
            <FileDrop files={attachments} onChange={setAttachments} />
          </Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Publish date" htmlFor="publishDate" required error={form.formState.errors.publishDate?.message}>
              <Input id="publishDate" type="date" {...form.register('publishDate')} />
            </Field>
            <Field label="Expiry date" htmlFor="expiryDate" error={form.formState.errors.expiryDate?.message}>
              <Input
                id="expiryDate"
                type="date"
                invalid={Boolean(form.formState.errors.expiryDate)}
                {...form.register('expiryDate')}
              />
            </Field>
          </div>

          <Field label="Status">
            <Controller
              control={form.control}
              name="status"
              render={({ field }) => (
                <Segmented
                  value={field.value}
                  onChange={field.onChange}
                  options={[
                    { label: 'Draft', value: 'Draft' },
                    { label: 'Published', value: 'Published' },
                  ]}
                  ariaLabel="Status"
                />
              )}
            />
          </Field>
        </form>
      )}
    </SidePanel>
  );
}

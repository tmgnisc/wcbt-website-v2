import { z } from 'zod';
import {
  NOTIFICATION_AUDIENCES,
  NOTIFICATION_CATEGORIES,
  NOTIFICATION_PRIORITIES,
} from '@/types/notification';

export const notificationSchema = z
  .object({
    title: z.string().trim().min(1, 'Title is required').max(100, 'Keep the title under 100 characters'),
    message: z
      .string()
      .refine((value) => value.replace(/<[^>]*>/g, '').trim().length > 0, 'Message is required'),
    category: z.enum(NOTIFICATION_CATEGORIES as [string, ...string[]]),
    priority: z.enum(NOTIFICATION_PRIORITIES as [string, ...string[]]),
    audience: z
      .array(z.enum(NOTIFICATION_AUDIENCES as [string, ...string[]]))
      .min(1, 'Select at least one audience'),
    publishDate: z.string().min(1, 'Publish date is required'),
    expiryDate: z.string().optional().nullable(),
    status: z.enum(['Draft', 'Published']),
  })
  .refine(
    (values) => !values.expiryDate || new Date(values.expiryDate) > new Date(values.publishDate),
    { message: 'Expiry date must be after the publish date', path: ['expiryDate'] },
  );

export type NotificationFormValues = z.infer<typeof notificationSchema>;

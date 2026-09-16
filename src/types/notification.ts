import type { FileRecord } from './common';

export type NotificationCategory = 'General' | 'Academic' | 'Admission' | 'Urgent';
export type NotificationPriority = 'Normal' | 'High' | 'Urgent';
export type NotificationAudience = 'All' | 'Staff' | 'Students' | 'Public';
export type NotificationStatus = 'Draft' | 'Published' | 'Archived';

export const NOTIFICATION_CATEGORIES: NotificationCategory[] = [
  'General',
  'Academic',
  'Admission',
  'Urgent',
];
export const NOTIFICATION_PRIORITIES: NotificationPriority[] = ['Normal', 'High', 'Urgent'];
export const NOTIFICATION_AUDIENCES: NotificationAudience[] = ['All', 'Staff', 'Students', 'Public'];
export const NOTIFICATION_STATUSES: NotificationStatus[] = ['Draft', 'Published', 'Archived'];

/** Set when a notice is raised from another module, e.g. an admissions applicant. */
export interface NotificationRecipient {
  type: 'applicant' | 'staff';
  id: string;
  name: string;
}

export interface Notification {
  id: string;
  title: string;
  /** Stored as a limited HTML string produced by the rich text editor. */
  message: string;
  category: NotificationCategory;
  priority: NotificationPriority;
  audience: NotificationAudience[];
  status: NotificationStatus;
  publishDate: string;
  expiryDate?: string | null;
  attachments: FileRecord[];
  recipient?: NotificationRecipient | null;
  read: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export type NotificationDraft = Omit<
  Notification,
  'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'read'
>;

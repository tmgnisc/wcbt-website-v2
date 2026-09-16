export interface FileRecord {
  id: string;
  name: string;
  /** Size in bytes. */
  size: number;
  mimeType: string;
  uploadedAt: string;
  /** Object URL for locally picked files, or a server path once wired to a backend. */
  url?: string;
}

export interface ActivityEntry {
  id: string;
  action: string;
  actor: string;
  timestamp: string;
  detail?: string;
}

export interface LookupItem {
  id: string;
  name: string;
  description?: string;
}

export interface Option<T extends string = string> {
  label: string;
  value: T;
}

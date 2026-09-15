import fs from 'node:fs';
import path from 'node:path';

import { contentSlug, type TemplateName } from '@/config/navigation';
import type { PageContent } from '@/types/content';

const ROOT = process.cwd();
export const CONTENT_DIR = path.join(ROOT, 'content');
export const TEMPLATES_DIR = path.join(ROOT, 'templates');

/** Read fresh on every call so edits show up in `next dev` and renders never share mutable data. */
export function loadContent(pagePath: string): PageContent {
  return JSON.parse(fs.readFileSync(path.join(CONTENT_DIR, `${contentSlug(pagePath)}.json`), 'utf8'));
}

export function loadTemplate(name: TemplateName): string {
  return fs.readFileSync(path.join(TEMPLATES_DIR, `${name}.html`), 'utf8');
}

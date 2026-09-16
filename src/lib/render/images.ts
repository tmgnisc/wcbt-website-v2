/** Template-owned images that content blocks don't render: logos, page header photo, homepage video poster. */
import type { Document } from 'domhandler';

import { CAMPUS, FALLBACK, LOGO, heroImageFor } from '@/config/images';
import { SITE_NAME } from '@/config/site';

import { find, findAll, findParent, remove } from './dom';

export function fillTemplateImages(soup: Document, path: string): void {
  for (const logo of findAll(soup, 'img.site-logo, img.footer-logo, img[alt="Logo"]')) {
    logo.attribs.src = LOGO;
    logo.attribs.alt = SITE_NAME;
  }

  const hero = path === '/' ? CAMPUS : heroImageFor(path);
  for (const picture of findAll(soup, 'picture.page-header--picture img')) {
    picture.attribs.src = hero;
    picture.attribs['data-src'] = hero;
    picture.attribs.alt = '';
    if (hero !== FALLBACK) picture.attribs.onerror = `this.onerror=null;this.src='${FALLBACK}'`;
  }
  const video = find(soup, 'video[x-ref="hero-header--video"]');
  if (video) video.attribs.poster = CAMPUS;

  // placeholder accreditation badges: no real partner logos to show
  for (const list of findAll(soup, 'footer ul.accreditation-links')) remove(list);

  // any template placeholder still left (decorative): fall back to the campus photo
  for (const el of findAll(soup, '[src*="placehold.co"], [data-src*="placehold.co"]')) {
    if (findParent(el, 'picture')) remove(find(el.parent!, 'source'));
    if (el.attribs.src) el.attribs.src = CAMPUS;
    if (el.attribs['data-src']) el.attribs['data-src'] = CAMPUS;
  }
  for (const el of findAll(soup, '[style*="placehold.co"]')) {
    el.attribs.style = el.attribs.style.replace(/https:\/\/placehold\.co\/[^'")]+/g, CAMPUS);
  }
}

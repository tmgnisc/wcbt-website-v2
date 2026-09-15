/** Detects leftover lorem-ipsum copy from the design templates so it can be removed or replaced. */
import type { AnyNode, Element } from 'domhandler';

import { SITE_NAME } from '@/config/site';

import { $, descendants, isAttached, textNodes } from './dom';

const LOREM = new Set(
  `lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore
magna aliqua enim ad minim veniam quis nostrud exercitation ullamco laboris nisi aliquip ex ea commodo consequat duis aute
irure in reprehenderit voluptate velit esse cillum eu fugiat nulla pariatur excepteur sint occaecat cupidatat non proident
sunt culpa qui officia deserunt mollit anim id est laborum vel`.split(/\s+/),
);

export function isLorem(text: string): boolean {
  const words = text.toLowerCase().match(/[a-z]+/g) ?? [];
  return words.length > 0 && words.filter((w) => LOREM.has(w)).length / words.length >= 0.6;
}

/** Text nodes that are template lorem (outside script/style). */
export function loremTexts(root: AnyNode) {
  return textNodes(root).filter((t) => {
    const parent = t.parent as Element | null;
    return parent && !['script', 'style'].includes(parent.name) && t.data.trim() && isLorem(t.data);
  });
}

/** Remove (or just report) template lorem left inside root; lorem attributes are always neutralised. */
export function sweep(root: AnyNode, remove: boolean): string[] {
  const leftovers = loremTexts(root);
  if (remove) {
    for (const text of leftovers) {
      const el = text.parent;
      if (el && el.parent && isAttached(el)) $(el).remove();
    }
  }
  for (const tag of descendants(root)) {
    for (const attr of ['alt', 'aria-label', 'title', 'placeholder']) {
      if (tag.attribs[attr] && isLorem(tag.attribs[attr])) tag.attribs[attr] = attr === 'alt' ? '' : SITE_NAME;
    }
  }
  return leftovers.map((t) => t.data);
}

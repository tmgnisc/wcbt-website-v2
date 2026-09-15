/** Puts a page's hero copy (first content block with an h1) into the template's page header. */
import { Text, type Element } from 'domhandler';

import { PAGES } from '@/config/navigation';
import type { Block } from '@/types/content';

import { resolveHref } from './blocks';
import { $, find, findAll, findParent, newTag, ownText, remove, setString, sourceLine } from './dom';
import { sweep } from './lorem';

export function fillHero(hero: Element, block: Block | null, title: string): void {
  const paras = block ? [...block.paras] : [];
  let kicker = block ? block.eyebrow : '';
  if (!kicker && paras.length >= 2 && [...paras[0]].length <= 60) kicker = paras.shift()!;
  const lead = paras[0] ?? '';
  const links = block ? block.links : [];
  const inCrumb = (el: Element) => findParent(el, 'nav.breadcrumb') !== null;

  const heading = find(hero, 'h1') ?? find(hero, '.page-header__content .h2') ?? find(hero, 'h2');
  if (heading) {
    heading.name = 'h1';
    delete heading.attribs.href;
    setString(heading, block?.h1 || title);
  }

  const texts = findAll(hero, 'p, div, span').filter(
    (t) => ownText(t) && !inCrumb(t) && !(heading && $.contains(heading, t)),
  );
  const headingLine = heading ? sourceLine(heading) : undefined;
  const before = texts.filter((t) => {
    const line = sourceLine(t);
    return heading && line !== undefined && headingLine && line < headingLine;
  });
  const after = texts.filter((t) => !before.includes(t));
  if (after.length) {
    if (lead) setString(after[0], lead);
    else remove(after[0]);
  } else if (lead && heading) {
    $(heading).after(newTag('div', { class: 'u-text-h5 u-font-bold u-font-sans u-leading-tight u-mt-3' }, lead));
  }
  if (before.length) {
    const last = before[before.length - 1];
    if (kicker) setString(last, kicker);
    else remove(last);
  }

  const cta = findAll(hero, 'a').filter((a) => {
    const cls = (a.attribs.class ?? '').split(/\s+/);
    return !inCrumb(a) && (cls.includes('btn') || cls.includes('cta-link'));
  });
  cta.forEach((a, i) => {
    if (i < links.length) {
      a.attribs.href = resolveHref(links[i].href, links[i].text, PAGES);
      for (const child of [...a.children]) {
        if (child.type === 'text' || child.type === 'comment') $(child).remove();
      }
      $(a).prepend(new Text(`${links[i].text} `));
    } else {
      remove(findParent(a, 'li') ?? a);
    }
  });
  for (const box of findAll(hero, '.statistics-row-box')) remove(box);
  for (const art of findAll(hero, '.tapestry')) {
    // decorative collage overlaps long real headings
    if (art.parent) remove(art.parent !== hero ? art.parent : art);
  }
  sweep(hero, true);
}

/**
 * Homepage layout (template 01-homepage), following durham.ac.uk: hero -> "Find a course" -> content sections, with
 * "Your next steps" rendered as the template's image-card section. Both sections are cloned from the template itself,
 * so their markup and styling match it exactly.
 */
import type { Element } from 'domhandler';

import { PAGES, label, type PageDef } from '@/config/navigation';
import type { Block, Item } from '@/types/content';

import { img, renderBody, resolveHref } from './blocks';
import { $, children, clone, find, findAll, fragment, newTag, remove, serialize, setString, setText } from './dom';

type Pages = Record<string, PageDef>;

const COURSE_SEARCH_SCRIPT = `
document.querySelectorAll('form[data-course-search]').forEach(function (form) {
  form.addEventListener('submit', function (event) {
    event.preventDefault();
    var q = (form.querySelector('input[type=search]').value || '').trim().toLowerCase();
    var courses = JSON.parse(form.getAttribute('data-course-search'));
    var match = q && courses.find(function (c) { return c.keywords.some(function (k) { return q.indexOf(k) !== -1; }); });
    window.location.href = match ? match.href : form.getAttribute('action');
  });
});`;

/** Search keywords per course page (checked in order, so the more specific B.Tech entry comes first). */
const COURSE_KEYWORDS: Record<string, string[]> = {
  '/programs/btech-ed-it/': ['b.tech', 'btech', 'b tech', 'education', 'ed it', 'teach'],
  '/programs/bit/': ['bit', 'information technology', 'bachelor in information', 'software', 'computer'],
};

const isCourseSearch = (b: Block) => b.forms.length > 0 && b.forms.every((f) => f.fields.length <= 1) && !b.heading;
const isNextSteps = (b: Block) => /next/i.test(b.heading) && b.groups.length === 1;

/** Course page for a quick-filter label such as "BIT" or "B.Tech Ed IT". */
function coursePath(text: string, pages: Pages): string {
  return Object.keys(pages).find((p) => p.startsWith('/programs/') && label(p) === text) ?? resolveHref(null, text, pages);
}

function renderCourseSearch(template: Element, block: Block, pages: Pages): string {
  const section = clone(template);
  const form = find(section, 'form')!;
  const courses = Object.entries(COURSE_KEYWORDS).map(([href, keywords]) => ({ href, keywords }));
  form.attribs = { action: '/programs/', class: 'u-relative', 'data-course-search': JSON.stringify(courses) };

  setString(find(form, 'label')!, 'Find a course');
  const input = find(form, 'input[type=search]')!;
  Object.assign(input.attribs, { name: 'q', placeholder: block.forms[0].fields[0]?.placeholder || 'Search programs', list: 'course-options' });
  delete input.attribs['@blur'];
  delete input.attribs['@focus'];
  for (const hidden of findAll(form, 'input[type=hidden]')) remove(hidden);
  setString(find(form, 'button span.u-visually-hidden')!, block.forms[0].submit || 'Search');
  const datalist = newTag('datalist', { id: 'course-options' });
  for (const p of Object.keys(COURSE_KEYWORDS)) $(datalist).append(newTag('option', { value: PAGES[p].title }));
  $(input).after(datalist);

  setString(find(section, 'span.u-text-primary')!, block.eyebrow || 'Popular searches:');
  const list = find(section, 'ul')!;
  const itemProto = children(list, 'li')[0];
  $(list).empty();
  for (const link of block.links) {
    const li = clone(itemProto);
    const a = find(li, 'a')!;
    a.attribs.href = coursePath(link.text, pages);
    setString(a, link.text);
    $(list).append(li);
  }

  const all = find(section, 'a.btn')!;
  all.attribs.href = '/programs/';
  setText(all, 'View all programs ');

  $(section).append(newTag('script', {}, COURSE_SEARCH_SCRIPT));
  return serialize(section);
}

function renderNextSteps(template: Element, block: Block, pages: Pages): string {
  const section = clone(template);
  setString(find(section, 'h2')!, block.heading);
  const items: Item[] = block.groups[0];
  const fill = (card: Element, it: Item) => {
    const a = find(card, 'h3 a')!;
    a.attribs.href = resolveHref(it.href, it.title, pages);
    setString(a, it.title);
    const frame = find(card, '.card__image')!;
    $(frame).empty();
    $(frame).append(fragment(img(it.title, 'embed-responsive-item u-object-cover u-transition group-hocus:u-scale-110 image u-w-full')));
  };

  // mobile: horizontal slider; md+: grid. Both come from the template.
  for (const container of [find(section, 'ul.horizontal-slider'), find(section, 'div.row.md\\:u-flex')]) {
    if (!container) continue;
    const slots = children(container);
    const proto = slots[0];
    for (const slot of slots) remove(slot);
    items.forEach((it, i) => {
      const slot = clone(proto);
      if (container.name === 'ul') slot.attribs.class = `horizontal-slider__item u-scroll-snap-start u-pl-2${i < items.length - 1 ? ' u-mr-1' : ''}`;
      fill(slot, it);
      $(container).append(slot);
    });
  }
  const controls = find(section, '.horizontal-slider-controls');
  if (controls) {
    controls.attribs['aria-label'] = `${block.heading} slider controls`;
    for (const button of findAll(controls, 'button')) {
      button.attribs['aria-label'] = button.attribs['data-horizontal-slider-control'] === 'prev' ? 'Previous' : 'Next';
    }
  }
  return serialize(section);
}

/**
 * Homepage body HTML. `main` is the template's main-content element (still unpruned). Content blocks that sit between
 * the hero and the course search on the live site (announcement ticker, campus banner) are left out.
 */
export function renderHomeBody(main: Element, blocks: Block[], pages: Pages): string {
  const searchTemplate = find(main, 'div.search-bar-fb');
  const nextStepsTemplate = findAll(main, 'div.landing-page-section').find((s) => find(s, 'ul.horizontal-slider')) ?? null;
  const searchIndex = blocks.findIndex(isCourseSearch);
  const content = searchIndex === -1 ? blocks : blocks.slice(searchIndex + 1);

  const parts: string[] = [];
  if (searchTemplate && searchIndex !== -1) parts.push(renderCourseSearch(searchTemplate, blocks[searchIndex], pages));
  parts.push(
    renderBody(content, pages, (block) => (nextStepsTemplate && isNextSteps(block) ? renderNextSteps(nextStepsTemplate, block, pages) : null)),
  );
  return parts.join('\n');
}

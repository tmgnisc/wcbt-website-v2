/** Renders scraped content blocks (content/*.json) with the design template's component markup. */
import { IMAGES } from '@/config/images';
import { CONTACT, PLACEHOLDER, PLACEHOLDER_WIDE } from '@/config/site';
import type { PageDef } from '@/config/navigation';
import type { Block, FormSpec, Item, Link, Quote } from '@/types/content';

type Pages = Record<string, PageDef>;

const MORE_LINK = /^(view details|read more|learn more|view|explore|details)$/i;

/** Link text -> page, for buttons that have no href on the source site. */
const CTA_TARGETS: [RegExp, string][] = [
  [/apply|application/i, '/apply-form/'],
  [/scholarship/i, '/academics/scholarships/'],
  [/virtual|tour/i, '/visit/virtual-tour/'],
  [/visit|book|schedule/i, '/visit/'],
  [/program|course|degree/i, '/programs/'],
  [/contact|admission|inquir|talk|get in touch/i, '/contact/'],
  [/career|placement/i, '/careers/'],
  [/news/i, '/updates/news/'],
  [/event/i, '/updates/events/'],
];

const SPRITE = '/media/durham-university/site-assets/image/sprite.svg';
const ARROW = `<svg class="icon u-ml-1" focusable="false"><use xlink:href="${SPRITE}#feather--arrow-right"></use></svg>`;
const CTA_ARROW = `<svg class="icon u-transition u-ml-1" focusable="false"><use xlink:href="${SPRITE}#cti--arrow-button-right"></use></svg>`;

/** Character count in code points (matches the original Python build). */
const len = (s: string) => [...s].length;

export function e(text: string | null | undefined): string {
  return (text ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

export function resolveHref(href: string | null | undefined, text: string | null | undefined, pages: Pages): string {
  if (href && /^(tel:|mailto:|http)/.test(href)) return href;
  if (href && href.startsWith('/')) {
    const [rawPath, ...rest] = href.split('#');
    const anchor = rest.join('#');
    const path = rawPath.replace(/\/+$/, '') + '/';
    if (path in pages) return path + (anchor ? `#${anchor}` : '');
  }
  for (const [pattern, target] of CTA_TARGETS) {
    if (pattern.test(text ?? '')) return target;
  }
  return '#';
}

/** A real photo when one is configured for this alt text (src/config/images.ts), otherwise a placeholder. */
export function img(alt: string, cls = 'u-w-full img', wide = false): string {
  const photo = IMAGES[alt];
  const src = photo?.src ?? (wide ? PLACEHOLDER_WIDE : PLACEHOLDER);
  const style = photo?.position ? ` style="object-position: ${photo.position};"` : '';
  return `<img alt="${e(alt)}" class="${cls}" loading="lazy" src="${src}"${style}/>`;
}

function paragraphs(paras: string[], largeFirst = false): string {
  if (!paras.length) return '';
  const out = paras.map((p, i) => `<p${largeFirst && i === 0 ? ' class="u-text-large"' : ''}>${e(p)}</p>`);
  return `<div class="text-long u-max-w-measure-lg u-leading-normal u-o-3">${out.join('')}</div>`;
}

function bullets(items: string[]): string {
  if (!items.length) return '';
  return `<div class="text-long u-max-w-measure-lg u-leading-normal u-o-3"><ul>${items.map((b) => `<li>${e(b)}</li>`).join('')}</ul></div>`;
}

function buttons(links: Link[], pages: Pages, dark = false): string {
  if (!links.length) return '';
  const out = links.map((link, i) => {
    const href = resolveHref(link.href, link.text, pages);
    if (i === 0) {
      return `<li><a class="${dark ? 'btn btn-light' : 'btn btn-primary'}" href="${e(href)}">${e(link.text)}${ARROW}</a></li>`;
    }
    return (
      `<li><a class="link cta-link u-font-bold u-no-underline u-pr-2 hocus:u-underline u-block${dark ? ' u-text-white' : ''}" ` +
      `href="${e(href)}">${e(link.text)}${CTA_ARROW}</a></li>`
    );
  });
  return `<ul class="u-list-reset u-flex u-flex-wrap u-items-center u-gap-x-4 u-gap-y-3 u-mt-4 u-mb-0">${out.join('')}</ul>`;
}

function eyebrow(text: string, dark = false): string {
  if (!text) return '';
  return `<p class="u-text-small u-font-bold u-uppercase u-mb-1 ${dark ? 'u-text-white' : 'u-text-primary'}">${e(text)}</p>`;
}

function quote(q: Quote | null): string {
  if (!q) return '';
  const cite = q.cite.join(', ');
  return (
    `<blockquote class="blockquote u-my-4"><p class="u-text-h4 u-font-bold u-leading-tight">“${e(q.text)}”</p>` +
    (cite ? `<p class="u-mt-2 u-mb-0 u-text-medium"><cite>— ${e(cite)}</cite></p>` : '') +
    '</blockquote>'
  );
}

function section(inner: string, tone = 'plain', extra = ''): string {
  const toneCls = ({ dark: ' u-bg-primary u-text-white has-dark-bg', muted: ' u-bg-grey-50' } as Record<string, string>)[tone] ?? '';
  return (
    `<div class="landing-page-section u-breakout u-relative u-py-4 md:u-py-6 lg:u-py-10${toneCls}${extra}">` +
    `<div class="container u-o-5">${inner}</div></div>`
  );
}

function headingGroup(b: Block, dark = false, center = false): string {
  const parts = [eyebrow(b.eyebrow, dark)];
  if (b.heading) {
    const bar = dark || center ? '' : ' u-heading-bar';
    parts.push(`<h2 class="h2 u-mb-4${bar}">${e(b.heading)}</h2>`);
  }
  parts.push(paragraphs(b.paras, !!b.heading), bullets(b.bullets), quote(b.quote));
  return parts.join('');
}

// ---------------------------------------------------------------- item groups
function columns(items: Item[]): string {
  const n = items.length;
  const longText = items.reduce((sum, it) => sum + len([...it.text, ...it.bullets].join(' ')), 0) / Math.max(n, 1) > 260;
  if (n === 2 || (longText && n % 2 === 0)) return 'col-md-6';
  if (n % 4 === 0 && !longText) return 'col-md-6 col-lg-3';
  return 'col-md-6 col-lg-4';
}

function cleanItem(it: Item): Item {
  const text = it.text.filter((t) => !MORE_LINK.test(t));
  let links = it.links.filter((l) => l.text !== 'i');
  const more = it.text.find((t) => MORE_LINK.test(t));
  if (more && !links.length) links = [{ text: more, href: it.href }];
  return { ...it, text, links };
}

function card(raw: Item, pages: Pages, col: string): string {
  const it = cleanItem(raw);
  const href = it.href ? resolveHref(it.href, it.title, pages) : null;
  let title = e(it.title);
  if (href && href !== '#') title = `<a class="link u-text-inherit group-hocus:u-underline" href="${e(href)}">${title}</a>`;
  const parts: string[] = [];
  if (it.eyebrow) parts.push(`<p class="u-text-small u-font-bold u-uppercase u-text-grey-300 u-mb-0">${e(it.eyebrow)}</p>`);
  if (it.stat) parts.push(`<p class="u-text-h3 u-font-bolder u-text-primary u-leading-tight u-mb-0">${e(it.stat)}</p>`);
  if (it.title) parts.push(`<h3 class="card-heading u-mb-0 u-font-bolder u-leading-tight u-text-large u-text-primary">${title}</h3>`);
  if (it.text.length) {
    parts.push(`<div class="u-text-small text-long u-leading-normal u-o-2">${it.text.map((t) => `<p>${e(t)}</p>`).join('')}</div>`);
  }
  if (it.bullets.length) parts.push(`<ul class="u-text-small u-pl-3 u-mb-0">${it.bullets.map((b) => `<li>${e(b)}</li>`).join('')}</ul>`);
  for (const link of it.links.slice(0, 2)) {
    const lhref = resolveHref(link.href, link.text, pages);
    parts.push(
      `<a class="link cta-link u-font-bold u-no-underline u-pr-2 hocus:u-underline u-block u-mt-auto" href="${e(lhref)}">${e(link.text)}${CTA_ARROW}</a>`,
    );
  }
  const image = it.image
    ? `<div class="card__image embed-responsive u-bg-grey-50 embed-responsive-16by9">` +
      img(it.image !== 'image' ? it.image : it.title, 'embed-responsive-item u-object-cover u-transition group-hocus:u-scale-110 image u-w-full') +
      '</div>'
    : '';
  const border = image ? '' : ' u-border-t-6 u-border-primary';
  return (
    `<div class="${col}"><div class="card group u-relative u-flex u-flex-col u-w-full u-h-full u-overflow-hidden ` +
    `u-bg-white u-text-black hover:u-shadow u-transition${border}" data-card="">${image}` +
    `<div class="card-body u-flex u-flex-col u-flex-1 u-p-3 u-o-2">${parts.join('')}</div></div></div>`
  );
}

function statsBand(items: Item[]): string {
  const cols = items.map((it) => {
    const text = [it.title, ...it.text].filter(Boolean).join(' — ');
    return (
      `<div class="col-md-6 col-lg"><div class="u-flex u-items-center u-text-white u-gap-x-2">` +
      `<span class="u-text-h3 u-block u-font-bolder u-font-sans u-leading-tight">${e(it.stat)}</span>` +
      `<span class="u-leading-normal">${e(text)}</span></div></div>`
    );
  });
  return `<div class="u-bg-primary u-breakout u-py-4"><div class="container"><div class="row u-items-center u-gap-y-2">${cols.join('')}</div></div></div>`;
}

function chips(items: Item[], dark = false): string {
  const color = dark ? 'u-border-white u-text-white' : 'u-border-primary u-text-primary u-bg-white';
  const out = items
    .map((it) => `<li class="u-inline-block u-px-3 u-py-1 u-rounded-full u-border-1 ${color} u-font-bold u-text-small">${e(it.title)}</li>`)
    .join('');
  return `<ul class="u-list-reset u-flex u-flex-wrap u-gap-2 u-mt-3 u-mb-0">${out}</ul>`;
}

function isChipGroup(items: Item[]): boolean {
  return items.every((it) => !(it.text.length || it.stat || it.bullets.length || it.image || it.links.length) && len(it.title) <= 40);
}

function isStatGroup(items: Item[]): boolean {
  return items.every((it) => it.stat) && !items.every((it) => /^(?:\d{1,2}|(19|20)\d\d)$/.test(it.stat));
}

export function renderGroup(items: Item[], pages: Pages, dark = false): string {
  if (isChipGroup(items)) return chips(items, dark);
  if (items.every((it) => /^\d{1,2}$/.test(it.stat ?? ''))) {
    items = items.map((it) => ({ ...it, eyebrow: `Step ${it.stat}`, stat: '' })); // numbered steps
  } else if (items.every((it) => /^(19|20)\d\d$/.test(it.stat ?? ''))) {
    items = items.map((it) => ({ ...it, eyebrow: it.stat, stat: '' })); // timeline years
  }
  const col = columns(items);
  return `<div class="row md:u-gap-y-5 u-gap-y-2 u-mt-4">${items.map((it) => card(it, pages, col)).join('')}</div>`;
}

// ---------------------------------------------------------------- other components
function faqList(faqs: Block['faqs']): string {
  const items = faqs
    .map(
      (f) =>
        `<details class="u-bg-white u-border-b-1 u-border-grey-50 u-p-3"><summary class="u-font-bold u-text-large u-cursor-pointer">` +
        `${e(f.q)}</summary><div class="text-long u-leading-normal u-mt-2"><p>${e(f.a)}</p></div></details>`,
    )
    .join('');
  return `<div class="u-max-w-measure-lg u-mt-4 u-o-1">${items}</div>`;
}

function table(rows: string[][]): string {
  if (!rows.length) return '';
  const head = rows[0].map((c) => `<th scope="col">${e(c)}</th>`).join('');
  const body = rows
    .slice(1)
    .map((r) => '<tr>' + r.map((c, i) => (i === 0 ? `<th scope="row">${e(c)}</th>` : `<td>${e(c)}</td>`)).join('') + '</tr>')
    .join('');
  return `<div class="table-responsive u-mt-4 u-bg-white"><table class="table u-mb-0"><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></div>`;
}

function form(spec: FormSpec, uid: string): string {
  const fields = spec.fields.map((f, i) => {
    const fid = `${uid}-${i}`;
    const name = e(f.name || fid);
    const labelText = f.label || f.placeholder || (f.options.length ? f.options[0] : f.name);
    const req = f.required ? ' required' : '';
    let control: string;
    let full = false;
    if (f.tag === 'select' || f.options.length) {
      const opts = f.options;
      const first = opts.length ? `<option value="">${e(opts[0])}</option>` : '';
      const options = opts.slice(1).map((o) => `<option>${e(o)}</option>`).join('');
      control = `<select class="custom-select form-control" id="${fid}" name="${name}"${req}>${first}${options}</select>`;
    } else if (f.tag === 'textarea' || /message|details|anything|tell us/i.test(labelText)) {
      control = `<textarea class="form-control" id="${fid}" name="${name}" rows="5"${req}></textarea>`;
      full = true;
    } else {
      control = `<input class="form-control" id="${fid}" name="${name}" type="${e(f.type || 'text')}"${req}/>`;
    }
    const col = full ? 'col-12' : 'col-md-6';
    return `<div class="${col} u-mb-3"><label class="u-block u-font-bold u-mb-1" for="${fid}">${e(labelText)}</label>${control}</div>`;
  });
  const notes = (spec.notes ?? []).map((n) => `<p class="u-text-small u-mt-2 u-mb-0">${e(n)}</p>`).join('');
  return (
    `<form action="#" class="u-bg-white u-text-black u-p-4 u-shadow" method="post" ` +
    `onsubmit="event.preventDefault(); this.querySelector('[role=status]').hidden = false;">` +
    `<div class="row">${fields.join('')}</div>` +
    `<button class="btn btn-primary" type="submit">${e(spec.submit || 'Submit')}</button>${notes}` +
    `<p class="u-mt-3 u-font-bold u-text-primary" hidden role="status">Thank you — this demo form does not send data yet.</p>` +
    '</form>'
  );
}

function contactDetails(): string {
  const phones = CONTACT.phones.map((p) => `<a class="u-text-inherit" href="tel:${p}">${p}</a>`).join(', ');
  return (
    `<div class="u-leading-normal"><p><strong>${e(CONTACT.address)}</strong></p>` +
    `<p><strong>Phone:</strong> ${phones}</p>` +
    `<p><strong>Email:</strong> <a class="u-text-inherit" href="mailto:${CONTACT.email}">${CONTACT.email}</a></p></div>`
  );
}

/** Closing call to action: the template's "get in touch" image band. */
function ctaBand(b: Block, pages: Pages): string {
  return (
    `<div class="landing-page-section landing-page-section--get-in-touch u-breakout u-py-4 md:u-py-10 lg:u-py-16 ` +
    `landing-page-section--image u-bg-cover u-bg-bottom u-text-white has-dark-bg" ` +
    `style="background-image: url('${PLACEHOLDER_WIDE}');"><div class="container u-o-5 u-relative u-z-1">` +
    `<div class="row u-flex-col u-justify-between lg:u-flex-row u-items-center"><div class="u-o-5 col-lg-6">` +
    `${eyebrow(b.eyebrow, true)}<h2 class="h2 u-mb-4">${e(b.heading)}</h2>${paragraphs(b.paras)}` +
    `${buttons(b.links, pages, true)}</div>` +
    `<div class="u-o-5 u-mt-4 lg:u-mt-0 col-lg-4">${contactDetails()}</div></div></div>` +
    `<div class="landing-page-section__corner u-absolute u-pin-t u-pin-l landing-page-section__corner--left u-text-white"></div></div>`
  );
}

/** Text beside an image: the template's signposting section. */
function split(b: Block, pages: Pages, reverse = false, imageAlt: string | null = null): string {
  const order = reverse ? ' lg:u-flex-row-reverse' : '';
  const dark = b.tone === 'dark';
  const groups = b.groups.map((g) => renderGroup(g, pages, dark)).join('');
  const alt = imageAlt || b.heading;
  const ratio = IMAGES[alt]?.portrait ? 'embed-responsive-1by1' : 'embed-responsive-16by9';
  return section(
    `<div class="row u-flex-col u-justify-between lg:u-flex-row${order} u-items-center">` +
      `<div class="u-o-5 col-lg-5"><div class="u-relative u-z-1 u-shadow-media u-bg-grey-50 embed-responsive ` +
      `${ratio} u-rounded-br-lg">${img(alt, 'embed-responsive-item u-object-cover u-w-full')}</div></div>` +
      `<div class="u-o-5 u-mt-4 lg:u-mt-0 col-lg-6">${headingGroup(b, dark)}${buttons(b.links, pages, dark)}</div></div>` +
      groups,
    b.tone,
    ' signposting',
  );
}

const emptyItem = (title: string): Item => ({ eyebrow: '', title, stat: '', text: [], bullets: [], links: [], image: null, href: null });

/** A one-item "group" is really part of the section copy. */
function flattenSingleGroups(b: Block): Block {
  const keep: Item[][] = [];
  const chipTexts: string[] = [];
  for (const g of b.groups) {
    if (g.length !== 1) {
      keep.push(g);
      continue;
    }
    const it = g[0];
    if (it.title && !b.eyebrow && b.heading) b.paras.push(it.title);
    else if (it.title && !b.heading) b.heading = it.title;
    for (const t of it.text) {
      if (/^["“]/.test(t) && !b.quote) b.quote = { text: t.replace(/^["“”]+|["“”]+$/g, ''), cite: [] };
      else if (b.quote && len(t) < 50 && b.quote.cite.length < 2) b.quote.cite.push(t);
      else if (len(t) <= 20 && !/[.!?]$/.test(t)) chipTexts.push(t);
      else b.paras.push(t);
    }
    b.bullets.push(...it.bullets);
    b.links.push(...it.links);
  }
  b.groups = keep;
  if (chipTexts.length) b.groups.push(chipTexts.map(emptyItem));
  return b;
}

function renderBlock(source: Block, pages: Pages, index: number, isLast: boolean): string {
  const b = flattenSingleGroups({
    ...source,
    paras: [...source.paras],
    links: [...source.links],
    bullets: [...source.bullets],
    quote: source.quote && { ...source.quote, cite: [...source.quote.cite] },
  });
  const dark = b.tone === 'dark';
  if (![b.heading, b.paras.length, b.groups.length, b.forms.length, b.faqs.length, b.tables.length, b.bullets.length].some(Boolean)) return '';
  if (b.forms.length && b.forms.every((f) => f.fields.length <= 1) && !b.heading) return ''; // site search widget, not page content

  if (b.forms.length) {
    let side = headingGroup(b, dark) + b.groups.filter(isChipGroup).map((g) => renderGroup(g, pages, dark)).join('');
    const info = b.groups.filter((g) => !isChipGroup(g));
    side += info
      .map(
        (g) =>
          '<ul class="u-list-reset u-mt-3">' +
          g
            .map(
              (it) =>
                `<li class="u-mb-2"><strong>${e(it.title)}</strong> ` + [...it.text, ...it.links.map((l) => l.text)].map(e).join(' ') + '</li>',
            )
            .join('') +
          '</ul>',
      )
      .join('');
    if (!info.length && !b.groups.length) side += contactDetails();
    return section(
      `<div class="row u-gap-y-4"><div class="col-lg-5 u-o-4">${side}</div>` +
        `<div class="col-lg-7">${b.forms.map((f, i) => form(f, `f${index}-${i}`)).join('')}</div></div>`,
      b.tone,
    );
  }

  const plainCopy = !b.groups.length && !b.faqs.length && !b.tables.length;
  if (dark && plainCopy && isLast) return ctaBand(b, pages);
  if (dark && plainCopy) {
    return section(
      `<div class="u-text-center u-max-w-measure-lg u-mx-auto">${headingGroup(b, true, true)}` +
        `<div class="u-flex u-justify-center">${buttons(b.links, pages, true)}</div></div>`,
      'dark',
    );
  }

  const statGroups = b.groups.filter((g) => isStatGroup(g) && g.length <= 5);
  if (b.images.length && !b.faqs.length && !b.tables.length && b.groups.length <= 1 && !statGroups.length) {
    return split(b, pages, index % 2 === 0, b.images[0] !== 'image' ? b.images[0] : null);
  }
  if (/^Stop \d+/.test(b.eyebrow || '')) return split(b, pages, index % 2 === 0);

  let inner = headingGroup(b, dark);
  for (const g of b.groups) {
    if (statGroups.includes(g) && !dark) continue;
    inner += renderGroup(g, pages, dark);
  }
  inner += b.tables.map(table).join('');
  inner += b.faqs.length ? faqList(b.faqs) : '';
  inner += buttons(b.links, pages, dark);
  const out = [section(inner, b.tone)];
  if (!dark) out.push(...statGroups.map(statsBand));
  return out.join('');
}

/** `override` can supply custom markup for a block (return null/undefined to use the default rendering). */
export function renderBody(blocks: Block[], pages: Pages, override?: (block: Block, index: number) => string | null | undefined): string {
  return blocks
    .map((b, i) => override?.(b, i) ?? renderBlock(b, pages, i, i === blocks.length - 1))
    .filter(Boolean)
    .join('\n');
}

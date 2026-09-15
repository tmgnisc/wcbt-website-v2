/** Site chrome built on each template's own markup: header navigation, breadcrumb, section menu and footer. */
import type { AnyNode, Comment, Document, Element, Text } from 'domhandler';

import {
  FOOTER_COLS,
  PAGES,
  PRIMARY_NAV,
  SECTIONS,
  UTILITY_NAV,
  label,
  type NavEntry,
  type SectionKey,
} from '@/config/navigation';
import { CONTACT, COPYRIGHT, FOOTER_TAGLINE } from '@/config/site';

import {
  $,
  children,
  clone,
  find,
  findAll,
  findParent,
  fragment,
  hasClass,
  isAttached,
  newTag,
  remove,
  serialize,
  setString,
  setText,
} from './dom';
import { isLorem } from './lorem';

/** Text and comment nodes whose content is template lorem, in document order. */
function loremStrings(root: AnyNode, skipCode = false): (Text | Comment)[] {
  const out: (Text | Comment)[] = [];
  const walk = (n: AnyNode) => {
    for (const child of 'children' in n ? n.children : []) {
      if (child.type === 'text' || child.type === 'comment') {
        const node = child as Text | Comment;
        const parentName = (node.parent as Element | null)?.name ?? '';
        if (node.data.trim() && isLorem(node.data) && !(skipCode && ['script', 'style'].includes(parentName))) out.push(node);
      } else {
        walk(child);
      }
    }
  };
  walk(root);
  return out;
}

/** First 3+ digit id in an element's attributes or toggle button (Alpine menu ids). */
function menuId(li: Element): string | null {
  const button = find(li, 'button');
  const haystack = Object.values(li.attribs).join(' ') + (button ? serialize(button) : '');
  return haystack.match(/\b(\d{3,})\b/)?.[1] ?? null;
}

function setLink(item: Element, href: string, text: string): void {
  const a = find(item, 'a')!;
  a.attribs.href = href;
  setString(a, text);
}

export function buildPrimaryNav(soup: Document): void {
  const ul = find(soup, 'ul[x-data="primaryNavigation()"]');
  if (!ul) return;
  const proto = children(ul, 'li')[0];
  const old = menuId(proto);
  $(ul).empty();
  PRIMARY_NAV.forEach(([name, href, items], i) => {
    const li = clone(proto, old ? { [old]: String(910001 + i) } : {});
    const a = find(li, 'a')!;
    a.attribs.href = href;
    setText(a, name);
    const button = find(li, 'button');
    const hidden = button && find(button, 'span.u-visually-hidden');
    if (hidden) setString(hidden, `Show submenu for ${name}`);
    const h2 = find(li, 'h2');
    if (h2) setString(h2, name);
    const sub = find(li, 'ul.row');
    if (sub) {
      const itemProto = find(sub, 'li')!;
      $(sub).empty();
      for (const [text, link] of items) {
        const it = clone(itemProto);
        setLink(it, link, text);
        $(sub).append(it);
      }
    }
    $(ul).append(li);
  });
}

export function buildMobileNav(soup: Document): void {
  const header = find(soup, 'header');
  const box = header && find(header, 'div.mobile-menu');
  const ul = box && children(box, 'ul')[0];
  if (!ul) return;
  const lis = children(ul, 'li');
  let proto = lis.find((li) => find(li, 'div ul li a')) ?? null;
  let entries: NavEntry[];
  if (!proto) {
    // template has no nested mobile items: flatten sections into plain links
    proto = lis[0];
    entries = [['Home', '/', []], ...PRIMARY_NAV.flatMap(([, , items]) => items.map(([t, h]): NavEntry => [t, h, []]))];
  } else {
    entries = [['Home', '/', []], ...PRIMARY_NAV];
  }
  entries.push(...UTILITY_NAV.map(([n, h]): NavEntry => [n, h, []]));
  const old = menuId(proto);
  const firstItem = lis.flatMap((li) => findAll(li, 'div ul li')).find((it) => find(it, 'a'));
  const itemProto = firstItem ? clone(firstItem) : null;
  $(ul).empty();
  entries.forEach(([name, href, items], i) => {
    const id = String(920001 + i);
    const li = clone(proto, old ? { [old]: id } : {});
    const a = find(li, 'a')!;
    a.attribs.href = href;
    setString(a, name);
    const sub = find(li, 'div ul');
    if (!items.length || !sub) {
      for (const extra of children(li, 'button, div')) remove(extra);
    } else {
      if (!children(li, 'button').length) {
        // proto without toggle: borrow one from a sibling
        const btn = lis.map((x) => children(x, 'button')[0]).find(Boolean);
        if (btn) {
          const bid = serialize(btn).match(/\d{3,}/)![0];
          $(a).after(clone(btn, { [bid]: id }));
          (sub.parent!.parent as Element).attribs['x-show'] = `menuOpen === ${id}`;
        }
      }
      $(sub).empty();
      for (const [text, link] of items) {
        const it = clone(itemProto!);
        setLink(it, link, text);
        $(sub).append(it);
      }
    }
    $(ul).append(li);
  });
}

export function buildUtilityNav(soup: Document): void {
  const ul = find(soup, 'ul.utility-navigation');
  if (!ul) return;
  const lis = children(ul, 'li');
  const links = lis.filter((li) => find(li, 'a'));
  const toggle = lis.filter((li) => !find(li, 'a'));
  const [visible, hidden] = links.length ? [links[0], links[links.length - 1]] : [null, null];
  for (const li of links) remove(li);
  UTILITY_NAV.forEach(([name, href], i) => {
    const li = clone((i < 3 ? visible : hidden)!);
    setLink(li, href, name);
    if (toggle.length) $(toggle[0]).before(li);
    else $(ul).append(li);
  });
}

export function buildBreadcrumb(soup: Document, path: string, section: SectionKey | null): void {
  for (const nav of findAll(soup, 'nav.breadcrumb')) {
    const ol = find(nav, 'ol')!;
    const items = children(ol, 'li');
    const [home, proto] = [items[0], items[1] ?? null];
    const span = find(home, 'span');
    if (span) {
      $(span).empty();
      $(span).append(newTag('a', { href: '/' }, 'Home'));
    }
    if (!proto) continue;
    for (const li of items.slice(1)) remove(li);
    const trail: [string, string][] = [];
    if (section) {
      const { label: sectionLabel, landing } = SECTIONS[section];
      if (landing !== path) trail.push([sectionLabel, landing]);
      const parent = path.replace(/\/+$/, '').replace(/\/[^/]*$/, '') + '/';
      if (parent in PAGES && parent !== landing && parent !== '/' && parent !== path) trail.push([label(parent), parent]);
    }
    trail.push([label(path), path]);
    for (const [text, href] of trail) {
      const li = clone(proto);
      setLink(li, href, text);
      $(ol).append(li);
    }
  }
}

export function buildSubnav(soup: Document, path: string, section: SectionKey | null): void {
  const nav = find(soup, 'nav.submenu');
  if (!nav) return;
  if (!section) {
    remove(nav);
    return;
  }
  const { label: sectionLabel, landing, children: pages } = SECTIONS[section];
  for (const hidden of findAll(nav, 'button > span.u-visually-hidden')) setString(hidden, `Show ${sectionLabel} menu`);
  const heading = find(nav, '[id="submenu-heading"]');
  if (heading) setString(heading, sectionLabel);
  const titleLink = find(nav, 'div.u-flex.u-items-center > a');
  if (titleLink) {
    titleLink.attribs.href = landing;
    setString(titleLink, sectionLabel);
  }
  const items = find(nav, 'div.submenu__items > ul');
  if (items) {
    // script-built variant (subNavigationT4): plain nested list
    $(items).empty();
    for (const child of pages) {
      const a = newTag('a', { href: child }, label(child));
      if (child === path) a.attribs['aria-current'] = 'page';
      const li = newTag('li', { class: 'item' });
      $(li).append(a);
      $(items).append(li);
    }
  }
  const mobile = find(nav, 'div.mobile-menu') ?? nav;
  for (const ul of [find(nav, 'ul[x-data="subNavigation()"]'), find(mobile, 'ul[x-data="{ menuOpen: false }"]')]) {
    if (!ul) continue;
    const proto = children(ul, 'li')[0];
    $(ul).empty();
    for (const child of pages) {
      const li = clone(proto);
      for (const extra of children(li, 'button, div')) remove(extra);
      delete li.attribs['@mouseenter'];
      delete li.attribs['@mouseleave'];
      const a = find(li, 'a')!;
      for (const attr of Object.keys(a.attribs)) {
        if (attr.startsWith(':') || attr.startsWith('@')) delete a.attribs[attr];
      }
      a.attribs.href = child;
      setString(a, label(child));
      if (child === path) {
        a.attribs.class = [a.attribs.class, 'u-font-bold u-underline'].filter(Boolean).join(' ');
        a.attribs['aria-current'] = 'page';
      }
      $(ul).append(li);
    }
  }
}

export function buildFooter(soup: Document): void {
  const footer = find(soup, 'footer');
  if (!footer) return;
  const cols = findAll(footer, 'div.col-6.col-md');
  if (cols.length) {
    const [proto] = cols;
    const parent = proto.parent!;
    const itemProto = find(proto, 'li')!;
    for (const c of cols) remove(c);
    for (const [heading, links] of FOOTER_COLS) {
      const col = clone(proto);
      setString(find(col, 'span')!, heading);
      const ul = find(col, 'ul')!;
      $(ul).empty();
      for (const href of links) {
        const it = clone(itemProto);
        const a = find(it, 'a')!;
        a.attribs.href = href;
        setText(a, label(href));
        $(ul).append(it);
      }
      $(parent).append(col);
    }
  }
  const btn = find(footer, 'a.btn-primary');
  if (btn) {
    btn.attribs.href = '/apply-form/';
    setText(btn, 'Apply Now ');
  }
  const cta = find(footer, 'a.cta-link');
  if (cta) {
    cta.attribs.href = '/contact/';
    setText(cta, 'Contact Us ');
  }
}

/** Header/footer copy that is not navigation: tagline, contact, legal line, hidden labels. */
export function fillChromeText(soup: Document): void {
  const footers = findAll(soup, 'footer').filter((f) => !findParent(f, 'main'));
  const footer = footers[footers.length - 1];
  if (footer) {
    for (const s of loremStrings(footer)) {
      if (!isAttached(s)) continue;
      const el = s.parent as Element;
      if (el.name === 'a') {
        if (findParent(el, 'ul') && find(el, 'svg')) setText(el, '');
        else remove(findParent(el, 'li') ?? el);
      } else if (hasClass(el, 'u-visually-hidden')) {
        setString(el, 'WhiteHouse College on social media');
      } else {
        remove(el);
      }
    }
    const logo = find(footer, 'img.site-logo') ?? find(footer, 'img[alt="Logo"]');
    const info = newTag('div', { class: 'u-text-small u-leading-normal u-mt-2 u-text-grey-300' });
    $(info).append(
      fragment(
        `<p class="u-mb-1">${FOOTER_TAGLINE}</p><p class="u-mb-1">${CONTACT.address} · ${CONTACT.phones.join(', ')}</p>` +
          `<p class="u-mb-1"><a class="u-text-inherit" href="mailto:${CONTACT.email}">${CONTACT.email}</a></p>` +
          `<p class="u-mb-0">${COPYRIGHT}</p>`,
      ),
    );
    const anchor = logo ? (findParent(logo, 'a') ?? logo) : null;
    if (anchor) $(anchor).after(info);
    else $(footer).append(info);
  }

  const header = find(soup, 'header');
  if (header) {
    for (const s of loremStrings(header)) {
      if (!isAttached(s)) continue;
      const el = s.parent as Element;
      if (hasClass(el, 'u-visually-hidden') || ['label', 'button', 'span'].includes(el.name)) {
        const isSearch = findParent(el, 'form') || serialize(el.parent!).toLowerCase().includes('search');
        setString(el, isSearch ? 'Search' : 'Menu');
      } else if (el.name === 'h2') {
        setString(el, 'Menu');
      } else {
        remove(el);
      }
    }
  }

  for (const s of loremStrings(soup, true)) {
    if (!isAttached(s) || findParent(s, 'main')) continue;
    const el = s.parent as Element;
    setString(el, el.name === 'a' ? 'Skip to main content' : '');
  }
}

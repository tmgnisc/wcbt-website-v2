/**
 * Builds one page: template chrome (header, hero, section menu, footer) + body rendered from content JSON.
 * `renderPageHtml` returns the full HTML document; `renderPage` splits it into the pieces the Next.js route renders.
 */
import type { AnyNode, Document, Element } from 'domhandler';

import { PAGES, TEMPLATE_LINKS, type SectionKey } from '@/config/navigation';
import { SITE_NAME } from '@/config/site';
import { loadContent, loadTemplate } from '@/lib/content';

import { renderBody } from './blocks';
import { buildBreadcrumb, buildFooter, buildMobileNav, buildPrimaryNav, buildSubnav, buildUtilityNav, fillChromeText } from './chrome';
import { $, ancestors, children, find, findAll, findParent, fragment, isAttached, parse, remove, serialize } from './dom';
import { fillHero } from './hero';
import { renderHomeBody } from './home';
import { fillTemplateImages } from './images';
import { isLorem, sweep } from './lorem';

export interface ScriptTag {
  src?: string;
  type?: string;
  code?: string;
}

export interface LinkTag {
  rel: string;
  href: string;
  media?: string;
  type?: string;
}

export interface RenderedPage {
  title: string;
  description: string;
  /** name -> content for extra <meta> tags from the template head. */
  meta: Record<string, string>;
  links: LinkTag[];
  /** Inline CSS from the template head. */
  styles: string[];
  /** <body> inner HTML with all scripts removed. */
  body: string;
  /** Head + body scripts in original order; rendered after the body so they run against the full DOM. */
  scripts: ScriptTag[];
  /** Template lorem still present in the output (should be empty). */
  leftovers: string[];
}

/** Drop everything in <main> except the hero and section menu, then append the rendered body. */
function replaceBody(content: Element, hero: Element, bodyHtml: string): void {
  const main = findParent(content, 'main') ?? content;
  const keep: AnyNode[] = [hero, ...findAll(main, 'nav.submenu, div.submenu-branding')];
  const keepAncestors = new Set(keep.flatMap(ancestors));
  const prune = (node: Element) => {
    for (const child of children(node)) {
      if (keep.includes(child)) continue;
      if (keepAncestors.has(child)) prune(child);
      else remove(child);
    }
  };
  prune(main);
  $(isAttached(content) ? content : main).append(fragment(bodyHtml));
}

/** Template-relative asset paths -> site-absolute; template cross-links -> real pages. */
function absolutize(html: string): string {
  html = html.replace(/(["'(])(?:\.\/)?(media|vendor|json)\//g, '$1/$2/');
  for (const [from, to] of Object.entries(TEMPLATE_LINKS)) html = html.split(`href="${from}"`).join(`href="${to}"`);
  return html.split('rel="home" href="#"').join('rel="home" href="/"').split('href="#" rel="home"').join('href="/" rel="home"');
}

export function renderPageHtml(path: string): string {
  const { title, template, section } = PAGES[path];
  const soup: Document = parse(loadTemplate(template), true);
  const data = loadContent(path);

  const titleEl = find(soup, 'title');
  if (titleEl) $(titleEl).text(data.title || `${title} | ${SITE_NAME}`);
  for (const meta of findAll(soup, 'meta')) {
    const { name, property, content } = meta.attribs;
    if (name === 'description' || name === 'Description' || property === 'og:description') meta.attribs.content = data.description;
    else if (content && isLorem(content)) remove(meta);
  }
  for (const a of findAll(soup, 'a[rel=home]')) a.attribs.href = '/';

  buildUtilityNav(soup);
  buildPrimaryNav(soup);
  buildMobileNav(soup);
  buildBreadcrumb(soup, path, section as SectionKey | null);
  buildSubnav(soup, path, section as SectionKey | null);
  buildFooter(soup);

  const heroBlock = data.blocks.find((b) => b.h1) ?? null;
  const bodyBlocks = data.blocks.filter((b) => b !== heroBlock);
  if (heroBlock && (heroBlock.groups.length || heroBlock.forms.length)) {
    // hero carried cards/forms: render them in the body
    bodyBlocks.unshift({ ...heroBlock, h1: '', eyebrow: '', heading: '', paras: [], links: [], images: [] });
  }
  const main = find(soup, 'div.main-content') ?? find(soup, 'main')!;
  const hero = find(main, '.page-header, .hero-header') ?? children(main)[0];
  fillHero(hero, heroBlock, title);
  const body = template === '01-homepage' ? renderHomeBody(main, bodyBlocks, PAGES) : renderBody(bodyBlocks, PAGES);
  replaceBody(main, hero, body);
  fillChromeText(soup);
  fillTemplateImages(soup, path);
  // adjusts template-only course sections that the content body replaces
  for (const script of findAll(soup, 'script[src*="course-overview-adjust"]')) remove(script);

  const html = absolutize(serialize(soup));
  return /^\s*<!doctype/i.test(html) ? html : `<!DOCTYPE html>\n${html}`;
}

export function renderPage(path: string): RenderedPage {
  const doc = parse(renderPageHtml(path), true);
  const head = find(doc, 'head');
  const body = find(doc, 'body')!;

  const meta: Record<string, string> = {};
  for (const m of head ? findAll(head, 'meta[name]') : []) {
    const name = m.attribs.name;
    if (!['viewport', 'description'].includes(name.toLowerCase())) meta[name] = m.attribs.content ?? '';
  }
  const links = (head ? findAll(head, 'link[href]') : []).map(({ attribs: { rel = '', href, media, type } }) => ({
    rel,
    href,
    ...(media ? { media } : {}),
    ...(type ? { type } : {}),
  }));
  const styles = (head ? findAll(head, 'style') : []).map((s) => s.children.map((k) => ('data' in k ? k.data : '')).join(''));
  const scripts = findAll(doc, 'script').map(({ attribs: { src, type }, children: kids }) => ({
    ...(src ? { src } : { code: kids.map((k) => ('data' in k ? k.data : '')).join('') }),
    ...(type ? { type } : {}),
  }));
  for (const s of findAll(body, 'script')) remove(s);
  const titleEl = find(doc, 'title');
  const bodyHtml = $(body).html() ?? '';

  return {
    title: titleEl ? $(titleEl).text() : '',
    description: find(doc, 'meta[name="description"]')?.attribs.content ?? '',
    meta,
    links,
    styles,
    body: bodyHtml,
    scripts,
    leftovers: sweep(doc, false),
  };
}

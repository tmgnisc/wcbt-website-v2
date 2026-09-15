/**
 * Small DOM toolkit over cheerio/htmlparser2. htmlparser2 (not parse5) is used on purpose: it keeps the template
 * markup as written, including Alpine.js attributes such as `@click` and `:class`.
 */
import * as cheerio from 'cheerio';
import { Element, Text, type AnyNode, type Document } from 'domhandler';

const OPTIONS = {
  xml: { xmlMode: false, decodeEntities: true, withStartIndices: true, encodeEntities: 'utf8' as const },
};

/** Wraps any node (from any parsed tree) for selector queries and manipulation. */
export const $ = cheerio.load('', OPTIONS, false);

const sourceLines = new WeakMap<Element, number>();

/** Parse HTML; every element remembers the 1-based source line of its start tag (see `sourceLine`). */
export function parse(html: string, isDocument = false): Document {
  const root = cheerio.load(html, OPTIONS, isDocument).root()[0] as Document;
  const lineStarts = [0];
  for (let i = html.indexOf('\n'); i !== -1; i = html.indexOf('\n', i + 1)) lineStarts.push(i + 1);
  const lineOf = (index: number) => {
    let lo = 0;
    let hi = lineStarts.length - 1;
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1;
      if (lineStarts[mid] <= index) lo = mid;
      else hi = mid - 1;
    }
    return lo + 1;
  };
  for (const el of descendants(root)) {
    if (el.startIndex != null) sourceLines.set(el, lineOf(el.startIndex));
  }
  return root;
}

export function sourceLine(el: Element): number | undefined {
  return sourceLines.get(el);
}

export function serialize(node: AnyNode): string {
  return $.html(node);
}

export function isTag(node: AnyNode | null | undefined): node is Element {
  return !!node && (node.type === 'tag' || node.type === 'script' || node.type === 'style');
}

/** All descendant elements in document order. */
export function descendants(node: AnyNode): Element[] {
  const out: Element[] = [];
  const walk = (n: AnyNode) => {
    for (const child of 'children' in n ? n.children : []) {
      if (isTag(child)) {
        out.push(child);
        walk(child);
      }
    }
  };
  walk(node);
  return out;
}

/** All descendant text nodes in document order (comments excluded). */
export function textNodes(node: AnyNode): Text[] {
  const out: Text[] = [];
  const walk = (n: AnyNode) => {
    for (const child of 'children' in n ? n.children : []) {
      if (child.type === 'text') out.push(child as Text);
      else walk(child);
    }
  };
  walk(node);
  return out;
}

export function children(el: AnyNode, selector?: string): Element[] {
  const kids = ('children' in el ? el.children : []).filter(isTag);
  return selector ? kids.filter((k) => $(k).is(selector)) : kids;
}

/** First descendant matching a CSS selector. */
export function find(el: AnyNode, selector: string): Element | null {
  return ($(el).find(selector)[0] as Element | undefined) ?? null;
}

export function findAll(el: AnyNode, selector: string): Element[] {
  return $(el).find(selector).toArray() as Element[];
}

/** Closest ancestor (excluding the node itself) matching a selector. */
export function findParent(node: AnyNode, selector: string): Element | null {
  for (let p = node.parent; p && isTag(p); p = p.parent) {
    if ($(p).is(selector)) return p;
  }
  return null;
}

export function ancestors(node: AnyNode): AnyNode[] {
  const out: AnyNode[] = [];
  for (let p = node.parent; p; p = p.parent) out.push(p);
  return out;
}

/** True while the node is still part of a parsed document/fragment (i.e. not removed with an ancestor). */
export function isAttached(node: AnyNode): boolean {
  let top: AnyNode = node;
  while (top.parent) top = top.parent;
  return top.type === 'root';
}

export function hasClass(el: Element, cls: string): boolean {
  return (el.attribs.class ?? '').split(/\s+/).includes(cls);
}

/** Replace all children with a single text node. */
export function setString(el: Element, text: string): void {
  $(el).empty();
  $(el).append(new Text(text));
}

/** Replace the element's own text while keeping child elements such as icons. */
export function setText(el: Element, text: string): void {
  for (const child of [...el.children]) {
    if (child.type === 'text' || child.type === 'comment') $(child).remove();
  }
  $(el).prepend(new Text(text));
}

/** The element's direct text, stripped and space-joined. */
export function ownText(el: Element): string {
  return el.children
    .filter((c): c is Text => c.type === 'text')
    .map((t) => t.data.trim())
    .filter(Boolean)
    .join(' ');
}

export function newTag(name: string, attribs: Record<string, string> = {}, text?: string): Element {
  const el = new Element(name, { ...attribs });
  if (text !== undefined) $(el).append(new Text(text));
  return el;
}

/** Deep copy via re-parsing, optionally with raw string replacements (used to renumber Alpine menu ids). */
export function clone(el: Element, replace: Record<string, string> = {}): Element {
  let html = serialize(el);
  for (const [from, to] of Object.entries(replace)) html = html.split(from).join(to);
  return find(parse(html), el.name)!;
}

/** Parsed fragment children, ready to append. */
export function fragment(html: string): AnyNode[] {
  return [...parse(html).children];
}

export function remove(node: AnyNode | null | undefined): void {
  if (node) $(node).remove();
}

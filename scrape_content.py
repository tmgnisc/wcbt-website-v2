#!/usr/bin/env python3
"""Scrape page content from https://www.whitehouseeducation.edu.np/ into structured JSON.

The site is a client-rendered app, so pages are rendered with headless Chrome first.

Usage:
  python3 scrape_content.py            # render every route, then extract
  python3 scrape_content.py --offline  # re-extract from content/raw/*.html only
Output: content/raw/<slug>.html and content/<slug>.json
"""
import json
import re
import subprocess
import sys
import tempfile
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

from bs4 import BeautifulSoup, NavigableString, Tag

BASE = 'https://www.whitehouseeducation.edu.np'
ROOT = Path(__file__).resolve().parent
OUT = ROOT / 'content'
RAW = OUT / 'raw'
CHROME = '/opt/google/chrome/chrome'

ROUTES = [
    '/', '/about', '/about/ku-affiliation', '/about/industry-exposure', '/about/publications', '/about/legacy',
    '/about/governance', '/vision', '/vision/mission', '/vision/values', '/vision/strategy', '/vision/reports',
    '/programs', '/programs/bit', '/programs/btech-ed-it', '/academics/research', '/academics/admissions',
    '/academics/scholarships', '/apply-form', '/research/ai-labs', '/research/iot-labs', '/research/innovation-centers',
    '/student-life/student-experience', '/student-life/student-support', '/student-life/campus-life', '/community',
    '/community/board-members', '/community/advisors', '/community/faculty', '/community/administration',
    '/community/international', '/careers', '/careers/career-paths', '/careers/graduate-success', '/careers/placements',
    '/visit', '/visit/virtual-tour', '/contact', '/updates/news', '/updates/events',
]

NUMERIC = re.compile(r'^(?:[<>~]?\s?(?:NPR|Rs\.?|\$)?\s?\d[\d,.]*\s?(?:\+|%|k|K|x|hrs?|years?|yrs|months?|weeks?|days?|/\d+)?\+?)$')
HEADINGS = ('h3', 'h4', 'h5', 'h6')


def slug(route):
    return route.strip('/').replace('/', '_') or 'home'


def render(route):
    target = RAW / f'{slug(route)}.html'
    for attempt in range(3):
        with tempfile.TemporaryDirectory() as profile:
            html = subprocess.run(
                [CHROME, '--headless=new', '--no-sandbox', '--disable-gpu', f'--user-data-dir={profile}',
                 '--window-size=1440,3000', f'--virtual-time-budget={15000 + attempt * 10000}',
                 '--dump-dom', BASE + route],
                capture_output=True, text=True, timeout=120).stdout
        if '<main' in html:
            target.write_text(html, encoding='utf-8')
            return route, True
    return route, False


# ---------------------------------------------------------------- extraction helpers
def clean(text):
    return re.sub(r'\s+', ' ', text or '').strip()


def own_text(el):
    return clean(' '.join(s for s in el.find_all(string=True, recursive=False)))


def link_of(el):
    a = el if el.name == 'a' else el.find_parent('a')
    return a.get('href') if a is not None and a.get('href') else None


def leaves(el, skip=()):
    """Ordered text units inside el as (kind, text, extra); headings, paragraphs, list items and plain links are atomic."""
    out = []
    block_tags = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'li', 'img', 'div', 'ul', 'section', 'article']

    def visit(node):
        if any(node is s for s in skip):
            return
        name = node.name
        if name in ('script', 'style', 'svg', 'option', 'noscript'):
            return
        if name == 'img':
            out.append(('img', clean(node.get('alt')), None))
            return
        if name in ('table', 'form', 'iframe'):
            out.append((name, '', node))
            return
        if name == 'details':
            summary = node.find('summary')
            question = clean(summary.get_text(' ')).rstrip('+').strip() if summary else ''
            if summary:
                summary.extract()
            out.append(('faq', question, clean(node.get_text(' '))))
            return
        atomic = name in ('h1', 'h2', 'p', 'li') + HEADINGS and not node.find(['p', 'li', 'h3', 'h4', 'ul']) \
            or name in ('a', 'button', 'label') and not node.find(block_tags)
        if atomic:
            text = clean(node.get_text(' '))
            if text:
                if name in ('h1', 'h2'):
                    kind = name
                elif name in HEADINGS:
                    kind = 'h'
                elif name == 'li':
                    kind = 'li'
                elif name in ('a', 'button'):
                    kind = 'link'
                elif NUMERIC.match(text):
                    kind = 'num'
                else:
                    kind = 'p' if name == 'p' or len(text) > 60 else 'label'
                out.append((kind, text, link_of(node) if kind == 'link' else None))
            return
        text = own_text(node)
        if text:
            out.append(('num' if NUMERIC.match(text) else ('p' if len(text) > 60 else 'label'), text, None))
        for child in node.find_all(recursive=False):
            visit(child)

    visit(el)
    return out


def is_item_group(children, node=None):
    if len(children) < 2:
        return False
    if any(c.name in ('h1', 'h2', 'details') or c.find(['h1', 'h2', 'details']) for c in children):
        return False
    if all((c.name in ('a', 'button') or len(c.find_all(True)) <= 2 and c.find(['a', 'button']))
           and not c.find(['p', 'h3', 'h4', 'img']) and len(clean(c.get_text(' '))) <= 40 for c in children):
        return False  # a row of call-to-action buttons
    if node is not None and 'grid' in node.get('class', []):
        return True
    with_heading = sum(1 for c in children if c.find(HEADINGS))
    with_num = sum(1 for c in children if any(NUMERIC.match(own_text(x)) for x in c.find_all(True) if own_text(x)))
    same = len({(c.name, ' '.join(c.get('class', [])[:2])) for c in children}) == 1
    short = same and all(len(clean(c.get_text(' '))) <= 90 for c in children)
    return with_heading >= 2 or with_num >= 2 or (short and len(children) >= 3)


def find_groups(el):
    groups = []

    def visit(node):
        kids = [c for c in node.find_all(recursive=False)
                if isinstance(c, Tag) and (clean(c.get_text(' ')) or c.find('img')) and c.name not in ('script', 'style')]
        if node.name not in ('ul', 'ol', 'form', 'table') and is_item_group(kids, node):
            groups.append((node, kids))
            return
        if node.name in ('form', 'table'):
            return
        for c in kids:
            visit(c)
    visit(el)
    return groups


def parse_item(el):
    units = leaves(el)
    item = {'eyebrow': '', 'title': '', 'stat': '', 'text': [], 'bullets': [], 'links': [], 'image': None, 'href': link_of(el) or (el.find('a').get('href') if el.find('a') else None)}
    for kind, text, extra in units:
        if kind == 'img':
            item['image'] = text or 'image'
        elif kind == 'h' and not item['title']:
            item['title'] = text
        elif kind == 'num' and not item['stat']:
            item['stat'] = text
        elif kind == 'li':
            item['bullets'].append(text)
        elif kind == 'link':
            item['links'].append({'text': text, 'href': extra})
        elif kind in ('label',) and not item['title'] and not item['eyebrow'] and not item['text']:
            item['eyebrow'] = text
        elif kind in ('p', 'label', 'h', 'num'):
            item['text'].append(text)
    if not item['title'] and item['eyebrow'] and not item['stat']:
        item['title'], item['eyebrow'] = item['eyebrow'], ''
    if not item['title'] and item['text'] and item['stat']:
        item['title'] = item['text'].pop(0)
    if not item['title'] and item['text'] and len(item['text'][0]) <= 60:
        item['title'] = item['text'].pop(0)
    return item


def parse_form(form):
    fields = []
    for f in form.find_all(['input', 'select', 'textarea']):
        if f.get('type') in ('hidden', 'submit', 'button'):
            continue
        label = ''
        if f.get('id') and form.find('label', attrs={'for': f['id']}):
            label = clean(form.find('label', attrs={'for': f['id']}).get_text(' '))
        wrap = f.find_parent('label')
        if not label and wrap is not None:
            label = clean(wrap.get_text(' '))
        if not label:
            prev = f.find_previous(['label'])
            if prev is not None and form in prev.parents and prev.find_next(['input', 'select', 'textarea']) is f:
                label = clean(prev.get_text(' '))
        fields.append({
            'tag': f.name, 'type': f.get('type', 'text'), 'name': f.get('name') or f.get('id') or '',
            'label': label, 'placeholder': f.get('placeholder', ''), 'required': f.has_attr('required'),
            'options': [clean(o.get_text()) for o in f.find_all('option')] if f.name == 'select' else [],
        })
    submit = form.find(['button']) or form.find('input', attrs={'type': 'submit'})
    notes = [clean(p.get_text(' ')) for p in form.find_all('p') if clean(p.get_text(' '))]
    return {'fields': fields, 'submit': clean(submit.get_text(' ')) if submit else 'Submit', 'notes': notes}


def parse_table(table):
    return [[clean(c.get_text(' ')) for c in tr.find_all(['th', 'td'])] for tr in table.find_all('tr')]


def parse_block(el):
    classes = ' '.join(el.get('class', []))
    block = {
        'tone': 'dark' if re.search(r'\bbg-(primary|navy)', classes) else ('muted' if re.search(r'\bbg-(secondary|muted)', classes) else 'plain'),
        'eyebrow': '', 'h1': '', 'heading': '', 'paras': [], 'bullets': [], 'links': [], 'images': [],
        'quote': None, 'groups': [], 'tables': [], 'forms': [], 'faqs': [],
    }
    groups = find_groups(el)
    for node, kids in groups:
        items = [parse_item(k) for k in kids]
        seen, uniq = set(), []
        for it in items:  # marquee style lists repeat their items
            key = json.dumps(it, sort_keys=True)
            if key not in seen:
                seen.add(key)
                uniq.append(it)
        for it in [it for it in uniq if not (it['title'] or it['stat'] or it['text'] or it['links'] or it['bullets'])]:
            uniq.remove(it)
            if it['image']:
                block['images'].append(it['image'])
        if uniq:
            block['groups'].append(uniq)
    skip = [n for n, _ in groups]
    for kind, text, extra in leaves(el, skip=skip):
        target = block
        if kind == 'h1':
            block['h1'] = text
        elif kind == 'h2' and not block['heading']:
            block['heading'] = text
        elif kind in ('h2', 'h'):
            block['paras'].append(text)
        elif kind == 'label' and not block['heading'] and not block['h1'] and not block['eyebrow'] and len(text) < 70:
            block['eyebrow'] = text
        elif kind == 'li':
            block['bullets'].append(text)
        elif kind == 'link':
            if text not in [l['text'] for l in block['links']]:
                block['links'].append({'text': text, 'href': extra})
        elif kind == 'img':
            block['images'].append(text or 'image')
        elif kind == 'faq':
            block['faqs'].append({'q': text, 'a': extra})
        elif kind == 'table':
            block['tables'].append(parse_table(extra))
        elif kind == 'form':
            block['forms'].append(parse_form(extra))
        elif kind in ('p', 'label', 'num'):
            if re.match(r'^["“]', text) and block['quote'] is None:
                block['quote'] = {'text': text.strip('"“”'), 'cite': []}
            elif block['quote'] is not None and not block['quote']['cite'] and len(text) < 60 or \
                    block['quote'] is not None and len(block['quote']['cite']) == 1 and len(text) < 40:
                block['quote']['cite'].append(text)
            else:
                target['paras'].append(text)
    return block


def extract(route):
    soup = BeautifulSoup((RAW / f'{slug(route)}.html').read_text(encoding='utf-8'), 'html.parser')
    for x in soup(['script', 'style', 'noscript', 'svg']):
        x.decompose()
    main = soup.find('main')
    blocks = []
    for el in main.find_all(recursive=False):
        if not clean(el.get_text(' ')) and not el.find(['img', 'iframe']):
            continue
        # unwrap plain wrappers so each visual section becomes one block
        while len([c for c in el.find_all(recursive=False) if clean(c.get_text(' '))]) == 1 and el.name != 'section' \
                and el.find('section'):
            el = next(c for c in el.find_all(recursive=False) if clean(c.get_text(' ')))
        sections = el.find_all('section') if el.name != 'section' and el.find('section') else [el]
        blocks.extend(parse_block(s) for s in sections if clean(s.get_text(' ')))
    title = clean(soup.title.string if soup.title else '')
    desc = soup.find('meta', attrs={'name': 'description'})
    return {'route': route, 'title': title, 'description': desc.get('content', '') if desc else '', 'blocks': blocks}


def main():
    OUT.mkdir(exist_ok=True)
    RAW.mkdir(exist_ok=True)
    if '--offline' not in sys.argv:
        with ThreadPoolExecutor(max_workers=6) as pool:
            for route, ok in pool.map(render, ROUTES):
                print(f'{"rendered" if ok else "FAILED  "} {route}')
    for route in ROUTES:
        if not (RAW / f'{slug(route)}.html').exists():
            continue
        data = extract(route)
        (OUT / f'{slug(route)}.json').write_text(json.dumps(data, indent=1, ensure_ascii=False), encoding='utf-8')
        print(f'{route:36} blocks={len(data["blocks"]):2}  {data["title"][:50]}')


if __name__ == '__main__':
    main()

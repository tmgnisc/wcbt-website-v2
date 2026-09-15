#!/usr/bin/env python3
"""Build the WhiteHouse College site on the cleaned templates.

Usage:  python3 scrape_content.py   (once, or --offline to re-extract)   then   python3 build_site.py
Output: ./site/  -> serve with:  cd site && python3 -m http.server 8080
Header, hero, section menu and footer come from each page's template; the page body is rendered from
content/<page>.json with the template's components (render_content.py). Images stay placehold.co placeholders.
"""
import json
import re
import shutil
from pathlib import Path

from bs4 import BeautifulSoup, Comment, NavigableString

from render_content import CONTACT, render_body, resolve_href

ROOT = Path(__file__).resolve().parent
OUT = ROOT / 'site'
SITE_NAME = 'WhiteHouse College of Business & Technology'
CONTENT = ROOT / 'content'

# ---------------------------------------------------------------- information architecture
# section key -> (label, landing path, [child paths])
SECTIONS = {
    'about':      ('About Us', '/about/', ['/about/ku-affiliation/', '/about/industry-exposure/', '/about/publications/', '/about/legacy/', '/about/governance/']),
    'vision':     ('Vision', '/vision/', ['/vision/mission/', '/vision/values/', '/vision/strategy/', '/vision/reports/']),
    'programs':   ('Programs', '/programs/', ['/programs/bit/', '/programs/btech-ed-it/']),
    'academics':  ('Academics', '/academics/admissions/', ['/academics/research/', '/academics/admissions/', '/academics/scholarships/', '/apply-form/']),
    'research':   ('Research & Innovation', '/academics/research/', ['/research/ai-labs/', '/research/iot-labs/', '/research/innovation-centers/']),
    'studentlife': ('Student Life', '/student-life/student-experience/', ['/student-life/student-experience/', '/student-life/student-support/', '/student-life/campus-life/']),
    'community':  ('Community', '/community/', ['/community/board-members/', '/community/advisors/', '/community/faculty/', '/community/administration/', '/community/international/']),
    'careers':    ('Careers', '/careers/', ['/careers/career-paths/', '/careers/graduate-success/', '/careers/placements/']),
    'visit':      ('Visit Us', '/visit/', ['/visit/virtual-tour/', '/contact/']),
    'updates':    ('News & Events', '/updates/news/', ['/updates/news/', '/updates/events/']),
}

# path -> (title, template, section)
PAGES = {
    '/':                               ('Home', '01-homepage', None),
    '/about/':                         ('About Us', '10-landing-about', 'about'),
    '/about/ku-affiliation/':          ('KU Affiliation', '08-business-programme', 'about'),
    '/about/industry-exposure/':       ('Industry Exposure', '08-business-programme', 'about'),
    '/about/publications/':            ('Publications', '02-news-listing', 'about'),
    '/about/legacy/':                  ('Legacy', '08-business-programme', 'about'),
    '/about/governance/':              ('Governance', '08-business-programme', 'about'),
    '/vision/':                        ('Vision', '10-landing-about', 'vision'),
    '/vision/mission/':                ('Mission', '08-business-programme', 'vision'),
    '/vision/values/':                 ('Values', '08-business-programme', 'vision'),
    '/vision/strategy/':               ('Strategy', '08-business-programme', 'vision'),
    '/vision/reports/':                ('Reports', '02-news-listing', 'vision'),
    '/programs/':                      ('Programs', '12-landing-study', 'programs'),
    '/programs/bit/':                  ('BIT — Bachelor in Information Technology', '05-course-detail', 'programs'),
    '/programs/btech-ed-it/':          ('B.Tech Ed IT — Technology in Education', '05-course-detail', 'programs'),
    '/academics/research/':            ('Research & Innovation', '11-landing-research', 'research'),
    '/academics/admissions/':          ('Admissions', '08-business-programme', 'academics'),
    '/academics/scholarships/':        ('Scholarships', '08-business-programme', 'academics'),
    '/apply-form/':                    ('Apply Now', '08-business-programme', 'academics'),
    '/research/ai-labs/':              ('AI Labs', '07-college', 'research'),
    '/research/iot-labs/':             ('IoT Labs', '07-college', 'research'),
    '/research/innovation-centers/':   ('Innovation Centers', '07-college', 'research'),
    '/student-life/student-experience/': ('Student Experience', '07-college', 'studentlife'),
    '/student-life/student-support/':  ('Student Support', '08-business-programme', 'studentlife'),
    '/student-life/campus-life/':      ('Campus Life', '07-college', 'studentlife'),
    '/community/':                     ('Community', '10-landing-about', 'community'),
    '/community/board-members/':       ('Board Members', '02-news-listing', 'community'),
    '/community/advisors/':            ('Advisors', '02-news-listing', 'community'),
    '/community/faculty/':             ('Faculty', '02-news-listing', 'community'),
    '/community/administration/':      ('Administration', '02-news-listing', 'community'),
    '/community/international/':       ('International', '08-business-programme', 'community'),
    '/careers/':                       ('Careers', '10-landing-about', 'careers'),
    '/careers/career-paths/':          ('Career Paths', '08-business-programme', 'careers'),
    '/careers/graduate-success/':      ('Graduate Success', '08-business-programme', 'careers'),
    '/careers/placements/':            ('Placements', '08-business-programme', 'careers'),
    '/visit/':                         ('Visit Us', '06-contact-map', 'visit'),
    '/visit/virtual-tour/':            ('Virtual Campus Tour', '07-college', 'visit'),
    '/contact/':                       ('Contact Us', '06-contact-map', 'visit'),
    '/updates/news/':                  ('News', '02-news-listing', 'updates'),
    '/updates/events/':                ('Events', '03-article', 'updates'),
}

PRIMARY_NAV = [  # mirrors the live site's header; (label, href, [(label, href)])
    ('About Us', '/about/', [(PAGES[p][0], p) for p in ['/about/'] + SECTIONS['about'][2] + ['/vision/'] + SECTIONS['vision'][2]]),
    ('Programs', '/programs/', [(PAGES[p][0], p) for p in ['/programs/'] + SECTIONS['programs'][2]]),
    ('Academics', '/academics/admissions/', [(PAGES[p][0], p) for p in SECTIONS['academics'][2] + SECTIONS['research'][2]]),
    ('Student Life', '/student-life/student-experience/', [(PAGES[p][0], p) for p in SECTIONS['studentlife'][2] + ['/community/'] + SECTIONS['community'][2]]),
    ('Visit Us', '/visit/', [(PAGES[p][0], p) for p in ['/visit/'] + SECTIONS['visit'][2]]),
    ('Careers', '/careers/', [(PAGES[p][0], p) for p in ['/careers/'] + SECTIONS['careers'][2]]),
]
UTILITY_NAV = [('Community', '/community/'), ('News', '/updates/news/'), ('Events', '/updates/events/'),
               ('Virtual Tour', '/visit/virtual-tour/'), ('Contact', '/contact/'), ('Apply Now', '/apply-form/')]
FOOTER_COLS = [  # mirrors the live site's footer columns
    ('Community', ['/community/board-members/', '/community/advisors/', '/community/faculty/', '/community/administration/', '/community/international/']),
    ('About', ['/about/ku-affiliation/', '/about/industry-exposure/', '/about/publications/', '/about/legacy/', '/about/governance/']),
    ('Vision', ['/vision/mission/', '/vision/values/', '/vision/strategy/', '/vision/reports/']),
    ('Research', ['/research/ai-labs/', '/research/iot-labs/', '/research/innovation-centers/']),
    ('Careers', ['/careers/career-paths/', '/careers/graduate-success/', '/careers/placements/']),
]
FOOTER_TAGLINE = "Building Eastern Nepal's future-focused academic ecosystem."
COPYRIGHT = '© 2026 WhiteHouse Education Foundation. All rights reserved.'
# old template cross-links -> representative new pages
TEMPLATE_LINKS = {
    '01-homepage.html': '/', '02-news-listing.html': '/updates/news/', '03-article.html': '/updates/events/',
    '04-staff-profile.html': '/community/faculty/', '05-course-detail.html': '/programs/bit/',
    '06-contact-map.html': '/contact/', '07-college.html': '/student-life/campus-life/',
    '08-business-programme.html': '/academics/admissions/', '09-event-detail.html': '/updates/events/',
    '10-landing-about.html': '/about/', '11-landing-research.html': '/academics/research/', '12-landing-study.html': '/programs/',
}


# ---------------------------------------------------------------- helpers
def label(path):
    return PAGES[path][0].split(' — ')[0]


def set_text(tag, text):
    """Replace a tag's own text while keeping child elements such as icons."""
    for child in list(tag.children):
        if isinstance(child, NavigableString):
            child.extract()
    tag.insert(0, NavigableString(text))


def clone(tag, replace=None):
    html = str(tag)
    for old, new in (replace or {}).items():
        html = html.replace(old, new)
    return BeautifulSoup(html, 'html.parser').find(tag.name)


def menu_id(li):
    m = re.search(r'\b(\d{3,})\b', ' '.join(str(v) for v in li.attrs.values()) + str(li.find('button') or ''))
    return m.group(1) if m else None


def build_primary_nav(soup):
    ul = soup.find('ul', attrs={'x-data': 'primaryNavigation()'})
    if not ul:
        return
    proto = ul.find('li', recursive=False)
    old = menu_id(proto)
    ul.clear()
    for i, (name, href, items) in enumerate(PRIMARY_NAV):
        li = clone(proto, {old: str(910001 + i)} if old else None)
        a = li.find('a')
        a['href'] = href
        set_text(a, name)
        hidden = li.find('button').find('span', class_='u-visually-hidden') if li.find('button') else None
        if hidden:
            hidden.string = f'Show submenu for {name}'
        if li.find('h2'):
            li.find('h2').string = name
        sub = li.find('ul', class_='row')
        if sub:
            item_proto = sub.find('li')
            sub.clear()
            for text, link in items:
                it = clone(item_proto)
                it.find('a')['href'] = link
                it.find('a').string = text
                sub.append(it)
        ul.append(li)


def build_mobile_nav(soup):
    header = soup.find('header')
    box = header.find('div', class_='mobile-menu') if header else None
    ul = box.find('ul', recursive=False) if box else None
    if not ul:
        return
    lis = ul.find_all('li', recursive=False)
    proto = next((li for li in lis if li.select_one('div ul li a')), None)
    if proto is None:  # template has no nested mobile items: flatten sections into plain links
        proto = lis[0]
        entries = [('Home', '/', [])] + [(t, h, []) for _, _, items in PRIMARY_NAV for t, h in items]
    else:
        entries = [('Home', '/', [])] + PRIMARY_NAV
    entries += [(n, h, []) for n, h in UTILITY_NAV]
    old = menu_id(proto)
    item_proto = next((clone(it) for li in lis for it in li.select('div ul li') if it.find('a')), None)
    ul.clear()
    for i, (name, href, items) in enumerate(entries):
        li = clone(proto, {old: str(920001 + i)} if old else None)
        a = li.find('a')
        a['href'] = href
        a.string = name
        sub = li.select_one('div ul')
        if not items or sub is None:
            for extra in li.find_all(['button', 'div'], recursive=False):
                extra.decompose()
        else:
            if not li.find('button', recursive=False):  # proto without toggle: borrow one from a sibling
                btn = next((b for b in (x.find('button', recursive=False) for x in lis) if b), None)
                if btn is not None:
                    bid = re.search(r'\d{3,}', str(btn)).group(0)
                    a.insert_after(clone(btn, {bid: str(920001 + i)}))
                    sub.parent.parent['x-show'] = f'menuOpen === {920001 + i}'
            sub.clear()
            for text, link in items:
                it = clone(item_proto)
                it.find('a')['href'] = link
                it.find('a').string = text
                sub.append(it)
        ul.append(li)


def build_utility_nav(soup):
    ul = soup.find('ul', class_='utility-navigation')
    if not ul:
        return
    links = [li for li in ul.find_all('li', recursive=False) if li.find('a')]
    toggle = [li for li in ul.find_all('li', recursive=False) if not li.find('a')]
    visible, hidden = (links[0], links[-1]) if links else (None, None)
    for li in links:
        li.extract()
    for i, (name, href) in enumerate(UTILITY_NAV):
        li = clone(visible if i < 3 else hidden)
        li.find('a')['href'] = href
        li.find('a').string = name
        if toggle:
            toggle[0].insert_before(li)
        else:
            ul.append(li)


def build_breadcrumb(soup, path, section):
    for nav in soup.find_all('nav', class_='breadcrumb'):
        fill_breadcrumb(soup, nav, path, section)


def fill_breadcrumb(soup, nav, path, section):
    ol = nav.find('ol')
    items = ol.find_all('li', recursive=False)
    home, proto = items[0], (items[1] if len(items) > 1 else None)
    span = home.find('span')
    if span:
        span.clear()
        link = soup.new_tag('a', href='/')
        link.string = 'Home'
        span.append(link)
    if proto is None:
        return
    for li in items[1:]:
        li.extract()
    trail = []
    if section:
        s_label, s_href, _ = SECTIONS[section]
        if s_href != path:
            trail.append((s_label, s_href))
        parent = path.rstrip('/').rsplit('/', 1)[0] + '/'
        if parent in PAGES and parent not in (s_href, '/') and parent != path:
            trail.append((label(parent), parent))
    trail.append((label(path), path))
    for text, href in trail:
        li = clone(proto)
        a = li.find('a')
        a['href'] = href
        a.string = text
        ol.append(li)


def build_subnav(soup, path, section):
    nav = soup.find('nav', class_='submenu')
    if not nav:
        return
    if not section:
        nav.decompose()
        return
    s_label, s_href, children = SECTIONS[section]
    for hidden in nav.select('button > span.u-visually-hidden'):
        hidden.string = f'Show {s_label} menu'
    heading = nav.find(id='submenu-heading')
    if heading:
        heading.string = s_label
    title_link = nav.select_one('div.u-flex.u-items-center > a')
    if title_link:
        title_link['href'] = s_href
        title_link.string = s_label
    items = nav.select_one('div.submenu__items > ul')
    if items is not None:  # script-built variant (subNavigationT4): plain nested list
        items.clear()
        for child in children:
            li = soup.new_tag('li', attrs={'class': 'item'})
            a = soup.new_tag('a', href=child)
            a.string = label(child)
            if child == path:
                a['aria-current'] = 'page'
            li.append(a)
            items.append(li)
    for ul in [nav.find('ul', attrs={'x-data': 'subNavigation()'}),
               (nav.find('div', class_='mobile-menu') or nav).find('ul', attrs={'x-data': '{ menuOpen: false }'})]:
        if not ul:
            continue
        proto = ul.find('li', recursive=False)
        ul.clear()
        for child in children:
            li = clone(proto)
            for extra in li.find_all(['button', 'div'], recursive=False):
                extra.decompose()
            for attr in ('@mouseenter', '@mouseleave'):
                li.attrs.pop(attr, None)
            a = li.find('a')
            for attr in list(a.attrs):
                if attr.startswith((':', '@')):
                    del a[attr]
            a['href'] = child
            a.string = label(child)
            if child == path:
                a['class'] = a.get('class', []) + ['u-font-bold', 'u-underline']
                a['aria-current'] = 'page'
            ul.append(li)


def build_footer(soup):
    footer = soup.find('footer')
    if not footer:
        return
    cols = footer.select('div.col-6.col-md')
    if cols:
        parent, proto = cols[0].parent, cols[0]
        item_proto = proto.find('li')
        for c in cols:
            c.extract()
        for heading, links in FOOTER_COLS:
            col = clone(proto)
            col.find('span').string = heading
            ul = col.find('ul')
            ul.clear()
            for href in links:
                it = clone(item_proto)
                it.find('a')['href'] = href
                set_text(it.find('a'), label(href))
                ul.append(it)
            parent.append(col)
    btn = footer.find('a', class_='btn-primary')
    if btn:
        btn['href'] = '/apply-form/'
        set_text(btn, 'Apply Now ')
    cta = footer.find('a', class_='cta-link')
    if cta:
        cta['href'] = '/contact/'
        set_text(cta, 'Contact Us ')


def absolutize(html):
    html = re.sub(r'''(["'(])(?:\./)?(media|vendor|json)/''', r'\1/\2/', html)
    for old, new in TEMPLATE_LINKS.items():
        html = html.replace(f'href="{old}"', f'href="{new}"')
    html = html.replace('rel="home" href="#"', 'rel="home" href="/"').replace('href="#" rel="home"', 'href="/" rel="home"')
    return html


# ---------------------------------------------------------------- content
LOREM = set('''lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore
magna aliqua enim ad minim veniam quis nostrud exercitation ullamco laboris nisi aliquip ex ea commodo consequat duis aute
irure in reprehenderit voluptate velit esse cillum eu fugiat nulla pariatur excepteur sint occaecat cupidatat non proident
sunt culpa qui officia deserunt mollit anim id est laborum vel'''.split())


def is_lorem(text):
    words = re.findall(r'[A-Za-z]+', text.lower())
    return bool(words) and sum(w in LOREM for w in words) / len(words) >= 0.6


def slug(path):
    return path.strip('/').replace('/', '_') or 'home'


def load_content(path):
    return json.loads((CONTENT / f'{slug(path)}.json').read_text(encoding='utf-8'))


def own_text(tag):
    return ' '.join(s.strip() for s in tag.find_all(string=True, recursive=False) if s.strip() and not isinstance(s, Comment))


def fill_hero(soup, hero, block, title):
    """Put the page's scraped hero copy into the template hero; drop template-only extras."""
    paras = list(block['paras']) if block else []
    kicker = block['eyebrow'] if block else ''
    if not kicker and len(paras) >= 2 and len(paras[0]) <= 60:
        kicker = paras.pop(0)
    lead = paras[0] if paras else ''
    links = block['links'] if block else []
    in_crumb = lambda t: t.find_parent('nav', class_='breadcrumb') is not None

    heading = hero.find('h1') or hero.select_one('.page-header__content .h2') or hero.find('h2')
    if heading is not None:
        heading.name = 'h1'
        heading.attrs.pop('href', None)
        heading.clear()
        heading.append((block or {}).get('h1') or title)

    texts = [t for t in hero.find_all(['p', 'div', 'span']) if own_text(t) and not in_crumb(t)
             and (heading is None or heading not in t.parents)]
    before = [t for t in texts if heading is not None and t.sourceline is not None and heading.sourceline and t.sourceline < heading.sourceline]
    after = [t for t in texts if t not in before]
    if after:
        if lead:
            after[0].clear()
            after[0].append(lead)
        else:
            after[0].decompose()
    elif lead and heading is not None:
        div = soup.new_tag('div', attrs={'class': 'u-text-h5 u-font-bold u-font-sans u-leading-tight u-mt-3'})
        div.string = lead
        heading.insert_after(div)
    if before:
        if kicker:
            before[-1].clear()
            before[-1].append(kicker)
        else:
            before[-1].decompose()

    cta = [a for a in hero.find_all('a') if not in_crumb(a) and ('btn' in a.get('class', []) or 'cta-link' in a.get('class', []))]
    for i, a in enumerate(cta):
        if i < len(links):
            a['href'] = resolve_href(links[i].get('href'), links[i]['text'], PAGES)
            for child in list(a.children):
                if isinstance(child, NavigableString):
                    child.extract()
            a.insert(0, links[i]['text'] + ' ')
        else:
            (a.find_parent('li') or a).decompose()
    for box in hero.select('.statistics-row-box'):
        box.decompose()
    for art in hero.select('.tapestry'):  # decorative collage overlaps long real headings
        (art.parent if art.parent is not hero else art).decompose()
    sweep(hero, remove=True)


def sweep(root, remove):
    """Remove (or report) any template lorem text left inside root."""
    leftovers = []
    for s in list(root.find_all(string=True)):
        if isinstance(s, Comment) or getattr(s, 'parent', None) is None or s.parent.name in ('script', 'style'):
            continue
        if s.strip() and is_lorem(s):
            leftovers.append(s)
    if remove:
        for s in leftovers:
            el = s.parent
            if el is not None and el.parent is not None:
                el.decompose()
    for tag in root.find_all(True):
        for attr in ('alt', 'aria-label', 'title', 'placeholder'):
            if tag.get(attr) and is_lorem(tag[attr]):
                tag[attr] = '' if attr == 'alt' else SITE_NAME
    return leftovers


def replace_body(soup, main, hero, body_html):
    content = main
    main = main.find_parent('main') or main
    keep = [hero] + [n for n in main.select('nav.submenu, div.submenu-branding')]
    ancestors = {id(a) for k in keep for a in k.parents}

    def prune(node):
        for child in list(node.find_all(recursive=False)):
            if any(child is k for k in keep):
                continue
            if id(child) in ancestors:
                prune(child)
            else:
                child.decompose()
    prune(main)
    (content if content.parent is not None else main).append(BeautifulSoup(body_html, 'html.parser'))


def fill_chrome_text(soup):
    """Header/footer copy that is not navigation: tagline, contact, legal line, hidden labels."""
    footers = [f for f in soup.find_all('footer') if f.find_parent('main') is None]
    footer = footers[-1] if footers else None
    if footer:
        for s in list(footer.find_all(string=True)):
            if not s.strip() or not is_lorem(s) or getattr(s, 'parent', None) is None:
                continue
            el = s.parent
            if el.name == 'a':
                if el.find_parent('ul') and el.find('svg'):
                    set_text(el, '')
                else:
                    (el.find_parent('li') or el).decompose()
            elif 'u-visually-hidden' in el.get('class', []):
                el.string = 'WhiteHouse College on social media'
            else:
                el.decompose()
        logo_block = footer.find('img', class_='site-logo') or footer.find('img', alt='Logo')
        info = soup.new_tag('div', attrs={'class': 'u-text-small u-leading-normal u-mt-2 u-text-grey-300'})
        phones = ', '.join(CONTACT['phones'])
        info.append(BeautifulSoup(
            f'<p class="u-mb-1">{FOOTER_TAGLINE}</p><p class="u-mb-1">{CONTACT["address"]} · {phones}</p>'
            f'<p class="u-mb-1"><a class="u-text-inherit" href="mailto:{CONTACT["email"]}">{CONTACT["email"]}</a></p>'
            f'<p class="u-mb-0">{COPYRIGHT}</p>', 'html.parser'))
        anchor = logo_block.find_parent('a') if logo_block is not None and logo_block.find_parent('a') else logo_block
        if anchor is not None:
            anchor.insert_after(info)
        else:
            footer.append(info)
    header = soup.find('header')
    if header:
        for s in list(header.find_all(string=True)):
            if s.strip() and is_lorem(s) and getattr(s, 'parent', None) is not None:
                el = s.parent
                if 'u-visually-hidden' in el.get('class', []) or el.name in ('label', 'button', 'span'):
                    el.string = 'Search' if el.find_parent('form') or 'search' in str(el.parent).lower() else 'Menu'
                elif el.name == 'h2':
                    el.string = 'Menu'
                else:
                    el.decompose()
    for s in list(soup.find_all(string=True)):
        if s.strip() and is_lorem(s) and getattr(s, 'parent', None) is not None and s.parent.name not in ('script', 'style') \
                and s.find_parent('main') is None:
            s.parent.string = 'Skip to main content' if s.parent.name == 'a' else ''


def build_page(path, title, template, section):
    soup = BeautifulSoup((ROOT / f'{template}.html').read_text(encoding='utf-8'), 'html.parser')
    data = load_content(path)
    soup.title.string = data['title'] or f'{title} | {SITE_NAME}'
    for meta in soup.find_all('meta'):
        if meta.get('name') in ('description', 'Description') or meta.get('property') in ('og:description',):
            meta['content'] = data['description']
        elif meta.get('content') and is_lorem(meta['content']):
            meta.decompose()
    for a in soup.select('a[rel=home]'):
        a['href'] = '/'
    build_utility_nav(soup)
    build_primary_nav(soup)
    build_mobile_nav(soup)
    build_breadcrumb(soup, path, section)
    build_subnav(soup, path, section)
    build_footer(soup)

    blocks = data['blocks']
    hero_block = next((b for b in blocks if b['h1']), None)
    body_blocks = [b for b in blocks if b is not hero_block]
    if hero_block and (hero_block['groups'] or hero_block['forms']):  # hero carried cards/forms: render them in the body
        body_blocks.insert(0, dict(hero_block, h1='', eyebrow='', heading='', paras=[], links=[], images=[]))
    main = soup.find('div', class_='main-content') or soup.find('main')
    hero = main.find(class_=['page-header', 'hero-header']) or main.find(True, recursive=False)
    fill_hero(soup, hero, hero_block, title)
    replace_body(soup, main, hero, render_body(body_blocks, PAGES))
    fill_chrome_text(soup)
    for script in soup.find_all('script', src=re.compile('course-overview-adjust')):
        script.decompose()  # adjusts template-only course sections that the content body replaces

    html = absolutize(str(soup))
    if not html.lstrip().lower().startswith('<!doctype'):
        html = '<!DOCTYPE html>\n' + html
    target = OUT / path.strip('/') / 'index.html'
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(html, encoding='utf-8')
    return target, sweep(BeautifulSoup(html, 'html.parser'), remove=False)


def main():
    if OUT.exists():
        shutil.rmtree(OUT)
    OUT.mkdir()
    for d in ('media', 'json', 'vendor'):
        shutil.copytree(ROOT / d, OUT / d)
    for path, (title, template, section) in PAGES.items():
        target, leftovers = build_page(path, title, template, section)
        note = f'  lorem left: {[s.strip()[:30] for s in leftovers][:4]}' if leftovers else ''
        print(f'{path:36} <- {template:24} {target.stat().st_size // 1024:>5} KB{note}')
    print(f'\n{len(PAGES)} pages written to {OUT}')


if __name__ == '__main__':
    main()

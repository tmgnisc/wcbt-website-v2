"""Render scraped WhiteHouse content blocks (content/*.json) with the template's component markup."""
import re
from html import escape

PLACEHOLDER = 'https://placehold.co/1200x800/png'
PLACEHOLDER_WIDE = 'https://placehold.co/1920x1080/png'
MORE_LINK = re.compile(r'^(view details|read more|learn more|view|explore|details)$', re.I)

CONTACT = {
    'address': 'WCBT Jhapa Campus, Jhapa, Nepal',
    'phones': ['9714530056', '9714530057'],
    'email': 'info@whitehouseeducation.edu.np',
}

# link text -> page, for buttons that have no href on the source site
CTA_TARGETS = [
    (r'apply|application', '/apply-form/'), (r'scholarship', '/academics/scholarships/'),
    (r'virtual|tour', '/visit/virtual-tour/'), (r'visit|book|schedule', '/visit/'),
    (r'program|course|degree', '/programs/'), (r'contact|admission|inquir|talk|get in touch', '/contact/'),
    (r'career|placement', '/careers/'), (r'news', '/updates/news/'), (r'event', '/updates/events/'),
]

ARROW = ('<svg class="icon u-ml-1" focusable="false"><use xlink:href="/media/durham-university/site-assets/image/'
         'sprite.svg#feather--arrow-right"></use></svg>')
CTA_ARROW = ('<svg class="icon u-transition u-ml-1" focusable="false"><use xlink:href="/media/durham-university/'
             'site-assets/image/sprite.svg#cti--arrow-button-right"></use></svg>')


def e(text):
    return escape(text or '', quote=True)


def resolve_href(href, text, pages):
    if href and href.startswith(('tel:', 'mailto:', 'http')):
        return href
    if href and href.startswith('/'):
        path, _, anchor = href.partition('#')
        path = path.rstrip('/') + '/'
        if path in pages:
            return path + (f'#{anchor}' if anchor else '')
    for pattern, target in CTA_TARGETS:
        if re.search(pattern, text or '', re.I):
            return target
    return '#'


def img(alt, cls='u-w-full img', wide=False):
    return f'<img alt="{e(alt)}" class="{cls}" loading="lazy" src="{PLACEHOLDER_WIDE if wide else PLACEHOLDER}"/>'


def paragraphs(paras, large_first=False):
    if not paras:
        return ''
    out = []
    for i, p in enumerate(paras):
        cls = ' class="u-text-large"' if large_first and i == 0 else ''
        out.append(f'<p{cls}>{e(p)}</p>')
    return f'<div class="text-long u-max-w-measure-lg u-leading-normal u-o-3">{"".join(out)}</div>'


def bullets(items):
    if not items:
        return ''
    lis = ''.join(f'<li>{e(b)}</li>' for b in items)
    return f'<div class="text-long u-max-w-measure-lg u-leading-normal u-o-3"><ul>{lis}</ul></div>'


def buttons(links, pages, dark=False):
    if not links:
        return ''
    out = []
    for i, link in enumerate(links):
        href = resolve_href(link.get('href'), link['text'], pages)
        if i == 0:
            cls = 'btn btn-light' if dark else 'btn btn-primary'
            out.append(f'<li><a class="{cls}" href="{e(href)}">{e(link["text"])}{ARROW}</a></li>')
        else:
            color = ' u-text-white' if dark else ''
            out.append(f'<li><a class="link cta-link u-font-bold u-no-underline u-pr-2 hocus:u-underline u-block{color}" '
                       f'href="{e(href)}">{e(link["text"])}{CTA_ARROW}</a></li>')
    return (f'<ul class="u-list-reset u-flex u-flex-wrap u-items-center u-gap-x-4 u-gap-y-3 u-mt-4 u-mb-0">'
            f'{"".join(out)}</ul>')


def eyebrow(text, dark=False):
    if not text:
        return ''
    color = 'u-text-white' if dark else 'u-text-primary'
    return f'<p class="u-text-small u-font-bold u-uppercase u-mb-1 {color}">{e(text)}</p>'


def quote(q):
    if not q:
        return ''
    cite = ', '.join(q['cite'])
    return (f'<blockquote class="blockquote u-my-4"><p class="u-text-h4 u-font-bold u-leading-tight">“{e(q["text"])}”</p>'
            + (f'<p class="u-mt-2 u-mb-0 u-text-medium"><cite>— {e(cite)}</cite></p>' if cite else '') + '</blockquote>')


def section(inner, tone='plain', extra=''):
    tone_cls = {'dark': ' u-bg-primary u-text-white has-dark-bg', 'muted': ' u-bg-grey-50'}.get(tone, '')
    return (f'<div class="landing-page-section u-breakout u-relative u-py-4 md:u-py-6 lg:u-py-10{tone_cls}{extra}">'
            f'<div class="container u-o-5">{inner}</div></div>')


def heading_group(b, dark=False, center=False):
    parts = [eyebrow(b['eyebrow'], dark)]
    if b['heading']:
        bar = '' if dark or center else ' u-heading-bar'
        parts.append(f'<h2 class="h2 u-mb-4{bar}">{e(b["heading"])}</h2>')
    parts.append(paragraphs(b['paras'], large_first=bool(b['heading'])))
    parts.append(bullets(b['bullets']))
    parts.append(quote(b['quote']))
    return ''.join(parts)


# ---------------------------------------------------------------- item groups
def columns(items):
    n = len(items)
    long_text = sum(len(' '.join(it['text'] + it['bullets'])) for it in items) / max(n, 1) > 260
    if n == 2 or long_text and n % 2 == 0:
        return 'col-md-6'
    if n % 4 == 0 and not long_text:
        return 'col-md-6 col-lg-3'
    return 'col-md-6 col-lg-4'


def clean_item(it):
    text = [t for t in it['text'] if not MORE_LINK.match(t)]
    links = [l for l in it['links'] if l['text'] not in ('i',)]
    more = next((t for t in it['text'] if MORE_LINK.match(t)), None)
    if more and not links:
        links = [{'text': more, 'href': it.get('href')}]
    return dict(it, text=text, links=links)


def card(it, pages, col, dark=False):
    it = clean_item(it)
    href = resolve_href(it.get('href'), it['title'], pages) if it.get('href') else None
    title = e(it['title'])
    if href and href != '#':
        title = f'<a class="link u-text-inherit group-hocus:u-underline" href="{e(href)}">{title}</a>'
    parts = []
    if it['eyebrow']:
        parts.append(f'<p class="u-text-small u-font-bold u-uppercase u-text-grey-300 u-mb-0">{e(it["eyebrow"])}</p>')
    if it['stat']:
        parts.append(f'<p class="u-text-h3 u-font-bolder u-text-primary u-leading-tight u-mb-0">{e(it["stat"])}</p>')
    if it['title']:
        parts.append(f'<h3 class="card-heading u-mb-0 u-font-bolder u-leading-tight u-text-large u-text-primary">{title}</h3>')
    if it['text']:
        parts.append('<div class="u-text-small text-long u-leading-normal u-o-2">'
                     + ''.join(f'<p>{e(t)}</p>' for t in it['text']) + '</div>')
    if it['bullets']:
        parts.append('<ul class="u-text-small u-pl-3 u-mb-0">' + ''.join(f'<li>{e(b)}</li>' for b in it['bullets']) + '</ul>')
    for link in it['links'][:2]:
        lhref = resolve_href(link.get('href'), link['text'], pages)
        parts.append(f'<a class="link cta-link u-font-bold u-no-underline u-pr-2 hocus:u-underline u-block u-mt-auto" '
                     f'href="{e(lhref)}">{e(link["text"])}{CTA_ARROW}</a>')
    image = ''
    if it['image']:
        image = (f'<div class="card__image embed-responsive u-bg-grey-50 embed-responsive-16by9">'
                 f'{img(it["image"] if it["image"] != "image" else it["title"], "embed-responsive-item u-object-cover u-transition group-hocus:u-scale-110 image u-w-full")}</div>')
    border = '' if image else ' u-border-t-6 u-border-primary'
    return (f'<div class="{col}"><div class="card group u-relative u-flex u-flex-col u-w-full u-h-full u-overflow-hidden '
            f'u-bg-white u-text-black hover:u-shadow u-transition{border}" data-card="">{image}'
            f'<div class="card-body u-flex u-flex-col u-flex-1 u-p-3 u-o-2">{"".join(parts)}</div></div></div>')


def stats_band(items):
    cols = []
    for it in items:
        label = ' — '.join(x for x in [it['title']] + it['text'] if x)
        cols.append(f'<div class="col-md-6 col-lg"><div class="u-flex u-items-center u-text-white u-gap-x-2">'
                    f'<span class="u-text-h3 u-block u-font-bolder u-font-sans u-leading-tight">{e(it["stat"])}</span>'
                    f'<span class="u-leading-normal">{e(label)}</span></div></div>')
    return (f'<div class="u-bg-primary u-breakout u-py-4"><div class="container"><div class="row u-items-center u-gap-y-2">'
            f'{"".join(cols)}</div></div></div>')


def chips(items, dark=False):
    color = 'u-border-white u-text-white' if dark else 'u-border-primary u-text-primary u-bg-white'
    out = ''.join(f'<li class="u-inline-block u-px-3 u-py-1 u-rounded-full u-border-1 {color} u-font-bold u-text-small">'
                  f'{e(it["title"])}</li>' for it in items)
    return f'<ul class="u-list-reset u-flex u-flex-wrap u-gap-2 u-mt-3 u-mb-0">{out}</ul>'


def is_chip_group(items):
    return all(not (it['text'] or it['stat'] or it['bullets'] or it['image'] or it['links']) and len(it['title']) <= 40
               for it in items)


def is_stat_group(items):
    return all(it['stat'] for it in items) and not all(re.fullmatch(r'\d{1,2}|(19|20)\d\d', it['stat']) for it in items)


def render_group(items, pages, dark=False):
    if is_chip_group(items):
        return chips(items, dark)
    if all(re.fullmatch(r'\d{1,2}', it['stat'] or '') for it in items):  # numbered steps
        items = [dict(it, eyebrow=f'Step {it["stat"]}', stat='') for it in items]
    elif all(re.fullmatch(r'(19|20)\d\d', it['stat'] or '') for it in items):  # timeline years
        items = [dict(it, eyebrow=it['stat'], stat='') for it in items]
    col = columns(items)
    cards = ''.join(card(it, pages, col, dark) for it in items)
    return f'<div class="row md:u-gap-y-5 u-gap-y-2 u-mt-4">{cards}</div>'


# ---------------------------------------------------------------- other components
def faq_list(faqs):
    items = ''.join(
        f'<details class="u-bg-white u-border-b-1 u-border-grey-50 u-p-3"><summary class="u-font-bold u-text-large u-cursor-pointer">'
        f'{e(f["q"])}</summary><div class="text-long u-leading-normal u-mt-2"><p>{e(f["a"])}</p></div></details>'
        for f in faqs)
    return f'<div class="u-max-w-measure-lg u-mt-4 u-o-1">{items}</div>'


def table(rows):
    if not rows:
        return ''
    head = ''.join(f'<th scope="col">{e(c)}</th>' for c in rows[0])
    body = ''.join('<tr>' + ''.join((f'<th scope="row">{e(c)}</th>' if i == 0 else f'<td>{e(c)}</td>')
                                    for i, c in enumerate(r)) + '</tr>' for r in rows[1:])
    return (f'<div class="table-responsive u-mt-4 u-bg-white"><table class="table u-mb-0"><thead><tr>{head}</tr></thead>'
            f'<tbody>{body}</tbody></table></div>')


def form(spec, uid):
    fields = []
    for i, f in enumerate(spec['fields']):
        fid = f'{uid}-{i}'
        label = f['label'] or f['placeholder'] or (f['options'][0] if f['options'] else f['name'])
        req = ' required' if f['required'] else ''
        if f['tag'] == 'select' or f['options']:
            opts = f['options'] or []
            first = f'<option value="">{e(opts[0])}</option>' if opts else ''
            options = ''.join(f'<option>{e(o)}</option>' for o in opts[1:])
            control = f'<select class="custom-select form-control" id="{fid}" name="{e(f["name"] or fid)}"{req}>{first}{options}</select>'
            full = False
        elif f['tag'] == 'textarea' or re.search(r'message|details|anything|tell us', label, re.I):
            control = f'<textarea class="form-control" id="{fid}" name="{e(f["name"] or fid)}" rows="5"{req}></textarea>'
            full = True
        else:
            control = (f'<input class="form-control" id="{fid}" name="{e(f["name"] or fid)}" type="{e(f["type"] or "text")}"'
                       f'{req}/>')
            full = False
        col = 'col-12' if full else 'col-md-6'
        fields.append(f'<div class="{col} u-mb-3"><label class="u-block u-font-bold u-mb-1" for="{fid}">{e(label)}</label>{control}</div>')
    notes = ''.join(f'<p class="u-text-small u-mt-2 u-mb-0">{e(n)}</p>' for n in spec.get('notes', []))
    return (f'<form action="#" class="u-bg-white u-text-black u-p-4 u-shadow" method="post" '
            f'onsubmit="event.preventDefault(); this.querySelector(\'[role=status]\').hidden = false;">'
            f'<div class="row">{"".join(fields)}</div>'
            f'<button class="btn btn-primary" type="submit">{e(spec["submit"] or "Submit")}</button>{notes}'
            f'<p class="u-mt-3 u-font-bold u-text-primary" hidden role="status">Thank you — this demo form does not send data yet.</p>'
            f'</form>')


def contact_details(dark=True):
    phones = ', '.join(f'<a class="u-text-inherit" href="tel:{p}">{p}</a>' for p in CONTACT['phones'])
    return (f'<div class="u-leading-normal"><p><strong>{e(CONTACT["address"])}</strong></p>'
            f'<p><strong>Phone:</strong> {phones}</p>'
            f'<p><strong>Email:</strong> <a class="u-text-inherit" href="mailto:{CONTACT["email"]}">{CONTACT["email"]}</a></p></div>')


def cta_band(b, pages):
    """Closing call to action: the template's 'get in touch' image band."""
    return (f'<div class="landing-page-section landing-page-section--get-in-touch u-breakout u-py-4 md:u-py-10 lg:u-py-16 '
            f'landing-page-section--image u-bg-cover u-bg-bottom u-text-white has-dark-bg" '
            f'style="background-image: url(\'{PLACEHOLDER_WIDE}\');"><div class="container u-o-5 u-relative u-z-1">'
            f'<div class="row u-flex-col u-justify-between lg:u-flex-row u-items-center"><div class="u-o-5 col-lg-6">'
            f'{eyebrow(b["eyebrow"], True)}<h2 class="h2 u-mb-4">{e(b["heading"])}</h2>{paragraphs(b["paras"])}'
            f'{buttons(b["links"], pages, dark=True)}</div>'
            f'<div class="u-o-5 u-mt-4 lg:u-mt-0 col-lg-4">{contact_details()}</div></div></div>'
            f'<div class="landing-page-section__corner u-absolute u-pin-t u-pin-l landing-page-section__corner--left u-text-white"></div></div>')


def split(b, pages, reverse=False, image_alt=None):
    """Text beside an image: the template's signposting section."""
    order = ' lg:u-flex-row-reverse' if reverse else ''
    dark = b['tone'] == 'dark'
    groups = ''.join(render_group(g, pages, dark) for g in b['groups'])
    return section(
        f'<div class="row u-flex-col u-justify-between lg:u-flex-row{order} u-items-center">'
        f'<div class="u-o-5 col-lg-5"><div class="u-relative u-z-1 u-shadow-media u-bg-grey-50 embed-responsive '
        f'embed-responsive-16by9 u-rounded-br-lg">{img(image_alt or b["heading"], "embed-responsive-item u-object-cover u-w-full")}</div></div>'
        f'<div class="u-o-5 u-mt-4 lg:u-mt-0 col-lg-6">{heading_group(b, dark)}{buttons(b["links"], pages, dark)}</div></div>'
        f'{groups}', b['tone'], ' signposting')


def flatten_single_groups(b):
    """A one-item 'group' is really part of the section copy."""
    keep = []
    for g in b['groups']:
        if len(g) != 1:
            keep.append(g)
            continue
        it = g[0]
        if it['title'] and not b['eyebrow'] and b['heading']:
            b['paras'].append(it['title'])
        elif it['title'] and not b['heading']:
            b['heading'] = it['title']
        for t in it['text']:
            if re.match(r'^["“]', t) and not b['quote']:
                b['quote'] = {'text': t.strip('"“”'), 'cite': []}
            elif b['quote'] is not None and len(t) < 50 and len(b['quote']['cite']) < 2:
                b['quote']['cite'].append(t)
            elif len(t) <= 20 and not re.search(r'[.!?]$', t):
                b.setdefault('_chips', []).append(t)
            else:
                b['paras'].append(t)
        b['bullets'] += it['bullets']
        b['links'] += it['links']
    b['groups'] = keep
    if b.get('_chips'):
        b['groups'].append([{'eyebrow': '', 'title': c, 'stat': '', 'text': [], 'bullets': [], 'links': [], 'image': None,
                             'href': None} for c in b.pop('_chips')])
    return b


def render_block(b, pages, index, is_last):
    b = flatten_single_groups(dict(b, paras=list(b['paras']), links=list(b['links']), bullets=list(b['bullets'])))
    dark = b['tone'] == 'dark'
    if not any([b['heading'], b['paras'], b['groups'], b['forms'], b['faqs'], b['tables'], b['bullets']]):
        return ''
    if b['forms'] and all(len(f['fields']) <= 1 for f in b['forms']) and not b['heading']:
        return ''  # site search widget, not page content
    if b['forms']:
        side = heading_group(b, dark) + ''.join(render_group(g, pages, dark) for g in b['groups'] if is_chip_group(g))
        info = [g for g in b['groups'] if not is_chip_group(g)]
        side += ''.join(f'<ul class="u-list-reset u-mt-3">' + ''.join(
            f'<li class="u-mb-2"><strong>{e(it["title"])}</strong> '
            + ' '.join(e(t) for t in it['text'] + [l['text'] for l in it['links']]) + '</li>' for it in g) + '</ul>' for g in info)
        if not info and not b['groups']:
            side += contact_details(dark)
        return section(f'<div class="row u-gap-y-4"><div class="col-lg-5 u-o-4">{side}</div>'
                       f'<div class="col-lg-7">{"".join(form(f, f"f{index}-{i}") for i, f in enumerate(b["forms"]))}</div></div>',
                       b['tone'])
    if dark and not b['groups'] and not b['faqs'] and not b['tables'] and is_last:
        return cta_band(b, pages)
    if dark and not b['groups'] and not b['faqs'] and not b['tables']:
        return section(f'<div class="u-text-center u-max-w-measure-lg u-mx-auto">{heading_group(b, True, center=True)}'
                       f'<div class="u-flex u-justify-center">{buttons(b["links"], pages, dark=True)}</div></div>', 'dark')
    stat_groups = [g for g in b['groups'] if is_stat_group(g) and len(g) <= 5]
    if b['images'] and not b['faqs'] and not b['tables'] and len(b['groups']) <= 1 and not stat_groups:
        return split(b, pages, reverse=index % 2 == 0, image_alt=b['images'][0] if b['images'][0] != 'image' else None)
    if re.match(r'^Stop \d+', b['eyebrow'] or ''):
        return split(b, pages, reverse=index % 2 == 0)
    inner = heading_group(b, dark)
    out = []
    for g in b['groups']:
        if g in stat_groups and not dark:
            continue
        inner += render_group(g, pages, dark)
    inner += ''.join(table(t) for t in b['tables'])
    inner += faq_list(b['faqs']) if b['faqs'] else ''
    inner += buttons(b['links'], pages, dark)
    out.append(section(inner, b['tone']))
    for g in stat_groups:
        if not dark:
            out.append(stats_band(g))
    return ''.join(out)


def render_body(blocks, pages):
    body = [render_block(b, pages, i, i == len(blocks) - 1) for i, b in enumerate(blocks)]
    return '\n'.join(x for x in body if x)

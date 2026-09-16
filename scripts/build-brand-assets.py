"""Derive the transparent logo variants used by the app from the master artwork.

The master file is a flat maroon-on-white raster, so ink coverage is recovered from
luminance and re-tinted. Re-run after replacing public/logo.png:

    python3 scripts/build-brand-assets.py
"""

from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
MASTER = ROOT / "public" / "logo.png"
OUT_DIR = ROOT / "src" / "assets" / "brand"

MAROON = (139, 21, 56)
WHITE = (255, 255, 255)

# Luminance window that maps paper (transparent) to ink (opaque), keeping edges anti-aliased.
PAPER_LUMA = 246
INK_LUMA = 96
# Columns of blank pixels that separate the crest from the wordmark.
GAP_WIDTH = 8


def coverage(master: Image.Image) -> Image.Image:
    """Alpha mask where 255 is full ink and 0 is bare paper."""
    luma = master.convert("L")
    span = PAPER_LUMA - INK_LUMA
    return luma.point(lambda value: max(0, min(255, round((PAPER_LUMA - value) * 255 / span))))


def tinted(mask: Image.Image, rgb: tuple[int, int, int]) -> Image.Image:
    art = Image.new("RGBA", mask.size, (*rgb, 0))
    art.putalpha(mask)
    return art


def trim(image: Image.Image, pad: int = 0) -> Image.Image:
    box = image.getchannel("A").getbbox()
    left, top, right, bottom = box
    return image.crop(
        (
            max(0, left - pad),
            max(0, top - pad),
            min(image.width, right + pad),
            min(image.height, bottom + pad),
        )
    )


def crest_width(mask: Image.Image) -> int:
    """First run of blank columns after the crest, i.e. the gap before the wordmark."""
    columns = [max(mask.crop((x, 0, x + 1, mask.height)).getextrema()) for x in range(mask.width)]
    inked = [x for x, value in enumerate(columns) if value > 8]
    start, blanks = inked[0], 0
    for x in range(start, mask.width):
        blanks = blanks + 1 if columns[x] <= 8 else 0
        if blanks >= GAP_WIDTH:
            return x - blanks + 1
    raise SystemExit("could not locate the gap between crest and wordmark")


def square(image: Image.Image, size: int) -> Image.Image:
    fitted = image.copy()
    fitted.thumbnail((size, size), Image.LANCZOS)
    canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    canvas.paste(fitted, ((size - fitted.width) // 2, (size - fitted.height) // 2))
    return canvas


def main() -> None:
    master = Image.open(MASTER).convert("RGB")
    mask = coverage(master)
    split = crest_width(mask)

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    for suffix, rgb in (("", MAROON), ("-light", WHITE)):
        art = tinted(mask, rgb)
        trim(art).save(OUT_DIR / f"wcbt-logo{suffix}.png")
        trim(art.crop((0, 0, split, art.height))).save(OUT_DIR / f"wcbt-crest{suffix}.png")

    crest = trim(tinted(mask, MAROON).crop((0, 0, split, mask.height)))
    square(crest, 512).save(ROOT / "public" / "favicon.png")

    for path in sorted(OUT_DIR.glob("*.png")) + [ROOT / "public" / "favicon.png"]:
        print(f"{path.relative_to(ROOT)} {Image.open(path).size}")


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""
C.N.M.T campaign flyer — Loop House / Diamano energy, original C.N DNA.
Hand-composed: large uncropped photo, bold type, real flags, one QR.
"""

from __future__ import annotations

from pathlib import Path

import qrcode
from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parent
OUT = ROOT / "print"
ASSETS = OUT / "_assets"

BRAND = (208, 16, 24)
NAVY = (10, 26, 47)
GOLD = (232, 168, 56)  # Loop-house energy bar, used sparingly
WHITE = (255, 255, 255)
MUTED = (90, 101, 119)
LIGHT = (247, 248, 250)

WA_URL = (
    "https://wa.me/212715617637"
    "?text=Hi%20C.N.M.T%2C%20I%20want%20to%20send%20money%20%E2%80%94%20please%20quote"
)
SITE = "https://cnmt.shop/"
PHONE1 = "+212 715 617 637"
PHONE2 = "+212 627 140 999"


def font(size: int, bold: bool = False):
    paths = [
        "/System/Library/Fonts/Supplemental/Arial Bold.ttf" if bold else "/System/Library/Fonts/Supplemental/Arial.ttf",
        "/Library/Fonts/Arial Bold.ttf" if bold else "/Library/Fonts/Arial.ttf",
        "/System/Library/Fonts/Supplemental/Impact.ttf" if bold else None,
    ]
    for p in paths:
        if not p:
            continue
        try:
            return ImageFont.truetype(p, size)
        except OSError:
            continue
    return ImageFont.load_default()


def rr(d, xy, fill, radius=22, outline=None, width=2):
    d.rounded_rectangle(xy, radius=radius, fill=fill, outline=outline, width=width)


def make_qr(size: int) -> Image.Image:
    qr = qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_H, box_size=10, border=1)
    qr.add_data(WA_URL)
    qr.make(fit=True)
    img = qr.make_image(fill_color="#0a1a2f", back_color="#ffffff").convert("RGB")
    img = img.resize((size, size), Image.Resampling.NEAREST)
    b = max(22, size // 5)
    badge = Image.new("RGB", (b, b), BRAND)
    bd = ImageDraw.Draw(badge)
    bd.text((b // 2, b // 2), "CN", fill=WHITE, font=font(max(11, b // 3), True), anchor="mm")
    img.paste(badge, ((size - b) // 2, (size - b) // 2))
    return img


def flag(code: str, w: int = 56, h: int = 38) -> Image.Image:
    """Simple but recognizable print flags."""
    im = Image.new("RGB", (w, h), WHITE)
    d = ImageDraw.Draw(im)
    if code == "GB":
        d.rectangle((0, 0, w, h), fill=(1, 33, 105))
        d.polygon([(0, 0), (w, h), (w - 8, h), (0, 8)], fill=WHITE)
        d.polygon([(w, 0), (0, h), (8, h), (w, 8)], fill=WHITE)
        d.rectangle((w // 2 - 6, 0, w // 2 + 6, h), fill=WHITE)
        d.rectangle((0, h // 2 - 6, w, h // 2 + 6), fill=WHITE)
        d.rectangle((w // 2 - 3, 0, w // 2 + 3, h), fill=BRAND)
        d.rectangle((0, h // 2 - 3, w, h // 2 + 3), fill=BRAND)
    elif code == "FR":
        d.rectangle((0, 0, w // 3, h), fill=(0, 85, 164))
        d.rectangle((w // 3, 0, 2 * w // 3, h), fill=WHITE)
        d.rectangle((2 * w // 3, 0, w, h), fill=(239, 65, 53))
    elif code == "ES":
        d.rectangle((0, 0, w, h), fill=(198, 11, 30))
        d.rectangle((0, h // 4, w, 3 * h // 4), fill=(255, 196, 0))
    elif code == "MA":
        d.rectangle((0, 0, w, h), fill=(193, 39, 45))
        # green pentagram approx
        cx, cy, r = w // 2, h // 2, min(w, h) // 5
        d.ellipse((cx - r, cy - r, cx + r, cy + r), outline=(0, 98, 51), width=3)
    elif code == "GH":
        d.rectangle((0, 0, w, h // 3), fill=(206, 17, 38))
        d.rectangle((0, h // 3, w, 2 * h // 3), fill=(252, 209, 22))
        d.rectangle((0, 2 * h // 3, w, h), fill=(0, 107, 63))
        d.regular_polygon((w // 2, h // 2, 6), n_sides=5, rotation=18, fill=(0, 0, 0))
    elif code == "NG":
        d.rectangle((0, 0, w // 3, h), fill=(0, 135, 81))
        d.rectangle((w // 3, 0, 2 * w // 3, h), fill=WHITE)
        d.rectangle((2 * w // 3, 0, w, h), fill=(0, 135, 81))
    elif code == "SL":
        d.rectangle((0, 0, w, h // 3), fill=(30, 181, 58))
        d.rectangle((0, h // 3, w, 2 * h // 3), fill=WHITE)
        d.rectangle((0, 2 * h // 3, w, h), fill=(0, 114, 198))
    elif code == "LR":
        for i in range(11):
            y = int(i * h / 11)
            y2 = int((i + 1) * h / 11)
            d.rectangle((0, y, w, y2), fill=BRAND if i % 2 == 0 else WHITE)
        d.rectangle((0, 0, int(w * 0.38), int(h * 0.48)), fill=(0, 40, 104))
        # single white star
        cx, cy = int(w * 0.19), int(h * 0.24)
        d.regular_polygon((cx, cy, 5), n_sides=5, rotation=18, fill=WHITE)
    elif code == "KE":
        d.rectangle((0, 0, w, h), fill=WHITE)
        d.rectangle((0, 0, w, int(h * 0.28)), fill=(0, 0, 0))
        d.rectangle((0, int(h * 0.36), w, int(h * 0.64)), fill=BRAND)
        d.rectangle((0, int(h * 0.72), w, h), fill=(0, 102, 51))
    elif code == "UG":
        bands = [(0, 0, 0), (252, 220, 18), (218, 36, 31)] * 2
        bh = h // 6
        for i, c in enumerate(bands):
            d.rectangle((0, i * bh, w, (i + 1) * bh), fill=c)
    else:
        d.rectangle((0, 0, w, h), fill=NAVY)
    # thin border
    d.rectangle((0, 0, w - 1, h - 1), outline=(20, 20, 20), width=1)
    return im


COUNTRIES = [
    ("GB", "UK"),
    ("FR", "France"),
    ("ES", "Spain"),
    ("MA", "Morocco"),
    ("GH", "Ghana"),
    ("NG", "Nigeria"),
    ("SL", "S. Leone"),
    ("LR", "Liberia"),
    ("KE", "Kenya"),
    ("UG", "Uganda"),
]


def fade_left(photo: Image.Image, fade: int = 160) -> Image.Image:
    """Soft left-edge fade so type can sit over studio white."""
    img = photo.convert("RGBA")
    w, h = img.size
    mask = Image.new("L", (w, h), 255)
    md = ImageDraw.Draw(mask)
    for x in range(fade):
        a = int(255 * (x / fade))
        md.line((x, 0, x, h), fill=a)
    img.putalpha(mask)
    return img


def place_hero(canvas: Image.Image, hero: Image.Image, box) -> None:
    """Scale-cover the photo into box (l,t,r,b) and fade left."""
    l, t, r, b = box
    bw, bh = r - l, b - t
    # cover-scale
    scale = max(bw / hero.width, bh / hero.height)
    nw, nh = int(hero.width * scale), int(hero.height * scale)
    hero = hero.resize((nw, nh), Image.Resampling.LANCZOS)
    # crop to box, bias to keep face (upper-right)
    left = max(0, nw - bw)  # prefer right side of source
    top = max(0, int((nh - bh) * 0.08))
    hero = hero.crop((left, top, left + bw, top + bh))
    faded = fade_left(hero, fade=int(bw * 0.10))
    canvas.alpha_composite(faded, (l, t))


def build(w: int = 1080, h: int = 1350) -> Image.Image:
    """4:5 campaign poster — WhatsApp / IG / print."""
    base = Image.new("RGB", (w, h), WHITE)
    # faint paper grain via very light navy blobs
    ov = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    od = ImageDraw.Draw(ov)
    od.ellipse((-200, -180, 420, 360), fill=(253, 232, 233, 90))
    img = Image.alpha_composite(base.convert("RGBA"), ov)
    d = ImageDraw.Draw(img)
    pad = 48

    # red geometric top-right like original flyer
    od2 = ImageDraw.Draw(img)
    od2.polygon([(w - 280, 0), (w, 0), (w, 210)], fill=(*BRAND, 255))

    # —— Header ——
    rr(d, (pad, 36, pad + 56, 92), BRAND, radius=12)
    d.text((pad + 28, 64), "CN", fill=WHITE, font=font(22, True), anchor="mm")
    d.text((pad + 72, 44), "C.N.M.T", fill=NAVY, font=font(34, True))
    d.text((pad + 72, 82), "INTERNATIONAL MONEY TRANSFER", fill=MUTED, font=font(13, True))

    # —— Headline ——
    d.text((pad, 130), "SEND MONEY", fill=NAVY, font=font(62, True))
    d.text((pad, 198), "with proof", fill=BRAND, font=font(62, True))
    d.text(
        (pad, 276),
        "Smooth and secure transfer,\nevery time.",
        fill=MUTED,
        font=font(24),
        spacing=4,
    )

    # —— Hero photo: fill right side all the way to the footer (Loop House) ——
    hero_path = ASSETS / "cnmt-hero-right.jpg"
    hero = Image.open(hero_path).convert("RGB")
    photo_top = 300
    photo_bot = h - 168
    place_hero(img, hero, (int(w * 0.16), photo_top, w, photo_bot))
    d = ImageDraw.Draw(img)

    # —— Navy feature card overlapping photo (Loop House panel) ——
    card_x, card_y = pad, 348
    card_w, card_h = 420, 300
    # shadow
    sh = Image.new("RGBA", (card_w + 30, card_h + 30), (0, 0, 0, 0))
    sd = ImageDraw.Draw(sh)
    sd.rounded_rectangle((8, 12, card_w + 8, card_h + 12), radius=28, fill=(10, 26, 47, 50))
    sh = sh.filter(ImageFilter.GaussianBlur(8))
    img.alpha_composite(sh, (card_x - 8, card_y - 8))
    d = ImageDraw.Draw(img)
    rr(d, (card_x, card_y, card_x + card_w, card_y + card_h), NAVY, radius=28)

    d.text((card_x + 28, card_y + 22), "WHY C.N.M.T", fill=(255, 180, 184), font=font(14, True))
    bars = [
        ("CLEAR RATES", "Visible as you type"),
        ("VERIFIED PAYOUT", "Proof before we send"),
        ("YOU’RE IN CONTROL", "Cancel unpaid anytime"),
    ]
    by = card_y + 56
    for title, sub in bars:
        rr(d, (card_x + 22, by, card_x + card_w - 22, by + 72), BRAND, radius=12)
        d.text((card_x + 40, by + 14), title, fill=WHITE, font=font(20, True))
        d.text((card_x + 40, by + 42), sub, fill=(255, 220, 222), font=font(16))
        by += 82

    # —— Flag strip on a light plate above the footer ——
    fy = h - 168 - 108
    rr(d, (pad, fy, w - pad - 8, fy + 96), (255, 255, 255, 230) if False else WHITE, radius=18)
    # translucent plate
    plate = Image.new("RGBA", (w - 2 * pad, 96), (255, 255, 255, 230))
    ImageDraw.Draw(plate).rounded_rectangle((0, 0, w - 2 * pad - 1, 95), radius=18, fill=(255, 255, 255, 235))
    img.alpha_composite(plate, (pad, fy))
    d = ImageDraw.Draw(img)
    d.text((pad + 18, fy + 10), "SEND MONEY TO MULTIPLE COUNTRIES", fill=BRAND, font=font(13, True))
    fx, fy2 = pad + 18, fy + 36
    fw, fh = 48, 32
    for code, name in COUNTRIES:
        fl = flag(code, fw, fh)
        img.paste(fl, (fx, fy2))
        fx += fw + 12

    # —— Footer bar (original DNA) ——
    foot = h - 168
    d.rectangle((0, foot, w, h), fill=NAVY)
    d.rectangle((0, foot, w, foot + 8), fill=BRAND)

    d.text((pad, foot + 28), "C.N.M.T  ·  WE’RE ACTIVE", fill=(255, 176, 180), font=font(14, True))
    d.text((pad, foot + 56), PHONE1, fill=WHITE, font=font(28, True))
    d.text((pad, foot + 92), PHONE2 + "   ·   " + SITE, fill=WHITE, font=font(18, True))
    d.text((pad, foot + 128), "WhatsApp quote  ·  Live rates  ·  Proof before payout", fill=(160, 172, 188), font=font(15))

    qr = make_qr(110)
    plate = Image.new("RGB", (126, 126), WHITE)
    ImageDraw.Draw(plate).rounded_rectangle((0, 0, 125, 125), radius=14, fill=WHITE)
    plate.paste(qr, (8, 8))
    img.paste(plate, (w - pad - 126, foot + 22))

    return img.convert("RGB")


def build_tall(w: int = 1240, h: int = 1754) -> Image.Image:
    """Taller print flyer — same system, more breathing room + how-it-works."""
    poster = build(1080, 1350)
    # scale and extend
    canvas = Image.new("RGB", (w, h), WHITE)
    scaled = poster.resize((w, int(1350 * w / 1080)), Image.Resampling.LANCZOS)
    canvas.paste(scaled, (0, 0))
    # if leftover, fill with navy continuation — crop footer from scaled and stretch? 
    # simpler: just scale to full height
    return poster.resize((w, h), Image.Resampling.LANCZOS)


def main():
    poster = build(1080, 1350)
    poster.save(OUT / "flyer-cnmt-campaign.jpg", quality=95, optimize=True)
    poster.save(OUT / "flyer-cnmt-campaign.png")
    # square social
    sq = Image.new("RGB", (1080, 1080), WHITE)
    # center-crop 1350 poster
    poster.resize((1080, 1350), Image.Resampling.LANCZOS)
    # crop middle-top bias
    crop = poster.crop((0, 0, 1080, 1080))
    crop.save(OUT / "flyer-cnmt-campaign-square.jpg", quality=95, optimize=True)
    # print
    build(1080, 1350).resize((2160, 2700), Image.Resampling.LANCZOS).save(
        OUT / "flyer-cnmt-campaign-print.jpg", quality=95, optimize=True
    )
    print("Campaign flyer written")


if __name__ == "__main__":
    main()
